// Link-preview images (1200 × 630): the landing for the home page, and each case-study sheet for its own page. They are
// screenshots of the built site, so they always look like it. Run `npm run og` after changing a page's look or content,
// then rebuild; the images live in public/og/.
import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import { chromium } from "@playwright/test";
import { PROJECTS } from "../src/data/projects.ts";

const PORT = 4330;
const BASE = `http://localhost:${PORT}`;
const OUT = new URL("../public/og/", import.meta.url);
mkdirSync(OUT, { recursive: true });

const server = spawn("npx", ["astro", "preview", "--port", String(PORT), "--ignore-lock"], { stdio: "ignore" });
try {
  for (let i = 0; i < 50; i++) {
    if (
      await fetch(BASE)
        .then((r) => r.ok)
        .catch(() => false)
    )
      break;
    await new Promise((r) => setTimeout(r, 200));
  }
  const browser = await chromium.launch(process.env.CI ? {} : { channel: "chrome" });
  const context = (touch) =>
    browser.newContext({
      viewport: { width: 1200, height: 630 },
      deviceScaleFactor: 1,
      isMobile: touch,
      hasTouch: touch,
    });
  // the home preview uses the touch layout, where the four tickets sit open in their colours under the window
  const home = await context(true);
  const cases = await context(false);
  for (const c of [home, cases]) await c.addInitScript(() => sessionStorage.setItem("ez-intro", "seen"));
  let page = await home.newPage();
  const shoot = async (path, name) => {
    await page.goto(BASE + path, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready.then(() => undefined));
    await page.waitForTimeout(1500); // the window's colours and the sheet's entrance settle
    await page.screenshot({ path: new URL(`${name}.jpg`, OUT).pathname, type: "jpeg", quality: 86 });
    console.log(`og/${name}.jpg`);
  };
  await shoot("/", "home");
  page = await cases.newPage();
  for (const p of PROJECTS) await shoot(`/work/${p.slug}/`, `work-${p.slug}`);
  await browser.close();
} finally {
  server.kill();
}
