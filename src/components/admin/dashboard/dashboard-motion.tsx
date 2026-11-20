import { useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";
import { Moon, Sun, Sunrise, Sunset, type LucideIcon } from "lucide-react";
import "./dashboard-motion.css";

export function prefersReducedMotion() {
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

/**
 * True once the element has been on screen. `late` = it was off screen at first and the
 * user scrolled to it (then page-load stagger delays are dropped).
 */
export function useInView<T extends Element>(ref: RefObject<T | null>) {
  const [state, setState] = useState<{ inView: boolean; late: boolean }>({ inView: false, late: false });
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setState({ inView: true, late: false });
      return;
    }
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) {
      setState({ inView: true, late: false });
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setState({ inView: true, late: true });
          io.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
  return state;
}

const REVEAL_SELECTOR = ".page-enter > * > *, .dash-rise";
/** Items inside a section: table rows, grid cards, list items. They rise in as they scroll in. */
const ITEM_SELECTOR = [
  ".page-enter tbody > tr",
  ".page-enter .grid > *",
  ".page-enter ul > li",
  ".page-enter ol > li",
  ".page-enter [role=list] > *",
  ".page-enter [data-reveal-rows] > *",
].join(", ");

/**
 * Scroll-triggered entrance for everything inside the admin <main>:
 * - sections that start below the fold are frozen on their first frame (.reveal-pending) and
 *   play when scrolled into view, with their page-load stagger removed so they start straight away;
 * - rows, cards and list items below the fold stay hidden (.reveal-wait) and rise in one after
 *   another as they scroll into view (.reveal-in), on every admin page.
 */
export function useScrollReveal(rootRef: RefObject<HTMLElement | null>, resetKey: string) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof IntersectionObserver === "undefined" || prefersReducedMotion()) return;

    const play = (el: Element) => {
      // Shift every not-yet-started animation in this section so the first one starts now.
      const anims = (el as HTMLElement).getAnimations?.({ subtree: true }) ?? [];
      const delays = anims.map((a) => Number(a.effect?.getTiming().delay ?? 0));
      const min = delays.length ? Math.min(...delays) : 0;
      anims.forEach((a, i) => {
        try {
          a.effect?.updateTiming({ delay: Math.max(0, delays[i] - min) });
        } catch {
          /* ignore */
        }
      });
      el.classList.remove("reveal-pending");
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          io.unobserve(e.target);
          play(e.target);
        }
      },
      { threshold: 0, rootMargin: "0px 0px -10% 0px" },
    );

    // Items that arrive together (one scroll step) stagger top-to-bottom, left-to-right.
    const showItems = (els: HTMLElement[]) => {
      // Same line = same beat (split tables stay in sync); cards on a line still go left to right.
      const items = els.map((el) => ({ el, r: el.getBoundingClientRect() }));
      const tops = [...new Set(items.map(({ r }) => Math.round(r.top / 8)))].sort((a, b) => a - b);
      items.forEach(({ el, r }) => {
        const line = tops.indexOf(Math.round(r.top / 8));
        const col = el.closest("[data-reveal-rows]")
          ? 0
          : items.filter((o) => Math.round(o.r.top / 8) === Math.round(r.top / 8) && o.r.left < r.left).length;
        el.style.setProperty("--reveal-d", `${Math.min(line * 60 + col * 50, 600)}ms`);
        el.classList.remove("reveal-wait");
        el.classList.add("reveal-in");
        el.addEventListener(
          "animationend",
          (ev) => {
            if (ev.target !== el) return;
            el.classList.remove("reveal-in");
            el.style.removeProperty("--reveal-d");
          },
          { once: true },
        );
      });
    };
    const itemIo = new IntersectionObserver(
      (entries) => {
        const hits: HTMLElement[] = [];
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          itemIo.unobserve(e.target);
          hits.push(e.target as HTMLElement);
        }
        if (hits.length) showItems(hits);
      },
      { threshold: 0, rootMargin: "0px 0px -6% 0px" },
    );

    const seen = new WeakSet<Element>();
    const below = (el: Element) => {
      const r = el.getBoundingClientRect();
      if (r.height === 0 && r.width === 0) return false;
      return r.top >= window.innerHeight * 0.94;
    };
    const consider = (el: Element) => {
      if (seen.has(el)) return;
      seen.add(el);
      if (below(el)) {
        el.classList.add("reveal-pending");
        io.observe(el);
      }
    };
    const considerItem = (el: Element) => {
      if (seen.has(el) || el.closest("[data-no-reveal]")) return;
      seen.add(el);
      if (below(el)) {
        el.classList.add("reveal-wait");
        itemIo.observe(el);
      }
    };
    const scan = () => {
      root.querySelectorAll(REVEAL_SELECTOR).forEach(consider);
      root.querySelectorAll(ITEM_SELECTOR).forEach(considerItem);
    };
    scan();
    // New sections / rows (data loaded, tab switched, more rows) are checked before they paint.
    const mo = new MutationObserver(scan);
    mo.observe(root, { childList: true, subtree: true });
    return () => {
      mo.disconnect();
      io.disconnect();
      itemIo.disconnect();
      root
        .querySelectorAll(".reveal-pending, .reveal-wait, .reveal-in")
        .forEach((el) => el.classList.remove("reveal-pending", "reveal-wait", "reveal-in"));
    };
  }, [rootRef, resetKey]);
}

