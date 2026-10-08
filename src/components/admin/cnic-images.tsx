"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { FileText, IdCard, ImagePlus, Loader2, Pencil, Download, X } from "lucide-react";
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
import { ZoomableImageLightbox } from "@/components/admin/zoomable-image-lightbox";
import { FULL_PAGE_ASPECT_RATIO, prepareCnicImageForOcr, readImageFileAsDataUrl } from "@/lib/crop-cnic-image";
import { extractCnicPagesFromPdf } from "@/lib/extract-cnic-from-pdf";
import { ocrCnicApi, type CnicOcrFields } from "@/api/residents";
import { useAuthStore } from "@/stores/auth/auth.store";
import { useUpdateResidentMutation } from "@/queries/residents";
import { HintTooltip } from "@/components/ui/hint-tooltip";
import { cn } from "@/lib/utils";

type CnicImages = {
  front: string;
  back: string;
  bForm?: string;
};

export function hasAnyCnicImage(images: CnicImages) {
  return Boolean(images.front || images.back || images.bForm);
}

export function cnicUploadCount(images: CnicImages) {
  return Number(Boolean(images.front)) + Number(Boolean(images.back));
}

/** CNIC (front+back) or a single B-Form image both count as a complete ID on file. */
function idDocStatus({ front, back, bForm }: CnicImages) {
  const complete = Boolean(bForm) || Boolean(front && back);
  const partial = !complete && Boolean(front || back);
  return { complete, partial };
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
  bForm: string;
  onBFormChange: (value: string) => void;
  onExtracted?: (fields: CnicOcrFields) => void;
};

type CropSide = "Front" | "Back" | "B-Form";

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function CnicPdfUploadControl({
  busy,
  disabled,
  hasPdf,
  pdfDataUrl,
  downloadName = "cnic.pdf",
  onPick,
}: {
  busy: boolean;
  disabled?: boolean;
  hasPdf?: boolean;
  pdfDataUrl?: string;
  downloadName?: string;
  onPick: (file: File) => void;
}) {
  const label = hasPdf ? "Replace PDF" : "Upload PDF";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {hasPdf && pdfDataUrl ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs"
          disabled={busy}
          onClick={() => downloadDataUrl(pdfDataUrl, downloadName)}
        >
          <Download className="h-3.5 w-3.5" />
          Download PDF
        </Button>
      ) : null}
      {!disabled || !hasPdf ? (
      <HintTooltip
        label={
          hasPdf
            ? "Replace the full CNIC PDF (page 1 → front, page 2 → back)"
            : "Front and back of the CNIC (1 or 2 pages)"
        }
      >
        <label
          className={cn(
            "inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium shadow-sm transition-opacity",
            hasPdf
              ? "border border-input bg-background text-foreground hover:bg-muted/60"
              : "bg-primary text-primary-foreground hover:opacity-90",
            busy || disabled ? "pointer-events-none opacity-60" : "cursor-pointer",
          )}
        >
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}
          {label}
          <input
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            disabled={busy || disabled}
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              e.target.value = "";
              if (file) onPick(file);
            }}
          />
        </label>
      </HintTooltip>
      ) : null}
    </div>
  );
}

