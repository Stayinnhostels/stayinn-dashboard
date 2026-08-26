import { useEffect, useState } from "react";
import { Joyride, EVENTS, type EventData, type Step, type TooltipRenderProps } from "react-joyride";
import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import {
  hasSeenOnboardingTour,
  markOnboardingTourSeen,
  onboardingTourStorageKey,
} from "@/lib/onboarding-tour-storage";
import { useOnboardingTourStore } from "@/stores/tour/onboarding-tour.store";
import { cn } from "@/lib/utils";

const desktopSteps: Step[] = [
  {
    target: "body",
    placement: "center",
    title: "Welcome to Stay Inn Admin",
    content:
      "Here's a quick tour of the console. You can replay it anytime from the help icon in the top bar.",
  },
  {
    target: '[data-tour="nav-dashboard"]',
    title: "Dashboard",
    content: "Your at-a-glance overview — occupancy, revenue, and what needs attention today.",
  },
  {
    target: '[data-tour="nav-section-operations"]',
    title: "Operations",
    content:
      "Manage rooms, bookings, residents, monthly rent, maintenance, and facilities from here.",
  },
  {
    target: '[data-tour="nav-section-people"]',
    title: "People",
    content: "Manage guest users, staff accounts, messages, and reviews.",
  },
  {
    target: '[data-tour="nav-section-finance"]',
    title: "Finance",
    content: "Track payments, security deposits, revenue analytics, monthly expenses, and coupons.",
  },
  {
    target: '[data-tour="nav-section-system"]',
    title: "System",
    content:
      "Configure notifications, edit your public website content, and adjust hostel settings.",
  },
  {
    target: '[data-tour="header-notifications"]',
    title: "Notifications",
    content: "New bookings, payments, and other alerts show up here in real time.",
  },
  {
    target: '[data-tour="header-account"]',
    title: "Your account",
    content: "Update your profile photo or sign out from this menu.",
  },
  {
    target: '[data-tour="header-help"]',
    title: "Need a refresher?",
    content: "Click this help icon anytime to replay the tour.",
  },
];

const mobileSteps: Step[] = [
  {
    target: "body",
    placement: "center",
    title: "Welcome to Stay Inn Admin",
    content:
      "Here's a quick tour of the console. You can replay it anytime from the help icon in the top bar.",
  },
  {
    target: '[data-tour="mobile-menu"]',
    title: "Navigation",
    content: "Tap here to open the menu — rooms, bookings, finance, people, and more.",
  },
  {
    target: '[data-tour="header-notifications"]',
    title: "Notifications",
    content: "New bookings, payments, and other alerts show up here in real time.",
  },
  {
    target: '[data-tour="header-account"]',
    title: "Your account",
    content: "Update your profile photo or sign out from this menu.",
  },
  {
    target: '[data-tour="header-help"]',
    title: "Need a refresher?",
    content: "Tap this help icon anytime to replay the tour.",
  },
];

function TourTooltip({
  backProps,
  closeProps,
  index,
  isLastStep,
  primaryProps,
  size,
  skipProps,
  step,
  tooltipProps,
}: TooltipRenderProps) {
  const progress = ((index + 1) / size) * 100;

  return (
    <div
      {...tooltipProps}
      className="w-[min(380px,90vw)] overflow-hidden rounded-2xl border border-border/60 bg-popover text-popover-foreground shadow-2xl shadow-primary/10"
    >
      <div className="h-1 w-full bg-muted">
        <div
          className="h-full rounded-r-full bg-linear-to-r from-primary to-primary/60 transition-[width] duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-primary to-primary/70 text-primary-foreground shadow-sm shadow-primary/30">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            {step.title ? (
              <p className="pt-1 text-sm font-semibold leading-snug">{step.title}</p>
            ) : null}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="-mr-1 -mt-1 h-7 w-7 shrink-0 rounded-full"
            {...closeProps}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="mt-2 pl-9.5 text-sm leading-relaxed text-muted-foreground">
          {step.content}
        </div>

        <div className="mt-4 flex items-center justify-between gap-2 pl-9.5">
          <div className="flex items-center gap-1">
            {Array.from({ length: size }).map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === index ? "w-4 bg-primary" : "w-1.5 bg-muted-foreground/25",
                )}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            {!isLastStep ? (
              <Button variant="ghost" size="sm" className="text-muted-foreground" {...skipProps} />
            ) : null}
            {index > 0 ? <Button variant="outline" size="sm" {...backProps} /> : null}
            <Button size="sm" className="shadow-sm shadow-primary/30" {...primaryProps} />
          </div>
        </div>
      </div>
    </div>
  );
}

function useIsDesktopViewport() {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches,
  );

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 768px)");
    const handler = () => setIsDesktop(mql.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return isDesktop;
}

export function OnboardingTour() {
  const { user } = useAuth();
  const run = useOnboardingTourStore((s) => s.run);
  const start = useOnboardingTourStore((s) => s.start);
  const stop = useOnboardingTourStore((s) => s.stop);
  const isDesktop = useIsDesktopViewport();
  const tourKey = user ? onboardingTourStorageKey(user) : "";

  useEffect(() => {
    if (!user || !tourKey) return;
    if (hasSeenOnboardingTour(tourKey)) return;
    const timer = window.setTimeout(() => {
      markOnboardingTourSeen(tourKey);
      start();
    }, 700);
    return () => window.clearTimeout(timer);
  }, [user, tourKey, start]);

  function handleEvent(data: EventData) {
    if (data.type === EVENTS.TOUR_END) {
      stop();
      if (tourKey) markOnboardingTourSeen(tourKey);
    }
  }

  if (!user) return null;

  return (
    <Joyride
      run={run}
      steps={isDesktop ? desktopSteps : mobileSteps}
      continuous
      scrollToFirstStep
      onEvent={handleEvent}
      tooltipComponent={TourTooltip}
      locale={{ last: "Done" }}
      options={{
        skipBeacon: true,
        closeButtonAction: "skip",
        zIndex: 10000,
        arrowColor: "var(--popover)",
        overlayColor: "color-mix(in srgb, var(--foreground) 45%, transparent)",
        primaryColor: "var(--primary)",
        spotlightPadding: 8,
        spotlightRadius: 14,
      }}
    />
  );
}
