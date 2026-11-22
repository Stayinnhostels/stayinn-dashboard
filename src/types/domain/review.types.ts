export type ReviewStatus = "pending" | "approved" | "rejected";

export type Review = {
  id: string;
  user_id: string | null;
  room_id: string | null;
  booking_id: string | null;
  guest_name: string;
  guest_email: string;
  rating: number;
  comment: string;
  status: ReviewStatus;
  featured: boolean;
  public_reply?: string;
  public_reply_by?: string | null;
  public_reply_at?: string | null;
  spam?: boolean;
  moderated_by_name?: string | null;
  moderated_at?: string | null;
  /** "Room 1 · Bed 2 · living here" / "No booking found" (Figma 14.02). */
  stay_label?: string;
  has_booking?: boolean;
  spam_hint?: string | null;
  room_title: string | null;
  user_name: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type ReviewStats = {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
  featured: number;
  average_rating: number;
  approved_count: number;
  distribution?: Record<"1" | "2" | "3" | "4" | "5", number>;
  oldest_pending_at?: string | null;
  featured_max?: number;
};

export type ReviewListParams = {
  status?: ReviewStatus;
};

export type ReviewUpdateInput = {
  status?: ReviewStatus;
  featured?: boolean;
  comment?: string;
  public_reply?: string;
  spam?: boolean;
};
