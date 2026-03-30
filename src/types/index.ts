// User Types
export interface User {
  id: string;
  username: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  createdAt: string;
  last_login?: string;
  total_bookmarks?: number;
  public_bookmarks?: number;
}

export interface RegisterDTO {
  username: string;
  email: string;
  password: string;
  full_name?: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

// Bookmark Types
export interface Bookmark {
  id: string;
  user_id: string;
  title: string;
  url: string;
  description: string | null;
  favicon: string | null;
  folder: string;
  is_public: boolean;
  createdAt: string;
  updatedAt: string;
  tags: Tag[];
  user?: User;
}

export interface Tag {
  id: string;
  user_id: string;
  name: string;
  createdAt: string;
  usage_count?: number;
}

export interface Folder {
  folder: string;
  count: number;
}

export interface CreateBookmarkDTO {
  url?: string;
  title?: string;
  description?: string;
  favicon?: string;
  folder?: string;
  is_public?: boolean;
  tags?: string[];
}

export interface UpdateBookmarkDTO {
   url?: string;
  title?: string;
  description?: string;
  folder?: string;
  is_public?: boolean;
  tags?: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}