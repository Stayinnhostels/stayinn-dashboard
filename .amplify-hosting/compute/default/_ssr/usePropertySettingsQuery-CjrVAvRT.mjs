import { b as useQuery } from "../_libs/tanstack__react-query.mjs";
import { a as apiFetch } from "./apiFetch-Cc9rh5iq.mjs";
import { u as useAuthStore } from "./router-CXpZMrmV.mjs";
async function getPropertySettingsApi(token) {
  const data = await apiFetch("/api/v1/settings", { token });
  if (!data.success || !data.settings) {
    throw new Error("Could not load property settings");
  }
  return data.settings;
}
async function getPublicPropertySettingsApi() {
  const data = await apiFetch(
    "/api/v1/settings/public"
  );
  if (!data.success || !data.settings) {
    throw new Error("Could not load property settings");
  }
  return data.settings;
}
const settingsKeys = {
  all: ["settings"],
  property: () => [...settingsKeys.all, "property"],
  propertyPublic: () => [...settingsKeys.all, "property", "public"]
};
function usePropertySettingsQuery() {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: settingsKeys.property(),
    queryFn: () => {
      if (!token) throw new Error("You must be signed in");
      return getPropertySettingsApi(token);
    },
    enabled: Boolean(token),
    staleTime: 6e4
  });
}
function usePublicPropertySettingsQuery() {
  return useQuery({
    queryKey: settingsKeys.propertyPublic(),
    queryFn: getPublicPropertySettingsApi,
    staleTime: 6e4
  });
}
export {
  usePublicPropertySettingsQuery as a,
  settingsKeys as s,
  usePropertySettingsQuery as u
};
