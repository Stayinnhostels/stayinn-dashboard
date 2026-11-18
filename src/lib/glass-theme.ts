import { useSyncExternalStore } from "react";

/**
 * Theme for screens built on the Glass design system.
 * Light by default. The user can pick Light / Dark / System (Figma "Theme switcher");
 * the choice is saved in `localStorage["stayinn.theme"]` ("dark" | "system", absent = light).
 * The OS setting is only followed when the user picks System.
 */
export type GlassThemeMode = "light" | "dark" | "system";

const THEME_KEY = "stayinn.theme";
const CHANGE_EVENT = "stayinn-theme-change";
const DARK_QUERY = "(prefers-color-scheme: dark)";

function readMode(): GlassThemeMode {
  if (typeof window === "undefined") return "light";
  try {
    const v = localStorage.getItem(THEME_KEY);
    return v === "dark" || v === "system" ? v : "light";
  } catch {
    return "light";
  }
}

function systemDark() {
  return typeof window !== "undefined" && window.matchMedia?.(DARK_QUERY).matches === true;
}

function readDark(): boolean {
  const mode = readMode();
  return mode === "dark" || (mode === "system" && systemDark());
}

function subscribe(onChange: () => void) {
  const mq = window.matchMedia?.(DARK_QUERY);
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  mq?.addEventListener?.("change", onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
    mq?.removeEventListener?.("change", onChange);
  };
}

/** Whether Glass screens should render dark right now. */
export function useGlassDark(): boolean {
  return useSyncExternalStore(subscribe, readDark, () => false);
}

/** The saved choice (light / dark / system). */
export function useGlassThemeMode(): GlassThemeMode {
  return useSyncExternalStore(subscribe, readMode, () => "light");
}

export function setGlassThemeMode(mode: GlassThemeMode) {
  try {
    if (mode === "light") localStorage.removeItem(THEME_KEY);
    else localStorage.setItem(THEME_KEY, mode);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function setGlassDark(dark: boolean) {
  setGlassThemeMode(dark ? "dark" : "light");
}
