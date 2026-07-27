"use client";

import { useState } from "react";
import { IdCard, ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { CnicCropDialog } from "@/components/admin/cnic-crop-dialog";
import { readImageFileAsDataUrl } from "@/lib/crop-cnic-image";
import { cn } from "@/lib/utils";

type CnicImages = {
  front: string;
  back: string;
};

export function hasAnyCnicImage(images: CnicImages) {
  return Boolean(images.front || images.back);
}

export function cnicUploadCount(images: CnicImages) {
  return Number(Boolean(images.front)) + Number(Boolean(images.back));
}

type UploadSlotProps = {
  label: string;
  value: string;
  uploading: boolean;
  onChange: (value: string) => void;
  onUploading: (busy: boolean) => void;
  onPickForCrop: (imageSrc: string) => void;
};

function CnicUploadSlot({
  label,
  value,
  uploading,
  onChange,
  onUploading,
  onPickForCrop,
}: UploadSlotProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {value ? (
        <div className="relative overflow-hidden rounded-xl border">
          <img src={value} alt={label} className="h-36 w-full object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-2 top-2 rounded-full bg-background/90 p-1.5 shadow hover:bg-background"
            aria-label={`Remove ${label}`}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <label className="flex h-28 w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed text-sm text-muted-foreground hover:bg-muted/40">
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <ImagePlus className="h-5 w-5" />
              <span>Upload {label.toLowerCase()}</span>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={async (e) => {
              const file = e.target.files?.[0] ?? null;
              e.target.value = "";
              if (!file) return;
              onUploading(true);
              try {
                const src = await readImageFileAsDataUrl(file);
                onPickForCrop(src);
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Could not process image");
              } finally {
                onUploading(false);
              }
            }}
          />
        </label>
      )}
    </div>
  );
}

type EditorProps = {
  front: string;
  back: string;
  onFrontChange: (value: string) => void;
  onBackChange: (value: string) => void;
};

export function CnicImagesEditor({ front, back, onFrontChange, onBackChange }: EditorProps) {
  const [uploadingFront, setUploadingFront] = useState(false);
  const [uploadingBack, setUploadingBack] = useState(false);
  const [cropSide, setCropSide] = useState<"Front" | "Back" | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);

  function openCrop(side: "Front" | "Back", src: string) {
    setCropSide(side);
    setCropSrc(src);
  }

  return (
    <div className="space-y-3 sm:col-span-2">
      <div>
        <Label>CNIC images</Label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <CnicUploadSlot
          label="Front"
          value={front}
          uploading={uploadingFront}
          onChange={onFrontChange}
          onUploading={setUploadingFront}
          onPickForCrop={(src) => openCrop("Front", src)}
        />
        <CnicUploadSlot
          label="Back"
          value={back}
          uploading={uploadingBack}
          onChange={onBackChange}
          onUploading={setUploadingBack}
          onPickForCrop={(src) => openCrop("Back", src)}
        />
      </div>

      <CnicCropDialog
        open={Boolean(cropSide && cropSrc)}
        imageSrc={cropSrc}
        sideLabel={cropSide ?? "Front"}
        onOpenChange={(open) => {
          if (!open) {
            setCropSide(null);
            setCropSrc(null);
          }
        }}
        onCropped={(dataUrl) => {
          if (cropSide === "Front") onFrontChange(dataUrl);
          else if (cropSide === "Back") onBackChange(dataUrl);
        }}
      />
    </div>
  );
}

type ViewerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name?: string;
  front: string;
  back: string;
};

export function CnicImagesViewerModal({ open, onOpenChange, name, front, back }: ViewerProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{name ? `CNIC — ${name}` : "CNIC images"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Front</p>
            {front ? (
              <a href={front} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-xl border">
                <img src={front} alt="CNIC front" className="h-56 w-full object-contain bg-muted/30" />
              </a>
            ) : (
              <div className="flex h-56 items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
                Front not uploaded
              </div>
            )}
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Back</p>
            {back ? (
              <a href={back} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-xl border">
                <img src={back} alt="CNIC back" className="h-56 w-full object-contain bg-muted/30" />
              </a>
            ) : (
              <div className="flex h-56 items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
                Back not uploaded
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type StatusIconProps = {
  front: string;
  back: string;
  onClick: () => void;
};

export function CnicImagesStatusIcon({ front, back, onClick }: StatusIconProps) {
  const count = cnicUploadCount({ front, back });
  const complete = count === 2;
  const partial = count === 1;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      title={
        complete
          ? "Front & back uploaded — view"
          : partial
            ? `${count}/2 uploaded — view`
            : "No CNIC images — click to view"
      }
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-full border transition-colors",
        complete
          ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25"
          : partial
            ? "border-amber-500/40 bg-amber-500/15 text-amber-700 hover:bg-amber-500/25"
            : "border-border bg-muted/40 text-muted-foreground hover:bg-muted",
      )}
    >
      <IdCard className="h-4 w-4" />
      <span className="sr-only">
        {complete ? "CNIC complete" : partial ? "CNIC partial" : "CNIC missing"}
      </span>
    </button>
  );
}
