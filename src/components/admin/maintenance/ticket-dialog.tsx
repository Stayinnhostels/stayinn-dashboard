import { useEffect, useMemo, useState } from "react";
import { Bed, Check, Droplet, Ellipsis, ImagePlus, Loader2, Trash2, Upload, Users, Wifi, Wrench, X, Zap, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { GlassButton } from "@/components/glass";
import { DepositModal, readAsDataUrl, waLink } from "@/components/admin/security/deposit-shared";
import { FinDialogHeader, FinToggle, finInput, finLabel } from "@/components/admin/finance/finance-kit";
import { useCreateMaintenanceMutation, useDeleteMaintenanceMutation, useUpdateMaintenanceMutation } from "@/queries/maintenance";
import { getMaintenancePhotosApi } from "@/api/maintenance";
import { useAuthStore } from "@/stores/auth/auth.store";
import { formatRoomLabel, type Room } from "@/types/domain/room.types";
import { cn } from "@/lib/utils";
import type { MaintenanceCategory, MaintenanceDraft, MaintenancePriority, MaintenanceStatus, MaintenanceTicket } from "@/types/domain/maintenance.types";

/** Figma 11.02 problem types. */
export const CATEGORIES: [MaintenanceCategory, string, LucideIcon][] = [
  ["electric", "Electric", Zap],
  ["plumbing", "Plumbing", Droplet],
  ["internet", "Internet", Wifi],
  ["furniture", "Furniture", Wrench],
  ["other", "Other", Ellipsis],
];
export const categoryIcon = (c?: MaintenanceCategory): LucideIcon => CATEGORIES.find(([k]) => k === c)?.[2] ?? Wrench;

const PRIORITIES: [MaintenancePriority, string][] = [
  ["low", "Low"],
  ["medium", "Medium"],
  ["high", "High"],
  ["urgent", "Urgent · today"],
];
const STATUSES: [MaintenanceStatus, string][] = [
  ["open", "Open"],
  ["in_progress", "In progress"],
  ["resolved", "Resolved"],
  ["cancelled", "Cancelled"],
];

type Form = {
  category: MaintenanceCategory;
  room_id: string;
  location_detail: string;
  title: string;
  description: string;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  assignee: string;
  assignee_phone: string;
  expected_cost: string;
  actual_cost: string;
  status_note: string;
  reported_by: string;
  room_offline: boolean;
};

const blank: Form = {
  category: "electric",
  room_id: "",
  location_detail: "",
  title: "",
  description: "",
  priority: "medium",
  status: "open",
  assignee: "",
  assignee_phone: "",
  expected_cost: "",
  actual_cost: "",
  status_note: "",
  reported_by: "",
  room_offline: false,
};

function fromTicket(t: MaintenanceTicket): Form {
  return {
    category: t.category ?? "other",
    room_id: t.room_id ?? "",
    location_detail: t.location_detail ?? "",
    title: t.title,
    description: t.description ?? "",
    priority: t.priority,
    status: t.status,
    assignee: t.assignee && t.assignee !== "Unassigned" ? t.assignee : "",
    assignee_phone: t.assignee_phone ?? "",
    expected_cost: t.expected_cost != null ? String(t.expected_cost) : "",
    actual_cost: t.actual_cost != null ? String(t.actual_cost) : "",
    status_note: t.status_note ?? "",
    reported_by: t.reported_by ?? "",
    room_offline: Boolean(t.room_offline),
  };
}

export type AssigneeOption = { name: string; phone?: string; role?: string };

export function TicketDialog({
  open,
  onOpenChange,
  editing,
  rooms,
  assignees,
  focus,
  initialStatus,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  editing: MaintenanceTicket | null;
  rooms: Room[];
  assignees: AssigneeOption[];
  /** "assignee" scrolls to + focuses the Assign to field (card "Assign someone"). */
  focus?: "assignee" | "resolve";
  initialStatus?: MaintenanceStatus;
}) {
  const token = useAuthStore((s) => s.token);
  const create = useCreateMaintenanceMutation();
  const update = useUpdateMaintenanceMutation();
  const del = useDeleteMaintenanceMutation();
  const [f, setF] = useState<Form>(blank);
  const [photos, setPhotos] = useState<string[]>([]);
  const [saved, setSaved] = useState<string[]>([]);
  const [removed, setRemoved] = useState<number[]>([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const placeholder = editing?.source === "room_status";

  useEffect(() => {
    if (!open) return;
    setF(editing ? { ...fromTicket(editing), ...(initialStatus ? { status: initialStatus } : {}) } : { ...blank, ...(initialStatus ? { status: initialStatus } : {}) });
    setPhotos([]);
    setRemoved([]);
    setSaved([]);
    setErr(null);
    setConfirmDelete(false);
    if (editing && (editing.photos_count ?? 0) > 0 && token) {
      getMaintenancePhotosApi(token, editing.id).then(setSaved).catch(() => setSaved([]));
    }
  }, [open, editing, initialStatus, token]);

  useEffect(() => {
    if (!open || !focus) return;
    const t = window.setTimeout(() => document.getElementById(focus === "assignee" ? "mt-assignee" : "mt-actual-cost")?.focus(), 250);
    return () => window.clearTimeout(t);
  }, [open, focus]);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((p) => ({ ...p, [k]: v }));
  const room = rooms.find((r) => r.id === f.room_id) ?? null;
  const roomName = room ? formatRoomLabel(room) : null;
  const pending = create.isPending || update.isPending;
  const known = useMemo(() => assignees.find((a) => a.name.toLowerCase() === f.assignee.trim().toLowerCase()), [assignees, f.assignee]);

  const addFiles = async (files: FileList | null) => {
    if (!files) return;
    const room = 6 - (saved.length - removed.length) - photos.length;
    const list = Array.from(files).slice(0, Math.max(0, room));
    try {
      const urls = await Promise.all(list.map((file) => readAsDataUrl(file)));
      setPhotos((p) => [...p, ...urls]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not add the photo");
    }
  };

  const submit = () => {
    if (placeholder) return;
    if (!f.title.trim()) return setErr("Give the problem a short title");
    const phone = f.assignee_phone.trim() || known?.phone || "";
    const draft: MaintenanceDraft = {
      room_id: f.room_id || null,
      title: f.title.trim(),
      description: f.description.trim(),
      priority: f.priority,
      status: f.status,
      assignee: f.assignee.trim() || "Unassigned",
      category: f.category,
      location_detail: f.location_detail.trim(),
      reported_by: f.reported_by.trim(),
      status_note: f.status_note.trim(),
      assignee_phone: phone,
      expected_cost: f.expected_cost ? Number(f.expected_cost) : null,
      actual_cost: f.actual_cost ? Number(f.actual_cost) : null,
      room_offline: Boolean(f.room_id) && f.room_offline,
      ...(photos.length ? { photos } : {}),
      ...(removed.length ? { remove_photos: removed } : {}),
    };
    const done = (msg: string) => {
      toast.success(msg);
      // "Bilal gets a WhatsApp message": open a prepared WhatsApp chat when we know the number.
      if (!editing && phone && draft.assignee !== "Unassigned") {
        const text = `New ${draft.priority === "urgent" ? "URGENT " : ""}repair: ${draft.title}${roomName ? ` — ${roomName}` : ""}${draft.location_detail ? ` (${draft.location_detail})` : ""}.${draft.description ? ` ${draft.description}` : ""}`;
        window.open(waLink(phone, text), "_blank", "noopener");
      }
      onOpenChange(false);
    };
    const fail = (e: unknown) => setErr(e instanceof Error ? e.message : "Could not save the ticket");
    if (editing) update.mutate({ id: editing.id, input: draft }, { onSuccess: () => done("Ticket updated"), onError: fail });
    else create.mutate(draft, { onSuccess: () => done("Ticket created"), onError: fail });
  };

  const footerNote = f.assignee.trim()
    ? (f.assignee_phone.trim() || known?.phone) && !editing
      ? `${f.assignee.trim().split(" ")[0]} gets a WhatsApp message`
      : `Assigned to ${f.assignee.trim()}`
    : "Not assigned yet — you can assign later";

  return (
    <DepositModal open={open} onOpenChange={onOpenChange} width={640}>
      <FinDialogHeader icon={<Wrench />} title={editing ? "Edit ticket" : "New maintenance ticket"} sub={editing ? (editing.created_by_name ? `Opened by ${editing.created_by_name}` : "Change details, status or who is fixing it") : "Tell the team what is broken and where"} />
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 py-5 md:px-6">
        {placeholder ? (
          <p className="rounded-[14px] bg-warning-tint px-4 py-3 text-body text-warning">This room was set to Maintenance in Rooms. Change the room's status there, or create a ticket for it.</p>
        ) : null}
        <div className="flex flex-col gap-2">
          <span className={finLabel}>What kind of problem?</span>
          <div role="radiogroup" aria-label="Problem type" className="grid grid-cols-5 gap-2">
            {CATEGORIES.map(([k, l, Icon]) => (
              <button
                key={k}
                type="button"
                role="radio"
                aria-checked={f.category === k}
                onClick={() => set("category", k)}
                className={cn("flex h-[52px] cursor-pointer flex-col items-center justify-center gap-1 rounded-[12px] border text-label transition-colors [&_svg]:size-4", f.category === k ? "border-ink bg-glass-3 font-medium text-ink" : "border-glass-stroke bg-glass-inset text-ink-2 hover:text-ink")}
              >
                <Icon aria-hidden /> <span className="max-sm:text-[11px]">{l}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className={finLabel}>Where</span>
            <span className="relative">
              <Bed className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-2" aria-hidden />
              <select value={f.room_id} onChange={(e) => set("room_id", e.target.value)} className={cn(finInput, "appearance-none pl-9")}>
                <option value="">Common area</option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {formatRoomLabel(r)}
                  </option>
                ))}
              </select>
            </span>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={finLabel}>Short title</span>
            <input value={f.title} onChange={(e) => set("title", e.target.value)} maxLength={200} placeholder="AC not cooling" className={finInput} aria-invalid={err && !f.title.trim() ? true : undefined} />
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
          <label className="flex flex-col gap-1.5">
            <span className={finLabel}>Details</span>
            <input value={f.description} onChange={(e) => set("description", e.target.value)} maxLength={5000} placeholder="What happens, what you already tried" className={finInput} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={finLabel}>Spot (optional)</span>
            <input value={f.location_detail} onChange={(e) => set("location_detail", e.target.value)} maxLength={120} placeholder={f.room_id ? "Bed 2, shared bath…" : "Floor 2, kitchen…"} className={finInput} />
          </label>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className={finLabel}>How urgent?</span>
          <div role="radiogroup" aria-label="Priority" className="grid grid-cols-4 gap-0.5 rounded-[12px] bg-glass-inset p-1">
            {PRIORITIES.map(([k, l]) => (
              <button key={k} type="button" role="radio" aria-checked={f.priority === k} onClick={() => set("priority", k)} className={cn("h-8 cursor-pointer truncate rounded-[9px] px-1 text-body transition-colors", f.priority === k ? "glass-2 font-medium text-ink" : "text-ink-2 hover:text-ink")}>
                {l}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className={finLabel}>Assign to</span>
            <span className="relative">
              <Users className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-2" aria-hidden />
              <input id="mt-assignee" list="mt-assignees" value={f.assignee} onChange={(e) => set("assignee", e.target.value)} maxLength={120} placeholder="Nobody yet" className={cn(finInput, "pl-9")} />
              <datalist id="mt-assignees">
                {assignees.map((a) => (
                  <option key={a.name} value={a.name}>
                    {a.role ?? ""}
                  </option>
                ))}
              </datalist>
            </span>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={finLabel}>Expected cost (optional)</span>
            <input inputMode="decimal" value={f.expected_cost} onChange={(e) => set("expected_cost", e.target.value.replace(/[^\d.]/g, ""))} placeholder="Rs 4,000" className={finInput} />
          </label>
        </div>
        {f.assignee.trim() && !known?.phone ? (
          <label className="flex flex-col gap-1.5">
            <span className={finLabel}>{f.assignee.trim().split(" ")[0]}'s phone (for WhatsApp, optional)</span>
            <input inputMode="tel" value={f.assignee_phone} onChange={(e) => set("assignee_phone", e.target.value)} maxLength={40} placeholder="0300 1234567" className={finInput} />
          </label>
        ) : null}

        {editing ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className={finLabel}>Status</span>
              <select value={f.status} onChange={(e) => set("status", e.target.value as MaintenanceStatus)} className={cn(finInput, "appearance-none")}>
                {STATUSES.map(([k, l]) => (
                  <option key={k} value={k}>
                    {l}
                  </option>
                ))}
              </select>
            </label>
            {f.status === "resolved" ? (
              <label className="flex flex-col gap-1.5">
                <span className={finLabel}>What it cost</span>
                <input id="mt-actual-cost" inputMode="decimal" value={f.actual_cost} onChange={(e) => set("actual_cost", e.target.value.replace(/[^\d.]/g, ""))} placeholder="Rs 1,200" className={finInput} />
              </label>
            ) : (
              <label className="flex flex-col gap-1.5">
                <span className={finLabel}>Progress note</span>
                <input value={f.status_note} onChange={(e) => set("status_note", e.target.value)} maxLength={200} placeholder="Carpenter coming 12 Nov" className={finInput} />
              </label>
            )}
          </div>
        ) : null}

        <label className="flex flex-col gap-1.5">
          <span className={finLabel}>Reported by (optional)</span>
          <input value={f.reported_by} onChange={(e) => set("reported_by", e.target.value)} maxLength={120} placeholder="Resident or staff name" className={finInput} />
        </label>

        <div className="flex flex-col gap-2">
          <label className="flex cursor-pointer items-center gap-3 rounded-[14px] border border-dashed border-glass-stroke px-4 py-3 hover:bg-glass-inset/50">
            <Upload className="size-4 shrink-0 text-ink-2" aria-hidden />
            <span className="min-w-0 flex-1">
              <span className="block text-body font-medium text-ink">Add photos</span>
              <span className="block text-label text-ink-2">Helps the repair person bring the right parts</span>
            </span>
            <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => void addFiles(e.target.files)} />
          </label>
          {saved.length || photos.length ? (
            <div className="flex flex-wrap gap-2">
              {saved.map((src, i) =>
                removed.includes(i) ? null : (
                  <Thumb key={`s${i}`} src={src} onRemove={() => setRemoved((r) => [...r, i])} />
                ),
              )}
              {photos.map((src, i) => (
                <Thumb key={`n${i}`} src={src} onRemove={() => setPhotos((p) => p.filter((_, j) => j !== i))} />
              ))}
              {saved.length - removed.length + photos.length < 6 ? (
                <label className="flex size-16 cursor-pointer items-center justify-center rounded-[12px] bg-glass-inset text-ink-2 hover:text-ink">
                  <ImagePlus className="size-5" aria-hidden />
                  <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => void addFiles(e.target.files)} />
                </label>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className={cn("flex items-center gap-3 rounded-[14px] bg-glass-inset px-4 py-3", !f.room_id && "opacity-60")}>
          <div className="min-w-0 flex-1">
            <p className="text-body font-medium text-ink">Take room out of service</p>
            <p className="text-label text-ink-2">{roomName ? `${roomName} will show as Maintenance and can't be booked until fixed` : "Pick a room above to use this"}</p>
          </div>
          <FinToggle checked={Boolean(f.room_id) && f.room_offline} onChange={(v) => f.room_id && set("room_offline", v)} label="Take room out of service" />
        </div>
        {err ? <p className="text-label text-danger">{err}</p> : null}
      </div>
      <div className="flex flex-col gap-3 border-t border-glass-divider px-5 py-4 sm:flex-row sm:items-center md:px-6">
        <p className="flex-1 text-label text-ink-2">{footerNote}</p>
        <div className="flex items-center gap-2">
          {editing && !placeholder ? (
            confirmDelete ? (
              <GlassButton
                variant="danger"
                disabled={del.isPending}
                onClick={() =>
                  del.mutate(editing.id, {
                    onSuccess: () => {
                      toast.success("Ticket deleted");
                      onOpenChange(false);
                    },
                    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not delete"),
                  })
                }
              >
                <Trash2 aria-hidden /> Delete?
              </GlassButton>
            ) : (
              <GlassButton variant="ghost" aria-label="Delete ticket" onClick={() => setConfirmDelete(true)} className="px-3">
                <Trash2 aria-hidden />
              </GlassButton>
            )
          ) : null}
          <GlassButton variant="glass" onClick={() => onOpenChange(false)} className="max-sm:flex-1">
            Cancel
          </GlassButton>
          <GlassButton onClick={submit} disabled={pending || placeholder} className="max-sm:flex-1">
            {pending ? <Loader2 className="animate-spin" aria-hidden /> : <Check aria-hidden />} {editing ? "Save changes" : "Create ticket"}
          </GlassButton>
        </div>
      </div>
    </DepositModal>
  );
}

function Thumb({ src, onRemove }: { src: string; onRemove: () => void }) {
  return (
    <span className="relative size-16 overflow-hidden rounded-[12px] bg-glass-inset">
      <img src={src} alt="" className="size-full object-cover" />
      <button type="button" aria-label="Remove photo" onClick={onRemove} className="absolute top-1 right-1 flex size-5 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white">
        <X className="size-3" />
      </button>
    </span>
  );
}