export function CnicImagesEditor({
  front,
  back,
  onFrontChange,
  onBackChange,
  bForm,
  onBFormChange,
  onExtracted,
}: EditorProps) {
  const token = useAuthStore((s) => s.token);
  const [uploadingFront, setUploadingFront] = useState(false);
  const [uploadingBack, setUploadingBack] = useState(false);
  const [uploadingBForm, setUploadingBForm] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [readingCard, setReadingCard] = useState(false);
  const [localPdf, setLocalPdf] = useState("");
  const [cropSide, setCropSide] = useState<CropSide | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);

  function openCrop(side: CropSide, src: string) {
    setCropSide(side);
    setCropSrc(src);
  }

  async function readCard(input: {
    front?: string;
    back?: string;
    front_text?: string;
    back_text?: string;
  }) {
    if (!onExtracted) return;
    if (!token) {
      toast.error("You must be signed in to read the ID card");
      return;
    }
    setReadingCard(true);
    try {
      const [front, back] = await Promise.all([
        input.front ? prepareCnicImageForOcr(input.front) : Promise.resolve(undefined),
        input.back ? prepareCnicImageForOcr(input.back) : Promise.resolve(undefined),
      ]);
      const fields = await ocrCnicApi(token, {
        front,
        back,
        front_text: input.front_text,
        back_text: input.back_text,
      });
      onExtracted(fields);
      const labels: string[] = [];
      if (fields.cnic) labels.push("CNIC number");
      if (fields.name) labels.push("name");
      if (fields.father_name) labels.push("father name");
      if (fields.address) labels.push("address");
      if (fields.gender) labels.push("gender");
      toast.success(
        labels.length ? `Filled from ID card: ${labels.join(", ")}` : "ID card read — check the fields",
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not read ID card");
    } finally {
      setReadingCard(false);
    }
  }

  async function handlePdfPick(file: File) {
    setUploadingPdf(true);
    try {
      const [pages, pdfDataUrl] = await Promise.all([
        extractCnicPagesFromPdf(file),
        readFileAsDataUrl(file),
      ]);
      if (!pdfDataUrl.startsWith("data:application/pdf")) {
        throw new Error("Please upload a PDF file");
      }
      onFrontChange(pages.front);
      onBackChange(pages.back);
      setLocalPdf(pdfDataUrl);
      toast.success(
        pages.back
          ? "PDF applied — reading name, father name, CNIC, and address…"
          : "PDF applied — reading the front of the card…",
      );
      await readCard({
        front: pages.front,
        back: pages.back || undefined,
        front_text: pages.front_text || undefined,
        back_text: pages.back_text || undefined,
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not read CNIC PDF");
    } finally {
      setUploadingPdf(false);
    }
  }

  return (
    <div className="space-y-3 sm:col-span-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <Label>CNIC images</Label>
          <p className="text-[11px] text-muted-foreground">
            {readingCard
              ? "Reading name, father name, CNIC number, and address…"
              : "Upload front (and back for address) — details fill in automatically."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {readingCard ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : null}
          <CnicPdfUploadControl
            busy={uploadingPdf || readingCard}
            hasPdf={Boolean(localPdf)}
            pdfDataUrl={localPdf || undefined}
            onPick={(file) => void handlePdfPick(file)}
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <CnicUploadSlot
          label="Front"
          value={front}
          uploading={uploadingFront || uploadingPdf}
          onChange={onFrontChange}
          onUploading={setUploadingFront}
          onPickForCrop={(src) => openCrop("Front", src)}
        />
        <CnicUploadSlot
          label="Back"
          value={back}
          uploading={uploadingBack || uploadingPdf}
          onChange={onBackChange}
          onUploading={setUploadingBack}
          onPickForCrop={(src) => openCrop("Back", src)}
        />
      </div>

      <div className="flex items-center gap-2 pt-1">
        <span className="h-px flex-1 bg-border" />
        <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          No CNIC? Use B-Form instead
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <CnicUploadSlot
          label="B-Form"
          value={bForm}
          uploading={uploadingBForm}
          onChange={onBFormChange}
          onUploading={setUploadingBForm}
          onPickForCrop={(src) => openCrop("B-Form", src)}
        />
      </div>

      <CnicCropDialog
        open={Boolean(cropSide && cropSrc)}
        imageSrc={cropSrc}
        sideLabel={cropSide ?? "Front"}
        aspect={cropSide === "B-Form" ? FULL_PAGE_ASPECT_RATIO : undefined}
        documentLabel={cropSide === "B-Form" ? "document" : "ID card"}
        onOpenChange={(open) => {
          if (!open) {
            setCropSide(null);
            setCropSrc(null);
          }
        }}
        onCropped={(dataUrl) => {
          if (cropSide === "Front") {
            onFrontChange(dataUrl);
            void readCard({ front: dataUrl, back: back || undefined });
          } else if (cropSide === "Back") {
            onBackChange(dataUrl);
            void readCard({ front: front || undefined, back: dataUrl });
          } else if (cropSide === "B-Form") {
            onBFormChange(dataUrl);
          }
        }}
      />
    </div>
  );
}

type ViewerSlotProps = {
  label: string;
  value: string;
  busy: boolean;
  disabled: boolean;
  onPick: (file: File) => void;
};

function CnicViewerSlot({ label, value, busy, disabled, onPick }: ViewerSlotProps) {
  const [previewOpen, setPreviewOpen] = useState(false);

  function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    e.target.value = "";
    if (file) onPick(file);
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      {value ? (
        <div className="relative overflow-hidden rounded-xl border">
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="block w-full cursor-zoom-in text-left"
            aria-label={`View ${label} full size`}
          >
            <img
              src={value}
              alt={`CNIC ${label.toLowerCase()}`}
              className="h-56 w-full object-contain bg-muted/30"
            />
          </button>
          <label
            className={cn(
              "absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-background/90 px-2 py-1.5 text-xs font-medium shadow hover:bg-background",
              disabled ? "pointer-events-none opacity-60" : "cursor-pointer",
            )}
          >
            {busy ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Pencil className="h-3.5 w-3.5" />
            )}
            Replace
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={disabled}
              onChange={handleFile}
            />
          </label>
          <ZoomableImageLightbox
            open={previewOpen}
            onOpenChange={setPreviewOpen}
            src={value}
            alt={`CNIC ${label.toLowerCase()}`}
            title={label}
          />
        </div>
      ) : (
        <label
          className={cn(
            "flex h-56 w-full flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed text-sm text-muted-foreground hover:bg-muted/40",
            disabled ? "pointer-events-none opacity-60" : "cursor-pointer",
          )}
        >
          {busy ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <ImagePlus className="h-5 w-5" />
              <span>{label} not uploaded — click to upload</span>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={disabled}
            onChange={handleFile}
          />
        </label>
      )}
    </div>
  );
}

function ReadOnlyIdSlot({
  label,
  value,
  altText,
}: {
  label: string;
  value: string;
  altText: string;
}) {
  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      {value ? (
        <>
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="block w-full overflow-hidden rounded-xl border cursor-zoom-in text-left"
            aria-label={`View ${label} full size`}
          >
            <img src={value} alt={altText} className="h-56 w-full object-contain bg-muted/30" />
          </button>
          <ZoomableImageLightbox
            open={previewOpen}
            onOpenChange={setPreviewOpen}
            src={value}
            alt={altText}
            title={label}
          />
        </>
      ) : (
        <div className="flex h-56 items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
          {label} not uploaded
        </div>
      )}
    </div>
  );
}

type ViewerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name?: string;
  front: string;
  back: string;
  bForm: string;
  /** Original CNIC PDF data URL when available. */
  pdf?: string;
  /** When provided (with `month`), missing/existing images can be uploaded and are saved immediately. */
  bookingId?: string;
  month?: string;
};

