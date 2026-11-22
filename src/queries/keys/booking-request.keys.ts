export const bookingRequestKeys = {
  all: ["booking-requests"] as const,
  detail: (id: string) => [...bookingRequestKeys.all, "detail", id] as const,
  list: (params: Record<string, unknown> = {}) => [...bookingRequestKeys.all, "list", params] as const,
};
