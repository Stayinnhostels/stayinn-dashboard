import { NotFoundScreen } from "@/components/system/system-screens";

type NotFoundViewProps = {
  /** When true, fills the admin main panel instead of the full viewport. */
  embedded?: boolean;
  dashboardTo?: string;
};

/** 404 — Figma 18.02. Kept as a thin wrapper so existing imports keep working. */
export function NotFoundView({ embedded = false, dashboardTo = "/admin" }: NotFoundViewProps) {
  return <NotFoundScreen embedded={embedded} dashboardTo={dashboardTo} />;
}
