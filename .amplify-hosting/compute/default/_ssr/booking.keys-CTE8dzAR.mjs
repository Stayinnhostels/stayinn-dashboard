const bookingKeys = {
  all: ["bookings"],
  lists: () => [...bookingKeys.all, "list"],
  list: (params) => [...bookingKeys.lists(), params],
  details: () => [...bookingKeys.all, "detail"],
  detail: (id) => [...bookingKeys.details(), id],
  dailyStats: (days) => [...bookingKeys.all, "daily-stats", days],
  overview: (days, weeks, months) => [...bookingKeys.all, "overview", days, weeks, months],
  revenue: () => [...bookingKeys.all, "revenue"]
};
export {
  bookingKeys as b
};
