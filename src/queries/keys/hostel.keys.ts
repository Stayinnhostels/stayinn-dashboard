export const hostelKeys = {
  all: ["hostels"] as const,
  lists: () => [...hostelKeys.all, "list"] as const,
  list: () => [...hostelKeys.lists()] as const,
};
