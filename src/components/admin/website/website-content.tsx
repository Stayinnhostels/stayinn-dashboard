import { Link } from "@tanstack/react-router";
import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useMemo, useState } from "react";
import { ClipboardList, Eye, EyeOff, Globe, GripVertical, Heart, Image as ImageIcon, Link2, Pencil, Plus, ShieldCheck, Sparkles, Trash2, Upload, Users, X, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { GlassButton } from "@/components/glass";
import { PageHeader } from "@/components/admin/page-header";
import { Segmented } from "@/components/admin/finance/finance-kit";
import { ConfirmDialog, SCard, SField, SInput, SToggleRow, UnsavedBar, sInput } from "@/components/admin/settings/settings-kit";
import { usePropertySettingsQuery } from "@/queries/settings/usePropertySettingsQuery";
import { useUpdatePropertySettingsMutation } from "@/queries/settings/useUpdatePropertySettingsMutation";
import { cn } from "@/lib/utils";
import type { PropertySettings } from "@/types/domain/property-settings.types";
import type { AboutValueCard } from "@/lib/about-values";
import type { FaqItem } from "@/lib/faqs";

/** Figma 21.18–21.23 · Website content (Homepage hero + CTA banner, About page, FAQ page). */

type Page = "home" | "about" | "faq";
const str = (v: unknown) => (v == null ? "" : String(v));
const same = (a: unknown, b: unknown) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

/** Draft of some settings keys with dirty tracking and a save that only sends changes. */
export function useSettingsDraft(keys: (keyof PropertySettings)[]) {
  const { data, isLoading, isError, refetch } = usePropertySettingsQuery();
  const save = useUpdatePropertySettingsMutation();
  const [d, setD] = useState<Partial<PropertySettings>>({});
  const pick = (s: PropertySettings) => Object.fromEntries(keys.map((k) => [k, s[k]])) as Partial<PropertySettings>;
  useEffect(() => {
    if (data) setD(pick(data));
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps
  const dirty = useMemo(() => (data ? keys.filter((k) => !same(d[k], data[k])) : []), [d, data]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!dirty.length) return;
    const h = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty.length]);
  const set = <K extends keyof PropertySettings>(k: K, v: PropertySettings[K]) => setD((p) => ({ ...p, [k]: v }));
  const discard = () => data && setD(pick(data));
  const commit = () =>
    save.mutate(Object.fromEntries(dirty.map((k) => [k, d[k]])) as Partial<PropertySettings>, {
      onSuccess: () => toast.success("Published", { description: "Your website shows the new words now." }),
      onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save"),
    });
  return { d, set, dirty, discard, commit, saving: save.isPending, isLoading: isLoading && !data, isError: isError && !data, refetch, settings: data };
}

export function WebsiteShell({ page, children, preview, previewTitle, draft }: { page: Page; children: React.ReactNode; preview: React.ReactNode; previewTitle: string; draft: ReturnType<typeof useSettingsDraft> }) {
  const site = str(draft.settings?.website).trim();
  const siteUrl = site ? (/^https?:\/\//.test(site) ? site : `https://${site}`) : null;
  return (
    <>
      <PageHeader
        title="Website content"
        subtitle="Change the words and pictures on your public website"
        actions={
          siteUrl ? (
            <GlassButton asChild variant="glass">
              <a href={`${siteUrl.replace(/\/$/, "")}${page === "about" ? "/about" : page === "faq" ? "/faq" : ""}`} target="_blank" rel="noreferrer">
                <Globe aria-hidden /> View website
              </a>
            </GlassButton>
          ) : null
        }
      />
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <nav aria-label="Website pages" className="flex gap-0.5 rounded-[12px] bg-glass-inset p-1">
            {(
              [
                ["home", "Homepage", "/admin/website"],
                ["about", "About page", "/admin/website/about"],
                ["faq", "FAQ page", "/admin/website/faq"],
              ] as const
            ).map(([k, l, to]) => (
              <Link key={k} to={to} aria-current={page === k ? "page" : undefined} className={cn("flex h-8 items-center rounded-[9px] px-3 text-label transition-colors", page === k ? "glass-2 font-medium text-ink" : "text-ink-2 hover:text-ink")}>
                {l}
              </Link>
            ))}
          </nav>
          <span className="flex-1" />
          <Link to="/admin/settings" search={{ section: "booking" }} className="glass-2 flex h-9 items-center gap-2 rounded-[12px] px-3 text-label text-ink-2 hover:text-ink">
            <ClipboardList className="size-4" aria-hidden /> Booking rules moved to Settings <span className="font-medium text-brand-text">Open</span>
          </Link>
        </div>
        {draft.isError ? (
          <div className="glass-2 flex flex-col items-center gap-3 rounded-[22px] px-6 py-14 text-center">
            <p className="text-card-title text-ink">Could not load your website content</p>
            <GlassButton variant="glass" onClick={() => void draft.refetch()}>
              Try again
            </GlassButton>
          </div>
        ) : draft.isLoading ? (
          <div className="h-[520px] animate-pulse rounded-[22px] bg-glass-inset" />
        ) : (
          <div className="grid items-start gap-4 md:gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
            <div className="flex min-w-0 flex-col gap-4">
              {children}
              <UnsavedBar show={draft.dirty.length > 0} count={draft.dirty.length} saving={draft.saving} onDiscard={draft.discard} onSave={draft.commit} />
            </div>
            <aside className="glass-2 flex flex-col gap-3 rounded-[22px] p-4 xl:sticky xl:top-4">
              <p className="flex items-center gap-2 text-label text-ink-2">
                <Eye className="size-4" aria-hidden /> Live preview · {previewTitle}
              </p>
              <div className="rounded-[18px] border border-glass-stroke bg-glass-inset p-4">{preview}</div>
            </aside>
          </div>
        )}
      </div>
    </>
  );
}

type D = ReturnType<typeof useSettingsDraft>;
const text = (draft: D, k: keyof PropertySettings) => ({ value: str(draft.d[k]), onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => draft.set(k, e.target.value as never) });
const Hidden = () => (
  <p className="flex items-center gap-2 text-label text-ink-3">
    <EyeOff className="size-4" aria-hidden /> Hidden on the website
  </p>
);

function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)} className={cn("relative h-6 w-10 shrink-0 cursor-pointer rounded-full border transition-colors", checked ? "border-transparent bg-brand" : "border-glass-stroke bg-ink-3/40")}>
      <span className={cn("absolute top-0.5 size-[18px] rounded-full bg-white shadow-[0_1px_2px_rgba(15,23,42,0.25)] transition-[left]", checked ? "left-[19px]" : "left-0.5")} />
    </button>
  );
}

