import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Building2, Camera, Check, Link2, Loader2, Lock, Mail, MapPin, Pencil, Phone, Plus, Trash2, Unlock } from "lucide-react";
import { toast } from "sonner";
import { GlassButton } from "@/components/glass";
import { PageHeader } from "@/components/admin/page-header";
import { FinToggle, finInput, finLabel } from "@/components/admin/finance/finance-kit";
import { useHostelsQuery, useCreateHostelMutation, useUpdateHostelMutation, useSetDefaultHostelMutation, usePauseHostelMutation } from "@/queries/hostels";
import { getHostelStatsApi } from "@/api/hostels";
import { usePropertySettingsQuery } from "@/queries/settings";
import { useAuthStore } from "@/stores/auth/auth.store";
import { formatMoney } from "@/lib/payments";
import { cn } from "@/lib/utils";
import type { Hostel, HostelInput } from "@/types/domain/hostel.types";

const MapPinPicker = lazy(() => import("@/components/admin/hostels/map-pin"));

/** Figma 16.02 · Properties — your hostels, switch between them from the top bar. */
export const Route = createFileRoute("/admin/hostels")({ component: PropertiesPage });

type Draft = {
  name: string;
  slug: string;
  address: string;
  area: string;
  city: string;
  phone: string;
  email: string;
  latitude: number | null;
  longitude: number | null;
  status: "active" | "inactive";
  cover_image: string;
  opening_note: string;
};

const blank: Draft = { name: "", slug: "", address: "", area: "", city: "", phone: "", email: "", latitude: null, longitude: null, status: "active", cover_image: "", opening_note: "" };
const toDraft = (h: Hostel): Draft => ({ name: h.name, slug: h.slug, address: h.address, area: h.area, city: h.city, phone: h.phone, email: h.email, latitude: h.latitude, longitude: h.longitude, status: h.status, cover_image: h.cover_image ?? "", opening_note: h.opening_note ?? "" });

/** Downscale a photo to a ≤1200px JPEG so it stays small. */
function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.size > 12_000_000) return reject(new Error("Photo is too large"));
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, 1200 / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      c.getContext("2d")?.drawImage(img, 0, 0, c.width, c.height);
      resolve(c.toDataURL("image/jpeg", 0.8));
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => reject(new Error("Could not read the photo"));
    img.src = URL.createObjectURL(file);
  });
}

