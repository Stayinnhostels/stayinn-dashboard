import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/** Center dialog on desktop, bottom sheet on phones (Figma 09.03 / 09.05). */
export function DepositModal({ open, onOpenChange, width = 720, children, className }: { open: boolean; onOpenChange: (o: boolean) => void; width?: number; children: React.ReactNode; className?: string }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-scrim data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content
          aria-describedby={undefined}
          style={{ ["--w" as string]: `${width}px` }}
          className={cn(
            "glass-3 fixed inset-x-0 bottom-0 z-50 flex max-h-[92svh] flex-col overflow-hidden rounded-t-[28px] font-geist text-ink outline-none data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom",
            "md:inset-x-auto md:top-1/2 md:bottom-auto md:left-1/2 md:max-h-[calc(100svh-48px)] md:w-[min(var(--w),calc(100vw-48px))] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-[28px] md:data-[state=open]:fade-in-0 md:data-[state=open]:zoom-in-95 md:data-[state=open]:slide-in-from-bottom-0",
            className,
          )}
        >
          <div className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-ink-3/40 md:hidden" aria-hidden />
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/** Right-hand sheet on desktop, bottom sheet on phones (Figma 09.02). */
export function DepositSheet({ open, onOpenChange, children }: { open: boolean; onOpenChange: (o: boolean) => void; children: React.ReactNode }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-scrim data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content aria-describedby={undefined} className="glass-3 fixed inset-x-0 bottom-0 z-50 flex max-h-[92svh] flex-col overflow-hidden rounded-t-[28px] font-geist text-ink outline-none duration-300 data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom md:inset-x-auto md:inset-y-6 md:right-6 md:max-h-none md:w-[min(500px,calc(100vw-48px))] md:rounded-[28px] md:data-[state=open]:slide-in-from-right">
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function ModalHeader({ icon, title, sub }: { icon?: React.ReactNode; title: string; sub?: string }) {
  return (
    <div className="flex items-start gap-3 border-glass-divider px-5 pt-4 pb-4 md:border-b md:px-6 md:pt-6 md:pb-5">
      {icon ? <span className="hidden size-9 shrink-0 items-center justify-center text-ink md:flex [&_svg]:size-5">{icon}</span> : null}
      <div className="min-w-0 flex-1">
        <Dialog.Title className="truncate text-[22px] leading-7 font-semibold tracking-tight text-ink md:text-[24px] md:leading-8">{title}</Dialog.Title>
        {sub ? <p className="truncate text-label text-ink-2">{sub}</p> : null}
      </div>
      <Dialog.Close aria-label="Close" className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-[12px] bg-glass-inset text-ink hover:brightness-95"><X className="size-4" aria-hidden /></Dialog.Close>
    </div>
  );
}

/** Pakistani numbers: 0300-1234567 → 923001234567. */
export function waLink(phone: string, text: string) {
  let d = phone.replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  if (d.startsWith("0")) d = `92${d.slice(1)}`;
  return `https://wa.me/${d}?text=${encodeURIComponent(text)}`;
}

export function readAsDataUrl(file: File, max = 3_000_000): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.size > max) return reject(new Error("File is too large (max 3 MB)"));
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error("Could not read the file"));
    r.readAsDataURL(file);
  });
}

export const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export const pronoun = (g: string) => (g === "female" ? "she pays" : g === "male" ? "he pays" : "they pay");

export const METHOD_OPTIONS = [
  ["cash", "Cash"],
  ["jazzcash", "JazzCash"],
  ["easypaisa", "Easypaisa"],
  ["bank_transfer", "Bank transfer"],
  ["card", "Card"],
] as const;

export function Seg({ active, onClick, children, className }: { active: boolean; onClick: () => void; children: React.ReactNode; className?: string }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-[12px] border px-3.5 text-body whitespace-nowrap transition-colors [&_svg]:size-4",
        active ? "border-ink-2 bg-glass-3 font-medium text-ink" : "border-transparent bg-glass-inset text-ink-2 hover:text-ink",
        className,
      )}
    >
      {children}
    </button>
  );
}

export const inputCls = "h-10 w-full rounded-[12px] border border-glass-divider bg-glass-inset px-3.5 text-body text-ink outline-none placeholder:text-ink-3 focus:border-brand-border";

/** Stack several photos into one JPEG (max 1000px wide) so a photo set is a single document. */
export async function combineImages(files: File[], width = 1000): Promise<string> {
  const imgs = await Promise.all(
    files.map(
      (f) =>
        new Promise<HTMLImageElement>((resolve, reject) => {
          const url = URL.createObjectURL(f);
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error(`Could not read ${f.name}`));
          img.src = url;
        }),
    ),
  );
  const scaled = imgs.map((img) => ({ img, h: Math.round((img.naturalHeight * width) / Math.max(1, img.naturalWidth)) }));
  const gap = 12;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = scaled.reduce((s, x) => s + x.h, 0) + gap * (scaled.length - 1);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not combine photos");
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  let y = 0;
  for (const { img, h } of scaled) {
    ctx.drawImage(img, 0, y, width, h);
    y += h + gap;
    URL.revokeObjectURL(img.src);
  }
  for (const q of [0.75, 0.6, 0.45, 0.3]) {
    const out = canvas.toDataURL("image/jpeg", q);
    if (out.length * 0.75 <= 3_000_000) return out;
  }
  throw new Error("Too many photos for one upload — add them in smaller groups");
}