/* ───────────── Homepage ───────────── */

export const HERO_KEYS: (keyof PropertySettings)[] = ["hotelName", "tagline", "description", "heroShowBadge", "heroBadgeText", "heroPrimaryCtaLabel", "heroPrimaryCtaHref", "heroSecondaryCtaLabel", "heroSecondaryCtaHref", "heroImageUrl", "heroImageAlt", "heroShowStats", "heroStat1Value", "heroStat1Label", "heroStat2Value", "heroStat2Label", "heroStat3Value", "heroStat3Label", "heroShowTrustBadge", "heroTrustTitle", "heroTrustSubtitle"];
export const CTA_KEYS: (keyof PropertySettings)[] = ["homeCtaShow", "homeCtaTitleLine1", "homeCtaTitleLine2", "homeCtaDescription", "homeCtaPrimaryLabel", "homeCtaPrimaryHref", "homeCtaSecondaryLabel", "homeCtaSecondaryHref", "homeCtaShowSecondary"];

export function HomepageContent() {
  const draft = useSettingsDraft([...HERO_KEYS, ...CTA_KEYS]);
  const [tab, setTab] = useState<"hero" | "cta">("hero");
  const d = draft.d;
  const preview =
    tab === "hero" ? (
      <div className="flex flex-col gap-2.5">
        {d.heroShowBadge && d.heroBadgeText ? <span className="w-fit rounded-full border border-brand-border bg-brand-tint px-2.5 py-1 text-[11px] font-medium text-brand-text">{str(d.heroBadgeText)}</span> : null}
        <p className="text-[22px] leading-7 font-semibold text-ink">{str(d.hotelName)}</p>
        <p className="text-body text-ink-2">{str(d.tagline)}</p>
        <p className="line-clamp-2 text-label text-ink-2">{str(d.description)}</p>
        <div className="flex gap-2">
          <span className="rounded-full bg-brand px-3 py-1.5 text-[11px] font-medium text-on-brand">{str(d.heroPrimaryCtaLabel) || "Book a bed"}</span>
          {d.heroSecondaryCtaLabel ? <span className="rounded-full border border-glass-stroke bg-glass-3 px-3 py-1.5 text-[11px] font-medium text-ink">{str(d.heroSecondaryCtaLabel)}</span> : null}
        </div>
        <div className="relative flex h-[120px] items-center justify-center overflow-hidden rounded-[12px] border border-glass-stroke bg-glass-3 text-ink-3">
          {d.heroImageUrl ? <img src={str(d.heroImageUrl)} alt="" className="size-full object-cover" /> : <ImageIcon className="size-6" aria-hidden />}
          {d.heroShowTrustBadge && d.heroTrustTitle ? (
            <span className="glass-3 absolute bottom-2 left-2 rounded-[10px] px-2.5 py-1.5 text-[11px]">
              <b className="block text-ink">{str(d.heroTrustTitle)}</b>
              <span className="text-ink-2">{str(d.heroTrustSubtitle)}</span>
            </span>
          ) : null}
        </div>
        {d.heroShowStats ? (
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <p className="text-body font-semibold text-ink">{str(d[`heroStat${i}Value` as keyof PropertySettings])}</p>
                <p className="text-[11px] text-ink-2">{str(d[`heroStat${i}Label` as keyof PropertySettings])}</p>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    ) : d.homeCtaShow ? (
      <div className="flex flex-col gap-2.5 rounded-[14px] bg-brand p-4 text-on-brand">
        <p className="text-[18px] leading-6 font-semibold">
          {str(d.homeCtaTitleLine1)} <span className="opacity-80">{str(d.homeCtaTitleLine2)}</span>
        </p>
        <p className="text-label opacity-90">{str(d.homeCtaDescription)}</p>
        <div className="flex gap-2">
          <span className="rounded-full bg-white px-3 py-1.5 text-[11px] font-medium text-brand-text">{str(d.homeCtaPrimaryLabel)}</span>
          {d.homeCtaShowSecondary ? <span className="rounded-full border border-white/60 px-3 py-1.5 text-[11px] font-medium">{str(d.homeCtaSecondaryLabel)}</span> : null}
        </div>
      </div>
    ) : (
      <Hidden />
    );

  return (
    <WebsiteShell page="home" draft={draft} preview={preview} previewTitle={tab === "hero" ? "Homepage hero" : "Call-to-action banner"}>
      <Segmented className="self-start" label="Homepage section" value={tab} onChange={setTab} options={[["hero", "Hero"], ["cta", "Call-to-action banner"]] as const} />
      {tab === "hero" ? (
        <>
          <SCard title="Headline" sub="The big text at the top of your homepage">
            <SField label="Hostel name">
              <input {...text(draft, "hotelName")} className={sInput} />
            </SField>
            <SField label="Tagline">
              <input {...text(draft, "tagline")} className={sInput} />
            </SField>
            <SField label="Description">
              <textarea {...text(draft, "description")} rows={3} className={cn(sInput, "h-auto py-2.5")} />
            </SField>
          </SCard>
          <SCard title="Promo badge" sub="A small label above the headline" right={<Switch label="Show promo badge" checked={Boolean(d.heroShowBadge)} onChange={(v) => draft.set("heroShowBadge", v)} />}>
            {d.heroShowBadge ? (
              <SField label="Badge text">
                <input {...text(draft, "heroBadgeText")} maxLength={60} className={sInput} />
              </SField>
            ) : (
              <Hidden />
            )}
          </SCard>
          <SCard title="Buttons" sub="Two buttons under the headline">
            <div className="grid gap-3 sm:grid-cols-2">
              <SField label="Main button text">
                <input {...text(draft, "heroPrimaryCtaLabel")} className={sInput} />
              </SField>
              <SField label="Main button link">
                <SInput icon={<Link2 />} {...text(draft, "heroPrimaryCtaHref")} />
              </SField>
              <SField label="Second button text">
                <input {...text(draft, "heroSecondaryCtaLabel")} className={sInput} />
              </SField>
              <SField label="Second button link">
                <SInput icon={<Link2 />} {...text(draft, "heroSecondaryCtaHref")} />
              </SField>
            </div>
          </SCard>
          <SCard title="Hero image" sub="The large photo next to the headline">
            <ImageField value={str(d.heroImageUrl)} onChange={(v) => draft.set("heroImageUrl", v)} />
            <SField label="Image description" hint="Helps people who use screen readers. Describe what is in the photo.">
              <input {...text(draft, "heroImageAlt")} className={sInput} />
            </SField>
          </SCard>
          <SCard title="Stats" sub="Three numbers that build trust" right={<Switch label="Show stats" checked={Boolean(d.heroShowStats)} onChange={(v) => draft.set("heroShowStats", v)} />}>
            {d.heroShowStats ? (
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map((i) => (
                  <SField key={`v${i}`} label={`Number ${i}`}>
                    <input {...text(draft, `heroStat${i}Value` as keyof PropertySettings)} className={sInput} />
                  </SField>
                ))}
                {[1, 2, 3].map((i) => (
                  <SField key={`l${i}`} label={`Label ${i}`}>
                    <input {...text(draft, `heroStat${i}Label` as keyof PropertySettings)} className={sInput} />
                  </SField>
                ))}
              </div>
            ) : (
              <Hidden />
            )}
          </SCard>
          <SCard title="Trust badge" sub="A small card on top of the hero image" right={<Switch label="Show trust badge" checked={Boolean(d.heroShowTrustBadge)} onChange={(v) => draft.set("heroShowTrustBadge", v)} />}>
            {d.heroShowTrustBadge ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <SField label="Title">
                  <input {...text(draft, "heroTrustTitle")} className={sInput} />
                </SField>
                <SField label="Subtitle">
                  <input {...text(draft, "heroTrustSubtitle")} className={sInput} />
                </SField>
              </div>
            ) : (
              <Hidden />
            )}
          </SCard>
        </>
      ) : (
        <>
          <SCard title="Banner" sub="The booking strip near the bottom of your homepage" right={<Switch label="Show banner" checked={Boolean(d.homeCtaShow)} onChange={(v) => draft.set("homeCtaShow", v)} />}>
            {d.homeCtaShow ? (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <SField label="Title line 1">
                    <input {...text(draft, "homeCtaTitleLine1")} className={sInput} />
                  </SField>
                  <SField label="Title line 2">
                    <input {...text(draft, "homeCtaTitleLine2")} className={sInput} />
                  </SField>
                </div>
                <SField label="Description">
                  <textarea {...text(draft, "homeCtaDescription")} rows={2} className={cn(sInput, "h-auto py-2.5")} />
                </SField>
              </>
            ) : (
              <Hidden />
            )}
          </SCard>
          {d.homeCtaShow ? (
            <SCard title="Buttons" sub="Where the banner buttons go">
              <div className="grid gap-3 sm:grid-cols-2">
                <SField label="Main button text">
                  <input {...text(draft, "homeCtaPrimaryLabel")} className={sInput} />
                </SField>
                <SField label="Main button link">
                  <SInput icon={<Link2 />} {...text(draft, "homeCtaPrimaryHref")} />
                </SField>
              </div>
              <SToggleRow title="Show a second button" checked={Boolean(d.homeCtaShowSecondary)} onChange={(v) => draft.set("homeCtaShowSecondary", v)} />
              {d.homeCtaShowSecondary ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <SField label="Second button text">
                    <input {...text(draft, "homeCtaSecondaryLabel")} className={sInput} />
                  </SField>
                  <SField label="Second button link">
                    <SInput icon={<Link2 />} {...text(draft, "homeCtaSecondaryHref")} />
                  </SField>
                </div>
              ) : null}
            </SCard>
          ) : null}
        </>
      )}
    </WebsiteShell>
  );
}

