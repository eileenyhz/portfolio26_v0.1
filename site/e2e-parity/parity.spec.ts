import { expect, test, type Page } from "@playwright/test";

// Every state is driven the same way on both targets, as a visitor would: start at the landing, then click.
const S1 = process.env.PARITY_TARGET === "s1";
const HOME = S1 ? "/portfolio-s1.html" : "/";
// the old page's nav said Wallet and ID; the site's says Playground and About
const NAV = S1 ? { side: "Wallet", about: "ID" } : { side: "Playground", about: "About" };
const SLUGS = ["motif", "shanhai", "pixai", "dreamin"];
const START = new Date("2026-10-14T09:00:00");
/** Clock step: short enough that GSAP never treats a step as lag. */
const STEP = 50;
/** The intro is over by 3.7 s; every state after load waits this long, so the window's clouds are at the same time. */
const SETTLE = 4500;

/** Moves the frozen clock on by `ms`, one step at a time, firing timers and animation frames as it goes. */
async function advance(page: Page, ms: number): Promise<void> {
  for (let t = 0; t < ms; t += STEP) await page.clock.fastForward(STEP);
}

/** Opens a page with the clock frozen at the same instant on both targets, once its fonts and scripts are in. */
async function open(page: Page, url: string): Promise<void> {
  await page.clock.install({ time: START });
  await page.clock.pauseAt(new Date(START.getTime() + 1000));
  await page.goto(url, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
}

/** The landing after the intro, then a page from the header (the reference opens it over the landing; the site loads it). */
async function openFromNav(page: Page, label: string): Promise<void> {
  await open(page, HOME);
  await advance(page, SETTLE);
  await page.locator(".hd nav").getByText(label, { exact: true }).click();
  await page.waitForLoadState("networkidle");
  await advance(page, SETTLE);
}

const shot = (page: Page, name: string) => expect.soft(page).toHaveScreenshot(`${name}.png`);

test("intro, frame by frame", async ({ page }) => {
  await open(page, HOME);
  let at = 0;
  for (const t of [0, 300, 600, 900, 1200, 1400, 1600, 1800, 2100, 2400, 2700, 2900, 3100, 3300, 3500, 3800]) {
    await advance(page, t - at);
    at = t;
    await shot(page, `intro-${String(t).padStart(4, "0")}`);
  }
});

test("landing at rest", async ({ page }) => {
  await open(page, HOME);
  await advance(page, SETTLE);
  await shot(page, "landing");
});

test("hovering each ticket", async ({ page, isMobile }) => {
  test.skip(isMobile, "no hover on phones");
  await open(page, HOME);
  await advance(page, SETTLE);
  for (const [i, slug] of SLUGS.entries()) {
    await page.locator(`.deck .tk >> nth=${i}`).hover();
    await advance(page, 1500);
    await shot(page, `hover-${slug}`);
  }
  await page.mouse.move(700, 120);
  await advance(page, 1500);
  await shot(page, "hover-none");
});

test("case studies: open, a step, next flight, all flights", async ({ page }) => {
  await open(page, HOME);
  await advance(page, SETTLE);
  await page.locator(".deck .tk >> nth=0").click();
  await advance(page, 1500);
  await shot(page, "case-motif");
  await page.locator(".mdl-card [data-step] >> nth=0").click();
  await advance(page, 1000);
  await shot(page, "case-motif-step1");
  for (const slug of SLUGS.slice(1)) {
    await page.locator(".mc-next").click();
    await advance(page, 1500);
    await shot(page, `case-${slug}`);
  }
  await page.locator(".mc-home").click();
  await advance(page, 1500);
  await shot(page, "case-closed");
});

test("wallet: cards, receipt, viewer", async ({ page }) => {
  await openFromNav(page, NAV.side);
  await shot(page, "wallet");
  await page.locator('[data-wcard="e3"]').click({ position: { x: 24, y: 12 } });
  await advance(page, 1500);
  await shot(page, "wallet-card3");
  await page.locator('[data-th="e3:0"]').click();
  await advance(page, 600);
  await shot(page, "wallet-viewer");
  await page.keyboard.press("ArrowRight");
  await advance(page, 600);
  await shot(page, "wallet-viewer-next");
});

test("ID", async ({ page }) => {
  await openFromNav(page, NAV.about);
  await shot(page, "id");
});

test("ID: the card tilts toward the pointer", async ({ page, isMobile }) => {
  test.skip(isMobile, "no hover on phones");
  await openFromNav(page, NAV.about);
  const box = await page.locator("#idcard").boundingBox();
  if (box) await page.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.3);
  await advance(page, 600);
  await shot(page, "id-tilt");
});
