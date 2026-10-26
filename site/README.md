# eileen-z.com

Eileen Zhang's portfolio, built with [Astro](https://astro.build): a landing with a live airplane window (React Three
Fiber) and one boarding-pass ticket per project, a case study per project at `/work/{slug}/`, and the Playground and
About pages. Published to GitHub Pages by `.github/workflows/site.yml`.

Node 22. From this folder:

```sh
npm ci              # install
npm run dev         # http://localhost:4321
npm run check       # types
npm test            # unit tests (Vitest)
npm run test:e2e    # browser tests (Playwright), against their own build with the switches off
npm run build       # the site, into dist/
npm run format      # Prettier
npm run images      # media/ originals -> public/img/*.webp
npm run og          # link-preview images, from the built site -> public/og/
npm run icons       # favicon and home-screen icon
```

- Content: `src/data/` (projects, case studies, Playground cards, window views).
- Switches: `src/site-switches.ts` (`down`: every page shows the preparing screen; `wip`: the sticky note over
  Playground and About), or `SITE_DOWN=1` / `SITE_WIP=0` for one build.
- Publishing: push to `main`, then Actions → Site → Run workflow with "Deploy" ticked. Every check runs first.
- Decisions and history: `../HANDOFF.md`. The site before this rebuild is the `v1-live` tag.
