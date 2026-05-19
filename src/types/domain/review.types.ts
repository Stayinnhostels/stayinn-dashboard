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
};

export type ReviewListParams = {
  status?: ReviewStatus;
};

export type ReviewUpdateInput = {
  status?: ReviewStatus;
  featured?: boolean;
  comment?: string;
};
