export const bookingRequestKeys = {
  all: ["booking-requests"] as const,
  list: (params: Record<string, unknown> = {}) => [...bookingRequestKeys.all, "list", params] as const,
};
