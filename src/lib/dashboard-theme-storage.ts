import { buildDashboardThemeCssVars } from "@/lib/dashboard-theme";

const CACHE_KEY = "stayinn.dashboard.theme";

type CachedDashboardTheme = {
  primary: string;
  accent: string;
};

function readCache(): CachedDashboardTheme | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedDashboardTheme;
    if (!parsed?.primary || !parsed?.accent) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function applyDashboardTheme(primary?: string, accent?: string) {
  if (typeof document === "undefined") return;

  const vars = buildDashboardThemeCssVars(primary, accent);
  for (const [key, value] of Object.entries(vars)) {
    document.documentElement.style.setProperty(key, value);
  }
}

export function saveDashboardThemeCache(primary: string, accent: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CACHE_KEY, JSON.stringify({ primary, accent }));
}

export function clearDashboardThemeCache() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CACHE_KEY);
}

/** Apply last saved dashboard colors immediately (before React paints). */
export function hydrateDashboardThemeFromStorage() {
  const cached = readCache();
  if (cached) {
    applyDashboardTheme(cached.primary, cached.accent);
  }
}

export function syncDashboardThemeFromSettings(
  primary?: string,
  accent?: string
) {
  applyDashboardTheme(primary, accent);
  if (primary && accent) {
    saveDashboardThemeCache(primary, accent);
  }
}
