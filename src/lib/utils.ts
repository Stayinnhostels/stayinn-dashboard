import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge has to be told about the Glass design-system utilities
 * (src/styles/glass.css). Without this it treats e.g. `text-body` as a text
 * *colour* and silently drops it when a colour like `text-ink` follows.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        { text: ["page-title", "hero", "kpi", "card-title", "body", "label", "eyebrow"] },
      ],
      shadow: [{ shadow: ["glass-1", "glass-2", "glass-3", "brand-glow", "logo"] }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
