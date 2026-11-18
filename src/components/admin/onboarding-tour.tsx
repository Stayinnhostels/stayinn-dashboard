import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Check, House } from "lucide-react";
import { GlassButton } from "@/components/glass";
import { useAuth } from "@/lib/auth-context";
import { useGlassDark } from "@/lib/glass-theme";
import {
  hasSeenOnboardingTour,
  markOnboardingTourSeen,
  onboardingTourStorageKey,
} from "@/lib/onboarding-tour-storage";
import { useOnboardingTourStore } from "@/stores/tour/onboarding-tour.store";
import { cn } from "@/lib/utils";

/**
 * Figma 20 · Dashboard tour. 7 steps: Welcome modal → 5 spotlight steps → "You're all set".
 * Spotlight = dimmed screen with a rounded cut-out around the target, a 2px brand ring
 * (6px outside the target) and a glass tooltip placed next to it. Desktop and mobile have
 * their own step lists (20.0x Desktop / 20.0x Mobile). Runs on the Dashboard.
 */

type SpotStep = { target: string; title: string; body: string };

const DESKTOP_STEPS: SpotStep[] = [
  {
    target: "nav-principal",
    title: "Your menu",
    body: "Everything you need is here: bookings, residents, rooms, payments and more.",
  },
  {
    target: "sidebar-search",
    title: "Find anything fast",
    body: "Search for a guest, room or booking. Press ⌘K to open search from any page.",
  },
  {
    target: "dashboard-kpis",
    title: "Today at a glance",
    body: "See current bookings, check-outs, rooms and how full you are.",
  },
  {
    target: "header-notifications",
    title: "Alerts",
    body: "New bookings, check-outs and full beds show up here.",
  },
  {
    target: "header-account",
    title: "Your account",
    body: "Change your theme (Light, Dark or System), replay this tour or sign out.",
  },
];

const MOBILE_STEPS: SpotStep[] = [
  {
    target: "mobile-tabbar",
    title: "Move around",
    body: "Use these tabs to jump between Home, Bookings, Residents and Rooms.",
  },
  {
    target: "dashboard-kpis",
    title: "Today at a glance",
    body: "See current bookings, check-outs, rooms and how full you are.",
  },
  { target: "mobile-new", title: "Add quickly", body: "Tap New to add a booking, a resident or a room." },
  {
    target: "header-notifications",
    title: "Alerts",
    body: "New bookings, check-outs and full beds show up here.",
  },
  {
    target: "mobile-menu",
    title: "More",
    body: "Open More for settings, your theme (Light, Dark or System) and sign out.",
  },
];

const TOTAL = 7; // welcome + 5 spots + all set
const RING_PAD = 6;
const GAP_DESKTOP = 16;
const GAP_MOBILE = 12;
const EDGE = 16;

type Rect = { top: number; left: number; width: number; height: number; radius: number };

function useIsMobileViewport() {
  const [mobile, setMobile] = useState(
    () => typeof window !== "undefined" && !window.matchMedia("(min-width: 768px)").matches,
  );
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 768px)");
    const onChange = () => setMobile(!mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return mobile;
}

/** The visible element for a data-tour id (the sidebar keeps a hidden, inert copy). */
function findTarget(id: string): HTMLElement | null {
  const all = document.querySelectorAll<HTMLElement>(`[data-tour="${id}"]`);
  for (const el of all) {
    if (el.closest('[aria-hidden="true"], [inert]')) continue;
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) return el;
  }
  return null;
}

function ringFor(el: HTMLElement): Rect {
  const r = el.getBoundingClientRect();
  const own = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0;
  return {
    top: r.top - RING_PAD,
    left: r.left - RING_PAD,
    width: r.width + RING_PAD * 2,
    height: r.height + RING_PAD * 2,
    radius: Math.max(16, own + RING_PAD),
  };
}

/** Where the tooltip goes, following the Figma frames. */
function placeTooltip(ring: Rect, tip: { w: number; h: number }, mobile: boolean) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const clampTop = (t: number) => Math.min(Math.max(EDGE, t), vh - tip.h - EDGE);
  const clampLeft = (l: number) => Math.min(Math.max(EDGE, l), vw - tip.w - EDGE);
  const bottom = ring.top + ring.height;
  const right = ring.left + ring.width;

  if (mobile) {
    const below = bottom + GAP_MOBILE;
    const fitsBelow = below + tip.h <= vh - EDGE;
    const inUpperHalf = ring.top + ring.height / 2 < vh / 2;
    const top = inUpperHalf && fitsBelow ? below : ring.top - GAP_MOBILE - tip.h;
    return { top: clampTop(top), left: EDGE };
  }

  // Sidebar targets: to the right, top-aligned (bottom-aligned near the screen bottom).
  if (ring.left < vw * 0.3 && right + GAP_DESKTOP + tip.w <= vw - EDGE) {
    let top = ring.top + RING_PAD;
    if (top + tip.h > vh - EDGE) top = bottom - RING_PAD - tip.h;
    return { top: clampTop(top), left: right + GAP_DESKTOP };
  }
  // Everything else: below, left-aligned (right-aligned when it would overflow), else above.
  let left = ring.left + RING_PAD;
  if (left + tip.w > vw - EDGE) left = right - RING_PAD - tip.w;
  let top = bottom + GAP_DESKTOP;
  if (top + tip.h > vh - EDGE) top = ring.top - GAP_DESKTOP - tip.h;
  return { top: clampTop(top), left: clampLeft(left) };
}

