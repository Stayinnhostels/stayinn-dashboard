const expenseKeys = {
  all: ["expenses"],
  profitLoss: (params) => [...expenseKeys.all, "profit-loss", params],
  list: (params) => [...expenseKeys.all, "list", params]
};
const residentKeys = {
  all: ["residents"],
  months: () => [...residentKeys.all, "months"],
  register: (params) => [...residentKeys.all, "register", params],
  detail: (bookingId, month) => [...residentKeys.all, "detail", bookingId, month ?? ""]
};
export {
  expenseKeys as e,
  residentKeys as r
};
