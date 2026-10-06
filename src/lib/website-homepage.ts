import type { PropertySettings } from "@/types/domain/property-settings.types";
import { HOMEPAGE_HERO_DEFAULTS } from "@/lib/homepage-hero-defaults";
import { HOMEPAGE_CTA_DEFAULTS } from "@/lib/homepage-cta-defaults";

/** Fields edited under Admin → Website → Hero (top banner on the public homepage). */
export type HeroSectionForm = Pick<
  PropertySettings,
  | "hotelName"
  | "tagline"
  | "description"
  | "heroShowBadge"
  | "heroBadgeText"
  | "heroPrimaryCtaLabel"
  | "heroPrimaryCtaHref"
  | "heroSecondaryCtaLabel"
  | "heroSecondaryCtaHref"
  | "heroImageUrl"
  | "heroImageAlt"
  | "heroShowTrustBadge"
  | "heroTrustTitle"
  | "heroTrustSubtitle"
>;

export const HERO_SECTION_DEFAULTS: HeroSectionForm = {
  hotelName: "Stay Inn Hostels",
  tagline: "Live your journey, stay with us",
  description:
    "Affordable, secure and spotlessly clean accommodation built for students and working professionals. Pick your seat — we handle the rest.",
  ...HOMEPAGE_HERO_DEFAULTS,
};

export function pickHeroSection(settings: PropertySettings): HeroSectionForm {
  return {
    hotelName: settings.hotelName,
    tagline: settings.tagline,
    description: settings.description,
    heroShowBadge: settings.heroShowBadge,
    heroBadgeText: settings.heroBadgeText,
    heroPrimaryCtaLabel: settings.heroPrimaryCtaLabel,
    heroPrimaryCtaHref: settings.heroPrimaryCtaHref,
    heroSecondaryCtaLabel: settings.heroSecondaryCtaLabel,
    heroSecondaryCtaHref: settings.heroSecondaryCtaHref,
    heroImageUrl: settings.heroImageUrl,
    heroImageAlt: settings.heroImageAlt,
    heroShowTrustBadge: settings.heroShowTrustBadge,
    heroTrustTitle: settings.heroTrustTitle,
    heroTrustSubtitle: settings.heroTrustSubtitle,
  };
}

/** Fields edited under Admin → Website → CTA banner (bottom booking strip). */
export type CtaBannerSectionForm = Pick<
  PropertySettings,
  | "homeCtaShow"
  | "homeCtaTitleLine1"
  | "homeCtaTitleLine2"
  | "homeCtaDescription"
  | "homeCtaPrimaryLabel"
  | "homeCtaPrimaryHref"
  | "homeCtaSecondaryLabel"
  | "homeCtaSecondaryHref"
  | "homeCtaShowSecondary"
>;

export const CTA_BANNER_SECTION_DEFAULTS: CtaBannerSectionForm = {
  ...HOMEPAGE_CTA_DEFAULTS,
};

export function pickCtaBannerSection(settings: PropertySettings): CtaBannerSectionForm {
  return {
    homeCtaShow: settings.homeCtaShow,
    homeCtaTitleLine1: settings.homeCtaTitleLine1,
    homeCtaTitleLine2: settings.homeCtaTitleLine2,
    homeCtaDescription: settings.homeCtaDescription,
    homeCtaPrimaryLabel: settings.homeCtaPrimaryLabel,
    homeCtaPrimaryHref: settings.homeCtaPrimaryHref,
    homeCtaSecondaryLabel: settings.homeCtaSecondaryLabel,
    homeCtaSecondaryHref: settings.homeCtaSecondaryHref,
    homeCtaShowSecondary: settings.homeCtaShowSecondary,
  };
}
