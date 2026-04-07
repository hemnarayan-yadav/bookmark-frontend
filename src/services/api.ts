import axios from 'axios';
import {
  Bookmark, Tag, Folder, CreateBookmarkDTO, UpdateBookmarkDTO,
  ApiResponse, RegisterDTO, LoginDTO, AuthResponse, User,
  Collection, CreateCollectionDTO, UpdateCollectionDTO,
  DashboardStats, PlatformStats, ImportResult,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle token expiration with automatic refresh
let isRefreshing = false;
let failedQueue: { resolve: (token: string) => void; reject: (err: unknown) => void }[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh on 403 (expired token), not on login/register/refresh endpoints
    if (
      error.response?.status === 403 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/register') &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      if (isRefreshing) {
        // Queue this request until the refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            },
            reject: (err: unknown) => reject(err),
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
        const { tokens } = response.data.data;

        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);

        originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
        processQueue(null, tokens.accessToken);

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Refresh failed — clear auth and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);


// Auth API
export const authAPI = {
  register: async (data: RegisterDTO) => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginDTO) => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', data);
    return response.data;
  },

  logout: async () => {
    const response = await api.post<ApiResponse<void>>('/auth/logout');
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get<ApiResponse<User>>('/auth/me');
    return response.data;
  },
};

// User API
export const userAPI = {
  getProfile: async () => {
    const response = await api.get<ApiResponse<User>>('/users/profile');
    return response.data;
  },

  updateProfile: async (data: { full_name?: string; avatar_url?: string }) => {
    const response = await api.put<ApiResponse<User>>('/users/profile', data);
    return response.data;
  },

  changePassword: async (data: { current_password: string; new_password: string }) => {
    const response = await api.put<ApiResponse<void>>('/users/password', data);
    return response.data;
  },

  getPublicProfile: async (username: string) => {
    const response = await api.get<ApiResponse<User>>(`/users/${username}/public`);
    return response.data;
  },
};

