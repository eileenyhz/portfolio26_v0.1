// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";

// Static build for GitHub Pages at the custom domain. Every page is a folder with an index.html, so URLs stay clean:
// /, /work/motif/, /wallet/, /id/. Links always carry the trailing slash, so Pages never has to redirect them.
export default defineConfig({
  site: "https://www.eileen-z.com",
  integrations: [react(), mdx()],
  build: { format: "directory" },
  trailingSlash: "always",
  // The window's script (three.js and React Three Fiber, about 240 kB gzipped) is one chunk by design: it loads after
  // the page has rendered (client:only), so the limit is raised to its size rather than splitting it.
  vite: { build: { chunkSizeWarningLimit: 1000 } },
});
