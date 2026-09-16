export interface Admin {
  id: number;
  username: string;
  is_active: boolean;
  roles: string[];
  permissions: string[];
  last_login_at: string | null;
}

export interface AuthResponse {
  admin: Admin;
}

export interface LoginRequest {
  username: string;
  password: string;
}