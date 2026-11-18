import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { setGlassThemeMode, useGlassThemeMode, type GlassThemeMode } from "@/lib/glass-theme";

const OPTIONS: { mode: GlassThemeMode; label: string; Icon: typeof Sun }[] = [
  { mode: "light", label: "Light", Icon: Sun },
  { mode: "dark", label: "Dark", Icon: Moon },
  { mode: "system", label: "System", Icon: Monitor },
];

/**
 * Figma "Theme switcher" (shell components): inset track with Sun / Moon / Monitor,
 * the active one on a raised glass segment. `wide` stretches it (mobile More sheet).
 */
export function ThemeSwitcher({ className, wide }: { className?: string; wide?: boolean }) {
  const mode = useGlassThemeMode();
  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className={cn(
        "flex gap-1 rounded-[12px] border border-glass-divider bg-glass-inset p-1",
        wide && "w-full",
        className,
      )}
    >
      {OPTIONS.map(({ mode: m, label, Icon }) => {
        const on = m === mode;
        return (
          <button
            key={m}
            type="button"
            role="radio"
            aria-checked={on}
            aria-label={label}
            title={label}
            onClick={() => setGlassThemeMode(m)}
            className={cn(
              "flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-[9px] border text-label font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand-border [&_svg]:size-4",
              wide ? "flex-1" : "w-8",
              on ? "glass-2 text-ink" : "border-transparent text-ink-2 hover:text-ink",
            )}
          >
            <Icon aria-hidden />
            {wide ? label : null}
          </button>
        );
      })}
    </div>
  );
}
