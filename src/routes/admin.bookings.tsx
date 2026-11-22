import { createFileRoute, Outlet, useMatch, useNavigate } from "@tanstack/react-router";
import { Link as RouterLink } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  ArrowRightToLine,
  Banknote,
  CalendarX2,
  ChevronLeft,
  ChevronRight,
  Columns3,
  DoorOpen,
  Download,
  LayoutGrid,
  ListFilter,
  MessageCircle,
  Rows3,
  Rows4,
  UserPlus,
  Users,
  X,
  CalendarRange,
} from "lucide-react";
import { toast } from "sonner";
import {
  GlassButton,
  GlassCheckbox,
  GlassField,
  GlassInput,
  GlassSearch,
  KpiCard,
} from "@/components/glass";
import { PageHeader } from "@/components/admin/page-header";
import {
  BookingRefundDialog,
  type CheckoutConfirmExtras,
} from "@/components/admin/booking-refund-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BookingsTable, type TableDensity } from "@/components/admin/bookings/bookings-table";
import { BookingCard, type BookingCardAction } from "@/components/admin/bookings/booking-card";
import { ColumnsPopover } from "@/components/admin/bookings/columns-popover";
import { WalkInRoomPicker } from "@/components/admin/bookings/walk-in-room-picker";
import {
  useColumnState,
  usePersistentState,
  visibleColumns,
} from "@/components/admin/bookings/booking-columns";
import { bookingDisplayStatus } from "@/components/admin/bookings/booking-format";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { downloadBookingsCsvApi } from "@/api/bookings";
import {
  useBookingsQuery,
  useBookingsSummaryQuery,
  useSendBookingRemindersMutation,
  useUpdateBookingStatusMutation,
} from "@/queries/bookings";
import { formatMoney } from "@/lib/payments";
import { useHostelScope } from "@/lib/use-hostel-scope";
import { useAuthStore } from "@/stores/auth/auth.store";
import { cn } from "@/lib/utils";
import type {
  Booking,
  BookingSort,
  BookingStatus,
  BookingView,
  BookingsListParams,
} from "@/types/domain/booking.types";

export const Route = createFileRoute("/admin/bookings")({
  component: BookingsAdminPage,
  // `?walkin=1` opens "Add walk-in member" (mobile top-bar "New" menu).
  validateSearch: (search: Record<string, unknown>): { walkin?: true } =>
    search.walkin === true || search.walkin === "1" || search.walkin === 1 ? { walkin: true } : {},
});

const VIEWS: { key: BookingView; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "reserved", label: "Reserved" },
  { key: "today", label: "Today" },
  { key: "checked_out", label: "Checked out" },
  { key: "cancelled", label: "Cancelled" },
];

const ROWS_PER_PAGE = [10, 25, 50, 100];
const isLayout = (v: unknown): v is "table" | "cards" => v === "table" || v === "cards";
const isDensity = (v: unknown): v is TableDensity => v === "comfortable" || v === "compact";
const isRows = (v: unknown): v is number => typeof v === "number" && ROWS_PER_PAGE.includes(v);

function BookingsAdminPage() {
  const detailMatch = useMatch({ from: "/admin/bookings/$id", shouldThrow: false });
  if (detailMatch) return <Outlet />;
  return <BookingsListPage />;
}

type DateFilters = {
  move_in_from: string;
  move_in_to: string;
  check_out_from: string;
  check_out_to: string;
};
const NO_DATES: DateFilters = {
  move_in_from: "",
  move_in_to: "",
  check_out_from: "",
  check_out_to: "",
};

