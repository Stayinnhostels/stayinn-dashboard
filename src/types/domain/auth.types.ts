export type UserRole = "super_admin" | "front_desk" | "maintenance" | "accountant" | "admin" | "user" | "guest";

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  emailVerified: boolean;
  /** Saved profile photo (data URL or http URL). Empty when not set. */
  avatarUrl?: string;
  /** Shown under the name in the sidebar, e.g. "Hostel manager". */
  jobTitle?: string;
  /** Dashboard areas a staff role may use (Figma 13.03). Super admin: all. */
  permissions?: string[];
}
