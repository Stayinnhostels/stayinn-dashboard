export type RoomStatus = "available" | "full" | "maintenance" | "draft";

export const ROOM_STATUS_OPTIONS: RoomStatus[] = ["available", "full", "maintenance", "draft"];

export const roomStatusStyles: Record<RoomStatus, string> = {
  available: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  full: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  maintenance: "bg-rose-500/15 text-rose-600 border-rose-500/30",
  draft: "bg-muted text-muted-foreground border-border",
};

export function formatRoomStatus(status: RoomStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export const ROOM_CATEGORIES = ["2 Seater", "3 Seater", "4 Seater", "Private"] as const;
export type RoomCategory = (typeof ROOM_CATEGORIES)[number];

/** Amenities shown as checkboxes on the room detail page */
export const ROOM_AMENITY_OPTIONS = [
  "Attached Bathroom",
  "Common Bathroom",
  "AC",
  "WiFi",
  "Study Table",
  "Desk",
  "Wardrobe",
  "Laundry",
  "Power Backup",
  "Lockers",
  "Common Lounge",
  "Mini Fridge",
  "Kitchenette",
  "TV",
  "Balcony",
] as const;

export function roomToDraft(room: Room): RoomDraft {
  return {
    title: room.title,
    description: room.description ?? "",
    price_per_night: room.price_per_night_usd ?? room.price_per_night,
    price_per_night_usd: room.price_per_night_usd ?? room.price_per_night,
    price_per_night_pkr: room.price_per_night_pkr ?? room.price_per_night,
    status: room.status,
    category: room.category,
    capacity: room.capacity,
    beds_total: room.beds_total,
    beds_available: room.beds_available,
    amenities: room.amenities ?? [],
    images: room.images ?? [],
    badge: room.badge ?? null,
    display_order: room.display_order ?? 100,
  };
}

export type Room = {
  id: string;
  title: string;
  description: string;
  price_per_night: number;
  price_per_night_usd: number;
  price_per_night_pkr: number;
  status: RoomStatus;
  category: string;
  capacity: number;
  beds_total: number;
  beds_available: number;
  amenities: string[];
  images: string[];
  badge: string | null;
  display_order: number;
  created_at: string | null;
  updated_at: string | null;
};

export type RoomDraft = {
  title: string;
  description: string;
  price_per_night: number;
  price_per_night_usd: number;
  price_per_night_pkr: number;
  status: RoomStatus;
  category: string;
  capacity: number;
  beds_total: number;
  beds_available: number;
  amenities: string[];
  images: string[];
  badge?: string | null;
  display_order: number;
};

export type RoomsListParams = {
  page?: number;
  limit?: number;
  status?: RoomStatus;
  search?: string;
};

export type RoomsPagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};