function PropertiesPage() {
  const token = useAuthStore((s) => s.token);
  const { data, isLoading, isError } = useHostelsQuery();
  const stats = useQuery({ queryKey: ["hostels", "stats"], queryFn: () => getHostelStatsApi(token as string), enabled: Boolean(token) });
  const settings = usePropertySettingsQuery();
  const setDefault = useSetDefaultHostelMutation();
  const pause = usePauseHostelMutation();
  const update = useUpdateHostelMutation();
  const hostels: Hostel[] = data?.hostels ?? [];
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  // Open the default property's form first, like the Figma.
  useEffect(() => {
    if (editing === null && hostels.length) setEditing((hostels.find((h) => h.is_default) ?? hostels[0]).id);
  }, [hostels, editing]);

  const site = ((settings.data as { website?: string } | undefined)?.website ?? "").trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
  const current = editing && editing !== "new" ? hostels.find((h) => h.id === editing) ?? null : null;
  const fail = (e: unknown) => toast.error(e instanceof Error ? e.message : "Something went wrong");

  const edit = (id: string | "new") => {
    setEditing(id);
    window.setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  return (
    <>
      <PageHeader
        title="Properties"
        subtitle="Your hostels · switch between them from the top bar"
        actions={
          <GlassButton onClick={() => edit("new")}>
            <Plus aria-hidden /> Add property
          </GlassButton>
        }
      />

      <div className="flex flex-col gap-4 md:gap-5">
        {isError ? (
          <div className="glass-2 rounded-[22px] px-4 py-14 text-center text-body text-danger">Could not load properties. Is the API running?</div>
        ) : isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-[320px] animate-pulse rounded-[22px] bg-glass-inset" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {hostels.map((h) => {
              const st = stats.data?.[h.id];
              const photo = h.cover_image || st?.photo || null;
              const paused = h.status !== "active";
              return (
                <article key={h.id} className={cn("glass-2 flex flex-col overflow-hidden rounded-[22px]", editing === h.id && "ring-2 ring-brand-border")}>
                  <div className="relative h-[150px] bg-glass-inset">
                    {photo ? <img src={photo} alt="" className={cn("size-full object-cover", paused && "opacity-70 grayscale-[30%]")} /> : <Building2 className="absolute top-1/2 left-1/2 size-10 -translate-1/2 text-ink-3" aria-hidden />}
                  </div>
                  <div className="flex flex-col gap-3 p-4">
                    <div className="flex items-center gap-2">
                      <h2 className="min-w-0 flex-1 truncate text-card-title text-ink">{h.name}</h2>
                      <span className="inline-flex h-[22px] shrink-0 items-center gap-1.5 rounded-full border border-ink-2/70 px-2 text-[12px] font-medium text-ink-2">
                        <span className="size-1.5 rounded-full bg-current" aria-hidden />
                        {h.is_default ? "Default" : paused ? "Paused" : "Active"}
                      </span>
                    </div>
                    <p className="-mt-1 flex items-center gap-1.5 truncate text-label text-ink-2">
                      <MapPin className="size-3.5 shrink-0" aria-hidden />
                      {[h.area, h.city].filter(Boolean).join(", ") || h.address || "No address yet"}
                    </p>
                    {paused ? (
                      <p className="truncate rounded-[10px] bg-glass-inset px-2.5 py-2 text-label text-ink-2">{[h.opening_note, "hidden on website"].filter(Boolean).join(" · ")}</p>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        <p className="truncate rounded-[10px] bg-glass-inset px-2.5 py-2 text-label text-ink-2">{st ? `${st.beds_total} beds · ${st.beds_filled} filled` : "—"}</p>
                        <p className="truncate rounded-[10px] bg-glass-inset px-2.5 py-2 text-label text-ink-2">{st ? `${formatMoney(st.monthly_revenue, st.currency)} / month` : "—"}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                      <GlassButton variant="glass" size="sm" className="h-9" onClick={() => edit(h.id)}>
                        <Pencil aria-hidden /> Edit
                      </GlassButton>
                      {h.is_default ? (
                        <span className="flex h-9 items-center justify-center gap-1.5 text-label text-ink-2">
                          <Check className="size-4" aria-hidden /> Default property
                        </span>
                      ) : paused ? (
                        <GlassButton variant="glass" size="sm" className="h-9" disabled={update.isPending} onClick={() => update.mutate({ id: h.id, input: { status: "active" } }, { onSuccess: () => toast.success(`${h.name} is back on the website`), onError: fail })}>
                          Resume
                        </GlassButton>
                      ) : (
                        <GlassButton variant="glass" size="sm" className="h-9" disabled={setDefault.isPending} onClick={() => setDefault.mutate(h.id, { onSuccess: () => toast.success(`${h.name} is now the default`), onError: fail })}>
                          Make default
                        </GlassButton>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <div ref={formRef} className="scroll-mt-4">
          {editing ? (
            <PropertyForm
              key={editing}
              hostel={current}
              site={site}
              onDone={(id) => setEditing(id ?? null)}
              onPause={
                current && current.status === "active"
                  ? () => {
                      if (!window.confirm(`Pause ${current.name}? It is hidden on the website and its rooms can't be booked online. Nothing is deleted.`)) return;
                      pause.mutate(current.id, { onSuccess: () => toast.success(`${current.name} paused — hidden on website`), onError: fail });
                    }
                  : undefined
              }
            />
          ) : null}
        </div>
      </div>
    </>
  );
}

function PropertyForm({ hostel, site, onDone, onPause }: { hostel: Hostel | null; site: string; onDone: (id?: string) => void; onPause?: () => void }) {
  const create = useCreateHostelMutation();
  const update = useUpdateHostelMutation();
  const [d, setD] = useState<Draft>(hostel ? toDraft(hostel) : blank);
  const [err, setErr] = useState<string | null>(null);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((p) => ({ ...p, [k]: v }));
  const pending = create.isPending || update.isPending;

  const save = () => {
    if (d.name.trim().length < 2) return setErr("Give the property a name");
    const input: HostelInput = {
      name: d.name.trim(),
      slug: d.slug.trim() || undefined,
      address: d.address,
      area: d.area,
      city: d.city,
      phone: d.phone,
      email: d.email,
      status: d.status,
      latitude: d.latitude,
      longitude: d.longitude,
      cover_image: d.cover_image,
      opening_note: d.opening_note,
    };
    const fail = (e: unknown) => setErr(e instanceof Error ? e.message : "Could not save");
    if (hostel) update.mutate({ id: hostel.id, input }, { onSuccess: () => toast.success("Property saved"), onError: fail });
    else create.mutate(input, { onSuccess: (h) => { toast.success("Property added"); onDone((h as Hostel)?.id); }, onError: fail });
  };

  const field = (k: keyof Draft, label: string, icon?: React.ReactNode, placeholder?: string, type = "text") => (
    <label className="flex flex-col gap-1.5">
      <span className={finLabel}>{label}</span>
      <span className="relative">
        {icon ? <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-2 [&_svg]:size-4">{icon}</span> : null}
        <input type={type} value={String(d[k] ?? "")} onChange={(e) => set(k, e.target.value as never)} placeholder={placeholder} className={cn(finInput, icon && "pl-9")} />
      </span>
    </label>
  );

  return (
    <section className="glass-2 flex flex-col gap-5 rounded-[22px] p-4 md:p-5">
      <div>
        <p className="text-card-title text-ink">{hostel ? `Edit · ${hostel.name}` : "Add property"}</p>
        <p className="text-label text-ink-2">Shown on the website, receipts and invoices</p>
      </div>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {field("name", "Name", undefined, "Stay Inn Gulberg")}
            <label className="flex flex-col gap-1.5">
              <span className={finLabel}>Web address</span>
              <span className={cn(finInput, "flex items-center gap-2 focus-within:border-brand-border")}>
                <Link2 className="size-4 shrink-0 text-ink-2" aria-hidden />
                {site ? <span className="shrink-0 text-ink">{site}/</span> : null}
                <input value={d.slug} onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} placeholder="gulberg" aria-label="Web address" className="min-w-0 flex-1 bg-transparent font-medium text-ink outline-none placeholder:font-normal placeholder:text-ink-3" />
              </span>
            </label>
          </div>
          {field("address", "Street address", <MapPin />, "12 Main Boulevard, Gulberg III")}
          <div className="grid gap-3 sm:grid-cols-2">
            {field("area", "Area", undefined, "Gulberg")}
            {field("city", "City", undefined, "Lahore")}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {field("phone", "Phone", <Phone />, "+92 42 3577 1100", "tel")}
            {field("email", "Email", <Mail />, "gulberg@stayinn.pk", "email")}
          </div>
          {d.status !== "active" ? field("opening_note", "Note on the card (optional)", undefined, "Opening Jan 2027") : null}
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <span className={finLabel}>Location on map</span>
            <Suspense fallback={<div className="h-[140px] animate-pulse rounded-[14px] bg-glass-inset" />}>
              <MapPinPicker
                lat={d.latitude}
                lng={d.longitude}
                onChange={(lat, lng) => setD((p) => ({ ...p, latitude: lat, longitude: lng }))}
                className="z-0 h-[140px] overflow-hidden rounded-[14px] border border-glass-stroke"
              />
            </Suspense>
            <span className="text-label text-ink-2">{d.latitude != null && d.longitude != null ? `${d.latitude.toFixed(4)}, ${d.longitude.toFixed(4)} · drag the pin to adjust` : "Click the map to drop the pin — used for “nearest hostel” on the website"}</span>
          </div>
          <div className="flex items-center gap-3 rounded-[14px] bg-glass-inset px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="text-body font-medium text-ink">Show on website</p>
              <p className="text-label text-ink-2">Turn off to pause bookings</p>
            </div>
            <FinToggle checked={d.status === "active"} onChange={(v) => set("status", v ? "active" : "inactive")} label="Show on website" />
          </div>
          <div className="flex items-center gap-3">
            <span className="relative h-14 w-20 shrink-0 overflow-hidden rounded-[10px] bg-glass-inset">
              {d.cover_image ? <img src={d.cover_image} alt="" className="size-full object-cover" /> : <Camera className="absolute top-1/2 left-1/2 size-5 -translate-1/2 text-ink-3" aria-hidden />}
            </span>
            <div className="flex flex-wrap gap-2">
              <label className="glass-2 inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-[10px] px-3 text-label font-medium text-ink hover:bg-glass-inset">
                <Camera className="size-4" aria-hidden /> {d.cover_image ? "Change photo" : "Card photo"}
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) compressImage(f).then((url) => set("cover_image", url)).catch((x) => toast.error(x.message));
                  }}
                />
              </label>
              {d.cover_image ? (
                <button type="button" onClick={() => set("cover_image", "")} className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-[10px] px-2 text-label text-ink-2 hover:text-danger">
                  <Trash2 className="size-4" aria-hidden /> Remove
                </button>
              ) : (
                <span className="self-center text-label text-ink-3">Else the first room photo</span>
              )}
            </div>
          </div>
        </div>
      </div>
      {err ? <p className="text-label text-danger">{err}</p> : null}
      <div className="flex flex-wrap items-center gap-2">
        {onPause ? (
          <GlassButton variant="ghost" onClick={onPause}>
            <Lock aria-hidden /> Pause property
          </GlassButton>
        ) : hostel && hostel.status !== "active" ? (
          <span className="flex items-center gap-1.5 text-label text-ink-2">
            <Unlock className="size-4" aria-hidden /> Paused — switch “Show on website” on and save to resume
          </span>
        ) : null}
        <span className="flex-1" />
        <GlassButton variant="glass" onClick={() => (hostel ? setD(toDraft(hostel)) : onDone())}>
          Cancel
        </GlassButton>
        <GlassButton onClick={save} disabled={pending}>
          {pending ? <Loader2 className="animate-spin" aria-hidden /> : <Check aria-hidden />} Save property
        </GlassButton>
      </div>
    </section>
  );
}
