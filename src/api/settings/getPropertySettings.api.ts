import { apiFetch } from "@/api/apiFetch";
import type { PropertySettings } from "@/types/domain/property-settings.types";

type GetPropertySettingsResponse = {
  success: boolean;
  settings: PropertySettings;
};

export async function getPropertySettingsApi(token: string) {
  const data = await apiFetch<GetPropertySettingsResponse>("/api/v1/settings", { token });
  if (!data.success || !data.settings) {
    throw new Error("Could not load property settings");
  }
  return data.settings;
}

export async function getPublicPropertySettingsApi() {
  const data = await apiFetch<{ success: boolean; settings: PropertySettings }>(
    "/api/v1/settings/public",
  );
  if (!data.success || !data.settings) {
    throw new Error("Could not load property settings");
  }
  return data.settings;
}
