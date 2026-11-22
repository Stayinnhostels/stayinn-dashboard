import * as Dialog from "@radix-ui/react-dialog";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { GlassButton } from "@/components/glass";
import { cn } from "@/lib/utils";

/** Shared pieces for Figma 21 · Settings & Website content. */

export const sInput =
  "h-10 w-full rounded-[10px] border border-glass-stroke bg-glass-inset px-3 text-body text-ink outline-none placeholder:text-ink-3 focus:border-brand-border aria-[invalid=true]:border-danger";
export const sLabel = "flex items-center gap-1.5 text-label font-medium text-ink-2";

export function SCard({ title, sub, right, children, className }: { title: string; sub?: string; right?: React.ReactNode; children?: React.ReactNode; className?: string }) {
  return (
    <section className={cn("glass-2 flex flex-col gap-4 rounded-[22px] p-4 md:p-5", className)}>
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-body font-semibold text-ink">{title}</p>
          {sub ? <p className="text-label text-ink-2">{sub}</p> : null}
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

export function SField({ label, hint, error, optional, changed, children, className }: { label: string; hint?: React.ReactNode; error?: string | null; optional?: boolean; changed?: boolean; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <span className={sLabel}>
        {label}
        {optional ? <span className="font-normal text-ink-3">Optional</span> : null}
        {changed ? <span className="size-1.5 rounded-full bg-brand" aria-label="Changed" /> : null}
      </span>
      {children}
      {error ? <span className="text-label text-danger">{error}</span> : hint ? <span className="text-label text-ink-3">{hint}</span> : null}
    </label>
  );
}

/** Input with a leading icon and/or trailing unit ("nights", "%", "px"). */
export function SInput({ icon, unit, prefix, invalid, className, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { icon?: React.ReactNode; unit?: string; prefix?: string; invalid?: boolean }) {
  return (
    <span className={cn("flex h-10 items-center gap-2 rounded-[10px] border border-glass-stroke bg-glass-inset px-3 focus-within:border-brand-border", invalid && "border-danger", className)}>
      {icon ? <span className="shrink-0 text-ink-2 [&_svg]:size-4">{icon}</span> : null}
      {prefix ? <span className="shrink-0 border-r border-glass-divider pr-2 text-label text-ink-2">{prefix}</span> : null}
      <input {...props} aria-invalid={invalid || undefined} className="h-full min-w-0 flex-1 bg-transparent text-body text-ink outline-none placeholder:text-ink-3" />
      {unit ? <span className="shrink-0 text-label text-ink-3">{unit}</span> : null}
    </span>
  );
}

export function SToggleRow({ title, sub, checked, onChange }: { title: string; sub?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-3 rounded-[14px] bg-glass-inset px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="text-body font-medium text-ink">{title}</p>
        {sub ? <p className="text-label text-ink-2">{sub}</p> : null}
      </div>
      <button type="button" role="switch" aria-checked={checked} aria-label={title} onClick={() => onChange(!checked)} className={cn("relative h-6 w-10 shrink-0 cursor-pointer rounded-full border transition-colors", checked ? "border-transparent bg-brand" : "border-glass-stroke bg-ink-3/40")}>
        <span className={cn("absolute top-0.5 size-[18px] rounded-full bg-white shadow-[0_1px_2px_rgba(15,23,42,0.25)] transition-[left]", checked ? "left-[19px]" : "left-0.5")} />
      </button>
    </div>
  );
}

const HEX = /^#[0-9a-f]{6}$/i;
export function SColor({ value, onChange, fallback }: { value: string; onChange: (v: string) => void; fallback: string }) {
  const safe = HEX.test(value) ? value : fallback;
  return (
    <span className="flex h-10 items-center gap-2.5 rounded-[10px] border border-glass-stroke bg-glass-inset px-2.5 focus-within:border-brand-border">
      <span className="relative size-6 shrink-0 overflow-hidden rounded-[6px] border border-black/10" style={{ background: safe }}>
        <input type="color" value={safe} onChange={(e) => onChange(e.target.value.toUpperCase())} aria-label="Pick a colour" className="absolute inset-0 cursor-pointer opacity-0" />
      </span>
      <input value={value} onChange={(e) => onChange(e.target.value.trim())} maxLength={7} className="min-w-0 flex-1 bg-transparent font-mono text-body text-ink uppercase outline-none" aria-invalid={!HEX.test(value) || undefined} />
    </span>
  );
}
export const isHex = (v: string) => HEX.test(v);

/** Figma 21.10 floating "You have unsaved changes" bar. */
export function UnsavedBar({ show, saving, onDiscard, onSave, count }: { show: boolean; saving: boolean; onDiscard: () => void; onSave: () => void; count: number }) {
  if (!show) return null;
  return (
    <div className="glass-3 sticky bottom-3 z-20 mt-1 flex items-center gap-3 rounded-[16px] px-4 py-2.5 shadow-lg max-md:bottom-[calc(96px+env(safe-area-inset-bottom))]">
      <span className="size-2 shrink-0 rounded-full bg-brand" aria-hidden />
      <p className="min-w-0 flex-1 truncate text-body text-ink">
        You have unsaved changes{count > 1 ? ` · ${count} fields` : ""}
      </p>
      <GlassButton variant="ghost" size="sm" className="h-9" onClick={onDiscard} disabled={saving}>
        Discard
      </GlassButton>
      <GlassButton size="sm" className="h-9" onClick={onSave} disabled={saving}>
        {saving ? "Saving…" : "Save changes"}
      </GlassButton>
    </div>
  );
}

export function ConfirmDialog({
  open,
  onOpenChange,
  icon,
  title,
  body,
  confirm,
  cancel = "Cancel",
  danger,
  onConfirm,
  busy,
  extra,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  icon?: React.ReactNode;
  title: string;
  body: React.ReactNode;
  confirm: string;
  cancel?: string;
  danger?: boolean;
  onConfirm: () => void;
  busy?: boolean;
  extra?: React.ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-scrim data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content aria-describedby={undefined} className="glass-3 fixed inset-x-0 bottom-0 z-50 flex flex-col gap-4 rounded-t-[28px] p-5 font-geist text-ink outline-none data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom md:inset-x-auto md:top-1/2 md:bottom-auto md:left-1/2 md:w-[440px] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-[24px] md:p-6 md:data-[state=open]:fade-in-0 md:data-[state=open]:zoom-in-95 md:data-[state=open]:slide-in-from-bottom-0">
          <span className={cn("flex size-11 items-center justify-center rounded-[14px] [&_svg]:size-5", danger ? "bg-danger-tint text-danger" : "bg-glass-inset text-ink")}>{icon ?? (danger ? <AlertTriangle /> : <RotateCcw />)}</span>
          <div className="flex flex-col gap-1.5">
            <Dialog.Title className="text-[20px] leading-7 font-semibold tracking-[-0.2px] text-ink">{title}</Dialog.Title>
            <div className="text-body text-ink-2">{body}</div>
          </div>
          {extra}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <GlassButton variant="glass" onClick={() => onOpenChange(false)} disabled={busy}>
              {cancel}
            </GlassButton>
            <GlassButton variant={danger ? "danger" : "primary"} onClick={onConfirm} disabled={busy}>
              {confirm}
            </GlassButton>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
