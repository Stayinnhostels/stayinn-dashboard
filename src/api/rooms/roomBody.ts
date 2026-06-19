import type { RoomDraft } from "@/types/domain/room.types";

/** Map form draft to API body fields (USD + PKR required by backend). */
export function roomPricesToApi(draft: Pick<RoomDraft, "price_per_night" | "price_per_night_usd" | "price_per_night_pkr">) {
  const usd = Number(draft.price_per_night_usd ?? draft.price_per_night);
  const pkr = Number(draft.price_per_night_pkr ?? draft.price_per_night);
  return {
    price_per_night_usd: usd,
    price_per_night_pkr: pkr,
    price_per_night: Number.isFinite(usd) ? usd : 0,
  };
}

export function roomDraftToApiBody(draft: RoomDraft): Record<string, unknown> {
  const prices = roomPricesToApi(draft);
  const body: Record<string, unknown> = {
    title: draft.title.trim(),
    description: draft.description.trim(),
    ...prices,
    status: draft.status,
    category: draft.category.trim(),
    capacity: draft.capacity,
    beds_total: draft.beds_total,
    beds_available: draft.beds_available,
    amenities: draft.amenities,
    images: draft.images,
    display_order: draft.display_order,
  };
  if (draft.badge?.trim()) body.badge = draft.badge.trim();
  return body;
}

const PATCH_KEYS = [
  "title",
  "description",
  "price_per_night",
  "price_per_night_usd",
  "price_per_night_pkr",
  "status",
  "category",
  "capacity",
  "beds_total",
  "beds_available",
  "amenities",
  "images",
  "badge",
  "display_order",
] as const;

export function roomDraftToPatchPayload(draft: RoomDraft | Partial<RoomDraft>): Record<string, unknown> {
  if ("title" in draft && draft.title !== undefined && typeof draft.title === "string") {
    return roomDraftToApiBody(draft as RoomDraft);
  }

  const partial: Record<string, unknown> = {};
  for (const key of PATCH_KEYS) {
    if (!Object.prototype.hasOwnProperty.call(draft, key)) continue;
    const value = draft[key as keyof typeof draft];
    if (key === "badge" && (value === null || value === "")) {
      partial.badge = null;
    } else if (value !== undefined) {
      partial[key] = value;
    }
  }

  if (
    Object.prototype.hasOwnProperty.call(draft, "price_per_night_usd") ||
    Object.prototype.hasOwnProperty.call(draft, "price_per_night_pkr") ||
    Object.prototype.hasOwnProperty.call(draft, "price_per_night")
  ) {
    Object.assign(partial, roomPricesToApi(draft as RoomDraft));
  }

  return partial;
}
