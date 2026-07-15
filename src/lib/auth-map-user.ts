import type { AuthUser, UserRole } from "@/types/domain/auth.types";
import type { LoginApiUserDto } from "@/types/api/auth/login.response.types";

export function mapLoginUserDtoToAuthUser(u: LoginApiUserDto): AuthUser {
  const idRaw = u._id ?? u.id;
  const id = idRaw != null ? String(idRaw) : "";
  const email = u.email.trim().toLowerCase();
  const name = u.name?.trim();
  const avatar = typeof u.avatar === "string" ? u.avatar.trim() : "";
  return {
    id,
    email,
    fullName: name && name.length > 0 ? name : (email.split("@")[0] ?? email),
    role: u.role as UserRole,
    emailVerified: !!u.emailVerified,
    avatarUrl: avatar || undefined,
  };
}

export function assertSuperAdminConsoleUser(user: AuthUser): void {
  if (user.role !== "super_admin") {
    throw new Error("Only a super administrator can sign in to this console.");
  }
}
