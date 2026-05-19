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
};

export type MaintenanceListParams = {
  status?: MaintenanceStatus;
};

export type MaintenanceDraft = {
  room_id: string | null;
  title: string;
  description: string;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  assignee: string;
};
