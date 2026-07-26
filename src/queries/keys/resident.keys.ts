import type {
  ResidentDirectoryParams,
  ResidentRegisterParams,
  ResidentsByRoomParams,
} from "@/types/domain/resident.types";

export const residentKeys = {
  all: ["residents"] as const,
  months: () => [...residentKeys.all, "months"] as const,
  register: (params: ResidentRegisterParams) => [...residentKeys.all, "register", params] as const,
  directory: (params: ResidentDirectoryParams) => [...residentKeys.all, "directory", params] as const,
  byRoom: (params: ResidentsByRoomParams) => [...residentKeys.all, "by-room", params] as const,
  detail: (bookingId: string, month?: string) =>
    [...residentKeys.all, "detail", bookingId, month ?? ""] as const,
};
