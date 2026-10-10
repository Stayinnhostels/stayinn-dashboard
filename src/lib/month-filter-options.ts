/** How many full past calendar years are always available in month filters. */
export const MONTH_FILTER_PAST_YEARS = 5;

export type MonthOption = { key: string; label: string };

export function monthKey(year: number, month: number) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

function filterStart() {
  return {
    year: new Date().getFullYear() - MONTH_FILTER_PAST_YEARS,
    month: 1 as const,
  };
}

/** Earliest month selectable in admin month filters (rolling: current year − 5 years). */
export function monthFilterStartKey() {
  const { year, month } = filterStart();
  return monthKey(year, month);
}

/** Snapshot of the earliest month at app load — prefer monthFilterStartKey(). */
export const MONTH_FILTER_START = monthFilterStartKey();

export function parseMonthKey(key: string) {
  const [year, month] = key.split("-").map(Number);
  return { year, month };
}

export function monthLabelFromKey(key: string) {
  const { year, month } = parseMonthKey(key);
  return new Date(year, month - 1, 1).toLocaleString("en", { month: "long", year: "numeric" });
}

export function defaultMonthFilterEndYear(extraEndYear?: number) {
  const floor = new Date().getFullYear() + 10;
  const fromBookings = extraEndYear ?? filterStart().year;
  return Math.max(floor, fromBookings);
}

export function buildMonthOptions(endYear?: number): MonthOption[] {
  const start = filterStart();
  const end = endYear ?? defaultMonthFilterEndYear();
  const options: MonthOption[] = [];

  for (let year = start.year; year <= end; year += 1) {
    const monthStart = year === start.year ? start.month : 1;
    for (let month = monthStart; month <= 12; month += 1) {
      const key = monthKey(year, month);
      options.push({ key, label: monthLabelFromKey(key) });
    }
  }

  return options.reverse();
}

export function availableYears(endYear?: number): number[] {
  const start = filterStart();
  const end = endYear ?? defaultMonthFilterEndYear();
  const years: number[] = [];
  for (let year = end; year >= start.year; year -= 1) {
    years.push(year);
  }
  return years;
}

export function monthsForYear(year: number): { value: number; label: string }[] {
  const start = filterStart();
  const monthStart = year === start.year ? start.month : 1;
  const items: { value: number; label: string }[] = [];
  for (let month = monthStart; month <= 12; month += 1) {
    items.push({
      value: month,
      label: new Date(year, month - 1, 1).toLocaleString("en", { month: "long" }),
    });
  }
  return items;
}

export function defaultSelectedMonthKey() {
  const now = new Date();
  const key = monthKey(now.getFullYear(), now.getMonth() + 1);
  const startKey = monthFilterStartKey();
  return key >= startKey ? key : startKey;
}

export function clampMonthKey(key: string, endYear?: number) {
  const options = buildMonthOptions(endYear);
  const startKey = monthFilterStartKey();
  if (options.length === 0) return startKey;
  const min = options[options.length - 1].key;
  const max = options[0].key;
  if (key < min) return min;
  if (key > max) return max;
  return key;
}

export function shiftMonthKey(key: string, delta: number, endYear?: number) {
  const options = buildMonthOptions(endYear);
  const index = options.findIndex((m) => m.key === key);
  if (index < 0) return clampMonthKey(key, endYear);
  const next = options[index - delta];
  return next?.key ?? clampMonthKey(key, endYear);
}

export function maxYearFromMonthKeys(keys: string[]) {
  let max = filterStart().year;
  for (const key of keys) {
    const { year } = parseMonthKey(key);
    if (year > max) max = year;
  }
  return max;
}
