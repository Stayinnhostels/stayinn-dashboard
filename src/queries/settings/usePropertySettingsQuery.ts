import { useQuery } from "@tanstack/react-query";
import { getPropertySettingsApi, getPublicPropertySettingsApi } from "@/api/settings/getPropertySettings.api";
import { useAuthStore } from "@/stores/auth/auth.store";
import { settingsKeys } from "@/queries/keys/settings.keys";

export function usePropertySettingsQuery() {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: settingsKeys.property(),
    queryFn: () => {
      if (!token) throw new Error("You must be signed in");
      return getPropertySettingsApi(token);
    },
    enabled: Boolean(token),
    staleTime: 60_000,
  });
}

/** Public settings (no auth) — invoices, previews. */
export function usePublicPropertySettingsQuery() {
  return useQuery({
    queryKey: settingsKeys.propertyPublic(),
    queryFn: getPublicPropertySettingsApi,
    staleTime: 60_000,
  });
}
