import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// The SPA never receives server variables: no `envPrefix` exposure beyond
// Vite's default VITE_, and no VITE_ variables are used. Runtime settings
// (app name, client) come from GET /api/meta.
// API_URL (dev only, read here in Node) points the proxy at another port.
const apiTarget = process.env.API_URL ?? "http://localhost:3000";
// Vista previa en vivo del AI Developer (pnpm dev:preview, contrato §5.3): detrás del nginx
// del servidor, en https://preview-<slug>.<dominio>. Escucha en todas las interfaces del
// contenedor, acepta ese host y el HMR va por wss en el 443 de nginx.
const livePreview = process.env.LAUNCHPAD_PREVIEW === "1";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: "dist",
    sourcemap: false
  },
  server: {
    port: 5173,
    ...(livePreview ? { host: "0.0.0.0", allowedHosts: true, hmr: { clientPort: 443, protocol: "wss" } } : {}),
    // Same-origin in development: the API is proxied, so cookies and the
    // Origin check work as in production (Host is kept as localhost:5173).
    proxy: {
      "/api": { target: apiTarget, changeOrigin: false },
      "/health": { target: apiTarget, changeOrigin: false }
    }
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    css: false
  }
});
