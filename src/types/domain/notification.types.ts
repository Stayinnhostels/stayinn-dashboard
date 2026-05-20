export type NotificationType =
  | "booking"
  | "review"
  | "contact"
  | "payment"
  | "maintenance"
  | "system";

export type NotificationMeta = {
  guest_name?: string | null;
  guest_email?: string | null;
  guest_phone?: string | null;
  room_title?: string | null;
  source?: string | null;
  seats_booked?: number | null;
  total_amount?: number | null;
  booking_ref?: string | null;
  rating?: number | null;
  comment_preview?: string | null;
  message_preview?: string | null;
};

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  link: string | null;
  read: boolean;
  entity_type: string | null;
  entity_id: string | null;
  meta: NotificationMeta;
  created_at: string | null;
};

export type NotificationListParams = {
  limit?: number;
  unread_only?: boolean;
};
