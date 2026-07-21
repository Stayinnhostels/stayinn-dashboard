import { useCallback, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { Loader2, RotateCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  CNIC_ASPECT_RATIO,
  cropCnicImageToDataUrl,
} from "@/lib/crop-cnic-image";

type Props = {
  open: boolean;
  imageSrc: string | null;
  sideLabel: string;
  onOpenChange: (open: boolean) => void;
  onCropped: (dataUrl: string) => void;
};

export function CnicCropDialog({
  open,
  imageSrc,
  sideLabel,
  onOpenChange,
  onCropped,
}: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);

  const onCropComplete = useCallback((_area: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  function handleOpenChange(next: boolean) {
    if (!next) {
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
      setCroppedAreaPixels(null);
    }
    onOpenChange(next);
  }

  async function handleSave() {
    if (!imageSrc || !croppedAreaPixels) {
      toast.error("Adjust the frame to cover the ID card");
      return;
    }
    setSaving(true);
    try {
      const dataUrl = await cropCnicImageToDataUrl(imageSrc, croppedAreaPixels, rotation);
      onCropped(dataUrl);
      handleOpenChange(false);
      toast.success(`${sideLabel} cropped and ready`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not crop image");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[92vh] w-[calc(100%-1.5rem)] max-w-3xl flex-col gap-0 overflow-hidden p-0 sm:rounded-xl">
        <DialogHeader className="shrink-0 border-b border-border/60 px-5 py-4 text-left">
          <DialogTitle>Crop ID card — {sideLabel}</DialogTitle>
          <DialogDescription>
            Fit the card inside the frame. Drag to move, scroll or use the slider to zoom.
          </DialogDescription>
        </DialogHeader>

        <div className="relative min-h-[min(68vh,28rem)] flex-1 bg-zinc-950">
          {imageSrc ? (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={CNIC_ASPECT_RATIO}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onRotationChange={setRotation}
              onCropComplete={onCropComplete}
              objectFit="contain"
              showGrid
            />
          ) : null}
        </div>

        <div className="space-y-3 border-t border-border/60 px-5 py-4">
          <div className="space-y-1.5">
            <Label htmlFor="cnic-crop-zoom" className="text-xs text-muted-foreground">
              Zoom
            </Label>
            <input
              id="cnic-crop-zoom"
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => setRotation((r) => (r + 90) % 360)}
          >
            <RotateCw className="mr-2 h-4 w-4" />
            Rotate 90°
          </Button>
        </div>

        <DialogFooter className="border-t border-border/60 px-5 py-3">
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button type="button" onClick={() => void handleSave()} disabled={saving || !imageSrc}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Use cropped image
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
