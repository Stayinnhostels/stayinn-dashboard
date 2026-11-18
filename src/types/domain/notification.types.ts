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

/** What happened — set by the API on new rows, null on older ones. */
export type NotificationEvent =
  | "booking.created"
  | "booking.checked_out"
  | "request.created"
  | "payment.received"
  | "deposit.returned"
  | "maintenance.created"
  | "rent.reminders_sent"
  | "review.created"
  | "contact.created";

/** Filter tabs on the Notifications page (Figma 16.01). */
export type NotificationCategory = "all" | "unread" | "payments" | "bookings" | "alerts";

export type NotificationCounts = Record<NotificationCategory, number>;

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  link: string | null;
  read: boolean;
  entity_type: string | null;
  entity_id: string | null;
  event?: NotificationEvent | string | null;
  severity?: "info" | "urgent";
  meta: NotificationMeta;
  created_at: string | null;
};

export type NotificationListParams = {
  limit?: number;
  unread_only?: boolean;
  category?: NotificationCategory;
};
