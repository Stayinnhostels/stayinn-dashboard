export type UserRole = "super_admin" | "admin" | "user" | "guest";

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  emailVerified: boolean;
  /** Saved profile photo (data URL or http URL). Empty when not set. */
  avatarUrl?: string;
}
