import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Filter bar that sticks to the top of the page while the rest scrolls (same as Bookings).
 * Once stuck it gets a frosted backdrop so rows don't show through. Desktop/tablet only —
 * on phones the bar scrolls away like the Figma mobile screens.
 */
export function StickyBar({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const el = ref.current;
    const scroller = el?.closest("main");
    if (!el || !scroller) return;
    let raf = 0;
    const check = () => {
      raf = 0;
      const top = scroller.getBoundingClientRect().top;
      setStuck(scroller.scrollTop > 0 && el.getBoundingClientRect().top <= top + 1);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    scroller.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    // Also fires when the bar reaches / leaves the top edge (catches jumps like "scroll to top").
    const io = new IntersectionObserver(onScroll, { root: scroller, rootMargin: "-1px 0px 0px 0px", threshold: [0, 1] });
    io.observe(el);
    check();
    return () => {
      scroller.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        // -my-2 cancels the py-2 so the page layout doesn't move; -top-6 = main's padding.
        "relative z-20 -mx-4 -my-2 px-4 py-2 transition-[background-color,box-shadow,backdrop-filter] duration-200 md:sticky md:-top-6 md:-mx-6 md:px-6",
        stuck && "border-b border-glass-divider bg-[color-mix(in_srgb,var(--gl-bg-base)_78%,transparent)] backdrop-blur-xl",
        className,
      )}
    >
      {children}
    </div>
  );
}
