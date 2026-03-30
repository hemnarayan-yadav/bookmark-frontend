import axios from 'axios';
import { Bookmark, Tag, Folder, CreateBookmarkDTO, UpdateBookmarkDTO, ApiResponse, RegisterDTO, LoginDTO, AuthResponse, User } from '../types';

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

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.warn('Unauthorized response detected:', error.response?.config?.url);
      // ⚠️ Do NOT clear tokens here — let AuthContext handle it gracefully.
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
    // Backend returns string[], convert to Folder[] shape
    const folders = (response.data.data ?? []).map((f) => ({ folder: f, count: 0 }));
    return { success: response.data.success, data: folders };
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