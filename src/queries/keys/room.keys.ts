import type { RoomsListParams } from "@/types/domain/room.types";

export const roomKeys = {
  all: ["rooms"] as const,
  lists: () => [...roomKeys.all, "list"] as const,
  list: (params: RoomsListParams) => [...roomKeys.lists(), params] as const,
  details: () => [...roomKeys.all, "detail"] as const,
  detail: (id: string) => [...roomKeys.details(), id] as const,
  beds: (id: string) => [...roomKeys.all, "beds", id] as const,
  availability: (hostel?: string, search?: string) =>
    [...roomKeys.all, "availability", hostel ?? "all", search ?? ""] as const,
};
