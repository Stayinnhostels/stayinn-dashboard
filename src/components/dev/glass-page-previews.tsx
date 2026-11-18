import * as React from "react";
import { useState } from "react";
import {
  ArrowRightToLine,
  Banknote,
  BedDouble,
  CalendarDays,
  Check,
  DoorOpen,
  LogOut,
  Settings,
  Users,
} from "lucide-react";
import { BookingsTable } from "@/components/admin/bookings/bookings-table";
import { BookingCard } from "@/components/admin/bookings/booking-card";
import { DEFAULT_COLUMN_STATE, visibleColumns } from "@/components/admin/bookings/booking-columns";
import type { Booking } from "@/types/domain/booking.types";
import { GlassButton, KpiCard } from "@/components/glass";
import { PageHeader } from "@/components/admin/page-header";
import {
  NotificationFilterTabs,
  NotificationGroup,
  useNotificationActions,
} from "@/components/admin/notifications/notification-row";
import { NotificationsPanelBody } from "@/components/admin/notifications-bell";
import { groupNotificationsByDay } from "@/lib/notification-kind";
import type { Notification, NotificationCategory } from "@/types/domain/notification.types";
import {
  ChartCard,
  GlassAreaChart,
  GlassBarChart,
  GlassDonut,
  LegendItem,
} from "@/components/admin/dashboard/glass-charts";
import { RoomCard } from "@/components/admin/rooms/room-card";
import { DeleteRoomDialog } from "@/components/admin/rooms/delete-room-dialog";
import { RoomFormDialog } from "@/components/admin/room-form-dialog";
import type { Room } from "@/types/domain/room.types";

/**
 * Dev-only sample-data previews of the Dashboard and Rooms pieces (Figma 01/02),
 * used from /screens to check visuals without a running API.
 */

const weekly = [9, 12, 8, 13, 12, 13, 11, 14].map((v, i) => ({
  key: i,
  label: `W${i + 1}`,
  value: v,
  eyebrow: `Week ${i + 1}`,
  unit: "bookings",
}));
const checkins = [13, 11, 14, 16, 17, 13, 14, 15].map((v, i) => ({
  key: i,
  label: ["9/12", "9/19", "9/26", "10/3", "10/10", "10/17", "10/24", "10/31"][i],
  value: v,
  eyebrow: ["12 Sep", "19 Sep", "26 Sep", "3 Oct", "10 Oct", "17 Oct", "24 Oct", "31 Oct"][i],
  unit: "check-ins",
}));
const monthly = [22, 29, 34, 36, 48, 9].map((v, i) => ({
  key: String(i),
  label: ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov"][i],
  value: v,
  eyebrow: ["June", "July", "August", "September", "October", "November"][i],
  partial: i === 5,
}));
const dailyVals = [
  1, 2, 1, 1, 8, 3, 1, 0, 1, 2, 1, 3, 2, 0, 2, 1, 1, 2, 3, 1, 0, 1, 2, 2, 1, 2, 1, 2, 3, 1,
];
const daily = dailyVals.map((v, i) => {
  const d = new Date(2026, 9, 8 + i);
  return {
    key: String(i),
    label: `${d.getMonth() + 1}/${d.getDate()}`,
    value: v,
    eyebrow: d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
  };
});

