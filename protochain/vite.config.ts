// vite.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      include: ["src/lib/**/*.ts"],
      reporter: ["text", "lcov"],
    },
    clearMocks: true,
    include: ["__test__/**/*.{test,spec}.ts"],
  },
});
