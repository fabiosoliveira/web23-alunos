// vite.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      include: ["src/{lib,server}/**/*.ts"],
      exclude: ["src/{lib,server}/**/__mocks__"],
      reporter: ["text", "lcov"],
    },
    clearMocks: true,
    include: ["__test__/**/*.{test,spec}.ts"],
    setupFiles: ["dotenv/config"],
  },
});
