const KEY_PREFIX = "stayinn.dashboard.tour.seen.";
const GLOBAL_KEY = "stayinn.dashboard.tour.seen";

export function onboardingTourStorageKey(user: { id?: string; email?: string }) {
  return (user.id || user.email || "").trim();
}

export function hasSeenOnboardingTour(userId: string) {
  if (typeof window === "undefined") return true;
  try {
    if (localStorage.getItem(GLOBAL_KEY) === "1") return true;
    if (userId && localStorage.getItem(KEY_PREFIX + userId) === "1") return true;
    return false;
  } catch {
    return true;
  }
}

export function markOnboardingTourSeen(userId: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(GLOBAL_KEY, "1");
    if (userId) localStorage.setItem(KEY_PREFIX + userId, "1");
  } catch {
    /* ignore */
  }
}
