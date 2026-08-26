export type BookingRequestType = "cancel" | "room_change" | "additional_seat";
export type BookingRequestStatus = "pending" | "approved" | "rejected" | "withdrawn";

export type BookingRequest = {
  id: string;
  booking_id: string;
  user_id: string;
  type: BookingRequestType;
  type_label: string;
  status: BookingRequestStatus;
  reason: string;
  payload: {
    requested_room_id?: string;
    requested_room_title?: string;
    additional_seats?: number;
    current_seats?: number;
    target_seats?: number;
  };
  admin_note: string;
  amount_refunded: number | null;
  resolved_at: string | null;
  created_at: string | null;
  booking_ref?: string;
  guest_name?: string;
  guest_email?: string;
  guest_phone?: string;
  booking_status?: string | null;
  seats_booked?: number | null;
  room_title?: string | null;
};

export type BookingRequestListParams = {
  status?: BookingRequestStatus;
  limit?: number;
  page?: number;
};

export type BookingRequestStats = {
  pending: number;
  total: number;
};
