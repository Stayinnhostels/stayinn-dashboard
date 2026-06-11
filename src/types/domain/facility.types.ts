export type Facility = {
  id: string;
  title: string;
  description: string;
  icon: string;
  sort_order: number;
  is_visible: boolean;
  created_at: string | null;
  updated_at: string | null;
};

export type FacilityInput = {
  title: string;
  description: string;
  icon: string;
  sort_order?: number;
  is_visible?: boolean;
};

export type FacilityUpdateInput = Partial<FacilityInput>;
