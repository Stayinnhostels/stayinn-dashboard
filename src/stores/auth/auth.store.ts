import { create } from "zustand";
import type { AuthUser } from "@/types/domain/auth.types";

const SESSION_KEY = "stayinn.dashboard.session";
const LEGACY_USER_KEY = "stayinn.auth.user";

interface StoredSession {
  user: AuthUser;
  token: string;
  refreshToken?: string;
}

function parseSession(raw: string | null): StoredSession | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StoredSession;
    if (!parsed?.user || !parsed?.token || typeof parsed.token !== "string") return null;
    if (parsed.token === "mock-token") return null;
    if (parsed.user.role !== "super_admin") return null;
    if (parsed.refreshToken != null && typeof parsed.refreshToken !== "string") return null;
    return parsed;
  } catch {
    return null;
  }
}

function loadSession(): StoredSession | null {
  if (typeof window === "undefined") return null;
  return parseSession(localStorage.getItem(SESSION_KEY)) ?? parseSession(sessionStorage.getItem(SESSION_KEY));
}

function saveSession(session: StoredSession | null, remember: boolean) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(LEGACY_USER_KEY);
  if (session) {
    const raw = JSON.stringify(session);
    if (remember) localStorage.setItem(SESSION_KEY, raw);
    else sessionStorage.setItem(SESSION_KEY, raw);
  }
}

interface AuthStoreState {
  user: AuthUser | null;
  token: string | null;
  refreshToken: string | null;
  loading: boolean;
}

interface AuthStoreActions {
  hydrate: () => void;
  persistSession: (input: {
    user: AuthUser;
    token: string;
    refreshToken?: string | null;
    remember: boolean;
  }) => void;
  updateUser: (partial: Partial<AuthUser>) => void;
  logout: () => void;
}

export type AuthStore = AuthStoreState & AuthStoreActions;

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  refreshToken: null,
  loading: true,

  hydrate() {
    const session = loadSession();
    if (session) {
      set({
        user: session.user,
        token: session.token,
        refreshToken: session.refreshToken ?? null,
        loading: false,
      });
    } else {
      if (typeof window !== "undefined") {
        localStorage.removeItem(LEGACY_USER_KEY);
      }
      set({ user: null, token: null, refreshToken: null, loading: false });
    }
  },

  persistSession({ user, token, refreshToken, remember }) {
    const session: StoredSession = {
      user,
      token,
      ...(refreshToken ? { refreshToken } : {}),
    };
    saveSession(session, remember);
    set({ user, token, refreshToken: refreshToken ?? null, loading: false });
  },

  updateUser(partial) {
    set((state) => {
      if (!state.user || !state.token) return state;
      const user = { ...state.user, ...partial };
      const remember = typeof window !== "undefined" && Boolean(localStorage.getItem(SESSION_KEY));
      saveSession(
        {
          user,
          token: state.token,
          ...(state.refreshToken ? { refreshToken: state.refreshToken } : {}),
        },
        remember,
      );
      return { user };
    });
  },

  logout() {
    saveSession(null, true);
    set({ user: null, token: null, refreshToken: null, loading: false });
  },
}));
