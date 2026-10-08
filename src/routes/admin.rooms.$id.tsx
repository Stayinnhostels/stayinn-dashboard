import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, BedDouble, FileText, Loader2, Pencil, Save, Trash2, UserPlus, Wallet, Users } from "lucide-react";
import { toast } from "sonner";
import { ManualMemberDialog } from "@/components/admin/manual-member-dialog";
import { RoomDetailSkeleton } from "@/components/admin/rooms-page-skeletons";
import { RoomFormDialog } from "@/components/admin/room-form-dialog";
import { RoomThumbnail } from "@/components/admin/room-thumbnail";
import { RoomStatusPicker } from "@/components/admin/room-status-picker";
import { HostelPropertyBadge } from "@/components/admin/hostel-property-badge";
import { useBookingsQuery } from "@/queries/bookings";
import { useRoomQuery, useUpdateRoomMutation, useDeleteRoomMutation } from "@/queries/rooms";
import { formatMoney, normalizeMoneyCurrency } from "@/lib/payments";
import { HintTooltip } from "@/components/ui/hint-tooltip";
import {
  ROOM_AMENITY_OPTIONS,
  formatRoomLabel,
  type RoomDraft,
  type RoomStatus,
} from "@/types/domain/room.types";

export const Route = createFileRoute("/admin/rooms/$id")({ component: RoomDetailPage });

function parsePositiveInt(value: string, fallback = 0) {
  const n = Number.parseInt(value.trim(), 10);
  return Number.isFinite(n) ? n : fallback;
}

function RoomDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const [priceUsd, setPriceUsd] = useState("");
  const [pricePkr, setPricePkr] = useState("");
  const [capacity, setCapacity] = useState("");
  const [bedsTotal, setBedsTotal] = useState("");
  const [bedsAvailable, setBedsAvailable] = useState("");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const { data: room, isLoading, isError, error } = useRoomQuery(id);
  const updateRoom = useUpdateRoomMutation();
  const deleteRoom = useDeleteRoomMutation();

  useEffect(() => {
    if (!room) return;
    setPriceUsd(String(room.price_per_night_usd ?? room.price_per_night));
    setPricePkr(String(room.price_per_night_pkr ?? room.price_per_night));
    setCapacity(String(room.capacity));
    setBedsTotal(String(room.beds_total));
    setBedsAvailable(String(room.beds_available));
    setSelectedAmenities(room.amenities ?? []);
  }, [room]);

  const amenityOptions = useMemo(() => {
    const base: string[] = [...ROOM_AMENITY_OPTIONS];
    for (const a of selectedAmenities) {
      if (!base.includes(a)) base.push(a);
    }
    return base.sort((a, b) => a.localeCompare(b));
  }, [selectedAmenities]);

  const { data: bookingsData } = useBookingsQuery({ room_id: id, limit: 100 });
  const bookings = bookingsData?.bookings ?? [];

  const revenuePkr = bookings
    .filter((b) => b.status !== "cancelled" && normalizeMoneyCurrency(b.currency) === "pkr")
    .reduce((s, b) => s + b.total_amount, 0);
  const revenueUsd = bookings
    .filter((b) => b.status !== "cancelled" && normalizeMoneyCurrency(b.currency) === "usd")
    .reduce((s, b) => s + b.total_amount, 0);

  const parsed = useMemo(() => {
    const priceUsdNum = Number(priceUsd);
    const pricePkrNum = Number(pricePkr);
    const capacityNum = parsePositiveInt(capacity, 0);
    const bedsTotalNum = parsePositiveInt(bedsTotal, 0);
    const bedsAvailableNum = parsePositiveInt(bedsAvailable, 0);
    return { priceUsdNum, pricePkrNum, capacityNum, bedsTotalNum, bedsAvailableNum };
  }, [priceUsd, pricePkr, capacity, bedsTotal, bedsAvailable]);

  const canSaveDetails =
    priceUsd.trim() !== "" &&
    pricePkr.trim() !== "" &&
    Number.isFinite(parsed.priceUsdNum) &&
    parsed.priceUsdNum >= 0 &&
    Number.isFinite(parsed.pricePkrNum) &&
    parsed.pricePkrNum >= 0 &&
    parsed.capacityNum >= 1 &&
    parsed.bedsTotalNum >= 1 &&
    parsed.bedsAvailableNum >= 0 &&
    parsed.bedsAvailableNum <= parsed.bedsTotalNum;

  const detailsDirty =
    room &&
    (String(room.price_per_night_usd ?? room.price_per_night) !== priceUsd ||
      String(room.price_per_night_pkr ?? room.price_per_night) !== pricePkr ||
      String(room.capacity) !== capacity ||
      String(room.beds_total) !== bedsTotal ||
      String(room.beds_available) !== bedsAvailable ||
      JSON.stringify([...(room.amenities ?? [])].sort()) !== JSON.stringify([...selectedAmenities].sort()));

  function toggleAmenity(name: string, checked: boolean) {
    setSelectedAmenities((prev) =>
      checked ? (prev.includes(name) ? prev : [...prev, name]) : prev.filter((a) => a !== name),
    );
  }

  function handleStatusChange(status: RoomStatus) {
    if (!room || status === room.status) return;
    updateRoom.mutate(
      { id, draft: { status } },
      {
        onSuccess: () => toast.success("Status updated"),
        onError: (e) => toast.error(e instanceof Error ? e.message : "Status update failed"),
      },
    );
  }

  function handleSaveDetails() {
    if (!room || !canSaveDetails) return;
    const patch: Partial<RoomDraft> = {
      price_per_night_usd: parsed.priceUsdNum,
      price_per_night_pkr: parsed.pricePkrNum,
      price_per_night: parsed.priceUsdNum,
      capacity: parsed.capacityNum,
      beds_total: parsed.bedsTotalNum,
      beds_available: parsed.bedsAvailableNum,
      amenities: selectedAmenities,
    };
    updateRoom.mutate(
      { id, draft: patch },
      {
        onSuccess: (updated) => {
          setPriceUsd(String(updated.price_per_night_usd ?? updated.price_per_night));
          setPricePkr(String(updated.price_per_night_pkr ?? updated.price_per_night));
          setCapacity(String(updated.capacity));
          setBedsTotal(String(updated.beds_total));
          setBedsAvailable(String(updated.beds_available));
          setSelectedAmenities(updated.amenities ?? []);
          toast.success("Room details saved");
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : "Update failed"),
      },
    );
  }

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

  if (isLoading) {
    return <RoomDetailSkeleton />;
  }

  if (isError || !room) {
    return (
      <Card className="border-border/60">
        <CardContent className="py-16 text-center text-sm text-destructive">
          {error instanceof Error ? error.message : "Room not found."}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link to="/admin/rooms">
            <ArrowLeft className="h-4 w-4" /> Back to rooms
          </Link>
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setEditing(true)}>
            <Pencil className="h-4 w-4" /> Edit title & photos
          </Button>
          <Button variant="destructive" onClick={() => setConfirmDelete(true)}>
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="overflow-hidden border-border/60 lg:col-span-2">
          <div className="aspect-video bg-muted">
            <RoomThumbnail
              src={room.images?.[activeImage]}
              className="h-full w-full"
              iconClassName="h-16 w-16"
            />
          </div>
          {room.images?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto p-3">
              {room.images.map((src, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border-2 ${i === activeImage ? "border-primary" : "border-transparent"}`}
                >
                  <RoomThumbnail src={src} className="h-full w-full" iconClassName="h-6 w-6" />
                </button>
              ))}
            </div>
          )}
          <CardContent className="space-y-3 p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight">{formatRoomLabel(room)}</h2>
                <div className="mt-1.5">
                  <HostelPropertyBadge hostelId={room.hostel_id} hostelName={room.hostel_name} showAllProperties={false} />
                </div>
                <p className="text-sm text-muted-foreground">
                  {room.room_number != null ? `Room ${room.room_number} · ` : ""}
                  {room.category}
                </p>
              </div>
              <RoomStatusPicker
                status={room.status}
                onChange={handleStatusChange}
                disabled={updateRoom.isPending}
              />
            </div>
            {room.badge && <Badge className="w-fit">{room.badge}</Badge>}
            {room.description && <p className="text-sm leading-relaxed text-muted-foreground">{room.description}</p>}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Room details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2 border-b border-border/60 pb-4">
              <Label>Status</Label>
              <RoomStatusPicker
                status={room.status}
                onChange={handleStatusChange}
                disabled={updateRoom.isPending}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="room-price-usd" required>Price / seat / month (USD)</Label>
              <Input
                id="room-price-usd"
                type="text"
                inputMode="decimal"
                value={priceUsd}
                onChange={(e) => setPriceUsd(e.target.value)}
                placeholder="e.g. 120"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="room-price-pkr" required>Price / seat / month (PKR)</Label>
              <Input
                id="room-price-pkr"
                type="text"
                inputMode="decimal"
                value={pricePkr}
                onChange={(e) => setPricePkr(e.target.value)}
                placeholder="e.g. 35000"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="room-capacity" required>Capacity (guests)</Label>
              <Input
                id="room-capacity"
                type="text"
                inputMode="numeric"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                placeholder="e.g. 2"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="room-beds-total" required>Total beds</Label>
              <Input
                id="room-beds-total"
                type="text"
                inputMode="numeric"
                value={bedsTotal}
                onChange={(e) => setBedsTotal(e.target.value)}
                placeholder="e.g. 2"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="room-beds-available">Beds available</Label>
              <Input
                id="room-beds-available"
                type="text"
                inputMode="numeric"
                value={bedsAvailable}
                onChange={(e) => setBedsAvailable(e.target.value)}
                placeholder="e.g. 1"
              />
            </div>
            {!canSaveDetails && (
              <p className="text-xs text-destructive">
                Check values: price ≥ 0, capacity ≥ 1, total beds ≥ 1, and available beds ≤ total beds.
              </p>
            )}

            <div className="space-y-2 pt-1">
              <Label>Amenities</Label>
              <div className="max-h-52 space-y-2 overflow-y-auto rounded-lg border border-border/60 p-3">
                {amenityOptions.map((a) => (
                  <label key={a} className="flex cursor-pointer items-center gap-2 text-sm">
                    <Checkbox
                      checked={selectedAmenities.includes(a)}
                      onCheckedChange={(c) => toggleAmenity(a, !!c)}
                    />
                    <span>{a}</span>
                  </label>
                ))}
              </div>
            </div>

            <Button
              className="w-full rounded-full font-semibold"
              onClick={handleSaveDetails}
              disabled={!canSaveDetails || !detailsDirty || updateRoom.isPending}
            >
              {updateRoom.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving…
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" /> Save details
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-border/60">
          <CardContent className="flex items-center justify-between p-5 text-sm">
            <span className="text-muted-foreground">
              <Users className="inline h-3.5 w-3.5" /> Total bookings
            </span>
            <span className="font-bold">{bookings.length}</span>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="flex items-center justify-between p-5 text-sm">
            <span className="text-muted-foreground">
              <Wallet className="inline h-3.5 w-3.5" /> Revenue
            </span>
            <span className="font-bold">
              {formatMoney(revenuePkr, "pkr")} · {formatMoney(revenueUsd, "usd")}
            </span>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60">
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 space-y-0">
          <div>
            <CardTitle className="text-base">Bookings</CardTitle>
          </div>
          <HintTooltip
            label="No seats available"
            enabled={room.beds_available <= 0}
          >
            <Button
              type="button"
              onClick={() => setAddMemberOpen(true)}
              disabled={room.beds_available <= 0}
            >
              <UserPlus className="h-4 w-4" />
              Add walk-in member
            </Button>
          </HintTooltip>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Guest</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Seats</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-28 text-right">Invoice</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                    No bookings yet.
                  </TableCell>
                </TableRow>
              ) : (
                bookings.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell>
                      <Link to="/admin/bookings/$id" params={{ id: b.id }} className="font-semibold hover:underline">
                        {b.guest_name}
                      </Link>
                      <div className="text-xs text-muted-foreground">{b.guest_email}</div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {b.move_in} → {b.check_out}
                    </TableCell>
                    <TableCell>{b.seats_booked}</TableCell>
                    <TableCell>{formatMoney(b.total_amount, normalizeMoneyCurrency(b.currency))}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {b.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm" variant="outline">
                        <Link to="/admin/bookings/$id" params={{ id: b.id }} hash="booking-invoice">
                          <FileText className="h-3.5 w-3.5" />
                          Invoice
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ManualMemberDialog room={room} open={addMemberOpen} onOpenChange={setAddMemberOpen} />

      <RoomFormDialog
        open={editing}
        initial={room}
        onClose={() => setEditing(false)}
        onSubmit={handleUpdate}
        submitting={updateRoom.isPending}
      />

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {room.title}?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
