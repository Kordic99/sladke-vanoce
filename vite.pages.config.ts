import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: process.env.PAGES_BASE_PATH || "./",
  plugins: [react()],
  build: { outDir: "dist-pages", rollupOptions: { input: "index.html" } },
  server: { host: "127.0.0.1", port: 5185, strictPort: true },
});
