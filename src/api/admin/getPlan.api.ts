import { apiFetch } from "@/api/apiFetch";

/** Sidebar plan card — GET /api/v1/admin/plan. */
export type PlanUsage = {
  plan_name: string;
  /** null = the plan has no room limit. */
  room_limit: number | null;
  rooms_used: number;
  percent: number | null;
};

export async function getPlanApi(token: string, hostel?: string): Promise<PlanUsage> {
  const q = hostel ? `?hostel=${encodeURIComponent(hostel)}` : "";
  const data = await apiFetch<{ success: boolean; plan: PlanUsage }>(`/api/v1/admin/plan${q}`, { token });
  if (!data.success || !data.plan) throw new Error("Invalid plan response");
  return data.plan;
}