/** Style helper for the staggered entrance: `style={delay(240)}`. */
export const delay = (ms: number) => ({ "--dash-d": `${ms}ms` }) as CSSProperties;

const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

/** Counts from the previous value (0 at first) up to `target`. */
export function useCountUp(target: number, { duration = 1400, startDelay = 0 } = {}) {
  const [value, setValue] = useState(() => (prefersReducedMotion() ? target : 0));
  const from = useRef(value);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setValue(target);
      return;
    }
    const start = from.current;
    let raf = 0;
    let t0 = 0;
    const timer = window.setTimeout(() => {
      const step = (now: number) => {
        if (!t0) t0 = now;
        const p = easeOutExpo(Math.min(1, (now - t0) / duration));
        const v = start + (target - start) * p;
        from.current = v;
        setValue(v);
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, startDelay);
    return () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [target, duration, startDelay]);

  return value;
}

/**
 * Animated number. Numbers and simple strings like "41%" or "Rs 1,200" count up;
 * anything else (e.g. "—") is shown as is.
 */
export function CountUp({ value, delay: startDelay = 0 }: { value: ReactNode; delay?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const { inView, late } = useInView(ref);
  const parsed =
    typeof value === "number"
      ? { prefix: "", n: value, suffix: "" }
      : typeof value === "string"
        ? (() => {
            const m = /^(\D*?)(\d[\d,]*)(\D*)$/.exec(value);
            return m ? { prefix: m[1], n: Number(m[2].replace(/,/g, "")), suffix: m[3] } : null;
          })()
        : null;
  const v = useCountUp(inView ? (parsed?.n ?? 0) : 0, { startDelay: late ? 120 : startDelay });
  if (!parsed || !Number.isFinite(parsed.n)) return <>{value}</>;
  // Once it lands, show the original text exactly (keeps the app's own number formatting).
  if (inView && Math.round(v) === parsed.n) return <span ref={ref} className="tabular-nums">{value}</span>;
  return (
    <span ref={ref} className="tabular-nums">
      {parsed.prefix}
      {Math.round(v).toLocaleString("en-US")}
      {parsed.suffix}
    </span>
  );
}

/* ───────────────────────── Greeting ───────────────────────── */

function partOfDay(h: number): { text: string; icon: LucideIcon; tint: string } {
  if (h >= 5 && h < 12) return { text: "Good morning", icon: Sunrise, tint: "text-warning" };
  if (h >= 12 && h < 17) return { text: "Good afternoon", icon: Sun, tint: "text-warning" };
  if (h >= 17 && h < 21) return { text: "Good evening", icon: Sunset, tint: "text-brand-text" };
  return { text: "Good evening", icon: Moon, tint: "text-brand-text" };
}

/** "Good morning, Lina" — follows the clock (re-checked every minute). */
export function DashboardGreeting({ name }: { name: string }) {
  const [hour, setHour] = useState(() => new Date().getHours());
  useEffect(() => {
    const id = window.setInterval(() => setHour(new Date().getHours()), 60_000);
    return () => window.clearInterval(id);
  }, []);
  const { text, icon: Icon, tint } = partOfDay(hour);
  const first = name.trim().split(/\s+/)[0] || "there";
  const words = `${text}, ${first}`.split(" ");

  return (
    <span className="flex min-w-0 items-center gap-3">
      <span
        aria-hidden
        className={`dash-icon flex size-10 shrink-0 items-center justify-center rounded-[12px] bg-glass-inset ${tint}`}
      >
        <Icon className="size-[22px]" />
      </span>
      <span className="min-w-0 truncate" aria-label={`${text}, ${first}`}>
        {words.map((w, i) => (
          <span key={i} aria-hidden className="dash-word" style={delay(120 + i * 110)}>
            {w}
            {i < words.length - 1 ? " " : ""}
          </span>
        ))}
      </span>
    </span>
  );
}
