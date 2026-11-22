import { apiFetch } from "@/api/apiFetch";
import { authFetch } from "@/api/authFetch";
import { filenameFromContentDisposition, triggerBrowserDownload } from "@/lib/download-blob";

/** Figma 13 · Users & staff API (list with stay/phone, detail, team + permissions, account actions). */

export type PersonStay = { kind: "living" | "upcoming" | "left" | "cancelled" | "none" | "staff"; label: string; booking_id?: string };

export type Person = {
  id: string;
  name: string;
  email: string;
  role: string;
  role_label: string;
  email_verified: boolean;
  email_verified_at: string | null;
  avatar: string;
  phone: string | null;
  job_title: string;
  disabled: boolean;
  password_set: boolean;
  last_sign_in_at: string | null;
  last_sign_in_device: string | null;
  invited_at: string | null;
  created_at: string | null;
  stay?: PersonStay;
  bookings_count?: number;
  areas?: string[];
  can_use?: string;
};

export type PeopleGroup = "guests" | "admins" | "unverified" | "disabled";
export type PeopleParams = { page?: number; limit?: number; group?: PeopleGroup; search?: string; sort?: "newest" | "oldest" | "name" };

export type PeopleList = {
  users: Person[];
  pagination: { page: number; limit: number; total: number; pages: number };
  counts: { all: number; guests: number; admins: number; unverified: number };
  stats: { total: number; new_this_month: number; living_now: number; unverified: number; team: number };
};

export type PersonDetail = {
  user: Person;
  bookings: { id: string; booking_code: string | null; room_label: string; seat_label: string | null; status: string; move_in: string | null; check_out: string | null; months: number | null; nights: number | null; stay_unit: "month" | "night"; source: string | null; paid: number; balance: number }[];
  requests: { id: string; booking_id: string; type: string; type_label: string; status: string; summary: string; created_at: string | null }[];
  summary: { total_paid: number; balance: number; currency: string; reviews: number; avg_rating: number | null; messages_sent: number; last_sign_in_at: string | null; last_sign_in_device: string | null; active_sessions: number; two_step: boolean };
  access: { areas: string[]; can_use: string | null };
  activity: { kind: string; title: string; detail: string; at: string | null }[];
};

export type Team = {
  team: Person[];
  roles: { key: string; label: string }[];
  permissions: Record<"front_desk" | "maintenance" | "accountant", string[]>;
  permissions_updated_at: string | null;
  permissions_updated_by: string | null;
  areas: { key: string; label: string }[];
};

function qs(p: PeopleParams) {
  const s = new URLSearchParams();
  if (p.page) s.set("page", String(p.page));
  if (p.limit) s.set("limit", String(p.limit));
  if (p.group) s.set("group", p.group);
  if (p.search?.trim()) s.set("search", p.search.trim());
  if (p.sort) s.set("sort", p.sort);
  const q = s.toString();
  return q ? `?${q}` : "";
}

export const getPeopleApi = (token: string, p: PeopleParams) => apiFetch<{ success: boolean } & PeopleList>(`/api/v1/users${qs(p)}`, { token });
export const getPersonDetailApi = (token: string, id: string) => apiFetch<{ success: boolean } & PersonDetail>(`/api/v1/users/${id}/detail`, { token });
export const getTeamApi = (token: string) => apiFetch<{ success: boolean } & Team>("/api/v1/users/team", { token });

const send = <T,>(token: string, path: string, method: string, body?: unknown) =>
  apiFetch<{ success: boolean; message?: string } & T>(path, { token, method, ...(body !== undefined ? { body: JSON.stringify(body) } : {}) });

export const putPermissionsApi = (token: string, roles: Partial<Team["permissions"]>) => send(token, "/api/v1/users/permissions", "PUT", { roles });
export const inviteUserApi = (token: string, body: { name: string; email: string; role: string; job_title?: string; phone?: string }) =>
  send<{ user: Person; emailed: boolean; invite_link: string | null }>(token, "/api/v1/users/invite", "POST", body);
export const setRoleApi = (token: string, id: string, role: string) => send<PersonDetail>(token, `/api/v1/users/${id}/role`, "PUT", { role });
export const setDisabledApi = (token: string, id: string, disabled: boolean) => send<PersonDetail>(token, `/api/v1/users/${id}/disabled`, "PUT", { disabled });
export const signOutEverywhereApi = (token: string, id: string) => send(token, `/api/v1/users/${id}/sign-out-everywhere`, "POST");
export const resetPasswordApi = (token: string, id: string) => send(token, `/api/v1/users/${id}/reset-password`, "POST");
export const patchPersonProfileApi = (token: string, id: string, body: { name?: string; job_title?: string; phone?: string }) => send<PersonDetail>(token, `/api/v1/users/${id}/profile`, "PATCH", body);

export async function downloadPeopleCsvApi(token: string, p: PeopleParams) {
  const { page: _p, limit: _l, ...rest } = p;
  const res = await authFetch(`/api/v1/users/export.csv${qs(rest)}`, {}, token);
  if (!res.ok) throw new Error(`Export failed (${res.status})`);
  triggerBrowserDownload(await res.blob(), filenameFromContentDisposition(res.headers.get("Content-Disposition"), "users.csv"));
}
