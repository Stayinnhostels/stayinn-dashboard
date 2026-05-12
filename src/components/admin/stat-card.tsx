import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  delta,
  icon: Icon,
  loading,
  trend,
  accent = "primary",
}: {
  label: string;
  value: string | number;
  delta?: string;
  icon: LucideIcon;
  loading?: boolean;
  trend?: "up" | "down" | "flat";
  accent?: "primary" | "success" | "warning" | "info";
}) {
  const accents: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    success: "bg-emerald-500/10 text-emerald-500",
    warning: "bg-amber-500/10 text-amber-500",
    info: "bg-sky-500/10 text-sky-500",
  };

  return (
    <Card className="border-border/60 bg-card/60 backdrop-blur transition-shadow hover:shadow-lg">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {label}
            </p>
            {loading ? (
              <Skeleton className="mt-2 h-8 w-24" />
            ) : (
              <p className="mt-2 text-3xl font-extrabold tracking-tight tabular-nums">{value}</p>
            )}
            {delta && (
              <p
                className={cn(
                  "mt-1 text-xs font-medium",
                  trend === "up" && "text-emerald-500",
                  trend === "down" && "text-rose-500",
                  !trend && "text-muted-foreground",
                )}
              >
                {delta}
              </p>
            )}
          </div>
          <div className={cn("rounded-xl p-2.5", accents[accent])}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
