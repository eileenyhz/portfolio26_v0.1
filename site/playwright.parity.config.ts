/// <reference types="node" />
import { defineConfig } from "@playwright/test";

// Compare with the old page: the same script runs against portfolio-s1.html (served from the repo root) and against this
// site's build. The first run records the old page's screenshots; the second reports every state that differs, with diff
// images in parity-report/. `npm run compare:s1` does both. It confirmed the rebuild matched the old page (2026-10-14);
// since then the site has moved on (phone layout, role rows, link previews), so differences are expected.
// Both runs use a frozen clock stepped by the test, so animations line up frame for frame.
const s1 = process.env.PARITY_TARGET === "s1";

export default defineConfig({
  testDir: "e2e-parity",
  outputDir: `test-results/parity-${s1 ? "s1" : "site"}`,
  snapshotPathTemplate: "parity-snapshots/{projectName}/{arg}{ext}",
  reporter: s1
    ? "line"
    : [
        ["line"],
        ["json", { outputFile: "test-results/parity.json" }],
        ["html", { outputFolder: "parity-report", open: "never" }],
      ],
  timeout: 180_000,
  use: {
    baseURL: s1 ? "http://localhost:4325" : "http://localhost:4322",
    channel: "chrome",
    deviceScaleFactor: 1,
  },
  // The allowances are the reference's own run-to-run noise, measured: none on desktop; on phones about 300 px where the
  // dot letters cross the window (text antialiasing over the WebGL layer). Real differences found so far were 1,300+ px.
  projects: [
    {
      name: "desktop",
      use: { viewport: { width: 1440, height: 900 } },
      expect: { toHaveScreenshot: { threshold: 0.2, maxDiffPixels: 10 } },
    },
    {
      name: "phone",
      use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
      expect: { toHaveScreenshot: { threshold: 0.2, maxDiffPixels: 400 } },
    },
  ],
  webServer: s1
    ? {
        command: "python3 -m http.server 4325 --directory ..",
        url: "http://localhost:4325/portfolio-s1.html",
        reuseExistingServer: false,
        stderr: "ignore",
      }
    : {
        command: "npm run preview -- --port 4322 --ignore-lock",
        url: "http://localhost:4322",
        reuseExistingServer: false,
      },
});