export function OnboardingTour() {
  const { user } = useAuth();
  const run = useOnboardingTourStore((s) => s.run);
  const step = useOnboardingTourStore((s) => s.stepIndex);
  const setStep = useOnboardingTourStore((s) => s.setStepIndex);
  const start = useOnboardingTourStore((s) => s.start);
  const stop = useOnboardingTourStore((s) => s.stop);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const mobile = useIsMobileViewport();
  const dark = useGlassDark();
  const tourKey = user ? onboardingTourStorageKey(user) : "";
  const steps = mobile ? MOBILE_STEPS : DESKTOP_STEPS;

  // First visit: open the Welcome step once.
  useEffect(() => {
    if (!user || !tourKey || hasSeenOnboardingTour(tourKey)) return;
    const t = window.setTimeout(() => start(), 700);
    return () => window.clearTimeout(t);
  }, [user, tourKey, start]);

  const finish = useCallback(() => {
    if (tourKey) markOnboardingTourSeen(tourKey);
    stop();
  }, [tourKey, stop]);

  // The tour walks through the Dashboard.
  useEffect(() => {
    if (run && pathname !== "/admin" && pathname !== "/admin/") void navigate({ to: "/admin" });
  }, [run, pathname, navigate]);

  const spot = step >= 1 && step <= steps.length ? steps[step - 1] : null;
  const next = () => setStep(Math.min(step + 1, TOTAL - 1));
  const back = () => setStep(Math.max(step - 1, 1));

  useEffect(() => {
    if (!run) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish();
      else if (spot && e.key === "ArrowRight") next();
      else if (spot && e.key === "ArrowLeft" && step > 1) back();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!user || !run) return null;

  return createPortal(
    <div className={cn("glass-root fixed inset-0 z-[10000] font-geist", dark && "dark")} style={{ background: "transparent" }}>
      {spot ? (
        <Spotlight
          key={`${mobile}-${step}`}
          step={step}
          spot={spot}
          mobile={mobile}
          onNext={next}
          onBack={step > 1 ? back : undefined}
          onSkip={finish}
        />
      ) : (
        <>
          <div className="absolute inset-0 bg-tour-scrim animate-in fade-in-0" aria-hidden />
          <TourModal
            mobile={mobile}
            variant={step === 0 ? "welcome" : "done"}
            onPrimary={step === 0 ? next : () => {
              finish();
              void navigate({ to: "/admin" });
            }}
            onSkip={finish}
          />
        </>
      )}
    </div>,
    document.body,
  );
}

function TourModal({
  mobile,
  variant,
  onPrimary,
  onSkip,
}: {
  mobile: boolean;
  variant: "welcome" | "done";
  onPrimary: () => void;
  onSkip: () => void;
}) {
  const welcome = variant === "welcome";
  const primaryRef = useRef<HTMLButtonElement>(null);
  useEffect(() => primaryRef.current?.focus(), [variant]);
  return (
    <div className="absolute inset-0 flex items-center justify-center p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-modal-title"
        className={cn(
          "glass-3 flex flex-col items-center gap-4 rounded-[28px] text-center animate-in fade-in-0 zoom-in-95",
          mobile ? "w-full max-w-[342px] p-6" : "w-[480px] max-w-full p-8",
        )}
      >
        <span className="flex size-[72px] items-center justify-center rounded-[22px] border border-brand-border bg-brand-tint text-brand-text [&_svg]:size-8">
          {welcome ? <House aria-hidden /> : <Check aria-hidden />}
        </span>
        <h2 id="tour-modal-title" className={cn("text-ink", mobile ? "text-card-title" : "text-page-title")}>
          {welcome ? "Welcome to StayInn" : "You’re all set"}
        </h2>
        <p className="text-body text-ink-2">
          {welcome
            ? mobile
              ? "Take a quick 1-minute tour. We’ll show you where everything is."
              : "Take a quick 1-minute tour. We’ll show you where everything is, so you can start managing your hostel with ease."
            : "Start with Bookings or add your first room. You can replay this tour any time from your account menu."}
        </p>
        <div className={cn("flex w-full gap-2.5", mobile && welcome && "flex-col")}>
          <GlassButton ref={primaryRef} className="flex-1" onClick={onPrimary}>
            {welcome ? "Start tour" : "Go to dashboard"}
          </GlassButton>
          {welcome ? (
            <GlassButton variant="ghost" className="flex-1" onClick={onSkip}>
              Skip for now
            </GlassButton>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Spotlight({
  step,
  spot,
  mobile,
  onNext,
  onBack,
  onSkip,
}: {
  step: number;
  spot: SpotStep;
  mobile: boolean;
  onNext: () => void;
  onBack?: () => void;
  onSkip: () => void;
}) {
  const [ring, setRing] = useState<Rect | null>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  // Find the target (it may mount a moment later after navigating) and follow it.
  useEffect(() => {
    let raf = 0;
    let tries = 0;
    let el: HTMLElement | null = null;
    const measure = () => {
      if (!el || !el.isConnected) el = findTarget(spot.target);
      if (el) setRing(ringFor(el));
    };
    const boot = () => {
      el = findTarget(spot.target);
      if (el) {
        const r = el.getBoundingClientRect();
        if (r.top < 0 || r.bottom > window.innerHeight) el.scrollIntoView({ block: "center" });
        measure();
      } else if (tries++ < 120) {
        raf = requestAnimationFrame(boot);
      } else {
        setRing(null); // target missing: tooltip shows centred, no cut-out
      }
    };
    boot();
    const onChange = () => measure();
    window.addEventListener("resize", onChange);
    window.addEventListener("scroll", onChange, true);
    const ro = new ResizeObserver(onChange);
    ro.observe(document.body);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onChange);
      window.removeEventListener("scroll", onChange, true);
      ro.disconnect();
    };
  }, [spot.target]);

  useLayoutEffect(() => {
    const tip = tipRef.current;
    if (!tip) return;
    const size = { w: tip.offsetWidth, h: tip.offsetHeight };
    if (!ring) {
      setPos({ top: (window.innerHeight - size.h) / 2, left: (window.innerWidth - size.w) / 2 });
      return;
    }
    setPos(placeTooltip(ring, size, mobile));
  }, [ring, mobile]);

  useEffect(() => nextRef.current?.focus({ preventScroll: true }), [step]);

  return (
    <>
      <svg className="absolute inset-0 size-full" aria-hidden>
        <defs>
          <mask id="tour-cutout">
            <rect width="100%" height="100%" fill="white" />
            {ring ? (
              <rect
                x={ring.left}
                y={ring.top}
                width={ring.width}
                height={ring.height}
                rx={ring.radius}
                fill="black"
                className="transition-all duration-300 ease-out"
              />
            ) : null}
          </mask>
        </defs>
        <rect width="100%" height="100%" className="fill-tour-scrim" mask="url(#tour-cutout)" />
      </svg>
      {ring ? (
        <div
          aria-hidden
          className="pointer-events-none absolute border-2 border-brand transition-all duration-300 ease-out"
          style={{ top: ring.top, left: ring.left, width: ring.width, height: ring.height, borderRadius: ring.radius }}
        />
      ) : null}
      <div
        ref={tipRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-step-title"
        aria-describedby="tour-step-body"
        className={cn(
          "glass-3 absolute flex flex-col gap-3 rounded-[20px] p-5 transition-[top,left,opacity] duration-300 ease-out",
          mobile ? "w-[calc(100vw-32px)]" : "w-[340px]",
          pos ? "opacity-100" : "opacity-0",
        )}
        style={pos ?? { top: 0, left: 0 }}
      >
        <div className="flex items-center justify-between text-label whitespace-nowrap">
          <span className="text-ink-3">
            Step {step + 1} of {TOTAL}
          </span>
          <button
            type="button"
            onClick={onSkip}
            className="cursor-pointer font-medium text-ink-2 outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-brand-border"
          >
            Skip tour
          </button>
        </div>
        <div className="flex flex-col gap-1.5">
          <p id="tour-step-title" className="text-card-title text-ink">
            {spot.title}
          </p>
          <p id="tour-step-body" className="text-body text-ink-2">
            {spot.body}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5" aria-hidden>
            {Array.from({ length: TOTAL }).map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 rounded-[3px] transition-all duration-300",
                  i === step ? "w-[18px] bg-brand" : "w-1.5 bg-ink-3",
                )}
              />
            ))}
          </div>
          <div className="flex gap-2">
            {onBack ? (
              <GlassButton variant="glass" size="sm" onClick={onBack}>
                Back
              </GlassButton>
            ) : null}
            <GlassButton ref={nextRef} size="sm" onClick={onNext}>
              Next
            </GlassButton>
          </div>
        </div>
      </div>
    </>
  );
}
