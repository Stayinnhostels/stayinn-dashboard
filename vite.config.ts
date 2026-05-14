// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { nitro } from "nitro/vite";

// Vercel sets VERCEL=1 during CI builds. The default Lovable stack targets Cloudflare Workers,
// which Vercel cannot run — use Nitro for a Vercel-compatible server output instead.
// See: https://tanstack.com/start/latest/docs/framework/react/guide/hosting#vercel
const isVercel = process.env.VERCEL === "1";

/** Vite only inlines env vars that start with `VITE_` and exist at **build** time. */
function requireViteApiBaseUrlForVercelBuild() {
  return {
    name: "require-vite-api-base-url-on-vercel",
    configResolved() {
      if (!isVercel) return;
      const v = process.env.VITE_API_BASE_URL?.trim();
      if (!v) {
        throw new Error(
          "VITE_API_BASE_URL is missing on this Vercel build. Add it under Project → Settings → Environment Variables (Production), then redeploy. " +
            "Without it, the shipped JS falls back to http://localhost:3000 and will not call your AWS API."
        );
      }
    },
  };
}

// `server.entry: "server"` → resolves `./server` from `src/` → `src/server.ts` (must match wrangler.jsonc "main").
export default defineConfig({
  cloudflare: isVercel ? false : undefined,
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    plugins: [...(isVercel ? [nitro(), requireViteApiBaseUrlForVercelBuild()] : [])],
  },
});
