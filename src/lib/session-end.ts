/**
 * Remembers *why* the last session ended so the sign-in page can show the
 * matching screen (Figma 17.17 "Session expired" / 17.18 "Signed out"),
 * and the last signed-in email so an expired session can be resumed quickly.
 */
export type SessionEndReason = "expired" | "signed-out";

const REASON_KEY = "stayinn.auth.ended";
const LAST_EMAIL_KEY = "stayinn.auth.lastEmail";

export function markSessionEnded(reason: SessionEndReason) {
  try {
    sessionStorage.setItem(REASON_KEY, reason);
  } catch {
    /* ignore */
  }
}

export function readSessionEnded(): SessionEndReason | null {
  try {
    const v = sessionStorage.getItem(REASON_KEY);
    return v === "expired" || v === "signed-out" ? v : null;
  } catch {
    return null;
  }
}

export function clearSessionEnded() {
  try {
    sessionStorage.removeItem(REASON_KEY);
  } catch {
    /* ignore */
  }
}

export function rememberLastEmail(email: string) {
  try {
    localStorage.setItem(LAST_EMAIL_KEY, email);
  } catch {
    /* ignore */
  }
}

export function readLastEmail(): string | null {
  try {
    return localStorage.getItem(LAST_EMAIL_KEY);
  } catch {
    return null;
  }
}