export function DashboardPreview() {
  return (
    <div className="flex flex-col gap-5 p-6">
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          icon={<CalendarDays />}
          label="Current bookings"
          value={42}
          context="Arriving tonight: 2"
        />
        <KpiCard icon={<LogOut />} label="Check-outs today" value={1} context="Leaves at 11:00" />
        <KpiCard icon={<DoorOpen />} label="Total rooms" value={16} context="2 available" />
        <KpiCard
          icon={<BedDouble />}
          label="Occupancy"
          value="93%"
          context="43 / 46 bookable beds"
        />
      </div>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <ChartCard
          title="Weekly bookings"
          subtitle="Last 8 weeks · 9 Sep – 31 Oct"
          legend={<LegendItem label="Bookings" value="92 total" />}
        >
          <GlassBarChart
            data={weekly}
            height={300}
            barSize={46}
            deltaLabel={(p) => `vs ${p.label}`}
          />
        </ChartCard>
        <ChartCard title="On-time check-ins" subtitle="Last 8 weeks">
          <div className="flex flex-1 flex-col items-center justify-center gap-5">
            <GlassDonut
              size={200}
              thickness={18}
              ariaLabel="92% on time"
              slices={[
                { key: "on", label: "On time", value: 104, color: "var(--gl-brand-primary)" },
                { key: "late", label: "Late", value: 9, color: "var(--gl-warning)" },
              ]}
              center={
                <>
                  <span className="text-kpi text-ink">92%</span>
                  <span className="text-label font-medium text-ink-2">104 of 113 check-ins</span>
                </>
              }
            />
            <div className="flex items-center gap-3.5">
              <LegendItem label="On time" value={104} />
              <LegendItem color="var(--gl-warning)" label="Late" value={9} />
            </div>
          </div>
        </ChartCard>
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        <ChartCard title="Weekly check-ins" subtitle="Last 8 weeks">
          <GlassBarChart data={checkins} height={210} barSize={20} steps={2} showEveryLabel={2} />
        </ChartCard>
        <ChartCard title="Monthly bookings" subtitle="Last 6 months">
          <GlassAreaChart
            data={monthly}
            height={210}
            unit="bookings"
            steps={3}
            dots
            partialLabel="Partial month"
          />
        </ChartCard>
        <ChartCard title="Booking sources" subtitle="Last 30 days">
          <div className="flex flex-1 items-center gap-5">
            <GlassDonut
              size={150}
              thickness={16}
              ariaLabel="52 bookings"
              slices={[
                { key: "w", label: "Walk-in", value: 48, color: "var(--gl-brand-primary)" },
                {
                  key: "s",
                  label: "Website",
                  value: 4,
                  color: "color-mix(in srgb, var(--gl-brand-primary) 45%, transparent)",
                },
              ]}
              center={
                <>
                  <span className="text-kpi text-ink">52</span>
                  <span className="text-label font-medium text-ink-2">bookings</span>
                </>
              }
            />
            <ul className="flex min-w-0 flex-1 flex-col gap-3">
              {[
                ["Walk-in", 92, 48, "var(--gl-brand-primary)"],
                ["Website", 8, 4, "color-mix(in srgb, var(--gl-brand-primary) 45%, transparent)"],
              ].map(([l, p, n, c]) => (
                <li key={String(l)} className="flex flex-col gap-0.5">
                  <span className="flex items-center gap-2">
                    <span className="size-2 rounded-full" style={{ background: String(c) }} />
                    <span className="flex-1 text-label font-medium text-ink-2">{l}</span>
                    <span className="text-body font-semibold text-ink">{p}%</span>
                  </span>
                  <span className="text-label text-ink-3">{n} bookings</span>
                </li>
              ))}
            </ul>
          </div>
        </ChartCard>
      </div>
      <ChartCard
        title="Daily bookings — last 30 days"
        subtitle="52 bookings in this period"
        legend={
          <>
            <LegendItem label="Bookings" />
            <LegendItem label="Peak day" />
          </>
        }
      >
        <GlassAreaChart
          data={daily}
          height={220}
          unit="bookings"
          smooth
          markPeak
          showEveryLabel={2}
        />
      </ChartCard>
    </div>
  );
}

const baseRoom: Room = {
  id: "r14",
  title: "Private double",
  room_number: 14,
  description: "A quiet private double on floor 3, with a desk, wardrobe, and Wi-Fi.",
  price_per_night: 48,
  price_per_night_usd: 48,
  price_per_night_pkr: 12000,
  status: "full",
  category: "Private",
  capacity: 2,
  beds_total: 2,
  beds_available: 0,
  amenities: ["Desk", "Wardrobe", "WiFi"],
  images: ["/design-system/room-sample.jpg"],
  badge: null,
  display_order: 100,
  floor: 3,
  occupants: [{ booking_id: "b1", guest_name: "Alex Rivera", seats: 2, status: "checked_in" }],
  created_at: null,
  updated_at: null,
};

