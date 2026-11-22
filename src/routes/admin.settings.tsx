import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import {
  AtSign,
  BarChart3,
  Bell,
  Check,
  Clock,
  ClipboardList,
  Facebook,
  Globe,
  House,
  Image as ImageIcon,
  Info,
  Instagram,
  KeyRound,
  Link2,
  Linkedin,
  Lock,
  LogOut,
  Mail,
  MapPin,
  MessageCircle,
  Monitor,
  Package,
  Phone,
  RotateCcw,
  Send,
  Smartphone,
  Sparkles,
  Twitter,
  Upload,
  UserRound,
  X,
  Youtube,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { GlassButton, ThemeSwitcher } from "@/components/glass";
import { PageHeader } from "@/components/admin/page-header";
import { ConfirmDialog, SCard, SColor, SField, SInput, SToggleRow, UnsavedBar, isHex, sInput } from "@/components/admin/settings/settings-kit";
import { usePropertySettingsQuery } from "@/queries/settings/usePropertySettingsQuery";
import { useUpdatePropertySettingsMutation } from "@/queries/settings/useUpdatePropertySettingsMutation";
import { settingsKeys } from "@/queries/keys/settings.keys";
import {
  changePasswordApi,
  getReminderStatusApi,
  listSessionsApi,
  resetSettingsSectionApi,
  revokeOtherSessionsApi,
  revokeSessionApi,
  runRemindersApi,
  type ReminderRun,
  type SettingsSection,
} from "@/api/settings/settings-extra.api";
import { useUpdateProfileMutation } from "@/queries/auth";
import { compressAvatarFile } from "@/lib/compress-image";
import { useAuth } from "@/lib/auth-context";
import { useAuthStore } from "@/stores/auth/auth.store";
import { useOnboardingTourStore } from "@/stores/tour/onboarding-tour.store";
import { syncDashboardThemeFromSettings } from "@/lib/dashboard-theme-storage";
import { ROLE_LABEL } from "@/lib/staff-access";
import { cn } from "@/lib/utils";
import type { PropertySettings } from "@/types/domain/property-settings.types";

/** Figma 21 · Settings (21.01–21.17). */
type Section = SettingsSection | "account" | "security";
const SECTIONS: Section[] = ["hostel", "brand", "contact", "reminders", "extras", "booking", "account", "security", "colours"];

export const Route = createFileRoute("/admin/settings")({
  component: SettingsPage,
  validateSearch: (s: Record<string, unknown>): { section?: Section } => (SECTIONS.includes(s.section as Section) ? { section: s.section as Section } : {}),
});

const NAV: { group: string; items: [Section, string, LucideIcon][] }[] = [
  { group: "Your hostel", items: [["hostel", "Hostel details", House], ["brand", "Brand & logo", Sparkles], ["contact", "Contact & social", Phone]] },
  { group: "Money & residents", items: [["reminders", "Rent reminders", Bell], ["extras", "Extra charges list", Package]] },
  { group: "Bookings", items: [["booking", "Booking rules", ClipboardList]] },
  { group: "You", items: [["account", "My account", UserRound], ["security", "Security", Lock]] },
  { group: "Look & feel", items: [["colours", "Dashboard colours", BarChart3]] },
];
const HEAD: Record<Section, [string, string]> = {
  hostel: ["Hostel details", "Name, contact details and location"],
  brand: ["Brand & logo", "Your logo, cover photo and website colours"],
  contact: ["Contact & social", "WhatsApp, website and social media links"],
  reminders: ["Rent reminders", "Automatic emails to residents who haven't paid"],
  extras: ["Extra charges list", "Names you can pick when adding an extra charge"],
  booking: ["Booking rules", "Times, stay limits, cancellation and house rules"],
  account: ["My account", "Your name, photo, theme and help"],
  security: ["Security", "Your password and signed-in devices"],
  colours: ["Dashboard colours", "The main colour used across this dashboard"],
};
/** Which saved fields each section edits (dirty tracking + reset). */
const FIELDS: Record<SettingsSection, (keyof PropertySettings)[]> = {
  hostel: ["hotelName", "tagline", "description", "email", "phone", "emergencyPhone", "emergencyLabel", "address", "city", "country", "mapUrl"],
  brand: ["logoUrl", "coverImageUrl", "primaryColor", "accentColor", "emailLogoUrl", "emailLogoMaxHeight", "emailLogoMaxWidth"],
  contact: ["whatsapp", "website", "instagram", "facebook", "twitter", "youtube", "linkedin", "threads"],
  reminders: ["rentRemindersEnabled", "rentReminderDays"],
  extras: ["extraFacilityPresets"],
  booking: ["checkInTime", "checkOutTime", "quietHoursStart", "quietHoursEnd", "minStay", "maxStay", "advanceBookingDays", "depositPercent", "cancellationPolicy", "cancellationWindowHours", "allowChildren", "allowPets", "smokingAllowed", "houseRules", "roomsFilterMinPrice", "roomsFilterMaxPrice"],
  colours: ["dashboardPrimaryColor", "dashboardAccentColor"],
};
const ALL_FIELDS = Object.values(FIELDS).flat();
const same = (a: unknown, b: unknown) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URLRX = /^https?:\/\/\S+$/i;
const TIME = /^\d{2}:\d{2}$/;

function validate(d: Partial<PropertySettings>): Partial<Record<keyof PropertySettings, string>> {
  const e: Partial<Record<keyof PropertySettings, string>> = {};
  if (!String(d.hotelName ?? "").trim()) e.hotelName = "Add your hostel's name";
  if (d.email && !EMAIL.test(d.email)) e.email = "This doesn't look like an email address";
  if (!String(d.phone ?? "").trim()) e.phone = "Add a phone number guests can call";
  if (d.mapUrl && !URLRX.test(d.mapUrl)) e.mapUrl = "Paste the full link, starting with https://";
  if (d.website && !URLRX.test(d.website)) e.website = "Start with https://";
  if (d.emailLogoUrl && !/^https:\/\//i.test(d.emailLogoUrl)) e.emailLogoUrl = "Must start with https://";
  const h = Number(d.emailLogoMaxHeight);
  if (!(h >= 24 && h <= 96)) e.emailLogoMaxHeight = "Between 24 and 96";
  const w = Number(d.emailLogoMaxWidth);
  if (!(w >= 80 && w <= 320)) e.emailLogoMaxWidth = "Between 80 and 320";
  (["primaryColor", "accentColor", "dashboardPrimaryColor", "dashboardAccentColor"] as const).forEach((k) => {
    if (d[k] && !isHex(String(d[k]))) e[k] = "Use a colour like #3B82F6";
  });
  (["checkInTime", "checkOutTime", "quietHoursStart", "quietHoursEnd"] as const).forEach((k) => {
    if (d[k] && !TIME.test(String(d[k]))) e[k] = "Pick a time";
  });
  if (Number(d.minStay) < 1) e.minStay = "At least 1";
  if (Number(d.maxStay) < Number(d.minStay)) e.maxStay = "Can't be shorter than the minimum stay";
  if (Number(d.depositPercent) < 0 || Number(d.depositPercent) > 100) e.depositPercent = "0 to 100";
  if (Number(d.roomsFilterMinPrice) >= Number(d.roomsFilterMaxPrice)) e.roomsFilterMaxPrice = "Must be more than the lowest price";
  return e;
}
const SECTION_OF = (k: keyof PropertySettings) => (Object.keys(FIELDS) as SettingsSection[]).find((s) => FIELDS[s].includes(k));

function SettingsPage() {
  const { section: fromUrl } = Route.useSearch();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const token = useAuthStore((s) => s.token);
  const { data, isLoading, isError, refetch, isFetching } = usePropertySettingsQuery();
  const save = useUpdatePropertySettingsMutation();
  const section: Section = fromUrl ?? "hostel";
  const [draft, setDraft] = useState<Partial<PropertySettings>>({});
  const [showErrors, setShowErrors] = useState(false);
  const [leaveTo, setLeaveTo] = useState<Section | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    if (data) setDraft(Object.fromEntries(ALL_FIELDS.map((k) => [k, data[k]])) as Partial<PropertySettings>);
  }, [data]);

  const dirtyKeys = useMemo(() => (data ? ALL_FIELDS.filter((k) => !same(draft[k], data[k])) : []), [draft, data]);
  const errors = useMemo(() => validate(draft), [draft]);
  const visibleErrors = showErrors ? errors : {};

  // Warn before closing the tab with unsaved work.
  useEffect(() => {
    if (!dirtyKeys.length) return;
    const h = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirtyKeys.length]);

  const set = <K extends keyof PropertySettings>(k: K, v: PropertySettings[K]) => setDraft((p) => ({ ...p, [k]: v }));
  const changed = (k: keyof PropertySettings) => dirtyKeys.includes(k);
  const discard = () => {
    if (data) setDraft(Object.fromEntries(ALL_FIELDS.map((k) => [k, data[k]])) as Partial<PropertySettings>);
    setShowErrors(false);
  };
  const doSave = (then?: () => void) => {
    const bad = Object.keys(errors) as (keyof PropertySettings)[];
    if (bad.length) {
      setShowErrors(true);
      const first = SECTION_OF(bad[0]);
      if (first && first !== section) void navigate({ to: "/admin/settings", search: { section: first }, replace: true });
      toast.error(`Fix ${bad.length} field${bad.length === 1 ? "" : "s"} before saving`);
      return;
    }
    const patch = Object.fromEntries(dirtyKeys.map((k) => [k, draft[k]])) as Partial<PropertySettings>;
    save.mutate(patch, {
      onSuccess: () => {
        setShowErrors(false);
        toast.success("Changes saved", { description: "Your website and receipts show the new details." });
        then?.();
      },
      onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save — try again"),
    });
  };
  const go = (s: Section) => {
    if (s === section) return;
    if (dirtyKeys.length) return setLeaveTo(s);
    void navigate({ to: "/admin/settings", search: { section: s } });
  };
  const resetSection = async () => {
    if (!token || section === "account" || section === "security") return;
    setResetting(true);
    try {
      const s = await resetSettingsSectionApi(token, section);
      qc.setQueryData(settingsKeys.property(), s);
      syncDashboardThemeFromSettings(s.dashboardPrimaryColor, s.dashboardAccentColor);
      toast.success(`${HEAD[section][0]} reset to defaults`);
      setResetOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not reset");
    } finally {
      setResetting(false);
    }
  };

  const ctx: Ctx = { d: draft, set, changed, err: visibleErrors };
  const resettable = section !== "account" && section !== "security" && section !== "extras";
  const errorsHere = showErrors && section !== "account" && section !== "security" ? (Object.keys(errors) as (keyof PropertySettings)[]).filter((k) => FIELDS[section as SettingsSection]?.includes(k)) : [];

  return (
    <>
      <PageHeader title="Settings" subtitle="Your hostel details, brand, reminders and account" />
      <div className="grid items-start gap-4 md:gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav aria-label="Settings sections" className="glass-2 rounded-[20px] p-2 max-lg:no-scrollbar max-lg:flex max-lg:gap-1 max-lg:overflow-x-auto">
          {NAV.map((g) => (
            <div key={g.group} className="max-lg:contents">
              <p className="px-2.5 pt-3 pb-1.5 text-[11px] leading-4 font-semibold tracking-[0.06em] text-ink-2 uppercase max-lg:hidden">{g.group}</p>
              {g.items.map(([k, l, Icon]) => {
                const dirtyHere = k !== "account" && k !== "security" && FIELDS[k as SettingsSection].some((f) => dirtyKeys.includes(f));
                return (
                  <button key={k} type="button" onClick={() => go(k)} aria-current={section === k ? "page" : undefined} className={cn("flex h-9 w-full shrink-0 cursor-pointer items-center gap-2.5 rounded-[10px] border px-2.5 text-body whitespace-nowrap transition-colors max-lg:w-auto [&_svg]:size-4", section === k ? "border-glass-stroke bg-glass-3 font-medium text-ink" : "border-transparent text-ink-2 hover:text-ink")}>
                    <Icon aria-hidden className={section === k ? "text-brand-text" : ""} />
                    <span className="flex-1 text-left">{l}</span>
                    {dirtyHere ? <span className="size-1.5 rounded-full bg-brand" aria-label="Unsaved" /> : null}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="flex min-w-0 flex-col gap-4">
          <div>
            <h2 className="text-body font-semibold text-ink">{HEAD[section][0]}</h2>
            <p className="text-label text-ink-2">{HEAD[section][1]}</p>
          </div>

          {section === "account" ? (
            <AccountSection />
          ) : section === "security" ? (
            <SecuritySection />
          ) : isError && !data ? (
            <div className="glass-2 flex flex-col items-center gap-3 rounded-[22px] px-6 py-14 text-center">
              <span className="flex size-12 items-center justify-center rounded-[14px] bg-danger-tint text-danger">
                <X className="size-5" aria-hidden />
              </span>
              <p className="text-card-title text-ink">Could not load your settings</p>
              <p className="text-body text-ink-2">Check your internet connection. Nothing you saved is lost.</p>
              <GlassButton variant="glass" onClick={() => void refetch()} disabled={isFetching}>
                <RotateCcw aria-hidden /> Try again
              </GlassButton>
            </div>
          ) : isLoading || !data ? (
            <div className="flex flex-col gap-4">
              {[0, 1].map((i) => (
                <div key={i} className="glass-2 flex flex-col gap-3 rounded-[22px] p-5">
                  <div className="h-4 w-40 animate-pulse rounded bg-glass-inset" />
                  <div className="h-10 animate-pulse rounded-[10px] bg-glass-inset" />
                  <div className="h-10 animate-pulse rounded-[10px] bg-glass-inset" />
                </div>
              ))}
            </div>
          ) : (
            <>
              {errorsHere.length ? (
                <div className="flex items-start gap-2.5 rounded-[14px] border border-danger bg-danger-tint px-4 py-3 text-body text-danger">
                  <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
                  <span>
                    Fix {errorsHere.length} field{errorsHere.length === 1 ? "" : "s"} below before saving.
                  </span>
                </div>
              ) : null}
              {section === "hostel" ? <HostelSection {...ctx} /> : null}
              {section === "brand" ? <BrandSection {...ctx} /> : null}
              {section === "contact" ? <ContactSection {...ctx} /> : null}
              {section === "reminders" ? <RemindersSection {...ctx} dirty={dirtyKeys.length > 0} /> : null}
              {section === "extras" ? <ExtrasSection {...ctx} /> : null}
              {section === "booking" ? <BookingSection {...ctx} /> : null}
              {section === "colours" ? <ColoursSection {...ctx} /> : null}
              {resettable ? (
                <button type="button" onClick={() => setResetOpen(true)} className="flex w-fit cursor-pointer items-center gap-2 px-1 text-label text-ink-2 hover:text-ink">
                  <RotateCcw className="size-4" aria-hidden /> Reset {HEAD[section][0]} to defaults
                </button>
              ) : null}
            </>
          )}
          <UnsavedBar show={dirtyKeys.length > 0} count={dirtyKeys.length} saving={save.isPending} onDiscard={discard} onSave={() => doSave()} />
        </div>
      </div>

      <ConfirmDialog
        open={leaveTo != null}
        onOpenChange={(o) => !o && setLeaveTo(null)}
        danger
        title="Leave without saving?"
        body={`You changed ${dirtyKeys.length} field${dirtyKeys.length === 1 ? "" : "s"}. If you leave now, those changes are lost.`}
        confirm="Leave without saving"
        cancel="Keep editing"
        onConfirm={() => {
          const to = leaveTo;
          discard();
          setLeaveTo(null);
          if (to) void navigate({ to: "/admin/settings", search: { section: to } });
        }}
        extra={
          <GlassButton
            variant="glass"
            className="w-full"
            disabled={save.isPending}
            onClick={() =>
              doSave(() => {
                const to = leaveTo;
                setLeaveTo(null);
                if (to) void navigate({ to: "/admin/settings", search: { section: to } });
              })
            }
          >
            <Check aria-hidden /> Save and continue
          </GlassButton>
        }
      />
      <ConfirmDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title={`Reset ${HEAD[section][0]}?`}
        body="Every field in this section goes back to the StayInn defaults straight away. Other sections are not touched."
        confirm={resetting ? "Resetting…" : "Reset to defaults"}
        busy={resetting}
        onConfirm={() => void resetSection()}
      />
    </>
  );
}

type Ctx = {
  d: Partial<PropertySettings>;
  set: <K extends keyof PropertySettings>(k: K, v: PropertySettings[K]) => void;
  changed: (k: keyof PropertySettings) => boolean;
  err: Partial<Record<keyof PropertySettings, string>>;
};

const str = (v: unknown) => (v == null ? "" : String(v));

function HostelSection({ d, set, changed, err }: Ctx) {
  const t = (k: keyof PropertySettings) => ({ value: str(d[k]), onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => set(k, e.target.value as never) });
  return (
    <>
      <SCard title="About your hostel" sub="Shown on your website, receipts and emails">
        <SField label="Hostel name" error={err.hotelName} changed={changed("hotelName")}>
          <input {...t("hotelName")} maxLength={120} className={sInput} aria-invalid={!!err.hotelName} />
        </SField>
        <SField label="Tagline" changed={changed("tagline")}>
          <input {...t("tagline")} maxLength={160} className={sInput} />
        </SField>
        <SField label="Short description" changed={changed("description")}>
          <textarea {...t("description")} rows={3} maxLength={1000} className={cn(sInput, "h-auto min-h-[72px] py-2.5")} />
        </SField>
      </SCard>
      <SCard title="Contact" sub="Guests use these to call or email you">
        <div className="grid gap-3 sm:grid-cols-2">
          <SField label="Contact email" error={err.email} changed={changed("email")}>
            <SInput icon={<Mail />} type="email" {...t("email")} invalid={!!err.email} />
          </SField>
          <SField label="Phone" error={err.phone} changed={changed("phone")}>
            <SInput icon={<Phone />} type="tel" {...t("phone")} invalid={!!err.phone} />
          </SField>
          <SField label="Emergency phone" optional changed={changed("emergencyPhone")}>
            <SInput icon={<Phone />} type="tel" {...t("emergencyPhone")} placeholder="Leave blank to use main phone" />
          </SField>
          <SField label="Emergency label" changed={changed("emergencyLabel")}>
            <input {...t("emergencyLabel")} className={sInput} />
          </SField>
        </div>
      </SCard>
      <SCard title="Location" sub="Shown on your Contact page and map">
        <SField label="Street address" changed={changed("address")}>
          <input {...t("address")} className={sInput} />
        </SField>
        <div className="grid gap-3 sm:grid-cols-2">
          <SField label="City" changed={changed("city")}>
            <input {...t("city")} className={sInput} />
          </SField>
          <SField label="Country" changed={changed("country")}>
            <input {...t("country")} className={sInput} />
          </SField>
        </div>
        <SField label="Map link" error={err.mapUrl} changed={changed("mapUrl")} hint="Open your hostel in Google Maps → Share → Copy link. Long share links work too.">
          <SInput icon={<Link2 />} {...t("mapUrl")} placeholder="https://maps.google.com/…" invalid={!!err.mapUrl} />
        </SField>
        {d.mapUrl ? (
          <div className="flex items-center gap-3 rounded-[14px] bg-glass-inset px-4 py-3">
            <span className="flex size-9 items-center justify-center rounded-[10px] bg-brand-tint text-brand-text">
              <MapPin className="size-4" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-body font-medium text-ink">{str(d.hotelName)}</p>
              <p className="truncate text-label text-ink-2">{[d.address, d.city].filter(Boolean).join(", ")}</p>
            </div>
            <a href={str(d.mapUrl)} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-label text-ink-2 hover:text-ink">
              <Link2 className="size-4" aria-hidden /> Test link
            </a>
          </div>
        ) : null}
      </SCard>
    </>
  );
}

function readFile(file: File, max = 2_500_000): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.size > max) return reject(new Error("Image is too large (max 2.5 MB)"));
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error("Could not read the image"));
    r.readAsDataURL(file);
  });
}

function ImagePick({ label, hint, value, onChange, square }: { label: string; hint: string; value: string; onChange: (v: string) => void; square?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <span className={cn("flex shrink-0 items-center justify-center overflow-hidden rounded-[16px] border border-glass-stroke", square ? "size-[60px] bg-brand text-on-brand" : "h-[60px] w-[104px] bg-glass-inset text-ink-2")}>
        {value ? <img src={value} alt="" className="size-full object-cover" /> : square ? <House className="size-6" aria-hidden /> : <ImageIcon className="size-5" aria-hidden />}
      </span>
      <div className="flex min-w-0 flex-col gap-1.5">
        <p className="text-body font-medium text-ink">{label}</p>
        <p className="text-label text-ink-2">{hint}</p>
        <div className="flex items-center gap-2">
          <label className="glass-2 inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-[10px] px-2.5 text-label font-medium text-ink hover:bg-glass-inset">
            <Upload className="size-3.5" aria-hidden /> {value ? "Replace" : "Upload"}
            <input type="file" accept="image/*" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) readFile(f).then(onChange).catch((x) => toast.error(x.message)); }} />
          </label>
          {value ? (
            <button type="button" onClick={() => onChange("")} className="cursor-pointer px-1.5 text-label text-ink-2 hover:text-danger">
              Remove
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function BrandSection({ d, set, changed, err }: Ctx) {
  const primary = isHex(str(d.primaryColor)) ? str(d.primaryColor) : "#3B82F6";
  const accent = isHex(str(d.accentColor)) ? str(d.accentColor) : "#F59E0B";
  return (
    <>
      <SCard title="Logo & cover" sub="Used on your website, receipts and emails">
        <div className="grid gap-4 sm:grid-cols-2">
          <ImagePick square label="Logo" hint="PNG or SVG · square works best" value={str(d.logoUrl)} onChange={(v) => set("logoUrl", v)} />
          <ImagePick label="Cover image" hint="A wide photo · at least 1600 px wide" value={str(d.coverImageUrl)} onChange={(v) => set("coverImageUrl", v)} />
        </div>
      </SCard>
      <SCard title="Website colours" sub="Buttons and links on your public website">
        <div className="grid gap-3 sm:grid-cols-2">
          <SField label="Primary colour" error={err.primaryColor} changed={changed("primaryColor")}>
            <SColor value={str(d.primaryColor)} fallback="#3B82F6" onChange={(v) => set("primaryColor", v)} />
          </SField>
          <SField label="Accent colour" error={err.accentColor} changed={changed("accentColor")}>
            <SColor value={str(d.accentColor)} fallback="#F59E0B" onChange={(v) => set("accentColor", v)} />
          </SField>
        </div>
        <div className="flex flex-col gap-3 rounded-[14px] bg-glass-inset p-4">
          <p className="text-[11px] font-semibold tracking-[0.06em] text-ink-2 uppercase">Preview on your website</p>
          <div className="flex items-center gap-4">
            <span className="rounded-full px-4 py-2 text-label font-medium text-white" style={{ background: primary }}>
              Book a bed
            </span>
            <span className="text-label font-medium" style={{ color: accent }}>
              See all rooms →
            </span>
          </div>
        </div>
      </SCard>
      <SCard title="Email logo" sub="Shown at the top of emails to guests">
        <SField label="Email logo link" optional error={err.emailLogoUrl} changed={changed("emailLogoUrl")} hint="Leave blank to use the StayInn logo. It must start with https://">
          <SInput icon={<Link2 />} value={str(d.emailLogoUrl)} onChange={(e) => set("emailLogoUrl", e.target.value)} placeholder="https://…/logo.png" invalid={!!err.emailLogoUrl} />
        </SField>
        <div className="grid gap-3 sm:grid-cols-2">
          <SField label="Logo height" error={err.emailLogoMaxHeight} hint="Between 24 and 96" changed={changed("emailLogoMaxHeight")}>
            <SInput type="number" unit="px" value={str(d.emailLogoMaxHeight)} onChange={(e) => set("emailLogoMaxHeight", Number(e.target.value))} invalid={!!err.emailLogoMaxHeight} />
          </SField>
          <SField label="Logo max width" error={err.emailLogoMaxWidth} hint="Between 80 and 320" changed={changed("emailLogoMaxWidth")}>
            <SInput type="number" unit="px" value={str(d.emailLogoMaxWidth)} onChange={(e) => set("emailLogoMaxWidth", Number(e.target.value))} invalid={!!err.emailLogoMaxWidth} />
          </SField>
        </div>
        <div className="flex flex-col gap-3 rounded-[14px] bg-glass-inset p-4">
          <p className="text-[11px] font-semibold tracking-[0.06em] text-ink-2 uppercase">Email preview</p>
          <div className="flex flex-col gap-3 rounded-[12px] border border-glass-stroke bg-glass-3 p-4">
            <div className="flex items-center gap-3 border-b border-glass-divider pb-3">
              {d.emailLogoUrl || d.logoUrl ? (
                <img src={str(d.emailLogoUrl || d.logoUrl)} alt="" style={{ maxHeight: Number(d.emailLogoMaxHeight) || 48, maxWidth: Number(d.emailLogoMaxWidth) || 180 }} className="object-contain" />
              ) : (
                <span className="flex items-center justify-center rounded-[10px] bg-brand text-on-brand" style={{ width: Number(d.emailLogoMaxHeight) || 48, height: Number(d.emailLogoMaxHeight) || 48 }}>
                  <House className="size-5" aria-hidden />
                </span>
              )}
              <span className="text-body font-semibold text-ink">{str(d.hotelName)}</span>
            </div>
            <span className="h-2 w-4/5 rounded bg-glass-inset" />
            <span className="h-2 w-3/5 rounded bg-glass-inset" />
          </div>
        </div>
      </SCard>
    </>
  );
}

function ContactSection({ d, set, changed, err }: Ctx) {
  const handle = (k: keyof PropertySettings, label: string, Icon: LucideIcon, base: string) => {
    const v = str(d[k]);
    const link = v ? (/^https?:\/\//.test(v) ? v : `${base}${v.replace(/^@/, "")}`) : null;
    return (
      <SField label={label} changed={changed(k)}>
        <span className="flex gap-2">
          <SInput className="flex-1" icon={<Icon />} value={v} onChange={(e) => set(k, e.target.value as never)} placeholder="@username or link" />
          {link ? (
            <a href={link} target="_blank" rel="noreferrer" aria-label={`Open ${label}`} className="glass-2 flex size-10 shrink-0 items-center justify-center rounded-[10px] text-ink hover:bg-glass-inset">
              <Link2 className="size-4" aria-hidden />
            </a>
          ) : null}
        </span>
      </SField>
    );
  };
  return (
    <>
      <SCard title="Chat & website" sub="Shown in your website footer and on the Contact page">
        <div className="grid gap-3 sm:grid-cols-2">
          <SField label="WhatsApp number" changed={changed("whatsapp")} hint="Country code first, e.g. 92 331 0008196">
            <SInput icon={<MessageCircle />} value={str(d.whatsapp)} onChange={(e) => set("whatsapp", e.target.value.replace(/[^\d+ ]/g, ""))} placeholder="92 331 0008196" />
          </SField>
          <SField label="Website" error={err.website} changed={changed("website")}>
            <SInput icon={<Globe />} value={str(d.website)} onChange={(e) => set("website", e.target.value)} placeholder="https://stayinnhostels.com" invalid={!!err.website} />
          </SField>
        </div>
      </SCard>
      <SCard title="Social media" sub="Type @username or paste the full link. Leave a box empty to hide it.">
        <div className="grid gap-3 sm:grid-cols-2">
          {handle("instagram", "Instagram", Instagram, "https://instagram.com/")}
          {handle("youtube", "YouTube", Youtube, "https://youtube.com/@")}
          {handle("twitter", "X (Twitter)", Twitter, "https://x.com/")}
          {handle("facebook", "Facebook", Facebook, "https://facebook.com/")}
          {handle("linkedin", "LinkedIn", Linkedin, "https://linkedin.com/company/")}
          {handle("threads", "Threads", AtSign, "https://threads.net/@")}
        </div>
      </SCard>
    </>
  );
}

const DAY_TAG: Record<number, string> = { 1: "Due", 5: "Follow-up", 10: "Overdue" };

function RemindersSection({ d, set, changed, dirty }: Ctx & { dirty: boolean }) {
  const token = useAuthStore((s) => s.token);
  const status = useQuery({ queryKey: ["settings", "reminder-status"], queryFn: () => getReminderStatusApi(token as string), enabled: Boolean(token) });
  const [confirm, setConfirm] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<ReminderRun | null>(null);
  const days = (d.rentReminderDays ?? []) as number[];
  const toggleDay = (n: number) => {
    const next = days.includes(n) ? days.filter((x) => x !== n) : [...days, n].sort((a, b) => a - b);
    if (next.length === 0) return toast.error("Keep at least one day");
    if (next.length > 5) return toast.error("Pick up to 5 days");
    set("rentReminderDays", next);
  };
  const st = status.data;
  const nextLabel = st ? `${new Date(`${st.next_run.month}-${String(st.next_run.day).padStart(2, "0")}T09:00:00`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })} at 9:00 AM` : "—";

  const send = async () => {
    if (!token) return;
    setSending(true);
    try {
      const r = await runRemindersApi(token);
      setResult(r);
      setConfirm(false);
      void status.refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not send");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <SCard title="Rent reminder emails" sub="We email residents who haven't paid this month">
        <SToggleRow title="Email unpaid residents" sub="Only this month · skips paid residents · sends at 9:00 AM Pakistan time" checked={Boolean(d.rentRemindersEnabled)} onChange={(v) => set("rentRemindersEnabled", v)} />
      </SCard>
      <SCard title="Send on these days" sub="Pick days of the month. Most hostels use Day 1 and Day 5.">
        <div className={cn("grid grid-cols-7 gap-2", changed("rentReminderDays") && "rounded-[14px] ring-2 ring-brand-tint ring-offset-4 ring-offset-transparent")}>
          {Array.from({ length: 28 }, (_, i) => i + 1).map((n) => {
            const on = days.includes(n);
            return (
              <button key={n} type="button" aria-pressed={on} onClick={() => toggleDay(n)} className={cn("flex h-12 cursor-pointer flex-col items-center justify-center rounded-[10px] border text-label transition-colors", on ? "border-transparent bg-brand text-on-brand" : "border-glass-stroke bg-glass-inset text-ink hover:border-ink-3")}>
                <span className="font-medium">{n}</span>
                {DAY_TAG[n] ? <span className={cn("text-[10px] leading-3", on ? "text-on-brand/90" : "text-ink-2")}>{DAY_TAG[n]}</span> : null}
              </button>
            );
          })}
        </div>
        <p className="text-label text-ink-2">Day 1 = due notice · Day 5 = follow-up · Day 10 = overdue nudge (optional)</p>
        <div className="flex flex-wrap items-center gap-3 rounded-[14px] bg-glass-inset px-4 py-3">
          <Clock className="size-4 shrink-0 text-ink-2" aria-hidden />
          <p className="min-w-0 flex-1 text-label text-ink-2">
            {st ? (st.enabled ? `Next run: ${nextLabel} · ${st.unpaid_residents} resident${st.unpaid_residents === 1 ? "" : "s"} haven't paid` : "Reminders are off — switch them on above") : "Loading…"}
          </p>
          <GlassButton variant="glass" size="sm" className="h-8" disabled={!st || dirty} title={dirty ? "Save your changes first" : undefined} onClick={() => setConfirm(true)}>
            <Send aria-hidden /> Send now
          </GlassButton>
        </div>
        {result ? (
          result.skipped ? (
            <div className="flex items-start gap-2.5 rounded-[14px] border border-info bg-info-tint px-4 py-3 text-label text-info">
              <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
              <span>{result.reason === "not_reminder_day" ? `Skipped — today (day ${result.day}) is not a reminder day. Pick today's day above to send now.` : "Skipped — reminders are switched off."}</span>
            </div>
          ) : (
            <div className="flex items-start gap-2.5 rounded-[14px] border border-success bg-success-tint px-4 py-3 text-label text-success">
              <Check className="mt-0.5 size-4 shrink-0" aria-hidden />
              <span>
                Sent {result.sent} reminder{result.sent === 1 ? "" : "s"}
                {result.skippedAlreadySent ? ` · ${result.skippedAlreadySent} already reminded today` : ""}
                {result.skippedNoEmail ? ` · ${result.skippedNoEmail} without an email` : ""}
                {result.failed ? ` · ${result.failed} failed` : ""}
              </span>
            </div>
          )
        ) : null}
      </SCard>
      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        icon={<Send />}
        title="Send rent reminders now?"
        body={st ? `${st.unpaid_residents} resident${st.unpaid_residents === 1 ? "" : "s"} haven't paid this month${st.unpaid_without_email ? ` (${st.unpaid_without_email} have no email and are skipped)` : ""}. Residents already reminded today are not emailed again.` : ""}
        confirm={sending ? "Sending…" : "Send reminders"}
        busy={sending}
        onConfirm={() => void send()}
      />
    </>
  );
}

function ExtrasSection({ d, set }: Ctx) {
  const [name, setName] = useState("");
  const list = (d.extraFacilityPresets ?? []) as string[];
  const add = () => {
    const v = name.trim();
    if (!v) return;
    if (list.some((x) => x.toLowerCase() === v.toLowerCase())) return toast.error(`${v} is already on the list`);
    set("extraFacilityPresets", [...list, v]);
    setName("");
  };
  return (
    <SCard title="Extra charges list" sub="Shown when you add an extra charge to a resident">
      <div className="flex flex-wrap gap-2">
        {list.map((x) => (
          <span key={x} className="inline-flex h-8 items-center gap-1.5 rounded-full border border-glass-stroke bg-glass-inset pr-1.5 pl-3 text-label text-ink">
            {x}
            <button type="button" aria-label={`Remove ${x}`} onClick={() => set("extraFacilityPresets", list.filter((y) => y !== x))} className="flex size-5 cursor-pointer items-center justify-center rounded-full text-ink-2 hover:bg-glass-3 hover:text-ink">
              <X className="size-3.5" />
            </button>
          </span>
        ))}
        {list.length === 0 ? <p className="text-label text-ink-2">No names yet.</p> : null}
      </div>
      <SField label="Add a charge name">
        <span className="flex gap-2">
          <input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())} maxLength={40} placeholder="For example: Mini fridge" className={sInput} />
          <GlassButton onClick={add} className="shrink-0">
            Add
          </GlassButton>
        </span>
      </SField>
      <p className="flex items-center gap-2 rounded-[12px] bg-glass-inset px-3 py-2.5 text-label text-ink-2">
        <Info className="size-4 shrink-0" aria-hidden /> Removing a name does not change charges already added to residents.
      </p>
    </SCard>
  );
}

const POLICY_TEXT: Record<string, (h: number) => string> = {
  flexible: (h) => `Flexible: full refund if the guest cancels at least ${h} hours before check-in. After that, half is refunded.`,
  moderate: (h) => `Moderate: full refund if the guest cancels at least 14 days before check-in, half until ${h} hours before. After that, the deposit is kept.`,
  strict: () => "Strict: half refund if the guest cancels at least 14 days before check-in. After that, nothing is refunded.",
};

function BookingSection({ d, set, changed, err }: Ctx) {
  const n = (k: keyof PropertySettings) => ({ value: str(d[k]), onChange: (e: React.ChangeEvent<HTMLInputElement>) => set(k, Number(e.target.value) as never) });
  const time = (k: keyof PropertySettings, label: string) => (
    <SField label={label} error={err[k]} changed={changed(k)}>
      <SInput icon={<Clock />} type="time" value={str(d[k])} onChange={(e) => set(k, e.target.value as never)} invalid={!!err[k]} />
    </SField>
  );
  const policy = str(d.cancellationPolicy) || "moderate";
  return (
    <>
      <SCard title="Check-in & check-out" sub="Shown on your website and in booking emails">
        <div className="grid gap-3 sm:grid-cols-2">
          {time("checkInTime", "Check-in time")}
          {time("checkOutTime", "Check-out time")}
          {time("quietHoursStart", "Quiet hours start")}
          {time("quietHoursEnd", "Quiet hours end")}
        </div>
      </SCard>
      <SCard title="Stay rules" sub="Limits for online bookings">
        <div className="grid gap-3 sm:grid-cols-2">
          <SField label="Minimum stay" error={err.minStay} changed={changed("minStay")}>
            <SInput type="number" min={1} unit="nights" {...n("minStay")} invalid={!!err.minStay} />
          </SField>
          <SField label="Maximum stay" error={err.maxStay} changed={changed("maxStay")}>
            <SInput type="number" min={1} unit="nights" {...n("maxStay")} invalid={!!err.maxStay} />
          </SField>
          <SField label="Book up to" changed={changed("advanceBookingDays")}>
            <SInput type="number" min={1} unit="days ahead" {...n("advanceBookingDays")} />
          </SField>
          <SField label="Deposit" error={err.depositPercent} changed={changed("depositPercent")}>
            <SInput type="number" min={0} max={100} unit="%" {...n("depositPercent")} invalid={!!err.depositPercent} />
          </SField>
        </div>
      </SCard>
      <SCard title="Cancellation" sub="What happens when a guest cancels">
        <div role="radiogroup" aria-label="Cancellation policy" className="grid grid-cols-3 gap-0.5 rounded-[12px] bg-glass-inset p-1">
          {(["flexible", "moderate", "strict"] as const).map((p) => (
            <button key={p} type="button" role="radio" aria-checked={policy === p} onClick={() => set("cancellationPolicy", p)} className={cn("h-8 cursor-pointer rounded-[9px] text-label capitalize transition-colors", policy === p ? "glass-2 font-medium text-ink" : "text-ink-2 hover:text-ink")}>
              {p}
            </button>
          ))}
        </div>
        <p className="flex items-start gap-2 rounded-[12px] border border-brand-border bg-brand-tint px-3 py-2.5 text-label text-brand-text">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden /> {POLICY_TEXT[policy]?.(Number(d.cancellationWindowHours) || 48)}
        </p>
        <SField label="Free cancellation window" changed={changed("cancellationWindowHours")}>
          <SInput type="number" min={0} unit="hours" {...n("cancellationWindowHours")} />
        </SField>
      </SCard>
      <SCard title="Guest preferences" sub="Shown as rules on your website">
        <SToggleRow title="Allow children" checked={Boolean(d.allowChildren)} onChange={(v) => set("allowChildren", v)} />
        <SToggleRow title="Allow pets" checked={Boolean(d.allowPets)} onChange={(v) => set("allowPets", v)} />
        <SToggleRow title="Smoking allowed" checked={Boolean(d.smokingAllowed)} onChange={(v) => set("smokingAllowed", v)} />
      </SCard>
      <SCard title="House rules" sub="One rule per line works best">
        <SField label="House rules" changed={changed("houseRules")} hint={`${str(d.houseRules).length} / 2000`}>
          <textarea value={str(d.houseRules)} onChange={(e) => set("houseRules", e.target.value.slice(0, 2000))} rows={5} className={cn(sInput, "h-auto py-2.5")} />
        </SField>
      </SCard>
      <SCard title="Rooms page price filter" sub="The price range guests can filter by on your Rooms page">
        <div className="grid gap-3 sm:grid-cols-2">
          <SField label="Lowest price" changed={changed("roomsFilterMinPrice")}>
            <SInput type="number" min={0} prefix="PKR" {...n("roomsFilterMinPrice")} />
          </SField>
          <SField label="Highest price" error={err.roomsFilterMaxPrice} changed={changed("roomsFilterMaxPrice")}>
            <SInput type="number" min={0} prefix="PKR" {...n("roomsFilterMaxPrice")} invalid={!!err.roomsFilterMaxPrice} />
          </SField>
        </div>
      </SCard>
    </>
  );
}

function ColoursSection({ d, set, changed, err }: Ctx) {
  const p = isHex(str(d.dashboardPrimaryColor)) ? str(d.dashboardPrimaryColor) : "#3B82F6";
  const bars = [44, 64, 52, 76, 60, 86, 70];
  return (
    <>
      <SCard title="Dashboard colours" sub="Changes the dashboard for everyone in your team">
        <div className="grid gap-3 sm:grid-cols-2">
          <SField label="Primary colour" error={err.dashboardPrimaryColor} changed={changed("dashboardPrimaryColor")} hint="Default: StayInn blue">
            <SColor value={str(d.dashboardPrimaryColor)} fallback="#3B82F6" onChange={(v) => set("dashboardPrimaryColor", v)} />
          </SField>
          <SField label="Accent colour" error={err.dashboardAccentColor} changed={changed("dashboardAccentColor")} hint="Default: StayInn blue">
            <SColor value={str(d.dashboardAccentColor)} fallback="#3B82F6" onChange={(v) => set("dashboardAccentColor", v)} />
          </SField>
        </div>
      </SCard>
      <SCard title="Preview" sub="How buttons, badges and charts will look">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-[14px] px-4 py-2.5 text-body font-semibold text-white" style={{ background: p }}>
            Primary button
          </span>
          <span className="glass-2 rounded-[14px] px-4 py-2.5 text-body font-semibold text-ink">Glass button</span>
          <span className="flex size-6 items-center justify-center rounded-full text-label font-medium text-white" style={{ background: p }}>
            3
          </span>
          <span className="rounded-full border px-2 py-0.5 text-label" style={{ color: p, borderColor: p }}>
            New
          </span>
          <span className="rounded-full border border-success bg-success-tint px-2 py-0.5 text-label text-success">Paid</span>
        </div>
        <div className="flex h-[120px] items-end gap-5 rounded-[14px] bg-glass-inset px-5 pt-4">
          {bars.map((h, i) => (
            <span key={i} className="w-8 rounded-t-[6px]" style={{ height: `${h}%`, background: p }} />
          ))}
        </div>
      </SCard>
    </>
  );
}

function AccountSection() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const updateProfile = useUpdateProfileMutation();
  const startTour = useOnboardingTourStore((s) => s.start);
  const [name, setName] = useState(user?.fullName ?? "");
  const [avatar, setAvatar] = useState<string | null>(user?.avatarUrl ?? null);
  const [busy, setBusy] = useState(false);
  const dirty = name.trim() !== (user?.fullName ?? "") || (avatar ?? "") !== (user?.avatarUrl ?? "");
  const initials = (user?.fullName ?? "?").split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  const save = () =>
    updateProfile.mutate(
      { name: name.trim(), ...(avatar !== (user?.avatarUrl ?? null) ? { avatar: avatar ?? "" } : {}) },
      { onSuccess: () => toast.success("Profile saved"), onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save") },
    );

  return (
    <>
      <SCard title="Your profile" sub="Your name and photo show in the sidebar and on activity">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-full border border-brand-border bg-brand-tint text-[20px] font-medium text-brand-text">
            {avatar ? <img src={avatar} alt="" className="size-full object-cover" /> : initials}
          </span>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <label className="glass-2 inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-[10px] px-3 text-label font-medium text-ink hover:bg-glass-inset">
                <Upload className="size-4" aria-hidden /> {busy ? "Preparing…" : "Upload photo"}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="sr-only"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    setBusy(true);
                    try {
                      setAvatar(await compressAvatarFile(f));
                    } catch (x) {
                      toast.error(x instanceof Error ? x.message : "Could not use that photo");
                    } finally {
                      setBusy(false);
                    }
                  }}
                />
              </label>
              {avatar ? (
                <button type="button" onClick={() => setAvatar(null)} className="cursor-pointer px-2 text-label text-ink-2 hover:text-danger">
                  Remove
                </button>
              ) : null}
            </div>
            <p className="text-label text-ink-2">JPG or PNG · we shrink big photos for you</p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <SField label="Display name">
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} className={sInput} />
          </SField>
          <SField label="Email" hint="Ask the owner to change your email">
            <SInput value={user?.email ?? ""} readOnly icon={<Mail />} unit="🔒" className="opacity-80" />
          </SField>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-label text-ink-2">Role</span>
          <span className="rounded-full border border-brand-border bg-brand-tint px-2 py-0.5 text-label font-medium text-brand-text">{ROLE_LABEL[user?.role ?? ""] ?? user?.role}</span>
          <span className="flex-1" />
          {dirty ? (
            <GlassButton size="sm" className="h-9" onClick={save} disabled={updateProfile.isPending || !name.trim()}>
              <Check aria-hidden /> Save profile
            </GlassButton>
          ) : null}
        </div>
      </SCard>
      <SCard title="Appearance" sub="Only changes how the dashboard looks for you, on this device">
        <ThemeSwitcher wide />
      </SCard>
      <SCard title="Help" sub="New here, or forgot where something is?">
        <GlassButton
          variant="glass"
          className="w-fit"
          onClick={() => {
            void navigate({ to: "/admin" });
            window.setTimeout(startTour, 400);
          }}
        >
          <Sparkles aria-hidden /> Take the dashboard tour again
        </GlassButton>
      </SCard>
      <button
        type="button"
        onClick={async () => {
          await logout();
          void navigate({ to: "/login" });
        }}
        className="flex w-fit cursor-pointer items-center gap-2 px-1 text-body font-medium text-danger hover:underline"
      >
        <LogOut className="size-4" aria-hidden /> Sign out
      </button>
    </>
  );
}