function ImageField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-[76px] w-[124px] shrink-0 items-center justify-center overflow-hidden rounded-[12px] border border-glass-stroke bg-glass-inset text-ink-3">
        {value ? <img src={value} alt="" className="size-full object-cover" /> : <ImageIcon className="size-5" aria-hidden />}
      </span>
      <div className="flex flex-col items-start gap-1.5">
        <label className="glass-2 inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-[10px] px-2.5 text-label font-medium text-ink hover:bg-glass-inset">
          <Upload className="size-3.5" aria-hidden /> {value ? "Replace" : "Upload"}
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              if (f.size > 4_000_000) return toast.error("Image is too large (max 4 MB)");
              const r = new FileReader();
              r.onload = () => onChange(String(r.result));
              r.readAsDataURL(f);
            }}
          />
        </label>
        {value ? (
          <button type="button" onClick={() => onChange("")} className="cursor-pointer px-1 text-label text-ink-2 hover:text-danger">
            Remove
          </button>
        ) : null}
      </div>
    </div>
  );
}

/* ───────────── About ───────────── */

export const ABOUT_KEYS: (keyof PropertySettings)[] = ["aboutBadgeText", "aboutTitleLine1", "aboutTitleAccent", "aboutIntro", "aboutMissionHeading", "aboutMissionParagraph1", "aboutMissionParagraph2", "aboutShowMissionStats", "aboutStat1Value", "aboutStat1Label", "aboutStat2Value", "aboutStat2Label", "aboutStat3Value", "aboutStat3Label", "aboutShowBrokerage", "aboutBrokerageValue", "aboutBrokerageLabel", "aboutValuesBadge", "aboutValuesHeading", "aboutValues", "aboutCtaHeading", "aboutCtaDescription", "aboutCtaPrimaryLabel", "aboutCtaPrimaryHref", "aboutCtaSecondaryLabel", "aboutCtaSecondaryHref", "aboutCtaShowSecondary"];
const VALUE_ICONS: [AboutValueCard["icon"], LucideIcon][] = [["shield-check", ShieldCheck], ["sparkles", Sparkles], ["heart", Heart], ["users", Users]];
const valueIcon = (i: string) => VALUE_ICONS.find(([k]) => k === i)?.[1] ?? Sparkles;