const sampleRooms: Room[] = [
  baseRoom,
  {
    ...baseRoom,
    id: "r1",
    room_number: 1,
    title: "6-bed dorm",
    floor: 1,
    beds_total: 6,
    beds_available: 0,
    occupants: [
      { booking_id: "b2", guest_name: "Maya Chen", seats: 3, status: "checked_in" },
      { booking_id: "b3", guest_name: "Omar Farooq", seats: 3, status: "confirmed" },
    ],
  },
  {
    ...baseRoom,
    id: "r7",
    room_number: 7,
    status: "available",
    beds_available: 2,
    floor: 2,
    occupants: [],
  },
  {
    ...baseRoom,
    id: "r16",
    room_number: 16,
    title: "4-bed dorm",
    status: "maintenance",
    beds_total: 4,
    beds_available: 4,
    floor: 2,
    occupants: [],
  },
];

export function RoomsPreview({ dialog }: { dialog?: "add" | "delete" }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="flex flex-col gap-5 p-6">
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {sampleRooms.map((r) => (
          <RoomCard key={r.id} room={r} onEdit={() => {}} onDelete={() => {}} />
        ))}
      </div>
      {dialog === "delete" ? (
        <DeleteRoomDialog
          open={open}
          onOpenChange={setOpen}
          title="Delete this room?"
          subtitle="Room 14 · Private double"
          hostelName="Stay Inn Hostels"
          occupants={baseRoom.occupants ?? []}
          onConfirm={() => {}}
        />
      ) : null}
      {dialog === "add" ? (
        <RoomFormDialog
          open={open}
          initial={null}
          onClose={() => setOpen(false)}
          onSubmit={() => {}}
          submitting={false}
          suggestedRoomNumber={117}
        />
      ) : null}
    </div>
  );
}

// ── 16.01 Notifications ──────────────────────────────────────────

function sampleNotifications(): Notification[] {
  const today = new Date();
  const at = (daysAgo: number, h: number, m: number) => {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - daysAgo, h, m);
    return d.toISOString();
  };
  const n = (
    id: string,
    event: Notification["event"],
    type: Notification["type"],
    title: string,
    body: string,
    created_at: string,
    read = false,
    severity: Notification["severity"] = "info",
  ): Notification => ({
    id,
    type,
    event,
    severity,
    title,
    body,
    link: null,
    read,
    entity_type: null,
    entity_id: null,
    meta: {},
    created_at,
  });
  return [
    n("1", "booking.created", "booking", "New booking request", "Omar Farooq asked to book Room 15 · arrives 15 Dec", at(0, 10, 42)),
    n("2", "payment.received", "payment", "Payment received", "Fatima Noor paid Rs 4,500 · JazzCash", at(0, 10, 42)),
    n("3", "request.created", "booking", "Guest request", "Usama Iqbal wants to extend his stay to 28 Feb", at(0, 10, 20)),
    n("4", "maintenance.created", "maintenance", "Urgent maintenance", "AC not cooling in Room 16 · room taken offline", at(0, 9, 30), false, "urgent"),
    n("5", "rent.reminders_sent", "system", "Rent reminders sent", "11 residents emailed about November rent", at(1, 10, 0), true),
    n("6", "review.created", "review", "New review", "Sara Malik left 5★ — waiting for approval", at(1, 18, 15)),
    n("7", "contact.created", "contact", "New message", "Ali Hamza asked about a single room", at(1, 16, 2)),
    n("8", "booking.checked_out", "booking", "Resident checked out", "Bilal Hassan left Room 3 · Bed 4 · deposit returned", at(9, 12, 0), true),
    n("9", "deposit.returned", "payment", "Deposit returned", "Rs 10,000 to Bilal Hassan · cash", at(9, 11, 0), true),
  ];
}

