const KEY_PREFIX = "stayinn.dashboard.tour.seen.";

export function hasSeenOnboardingTour(userId: string) {
  if (typeof window === "undefined") return true;
  try {
    return localStorage.getItem(KEY_PREFIX + userId) === "1";
  } catch {
    return true;
  }
}

export function markOnboardingTourSeen(userId: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY_PREFIX + userId, "1");
  } catch {
    /* ignore */
  }
}