// Bookmarks API
export const bookmarkAPI = {
  getAll: async (params?: { folder?: string; tag?: string; search?: string }) => {
    const response = await api.get<ApiResponse<Bookmark[]>>('/bookmarks', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<ApiResponse<Bookmark>>(`/bookmarks/${id}`);
    return response.data;
  },

  create: async (data: CreateBookmarkDTO) => {
    const response = await api.post<ApiResponse<Bookmark>>('/bookmarks', data);
    return response.data;
  },

  update: async (id: string, data: UpdateBookmarkDTO) => {
    const response = await api.put<ApiResponse<Bookmark>>(`/bookmarks/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete<ApiResponse<void>>(`/bookmarks/${id}`);
    return response.data;
  },

  getFolders: async () => {
    const response = await api.get<ApiResponse<string[]>>('/bookmarks/folders');
    const folders = (response.data.data ?? []).map((f) => ({ folder: f, count: 0 }));
    return { success: response.data.success, data: folders };
  },

  // Import/Export
  importBookmarks: async (bookmarks: any[]) => {
    const response = await api.post<ApiResponse<ImportResult>>('/bookmarks/import', { bookmarks });
    return response.data;
  },

  exportBookmarks: async (format: 'json' | 'html' = 'json') => {
    if (format === 'html') {
      const response = await api.get('/bookmarks/export?format=html', { responseType: 'blob' });
      return response.data;
    }
    const response = await api.get<ApiResponse<any[]>>('/bookmarks/export?format=json');
    return response.data;
  },

  // Bulk operations
  bulkDelete: async (ids: string[]) => {
    const response = await api.post<ApiResponse<{ deleted: number }>>('/bookmarks/bulk-delete', { ids });
    return response.data;
  },

  bulkMove: async (ids: string[], folder: string) => {
    const response = await api.put<ApiResponse<{ updated: number }>>('/bookmarks/bulk-move', { ids, folder });
    return response.data;
  },

  bulkTag: async (ids: string[], tags: string[]) => {
    const response = await api.put<ApiResponse<{ updated: number }>>('/bookmarks/bulk-tag', { ids, tags });
    return response.data;
  },
};

// Tags API
export const tagAPI = {
  getAll: async () => {
    const response = await api.get<ApiResponse<Tag[]>>('/tags');
    return response.data;
  },

  create: async (name: string) => {
    const response = await api.post<ApiResponse<Tag>>('/tags', { name });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete<ApiResponse<void>>(`/tags/${id}`);
    return response.data;
  },
};

// Collections API
export const collectionAPI = {
  getAll: async () => {
    const response = await api.get<ApiResponse<Collection[]>>('/collections');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<ApiResponse<Collection>>(`/collections/${id}`);
    return response.data;
  },

  create: async (data: CreateCollectionDTO) => {
    const response = await api.post<ApiResponse<Collection>>('/collections', data);
    return response.data;
  },

  update: async (id: string, data: UpdateCollectionDTO) => {
    const response = await api.put<ApiResponse<Collection>>(`/collections/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete<ApiResponse<void>>(`/collections/${id}`);
    return response.data;
  },

  addBookmark: async (collectionId: string, bookmarkId: string) => {
    const response = await api.post<ApiResponse<void>>(`/collections/${collectionId}/bookmarks`, { bookmark_id: bookmarkId });
    return response.data;
  },

  removeBookmark: async (collectionId: string, bookmarkId: string) => {
    const response = await api.delete<ApiResponse<void>>(`/collections/${collectionId}/bookmarks/${bookmarkId}`);
    return response.data;
  },

  generateShareLink: async (id: string) => {
    const response = await api.post<ApiResponse<{ share_token: string }>>(`/collections/${id}/share`);
    return response.data;
  },

  getShared: async (token: string) => {
    const response = await api.get<ApiResponse<Collection>>(`/collections/shared/${token}`);
    return response.data;
  },

  addCollaborator: async (id: string, username: string, role: 'viewer' | 'editor' = 'viewer') => {
    const response = await api.post<ApiResponse<void>>(`/collections/${id}/collaborators`, { username, role });
    return response.data;
  },

  removeCollaborator: async (id: string, userId: string) => {
    const response = await api.delete<ApiResponse<void>>(`/collections/${id}/collaborators/${userId}`);
    return response.data;
  },
};

// Favorites API
export const favoriteAPI = {
  getAll: async () => {
    const response = await api.get<ApiResponse<Bookmark[]>>('/favorites');
    return response.data;
  },

  getIds: async () => {
    const response = await api.get<ApiResponse<string[]>>('/favorites/ids');
    return response.data;
  },

  toggle: async (bookmarkId: string) => {
    const response = await api.post<ApiResponse<{ favorited: boolean }>>(`/favorites/${bookmarkId}`);
    return response.data;
  },

  check: async (bookmarkId: string) => {
    const response = await api.get<ApiResponse<{ favorited: boolean }>>(`/favorites/check/${bookmarkId}`);
    return response.data;
  },
};

// Stats API
export const statsAPI = {
  getDashboard: async () => {
    const response = await api.get<ApiResponse<DashboardStats>>('/stats/dashboard');
    return response.data;
  },

  getPlatform: async () => {
    const response = await api.get<ApiResponse<PlatformStats>>('/stats/public');
    return response.data;
  },
};

// Public API
export const publicAPI = {
  getBookmarks: async (params?: { tag?: string; search?: string; limit?: number; offset?: number }) => {
    const response = await api.get<ApiResponse<Bookmark[]>>('/public/bookmarks', { params });
    return response.data;
  },

  getUserBookmarks: async (username: string, params?: { limit?: number; offset?: number }) => {
    const response = await api.get<ApiResponse<Bookmark[]>>(`/public/users/${username}/bookmarks`, { params });
    return response.data;
  },

  getPopularTags: async (limit?: number) => {
    const response = await api.get<ApiResponse<Tag[]>>('/public/tags', { params: { limit } });
    return response.data;
  },
};

export default api;