import { apiFetch } from "@/api/apiFetch";

/** Sidebar badge counts — GET /api/v1/admin/nav-counts. */
export type NavCounts = {
  bookings: number;
  residents: number;
  booking_requests: number;
  maintenance: number;
  messages: number;
  reviews: number;
  notifications: number;
};

export async function getNavCountsApi(token: string, hostel?: string): Promise<NavCounts> {
  const q = hostel ? `?hostel=${encodeURIComponent(hostel)}` : "";
  const data = await apiFetch<{ success: boolean; counts: NavCounts }>(
    `/api/v1/admin/nav-counts${q}`,
    { token },
  );
  if (!data.success || !data.counts) throw new Error("Invalid nav counts response");
  return data.counts;
}
