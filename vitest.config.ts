import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    // The MongoDB binary is downloaded once here, not by every test file at the same time.
    globalSetup: ["tests/global-setup.ts"],
    // mongodb-memory-server may download its binary on the first run.
    hookTimeout: 120_000,
    testTimeout: 30_000
  }
});
