import { apiFetch } from "@/api/apiFetch";

export type RentReminderRunResult = {
  skipped: boolean;
  reason?: string;
  monthKey: string;
  day: number;
  timeZone: string;
  reminderDays: number[];
  considered: number;
  sent: number;
  failed: number;
  skippedAlreadySent: number;
  skippedNoEmail: number;
};

type RunRentRemindersResponse = {
  success: boolean;
  result: RentReminderRunResult;
};

export async function postRunRentReminders(
  token: string,
  options?: { day?: number },
): Promise<RentReminderRunResult> {
  const qs =
    options?.day != null && Number.isFinite(options.day) ? `?day=${options.day}` : "";
  const data = await apiFetch<RunRentRemindersResponse>(`/api/v1/settings/rent-reminders/run${qs}`, {
    method: "POST",
    token,
  });
  return data.result;
}
