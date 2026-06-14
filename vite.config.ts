import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

/** Fail Amplify builds when the API URL was not set in env vars. */
function requireViteApiBaseUrlOnCiBuild(): Plugin {
  return {
    name: "require-vite-api-base-url-on-ci",
    configResolved() {
      const isAmplify = Boolean(process.env.AWS_APP_ID);
      if (!isAmplify) return;
      const value = process.env.VITE_API_BASE_URL?.trim();
      if (!value) {
        throw new Error(
          "VITE_API_BASE_URL is missing on this build. Set it in Amplify → Environment variables, then redeploy.",
        );
      }
    },
  };
}

export default defineConfig({
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
    tsconfigPaths(),
    requireViteApiBaseUrlOnCiBuild(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
