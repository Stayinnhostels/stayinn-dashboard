import type { UserRole } from "@/types/domain/auth.types";

export type AdminUser = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  email_verified: boolean;
  created_at: string | null;
  updated_at: string | null;
};

export type UsersListParams = {
  page?: number;
  limit?: number;
  role?: "super_admin" | "user";
  search?: string;
};

export type UsersPagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export type ApiUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  email_verified: boolean;
  created_at: string | null;
  updated_at: string | null;
};

export function mapApiUserToAdminUser(u: ApiUser): AdminUser {
  const name = u.name?.trim();
  return {
    id: u.id,
    full_name: name || u.email.split("@")[0] || u.email,
    email: u.email,
    phone: null,
    role: u.role as UserRole,
    email_verified: u.email_verified,
    created_at: u.created_at,
    updated_at: u.updated_at,
  };
}