/** Figma 06.01–06.06 · Bookings (table + cards). */
function BookingsListPage() {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const openWalkIn = Route.useSearch().walkin === true;
  const { hostelId } = useHostelScope();

  const [query, setQuery] = useState("");
  const search = useDebouncedValue(query.trim(), 300);
  const [view, setView] = useState<BookingView>("all");
  const [balanceDue, setBalanceDue] = useState(false);
  const [dates, setDates] = useState<DateFilters>(NO_DATES);
  const [sort, setSort] = useState<BookingSort>("created");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [layout, setLayout] = usePersistentState(
    "stayinn.bookings.view",
    "table" as "table" | "cards",
    isLayout,
  );
  const [density, setDensity] = usePersistentState(
    "stayinn.bookings.density",
    "comfortable" as TableDensity,
    isDensity,
  );
  const [rowsPerPage, setRowsPerPage] = usePersistentState("stayinn.bookings.rows", 25, isRows);
  const [columnState, setColumnState] = useColumnState();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Show a backdrop behind the filter bar only once it is stuck to the top.
  const stickySentinel = useRef<HTMLDivElement>(null);
  const [toolbarStuck, setToolbarStuck] = useState(false);
  useEffect(() => {
    const el = stickySentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setToolbarStuck(!entry.isIntersecting), {
      threshold: 0,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(
    () => setPage(1),
    [search, view, balanceDue, dates, sort, order, hostelId, rowsPerPage],
  );

  // Figma: "Table ↔ Cards. Shortcut T / C."
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (
        e.metaKey ||
        e.ctrlKey ||
        e.altKey ||
        t?.closest("input, textarea, select, [contenteditable]")
      )
        return;
      if (e.key === "t" || e.key === "T") setLayout("table");
      if (e.key === "c" || e.key === "C") setLayout("cards");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setLayout]);

  const filterParams = useMemo<BookingsListParams>(
    () => ({
      ...(hostelId ? { hostel: hostelId } : {}),
      ...(search ? { search } : {}),
      ...(view !== "all" ? { view } : {}),
      ...(balanceDue ? { balance: "due" as const } : {}),
      ...Object.fromEntries(Object.entries(dates).filter(([, v]) => v)),
      sort,
      order,
    }),
    [hostelId, search, view, balanceDue, dates, sort, order],
  );
  const listParams = useMemo(
    () => ({ ...filterParams, page, limit: rowsPerPage }),
    [filterParams, page, rowsPerPage],
  );

  const { data, isLoading, isError, error } = useBookingsQuery(listParams, {
    enabled: Boolean(hostelId),
  });
  const summary = useBookingsSummaryQuery(hostelId ?? undefined, {
    enabled: Boolean(hostelId),
  }).data;
  const bookings = data?.bookings ?? [];
  const pagination = data?.pagination;
  const counts = data?.counts ?? summary?.counts ?? null;
  const outstandingFiltered = data?.totals?.outstanding ?? 0;
  const currency = summary?.kpis.outstanding.currency ?? "pkr";

  // Keep the selection to rows that still exist on screen.
  useEffect(() => {
    setSelected((prev) => {
      const ids = new Set(bookings.map((b) => b.id));
      const next = new Set([...prev].filter((id) => ids.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [bookings]);

  // ── Status changes (same rules as before: cancel / check-out go through the refund dialog) ──
  const updateStatus = useUpdateBookingStatusMutation();
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [checkoutId, setCheckoutId] = useState<string | null>(null);
  const cancelBooking = bookings.find((b) => b.id === cancelId) ?? null;
  const checkoutBooking = bookings.find((b) => b.id === checkoutId) ?? null;

  function applyStatus(
    id: string,
    status: BookingStatus,
    amountRefunded?: number,
    extras?: CheckoutConfirmExtras,
  ) {
    const row = bookings.find((b) => b.id === id) ?? null;
    updateStatus.mutate(
      {
        id,
        status,
        amount_refunded: amountRefunded,
        ...(status === "checked_out" && extras?.rentCollected != null
          ? { checkout_rent_collected: extras.rentCollected }
          : {}),
        ...(status === "checked_out" && extras && row?.security_status === "paid"
          ? { security_returned: extras.securityReturned }
          : {}),
      },
      {
        onSuccess: () => {
          toast.success(
            status === "cancelled"
              ? "Booking cancelled"
              : status === "checked_out"
                ? "Guest checked out"
                : status === "checked_in"
                  ? "Guest checked in"
                  : "Booking updated",
          );
          setCancelId(null);
          setCheckoutId(null);
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : "Update failed"),
      },
    );
  }

  function changeStatus(b: Booking, status: BookingStatus) {
    if (status === b.status) return;
    if (status === "cancelled") return setCancelId(b.id);
    if (status === "checked_out") return setCheckoutId(b.id);
    applyStatus(b.id, status);
  }

  const openBooking = (b: Booking, opts?: { edit?: boolean; hash?: string }) =>
    void navigate({
      to: "/admin/bookings/$id",
      params: { id: b.id },
      ...(opts?.edit ? { search: { edit: true } } : {}),
      ...(opts?.hash ? { hash: opts.hash } : {}),
    });

  function onCardAction(b: Booking, action: BookingCardAction) {
    if (action === "check_in") return changeStatus(b, "checked_in");
    if (action === "check_out") return changeStatus(b, "checked_out");
    if (action === "rebook") return openBooking(b);
    openBooking(b, { hash: "payments" });
  }

  // ── Export + reminders ──
  const [exporting, setExporting] = useState(false);
  async function exportCsv() {
    if (!token) return;
    setExporting(true);
    try {
      await downloadBookingsCsvApi(token, filterParams);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Export failed");
    } finally {
      setExporting(false);
    }
  }
  function exportSelected() {
    const rows = bookings.filter((b) => selected.has(b.id));
    const head = [
      "Booking ID",
      "Guest",
      "Status",
      "Room",
      "Move-in",
      "Move-out",
      "Paid",
      "Balance",
      "Phone",
      "Email",
    ];
    const cell = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = [
      head.map(cell).join(","),
      ...rows.map((b) =>
        [
          b.booking_code ?? b.id,
          b.guest_name,
          bookingDisplayStatus(b),
          b.room_title,
          b.move_in,
          b.check_out,
          b.paid_total,
          b.balance_due,
          b.guest_phone,
          b.guest_email,
        ]
          .map(cell)
          .join(","),
      ),
    ].join("\r\n");
    const url = URL.createObjectURL(new Blob([`﻿${csv}`], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `bookings-selected-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
  const reminders = useSendBookingRemindersMutation();
  function sendReminders() {
    reminders.mutate([...selected], {
      onSuccess: (r) => {
        const skipped = r.skipped_no_balance + r.skipped_no_email;
        if (r.sent > 0)
          toast.success(
            `Reminder sent to ${r.sent} guest${r.sent === 1 ? "" : "s"}${skipped ? ` · ${skipped} skipped` : ""}`,
          );
        else
          toast.info(
            r.skipped_no_balance === r.requested
              ? "Nothing is due on the selected bookings"
              : "No reminder sent — check guest emails",
          );
        if (r.failed) toast.error(`${r.failed} email${r.failed === 1 ? "" : "s"} failed to send`);
      },
      onError: (e) => toast.error(e instanceof Error ? e.message : "Could not send reminders"),
    });
  }

  function onSort(s: BookingSort) {
    if (s === sort) setOrder((o) => (o === "asc" ? "desc" : "asc"));
    else {
      setSort(s);
      setOrder(s === "guest" || s === "status" ? "asc" : "desc");
    }
  }

  const toggle = (id: string, on: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  const toggleAll = (on: boolean) =>
    setSelected(on ? new Set(bookings.map((b) => b.id)) : new Set());

  const renderMenu = (b: Booking, trigger: ReactNode) => (
    <RowMenu booking={b} trigger={trigger} onOpen={openBooking} onStatus={changeStatus} />
  );

  const k = summary?.kpis;
  const names = (gs: { guest_name: string }[]) => gs.map((g) => g.guest_name).join(" · ");
  const total = pagination?.total ?? 0;
  const from = total === 0 ? 0 : (page - 1) * rowsPerPage + 1;
  const to = Math.min(total, page * rowsPerPage);
  const dateChips = (
    [
      ["move_in_from", "Move-in from"],
      ["move_in_to", "Move-in to"],
      ["check_out_from", "Move-out from"],
      ["check_out_to", "Move-out to"],
    ] as const
  ).filter(([key]) => dates[key]);
  const hasChips = balanceDue || dateChips.length > 0;

  return (
    <div className="flex flex-col pb-20">
      <BookingRefundDialog
        open={cancelId != null}
        booking={cancelBooking}
        mode="cancel"
        submitting={updateStatus.isPending}
        onClose={() => setCancelId(null)}
        onConfirm={(amount) => cancelId && applyStatus(cancelId, "cancelled", amount)}
      />
      <BookingRefundDialog
        open={checkoutId != null}
        booking={checkoutBooking}
        mode="checkout"
        submitting={updateStatus.isPending}
        onClose={() => setCheckoutId(null)}
        onConfirm={(amount, extras) =>
          checkoutId && applyStatus(checkoutId, "checked_out", amount, extras)
        }
      />

      <PageHeader
        title="Bookings"
        subtitle={
          counts
            ? `${counts.all} booking${counts.all === 1 ? "" : "s"} · ${counts.active} active`
            : " "
        }
        actions={
          <>
            <GlassButton asChild variant="glass">
              <RouterLink to="/admin/schedule">
                <CalendarRange aria-hidden /> Schedule
              </RouterLink>
            </GlassButton>
            <GlassButton
              variant="glass"
              onClick={() => void exportCsv()}
              disabled={exporting || total === 0}
            >
              <Download aria-hidden /> Export CSV
            </GlassButton>
            <WalkInRoomPicker defaultOpen={openWalkIn} full>
              <GlassButton>
                <UserPlus aria-hidden /> Add walk-in member
              </GlassButton>
            </WalkInRoomPicker>
          </>
        }
      />

      {/* KPI row (quick filters) */}
      <div className="mb-2.5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          tone="success"
          icon={<Users />}
          label="Active"
          value={k?.active.count ?? "—"}
          context={
            k
              ? `${k.active.in_house} in-house · ${k.active.leaving} leaving · ${k.active.arriving} arriving`
              : null
          }
          active={view === "active"}
          onClick={() => setView(view === "active" ? "all" : "active")}
        />
        <KpiCard
          icon={<ArrowRightToLine />}
          label="Arrivals today"
          value={k?.arrivals_today.count ?? "—"}
          context={
            k?.arrivals_today.guests.length
              ? k.arrivals_today.guests
                  .map((g) =>
                    g.expected_arrival_time
                      ? `${g.guest_name} · ${g.expected_arrival_time}`
                      : g.guest_name,
                  )
                  .join(" · ")
              : "No arrivals"
          }
          active={view === "today"}
          onClick={() => setView(view === "today" ? "all" : "today")}
        />
        <KpiCard
          icon={<DoorOpen />}
          label="Departures today"
          value={k?.departures_today.count ?? "—"}
          context={
            k?.departures_today.guests.length ? names(k.departures_today.guests) : "No departures"
          }
          active={view === "today"}
          onClick={() => setView(view === "today" ? "all" : "today")}
        />
        <KpiCard
          tone="danger"
          icon={<Banknote />}
          label="Outstanding"
          value={k ? formatMoney(k.outstanding.amount, k.outstanding.currency) : "—"}
          valueClassName={k && k.outstanding.amount > 0 ? "text-danger" : undefined}
          context={
            k ? `${k.outstanding.bookings} booking${k.outstanding.bookings === 1 ? "" : "s"}` : null
          }
          active={balanceDue}
          onClick={() => setBalanceDue((v) => !v)}
        />
      </div>

      {/* Header + KPI cards scroll away; the filter bar sticks to the top of the page. */}
      <div ref={stickySentinel} aria-hidden className="h-px" />
      <div
        className={cn(
          "relative z-20 md:sticky md:-top-6 -mx-4 -mt-px px-4 py-2 transition-[background-color,box-shadow,backdrop-filter] duration-200 md:-mx-6 md:px-6",
          toolbarStuck &&
            "border-b border-glass-divider bg-[color-mix(in_srgb,var(--gl-bg-base)_78%,transparent)] backdrop-blur-xl",
        )}
      >
        <div className="glass-2 flex flex-wrap items-center gap-2 rounded-[18px] p-2.5 xl:flex-nowrap">
          <GlassSearch
            className="min-w-[150px] flex-1 xl:min-w-[120px]"
            placeholder="Search bookings"
            shortcut=""
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search bookings"
          />
          <div
            role="tablist"
            aria-label="Booking status"
            className="no-scrollbar flex max-w-full min-w-0 gap-0.5 overflow-x-auto rounded-[14px] border border-glass-divider bg-glass-inset p-1 xl:shrink"
          >
            {VIEWS.map((v) => {
              const on = view === v.key;
              return (
                <button
                  key={v.key}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => setView(v.key)}
                  className={cn(
                    "flex h-8 shrink-0 cursor-pointer items-center rounded-[10px] border px-2.5 text-body font-medium whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-brand-border",
                    on
                      ? "border-brand-border bg-brand-tint text-ink"
                      : "border-transparent text-ink-2 hover:text-ink",
                  )}
                >
                  {v.label}
                  {counts ? ` ${counts[v.key]}` : ""}
                </button>
              );
            })}
          </div>
          <FiltersPopover
            dates={dates}
            onDates={setDates}
            balanceDue={balanceDue}
            onBalanceDue={setBalanceDue}
          />
          <Segmented
            label="Layout"
            value={layout}
            onChange={setLayout}
            options={[
              { value: "table", label: "Table", icon: <Rows3 /> },
              { value: "cards", label: "Cards", icon: <LayoutGrid /> },
            ]}
          />
          {layout === "table" ? (
            <>
              <ColumnsPopover value={columnState} onApply={setColumnState}>
                <GlassButton variant="glass">
                  <Columns3 aria-hidden /> Columns
                </GlassButton>
              </ColumnsPopover>
              <Segmented
                label="Row density"
                value={density}
                onChange={setDensity}
                iconOnly
                options={[
                  { value: "comfortable", label: "Comfortable rows", icon: <Rows3 /> },
                  { value: "compact", label: "Compact rows", icon: <Rows4 /> },
                ]}
              />
            </>
          ) : null}
        </div>

        {hasChips ? (
          <div className="mt-2.5 flex flex-wrap items-center gap-2.5">
            {balanceDue ? (
              <FilterChip label="Balance due only" onRemove={() => setBalanceDue(false)} />
            ) : null}
            {dateChips.map(([key, label]) => (
              <FilterChip
                key={key}
                label={`${label} ${dates[key]}`}
                onRemove={() => setDates((d) => ({ ...d, [key]: "" }))}
              />
            ))}
            <span className="text-label font-medium text-ink-2">
              {total} booking{total === 1 ? "" : "s"} · {formatMoney(outstandingFiltered, currency)}{" "}
              outstanding
            </span>
            <button
              type="button"
              onClick={() => {
                setBalanceDue(false);
                setDates(NO_DATES);
              }}
              className="cursor-pointer text-body font-semibold text-brand-text underline outline-none focus-visible:ring-2 focus-visible:ring-brand-border"
            >
              Clear all
            </button>
          </div>
        ) : null}
      </div>

      <div className={cn("mt-2.5", selected.size > 0 && "pb-6")}>
        {!hostelId || isLoading ? (
          <LoadingState layout={layout} />
        ) : isError ? (
          <div className="glass-1 rounded-[20px] px-6 py-16 text-center text-body text-danger">
            {error instanceof Error ? error.message : "Could not load bookings."}
          </div>
        ) : bookings.length === 0 ? (
          <div className="glass-1 flex flex-col items-center gap-3 rounded-[20px] px-6 py-16 text-center">
            <span className="flex size-10 items-center justify-center rounded-[12px] bg-glass-inset text-ink-3 [&_svg]:size-[18px]">
              <CalendarX2 aria-hidden />
            </span>
            <p className="text-body font-medium text-ink-2">
              {search || view !== "all" || hasChips
                ? "No bookings match these filters"
                : "No bookings yet"}
            </p>
          </div>
        ) : layout === "table" ? (
          <BookingsTable
            bookings={bookings}
            columns={visibleColumns(columnState)}
            density={density}
            selected={selected}
            onToggle={toggle}
            onToggleAll={toggleAll}
            sort={sort}
            order={order}
            onSort={onSort}
            onOpen={(b) => openBooking(b)}
            onCheckIn={(b) => changeStatus(b, "checked_in")}
            renderMenu={renderMenu}
            footer={
              <div className="flex flex-wrap items-center gap-2.5 border-t border-glass-divider px-4 py-3">
                <p className="min-w-0 flex-1 text-label font-medium text-ink-2">
                  Showing {from}–{to} of {total} · Outstanding total{" "}
                  {formatMoney(outstandingFiltered, currency)} (sum of Balance)
                </p>
                <label
                  className="text-label font-medium whitespace-nowrap text-ink-3"
                  htmlFor="bookings-rows"
                >
                  Rows per page
                </label>
                <select
                  id="bookings-rows"
                  value={rowsPerPage}
                  onChange={(e) => setRowsPerPage(Number(e.target.value))}
                  className="h-8 cursor-pointer rounded-[10px] border border-glass-divider bg-glass-inset px-2.5 text-label font-medium text-ink outline-none focus-visible:ring-2 focus-visible:ring-brand-border"
                >
                  {ROWS_PER_PAGE.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <Pager page={page} pages={pagination?.pages ?? 1} onPage={setPage} />
              </div>
            }
          />
        ) : (
          <>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {bookings.map((b) => (
                <BookingCard
                  key={b.id}
                  booking={b}
                  selected={selected.has(b.id)}
                  selecting={selected.size > 0}
                  onToggle={(on) => toggle(b.id, on)}
                  onOpen={() => openBooking(b)}
                  onAction={(a) => onCardAction(b, a)}
                  renderMenu={(trigger) => renderMenu(b, trigger)}
                />
              ))}
            </div>
            <div className="mt-5 flex items-center gap-2.5">
              <p className="flex-1 text-label font-medium text-ink-2">
                Showing {to - from + 1} of {counts?.all ?? total} · Outstanding{" "}
                {formatMoney(outstandingFiltered, currency)}
              </p>
              <Pager page={page} pages={pagination?.pages ?? 1} onPage={setPage} />
            </div>
          </>
        )}
      </div>

      {selected.size > 0 ? (
        <div className="glass-3 fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2.5 rounded-[18px] py-2 pr-2 pl-4 font-geist max-sm:bottom-24">
          <span className="flex size-6 items-center justify-center rounded-full bg-brand text-label text-on-brand">
            {selected.size}
          </span>
          <span className="text-body font-medium text-ink">selected</span>
          <span className="h-6 w-px bg-glass-divider" aria-hidden />
          <GlassButton
            variant="glass"
            size="sm"
            onClick={sendReminders}
            disabled={reminders.isPending}
          >
            <MessageCircle aria-hidden /> Send reminder
          </GlassButton>
          <GlassButton variant="glass" size="sm" onClick={exportSelected}>
            <Download aria-hidden /> Export
          </GlassButton>
          <GlassButton variant="ghost" size="sm" onClick={() => setSelected(new Set())}>
            <X aria-hidden /> Clear
          </GlassButton>
        </div>
      ) : null}
    </div>
  );
}

function Segmented<T extends string>({
  label,
  value,
  onChange,
  options,
  iconOnly,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; icon: ReactNode }[];
  iconOnly?: boolean;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="flex gap-0.5 rounded-[12px] border border-glass-divider bg-glass-inset p-1"
    >
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            aria-label={iconOnly ? o.label : undefined}
            title={iconOnly ? o.label : undefined}
            onClick={() => onChange(o.value)}
            className={cn(
              "flex h-8 cursor-pointer items-center gap-1.5 rounded-[9px] border text-body font-medium outline-none focus-visible:ring-2 focus-visible:ring-brand-border [&_svg]:size-4",
              iconOnly ? "w-8 justify-center" : "w-20 px-3",
              on
                ? "border-brand-border bg-brand-tint text-ink"
                : "border-transparent text-ink-2 hover:text-ink",
              on && iconOnly && "border-transparent text-brand",
            )}
          >
            {o.icon}
            {iconOnly ? null : o.label}
          </button>
        );
      })}
    </div>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-brand-border bg-brand-tint py-0.5 pr-1 pl-2.5 text-label font-medium text-ink">
      {label}
      <button
        type="button"
        aria-label={`Remove filter: ${label}`}
        onClick={onRemove}
        className="flex size-4 cursor-pointer items-center justify-center rounded-full text-ink-2 outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-brand-border"
      >
        <X className="size-3" aria-hidden />
      </button>
    </span>
  );
}

function FiltersPopover({
  dates,
  onDates,
  balanceDue,
  onBalanceDue,
}: {
  dates: DateFilters;
  onDates: (d: DateFilters) => void;
  balanceDue: boolean;
  onBalanceDue: (v: boolean) => void;
}) {
  const active = Object.values(dates).filter(Boolean).length + (balanceDue ? 1 : 0);
  const field = (key: keyof DateFilters, label: string, min?: string, max?: string) => (
    <GlassField label={label}>
      {(p) => (
        <GlassInput
          {...p}
          type="date"
          value={dates[key]}
          min={min || undefined}
          max={max || undefined}
          onChange={(e) => onDates({ ...dates, [key]: e.target.value })}
        />
      )}
    </GlassField>
  );
  return (
    <Popover>
      <PopoverTrigger asChild>
        <GlassButton variant="glass">
          <ListFilter aria-hidden /> Filters
          {active ? (
            <span className="rounded-full bg-brand-tint px-1.5 text-label font-medium text-brand-text">
              {active}
            </span>
          ) : null}
        </GlassButton>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="glass-3 flex w-[320px] flex-col gap-3 rounded-[20px] border-glass-stroke p-4 font-geist text-ink shadow-none"
      >
        <p className="text-card-title">Filters</p>
        <div className="grid grid-cols-2 gap-3">
          {field("move_in_from", "Move-in from", undefined, dates.move_in_to)}
          {field("move_in_to", "Move-in to", dates.move_in_from)}
          {field("check_out_from", "Move-out from", undefined, dates.check_out_to)}
          {field("check_out_to", "Move-out to", dates.check_out_from)}
        </div>
        <label className="flex cursor-pointer items-center gap-2.5 text-body font-medium text-ink">
          <GlassCheckbox
            checked={balanceDue}
            onCheckedChange={onBalanceDue}
            aria-label="Balance due only"
          />
          Balance due only
        </label>
        <div className="flex justify-end">
          <GlassButton
            variant="ghost"
            size="sm"
            onClick={() => {
              onDates(NO_DATES);
              onBalanceDue(false);
            }}
            disabled={active === 0}
          >
            Clear filters
          </GlassButton>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function Pager({
  page,
  pages,
  onPage,
}: {
  page: number;
  pages: number;
  onPage: (p: number) => void;
}) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        aria-label="Previous page"
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
        className="flex size-8 cursor-pointer items-center justify-center rounded-[10px] text-ink-2 outline-none hover:bg-glass-inset disabled:cursor-default disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-brand-border"
      >
        <ChevronLeft className="size-4" aria-hidden />
      </button>
      <span className="text-label font-medium text-ink-2">
        {page} / {pages}
      </span>
      <button
        type="button"
        aria-label="Next page"
        disabled={page >= pages}
        onClick={() => onPage(page + 1)}
        className="flex size-8 cursor-pointer items-center justify-center rounded-[10px] text-ink-2 outline-none hover:bg-glass-inset disabled:cursor-default disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-brand-border"
      >
        <ChevronRight className="size-4" aria-hidden />
      </button>
    </div>
  );
}

const MENU_ITEM =
  "cursor-pointer rounded-[10px] px-2.5 py-2 text-body font-medium text-ink focus:bg-glass-inset";

function RowMenu({
  booking: b,
  trigger,
  onOpen,
  onStatus,
}: {
  booking: Booking;
  trigger: ReactNode;
  onOpen: (b: Booking, opts?: { edit?: boolean; hash?: string }) => void;
  onStatus: (b: Booking, s: BookingStatus) => void;
}) {
  const closed = b.status === "cancelled" || b.status === "checked_out";
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="glass-3 min-w-[200px] rounded-[16px] border-glass-stroke p-1.5 font-geist text-ink shadow-none"
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenuItem className={MENU_ITEM} onSelect={() => onOpen(b)}>
          Open full record
        </DropdownMenuItem>
        <DropdownMenuItem className={MENU_ITEM} onSelect={() => onOpen(b, { edit: true })}>
          Edit booking
        </DropdownMenuItem>
        <DropdownMenuItem
          className={MENU_ITEM}
          onSelect={() => onOpen(b, { hash: "booking-invoice" })}
        >
          Invoice
        </DropdownMenuItem>
        {!closed ? <DropdownMenuSeparator className="my-1 bg-glass-divider" /> : null}
        {b.status === "pending" ? (
          <DropdownMenuItem className={MENU_ITEM} onSelect={() => onStatus(b, "confirmed")}>
            Confirm booking
          </DropdownMenuItem>
        ) : null}
        {b.status === "pending" || b.status === "confirmed" ? (
          <DropdownMenuItem className={MENU_ITEM} onSelect={() => onStatus(b, "checked_in")}>
            Check in
          </DropdownMenuItem>
        ) : null}
        {b.status === "checked_in" ? (
          <DropdownMenuItem className={MENU_ITEM} onSelect={() => onStatus(b, "checked_out")}>
            Check out
          </DropdownMenuItem>
        ) : null}
        {!closed ? (
          <DropdownMenuItem
            className={cn(MENU_ITEM, "text-danger focus:text-danger")}
            onSelect={() => onStatus(b, "cancelled")}
          >
            Cancel booking
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function LoadingState({ layout }: { layout: "table" | "cards" }) {
  const bar = "animate-pulse rounded bg-glass-inset";
  if (layout === "cards") {
    return (
      <div
        className="grid gap-5 md:grid-cols-2 xl:grid-cols-3"
        aria-busy="true"
        aria-label="Loading bookings"
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="glass-1 flex h-[420px] flex-col gap-3 rounded-[20px] p-4">
            <div className="flex items-center gap-2.5">
              <span className={cn(bar, "size-10 rounded-full")} />
              <span className={cn(bar, "h-4 w-32")} />
            </div>
            <span className={cn(bar, "h-[78px] rounded-[14px]")} />
            {Array.from({ length: 4 }).map((__, j) => (
              <span key={j} className={cn(bar, "h-9")} />
            ))}
          </div>
        ))}
      </div>
    );
  }
  return (
    <div
      className="glass-2 overflow-hidden rounded-[20px]"
      aria-busy="true"
      aria-label="Loading bookings"
    >
      <div className="h-10 border-b border-glass-divider bg-glass-inset" />
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex h-16 items-center gap-4 border-b border-glass-divider px-4">
          <span className={cn(bar, "size-[34px] rounded-full")} />
          <span className={cn(bar, "h-4 w-40")} />
          <span className={cn(bar, "ml-auto h-4 w-24")} />
        </div>
      ))}
    </div>
  );
}
