import { QueryClient } from "@tanstack/react-query";
import { appEnv } from "@/config/env";

export function createAppQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: appEnv.queryStaleTimeMs,
        gcTime: appEnv.queryGcTimeMs,
        retry: appEnv.queryRetry,
      },
      mutations: {
        retry: appEnv.mutationRetry,
      },
    },
  });
}
