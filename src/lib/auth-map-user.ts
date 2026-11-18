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
    jobTitle: typeof u.jobTitle === "string" && u.jobTitle.trim() ? u.jobTitle.trim() : undefined,
  };
}

/** Thrown when valid credentials belong to an account that may not use the admin console. */
export class NotConsoleUserError extends Error {
  constructor() {
    super("Only a super administrator can sign in to this console.");
    this.name = "NotConsoleUserError";
  }
}

export function assertSuperAdminConsoleUser(user: AuthUser): void {
  if (user.role !== "super_admin") {
    throw new NotConsoleUserError();
  }
}
