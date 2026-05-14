function readIntEnv(key: string, fallback: number): number {
  const raw = import.meta.env[key as keyof ImportMetaEnv];
  if (raw === undefined || raw === "") return fallback;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : fallback;
}

/**
 * Central place for Vite `VITE_*` variables used by the dashboard client.
 */
export const appEnv = {
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL?.trim() || "http://localhost:3000").replace(/\/$/, ""),

  /** Default `staleTime` for `useQuery` (ms). */
  queryStaleTimeMs: readIntEnv("VITE_QUERY_STALE_TIME_MS", 60_000),

  /** Default `gcTime` for unused queries (ms). */
  queryGcTimeMs: readIntEnv("VITE_QUERY_GC_TIME_MS", 5 * 60_000),

  /** Default failed request retries for queries. */
  queryRetry: readIntEnv("VITE_QUERY_RETRY", 1),

  /** Default failed request retries for mutations (login should not retry). */
  mutationRetry: readIntEnv("VITE_MUTATION_RETRY", 0),
} as const;
