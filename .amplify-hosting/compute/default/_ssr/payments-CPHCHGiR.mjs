function normalizeMoneyCurrency(currency) {
  const c = String(currency ?? "pkr").trim().toLowerCase();
  if (c === "usd" || c === "$") return "usd";
  return "pkr";
}
function formatMoney(amount, currency = "pkr") {
  const n = Number(amount);
  const safe = Number.isFinite(n) ? n : 0;
  if (normalizeMoneyCurrency(currency) === "usd") {
    return `$${safe.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  }
  return `Rs ${safe.toLocaleString("en-PK", { maximumFractionDigits: 0 })}`;
}
function paymentMethodLabel(method, source) {
  if (method === "walk_in" || source === "walk_in") return "Walk-in / cash";
  if (source === "website") return "Offline (website booking)";
  return "Offline";
}
function currencyFromChartSeries(seriesName) {
  const key = String(seriesName ?? "").toLowerCase();
  if (key === "usd" || key === "revenue_usd") return "usd";
  return "pkr";
}
function chartTooltipMoney(value, seriesName) {
  const n = Array.isArray(value) ? Number(value[0]) : Number(value);
  const cur = currencyFromChartSeries(seriesName);
  return [formatMoney(Number.isFinite(n) ? n : 0, cur), cur === "usd" ? "USD" : "PKR"];
}
function paymentStatusLabel(status) {
  switch (status) {
    case "partial_refund":
      return "Partial refund";
    case "succeeded":
      return "Succeeded";
    case "refunded":
      return "Refunded";
    case "pending":
      return "Pending";
    case "cancelled":
      return "Cancelled";
    case "failed":
      return "Failed";
    default:
      return status;
  }
}
export {
  paymentMethodLabel as a,
  chartTooltipMoney as c,
  formatMoney as f,
  normalizeMoneyCurrency as n,
  paymentStatusLabel as p
};
