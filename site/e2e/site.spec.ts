import { expect, test, type Page } from "@playwright/test";

/** Collects uncaught errors and console errors, so a test can assert there were none. */
function errorsOn(page: Page): string[] {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  return errors;
}

/** Each ticket's box, whether its role shows (uncovered by another ticket), and its own (unrotated) shape. */
const ticketsOn = (page: Page) =>
  page.locator(".deck .tk").evaluateAll((els) =>
    els.map((tk) => {
      const box = tk.getBoundingClientRect();
      const role = (tk.querySelector(".tk-role") as Element).getBoundingClientRect();
      // the role is not covered: a point at each end and in the middle of it lands on this ticket
      const y = role.top + role.height / 2;
      const shows = [0.15, 0.5, 0.85].every(
        (k) => document.elementFromPoint(role.left + role.width * k, y)?.closest(".tk") === tk,
      );
      const el = tk as HTMLElement;
      return {
        top: box.top,
        bottom: box.bottom,
        left: box.left,
        right: box.right,
        width: el.offsetWidth,
        aspect: el.offsetHeight / el.offsetWidth,
        shows,
      };
    }),
  );

/** Marks the intro as seen for this visit, as after the first page view. */
const skipIntro = (page: Page) => page.addInitScript(() => sessionStorage.setItem("ez-intro", "seen"));

test.describe("intro", () => {
  test("keeps the words hidden until the line has crossed", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    for (const word of [".in-top .in-word", ".in-bot .in-word"]) {
      const showing = await page.locator(word).evaluate((w) => {
        const half = (w.parentElement as HTMLElement).getBoundingClientRect();
        const r = w.getBoundingClientRect();
        return r.bottom > half.top && r.top < half.bottom;
      });
      expect(showing, word).toBe(false);
    }
  });

  test("plays once per visit and removes itself", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".intro")).toBeVisible();
    await expect(page.locator(".intro")).toHaveCount(0, { timeout: 10_000 });
    await page.reload();
    await expect(page.locator(".intro")).toBeHidden();
  });

  test("goes away even if its script fails to load", async ({ page }) => {
    await page.route(/Intro\.astro.*\.js$/, (route) => route.abort());
    await page.goto("/");
    await expect(page.locator(".intro")).toHaveCount(0, { timeout: 5_000 });
    // the intro's own script never ran: it would have marked the intro as seen
    expect(await page.evaluate(() => sessionStorage.getItem("ez-intro"))).toBeNull();
  });

  test("holds the plane until the window has drawn, so the page's start-up never stutters the flight", async ({
    page,
  }) => {
    await page.route(/SkyWindow.*\.js$/, async (route) => {
      await new Promise((r) => setTimeout(r, 1200)); // a slow machine: the window takes a while to start
      await route.continue();
    });
    await page.goto("/");
    await page.waitForTimeout(700);
    const x = await page.locator(".in-plane").evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m41);
    expect(x).toBeLessThan(-40); // still waiting off the left edge
    await expect(page.locator(".intro")).toHaveCount(0, { timeout: 10_000 });
  });

  test("flies anyway if the window never starts", async ({ page }) => {
    await page.route(/SkyWindow.*\.js$/, (route) => route.abort());
    await page.goto("/");
    await expect(page.locator(".intro")).toHaveCount(0, { timeout: 10_000 });
  });

  test("a click skips it", async ({ page }) => {
    await page.goto("/");
    await page.locator(".intro").click();
    await expect(page.locator(".intro")).toHaveCount(0);
  });

  test("never shows with reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.locator(".intro")).toBeHidden();
  });
});

test.describe("landing", () => {
  test.beforeEach(({ page }) => skipIntro(page));

  test("draws the window without errors", async ({ page }) => {
    const errors = errorsOn(page);
    await page.goto("/");
    await expect(page.locator(".w-slot canvas")).toBeVisible();
    await page.waitForTimeout(500);
    expect(errors).toEqual([]);
  });

  test("shows no words over the window for now", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".wb .w-word")).toHaveCount(0);
  });

  test("hovering a ticket shows its flight tag", async ({ page }) => {
    await page.goto("/");
    await page.locator('.tk[data-p="p1"]').hover();
    await expect(page.locator(".w-tag")).toHaveClass(/\bon\b/);
    await expect(page.locator(".w-tag .tagt")).toHaveText("EZ01 · MTF");
  });

  test("has its own tab and home-screen icons", async ({ page, request }) => {
    await page.goto("/");
    for (const sel of ['link[rel="icon"]', 'link[rel="apple-touch-icon"]']) {
      const href = await page.locator(sel).getAttribute("href");
      expect(href, sel).toBeTruthy();
      expect((await request.get(href as string)).status(), href as string).toBe(200);
    }
  });

  test("is titled with the name alone", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle("Eileen Zhang");
  });

  test("has one ticket per project", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".deck .tk")).toHaveCount(4);
  });
});

