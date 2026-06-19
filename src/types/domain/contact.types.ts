export type ContactMessageStatus = "new" | "read" | "archived";

export type ContactMessage = {
  id: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  message: string;
  status: ContactMessageStatus;
  created_at: string | null;
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
};
