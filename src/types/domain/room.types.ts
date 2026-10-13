export type RoomStatus = "available" | "full" | "maintenance" | "draft";

export const ROOM_STATUS_OPTIONS: RoomStatus[] = ["available", "full", "maintenance", "draft"];

/** Solid high-contrast chips — readable on room photos and in tables. */
export const roomStatusStyles: Record<RoomStatus, string> = {
  available: "border-transparent bg-emerald-600 text-white shadow-sm",
  full: "border-transparent bg-amber-600 text-white shadow-sm",
  maintenance: "border-transparent bg-rose-600 text-white shadow-sm",
  draft: "border-transparent bg-slate-600 text-white shadow-sm",
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
    room_number: room.room_number ?? null,
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

/** "101 · Twin Deluxe" when a room number is set. */
export function formatRoomLabel(room: Pick<Room, "title" | "room_number">) {
  if (room.room_number != null) {
    return room.title ? `${room.room_number} · ${room.title}` : `Room ${room.room_number}`;
  }
  return room.title;
}

export type Room = {
  id: string;
  hostel_id?: string | null;
  hostel_name?: string | null;
  title: string;
  room_number: number | null;
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
  /** List APIs omit image blobs; use these to know photos exist. */
  image_count?: number;
  has_images?: boolean;
  badge: string | null;
  display_order: number;
  created_at: string | null;
  updated_at: string | null;
};

export type RoomDraft = {
  title: string;
  room_number: number | null;
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
  hostel?: string;
};

export type RoomsPagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};
