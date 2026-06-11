import { useLayoutEffect } from "react";
import { usePropertySettingsQuery } from "@/queries/settings/usePropertySettingsQuery";
import { syncDashboardThemeFromSettings } from "@/lib/dashboard-theme-storage";

export function DashboardThemeProvider({ children }: { children: React.ReactNode }) {
  const { data } = usePropertySettingsQuery();

  useLayoutEffect(() => {
    if (!data) return;
    syncDashboardThemeFromSettings(
      data.dashboardPrimaryColor,
      data.dashboardAccentColor
    );
  }, [data?.dashboardPrimaryColor, data?.dashboardAccentColor]);

  return children;
}
