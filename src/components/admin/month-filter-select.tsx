import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useResidentMonthsQuery } from "@/queries/residents";
import {
  availableYears,
  buildMonthOptions,
  clampMonthKey,
  defaultMonthFilterEndYear,
  defaultSelectedMonthKey,
  maxYearFromMonthKeys,
  monthKey,
  monthLabelFromKey,
  monthsForYear,
  MONTH_FILTER_START,
  parseMonthKey,
  shiftMonthKey,
} from "@/lib/month-filter-options";

export function currentMonthKey() {
  return defaultSelectedMonthKey();
}

type MonthFilterSelectProps = {
  id: string;
  value: string;
  onChange: (monthKey: string) => void;
  showNav?: boolean;
  className?: string;
};

function useMonthFilterRange() {
  const { data: apiMonths = [] } = useResidentMonthsQuery();
  const endYear = useMemo(() => {
    const fromApi = maxYearFromMonthKeys(apiMonths.map((m) => m.key));
    return defaultMonthFilterEndYear(fromApi + 2);
  }, [apiMonths]);

  const monthOptions = useMemo(() => buildMonthOptions(endYear), [endYear]);
  return { endYear, monthOptions };
}

export function useSyncedMonthFilter(initial = defaultSelectedMonthKey()) {
  const { endYear, monthOptions } = useMonthFilterRange();
  const [month, setMonth] = useState(() => clampMonthKey(initial, endYear));

  useEffect(() => {
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
    setMonth: (key: string) => setMonth(clampMonthKey(key, endYear)),
    monthOptions,
    monthsLoading: false,
    monthLabel,
    goPrev,
    goNext,
    canGoPrev: monthIndex >= 0 && monthIndex < monthOptions.length - 1,
    canGoNext: monthIndex > 0,
  };
}

export function MonthFilterSelect({
  id,
  value,
  onChange,
  showNav = true,
  className,
}: MonthFilterSelectProps) {
  const { endYear, monthOptions } = useMonthFilterRange();
  const clampedValue = clampMonthKey(value, endYear);
  const { year, month: monthNum } = parseMonthKey(clampedValue);
  const years = useMemo(() => availableYears(endYear), [endYear]);
  const monthChoices = useMemo(() => monthsForYear(year), [year]);
  const monthIndex = monthOptions.findIndex((m) => m.key === clampedValue);

  function goPrev() {
    onChange(shiftMonthKey(clampedValue, -1, endYear));
  }

  function goNext() {
    onChange(shiftMonthKey(clampedValue, 1, endYear));
  }

  const canGoPrev = monthIndex >= 0 && monthIndex < monthOptions.length - 1;
  const canGoNext = monthIndex > 0;

  return (
    <div className={className}>
     
      <div className="mt-1 flex flex-wrap items-center gap-1">
        {showNav ? (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0"
            disabled={!canGoPrev}
            aria-label="Previous month"
            onClick={goPrev}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        ) : null}
        <Select
          value={String(year)}
          onValueChange={(y) => {
            const nextYear = Number(y);
            const choices = monthsForYear(nextYear);
            const nextMonth = choices.some((m) => m.value === monthNum)
              ? monthNum
              : choices[0]?.value ?? START_MONTH_FALLBACK(nextYear);
            onChange(monthKey(nextYear, nextMonth));
          }}
        >
          <SelectTrigger id={id} className="h-9 w-[6.5rem]" aria-label="Year">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={String(monthNum)}
          onValueChange={(m) => onChange(monthKey(year, Number(m)))}
        >
          <SelectTrigger className="h-9 w-[9.5rem]" aria-label="Month">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {monthChoices.map((m) => (
              <SelectItem key={m.value} value={String(m.value)}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {showNav ? (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0"
            disabled={!canGoNext}
            aria-label="Next month"
            onClick={goNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function START_MONTH_FALLBACK(year: number) {
  return year === 2026 ? 5 : 1;
}

export { MONTH_FILTER_START };
