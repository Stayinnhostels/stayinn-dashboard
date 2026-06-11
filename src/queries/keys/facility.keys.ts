export const facilityKeys = {
  all: ["facilities"] as const,
  list: () => [...facilityKeys.all, "list"] as const,
};
