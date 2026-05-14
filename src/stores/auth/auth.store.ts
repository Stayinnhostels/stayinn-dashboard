import { create } from "zustand";
import type { AuthUser } from "@/types/domain/auth.types";

const SESSION_KEY = "stayinn.dashboard.session";
const LEGACY_USER_KEY = "stayinn.auth.user";

interface StoredSession {
  user: AuthUser;
  token: string;
}

function parseSession(raw: string | null): StoredSession | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StoredSession;
    if (!parsed?.user || !parsed?.token || typeof parsed.token !== "string") return null;
    if (parsed.token === "mock-token") return null;
    if (parsed.user.role !== "super_admin") return null;
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
  loading: boolean;
}

interface AuthStoreActions {
  hydrate: () => void;
  persistSession: (input: { user: AuthUser; token: string; remember: boolean }) => void;
  logout: () => void;
}

export type AuthStore = AuthStoreState & AuthStoreActions;

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  loading: true,

  hydrate() {
    const session = loadSession();
    if (session) {
      set({ user: session.user, token: session.token, loading: false });
    } else {
      if (typeof window !== "undefined") {
        localStorage.removeItem(LEGACY_USER_KEY);
      }
      set({ user: null, token: null, loading: false });
    }
  },

  persistSession({ user, token, remember }) {
    const session: StoredSession = { user, token };
    saveSession(session, remember);
    set({ user, token, loading: false });
  },

  logout() {
    saveSession(null, true);
    set({ user: null, token: null, loading: false });
  },
}));