test.describe("case studies", () => {
  test.beforeEach(({ page }) => skipIntro(page));

  test("a ticket opens its case study at its own URL", async ({ page }) => {
    await page.goto("/");
    await page.locator('.tk[data-p="p1"]').click();
    await expect(page).toHaveURL(/\/work\/motif\/$/);
    await expect(page.getByRole("dialog", { name: "Mōtif" })).toBeVisible();
    await expect(page).toHaveTitle("Mōtif · Eileen Zhang");
  });

  test("Next flight, All flights, back and forward", async ({ page }) => {
    await page.goto("/");
    await page.locator('.tk[data-p="p1"]').click();
    await page.getByRole("link", { name: /Next flight/ }).click();
    await expect(page).toHaveURL(/\/work\/shanhai\/$/);
    await expect(page.getByRole("dialog", { name: "Stories of ShanHai" })).toBeVisible();

    await page.getByRole("button", { name: "All flights" }).click();
    await expect(page).toHaveURL(/localhost:\d+\/$/);
    await expect(page.getByRole("dialog")).toHaveCount(0);

    await page.goBack();
    await expect(page).toHaveURL(/\/work\/shanhai\/$/);
    await expect(page.getByRole("dialog", { name: "Stories of ShanHai" })).toBeVisible();
    await page.goBack();
    await expect(page.getByRole("dialog", { name: "Mōtif" })).toBeVisible();
    await page.goForward();
    await expect(page.getByRole("dialog", { name: "Stories of ShanHai" })).toBeVisible();
  });

  test("the arrow keys step between flights and Escape closes", async ({ page }) => {
    await page.goto("/work/motif/");
    await page.keyboard.press("ArrowRight");
    await expect(page).toHaveURL(/\/work\/shanhai\/$/);
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("ArrowLeft");
    await expect(page).toHaveURL(/\/work\/dreamin\/$/);
    await page.keyboard.press("Escape");
    await expect(page).toHaveURL(/localhost:\d+\/$/);
  });

  test("has no previous-flight button", async ({ page }) => {
    await page.goto("/work/pixai/");
    await expect(page.locator(".mc-prev")).toHaveCount(0);
  });

  for (const [slug, name] of [
    ["motif", "Mōtif"],
    ["shanhai", "Stories of ShanHai"],
    ["pixai", "PixAI"],
    ["dreamin", "Dreamin"],
  ]) {
    test(`/work/${slug} opens straight away with its own link preview`, async ({ page }) => {
      const errors = errorsOn(page);
      await page.goto(`/work/${slug}/`);
      await expect(page.getByRole("dialog", { name })).toBeVisible();
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        "href",
        `https://www.eileen-z.com/work/${slug}/`,
      );
      await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", new RegExp(name));
      await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
        "content",
        `https://www.eileen-z.com/og/work-${slug}.jpg`,
      );
      expect(errors).toEqual([]);
    });
  }
});