export function CnicImagesViewerModal({
  open,
  onOpenChange,
  name,
  front,
  back,
  bForm,
  pdf = "",
  bookingId,
  month,
}: ViewerProps) {
  const update = useUpdateResidentMutation();
  const canUpload = Boolean(bookingId && month);

  const [localFront, setLocalFront] = useState(front);
  const [localBack, setLocalBack] = useState(back);
  const [localBForm, setLocalBForm] = useState(bForm);
  const [localPdf, setLocalPdf] = useState(pdf);
  const [pickingFront, setPickingFront] = useState(false);
  const [pickingBack, setPickingBack] = useState(false);
  const [pickingBForm, setPickingBForm] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [cropSide, setCropSide] = useState<CropSide | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const anyPicking = pickingFront || pickingBack || pickingBForm || uploadingPdf;
  const hasPdf = Boolean(localPdf);

  useEffect(() => {
    if (open) {
      setLocalFront(front);
      setLocalBack(back);
      setLocalBForm(bForm);
      setLocalPdf(pdf);
    }
  }, [open, front, back, bForm, pdf]);

  async function handlePick(side: CropSide, file: File) {
    const setPicking =
      side === "Front" ? setPickingFront : side === "Back" ? setPickingBack : setPickingBForm;
    setPicking(true);
    try {
      const src = await readImageFileAsDataUrl(file);
      setCropSide(side);
      setCropSrc(src);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not process image");
    } finally {
      setPicking(false);
    }
  }

  function persistPdfUpload(nextFront: string, nextBack: string, nextPdf: string) {
    if (!bookingId || !month) {
      setLocalFront(nextFront);
      setLocalBack(nextBack);
      setLocalPdf(nextPdf);
      return;
    }
    update.mutate(
      {
        bookingId,
        input: {
          month,
          guest_cnic_image_front: nextFront,
          guest_cnic_image_back: nextBack,
          guest_cnic_pdf: nextPdf,
        },
      },
      {
        onSuccess: () => {
          setLocalFront(nextFront);
          setLocalBack(nextBack);
          setLocalPdf(nextPdf);
          toast.success(
            hasPdf
              ? "CNIC PDF replaced — page 1 → front, page 2 → back"
              : "CNIC PDF saved — page 1 → front, page 2 → back",
          );
        },
        onError: (err) => toast.error(err instanceof Error ? err.message : "Could not save PDF"),
      },
    );
  }

  async function handlePdfPick(file: File) {
    setUploadingPdf(true);
    try {
      const [pages, pdfDataUrl] = await Promise.all([
        extractCnicPagesFromPdf(file),
        readFileAsDataUrl(file),
      ]);
      if (!pdfDataUrl.startsWith("data:application/pdf")) {
        throw new Error("Please upload a PDF file");
      }
      if (pdfDataUrl.length > 7_500_000) {
        throw new Error("PDF is too large — please upload a smaller file (under ~5 MB)");
      }
      persistPdfUpload(pages.front, pages.back, pdfDataUrl);
      if (!bookingId || !month) {
        toast.success("PDF applied — page 1 → front, page 2 → back");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not read CNIC PDF");
    } finally {
      setUploadingPdf(false);
    }
  }

  function handleCropped(dataUrl: string) {
    if (!cropSide) return;
    const side = cropSide;
    if (!bookingId || !month) {
      if (side === "Front") setLocalFront(dataUrl);
      else if (side === "Back") setLocalBack(dataUrl);
      else setLocalBForm(dataUrl);
      return;
    }
    const input =
      side === "Front"
        ? { month, guest_cnic_image_front: dataUrl }
        : side === "Back"
          ? { month, guest_cnic_image_back: dataUrl }
          : { month, guest_b_form_image: dataUrl };
    update.mutate(
      { bookingId, input },
      {
        onSuccess: () => {
          if (side === "Front") setLocalFront(dataUrl);
          else if (side === "Back") setLocalBack(dataUrl);
          else setLocalBForm(dataUrl);
          toast.success(`${side} image saved`);
        },
        onError: (err) => toast.error(err instanceof Error ? err.message : "Could not save image"),
      },
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{name ? `CNIC — ${name}` : "CNIC images"}</DialogTitle>
          </DialogHeader>
          {(canUpload || hasPdf) ? (
            <div className="flex flex-wrap items-center justify-end">
              <CnicPdfUploadControl
                busy={uploadingPdf || (update.isPending && !cropSide)}
                disabled={!canUpload || anyPicking || update.isPending}
                hasPdf={hasPdf}
                pdfDataUrl={localPdf || undefined}
                downloadName={`${(name || "cnic").replace(/\s+/g, "-").toLowerCase()}-cnic.pdf`}
                onPick={(file) => void handlePdfPick(file)}
              />
            </div>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2">
            {canUpload ? (
              <>
                <CnicViewerSlot
                  label="Front"
                  value={localFront}
                  busy={pickingFront || uploadingPdf || (update.isPending && cropSide === "Front")}
                  disabled={update.isPending || anyPicking}
                  onPick={(file) => void handlePick("Front", file)}
                />
                <CnicViewerSlot
                  label="Back"
                  value={localBack}
                  busy={pickingBack || uploadingPdf || (update.isPending && cropSide === "Back")}
                  disabled={update.isPending || anyPicking}
                  onPick={(file) => void handlePick("Back", file)}
                />
              </>
            ) : (
              <>
                <ReadOnlyIdSlot label="Front" value={front} altText="CNIC front" />
                <ReadOnlyIdSlot label="Back" value={back} altText="CNIC back" />
              </>
            )}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <span className="h-px flex-1 bg-border" />
            <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              No CNIC? B-Form (single image)
            </span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {canUpload ? (
              <CnicViewerSlot
                label="B-Form"
                value={localBForm}
                busy={pickingBForm || (update.isPending && cropSide === "B-Form")}
                disabled={update.isPending || anyPicking}
                onPick={(file) => void handlePick("B-Form", file)}
              />
            ) : (
              <ReadOnlyIdSlot label="B-Form" value={bForm} altText="B-Form" />
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {canUpload ? (
        <CnicCropDialog
          open={Boolean(cropSide && cropSrc)}
          imageSrc={cropSrc}
          sideLabel={cropSide ?? "Front"}
          aspect={cropSide === "B-Form" ? FULL_PAGE_ASPECT_RATIO : undefined}
          documentLabel={cropSide === "B-Form" ? "document" : "ID card"}
          onOpenChange={(o) => {
            if (!o) {
              setCropSide(null);
              setCropSrc(null);
            }
          }}
          onCropped={handleCropped}
        />
      ) : null}
    </>
  );
}

type StatusIconProps = {
  front: string;
  back: string;
  bForm?: string;
  onClick: () => void;
};

export function CnicImagesStatusIcon({ front, back, bForm = "", onClick }: StatusIconProps) {
  const count = cnicUploadCount({ front, back });
  const { complete, partial } = idDocStatus({ front, back, bForm });
  const tip =
    bForm && !(front && back)
      ? "B-Form uploaded — view"
      : complete
        ? "Front & back uploaded — view"
        : partial
          ? `${count}/2 uploaded — view`
          : "No ID on file — click to upload";

  return (
    <HintTooltip label={tip}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
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
          {complete ? "ID complete" : partial ? "ID partial" : "ID missing"}
        </span>
      </button>
    </HintTooltip>
  );
}
