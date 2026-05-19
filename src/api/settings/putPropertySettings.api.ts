import { apiFetch } from "@/api/apiFetch";
import type { PropertySettings } from "@/types/domain/property-settings.types";

type PutPropertySettingsResponse = {
  success: boolean;
  message?: string;
  settings: PropertySettings;
};

export async function putPropertySettingsApi(
  token: string,
  input: Partial<PropertySettings>,
) {
  const data = await apiFetch<PutPropertySettingsResponse>("/api/v1/settings", {
    method: "PUT",
    token,
    body: JSON.stringify(input),
  });
  if (!data.success || !data.settings) {
    throw new Error(data.message ?? "Could not save settings");
  }
  return data.settings;
}
