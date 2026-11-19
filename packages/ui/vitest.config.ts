import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["tests/**", "src/**/index.ts"],
    },
  },
  resolve: {
    alias: {
      "theo-ui": path.resolve(import.meta.dirname, "./src"),
      "@theo/ui": path.resolve(import.meta.dirname, "./src"),
    },
  },
});
