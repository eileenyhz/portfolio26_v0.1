// The browser tests build and serve their own copy of the site in dist-e2e/, always with the switches off (the site up,
// no notes), whatever src/site-switches.ts says for the real build. See playwright.config.ts.
import base from "./astro.config.mjs";

export default { ...base, outDir: "./dist-e2e" };
