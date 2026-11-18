export interface Admin {
  id: number;
  username: string;
  is_active: boolean;
  is_superadmin: boolean;
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

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface ChangePasswordResponse {
  ok: true;
  sessions_revoked: number;
}
