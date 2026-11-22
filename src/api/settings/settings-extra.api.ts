import { apiFetch } from "@/api/apiFetch";
import type { PropertySettings } from "@/types/domain/property-settings.types";

/** Figma 21 · Settings extras: reminder status/run, reset a section, password, signed-in devices. */
export type ReminderStatus = {
  enabled: boolean;
  reminder_days: number[];
  today: number;
  today_is_reminder_day: boolean;
  month: string;
  time_zone: string;
  next_run: { month: string; day: number; time: string };
  unpaid_residents: number;
  unpaid_without_email: number;
};
export type ReminderRun = {
  skipped: boolean;
  reason?: "disabled" | "not_reminder_day";
  monthKey: string;
  day: number;
  considered: number;
  sent: number;
  failed: number;
  skippedAlreadySent: number;
  skippedNoEmail: number;
};
export type SessionRow = { id: string; device: string; ip: string | null; last_used_at: string; signed_in_at: string | null; current: boolean };
export type SettingsSection = "hostel" | "brand" | "contact" | "reminders" | "extras" | "booking" | "colours";

export const getReminderStatusApi = async (token: string) => (await apiFetch<{ success: boolean; status: ReminderStatus }>("/api/v1/settings/rent-reminders/status", { token })).status;
export const runRemindersApi = async (token: string) =>
  (await apiFetch<{ success: boolean; result: ReminderRun }>("/api/v1/settings/rent-reminders/run?force=0", { token, method: "POST" })).result;
export const resetSettingsSectionApi = async (token: string, section: SettingsSection) =>
  (await apiFetch<{ success: boolean; settings: PropertySettings }>("/api/v1/settings/reset", { token, method: "POST", body: JSON.stringify({ section }) })).settings;
export const changePasswordApi = (token: string, body: { currentPassword: string; newPassword: string; refreshToken?: string }) =>
  apiFetch<{ success: boolean; message?: string }>("/api/auth/change-password", { token, method: "POST", body: JSON.stringify(body) });
export const listSessionsApi = async (token: string, refreshToken?: string | null) =>
  (await apiFetch<{ success: boolean; sessions: SessionRow[] }>("/api/auth/sessions", { token, method: "POST", body: JSON.stringify(refreshToken ? { refreshToken } : {}) })).sessions;
export const revokeSessionApi = (token: string, id: string) => apiFetch<{ success: boolean }>(`/api/auth/sessions/${id}`, { token, method: "DELETE" });
export const revokeOtherSessionsApi = (token: string, refreshToken?: string | null) =>
  apiFetch<{ success: boolean; revoked: number }>("/api/auth/sessions/revoke-others", { token, method: "POST", body: JSON.stringify(refreshToken ? { refreshToken } : {}) });
