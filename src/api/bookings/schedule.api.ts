import { apiFetch } from "@/api/apiFetch";

/** Figma 19 · Schedule. */
export type ScheduleBar = { id: string; room_id: string; guest_name: string; seat_label: string | null; start: string; end: string; state: "checked_in" | "reserved" | "leaving_today" | "checked_out" };
export type SchedulePerson = { id: string; guest_name: string; booking_code: string | null; room_label: string; seat_label: string | null; time: string; tag: "reserved" | "id_pending" | "paid" | "balance_due"; balance: number; currency: string };
export type ScheduleWeek = {
  today: string;
  from: string;
  to: string;
  rooms: { id: string; label: string; beds_total: number; status: string; busy: boolean }[];
  bookings: ScheduleBar[];
  arrivals: SchedulePerson[];
  departures: SchedulePerson[];
  kpis: { arrivals_today: number; departures_today: number; beds_in_use: number; beds_total: number; free_tonight: number };
};
export type ScheduleMonth = { month: string; first: string; last: string; grid_from: string; grid_to: string; today: string; days: Record<string, { in: number; out: number }> };

export const getScheduleApi = (token: string, p: { from?: string; days?: number; hostel?: string }) => {
  const s = new URLSearchParams();
  if (p.from) s.set("from", p.from);
  if (p.days) s.set("days", String(p.days));
  if (p.hostel) s.set("hostel", p.hostel);
  return apiFetch<{ success: boolean } & ScheduleWeek>(`/api/v1/bookings/schedule?${s}`, { token });
};
export const getScheduleMonthApi = (token: string, p: { month?: string; hostel?: string }) => {
  const s = new URLSearchParams();
  if (p.month) s.set("month", p.month);
  if (p.hostel) s.set("hostel", p.hostel);
  return apiFetch<{ success: boolean } & ScheduleMonth>(`/api/v1/bookings/schedule/month?${s}`, { token });
};
