import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { RichTextView } from "@/components/glass/rich-text-view";
import { useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  BedSingle,
  CalendarDays,
  ChevronLeft,
  LogOut,
  Pencil,
  Sparkles,
  Trash2,
  TrendingUp,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import { AmenityChip, GlassButton, GlassIconButton, InfoPill, StatusChip, Tag } from "@/components/glass";
import { RoomFormDialog } from "@/components/admin/room-form-dialog";
import { RoomThumbnail } from "@/components/admin/room-thumbnail";
import { RoomPhotoModal } from "@/components/admin/rooms/room-photo-modal";
import { DeleteRoomDialog } from "@/components/admin/rooms/delete-room-dialog";
import { ROOM_STATUS_LABEL, ROOM_STATUS_TONE, formatUsd, roomTitle } from "@/components/admin/rooms/room-card";
import {
  BedPopover,
  BedTile,
  CheckoutFlow,
  GuestRow,
  MoveBedDialog,
  OccupancyRing,
  PAYMENT_TAG,
  dayMonth,
  initials,
  weekdayDayMonth,
} from "@/components/admin/rooms/room-beds";
import { WalkInModal } from "@/components/admin/walk-in/walk-in-modal";
import { useRoomQuery, useUpdateRoomMutation, useDeleteRoomMutation } from "@/queries/rooms";
import { useRoomBedsQuery } from "@/queries/rooms/useRoomBeds";
import { roomKeys } from "@/queries/keys/room.keys";
import { patchRoomOpsApi } from "@/api/rooms/roomBeds.api";
import { useAuthStore } from "@/stores/auth/auth.store";
import { useHostelScope } from "@/lib/use-hostel-scope";
import { cn } from "@/lib/utils";
import type { RoomDraft } from "@/types/domain/room.types";
import type { BedBooking, RoomBeds } from "@/types/domain/room-beds.types";

export const Route = createFileRoute("/admin/rooms/$id")({ component: RoomDetailPage });

/**
 * Figma 05 · Room detail variants (05.01 private occupied, 05.03 private vacant,
 * 05.05 dorm, 05.07 bed popover, 05.10 after walk-in; mobile 05.13–05.16).
 * Beds / guests / occupancy come from GET /rooms/:id/beds.
 */

const SOURCE_LABEL: Record<string, string> = { walk_in: "Walk-in", website: "Website", phone: "Phone" };
const capital = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

function nightsBetween(a: string | null, b: string | null) {
  if (!a || !b) return 0;
  const [y1, m1, d1] = a.split("-").map(Number);
  const [y2, m2, d2] = b.split("-").map(Number);
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86_400_000);
}

function RoomDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const token = useAuthStore((s) => s.token);
  const { activeHostel } = useHostelScope();
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [walkIn, setWalkIn] = useState<{ open: boolean; beds?: number[] }>({ open: false });
  const [moveFor, setMoveFor] = useState<BedBooking | null>(null);
  const [checkoutId, setCheckoutId] = useState<string | null>(null);

  const { data: room, isLoading, isError, error } = useRoomQuery(id);
  const { data: beds } = useRoomBedsQuery(id);
  const updateRoom = useUpdateRoomMutation();
  const deleteRoom = useDeleteRoomMutation();

  function handleUpdate(values: RoomDraft) {
    updateRoom.mutate(
      { id, draft: values },
      {
        onSuccess: () => {
          toast.success("Room updated");
          setEditing(false);
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : "Update failed"),
      },
    );
  }

  function handleDelete() {
    deleteRoom.mutate(id, {
      onSuccess: () => {
        toast.success("Room deleted");
        navigate({ to: "/admin/rooms" });
      },
      onError: (e) => toast.error(e instanceof Error ? e.message : "Delete failed"),
    });
  }

  async function housekeeping(next: "needs_cleaning" | "ready") {
    if (!token) return;
    try {
      await patchRoomOpsApi(
        token,
        id,
        next === "ready" ? { last_cleaned_at: new Date().toISOString(), housekeeping_status: "ready" } : { housekeeping_status: "needs_cleaning" },
      );
      toast.success(next === "ready" ? "Marked clean · ready for check-in" : "Marked for cleaning");
      void queryClient.invalidateQueries({ queryKey: roomKeys.all });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update the room");
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-5" aria-busy>
        <div className="h-10" />
        <div className="glass-1 h-[428px] animate-pulse rounded-[24px]" />
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="glass-1 h-80 animate-pulse rounded-[20px]" />
          <div className="glass-1 h-80 animate-pulse rounded-[20px]" />
        </div>
      </div>
    );
  }

  if (isError || !room) {
    return (
      <div className="flex flex-col gap-5">
        <BackRow />
        <div className="glass-1 rounded-[20px] py-16 text-center text-body text-danger">
          {error instanceof Error ? error.message : "Room not found."}
        </div>
      </div>
    );
  }

  const images = room.images ?? [];
  const kind = beds?.kind ?? (/dorm/i.test(`${room.category} ${room.title}`) ? "dorm" : "private");
  const isDorm = kind === "dorm";
  const current = beds?.current_booking ?? null;
  const occupiedNow = Boolean(current && current.status === "checked_in");
  const summary = beds?.summary;
  const freeNow = summary?.free ?? room.beds_available;
  const leaving = beds?.leaving_today ?? [];
  const closed = room.status === "maintenance" || room.status === "draft";
  const roomLabel = room.room_number != null ? `Room ${room.room_number}` : room.title;
  const checkOutTime = beds?.check_out_time ?? activeHostel?.check_out_time ?? "11:00";
  const ready = (beds?.housekeeping_status ?? room.housekeeping_status ?? "ready") === "ready";
  const lastCleaned = room.last_cleaned_at ? new Date(room.last_cleaned_at) : null;
  const cleanedToday = lastCleaned ? lastCleaned.toDateString() === new Date().toDateString() : false;
  const lastCleanedLabel = lastCleaned
    ? cleanedToday
      ? `Today ${lastCleaned.toTimeString().slice(0, 5)}`
      : `${lastCleaned.toLocaleDateString("en-GB", { weekday: "short" })} ${lastCleaned.getDate()} ${lastCleaned.toLocaleDateString("en-GB", { month: "short" })}`
    : "Not recorded";

  const walkInLabel = isDorm
    ? freeNow > 0
      ? `Walk-in · ${freeNow} bed${freeNow === 1 ? "" : "s"} free`
      : leaving.length
        ? `Walk-in · ${leaving.length} bed${leaving.length === 1 ? "" : "s"} from ${checkOutTime}`
        : "Walk-in"
    : "Walk-in booking";
  const walkInDisabled = closed || (isDorm ? freeNow === 0 && leaving.length === 0 : Boolean(current));
  const walkInNote = closed
    ? `Walk-in unavailable · room is ${room.status === "maintenance" ? "in maintenance" : "not listed yet"}`
    : !isDorm && current
      ? current.status === "checked_in"
        ? `Walk-in unavailable · occupied until ${weekdayDayMonth(current.check_out).replace(",", "")}`
        : `Walk-in unavailable · reserved for ${current.guest_name}`
      : null;
  const openWalkIn = (presetBeds?: number[]) => setWalkIn({ open: true, beds: presetBeds });

  const subtitle = [
    room.room_number != null ? `No. ${room.room_number}` : null,
    room.floor != null ? (room.floor === 0 ? "Ground floor" : `Floor ${room.floor}`) : null,
    isDorm ? `${capital(beds?.gender_policy ?? room.gender_policy ?? "mixed")} dorm` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const justCheckedIn = current?.checked_in_at ? Date.now() - new Date(current.checked_in_at).getTime() < 15 * 60_000 : false;

  const heroStatus = isDorm ? (
    leaving.length ? (
      <>
        <Tag tone="warning" showDot>
          {leaving.length} bed{leaving.length === 1 ? "" : "s"} free{leaving.length === 1 ? "s" : ""} at {checkOutTime}
        </Tag>
        <span className="text-label font-medium text-ink-2">
          {leaving[0].guest_name} checks out of {leaving[0].bed} today
        </span>
      </>
    ) : freeNow > 0 ? (
      <Tag tone="success" showDot>
        {freeNow} bed{freeNow === 1 ? "" : "s"} free tonight
      </Tag>
    ) : (
      <Tag tone="brand" showDot>
        Full tonight
      </Tag>
    )
  ) : current ? (
    <>
      <span className="flex size-9 items-center justify-center rounded-full bg-brand-tint text-label font-medium text-brand-text">
        {initials(current.guest_name)}
      </span>
      <span className="text-body font-semibold text-ink">{current.guest_name}</span>
      <Tag tone="brand" showDot>
        {current.status !== "checked_in"
          ? `Arriving ${current.move_in === beds?.today ? `today ${current.expected_arrival_time ?? current.check_in_time}` : dayMonth(current.move_in)}`
          : justCheckedIn
            ? "Checked in just now"
            : "Booked tonight"}
      </Tag>
    </>
  ) : ready ? (
    <>
      <Tag tone="success" showDot>
        Ready for check-in
      </Tag>
      <span className="text-label font-medium text-ink-2">{cleanedToday ? "Inspected · ready now" : "Ready now"}</span>
    </>
  ) : (
    <>
      <Tag tone="warning" showDot>
        Needs cleaning
      </Tag>
      <span className="text-label font-medium text-ink-2">Mark it clean when housekeeping is done</span>
    </>
  );

  return (
    <div className={cn("flex flex-col gap-5", "max-md:pb-24")}>
      <h1 className="sr-only">{roomTitle(room)}</h1>
      <BackRow
        actions={
          <>
            <GlassButton variant="glass" className="max-md:hidden" onClick={() => setEditing(true)}>
              <Pencil /> Edit
            </GlassButton>
            <GlassButton variant="glass" className="border-danger! bg-danger-tint! text-danger max-md:hidden" onClick={() => setConfirmDelete(true)}>
              <Trash2 /> Delete
            </GlassButton>
            <GlassIconButton aria-label="Edit room" className="md:hidden" onClick={() => setEditing(true)}>
              <Pencil />
            </GlassIconButton>
            <GlassIconButton aria-label="Delete room" variant="danger" className="md:hidden" onClick={() => setConfirmDelete(true)}>
              <Trash2 />
            </GlassIconButton>
          </>
        }
      />

      {/* Hero */}
      <section className="glass-1 overflow-hidden rounded-[24px]">
        <div className="relative h-[180px] w-full overflow-hidden bg-glass-inset md:h-[240px]">
          <button
            type="button"
            className="absolute inset-0 cursor-zoom-in outline-none focus-visible:ring-2 focus-visible:ring-brand-border focus-visible:ring-inset"
            onClick={() => images.length && setLightbox(0)}
            aria-label={images.length ? "View cover photo" : "No photos yet"}
            disabled={!images.length}
          >
            <RoomThumbnail src={images[0]} className="absolute inset-0" iconClassName="size-16" />
          </button>
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[90px] bg-gradient-to-b from-[#0f172a3d] to-transparent" />
          <StatusChip tone={ROOM_STATUS_TONE[room.status]} className="absolute top-4 right-4">
            {ROOM_STATUS_LABEL[room.status]}
          </StatusChip>
          {images.length > 1 ? (
            // Thumbnails open the photo in a small viewer (the hero keeps the cover).
            <div className="glass-3 absolute right-4 bottom-4 flex gap-1.5 rounded-[16px] p-1.5">
              {images.slice(0, 3).map((src, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setLightbox(i)}
                  aria-label={`View photo ${i + 1}`}
                  className="size-11 cursor-pointer overflow-hidden rounded-[10px] outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-brand-border md:size-14"
                >
                  <RoomThumbnail src={src} iconClassName="size-5" />
                </button>
              ))}
              {images.length > 3 ? (
                <button
                  type="button"
                  onClick={() => setLightbox(3)}
                  aria-label={`View ${images.length - 3} more photos`}
                  className="flex size-11 cursor-pointer items-center justify-center rounded-[10px] bg-glass-inset text-body font-semibold text-ink outline-none hover:bg-glass-2 focus-visible:ring-2 focus-visible:ring-brand-border md:size-14"
                >
                  +{images.length - 3}
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
        <div className="flex flex-col gap-3.5 p-5 md:p-6">
          <div className="flex flex-col gap-1">
            <p className="text-hero text-ink md:text-page-title">{roomTitle(room)}</p>
            <p className="text-body text-ink-2">{subtitle}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">{heroStatus}</div>
          <div className="flex flex-wrap gap-2">
            <InfoPill>{formatUsd(room.price_per_night_usd ?? room.price_per_night)} / seat / month</InfoPill>
            <InfoPill>PKR {Number(room.price_per_night_pkr ?? 0).toLocaleString("en-US")}</InfoPill>
            <InfoPill>Capacity {room.capacity}</InfoPill>
            {room.badge ? <InfoPill>{room.badge}</InfoPill> : null}
          </div>
        </div>
      </section>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Left column */}
        <div className="flex min-w-0 flex-col gap-5">
          {isDorm ? (
            <>
              <Card
                eyebrow="Beds"
                title={
                  summary
                    ? `${summary.taken} of ${summary.total} beds taken${leaving.length ? ` · ${leaving.length} free${leaving.length === 1 ? "s" : ""} at ${checkOutTime}` : ""}`
                    : "Loading beds…"
                }
                actions={
                  <GlassButton variant="glass" size="sm" disabled={walkInDisabled} onClick={() => openWalkIn()}>
                    <UserPlus /> Walk-in
                  </GlassButton>
                }
              >
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {(beds?.beds ?? []).map((bed) => (
                    <BedTile
                      key={bed.number}
                      bed={bed}
                      onAssign={() => openWalkIn([bed.number])}
                      popover={
                        bed.booking ? (
                          <BedPopover
                            booking={bed.booking}
                            roomLabel={roomLabel}
                            onMove={() => setMoveFor(bed.booking)}
                            onCheckout={() => setCheckoutId(bed.booking!.id)}
                          />
                        ) : undefined
                      }
                    />
                  ))}
                </div>
                {summary ? (
                  <div className="flex flex-wrap gap-2">
                    <Tag tone="brand" showDot>Occupied · {summary.occupied}</Tag>
                    <Tag tone="brand" showDot className="border-brand-text">Reserved · {summary.reserved}</Tag>
                    <Tag tone="warning" showDot>Checking out · {summary.checking_out}</Tag>
                    <Tag tone="success" showDot>Free · {summary.free}</Tag>
                    <Tag tone="neutral" showDot>Out of service · {summary.out_of_service}</Tag>
                  </div>
                ) : null}
              </Card>

              <Card eyebrow="Guests in this room" actions={<span className="text-label font-medium text-ink-2">Sorted by check-out</span>}>
                {beds && beds.guests.length ? (
                  <div className="grid gap-2.5 md:grid-cols-2">
                    {beds.guests.map((g) => (
                      <GuestRow key={g.id} booking={g} todayKey={beds.today} />
                    ))}
                  </div>
                ) : (
                  <p className="text-body text-ink-3">No one is staying in this room tonight.</p>
                )}
              </Card>
            </>
          ) : current ? (
            <CurrentStay booking={current} capacity={room.capacity} checkOutTime={checkOutTime} today={beds?.today ?? ""} />
          ) : (
            <Card eyebrow="Current stay">
              <div className="flex flex-col items-center gap-2 rounded-[16px] border border-dashed border-glass-stroke bg-glass-inset px-6 py-8 text-center">
                <span className="flex size-10 items-center justify-center rounded-[12px] bg-brand-tint text-brand-text [&_svg]:size-[18px]">
                  <BedSingle aria-hidden />
                </span>
                <p className="text-body font-semibold text-ink">{ready ? "Room is ready for check-in" : "Room needs cleaning"}</p>
                <p className="max-w-[460px] text-label text-ink-2">
                  {ready
                    ? "Cleaned and inspected. Register a guest who is at the desk now, or hold the room for a later arrival."
                    : "Housekeeping hasn’t signed this room off yet. Mark it clean when it’s ready."}
                </p>
              </div>
            </Card>
          )}

          {!isDorm ? <AboutCard description={room.description} descriptionHtml={room.description_html} amenities={room.amenities} /> : null}
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-5">
          <section className="glass-1 flex flex-col gap-3 rounded-[20px] p-4">
            <header className="flex items-center justify-between">
              <h2 className="text-eyebrow text-ink-2 uppercase">Details</h2>
              <GlassIconButton aria-label="Edit room" size="sm" variant="ghost" onClick={() => setEditing(true)}>
                <Pencil />
              </GlassIconButton>
            </header>
            <dl className="grid grid-cols-3 gap-x-2.5 gap-y-3 font-medium">
              <DetailCell label="Category" value={room.category} />
              <DetailCell label="Floor" value={room.floor != null ? String(room.floor) : "—"} />
              <DetailCell label="Beds" value={`${freeNow} free / ${summary?.total ?? room.beds_total}`} />
              {isDorm ? (
                <DetailCell label="Gender policy" value={capital(beds?.gender_policy ?? room.gender_policy ?? "mixed")} />
              ) : (
                <DetailCell label="Last cleaned" value={lastCleanedLabel} muted={!lastCleaned} />
              )}
              <DetailCell label="Display order" value={String(room.display_order ?? 100)} muted />
              <DetailCell label="Badge" value={room.badge ?? "None"} muted />
            </dl>
          </section>

          <section className="glass-1 flex flex-col gap-2 rounded-[20px] p-4 max-md:hidden">
            <h2 className="text-eyebrow text-ink-2 uppercase">Quick actions</h2>
            {!isDorm && occupiedNow && current ? (
              <>
                <GlassButton variant="glass" className="h-11 w-full" asChild>
                  <Link to="/admin/bookings/$id" params={{ id: current.id }} search={{ edit: true }}>
                    <CalendarDays /> Extend stay
                  </Link>
                </GlassButton>
                <GlassButton variant="glass" className="h-11 w-full" onClick={() => setCheckoutId(current.id)}>
                  <LogOut /> Check out
                </GlassButton>
              </>
            ) : null}
            <GlassButton className="h-11 w-full disabled:opacity-40" disabled={walkInDisabled} onClick={() => openWalkIn()}>
              <UserPlus /> {walkInLabel}
            </GlassButton>
            {(isDorm || !current) && !closed ? (
              <GlassButton variant="glass" className="h-11 w-full" onClick={() => openWalkIn()}>
                <CalendarDays /> {isDorm ? "Reserve a bed" : "Reserve for later"}
              </GlassButton>
            ) : null}
            {!isDorm && !current ? (
              <GlassButton variant="ghost" className="h-10 w-full" onClick={() => void housekeeping(ready ? "needs_cleaning" : "ready")}>
                {ready ? <TrendingUp /> : <Sparkles />} {ready ? "Mark for cleaning" : "Mark as clean"}
              </GlassButton>
            ) : null}
            {walkInNote ? <p className="text-label font-medium text-ink-3">{walkInNote}</p> : null}
          </section>

          {isDorm && beds ? (
            <section className="glass-1 flex flex-col gap-3.5 rounded-[20px] p-5">
              <h2 className="text-eyebrow text-ink-2 uppercase">Occupancy</h2>
              <div className="flex items-center gap-4 max-md:hidden">
                <OccupancyRing taken={beds.summary.taken} total={beds.summary.total} />
                <div className="flex min-w-0 flex-1 flex-col gap-2.5 whitespace-nowrap">
                  <Stat label="Next free bed" value={beds.next_free ? `${beds.next_free.label} · ${beds.next_free.date === beds.today ? beds.next_free.time : dayMonth(beds.next_free.date)}` : beds.summary.free ? "Free now" : "—"} />
                  <Stat label="Avg. stay" value={beds.stats.avg_stay_nights != null ? `${beds.stats.avg_stay_nights} nights` : "—"} />
                  <Stat label="This month" value={`${beds.stats.month_occupancy_pct}% occupied`} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 md:hidden">
                {[
                  ["Taken", `${beds.summary.taken} / ${beds.summary.total}`],
                  ["Next free", beds.next_free ? `${beds.next_free.label} · ${beds.next_free.date === beds.today ? beds.next_free.time : dayMonth(beds.next_free.date)}` : "—"],
                  ["Avg. stay", beds.stats.avg_stay_nights != null ? `${beds.stats.avg_stay_nights} nights` : "—"],
                ].map(([l, v]) => (
                  <div key={l} className="flex flex-col gap-0.5 rounded-[12px] border border-glass-divider bg-glass-inset px-3 py-2">
                    <span className="text-label text-ink-2">{l}</span>
                    <span className="truncate text-body font-semibold text-ink">{v}</span>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {isDorm ? <AboutCard description={room.description} descriptionHtml={room.description_html} amenities={room.amenities} /> : null}
        </div>
      </div>

      {/* Mobile sticky action bar (Figma 05.13–05.15) */}
      <div className="glass-3 fixed inset-x-4 bottom-[calc(88px+env(safe-area-inset-bottom))] z-30 flex gap-2 rounded-[20px] p-2 md:hidden">
        {!isDorm && occupiedNow && current ? (
          <>
            <GlassButton variant="glass" className="flex-1" asChild>
              <Link to="/admin/bookings/$id" params={{ id: current.id }} search={{ edit: true }}>
                <CalendarDays /> Extend stay
              </Link>
            </GlassButton>
            <GlassButton className="flex-1" onClick={() => setCheckoutId(current.id)}>
              <LogOut /> Check out
            </GlassButton>
          </>
        ) : (
          <>
            <GlassButton className="flex-1 disabled:opacity-40" disabled={walkInDisabled} onClick={() => openWalkIn()}>
              <UserPlus /> {walkInLabel}
            </GlassButton>
            {!closed ? (
              <GlassIconButton aria-label={isDorm ? "Reserve a bed" : "Reserve for later"} onClick={() => openWalkIn()}>
                <CalendarDays />
              </GlassIconButton>
            ) : null}
          </>
        )}
      </div>

      <WalkInModal open={walkIn.open} onOpenChange={(o) => setWalkIn((w) => ({ ...w, open: o }))} room={room} presetBeds={walkIn.beds} />
      <MoveBedDialog open={moveFor != null} onOpenChange={(o) => !o && setMoveFor(null)} booking={moveFor} beds={beds?.beds ?? []} />
      <CheckoutFlow bookingId={checkoutId} onDone={() => setCheckoutId(null)} />

      <RoomFormDialog open={editing} initial={room} onClose={() => setEditing(false)} onSubmit={handleUpdate} submitting={updateRoom.isPending} />

      <DeleteRoomDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete this room?"
        subtitle={roomTitle(room)}
        hostelName={activeHostel?.name ?? room.hostel_name}
        occupants={room.occupants ?? []}
        pending={deleteRoom.isPending}
        onConfirm={handleDelete}
      />

      <RoomPhotoModal
        images={images}
        index={lightbox}
        title={roomTitle(room)}
        onIndexChange={setLightbox}
        onClose={() => setLightbox(null)}
      />
    </div>
  );
}

function CurrentStay({ booking, capacity, checkOutTime, today }: { booking: BedBooking; capacity: number; checkOutTime: string; today: string }) {
  const pay = PAYMENT_TAG[booking.payment_state];
  const total = Math.max(1, nightsBetween(booking.move_in, booking.check_out));
  const left = Math.max(0, nightsBetween(today, booking.check_out));
  const elapsed = Math.min(1, Math.max(0, nightsBetween(booking.move_in, today) / total));
  const others = Math.max(0, booking.seats_booked - 1);
  const leavesLabel = left === 0 ? `leaves ${checkOutTime}` : `leaves ${weekdayDayMonth(booking.check_out).replace(/^\w+, /, "")}`;
  return (
    <Card
      eyebrow="Current stay"
      actions={
        <div className="flex gap-1.5">
          <Tag tone={pay.tone} showDot>{pay.label}</Tag>
          {booking.source ? <Tag tone="brand" showDot>{SOURCE_LABEL[booking.source] ?? capital(booking.source.replace(/_/g, " "))}</Tag> : null}
        </div>
      }
    >
      <div className="flex items-center gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-tint text-label font-medium text-brand-text">
          {initials(booking.guest_name)}
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-body font-semibold text-ink">{booking.guest_name}</span>
          <span className="truncate text-label font-medium text-ink-2">
            Lead guest{others ? ` · +${others} guest${others === 1 ? "" : "s"}` : " · 1 guest"}
          </span>
        </div>
        <Link
          to="/admin/bookings/$id"
          params={{ id: booking.id }}
          className="shrink-0 rounded-sm text-body font-semibold text-brand-text underline underline-offset-2 outline-none focus-visible:ring-2 focus-visible:ring-brand-border"
        >
          View booking →
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatBox label="Check-in" value={`${weekdayDayMonth(booking.move_in)} · ${booking.check_in_time}`} />
        <StatBox label="Check-out" value={`${weekdayDayMonth(booking.check_out)} · ${checkOutTime}`} />
        <StatBox label="Nights left" value={left === 0 ? "0 · leaves today" : String(left)} />
        <StatBox label="Guests" value={`${booking.seats_booked} of ${capacity}`} />
      </div>
      {booking.status === "checked_in" ? (
        <div className="flex flex-col gap-2.5 pt-1">
          <div className="flex items-center justify-between gap-3 whitespace-nowrap">
            <span className="text-eyebrow text-ink-2 uppercase">Stay timeline</span>
            <span className="text-label font-medium text-brand-text">
              {left} night{left === 1 ? "" : "s"} left · {leavesLabel}
            </span>
          </div>
          <div className="relative h-2 w-full rounded-[8px] bg-glass-inset">
            <div className="dash-fill h-2 rounded-[8px] bg-brand" style={{ width: `${elapsed * 100}%` }} />
            <span
              aria-hidden
              className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[2.5px] border-brand bg-glass-3"
              style={{ left: `${elapsed * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-label font-medium text-ink-2">
            <span>{weekdayDayMonth(booking.move_in).replace(",", "")} · in</span>
            <span>{weekdayDayMonth(booking.check_out).replace(",", "")} · out</span>
          </div>
        </div>
      ) : null}
    </Card>
  );
}

function AboutCard({
  description,
  descriptionHtml,
  amenities,
}: {
  description?: string | null;
  descriptionHtml?: string | null;
  amenities?: string[];
}) {
  return (
    <Card eyebrow="About this room">
      {description?.trim() ? (
        <RichTextView html={descriptionHtml} text={description} />
      ) : (
        <p className="text-body text-ink-3">No description yet.</p>
      )}
      {amenities?.length ? (
        <div className="flex flex-wrap gap-2">
          {amenities.map((a) => (
            <AmenityChip key={a} selected tabIndex={-1} className="pointer-events-none">
              {a}
            </AmenityChip>
          ))}
        </div>
      ) : null}
    </Card>
  );
}

function Card({ eyebrow, title, actions, children }: { eyebrow: string; title?: ReactNode; actions?: ReactNode; children: ReactNode }) {
  return (
    <section className="glass-1 flex flex-col gap-3.5 rounded-[20px] p-5">
      <header className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <h2 className="text-eyebrow text-ink-2 uppercase">{eyebrow}</h2>
          {title ? <p className="truncate text-body font-semibold text-ink">{title}</p> : null}
        </div>
        {actions}
      </header>
      {children}
    </section>
  );
}

function StatBox({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1 rounded-[14px] border border-glass-divider bg-glass-inset px-3 py-2.5">
      <span className="text-label text-ink-2">{label}</span>
      <span className="truncate text-body font-semibold text-ink">{value}</span>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-label font-medium text-ink-3">{label}</span>
      <span className="text-body font-semibold text-ink">{value}</span>
    </div>
  );
}

function BackRow({ actions }: { actions?: ReactNode }) {
  return (
    <div className="flex min-h-10 flex-wrap items-center justify-between gap-3 pt-2 md:pt-0">
      <Link
        to="/admin/rooms"
        className="glass-2 inline-flex items-center gap-1.5 rounded-[12px] py-1.5 pr-3 pl-2 text-body font-medium text-ink-2 outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-brand-border md:-ml-1.5 md:bg-transparent md:shadow-none md:[border:none]"
      >
        <ChevronLeft className="size-[18px]" /> Rooms
      </Link>
      {actions ? <div className="flex items-center gap-2.5">{actions}</div> : null}
    </div>
  );
}

function DetailCell({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <dt className="text-label text-ink-3">{label}</dt>
      <dd className={cn("truncate text-body", muted ? "text-ink-2" : "text-ink")}>{value}</dd>
    </div>
  );
}

