import { StickyBar } from "@/components/admin/sticky-bar";
import { createFileRoute } from "@tanstack/react-router";
import * as Dialog from "@radix-ui/react-dialog";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Check, Clock, Ellipsis, Eye, EyeOff, Globe, GripVertical, Loader2, Pencil, Plus, Sparkles, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { GlassButton } from "@/components/glass";
import { PageHeader } from "@/components/admin/page-header";
import { FinKpi, FinToggle, Segmented, finInput, finLabel } from "@/components/admin/finance/finance-kit";
import { DepositModal } from "@/components/admin/security/deposit-shared";
import { useFacilitiesQuery, useCreateFacilityMutation, useDeleteFacilityMutation, useReorderFacilitiesMutation, useSeedMissingFacilitiesMutation, useUpdateFacilityMutation } from "@/queries/facilities";
import { usePropertySettingsQuery } from "@/queries/settings";
import { FACILITY_ICON_OPTIONS } from "@/lib/facility-icon-options";
import { resolveFacilityIcon } from "@/lib/resolve-facility-icon";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Facility } from "@/types/domain/facility.types";

/** Figma 12 · Facilities (12.01 list + website preview, 12.02 edit facility, 12.03 mobile). */
export const Route = createFileRoute("/admin/facilities")({ component: FacilitiesPage });

type Filter = "all" | "visible" | "hidden";
const DESC_MAX = 80;
/** Icon picker order (Figma 12.02), then the rest of the allowed icons. */
const PICKER = ["Wifi", "ShieldCheck", "Zap", "Droplet", "Sparkles", "Lock", "Package", "Building2", "MapPin", "KeyRound", "Users", "Clock", "CreditCard", "Smartphone"];
const ICONS = [...PICKER, ...FACILITY_ICON_OPTIONS.filter((i) => !PICKER.includes(i))];