test.describe("case study details", () => {
  test.beforeEach(({ page }) => skipIntro(page));

  test("every page has exactly one main heading", async ({ page }) => {
    for (const path of ["/", "/work/motif/", "/work/dreamin/", "/playground/", "/about/", "/preparing/"]) {
      await page.goto(path);
      await expect(page.locator("h1"), path).toHaveCount(1);
    }
  });

  test("a case study's own address carries its text in the page itself", async ({ request }) => {
    const html = await (await request.get("/work/motif/")).text();
    expect(html).toContain("Wardrobe Keeper:");
    expect(html).toContain('data-case="p1"');
  });

  test("a picture opens full size, and Escape closes it", async ({ page }) => {
    await page.goto("/work/pixai/");
    await page.locator(".mdl-card [data-step]").first().click();
    await page.locator(".mc-view figure.on img").first().click();
    await expect(page.locator(".zoom img")).toBeVisible();
    await expect(page.locator(".zoom p")).toHaveText("Before: one long form");
    await page.keyboard.press("Escape");
    await expect(page.locator(".zoom")).toHaveCount(0);
    await expect(page).toHaveURL(/\/work\/pixai\/$/); // the case study stays open
  });

  test("the tour changes only the picture, and stops when you start reading", async ({ page }) => {
    await page.goto("/work/motif/");
    await page.mouse.move(1200, 20); // away from the sheet's text
    await page.waitForTimeout(5600);
    await expect(page.locator(".mc-view > figure").nth(1)).toHaveClass(/\bon\b/);
    await expect(page.locator(".mc-steps li.tour")).toHaveCount(1);
    await expect(page.locator(".mc-steps li.on")).toHaveCount(0); // no text was opened
    await page.locator(".mc-text").hover();
    await page.waitForTimeout(8600);
    await expect(page.locator(".mc-view > figure").nth(1)).toHaveClass(/\bon\b/); // it stayed put
  });

  test("a ticket shows a focus outline for keyboard users", async ({ page }) => {
    await page.goto("/");
    await page.locator(".deck .tk").first().focus();
    await page.keyboard.press("Tab");
    await page.keyboard.press("Shift+Tab");
    await expect(page.locator(".dslot").first()).toHaveCSS("outline-style", "solid");
  });

  test("steps' pictures wait until they are shown", async ({ page }) => {
    await page.goto("/work/shanhai/");
    const lazy = await page.locator('.mc-view img[loading="lazy"]').count();
    const eager = await page.locator(".mc-view figure:first-child img:not([loading])").count();
    expect(lazy).toBeGreaterThan(10);
    expect(eager).toBeGreaterThan(0);
  });
});

test.describe("pages", () => {
  test.beforeEach(({ page }) => skipIntro(page));

  test("the header reads Selected work, Playground, About", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".hd nav a")).toHaveText(["Selected work", "Playground", "About"]);
    await page.getByRole("link", { name: "Playground" }).click();
    await expect(page).toHaveURL(/\/playground\/$/);
    await expect(page).toHaveTitle("Playground · Eileen Zhang");
    await expect(page.getByRole("link", { name: "Playground" })).toHaveAttribute("aria-current", "page");
    await page.getByRole("link", { name: "About", exact: true }).click();
    await expect(page).toHaveURL(/\/about\/$/);
    await expect(page).toHaveTitle("About · Eileen Zhang");
  });

  test("each nav link takes a click a little above or below its words", async ({ page }) => {
    await page.goto("/");
    const link = page.locator(".hd nav a", { hasText: "Playground" });
    const words = await link.evaluate((a) => {
      const range = document.createRange();
      range.selectNodeContents(a);
      const r = range.getBoundingClientRect();
      return { x: r.x + r.width / 2, top: r.top, bottom: r.bottom };
    });
    for (const y of [words.top - 8, words.bottom + 8]) {
      const hit = await page.evaluate(
        ([x, y]) => document.elementFromPoint(x, y)?.closest("a")?.textContent?.trim(),
        [words.x, y],
      );
      expect(hit).toBe("Playground");
    }
  });

  test("Playground: a card prints its receipt and a piece opens in the viewer", async ({ page }) => {
    const errors = errorsOn(page);
    await page.goto("/playground/");
    await expect(page.getByRole("group", { name: "Receipt for Type Study" })).toBeVisible();
    // the cards overlap like a stack: click the strip of the card that shows
    await page.locator('[data-wcard="e2"]').click({ position: { x: 24, y: 12 } });
    await expect(page.getByRole("group", { name: "Receipt for Shader Toy" })).toBeVisible();
    await expect(page.locator('[data-wcard="e2"]')).toHaveAttribute("aria-pressed", "true");

    await page.locator('[data-th="e2:0"]').click();
    await expect(page.locator("#lb")).toBeVisible();
    await page.keyboard.press("ArrowRight");
    await expect(page.locator("#lb .lb-top")).toContainText("02 / 04");
    await page.keyboard.press("Escape");
    await expect(page.locator("#lb")).toBeHidden();
    expect(errors).toEqual([]);
  });

  test("About shows the ID card", async ({ page }) => {
    await page.goto("/about/");
    await expect(page.locator("#idcard")).toBeVisible();
    await expect(page.locator("#idcard")).toContainText("Eileen Zhang");
  });
});

