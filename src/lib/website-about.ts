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
  | "aboutShowMissionStats"
  | "aboutStat1Value"
  | "aboutStat1Label"
  | "aboutStat2Value"
  | "aboutStat2Label"
  | "aboutStat3Value"
  | "aboutStat3Label"
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
    ...ABOUT_PAGE_FORM_DEFAULTS,
    aboutBadgeText: settings.aboutBadgeText,
    aboutTitleLine1: settings.aboutTitleLine1,
    aboutTitleAccent: settings.aboutTitleAccent,
    aboutIntro: settings.aboutIntro,
    aboutMissionHeading: settings.aboutMissionHeading,
    aboutMissionParagraph1: settings.aboutMissionParagraph1,
    aboutMissionParagraph2: settings.aboutMissionParagraph2,
    aboutShowMissionStats: settings.aboutShowMissionStats ?? ABOUT_PAGE_FORM_DEFAULTS.aboutShowMissionStats,
    aboutStat1Value: settings.aboutStat1Value || ABOUT_PAGE_FORM_DEFAULTS.aboutStat1Value,
    aboutStat1Label: settings.aboutStat1Label || ABOUT_PAGE_FORM_DEFAULTS.aboutStat1Label,
    aboutStat2Value: settings.aboutStat2Value || ABOUT_PAGE_FORM_DEFAULTS.aboutStat2Value,
    aboutStat2Label: settings.aboutStat2Label || ABOUT_PAGE_FORM_DEFAULTS.aboutStat2Label,
    aboutStat3Value: settings.aboutStat3Value || ABOUT_PAGE_FORM_DEFAULTS.aboutStat3Value,
    aboutStat3Label: settings.aboutStat3Label || ABOUT_PAGE_FORM_DEFAULTS.aboutStat3Label,
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
