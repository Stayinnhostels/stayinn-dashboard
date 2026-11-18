import { apiFetch } from "@/api/apiFetch";
import type {
  Room,
  RoomStatusCounts,
  RoomsListParams,
  RoomsPagination,
} from "@/types/domain/room.types";

type GetRoomsResponse = {
  success: boolean;
  rooms: Room[];
  /** Per-status totals for the filter tabs (ignores the status filter). */
  status_counts?: RoomStatusCounts;
  pagination: RoomsPagination;
};

export async function getRoomsApi(params: RoomsListParams = {}): Promise<GetRoomsResponse> {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.limit) search.set("limit", String(params.limit));
  if (params.status) search.set("status", params.status);
  if (params.search?.trim()) search.set("search", params.search.trim());
  if (params.hostel) search.set("hostel", params.hostel);

  const q = search.toString();
  const data = await apiFetch<GetRoomsResponse>(`/api/v1/rooms${q ? `?${q}` : ""}`);
  if (!data.success || !Array.isArray(data.rooms)) {
    throw new Error("Invalid rooms list response");
  }
  return data;
}
