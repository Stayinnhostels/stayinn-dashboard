import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { B as Button } from "./button-DWfIo_Ug.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-B91GfZkm.mjs";
import { b as useQuery } from "../_libs/tanstack__react-query.mjs";
import { b as getResidentMonthsApi } from "./index-KZ9vj88m.mjs";
import { r as residentKeys } from "./resident.keys-DK2A-v-L.mjs";
import { u as useAuthStore } from "./router-CXpZMrmV.mjs";
import { Y as ChevronLeft, O as ChevronRight } from "../_libs/lucide-react.mjs";
function triggerBrowserDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1e3);
}
function filenameFromContentDisposition(header, fallback) {
  if (!header) return fallback;
  const match = /filename="([^"]+)"/i.exec(header) ?? /filename=([^;]+)/i.exec(header);
  const name = match?.[1]?.trim();
  return name ? name.replace(/^["']|["']$/g, "") : fallback;
}
function useResidentMonthsQuery() {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: residentKeys.months(),
    queryFn: () => {
      if (!token) throw new Error("You must be signed in");
      return getResidentMonthsApi(token);
    },
    enabled: Boolean(token),
    staleTime: 6e4
  });
}
const MONTH_FILTER_START = "2026-05";
const START = { year: 2026, month: 5 };
function monthKey(year, month) {
  return `${year}-${String(month).padStart(2, "0")}`;
}
function parseMonthKey(key) {
  const [year, month] = key.split("-").map(Number);
  return { year, month };
}
function monthLabelFromKey(key) {
  const { year, month } = parseMonthKey(key);
  return new Date(year, month - 1, 1).toLocaleString("en", { month: "long", year: "numeric" });
}
function defaultMonthFilterEndYear(extraEndYear) {
  const floor = (/* @__PURE__ */ new Date()).getFullYear() + 10;
  const fromBookings = extraEndYear ?? START.year;
  return Math.max(floor, fromBookings);
}
function buildMonthOptions(endYear) {
  const end = endYear ?? defaultMonthFilterEndYear();
  const options = [];
  for (let year = START.year; year <= end; year += 1) {
    const monthStart = year === START.year ? START.month : 1;
    for (let month = monthStart; month <= 12; month += 1) {
      const key = monthKey(year, month);
      options.push({ key, label: monthLabelFromKey(key) });
    }
  }
  return options.reverse();
}
function availableYears(endYear) {
  const end = endYear ?? defaultMonthFilterEndYear();
  const years = [];
  for (let year = end; year >= START.year; year -= 1) {
    years.push(year);
  }
  return years;
}
function monthsForYear(year) {
  const monthStart = year === START.year ? START.month : 1;
  const items = [];
  for (let month = monthStart; month <= 12; month += 1) {
    items.push({
      value: month,
      label: new Date(year, month - 1, 1).toLocaleString("en", { month: "long" })
    });
  }
  return items;
}
function defaultSelectedMonthKey() {
  const now = /* @__PURE__ */ new Date();
  const key = monthKey(now.getFullYear(), now.getMonth() + 1);
  return key >= MONTH_FILTER_START ? key : MONTH_FILTER_START;
}
function clampMonthKey(key, endYear) {
  const options = buildMonthOptions(endYear);
  if (options.length === 0) return MONTH_FILTER_START;
  const min = options[options.length - 1].key;
  const max = options[0].key;
  if (key < min) return min;
  if (key > max) return max;
  return key;
}
function shiftMonthKey(key, delta, endYear) {
  const options = buildMonthOptions(endYear);
  const index = options.findIndex((m) => m.key === key);
  if (index < 0) return clampMonthKey(key, endYear);
  const next = options[index - delta];
  return next?.key ?? clampMonthKey(key, endYear);
}
function maxYearFromMonthKeys(keys) {
  let max = START.year;
  for (const key of keys) {
    const { year } = parseMonthKey(key);
    if (year > max) max = year;
  }
  return max;
}
function currentMonthKey() {
  return defaultSelectedMonthKey();
}
function useMonthFilterRange() {
  const { data: apiMonths = [] } = useResidentMonthsQuery();
  const endYear = reactExports.useMemo(() => {
    const fromApi = maxYearFromMonthKeys(apiMonths.map((m) => m.key));
    return defaultMonthFilterEndYear(fromApi + 2);
  }, [apiMonths]);
  const monthOptions = reactExports.useMemo(() => buildMonthOptions(endYear), [endYear]);
  return { endYear, monthOptions };
}
function useSyncedMonthFilter(initial = defaultSelectedMonthKey()) {
  const { endYear, monthOptions } = useMonthFilterRange();
  const [month, setMonth] = reactExports.useState(() => clampMonthKey(initial, endYear));
  reactExports.useEffect(() => {
    setMonth((current) => clampMonthKey(current, endYear));
  }, [endYear]);
  const monthLabel = monthOptions.find((m) => m.key === month)?.label ?? monthLabelFromKey(month);
  const monthIndex = monthOptions.findIndex((m) => m.key === month);
  function goPrev() {
    setMonth((current) => shiftMonthKey(current, -1, endYear));
  }
  function goNext() {
    setMonth((current) => shiftMonthKey(current, 1, endYear));
  }
  return {
    month,
    setMonth: (key) => setMonth(clampMonthKey(key, endYear)),
    monthOptions,
    monthsLoading: false,
    monthLabel,
    goPrev,
    goNext,
    canGoPrev: monthIndex >= 0 && monthIndex < monthOptions.length - 1,
    canGoNext: monthIndex > 0
  };
}
function MonthFilterSelect({
  id,
  value,
  onChange,
  showNav = true,
  className
}) {
  const { endYear, monthOptions } = useMonthFilterRange();
  const clampedValue = clampMonthKey(value, endYear);
  const { year, month: monthNum } = parseMonthKey(clampedValue);
  const years = reactExports.useMemo(() => availableYears(endYear), [endYear]);
  const monthChoices = reactExports.useMemo(() => monthsForYear(year), [year]);
  const monthIndex = monthOptions.findIndex((m) => m.key === clampedValue);
  function goPrev() {
    onChange(shiftMonthKey(clampedValue, -1, endYear));
  }
  function goNext() {
    onChange(shiftMonthKey(clampedValue, 1, endYear));
  }
  const canGoPrev = monthIndex >= 0 && monthIndex < monthOptions.length - 1;
  const canGoNext = monthIndex > 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 flex flex-wrap items-center gap-1", children: [
    showNav ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      Button,
      {
        type: "button",
        variant: "outline",
        size: "icon",
        className: "h-9 w-9 shrink-0",
        disabled: !canGoPrev,
        "aria-label": "Previous month",
        onClick: goPrev,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-4 w-4" })
      }
    ) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Select,
      {
        value: String(year),
        onValueChange: (y) => {
          const nextYear = Number(y);
          const choices = monthsForYear(nextYear);
          const nextMonth = choices.some((m) => m.value === monthNum) ? monthNum : choices[0]?.value ?? START_MONTH_FALLBACK(nextYear);
          onChange(monthKey(nextYear, nextMonth));
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { id, className: "h-9 w-[6.5rem]", "aria-label": "Year", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: years.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(y), children: y }, y)) })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Select,
      {
        value: String(monthNum),
        onValueChange: (m) => onChange(monthKey(year, Number(m))),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-9 w-[9.5rem]", "aria-label": "Month", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: monthChoices.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(m.value), children: m.label }, m.value)) })
        ]
      }
    ),
    showNav ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      Button,
      {
        type: "button",
        variant: "outline",
        size: "icon",
        className: "h-9 w-9 shrink-0",
        disabled: !canGoNext,
        "aria-label": "Next month",
        onClick: goNext,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4" })
      }
    ) : null
  ] }) });
}
function START_MONTH_FALLBACK(year) {
  return year === 2026 ? 5 : 1;
}
export {
  MonthFilterSelect as M,
  currentMonthKey as c,
  filenameFromContentDisposition as f,
  triggerBrowserDownload as t,
  useSyncedMonthFilter as u
};
