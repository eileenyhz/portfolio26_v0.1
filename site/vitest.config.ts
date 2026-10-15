import { defineConfig } from "vitest/config";

// Unit tests for data and pure helpers; browser behaviour is covered by Playwright in e2e/.
export default defineConfig({
  test: { include: ["src/**/*.test.ts"], environment: "node" },
});
