import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImagePlus, X } from "lucide-react";

export type RoomDraft = {
  title: string;
  description: string;
  price_per_night: number;
  status: "available" | "full" | "maintenance" | "draft";
  category: string;
  capacity: number;
  beds_total: number;
  beds_available: number;
  amenities: string[];
  images: string[];
};

const blank: RoomDraft = {
  title: "", description: "", price_per_night: 0, status: "available", category: "shared",
  capacity: 1, beds_total: 1, beds_available: 1, amenities: [], images: [],
};

export function RoomFormDialog({
  open, initial, onClose, onSubmit, submitting,
}: {
  open: boolean;
  initial: Partial<RoomDraft> | null;
  onClose: () => void;
  onSubmit: (v: RoomDraft) => void;
  submitting: boolean;
}) {
  const [draft, setDraft] = useState<RoomDraft>(blank);

  useEffect(() => {
    if (open) {
      setDraft({
        ...blank,
        ...(initial ?? {}),
        amenities: initial?.amenities ?? [],
        images: initial?.images ?? [],
        description: initial?.description ?? "",
      });
    }
  }, [open, initial]);

  function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    const readers = Array.from(files).map(
      (f) => new Promise<string>((res) => {
        const reader = new FileReader();
        reader.onload = () => res(reader.result as string);
        reader.readAsDataURL(f);
      })
    );
    Promise.all(readers).then((urls) => {
      setDraft((d) => ({ ...d, images: [...d.images, ...urls] }));
    });
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initial?.title ? "Edit room" : "Add room"}</DialogTitle>
          <DialogDescription>Set room details, pricing, capacity and photos.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Title</Label>
            <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
          </div>
          <div className="grid gap-2">
            <Label>Description</Label>
            <Textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} rows={3} />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="grid gap-2"><Label>Price / night</Label><Input type="number" value={draft.price_per_night} onChange={(e) => setDraft({ ...draft, price_per_night: Number(e.target.value) })} /></div>
            <div className="grid gap-2"><Label>Category</Label><Input value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} /></div>
            <div className="grid gap-2"><Label>Capacity</Label><Input type="number" value={draft.capacity} onChange={(e) => setDraft({ ...draft, capacity: Number(e.target.value) })} /></div>
            <div className="grid gap-2"><Label>Beds total</Label><Input type="number" value={draft.beds_total} onChange={(e) => setDraft({ ...draft, beds_total: Number(e.target.value) })} /></div>
            <div className="grid gap-2"><Label>Beds available</Label><Input type="number" value={draft.beds_available} onChange={(e) => setDraft({ ...draft, beds_available: Number(e.target.value) })} /></div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select value={draft.status} onValueChange={(v) => setDraft({ ...draft, status: v as RoomDraft["status"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
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
            <Label>Amenities (comma separated)</Label>
            <Input
              value={draft.amenities.join(", ")}
              onChange={(e) => setDraft({ ...draft, amenities: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) })}
            />
          </div>

          <div className="grid gap-2">
            <Label>Images</Label>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {draft.images.map((src, i) => (
                <div key={src + i} className="relative aspect-square overflow-hidden rounded-lg border">
                  <img src={src} alt="" className="h-full w-full object-cover" />
                  <button type="button"
                    onClick={() => setDraft({ ...draft, images: draft.images.filter((_, idx) => idx !== i) })}
                    className="absolute right-1 top-1 rounded-full bg-background/80 p-1 hover:bg-background">
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
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSubmit(draft)} disabled={submitting || !draft.title}>{submitting ? "Saving…" : "Save room"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
