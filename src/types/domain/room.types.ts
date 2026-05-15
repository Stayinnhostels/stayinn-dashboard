export type RoomStatus = "available" | "full" | "maintenance" | "draft";

export const ROOM_CATEGORIES = ["2 Seater", "3 Seater", "4 Seater", "Private"] as const;
export type RoomCategory = (typeof ROOM_CATEGORIES)[number];

export type Room = {
  id: string;
  title: string;
  description: string;
  price_per_night: number;
  status: RoomStatus;
  category: string;
  capacity: number;
  beds_total: number;
  beds_available: number;
  amenities: string[];
  images: string[];
  badge: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type RoomDraft = {
  title: string;
  description: string;
  price_per_night: number;
  status: RoomStatus;
  category: string;
  capacity: number;
  beds_total: number;
  beds_available: number;
  amenities: string[];
  images: string[];
  badge?: string | null;
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
