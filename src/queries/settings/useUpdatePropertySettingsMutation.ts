import { useMutation, useQueryClient } from "@tanstack/react-query";
import { putPropertySettingsApi } from "@/api/settings/putPropertySettings.api";
import { useAuthStore } from "@/stores/auth/auth.store";
import { settingsKeys } from "@/queries/keys/settings.keys";
import type { PropertySettings } from "@/types/domain/property-settings.types";

export function useUpdatePropertySettingsMutation() {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Partial<PropertySettings>) => {
      if (!token) throw new Error("You must be signed in");
      return putPropertySettingsApi(token, input);
    },
    onSuccess: (settings) => {
      queryClient.setQueryData(settingsKeys.property(), settings);
      queryClient.setQueryData(settingsKeys.propertyPublic(), settings);
    },
  });
}