test.describe("preparing screen", () => {
  test("is cobalt, builds its board, and stays out of search results while the site is up", async ({ page }) => {
    const errors = errorsOn(page);
    await page.goto("/preparing/");
    await expect(page.locator(".pp")).toHaveCSS("background-color", "rgb(31, 60, 207)");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Preparing for departure");
    await expect(page.locator(".pp-line").first()).toBeVisible();
    await expect(page.locator(".pp-line").first()).toHaveText(/PREPARING|GATE OPENS/);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex");
    await page.waitForTimeout(1200);
    expect(errors).toEqual([]);
  });

  test("a missing page is the cobalt 404 board, with a way home", async ({ page }) => {
    const res = await page.goto("/no-such-flight/");
    expect(res?.status()).toBe(404);
    await expect(page.locator(".pp")).toHaveCSS("background-color", "rgb(31, 60, 207)");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Flight not found");
    await expect(page.locator(".pp-line").first()).toHaveText(/FLIGHT|GATE/);
    await page.getByRole("link", { name: "← All flights" }).click();
    await expect(page).toHaveURL(/localhost:\d+\/$/);
  });

  test("real pages are never hidden from search", async ({ page }) => {
    for (const path of ["/", "/work/motif/", "/playground/", "/about/"]) {
      await page.goto(path);
      await expect(page.locator('meta[name="robots"]'), path).toHaveCount(0);
    }
  });
});

test.describe("pointer and hover", () => {
  test.beforeEach(({ page }) => skipIntro(page));

  test("the site keeps the system pointer", async ({ page }) => {
    await page.goto("/");
    await page.mouse.move(300, 300);
    await page.mouse.move(420, 380, { steps: 10 });
    await expect(page.locator("html")).not.toHaveClass(/\bc-plane\b/);
    await expect(page.locator(".cur-plane, .cur-trail")).toHaveCount(0);
    await expect(page.locator(".deck .tk").first()).toHaveCSS("cursor", "pointer");
  });

  test("a ticket answers a hover quickly, and lets go quicker", async ({ page }) => {
    await page.goto("/");
    const slot = page.locator(".deck .dslot").first();
    // the longest transition running on the ticket (and its parts) just after the pointer arrives, then just after it leaves
    const longest = () =>
      slot.evaluate((el) =>
        Math.max(0, ...el.getAnimations({ subtree: true }).map((a) => Number(a.effect?.getTiming().duration ?? 0))),
      );
    await slot.locator(".tk").hover({ position: { x: 20, y: 10 } });
    const enter = await longest();
    expect(enter).toBeGreaterThan(0);
    expect(enter).toBeLessThanOrEqual(300);
    await page.mouse.move(700, 300);
    const leave = await longest();
    expect(leave).toBeGreaterThan(0);
    expect(leave).toBeLessThanOrEqual(200);
  });
});

// The breakpoint is 800 px, Eileen's pick: from there up a mouse gets the tucked deck; narrower, the scattered tickets.
test.describe("a mouse window at the breakpoint (800 px)", () => {
  test.use({ viewport: { width: 800, height: 858 } });
  test.beforeEach(({ page }) => skipIntro(page));

  test("keeps the tickets tucked along the bottom, rising on hover", async ({ page }) => {
    await page.goto("/");
    const tk = page.locator(".deck .tk").first();
    const tucked = await tk.boundingBox();
    if (!tucked) throw new Error("no ticket");
    expect(tucked.y + tucked.height).toBeGreaterThan(858); // most of it below the edge
    await tk.hover({ position: { x: 20, y: 10 } });
    await expect.poll(async () => (await tk.boundingBox())?.y ?? 0).toBeLessThan(tucked.y - 20);
  });

  test("resizing across it changes the layout smoothly", async ({ page }) => {
    await page.goto("/");
    const at800 = await ticketsOn(page);
    // the ticket glides to its new place: the browser starts a transition of its position. Listening for that event,
    // rather than catching the ticket mid-way, holds however slowly the machine draws (CI draws WebGL in software)
    const slot = page.locator(".deck .dslot").first();
    await slot.evaluate((el) => {
      el.dataset.glide = "";
      el.addEventListener("transitionrun", (e) => (el.dataset.glide += ` ${(e as TransitionEvent).propertyName}`));
    });
    await page.setViewportSize({ width: 799, height: 858 });
    await expect(slot).toHaveAttribute("data-glide", /\b(left|top)\b/);
    await page.waitForTimeout(900);
    // and it keeps its size: only the arrangement changes
    const end = (await ticketsOn(page))[0];
    expect(Math.abs(end.width - at800[0].width)).toBeLessThan(4);
  });
});

