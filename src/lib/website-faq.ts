import { FAQ_PAGE_FORM_DEFAULTS, type FaqPageForm } from "@/lib/faq-page-defaults";
import { normalizeFaqs } from "@/lib/faqs";
import type { PropertySettings } from "@/types/domain/property-settings.types";

export { FAQ_PAGE_FORM_DEFAULTS };
export type { FaqPageForm };

export function pickFaqPage(settings: PropertySettings): FaqPageForm {
  return {
    faqBadgeText: settings.faqBadgeText || FAQ_PAGE_FORM_DEFAULTS.faqBadgeText,
    faqTitleLine1: settings.faqTitleLine1 || FAQ_PAGE_FORM_DEFAULTS.faqTitleLine1,
    faqTitleAccent: settings.faqTitleAccent || FAQ_PAGE_FORM_DEFAULTS.faqTitleAccent,
    faqIntro: settings.faqIntro || FAQ_PAGE_FORM_DEFAULTS.faqIntro,
    faqs: normalizeFaqs(settings as unknown as Record<string, unknown>),
    faqCtaLabel: settings.faqCtaLabel || FAQ_PAGE_FORM_DEFAULTS.faqCtaLabel,
    faqCtaHref: settings.faqCtaHref || FAQ_PAGE_FORM_DEFAULTS.faqCtaHref,
  };
}
