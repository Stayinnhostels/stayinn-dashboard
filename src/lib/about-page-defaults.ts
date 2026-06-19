import type { PropertySettings } from "@/types/domain/property-settings.types";
import { DEFAULT_ABOUT_VALUES } from "@/lib/about-values";

export const ABOUT_VALUE_ICON_OPTIONS = [
  { value: "heart", label: "Heart" },
  { value: "shield-check", label: "Shield" },
  { value: "sparkles", label: "Sparkles" },
  { value: "users", label: "Users" },
] as const;

export type AboutValueIcon = (typeof ABOUT_VALUE_ICON_OPTIONS)[number]["value"];

export const ABOUT_PAGE_DEFAULTS: Pick<
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
> = {
  aboutBadgeText: "ABOUT US",
  aboutTitleLine1: "Hostel living,",
  aboutTitleAccent: "reimagined.",
  aboutIntro:
    "Stay Inn Hostels started with a simple idea: students and young professionals deserve clean, safe and affordable places to live.",
  aboutMissionHeading: "Our mission",
  aboutMissionParagraph1:
    "Build the most loved network of seat-based hostels in the country — places that feel less like accommodation and more like home. We believe great living shouldn't cost a fortune, and that community is the most underrated amenity of all.",
  aboutMissionParagraph2:
    "From biometric entry to nutritionist-approved meals, every detail at Stay Inn is designed to give you back the one thing you can't buy more of — time.",
  aboutShowBrokerage: true,
  aboutBrokerageValue: "0",
  aboutBrokerageLabel: "Brokerage",
  aboutValuesBadge: "VALUES",
  aboutValuesHeading: "What we stand for",
  aboutValues: DEFAULT_ABOUT_VALUES,
  aboutCtaHeading: "Ready to find your seat?",
  aboutCtaDescription: "Browse rooms across all our locations and book in 60 seconds.",
  aboutCtaPrimaryLabel: "Browse Rooms",
  aboutCtaPrimaryHref: "/rooms",
  aboutCtaSecondaryLabel: "Contact Us",
  aboutCtaSecondaryHref: "/contact",
  aboutCtaShowSecondary: true,
};
