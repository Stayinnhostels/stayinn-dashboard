import type { ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type Props = {
  label: ReactNode;
  children: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
  /** When false, children render without a tooltip. */
  enabled?: boolean;
};

/** Site-styled hover tip for icons, badges, and truncated text. */
export function HintTooltip({
  label,
  children,
  side = "top",
  className,
  enabled = true,
}: Props) {
  if (!enabled || label == null || label === "") return <>{children}</>;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={cn("inline-flex max-w-full", className)}>{children}</span>
      </TooltipTrigger>
      <TooltipContent side={side}>{label}</TooltipContent>
    </Tooltip>
  );
}