export function AboutContent() {
  const draft = useSettingsDraft(ABOUT_KEYS);
  const d = draft.d;
  const values = (d.aboutValues ?? []) as AboutValueCard[];
  const [edit, setEdit] = useState<{ index: number | null } | null>(null);
  const [remove, setRemove] = useState<number | null>(null);
  const preview = (
    <div className="flex flex-col gap-2.5">
      {d.aboutBadgeText ? <span className="w-fit rounded-full border border-brand-border bg-brand-tint px-2.5 py-1 text-[11px] font-medium text-brand-text">{str(d.aboutBadgeText)}</span> : null}
      <p className="text-[24px] leading-8 font-semibold text-ink">
        {str(d.aboutTitleLine1)} <span className="text-brand-text">{str(d.aboutTitleAccent)}</span>
      </p>
      <p className="text-label text-ink-2">{str(d.aboutIntro)}</p>
    </div>
  );
  return (
    <WebsiteShell page="about" draft={draft} preview={preview} previewTitle="About page">
      <SCard title="Page intro" sub="The first thing visitors see on your About page">
        <SField label="Badge text">
          <input {...text(draft, "aboutBadgeText")} className={sInput} />
        </SField>
        <div className="grid gap-3 sm:grid-cols-2">
          <SField label="Title">
            <input {...text(draft, "aboutTitleLine1")} className={sInput} />
          </SField>
          <SField label="Highlighted words">
            <input {...text(draft, "aboutTitleAccent")} className={sInput} />
          </SField>
        </div>
        <SField label="Intro">
          <textarea {...text(draft, "aboutIntro")} rows={3} className={cn(sInput, "h-auto py-2.5")} />
        </SField>
      </SCard>
      <SCard title="Mission" sub="Why you run this hostel">
        <SField label="Heading">
          <input {...text(draft, "aboutMissionHeading")} className={sInput} />
        </SField>
        <SField label="Paragraph 1">
          <textarea {...text(draft, "aboutMissionParagraph1")} rows={2} className={cn(sInput, "h-auto py-2.5")} />
        </SField>
        <SField label="Paragraph 2">
          <textarea {...text(draft, "aboutMissionParagraph2")} rows={2} className={cn(sInput, "h-auto py-2.5")} />
        </SField>
        <SToggleRow title="Show mission numbers" checked={Boolean(d.aboutShowMissionStats)} onChange={(v) => draft.set("aboutShowMissionStats", v)} />
        {d.aboutShowMissionStats ? (
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <SField key={`v${i}`} label={`Number ${i}`}>
                <input {...text(draft, `aboutStat${i}Value` as keyof PropertySettings)} className={sInput} />
              </SField>
            ))}
            {[1, 2, 3].map((i) => (
              <SField key={`l${i}`} label={`Label ${i}`}>
                <input {...text(draft, `aboutStat${i}Label` as keyof PropertySettings)} className={sInput} />
              </SField>
            ))}
          </div>
        ) : null}
      </SCard>
      <SCard title="Brokerage highlight" sub='A special note, like "No brokerage fee"' right={<Switch label="Show brokerage highlight" checked={Boolean(d.aboutShowBrokerage)} onChange={(v) => draft.set("aboutShowBrokerage", v)} />}>
        {d.aboutShowBrokerage ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <SField label="Big text">
              <input {...text(draft, "aboutBrokerageValue")} className={sInput} />
            </SField>
            <SField label="Small text">
              <input {...text(draft, "aboutBrokerageLabel")} className={sInput} />
            </SField>
          </div>
        ) : (
          <Hidden />
        )}
      </SCard>
      <SCard
        title="Values"
        sub="Short cards about what you care about"
        right={
          <GlassButton variant="glass" size="sm" className="h-8" disabled={values.length >= 8} onClick={() => setEdit({ index: null })}>
            <Plus aria-hidden /> Add value
          </GlassButton>
        }
      >
        <SField label="Section heading">
          <input {...text(draft, "aboutValuesHeading")} className={sInput} />
        </SField>
        <ul className="flex flex-col gap-2">
          {values.map((v, i) => {
            const Icon = valueIcon(v.icon);
            return (
              <li key={i} className="flex items-center gap-3 rounded-[14px] bg-glass-inset px-3 py-2.5">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-brand-tint text-brand-text">
                  <Icon className="size-4" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-body font-medium text-ink">{v.title}</p>
                  <p className="truncate text-label text-ink-2">{v.desc}</p>
                </div>
                <RowButton label={`Edit ${v.title}`} onClick={() => setEdit({ index: i })} icon={<Pencil />} />
                <RowButton danger label={`Remove ${v.title}`} onClick={() => setRemove(i)} icon={<Trash2 />} />
              </li>
            );
          })}
        </ul>
      </SCard>
      <SCard title="Bottom call-to-action" sub="The box at the end of the page">
        <SField label="Heading">
          <input {...text(draft, "aboutCtaHeading")} className={sInput} />
        </SField>
        <SField label="Description">
          <textarea {...text(draft, "aboutCtaDescription")} rows={2} className={cn(sInput, "h-auto py-2.5")} />
        </SField>
        <div className="grid gap-3 sm:grid-cols-2">
          <SField label="Button text">
            <input {...text(draft, "aboutCtaPrimaryLabel")} className={sInput} />
          </SField>
          <SField label="Button link">
            <SInput icon={<Link2 />} {...text(draft, "aboutCtaPrimaryHref")} />
          </SField>
        </div>
        <SToggleRow title="Show a second button" checked={Boolean(d.aboutCtaShowSecondary)} onChange={(v) => draft.set("aboutCtaShowSecondary", v)} />
        {d.aboutCtaShowSecondary ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <SField label="Second button text">
              <input {...text(draft, "aboutCtaSecondaryLabel")} className={sInput} />
            </SField>
            <SField label="Second button link">
              <SInput icon={<Link2 />} {...text(draft, "aboutCtaSecondaryHref")} />
            </SField>
          </div>
        ) : null}
      </SCard>

      <EditSheet
        open={edit != null}
        onOpenChange={(o) => !o && setEdit(null)}
        title={edit?.index != null ? "Edit value" : "Add value"}
        sub="Shown on your About page"
        saveLabel="Save value"
        initial={edit?.index != null ? values[edit.index] : { title: "", desc: "", icon: "sparkles" }}
        fields={[
          ["title", "Title", "input"],
          ["desc", "Short text", "textarea"],
        ]}
        icons
        onSave={(v) => {
          const card = v as AboutValueCard;
          const next = [...values];
          if (edit?.index != null) next[edit.index] = card;
          else next.push(card);
          draft.set("aboutValues", next);
          setEdit(null);
        }}
      />
      <ConfirmDialog open={remove != null} onOpenChange={(o) => !o && setRemove(null)} danger title="Remove this value?" body={remove != null ? `“${values[remove]?.title}” is removed from your About page when you save.` : ""} confirm="Remove value" onConfirm={() => { if (remove != null) draft.set("aboutValues", values.filter((_, i) => i !== remove)); setRemove(null); }} />
    </WebsiteShell>
  );
}