function relTime(iso?: string | null) {
  if (!iso) return "—";
  const m = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));
  if (m < 1) return "Just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.round(h / 24);
  if (d < 31) return `${d} day${d === 1 ? "" : "s"} ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function siteUrl(raw?: string | null) {
  const v = (raw ?? "").trim();
  if (!v) return null;
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}

function FacilitiesPage() {
  const mobile = useIsMobile();
  const { data, isLoading, isError } = useFacilitiesQuery();
  const settings = usePropertySettingsQuery();
  const update = useUpdateFacilityMutation();
  const reorder = useReorderFacilitiesMutation();
  const seed = useSeedMissingFacilitiesMutation();
  const [filter, setFilter] = useState<Filter>("all");
  const [dialog, setDialog] = useState<{ editing: Facility | null } | null>(null);
  const [order, setOrder] = useState<Facility[]>([]);
  const [dragId, setDragId] = useState<string | null>(null);

  const server = data?.facilities;
  useEffect(() => {
    if (server) setOrder([...server].sort((a, b) => a.sort_order - b.sort_order));
  }, [server]);

  const stats = data?.stats;
  const visible = order.filter((f) => f.is_visible);
  const shown = order.filter((f) => (filter === "all" ? true : filter === "visible" ? f.is_visible : !f.is_visible));
  const url = siteUrl((settings.data as { website?: string } | undefined)?.website);
  const facilitiesUrl = url ? `${url.replace(/\/$/, "")}/facilities` : null;

  const saveOrder = (next: Facility[]) => {
    setOrder(next);
    reorder.mutate(
      next.map((f) => f.id),
      { onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save the order") },
    );
  };
  const moveBy = (f: Facility, by: number) => {
    const i = order.findIndex((x) => x.id === f.id);
    const j = i + by;
    if (i < 0 || j < 0 || j >= order.length) return;
    const next = [...order];
    [next[i], next[j]] = [next[j], next[i]];
    saveOrder(next);
  };
  const toggle = (f: Facility, v: boolean) => {
    setOrder((o) => o.map((x) => (x.id === f.id ? { ...x, is_visible: v } : x)));
    update.mutate({ id: f.id, input: { is_visible: v } }, { onError: (e) => toast.error(e instanceof Error ? e.message : "Could not update") });
  };

  return (
    <>
      <PageHeader
        title="Facilities"
        subtitle={mobile ? `${stats?.visible ?? visible.length} on website · ${stats?.hidden ?? order.length - visible.length} hidden` : "What your hostel offers · shown on the website in this order"}
        className={mobile ? "relative" : undefined}
        actions={
          mobile ? (
            // Figma 12.03: round + button on phones.
            <GlassButton aria-label="Add facility" onClick={() => setDialog({ editing: null })} className="absolute top-2 right-0 size-12 rounded-[16px] px-0">
              <Plus aria-hidden />
            </GlassButton>
          ) : (
          <>
            {facilitiesUrl ? (
              <GlassButton asChild variant="glass" className="max-sm:hidden">
                <a href={facilitiesUrl} target="_blank" rel="noreferrer">
                  <Globe aria-hidden /> View on website
                </a>
              </GlassButton>
            ) : null}
            <GlassButton onClick={() => setDialog({ editing: null })}>
              <Plus aria-hidden /> Add facility
            </GlassButton>
          </>
          )
        }
      />

      <div className="flex flex-col gap-4 md:gap-5">
        <div className="grid grid-cols-2 gap-3 max-md:hidden md:grid-cols-3 md:gap-4">
          <FinKpi icon={<Eye />} label="On website" value={String(stats?.visible ?? visible.length)} sub="Shown to visitors" />
          <FinKpi icon={<EyeOff />} label="Hidden" value={String(stats?.hidden ?? order.length - visible.length)} sub="Saved but not shown" />
          <FinKpi className="max-md:col-span-2" icon={<Clock />} label="Last updated" value={relTime(stats?.last_updated_at)} sub={stats?.last_updated_by ? `By ${stats.last_updated_by}` : "—"} />
        </div>

        <div className="grid items-start gap-4 md:gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="flex min-w-0 flex-col gap-3">
            <StickyBar className="mx-0 px-0 max-md:hidden md:mx-0 md:px-0"><div className="flex flex-wrap items-center gap-3 max-md:hidden">
              <Segmented
                label="Show"
                value={filter}
                onChange={setFilter}
                options={[
                  ["all", "All", order.length],
                  ["visible", "On website", visible.length],
                  ["hidden", "Hidden", order.length - visible.length],
                ] as const}
              />
              <span className="flex-1" />
              {(data?.missingDefaultCount ?? 0) > 0 && order.length > 0 ? (
                <button type="button" disabled={seed.isPending} onClick={() => seed.mutate(undefined, { onSuccess: () => toast.success("Suggested facilities added") })} className="cursor-pointer text-label font-medium text-brand-text hover:underline">
                  + {data?.missingDefaultCount} suggested
                </button>
              ) : null}
              {filter === "all" ? <span className="text-label text-ink-2 max-sm:hidden">Drag ⠿ to change the order</span> : null}
            </div></StickyBar>

            {isError ? (
              <div className="glass-2 rounded-[22px] px-4 py-14 text-center text-body text-danger">Could not load facilities. Is the API running?</div>
            ) : isLoading ? (
              Array.from({ length: 6 }, (_, i) => <div key={i} className="h-[70px] animate-pulse rounded-[18px] bg-glass-inset" />)
            ) : shown.length === 0 ? (
              <div className="glass-2 flex flex-col items-center gap-3 rounded-[22px] px-4 py-12 text-center">
                <p className="text-body text-ink-2">{order.length ? "Nothing here." : "No facilities yet."}</p>
                {(data?.missingDefaultCount ?? 0) > 0 ? (
                  <GlassButton size="sm" variant="glass" disabled={seed.isPending} onClick={() => seed.mutate(undefined, { onSuccess: () => toast.success("Default facilities added") })}>
                    <Sparkles aria-hidden /> Add {data?.missingDefaultCount} suggested facilities
                  </GlassButton>
                ) : null}
              </div>
            ) : (
              <ol className="flex flex-col gap-2.5">
                {shown.map((f) => {
                  const pos = order.findIndex((x) => x.id === f.id);
                  return (
                    <li
                      key={f.id}
                      draggable={filter === "all"}
                      onDragStart={(e) => {
                        e.dataTransfer.effectAllowed = "move";
                        setDragId(f.id);
                      }}
                      onDragEnd={() => {
                        if (dragId && server) {
                          const same = order.map((x) => x.id).join() === [...server].sort((a, b) => a.sort_order - b.sort_order).map((x) => x.id).join();
                          if (!same) saveOrder(order);
                        }
                        setDragId(null);
                      }}
                      onDragOver={(e) => {
                        if (!dragId || dragId === f.id) return;
                        e.preventDefault();
                        setOrder((o) => {
                          const from = o.findIndex((x) => x.id === dragId);
                          const to = o.findIndex((x) => x.id === f.id);
                          if (from < 0 || to < 0) return o;
                          const next = [...o];
                          const [m] = next.splice(from, 1);
                          next.splice(to, 0, m);
                          return next;
                        });
                      }}
                    >
                      <FacilityRow f={f} pos={pos} last={pos === order.length - 1} dragging={dragId === f.id} canDrag={filter === "all"} onToggle={(v) => toggle(f, v)} onEdit={() => setDialog({ editing: f })} onMove={(by) => moveBy(f, by)} />
                    </li>
                  );
                })}
              </ol>
            )}
          </div>

          {mobile ? null : <WebsitePreview facilities={visible} url={facilitiesUrl} />}
        </div>
      </div>

      <FacilityDialog open={dialog != null} onOpenChange={(o) => !o && setDialog(null)} editing={dialog?.editing ?? null} position={dialog?.editing ? order.findIndex((x) => x.id === dialog.editing?.id) + 1 : order.length + 1} />
    </>
  );
}

function FacilityRow({ f, pos, last, dragging, canDrag, onToggle, onEdit, onMove }: { f: Facility; pos: number; last: boolean; dragging: boolean; canDrag: boolean; onToggle: (v: boolean) => void; onEdit: () => void; onMove: (by: number) => void }) {
  const Icon = resolveFacilityIcon(f.icon);
  const del = useDeleteFacilityMutation();
  return (
    <div className={cn("glass-2 flex items-center gap-3 rounded-[18px] px-3 py-3 transition-opacity md:px-4", dragging && "opacity-40", !f.is_visible && "[&_.fac-main]:opacity-55")}>
      <GripVertical className={cn("size-4 shrink-0 text-ink-3 max-sm:hidden", canDrag ? "cursor-grab" : "opacity-30")} aria-hidden />
      <span className="fac-main w-6 shrink-0 text-label text-ink-2 tabular-nums max-sm:hidden">{String(pos + 1).padStart(2, "0")}</span>
      <span className="fac-main flex size-11 shrink-0 items-center justify-center rounded-[12px] bg-brand-tint text-brand-text [&_svg]:size-5">
        <Icon aria-hidden />
      </span>
      {/* On phones the whole text opens the editor (Figma 12.03 has no edit / ⋯ buttons). */}
      <button type="button" onClick={onEdit} tabIndex={-1} className="fac-main min-w-0 flex-1 text-left md:pointer-events-none">
        <p className="truncate text-body font-semibold text-ink">{f.title}</p>
        <p className="text-label text-ink-2 max-md:line-clamp-2 md:truncate">{f.description}</p>
      </button>
      <span className="text-label text-ink-2 max-sm:hidden">{f.is_visible ? "On website" : "Hidden"}</span>
      <FinToggle checked={f.is_visible} onChange={onToggle} label={`Show ${f.title} on website`} />
      <button type="button" aria-label={`Edit ${f.title}`} onClick={onEdit} className="glass-2 flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-[12px] text-ink hover:bg-glass-inset max-sm:hidden">
        <Pencil className="size-4" aria-hidden />
      </button>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger aria-label={`More for ${f.title}`} className="flex size-8 max-md:hidden shrink-0 cursor-pointer items-center justify-center rounded-[10px] text-ink-2 outline-none hover:bg-glass-inset hover:text-ink">
          <Ellipsis className="size-4" aria-hidden />
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content align="end" sideOffset={6} className="glass-3 z-50 min-w-[180px] rounded-[14px] p-1 font-geist text-body text-ink shadow-lg">
            <MenuItem onSelect={onEdit} icon={<Pencil />}>Edit</MenuItem>
            <MenuItem onSelect={() => onMove(-1)} disabled={pos === 0} icon={<ArrowUp />}>Move up</MenuItem>
            <MenuItem onSelect={() => onMove(1)} disabled={last} icon={<ArrowDown />}>Move down</MenuItem>
            <DropdownMenu.Separator className="my-1 h-px bg-glass-divider" />
            <MenuItem
              danger
              icon={<Trash2 />}
              onSelect={() => {
                if (!window.confirm(`Delete “${f.title}”? It disappears from the website.`)) return;
                del.mutate(f.id, { onSuccess: () => toast.success("Facility deleted"), onError: (e) => toast.error(e instanceof Error ? e.message : "Could not delete") });
              }}
            >
              Delete
            </MenuItem>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
}

function MenuItem({ children, icon, onSelect, disabled, danger }: { children: React.ReactNode; icon: React.ReactNode; onSelect: () => void; disabled?: boolean; danger?: boolean }) {
  return (
    <DropdownMenu.Item disabled={disabled} onSelect={onSelect} className={cn("flex h-9 cursor-pointer items-center gap-2.5 rounded-[10px] px-2.5 outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-40 data-[highlighted]:bg-glass-inset [&_svg]:size-4", danger ? "text-danger" : "text-ink")}>
      {icon}
      {children}
    </DropdownMenu.Item>
  );
}

function WebsitePreview({ facilities, url }: { facilities: Facility[]; url: string | null }) {
  return (
    <aside className="glass-2 flex flex-col gap-4 rounded-[22px] p-4 md:p-5 max-xl:hidden">
      <p className="flex items-center gap-2 text-body font-semibold text-ink">
        <Globe className="size-4 text-ink-2" aria-hidden /> How it looks on your website
      </p>
      <div className="flex flex-col gap-4 rounded-[18px] bg-glass-inset p-4">
        <p className="text-[11px] leading-4 font-semibold tracking-[0.08em] text-brand-text uppercase">Our facilities</p>
        <p className="text-[24px] leading-[30px] font-semibold tracking-[-0.24px] text-ink">Everything you need to live and study</p>
        {facilities.length ? (
          <div className="grid grid-cols-2 gap-2">
            {facilities.slice(0, 8).map((f) => {
              const Icon = resolveFacilityIcon(f.icon);
              return (
                <div key={f.id} className="flex flex-col gap-2 rounded-[12px] bg-glass-3 p-3">
                  <span className="flex size-6 items-center justify-center rounded-[7px] bg-brand-tint text-brand-text [&_svg]:size-3.5">
                    <Icon aria-hidden />
                  </span>
                  <span className="truncate text-label font-medium text-ink">{f.title}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-label text-ink-2">Nothing is shown yet — switch a facility on.</p>
        )}
        {facilities.length > 8 ? <p className="text-label text-ink-2">+{facilities.length - 8} more on the page</p> : null}
      </div>
      <p className="text-label text-ink-2">Only facilities marked “On website” show here, in the order on the left.</p>
      {url ? (
        <GlassButton asChild variant="glass" size="sm" className="h-9 w-full">
          <a href={url} target="_blank" rel="noreferrer">
            <Globe aria-hidden /> Open live website
          </a>
        </GlassButton>
      ) : (
        <p className="text-label text-ink-3">Add your website address in Settings to open it from here.</p>
      )}
    </aside>
  );
}

function FacilityDialog({ open, onOpenChange, editing, position }: { open: boolean; onOpenChange: (o: boolean) => void; editing: Facility | null; position: number }) {
  const create = useCreateFacilityMutation();
  const update = useUpdateFacilityMutation();
  const del = useDeleteFacilityMutation();
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [icon, setIcon] = useState("Sparkles");
  const [vis, setVis] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTitle(editing?.title ?? "");
    setDesc(editing?.description ?? "");
    setIcon(editing?.icon ?? "Sparkles");
    setVis(editing?.is_visible ?? true);
    setErr(null);
    setConfirm(false);
  }, [open, editing]);

  const Icon = useMemo(() => resolveFacilityIcon(icon), [icon]);
  const pending = create.isPending || update.isPending;

  const save = () => {
    if (!title.trim()) return setErr("Give the facility a name");
    if (!desc.trim()) return setErr("Add a short description");
    const input = { title: title.trim(), description: desc.trim(), icon, is_visible: vis };
    const done = () => {
      toast.success(editing ? "Facility saved" : "Facility added");
      onOpenChange(false);
    };
    const fail = (e: unknown) => setErr(e instanceof Error ? e.message : "Could not save");
    if (editing) update.mutate({ id: editing.id, input }, { onSuccess: done, onError: fail });
    else create.mutate(input, { onSuccess: done, onError: fail });
  };

  return (
    <DepositModal open={open} onOpenChange={onOpenChange} width={580}>
      <div className="flex items-center gap-3 border-b border-glass-divider px-5 py-4 md:px-6 md:py-5">
        <span className="hidden size-10 shrink-0 items-center justify-center text-ink md:flex [&_svg]:size-5">{editing ? <Pencil /> : <Plus />}</span>
        <div className="min-w-0 flex-1">
          <Dialog.Title className="truncate text-[22px] leading-7 font-semibold tracking-[-0.24px] text-ink md:text-[24px]">{editing ? "Edit facility" : "Add facility"}</Dialog.Title>
          <p className="truncate text-label text-ink-2">{editing ? `${editing.title} · position ${position} on the website` : `Goes to position ${position} on the website`}</p>
        </div>
        <Dialog.Close aria-label="Close" className="glass-2 flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-[12px] text-ink hover:brightness-95">
          <X className="size-4" aria-hidden />
        </Dialog.Close>
      </div>
      <div className="grid min-h-0 flex-1 gap-5 overflow-y-auto px-5 py-5 md:grid-cols-[1fr_170px] md:px-6">
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className={finLabel}>Name</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={60} placeholder="Laundry" className={finInput} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={finLabel}>Short description</span>
            <input value={desc} onChange={(e) => setDesc(e.target.value.slice(0, DESC_MAX))} placeholder="Washing machines on the roof · free" className={finInput} />
            <span className={cn("text-label", desc.length >= DESC_MAX ? "text-warning" : "text-ink-2")}>
              {desc.length} / {DESC_MAX} characters
            </span>
          </label>
          <div className="flex flex-col gap-2">
            <span className={finLabel}>Icon</span>
            <div role="radiogroup" aria-label="Icon" className="flex flex-wrap gap-2">
              {ICONS.map((name) => {
                const I = resolveFacilityIcon(name);
                return (
                  <button key={name} type="button" role="radio" aria-checked={icon === name} aria-label={name} title={name} onClick={() => setIcon(name)} className={cn("flex size-[34px] cursor-pointer items-center justify-center rounded-[10px] border transition-colors [&_svg]:size-4", icon === name ? "border-brand-border bg-brand-tint text-brand-text" : "border-transparent bg-glass-inset text-ink-2 hover:text-ink")}>
                    <I aria-hidden />
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-[14px] bg-glass-inset px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="text-body font-medium text-ink">Show on website</p>
              <p className="text-label text-ink-2">Turn off to keep it saved but hidden</p>
            </div>
            <FinToggle checked={vis} onChange={setVis} label="Show on website" />
          </div>
          {err ? <p className="text-label text-danger">{err}</p> : null}
        </div>
        <div className="flex flex-col gap-2 max-md:hidden">
          <span className="text-[11px] leading-4 font-semibold tracking-[0.06em] text-ink-2 uppercase">Preview</span>
          <div className="flex flex-col gap-2 rounded-[14px] p-3">
            <span className="flex size-9 items-center justify-center rounded-[10px] bg-brand-tint text-brand-text [&_svg]:size-[18px]">
              <Icon aria-hidden />
            </span>
            <p className="text-body font-semibold text-ink">{title || "Facility name"}</p>
            <p className="text-label text-ink-2">{desc || "Short description"}</p>
          </div>
          <p className="text-label text-ink-2">This is the card visitors see</p>
        </div>
      </div>
      <div className="flex items-center gap-2 border-t border-glass-divider px-5 py-4 md:px-6">
        {editing ? (
          <GlassButton
            variant={confirm ? "danger" : "ghost"}
            disabled={del.isPending}
            onClick={() => {
              if (!confirm) return setConfirm(true);
              del.mutate(editing.id, {
                onSuccess: () => {
                  toast.success("Facility deleted");
                  onOpenChange(false);
                },
                onError: (e) => toast.error(e instanceof Error ? e.message : "Could not delete"),
              });
            }}
          >
            <Trash2 aria-hidden /> {confirm ? "Delete for good?" : "Delete"}
          </GlassButton>
        ) : null}
        <span className="flex-1" />
        <GlassButton variant="glass" onClick={() => onOpenChange(false)}>
          Cancel
        </GlassButton>
        <GlassButton onClick={save} disabled={pending}>
          {pending ? <Loader2 className="animate-spin" aria-hidden /> : <Check aria-hidden />} {editing ? "Save changes" : "Add facility"}
        </GlassButton>
      </div>
    </DepositModal>
  );
}
