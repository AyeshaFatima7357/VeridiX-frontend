import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

/*
 * VERCEL DEPLOYMENT NOTE:
 * VITE_API_BASE_URL must be set in Vercel dashboard → Settings → Environment Variables.
 * Value must be the exact Render backend URL including https:// and NO trailing slash.
 * Example: https://veridix-backend.onrender.com
 *
 * Without this variable the frontend cannot reach the backend and all
 * detection requests will fail silently.
 */

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
}));