export function NotificationsPreview({ panel }: { panel?: boolean }) {
  const [category, setCategory] = useState<NotificationCategory>("all");
  const actions = useNotificationActions();
  const items = sampleNotifications();
  if (panel) {
    return (
      <div className="flex justify-end p-6">
        <div className="glass-3 flex w-[360px] flex-col gap-1 rounded-[20px] p-3 font-geist text-ink">
          <NotificationsPanelBody
            items={items.slice(0, 3).map((x, i) => ({
              ...x,
              created_at: new Date(Date.now() - [2, 18, 60][i] * 60_000).toISOString(),
            }))}
            unread={3}
            onMarkAll={() => {}}
            onOpenItem={() => {}}
          />
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col p-6">
      <PageHeader
        className="lg:items-center"
        title="Notifications"
        subtitle="Everything that happened · bookings, payments, requests and alerts"
        actions={
          <>
            <NotificationFilterTabs
              value={category}
              onChange={setCategory}
              counts={{ all: 24, unread: 6, payments: 8, bookings: 5, alerts: 3 }}
            />
            <GlassButton variant="glass">
              <Check aria-hidden /> Mark all read
            </GlassButton>
            <span className="glass-2 inline-flex size-10 items-center justify-center rounded-[12px] text-ink [&_svg]:size-[18px]">
              <Settings aria-hidden />
            </span>
          </>
        }
      />
      <div className="flex flex-col gap-5">
        {groupNotificationsByDay(items).map((g) => (
          <NotificationGroup key={g.day} label={g.label} items={g.items} actions={actions} />
        ))}
      </div>
    </div>
  );
}

// ── 06 Bookings ─────────────────────────────────────────────────

function sampleBookings(): Booking[] {
  const t = new Date();
  const k = (days: number) => {
    const d = new Date(t.getFullYear(), t.getMonth(), t.getDate() + days);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };
  const base = {
    hostel_id: null, room_id: "r", user_id: null, guest_email: "", seats_booked: 1, months: 1,
    price_per_seat: 4500, total_amount: 0, source: "walk_in", notes: null, created_at: null, updated_at: null,
    currency: "pkr" as const, security_amount: 10000, rent_unit: "month" as const, rent_amount: 4500,
  };
  const b = (o: Partial<Booking> & { id: string; guest_name: string; status: Booking["status"] }): Booking =>
    ({ ...base, guest_phone: "+92 300 5550131", guest_guardian_contact: "+92 300 5550100", move_in: k(-10), check_out: k(20), ...o }) as Booking;
  return [
    b({ id: "1", guest_name: "Ahmed Khan", status: "checked_in", display_status: "checked_in", booking_code: "BK-2026-0143", guest_gender: "male", resident_type: "employee", guest_company: "Systems Ltd", room_number: 15, room_name: "Private single", room_floor: 1, move_in: k(0), check_out: k(30), paid_total: 26500, balance_due: 0, next_due_date: k(30), next_due_amount: 16500, rent_amount: 16500, returning_guest: true }),
    b({ id: "2", guest_name: "Alex Rivera", seats_booked: 2, status: "checked_in", display_status: "checking_out_today", booking_code: "BK-2026-0142", guest_gender: "male", resident_type: "other", room_number: 14, room_name: "Private double", room_floor: 3, move_in: k(-3), check_out: k(0), paid_total: 24000, balance_due: 0, rent_unit: "night", rent_amount: 8000, source: "website" }),
    b({ id: "3", guest_name: "Omar Farooq", status: "confirmed", display_status: "reserved", booking_code: "BK-2026-0141", guest_gender: "male", resident_type: "student", guest_institution: "FAST", room_number: 1, room_name: "6-bed dorm", room_floor: 1, seat_label: "5", move_in: k(0), check_out: k(30), paid_total: 0, balance_due: 14500, next_due_date: k(0), next_due_amount: 14500, due_on_arrival: true, id_pending: true, expected_arrival_time: "18:00", source: "phone" }),
    b({ id: "4", guest_name: "Maya Chen", status: "checked_in", display_status: "checking_out_today", booking_code: "BK-2026-0139", guest_gender: "female", resident_type: "other", room_number: 1, room_name: "6-bed dorm", room_floor: 1, seat_label: "6", move_in: k(-30), check_out: k(0), paid_total: 14500, balance_due: 0, source: "website" }),
    b({ id: "5", guest_name: "Hina Raza", status: "checked_in", display_status: "checked_in", booking_code: "BK-2026-0137", guest_gender: "female", resident_type: "student", guest_institution: "UET", room_number: 1, room_name: "6-bed dorm", room_floor: 1, seat_label: "4", move_in: k(-6), check_out: k(23), paid_total: 0, balance_due: 14500, next_due_date: k(-6), next_due_amount: 14500, overdue: true }),
    b({ id: "6", guest_name: "Daniel Okafor", status: "checked_in", display_status: "checked_in", booking_code: "BK-2026-0135", guest_gender: "male", resident_type: "employee", guest_company: "Careem", room_number: 1, room_name: "6-bed dorm", room_floor: 1, seat_label: "3", move_in: k(-16), check_out: k(12), paid_total: 7000, balance_due: 7500, next_due_date: k(-16), next_due_amount: 7500, overdue: true, source: "website" }),
    b({ id: "7", guest_name: "Zara Sheikh", status: "checked_out", display_status: "checked_out", booking_code: "BK-2026-0120", guest_gender: "female", resident_type: "student", guest_institution: "NUST", room_number: 7, room_name: "Private double", room_floor: 2, move_in: k(-48), check_out: k(-18), paid_total: 26000, balance_due: 0, security_amount: 0, rent_amount: 13000 }),
    b({ id: "8", guest_name: "Usman Tariq", status: "cancelled", display_status: "cancelled", booking_code: "BK-2026-0117", guest_gender: "male", resident_type: "employee", room_number: 13, room_name: "Private single", room_floor: 3, move_in: k(-4), paid_total: 0, balance_due: 0, no_charge: true, security_amount: 0, rent_amount: 9000, source: "phone" }),
  ];
}

export function BookingsPreview({ layout }: { layout: "table" | "cards" }) {
  const items = sampleBookings();
  const [selected, setSelected] = useState<Set<string>>(new Set(["4", "5", "6"]));
  const toggle = (id: string, on: boolean) =>
    setSelected((p) => {
      const n = new Set(p);
      if (on) n.add(id);
      else n.delete(id);
      return n;
    });
  const menu = (_b: Booking, trigger: React.ReactNode) => trigger;
  return (
    <div className="flex flex-col gap-[18px] p-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard tone="success" icon={<Users />} label="Active" value={8} context="5 in-house · 2 leaving · 1 arriving" onClick={() => {}} />
        <KpiCard icon={<ArrowRightToLine />} label="Arrivals today" value={1} context="Omar Farooq · 18:00" onClick={() => {}} />
        <KpiCard icon={<DoorOpen />} label="Departures today" value={2} context="Alex Rivera · Maya Chen" onClick={() => {}} />
        <KpiCard tone="danger" icon={<Banknote />} label="Outstanding" value="Rs 36,500" valueClassName="text-danger" context="3 bookings" onClick={() => {}} />
      </div>
      {layout === "table" ? (
        <BookingsTable
          bookings={items}
          columns={visibleColumns(DEFAULT_COLUMN_STATE)}
          density="comfortable"
          selected={selected}
          onToggle={toggle}
          onToggleAll={() => {}}
          sort="move_in"
          order="desc"
          onSort={() => {}}
          onOpen={() => {}}
          onCheckIn={() => {}}
          renderMenu={menu}
          footer={
            <div className="flex items-center gap-2.5 border-t border-glass-divider px-4 py-3">
              <p className="flex-1 text-label font-medium text-ink-2">
                Showing 1–8 of 8 · Outstanding total Rs 36,500 (sum of Balance)
              </p>
            </div>
          }
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {items.map((x) => (
            <BookingCard
              key={x.id}
              booking={x}
              selected={selected.has(x.id)}
              selecting={selected.size > 0}
              onToggle={(on) => toggle(x.id, on)}
              onOpen={() => {}}
              onAction={() => {}}
              renderMenu={(t) => t}
            />
          ))}
        </div>
      )}
    </div>
  );
}
