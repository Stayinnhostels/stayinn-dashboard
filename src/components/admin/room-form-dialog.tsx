import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImagePlus, X } from "lucide-react";
import { toast } from "sonner";
import { compressImageFile } from "@/lib/compress-image";
import { ROOM_AMENITY_OPTIONS, ROOM_CATEGORIES, type Room, type RoomDraft } from "@/types/domain/room.types";

export type { RoomDraft };

const blank: RoomDraft = {
  title: "",
  room_number: 101,
  description: "",
  price_per_night: 0,
  price_per_night_usd: 0,
  price_per_night_pkr: 0,
  status: "draft",
  category: "2 Seater",
  capacity: 2,
  beds_total: 2,
  beds_available: 2,
  amenities: [],
  images: [],
  badge: null,
  display_order: 100,
};

function roomToDraft(
  room: Partial<Room> | null | undefined,
  suggestedRoomNumber = 101,
): RoomDraft {
  if (!room) return { ...blank, room_number: suggestedRoomNumber };
  return {
    title: room.title ?? "",
    room_number: room.room_number ?? null,
    description: room.description ?? "",
    price_per_night: room.price_per_night_usd ?? room.price_per_night ?? 0,
    price_per_night_usd: room.price_per_night_usd ?? room.price_per_night ?? 0,
    price_per_night_pkr: room.price_per_night_pkr ?? room.price_per_night ?? 0,
    status: room.status ?? "draft",
    category: room.category ?? "2 Seater",
    capacity: room.capacity ?? 1,
    beds_total: room.beds_total ?? 1,
    beds_available: room.beds_available ?? 1,
    amenities: (room.amenities ?? []).filter((a) => a.trim() && a.trim().toLowerCase() !== "none"),
    images: room.images ?? [],
    badge: room.badge ?? null,
    display_order: room.display_order ?? 100,
  };
}

function parsePositiveInt(value: string, fallback = 0) {
  const n = Number.parseInt(value.trim(), 10);
  return Number.isFinite(n) ? n : fallback;
}

