// Link-preview images (1200 × 630): the cobalt WELCOME ABOARD screen of the intro with the four tickets along its bottom
// edge for the home page (made for LinkedIn: bold at feed size, and plainly a designer's work), and each case-study sheet for its own page. They are
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
  const cases = await context(false);
  await cases.addInitScript(() => sessionStorage.setItem("ez-intro", "seen"));
  const shoot = async (path, name) => {
    await page.goto(BASE + path, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready.then(() => undefined));
    await page.waitForTimeout(1500); // the window's colours and the sheet's entrance settle
    await page.screenshot({ path: new URL(`${name}.jpg`, OUT).pathname, type: "jpeg", quality: 86 });
    console.log(`og/${name}.jpg`);
  };
  // home: the intro on a frozen clock, stopped once the line has crossed and both words are in, before the screen opens
  let page = await (await context(false)).newPage();
  await page.clock.install({ time: 0 });
  await page.clock.pauseAt(1000);
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  for (let t = 0; t < 2500; t += 50) await page.clock.fastForward(50); // small steps, so GSAP never sees a lag
  // and the four tickets laid over it, resting white along the bottom edge as on a desktop, showing down to their roles:
  // at feed size the cobalt catches the eye and the tickets say it is a designer's work
  await page.addStyleTag({
    content: `.stage { z-index: 300; background: transparent; } .hd, .wb { visibility: hidden; }
      .dslot { --pk: calc(var(--th) * .25); transition: none; filter: drop-shadow(0 -6px 18px rgb(0 0 20 / .35)); }`,
  });
  await page.waitForTimeout(300);
  await page.screenshot({ path: new URL("home.jpg", OUT).pathname, type: "jpeg", quality: 86 });
  console.log("og/home.jpg");
  page = await cases.newPage();
  for (const p of PROJECTS) await shoot(`/work/${p.slug}/`, `work-${p.slug}`);
  await browser.close();
} finally {
  server.kill();
}
