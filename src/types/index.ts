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

// Collection Types
export interface Collection {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  color: string;
  icon: string;
  is_public: boolean;
  share_token: string | null;
  bookmark_count: number;
  bookmarks: CollectionBookmark[];
  collaborators: CollectionCollaborator[];
  view_count: number;
  owner?: { id: string; username: string; full_name: string | null; avatar_url: string | null };
  createdAt: string;
  updatedAt: string;
}

export interface CollectionBookmark {
  id: string;
  title: string;
  url: string;
  favicon: string | null;
  description: string | null;
  is_public?: boolean;
  folder?: string;
  tags?: { id: string; name: string }[];
  createdAt?: string;
}

export interface CollectionCollaborator {
  user_id: string;
  username: string;
  avatar_url: string | null;
  role: "viewer" | "editor";
  added_at: string;
}

export interface CreateCollectionDTO {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  is_public?: boolean;
}

export interface UpdateCollectionDTO {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  is_public?: boolean;
}

// Dashboard Stats
export interface DashboardStats {
  overview: {
    total_bookmarks: number;
    public_bookmarks: number;
    private_bookmarks: number;
    total_collections: number;
    total_tags: number;
    total_favorites: number;
  };
  folders: { name: string; count: number }[];
  top_tags: { id: string; name: string; count: number }[];
  top_domains: { domain: string; count: number }[];
  bookmarks_by_month: { year: number; month: number; count: number }[];
  recent_activity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: string;
  metadata: Record<string, any>;
  createdAt: string;
}

export interface PlatformStats {
  total_users: number;
  total_public_bookmarks: number;
  total_public_collections: number;
  top_contributors: { username: string; avatar_url: string | null; bookmark_count: number }[];
}

export interface ImportResult {
  imported: number;
  skipped: number;
  errors: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  total?: number;
}