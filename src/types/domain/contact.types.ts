export type ContactMessageStatus = "new" | "read" | "archived";

export type ContactMessage = {
  id: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  message: string;
  status: ContactMessageStatus;
  replies?: { id: string; channel: "email" | "whatsapp"; body: string; by_name: string | null; emailed: boolean; at: string | null }[];
  read_at?: string | null;
  created_at: string | null;
};

export type ContactContext = {
  lead: boolean;
  user_id: string | null;
  booking_id: string | null;
  booking_status: string | null;
  suggestion: { title: string; room_id: string; room_label: string; room_title: string; kind: string; free_beds: number; price: number | null; currency: string; matches: number } | null;
};

export type ContactMessageStats = {
  new: number;
  read: number;
  archived: number;
  total: number;
};

export type ContactMessageListParams = {
  status?: ContactMessageStatus;
  limit?: number;
  search?: string;
};