test.describe("a mouse window just under the breakpoint (799 px)", () => {
  test.use({ viewport: { width: 799, height: 858 } });
  test.beforeEach(({ page }) => skipIntro(page));

  test("scatters the tickets along the bottom, each showing down to its role", async ({ page }) => {
    await page.goto("/");
    const window = await page.locator(".wb").boundingBox();
    if (!window) throw new Error("no window");
    for (const t of await ticketsOn(page)) {
      expect(t.aspect).toBeCloseTo(1.7, 1);
      expect(t.top).toBeGreaterThan(window.y + window.height);
      expect(t.shows).toBe(true);
    }
  });
});

test.describe("phones", () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  test.beforeEach(({ page }) => skipIntro(page));

  test("show everything on one screen: the window, then the four tickets scattered below it", async ({ page }) => {
    await page.goto("/");
    expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBeLessThanOrEqual(844);
    const window = await page.locator(".wb").boundingBox();
    if (!window) throw new Error("no window");
    expect(window.height).toBeGreaterThan(844 * 0.35);
    const tickets = await ticketsOn(page);
    expect(tickets).toHaveLength(4);
    for (const t of tickets) {
      expect(t.aspect).toBeCloseTo(1.7, 1); // the vertical stub, never reshaped
      expect(t.top).toBeGreaterThan(window.y + window.height);
      expect(t.left).toBeGreaterThanOrEqual(0);
      expect(t.right).toBeLessThanOrEqual(390);
      expect(t.shows).toBe(true);
    }
  });

  test("tapping a ticket opens its case study, even one lying behind", async ({ page }) => {
    await page.goto("/");
    await page
      .locator(".deck .tk")
      .nth(3)
      .tap({ position: { x: 40, y: 24 } }); // Dreamin, behind ShanHai: its visible top
    await expect(page).toHaveURL(/\/work\/dreamin\/$/);
  });

  test("fold the links into a menu", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Main" });
    await expect(nav).toBeHidden();
    await expect(page.getByRole("button", { name: "Menu" })).toHaveAttribute("aria-expanded", "false");
    await page.getByRole("button", { name: "Menu" }).tap();
    await expect(nav.getByRole("link")).toHaveText(["Selected work", "Playground", "About"]);
    await expect(page.getByRole("button", { name: "Menu" })).toHaveAttribute("aria-expanded", "true");
    await nav.getByRole("link", { name: "Playground" }).tap();
    await expect(page).toHaveURL(/\/playground\/$/);
    // the pages fold theirs the same way; Escape folds it again
    await expect(nav).toBeHidden();
    await page.getByRole("button", { name: "Menu" }).tap();
    await expect(nav.getByRole("link", { name: "About", exact: true })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(nav).toBeHidden();
    await expect(page.getByRole("button", { name: "Menu" })).toBeFocused();
  });

  test("keep their own pointer", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).not.toHaveClass(/\bc-plane\b/);
    await expect(page.locator(".cur-plane")).toHaveCount(0);
  });

  test("a case study is laid straight out: cover, then every step open", async ({ page }) => {
    await page.goto("/work/motif/");
    await expect(page.locator(".mc-cover img").first()).toBeVisible();
    const details = page.locator(".mdl-card .mc-detail");
    await expect(details).toHaveCount(4);
    for (let i = 0; i < 4; i++) await expect(details.nth(i)).toBeVisible();
    await expect(page.locator(".mdl-card [data-step]").first()).toHaveAttribute("aria-expanded", "true");
  });
});
