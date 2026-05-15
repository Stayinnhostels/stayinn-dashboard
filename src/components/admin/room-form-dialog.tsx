import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImagePlus, X } from "lucide-react";
import { toast } from "sonner";
import { compressImageFile } from "@/lib/compress-image";
import { ROOM_CATEGORIES, type Room, type RoomDraft } from "@/types/domain/room.types";

export type { RoomDraft };

const blank: RoomDraft = {
  title: "",
  description: "",
  price_per_night: 0,
  status: "draft",
  category: "2 Seater",
  capacity: 2,
  beds_total: 2,
  beds_available: 2,
  amenities: [],
  images: [],
  badge: null,
};

function roomToDraft(room: Partial<Room> | null | undefined): RoomDraft {
  if (!room) return blank;
  return {
    title: room.title ?? "",
    description: room.description ?? "",
    price_per_night: room.price_per_night ?? 0,
    status: room.status ?? "draft",
    category: room.category ?? "2 Seater",
    capacity: room.capacity ?? 1,
    beds_total: room.beds_total ?? 1,
    beds_available: room.beds_available ?? 1,
    amenities: room.amenities ?? [],
    images: room.images ?? [],
    badge: room.badge ?? null,
  };
}

export function RoomFormDialog({
  open,
  initial,
  onClose,
  onSubmit,
  submitting,
}: {
  open: boolean;
  initial: Partial<Room> | null;
  onClose: () => void;
  onSubmit: (v: RoomDraft) => void;
  submitting: boolean;
}) {
  const [draft, setDraft] = useState<RoomDraft>(blank);
  const isEdit = Boolean(initial?.id);

  useEffect(() => {
    if (open) setDraft(roomToDraft(initial));
  }, [open, initial]);

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    try {
      const urls = await Promise.all(Array.from(files).map((f) => compressImageFile(f)));
      setDraft((d) => ({ ...d, images: [...d.images, ...urls] }));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not add image");
    }
  }

  const canSave =
    draft.title.trim().length > 0 &&
    draft.category.trim().length > 0 &&
    draft.price_per_night >= 0 &&
    draft.capacity >= 1 &&
    draft.beds_total >= 1 &&
    draft.beds_available >= 0 &&
    draft.beds_available <= draft.beds_total;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit room" : "Add room"}</DialogTitle>
          <DialogDescription>Set room details, pricing, capacity and photos.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Title</Label>
            <Input
              name="room-title"
              autoComplete="off"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            />
          </div>
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
              <Label>Price / night</Label>
              <Input
                type="number"
                min={0}
                value={draft.price_per_night}
                onChange={(e) => setDraft({ ...draft, price_per_night: Number(e.target.value) })}
              />
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
                type="number"
                min={1}
                value={draft.capacity}
                onChange={(e) => setDraft({ ...draft, capacity: Number(e.target.value) })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Beds total</Label>
              <Input
                type="number"
                min={1}
                value={draft.beds_total}
                onChange={(e) => setDraft({ ...draft, beds_total: Number(e.target.value) })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Beds available</Label>
              <Input
                type="number"
                min={0}
                max={draft.beds_total}
                value={draft.beds_available}
                onChange={(e) => setDraft({ ...draft, beds_available: Number(e.target.value) })}
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

          <div className="grid gap-2">
            <Label>Badge (optional)</Label>
            <Input
              value={draft.badge ?? ""}
              onChange={(e) => setDraft({ ...draft, badge: e.target.value.trim() || null })}
              placeholder="e.g. Most Popular"
            />
          </div>

          <div className="grid gap-2">
            <Label>Amenities (comma separated)</Label>
            <Input
              value={draft.amenities.join(", ")}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  amenities: e.target.value
                    .split(",")
                    .map((x) => x.trim())
                    .filter(Boolean),
                })
              }
            />
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
          <Button onClick={() => onSubmit(draft)} disabled={submitting || !canSave}>
            {submitting ? "Saving…" : isEdit ? "Save changes" : "Create room"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
