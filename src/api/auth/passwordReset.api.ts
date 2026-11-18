import { apiFetch } from "@/api/apiFetch";

type MessageResponse = { success: boolean; message?: string };

/** POST /api/auth/forgot-password — always succeeds for a well-formed email (no account enumeration). */
export function postForgotPasswordApi(email: string) {
  return apiFetch<MessageResponse>("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email: email.trim().toLowerCase() }),
    skipAuthRefresh: true,
  });
}

/** POST /api/auth/reset-password — token comes from the emailed reset link (valid 30 minutes). */
export function postResetPasswordApi(input: { token: string; password: string }) {
  return apiFetch<MessageResponse>("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(input),
    skipAuthRefresh: true,
  });
}

/** POST /api/auth/set-password — token comes from an invite / account-setup link. */
export function postSetPasswordApi(input: { token: string; password: string }) {
  return apiFetch<MessageResponse>("/api/auth/set-password", {
    method: "POST",
    body: JSON.stringify(input),
    skipAuthRefresh: true,
  });
}
