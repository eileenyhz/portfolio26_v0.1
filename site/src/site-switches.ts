/// <reference types="node" />
// Switches for the whole site. Change a value here and rebuild (or push: the next deploy picks it up).
//
// Either switch can also be set for a single build from the environment, which wins over the value here:
//   SITE_DOWN=1 npm run build     the whole site down          SITE_WIP=1 npm run build     notes on Playground and About
// The GitHub Actions "Site" workflow offers the same two switches when it is started by hand.

/** "1" or "true" turns a switch on, "0" or "false" off; unset (or empty) leaves the value written below. */
function fromEnv(name: string): boolean | undefined {
  const v = typeof process === "undefined" ? undefined : process.env[name];
  if (v === undefined || v === "") return undefined;
  return v === "1" || v === "true";
}

export const SWITCHES = {
  /** The whole site is down: every page shows the cobalt "preparing" screen. (/preparing/ shows that screen anytime.) */
  down: fromEnv("SITE_DOWN") ?? false,
  /** Playground and About sit blurred under a sticky note, as on the first live site. */
  wip: fromEnv("SITE_WIP") ?? true,
};

/** The preparing screen's address. */
export const PREPARING = "/preparing/";

/** Where a page request goes: while the site is down, everything but the preparing screen itself is replaced by it. */
export function downRewrite(pathname: string, down: boolean): string | null {
  return down && !pathname.startsWith(PREPARING) ? PREPARING : null;
}
