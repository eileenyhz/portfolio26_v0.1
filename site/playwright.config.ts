/// <reference types="node" />
import { defineConfig } from "@playwright/test";

// End-to-end tests run against a production build of their own (astro.e2e.config.mjs: dist-e2e/, switches off), served
// by `astro preview` on port 4322 so a dev server on 4321 is never mistaken for it. Locally they use the installed
// Chrome; CI installs Chromium.
export default defineConfig({
  testDir: "e2e",
  use: { baseURL: "http://localhost:4322", ...(process.env.CI ? {} : { channel: "chrome" }) },
  webServer: {
    command:
      "SITE_DOWN=0 SITE_WIP=0 astro build --config astro.e2e.config.mjs && astro preview --config astro.e2e.config.mjs --port 4322 --ignore-lock",
    timeout: 120_000,
    url: "http://localhost:4322",
    reuseExistingServer: false,
  },
});
