import * as React from "react";

/**
 * Local, Supabase-free auth context.
 * Session starts signed-out (`user: null`) until `login` succeeds.
 */

export type UserRole = "super_admin" | "admin" | "user" | "guest";

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  emailVerified: boolean;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  isAdmin: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string, remember?: boolean) => Promise<AuthUser>;
  signup: (input: {
    fullName: string;
    email: string;
    password: string;
    role?: string;
  }) => Promise<AuthUser>;
  logout: () => Promise<void>;
  verifyEmail: (code?: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (password: string) => Promise<void>;
  resendOtp: () => Promise<void>;
}

const DEFAULT_USER: AuthUser = {
  id: "admin-1",
  fullName: "Stay Inn Admin",
  email: "admin@stayinn.local",
  role: "super_admin",
  emailVerified: true,
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null);

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      token: user ? "local-mock-token" : null,
      loading: false,
      isAdmin: user ? user.role === "admin" || user.role === "super_admin" : false,
      async login(email) {
        const next: AuthUser = {
          ...DEFAULT_USER,
          email: email || DEFAULT_USER.email,
          fullName: email ? email.split("@")[0] : DEFAULT_USER.fullName,
        };
        setUser(next);
        return next;
      },
      async signup({ fullName, email }) {
        const next: AuthUser = {
          id: DEFAULT_USER.id,
          email,
          fullName: fullName || email.split("@")[0],
          role: "super_admin",
          emailVerified: true,
        };
        setUser(next);
        return next;
      },
      async logout() {
        setUser(null);
      },
      async verifyEmail() {},
      async requestPasswordReset() {},
      async resetPassword() {},
      async resendOtp() {},
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