function RowButton({ label, onClick, icon, danger }: { label: string; onClick: () => void; icon: React.ReactNode; danger?: boolean }) {
  return (
    <button type="button" aria-label={label} onClick={onClick} className={cn("glass-2 flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-[9px] hover:bg-glass-3 [&_svg]:size-3.5", danger ? "text-danger" : "text-ink")}>
      {icon}
    </button>
  );
}

/** Figma 21.22 right-hand sheet for a FAQ question / About value. */
function EditSheet({
  open,
  onOpenChange,
  title,
  sub,
  saveLabel,
  initial,
  fields,
  icons,
  onSave,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  sub: string;
  saveLabel: string;
  initial: Record<string, string>;
  fields: [string, string, "input" | "textarea"][];
  icons?: boolean;
  onSave: (v: Record<string, string>) => void;
}) {
  const [v, setV] = useState<Record<string, string>>(initial);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    if (open) {
      setV(initial);
      setErr(null);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-scrim data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content aria-describedby={undefined} className="glass-3 fixed inset-x-0 bottom-0 z-50 flex max-h-[92svh] flex-col rounded-t-[28px] font-geist text-ink outline-none data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom md:inset-x-auto md:inset-y-4 md:right-4 md:max-h-none md:w-[min(460px,calc(100vw-32px))] md:rounded-[24px] md:data-[state=open]:slide-in-from-right">
          <div className="flex items-start gap-3 px-5 pt-5 pb-3">
            <div className="min-w-0 flex-1">
              <Dialog.Title className="text-card-title text-ink">{title}</Dialog.Title>
              <p className="text-label text-ink-2">{sub}</p>
            </div>
            <Dialog.Close aria-label="Close" className="glass-2 flex size-9 cursor-pointer items-center justify-center rounded-[10px] text-ink">
              <X className="size-4" />
            </Dialog.Close>
          </div>
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 py-2">
            {fields.map(([k, label, kind]) => (
              <SField key={k} label={label}>
                {kind === "input" ? (
                  <input autoFocus={k === fields[0][0]} value={v[k] ?? ""} onChange={(e) => setV((p) => ({ ...p, [k]: e.target.value }))} maxLength={160} className={sInput} />
                ) : (
                  <textarea value={v[k] ?? ""} onChange={(e) => setV((p) => ({ ...p, [k]: e.target.value }))} rows={6} maxLength={1500} className={cn(sInput, "h-auto py-2.5")} />
                )}
              </SField>
            ))}
            {icons ? (
              <SField label="Icon">
                <div className="flex gap-2">
                  {VALUE_ICONS.map(([k, I]) => (
                    <button key={k} type="button" aria-label={k} aria-pressed={v.icon === k} onClick={() => setV((p) => ({ ...p, icon: k }))} className={cn("flex size-10 cursor-pointer items-center justify-center rounded-[10px] border", v.icon === k ? "border-brand-border bg-brand-tint text-brand-text" : "border-transparent bg-glass-inset text-ink-2")}>
                      <I className="size-4" />
                    </button>
                  ))}
                </div>
              </SField>
            ) : null}
            {err ? <p className="text-label text-danger">{err}</p> : null}
          </div>
          <div className="flex items-center justify-end gap-2 px-5 py-4">
            <GlassButton variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </GlassButton>
            <GlassButton
              onClick={() => {
                if (fields.some(([k]) => !String(v[k] ?? "").trim())) return setErr("Fill in every box");
                onSave(Object.fromEntries(Object.entries(v).map(([k, x]) => [k, String(x).trim()])));
              }}
            >
              {saveLabel}
            </GlassButton>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/* ───────────── FAQ ───────────── */

export const FAQ_KEYS: (keyof PropertySettings)[] = ["faqBadgeText", "faqTitleLine1", "faqTitleAccent", "faqIntro", "faqs", "faqCtaLabel", "faqCtaHref"];

export function FaqContent() {
  const draft = useSettingsDraft(FAQ_KEYS);
  const d = draft.d;
  const faqs = (d.faqs ?? []) as FaqItem[];
  const [edit, setEdit] = useState<{ index: number | null } | null>(null);
  const [remove, setRemove] = useState<number | null>(null);
  const [dragI, setDragI] = useState<number | null>(null);
  const preview = (
    <div className="flex flex-col gap-2.5">
      <p className="text-body font-semibold text-ink">
        {str(d.faqTitleLine1)} <span className="text-brand-text">{str(d.faqTitleAccent)}</span>
      </p>
      {faqs.slice(0, 4).map((f, i) => (
        <div key={i} className="flex items-center gap-2 rounded-[10px] border border-glass-stroke bg-glass-3 px-3 py-2.5 text-label text-ink">
          <span className="min-w-0 flex-1 truncate">{f.q}</span>
          <span className="text-ink-3">›</span>
        </div>
      ))}
      {faqs.length > 4 ? <p className="text-[11px] text-ink-2">+{faqs.length - 4} more</p> : null}
    </div>
  );
  return (
    <WebsiteShell page="faq" draft={draft} preview={preview} previewTitle="FAQ page">
      <SCard title="Page intro" sub="The top of your FAQ page">
        <SField label="Badge text">
          <input {...text(draft, "faqBadgeText")} className={sInput} />
        </SField>
        <div className="grid gap-3 sm:grid-cols-2">
          <SField label="Title">
            <input {...text(draft, "faqTitleLine1")} className={sInput} />
          </SField>
          <SField label="Highlighted words">
            <input {...text(draft, "faqTitleAccent")} className={sInput} />
          </SField>
        </div>
        <SField label="Intro">
          <textarea {...text(draft, "faqIntro")} rows={2} className={cn(sInput, "h-auto py-2.5")} />
        </SField>
      </SCard>
      <SCard
        title="Questions & answers"
        sub={`${faqs.length} question${faqs.length === 1 ? "" : "s"} · drag to change the order`}
        right={
          <GlassButton size="sm" className="h-8" onClick={() => setEdit({ index: null })}>
            <Plus aria-hidden /> Add question
          </GlassButton>
        }
      >
        <ul className="flex flex-col gap-2">
          {faqs.map((f, i) => (
            <li
              key={`${i}-${f.q}`}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.effectAllowed = "move";
                setDragI(i);
              }}
              onDragEnd={() => setDragI(null)}
              onDragOver={(e) => {
                if (dragI == null || dragI === i) return;
                e.preventDefault();
                const next = [...faqs];
                const [m] = next.splice(dragI, 1);
                next.splice(i, 0, m);
                draft.set("faqs", next);
                setDragI(i);
              }}
              className={cn("flex items-center gap-2.5 rounded-[14px] bg-glass-inset px-3 py-2.5 transition-opacity", dragI === i && "opacity-50")}
            >
              <GripVertical className="size-4 shrink-0 cursor-grab text-ink-3" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="truncate text-body font-medium text-ink">{f.q}</p>
                <p className="truncate text-label text-ink-2">{f.a}</p>
              </div>
              <RowButton label={`Edit ${f.q}`} onClick={() => setEdit({ index: i })} icon={<Pencil />} />
              <RowButton danger label={`Remove ${f.q}`} onClick={() => setRemove(i)} icon={<Trash2 />} />
            </li>
          ))}
          {faqs.length === 0 ? <p className="rounded-[14px] bg-glass-inset px-4 py-6 text-center text-body text-ink-2">No questions yet.</p> : null}
        </ul>
      </SCard>
      <SCard title="Bottom button" sub="Shown at the end of the FAQ page">
        <div className="grid gap-3 sm:grid-cols-2">
          <SField label="Button text">
            <input {...text(draft, "faqCtaLabel")} className={sInput} />
          </SField>
          <SField label="Button link">
            <SInput icon={<Link2 />} {...text(draft, "faqCtaHref")} />
          </SField>
        </div>
      </SCard>

      <EditSheet
        open={edit != null}
        onOpenChange={(o) => !o && setEdit(null)}
        title={edit?.index != null ? "Edit question" : "Add question"}
        sub="Shown on your FAQ page"
        saveLabel="Save question"
        initial={edit?.index != null ? (faqs[edit.index] as unknown as Record<string, string>) : { q: "", a: "" }}
        fields={[
          ["q", "Question", "input"],
          ["a", "Answer", "textarea"],
        ]}
        onSave={(v) => {
          const item = { q: v.q, a: v.a };
          const next = [...faqs];
          if (edit?.index != null) next[edit.index] = item;
          else next.push(item);
          draft.set("faqs", next);
          setEdit(null);
        }}
      />
      <ConfirmDialog
        open={remove != null}
        onOpenChange={(o) => !o && setRemove(null)}
        danger
        title="Remove this question?"
        body={remove != null ? `“${faqs[remove]?.q}” disappears from your FAQ page when you save. You can't undo this after saving.` : ""}
        confirm="Remove question"
        onConfirm={() => {
          if (remove != null) draft.set("faqs", faqs.filter((_, i) => i !== remove));
          setRemove(null);
        }}
      />
    </WebsiteShell>
  );
}
