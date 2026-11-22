export type MaintenanceStatus = "open" | "in_progress" | "resolved" | "cancelled";
export type MaintenancePriority = "low" | "medium" | "high" | "urgent";

export type MaintenanceTicketSource = "ticket" | "room_status";

export type MaintenanceTicket = {
  id: string;
  room_id: string | null;
  room_title: string | null;
  title: string;
  description: string;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  assignee: string;
  source?: MaintenanceTicketSource;
  /* Figma 11 · Maintenance */
  room_number?: number | null;
  room_label?: string | null;
  room_status?: string | null;
  category?: MaintenanceCategory;
  location_detail?: string;
  reported_by?: string;
  reports_count?: number;
  status_note?: string;
  assignee_phone?: string;
  assignee_user?: string | null;
  expected_cost?: number | null;
  actual_cost?: number | null;
  currency?: "pkr" | "usd";
  room_offline?: boolean;
  room_offline_since?: string | null;
  started_at?: string | null;
  resolved_at?: string | null;
  photos_count?: number;
  created_by_name?: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type MaintenanceStats = {
  open: number;
  in_progress: number;
  resolved: number;
  urgent: number;
  rooms_in_maintenance: number;
  total: number;
  unassigned?: number;
  oldest_started_at?: string | null;
  offline_rooms?: { id: string; label: string; monthly_value: { amount: number; currency: string } }[];
  offline_rent_lost?: { pkr: number; usd: number };
  fixed_this_month?: number;
  spent_this_month?: { pkr: number; usd: number };
  avg_fix_days?: number | null;
  priority_counts?: Record<"all" | "urgent" | "high" | "medium" | "low" | "mine", number>;
  assignees?: string[];
};

export type MaintenanceCategory = "electric" | "plumbing" | "internet" | "furniture" | "other";

export type MaintenanceListParams = {
  status?: MaintenanceStatus;
  hostel?: string;
  priority?: MaintenancePriority;
  room_id?: string;
  assignee?: string;
  search?: string;
  mine?: boolean;
};

export type MaintenanceDraft = {
  room_id: string | null;
  title: string;
  description: string;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  assignee: string;
  category?: MaintenanceCategory;
  location_detail?: string;
  reported_by?: string;
  reports_count?: number;
  status_note?: string;
  assignee_phone?: string;
  expected_cost?: number | null;
  actual_cost?: number | null;
  currency?: "pkr" | "usd";
  room_offline?: boolean;
  photos?: string[];
  remove_photos?: number[];
};
