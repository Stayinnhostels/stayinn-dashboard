import { appEnv } from "@/config/env";

/**
 * API base URL for the Stay Inn backend (no trailing slash).
 * Configure `VITE_API_BASE_URL` in `.env` (see `src/config/env.ts`).
 */
export function getApiBaseUrl(): string {
  return appEnv.apiBaseUrl;
}
