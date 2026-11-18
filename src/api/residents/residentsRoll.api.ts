import { apiFetch } from "@/api/apiFetch";
import type { MovedOutParams, MovedOutResponse, RollParams, RollResponse, RoomsBoardResponse, SendRemindersInput } from "@/types/domain/resident-roll.types";

function qs(params: Record<string, unknown>) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v != null && v !== "") q.set(k, String(v));
  const s = q.toString();
  return s ? `?${s}` : "";
}

export async function getResidentsRollApi(token: string, params: RollParams) {
  return apiFetch<RollResponse & { success: boolean }>(`/api/v1/residents/roll${qs(params)}`, { token });
}

export async function getMovedOutApi(token: string, params: MovedOutParams) {
  return apiFetch<MovedOutResponse & { success: boolean }>(`/api/v1/residents/moved-out${qs(params)}`, { token });
}

export async function postResidentRemindersApi(token: string, input: SendRemindersInput) {
  return apiFetch<{ success: boolean; month: string; sent: number; failed: number; skipped_no_email: number }>(`/api/v1/residents/reminders`, {
    token,
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getRoomsBoardApi(token: string, params: { month?: string; hostel?: string }) {
  return apiFetch<RoomsBoardResponse & { success: boolean }>(`/api/v1/residents/rooms-board${qs(params)}`, { token });
}

export async function postEmailResidentInvoiceApi(token: string, bookingId: string, input: { months: string[]; note?: string }) {
  return apiFetch<{ success: boolean; to: string; months: string[]; total: number }>(`/api/v1/residents/${bookingId}/email-invoice`, {
    token,
    method: "POST",
    body: JSON.stringify(input),
  });
}
