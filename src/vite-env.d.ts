/// <reference types="vite/client" />
/// <reference path="./routeTree.gen.ts" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_QUERY_STALE_TIME_MS?: string;
  readonly VITE_QUERY_GC_TIME_MS?: string;
  readonly VITE_QUERY_RETRY?: string;
  readonly VITE_MUTATION_RETRY?: string;
  readonly VITE_MAINTENANCE_MODE?: string;
  readonly VITE_PUBLIC_FRONTEND_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
