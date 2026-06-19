import type { PropertySettings } from "@/types/domain/property-settings.types";
import { ABOUT_PAGE_DEFAULTS } from "@/lib/about-page-defaults";
import { normalizeAboutValues } from "@/lib/about-values";

/** Fields edited under Admin → Website → About page. */
export type AboutPageForm = Pick<
  PropertySettings,
  | "aboutBadgeText"
  | "aboutTitleLine1"
  | "aboutTitleAccent"
  | "aboutIntro"
  | "aboutMissionHeading"
  | "aboutMissionParagraph1"
  | "aboutMissionParagraph2"
  | "aboutShowBrokerage"
  | "aboutBrokerageValue"
  | "aboutBrokerageLabel"
  | "aboutValuesBadge"
  | "aboutValuesHeading"
  | "aboutValues"
  | "aboutCtaHeading"
  | "aboutCtaDescription"
  | "aboutCtaPrimaryLabel"
  | "aboutCtaPrimaryHref"
  | "aboutCtaSecondaryLabel"
  | "aboutCtaSecondaryHref"
  | "aboutCtaShowSecondary"
>;

export const ABOUT_PAGE_FORM_DEFAULTS: AboutPageForm = {
  ...ABOUT_PAGE_DEFAULTS,
};

export function pickAboutPage(settings: PropertySettings): AboutPageForm {
  return {
    aboutBadgeText: settings.aboutBadgeText,
    aboutTitleLine1: settings.aboutTitleLine1,
    aboutTitleAccent: settings.aboutTitleAccent,
    aboutIntro: settings.aboutIntro,
    aboutMissionHeading: settings.aboutMissionHeading,
    aboutMissionParagraph1: settings.aboutMissionParagraph1,
    aboutMissionParagraph2: settings.aboutMissionParagraph2,
    aboutShowBrokerage: settings.aboutShowBrokerage,
    aboutBrokerageValue: settings.aboutBrokerageValue,
    aboutBrokerageLabel: settings.aboutBrokerageLabel,
    aboutValuesBadge: settings.aboutValuesBadge,
    aboutValuesHeading: settings.aboutValuesHeading,
    aboutValues: normalizeAboutValues(settings as unknown as Record<string, unknown>),
    aboutCtaHeading: settings.aboutCtaHeading,
    aboutCtaDescription: settings.aboutCtaDescription,
    aboutCtaPrimaryLabel: settings.aboutCtaPrimaryLabel,
    aboutCtaPrimaryHref: settings.aboutCtaPrimaryHref,
    aboutCtaSecondaryLabel: settings.aboutCtaSecondaryLabel,
    aboutCtaSecondaryHref: settings.aboutCtaSecondaryHref,
    aboutCtaShowSecondary: settings.aboutCtaShowSecondary,
  };
}
