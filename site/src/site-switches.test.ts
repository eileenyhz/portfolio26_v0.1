import { afterEach, describe, expect, it } from "vitest";
import { onRequest } from "./middleware";
import { PREPARING, SWITCHES, downRewrite } from "./site-switches";

describe("taking the site down", () => {
  it("sends every page to the preparing screen while down", () => {
    for (const path of ["/", "/work/motif/", "/playground/", "/about/"])
      expect(downRewrite(path, true)).toBe(PREPARING);
  });

  it("leaves the preparing screen itself alone", () => {
    expect(downRewrite(PREPARING, true)).toBeNull();
  });

  it("changes nothing while the site is up", () => {
    for (const path of ["/", "/work/motif/", PREPARING]) expect(downRewrite(path, false)).toBeNull();
  });
});

describe("the middleware", () => {
  const was = SWITCHES.down;
  afterEach(() => {
    SWITCHES.down = was;
  });
  // a stand-in for Astro's context: rewrite and next report what the middleware chose
  const run = (path: string) =>
    onRequest(
      { url: new URL(path, "https://www.eileen-z.com"), rewrite: (to: string) => `rewrite ${to}` } as never,
      (() => "next") as never,
    );

  it("shows the preparing screen in place of a page when the site is down", () => {
    SWITCHES.down = true;
    expect(run("/work/pixai/")).toBe(`rewrite ${PREPARING}`);
  });

  it("serves the page itself when the site is up", () => {
    SWITCHES.down = false;
    expect(run("/work/pixai/")).toBe("next");
  });
});
