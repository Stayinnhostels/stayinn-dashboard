import type { PropertySettings } from "@/types/domain/property-settings.types";

/** Default hero section values — kept in sync with the backend `PROPERTY_SETTINGS_DEFAULTS`. */
export const HOMEPAGE_HERO_DEFAULTS: Pick<
  PropertySettings,
  | "heroShowBadge"
  | "heroBadgeText"
  | "heroPrimaryCtaLabel"
  | "heroPrimaryCtaHref"
  | "heroSecondaryCtaLabel"
  | "heroSecondaryCtaHref"
  | "heroImageUrl"
  | "heroImageAlt"
  | "heroShowStats"
  | "heroStat1Value"
  | "heroStat1Label"
  | "heroStat2Value"
  | "heroStat2Label"
  | "heroStat3Value"
  | "heroStat3Label"
  | "heroShowTrustBadge"
  | "heroTrustTitle"
  | "heroTrustSubtitle"
> = {
  heroShowBadge: false,
  heroBadgeText: "Now booking for 2026",
  heroPrimaryCtaLabel: "Book Your Seat",
  heroPrimaryCtaHref: "/booking",
  heroSecondaryCtaLabel: "Explore Rooms",
  heroSecondaryCtaHref: "/rooms",
  heroImageUrl: "",
  heroImageAlt: "Modern Stay Inn Hostel common room with students",
  /** Legacy fields — homepage no longer shows these; edit About page stats instead. */
  heroShowStats: false,
  heroStat1Value: "100+",
  heroStat1Label: "Happy Residents",
  heroStat2Value: "1",
  heroStat2Label: "Locations",
  heroStat3Value: "4.8",
  heroStat3Label: "/5",
  heroShowTrustBadge: true,
  heroTrustTitle: "Verified Safe",
  heroTrustSubtitle: "24/7 CCTV & Security",
};

export const DEFAULT_HERO_PREVIEW_IMAGE = "/assets/hero-hostel.jpg";

/** Preview src for the dashboard — only returns a URL when one can actually be loaded. */
export function resolveHeroPreviewSrc(heroImageUrl: string): string | undefined {
  const trimmed = heroImageUrl.trim();
  if (trimmed) return trimmed;

  const frontendBase = (import.meta.env.VITE_PUBLIC_FRONTEND_URL as string | undefined)?.replace(/\/$/, "");
  if (frontendBase) return `${frontendBase}${DEFAULT_HERO_PREVIEW_IMAGE}`;

  return undefined;
}

/** Same fallback chain as the public website hero image. */
export function resolveHeroImageSrc(heroImageUrl: string) {
  const trimmed = heroImageUrl.trim();
  return trimmed || DEFAULT_HERO_PREVIEW_IMAGE;
}
