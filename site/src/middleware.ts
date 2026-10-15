import type { MiddlewareHandler } from "astro";
import { SWITCHES, downRewrite } from "./site-switches";

// While the site is down (SWITCHES.down), every page is built as the preparing screen, at its own address.
export const onRequest: MiddlewareHandler = (ctx, next) => {
  const to = downRewrite(ctx.url.pathname, SWITCHES.down);
  return to ? ctx.rewrite(to) : next();
};