export function RoomFormDialog({
  open,
  initial,
  onClose,
  onSubmit,
  submitting,
  suggestedRoomNumber = 101,
}: {
  open: boolean;
  initial: Partial<Room> | null;
  onClose: () => void;
  onSubmit: (v: RoomDraft) => void;
  submitting: boolean;
  /** Next available number when creating a new room (defaults to 101). */
  suggestedRoomNumber?: number;
}) {
  const [draft, setDraft] = useState<RoomDraft>(blank);
  const [priceUsdText, setPriceUsdText] = useState("0");
  const [pricePkrText, setPricePkrText] = useState("0");
  const [capacityText, setCapacityText] = useState("2");
  const [bedsTotalText, setBedsTotalText] = useState("2");
  const [bedsAvailableText, setBedsAvailableText] = useState("2");
  const [displayOrderText, setDisplayOrderText] = useState("100");
  const [roomNumberText, setRoomNumberText] = useState("101");
  const isEdit = Boolean(initial?.id);

  useEffect(() => {
    if (!open) return;
    const next = roomToDraft(initial, suggestedRoomNumber);
    setDraft(next);
    setPriceUsdText(String(next.price_per_night_usd));
    setPricePkrText(String(next.price_per_night_pkr));
    setCapacityText(String(next.capacity));
    setBedsTotalText(String(next.beds_total));
    setBedsAvailableText(String(next.beds_available));
    setDisplayOrderText(String(next.display_order));
    setRoomNumberText(
      next.room_number != null ? String(next.room_number) : String(suggestedRoomNumber),
    );
  }, [open, initial, suggestedRoomNumber]);

  const amenityOptions = useMemo(() => {
    const base: string[] = [...ROOM_AMENITY_OPTIONS];
    for (const a of draft.amenities) {
      if (!base.includes(a)) base.push(a);
    }
    return base.sort((a, b) => a.localeCompare(b));
  }, [draft.amenities]);

  const parsed = useMemo(() => {
    const priceUsdNum = Number(priceUsdText);
    const pricePkrNum = Number(pricePkrText);
    const capacityNum = parsePositiveInt(capacityText, 0);
    const bedsTotalNum = parsePositiveInt(bedsTotalText, 0);
    const bedsAvailableNum = parsePositiveInt(bedsAvailableText, 0);
    const displayOrderNum = parsePositiveInt(displayOrderText, 100);
    const roomNumberTrim = roomNumberText.trim();
    const roomNumberNum =
      roomNumberTrim === "" ? null : parsePositiveInt(roomNumberTrim, Number.NaN);
    return {
      priceUsdNum,
      pricePkrNum,
      capacityNum,
      bedsTotalNum,
      bedsAvailableNum,
      displayOrderNum,
      roomNumberNum,
      roomNumberTrim,
    };
  }, [
    priceUsdText,
    pricePkrText,
    capacityText,
    bedsTotalText,
    bedsAvailableText,
    displayOrderText,
    roomNumberText,
  ]);

  const canSave =
    draft.title.trim().length > 0 &&
    draft.category.trim().length > 0 &&
    priceUsdText.trim() !== "" &&
    pricePkrText.trim() !== "" &&
    Number.isFinite(parsed.priceUsdNum) &&
    parsed.priceUsdNum >= 0 &&
    Number.isFinite(parsed.pricePkrNum) &&
    parsed.pricePkrNum >= 0 &&
    parsed.capacityNum >= 1 &&
    parsed.bedsTotalNum >= 1 &&
    parsed.bedsAvailableNum >= 0 &&
    parsed.bedsAvailableNum <= parsed.bedsTotalNum &&
    parsed.displayOrderNum >= 1 &&
    (parsed.roomNumberTrim === "" ||
      (parsed.roomNumberNum != null &&
        Number.isFinite(parsed.roomNumberNum) &&
        parsed.roomNumberNum >= 101));

  function toggleAmenity(name: string, checked: boolean) {
    setDraft((d) => ({
      ...d,
      amenities: checked
        ? d.amenities.includes(name)
          ? d.amenities
          : [...d.amenities, name]
        : d.amenities.filter((a) => a !== name),
    }));
  }

  function handleSubmit() {
    if (!canSave) return;
    onSubmit({
      ...draft,
      room_number:
        parsed.roomNumberTrim === "" || parsed.roomNumberNum == null
          ? null
          : parsed.roomNumberNum,
      price_per_night_usd: parsed.priceUsdNum,
      price_per_night_pkr: parsed.pricePkrNum,
      price_per_night: parsed.priceUsdNum,
      capacity: parsed.capacityNum,
      beds_total: parsed.bedsTotalNum,
      beds_available: parsed.bedsAvailableNum,
      display_order: parsed.displayOrderNum,
    });
  }

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    try {
      const urls = await Promise.all(Array.from(files).map((f) => compressImageFile(f)));
      setDraft((d) => ({ ...d, images: [...d.images, ...urls] }));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not add image");
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit room" : "Add room"}</DialogTitle>
          <DialogDescription>Set room details, pricing, capacity and photos.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-3 sm:grid-cols-[7.5rem_1fr]">
            <div className="grid gap-2">
              <Label htmlFor="room-number">Room no.</Label>
              <Input
                id="room-number"
                name="room-number"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={roomNumberText}
                onChange={(e) => setRoomNumberText(e.target.value)}
                placeholder="101"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="room-title">Title</Label>
              <Input
                id="room-title"
                name="room-title"
                type="text"
                autoComplete="off"
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground -mt-2">
            Room numbers start at <span className="font-semibold">101</span> and must be unique
            (102, 103, …). Leave blank only if you do not want a number yet.
          </p>
          <div className="grid gap-2">
            <Label>Description</Label>
            <Textarea
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label>Price / seat / month (USD)</Label>
              <Input
                type="text"
                inputMode="decimal"
                value={priceUsdText}
                onChange={(e) => setPriceUsdText(e.target.value)}
                placeholder="e.g. 120"
              />
              <p className="text-[10px] text-muted-foreground">Shown to international guests</p>
            </div>
            <div className="grid gap-2">
              <Label>Price / seat / month (PKR)</Label>
              <Input
                type="text"
                inputMode="decimal"
                value={pricePkrText}
                onChange={(e) => setPricePkrText(e.target.value)}
                placeholder="e.g. 35000"
              />
              <p className="text-[10px] text-muted-foreground">Shown to Pakistan region</p>
            </div>
            <div className="grid gap-2">
              <Label>Category</Label>
              <Select value={draft.category} onValueChange={(v) => setDraft({ ...draft, category: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROOM_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Capacity</Label>
              <Input
                type="text"
                inputMode="numeric"
                value={capacityText}
                onChange={(e) => setCapacityText(e.target.value)}
                placeholder="e.g. 2"
              />
            </div>
            <div className="grid gap-2">
              <Label>Beds total</Label>
              <Input
                type="text"
                inputMode="numeric"
                value={bedsTotalText}
                onChange={(e) => setBedsTotalText(e.target.value)}
                placeholder="e.g. 2"
              />
            </div>
            <div className="grid gap-2">
              <Label>Beds available</Label>
              <Input
                type="text"
                inputMode="numeric"
                value={bedsAvailableText}
                onChange={(e) => setBedsAvailableText(e.target.value)}
                placeholder="e.g. 1"
              />
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select value={draft.status} onValueChange={(v) => setDraft({ ...draft, status: v as RoomDraft["status"] })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="full">Full</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {!canSave && (
            <p className="text-xs text-destructive">
              Check room number (101+), USD & PKR prices, capacity, and beds (available cannot exceed
              total).
            </p>
          )}

          <div className="grid gap-2">
            <Label>Website display order</Label>
            <Input
              type="text"
              inputMode="numeric"
              value={displayOrderText}
              onChange={(e) => setDisplayOrderText(e.target.value)}
              placeholder="e.g. 1"
            />
            <p className="text-xs text-muted-foreground">
              1 = shown first on the website, 2 = second, and so on. Use 100 for rooms that should appear later.
            </p>
          </div>

          <div className="grid gap-2">
            <Label>Badge (optional)</Label>
            <Input
              type="text"
              value={draft.badge ?? ""}
              onChange={(e) => setDraft({ ...draft, badge: e.target.value.trim() || null })}
              placeholder="e.g. Most Popular"
            />
          </div>

          <div className="grid gap-2">
            <Label>Amenities</Label>
            <p className="text-xs text-muted-foreground">Select amenities for this room.</p>
            <div className="max-h-44 space-y-2 overflow-y-auto rounded-lg border border-border/60 p-3">
              {amenityOptions.map((a) => (
                <label key={a} className="flex cursor-pointer items-center gap-2 text-sm">
                  <Checkbox checked={draft.amenities.includes(a)} onCheckedChange={(c) => toggleAmenity(a, !!c)} />
                  <span>{a}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Images</Label>
            <p className="text-xs text-muted-foreground">
              Uploads are compressed automatically. For many large photos, paste HTTPS image URLs below.
            </p>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {draft.images.map((src, i) => (
                <div key={src + i} className="relative aspect-square overflow-hidden rounded-lg border">
                  <img src={src} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setDraft({ ...draft, images: draft.images.filter((_, idx) => idx !== i) })}
                    className="absolute right-1 top-1 rounded-full bg-background/80 p-1 hover:bg-background"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed text-xs text-muted-foreground hover:bg-muted">
                <ImagePlus className="h-5 w-5" />
                <span>Upload</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleUpload(e.target.files)} />
              </label>
            </div>
            <Input
              type="text"
              placeholder="Paste image URL and press Enter"
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                e.preventDefault();
                const url = (e.target as HTMLInputElement).value.trim();
                if (!url) return;
                setDraft((d) => ({ ...d, images: [...d.images, url] }));
                (e.target as HTMLInputElement).value = "";
              }}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || !canSave}>
            {submitting ? "Saving…" : isEdit ? "Save changes" : "Create room"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