function SecuritySection() {
  const token = useAuthStore((s) => s.token);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const [cur, setCur] = useState("");
  const [next, setNext] = useState("");
  const [again, setAgain] = useState("");
  const [saving, setSaving] = useState(false);
  const sessions = useQuery({ queryKey: ["auth", "sessions"], queryFn: () => listSessionsApi(token as string, refreshToken), enabled: Boolean(token) });
  const checks: [boolean, string][] = [
    [next.length >= 8, "At least 8 characters"],
    [/\d/.test(next), "One number"],
    [/[A-Z]/.test(next), "One capital letter"],
    [next.length > 0 && next === again, "Both passwords match"],
  ];
  const ok = checks.every(([v]) => v) && cur.length > 0;

  const update = async () => {
    if (!token || !ok) return;
    setSaving(true);
    try {
      await changePasswordApi(token, { currentPassword: cur, newPassword: next, refreshToken: refreshToken ?? undefined });
      toast.success("Password updated", { description: "Other devices were signed out." });
      setCur("");
      setNext("");
      setAgain("");
      void sessions.refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update the password");
    } finally {
      setSaving(false);
    }
  };

  const ago = (iso: string) => {
    const m = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
    if (m < 5) return "Active now";
    if (m < 60) return `${m} min ago`;
    const h = Math.round(m / 60);
    if (h < 24) return `${h} hour${h === 1 ? "" : "s"} ago`;
    const d = Math.round(h / 24);
    return `${d} day${d === 1 ? "" : "s"} ago`;
  };

  return (
    <>
      <SCard title="Change password" sub="Use at least 8 characters with a number and a capital letter">
        <SField label="Current password">
          <SInput type="password" icon={<KeyRound />} value={cur} onChange={(e) => setCur(e.target.value)} autoComplete="current-password" />
        </SField>
        <div className="grid gap-3 sm:grid-cols-2">
          <SField label="New password">
            <SInput type="password" icon={<Lock />} value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" />
          </SField>
          <SField label="Confirm new password">
            <SInput type="password" icon={<Lock />} value={again} onChange={(e) => setAgain(e.target.value)} autoComplete="new-password" />
          </SField>
        </div>
        <ul className="flex flex-col gap-1">
          {checks.map(([v, l]) => (
            <li key={l} className={cn("flex items-center gap-2 text-label", v ? "text-ink" : "text-ink-3")}>
              {v ? <Check className="size-3.5 text-success" aria-hidden /> : <X className="size-3.5" aria-hidden />} {l}
            </li>
          ))}
        </ul>
        <GlassButton className="w-fit" disabled={!ok || saving} onClick={() => void update()}>
          {saving ? "Updating…" : "Update password"}
        </GlassButton>
      </SCard>
      <SCard title="Signed-in devices" sub="Sign out of anything you don't recognise">
        {sessions.isLoading ? (
          <div className="h-16 animate-pulse rounded-[12px] bg-glass-inset" />
        ) : (
          <ul className="flex flex-col">
            {(sessions.data ?? []).map((s, i) => {
              const Icon = /iPhone|Android|iPad/.test(s.device) ? Smartphone : Monitor;
              return (
                <li key={s.id} className={cn("flex items-center gap-3 py-3", i > 0 && "border-t border-glass-divider")}>
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-glass-inset text-ink-2">
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-body font-medium text-ink">{s.device}</p>
                    <p className="truncate text-label text-ink-2">{[s.ip, s.current ? "Active now" : ago(s.last_used_at)].filter(Boolean).join(" · ")}</p>
                  </div>
                  {s.current ? (
                    <span className="rounded-full border border-success bg-success-tint px-2 py-0.5 text-label text-success">This device</span>
                  ) : (
                    <GlassButton
                      variant="glass"
                      size="sm"
                      className="h-8"
                      onClick={() =>
                        token &&
                        revokeSessionApi(token, s.id)
                          .then(() => {
                            toast.success(`Signed out on ${s.device}`);
                            void sessions.refetch();
                          })
                          .catch((e) => toast.error(e instanceof Error ? e.message : "Could not sign out"))
                      }
                    >
                      Sign out
                    </GlassButton>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        {(sessions.data ?? []).filter((s) => !s.current).length ? (
          <button
            type="button"
            onClick={() =>
              token &&
              revokeOtherSessionsApi(token, refreshToken)
                .then(() => {
                  toast.success("Signed out of all other devices");
                  void sessions.refetch();
                })
                .catch((e) => toast.error(e instanceof Error ? e.message : "Could not sign out"))
            }
            className="flex w-fit cursor-pointer items-center gap-2 text-label font-medium text-danger hover:underline"
          >
            <LogOut className="size-4" aria-hidden /> Sign out of all other devices
          </button>
        ) : null}
      </SCard>
    </>
  );
}

