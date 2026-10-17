# Handoff: "Welcome Aboard" portfolio (Eileen Zhang)

Last updated: 2026-10-14. The design work is static HTML in this folder (no build step). The production site is being rebuilt as an Astro project in `site/` (see §10).

## 1. Original goal and requirements

Eileen is designing a personal portfolio. The work so far is exploration through clickable mock-ups, not a production site.

Content structure (fixed across all versions):
- A landing page that shows taste immediately.
- 3–4 main projects ("selected work").
- A handful of experimental / side projects (incl. multi-image work such as art commissions).
- An About section.

Theme: air travel / boarding. Projects are **boarding passes (tickets)**, side projects live in a **wallet** (bank cards + printed receipts), About is a **passport / ID**. An **airplane window** ("the panel") is the hero object; hovering a project changes the view outside it.

Eileen's stated preferences (accumulated feedback, most recent wins):
- Minimal but catchy; quick to scan; no long scroll, no preloader, few effects. Navigation must need no learning, minimal clicks.
- Liked references: samfcheng.com (clean UX), dennissnellenberg.com, p5aholic.me, lynnandtonic.com, hirotos.com (main page only, for vibe), mikes.cv (gate reader opening), lvn.studio (3D look), the "In-Flight / Landing Point" poster (type layout only, NOT colors, and not copied literally), ticket graphic references (Sound Journey vertical ticket, Mushen, Party Ticket, Red Room, Vertical Park), Dia receipt.
- Strongly prefers **version A's vertical boarding-pass design** (black & white at rest, color + graphic + preview in stub on hover), **tucked at the bottom edge until hovered**, with the **project name clearly visible while tucked**.
- Rejected: particle effects that read as noise, giant headline zones, poster-style extra captions/script text, heavy grotesk on WELCOME/ABOARD, Hiroto-style white "object cluster" page (called ugly), grid/Cappen headline version.

The **current direction** is Eileen's own three hand sketches (see §5), built in `portfolio-sketches.html`.

## 2. Architecture and important decisions

- Every deliverable is a single self-contained HTML file (inline CSS + JS). External scripts only from cdnjs / jsdelivr (allowed by the Claude Artifact CSP):
  - three.js r128: `https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js` (UMD; also uses `examples/js/geometries/RoundedBoxGeometry.js` and `examples/js/environments/RoomEnvironment.js` from jsdelivr in older files).
  - GSAP 3.13 + SplitText from cdnjs (`gsap/3.13.0/gsap.min.js`, `SplitText.min.js`).
  - Google Fonts only for fonts.
- Comparison pages use a "shell": tabs + a fake browser frame + three note cards under it. Tabs switch `.stage` sections; keys 1–4 switch tabs; `#hash` deep-links a tab.
- `portfolio-sketches.html` specifics:
  - Each `.stage` is a CSS size container (`container-type: size`); all layout uses `cqw` / `cqh` units measured as percentages from Eileen's sketches, so proportions hold at any size.
  - **One** three.js renderer (`W3`) draws the airplane window; its canvas is re-parented into the active tab's `.w-slot` on tab switch (`show(k)` → `W3.mount`).
  - Window geometry: layered `ShapeGeometry` bezels with holes + an `ExtrudeGeometry` inner bezel whose side walls are near-black (this produces the dark inner edge from Eileen's reference), glass = two planes cross-fading `CanvasTexture`s painted per destination (`paintGlass`, `SCN`, `cumulus`, `wing`). Group rotated `y ≈ 0.24` rad with light pointer parallax.
  - WELCOME / ABOARD: Jost 300 caps. A clipped duplicate (`.w-mask` > `.w-mask-in`) recolors the letters where they cross the glass (`--ov1` white over sky, `--ov2` per destination over the lower view; table `OV`).
  - Hover a ticket → `focus(id)` per stage: toggles `.on` on tickets, `W3.setScene`, `rollWord` (GSAP per-letter roll) on both word copies, "proj. 0X" tag (scramble text), tray color (`--tray`) and overlap colors.
  - Tickets: version A `.vt` component (CSS copied verbatim into each file). Sketch 2·tickets uses three **new** tickets (`tk2HTML`: grey slab / blue card / white line ticket) drawn to the sketch, by explicit request.
  - Wallet / passport objects (`.wal`, `.ppt`) are restored **exactly** from the first sketches version (fixed px sizes) by explicit request.
- Data is placeholder: arrays `P` (projects: id, n, title, kind, year, role, desc, colors c1/c2/t1/ton/t2/son, gfx type, scene, place, code, gate, tray) and `E` (experiments, in files that have the wallet page).

## 3. Files created or modified

| File | What it is | Published artifact |
|---|---|---|
| `portfolio-s1.html` | **Current work (chosen direction: sketch 1).** Full-screen page. Tickets follow Eileen's ticket wireframe (type/date row, name, mark on a stem, role tab, description, preview, hatched stub). Tickets are 16cqw wide with round corners. Wallet page (simplified on request, "UX first, then design"): the original vertical card stack (only PROJ. TYPE strips show; the chosen card opens up in place), the receipt under a binder clip next to it on the left, and on the right a plain grey "file" with the text zone and every photo (click → viewer). An earlier folder version (pocket, spine, scattered pieces) was rejected as too fancy. Cards follow Eileen's card wireframe, five designs. `#wallet` / `#id` deep-link. Style brief from Eileen: a sleek, minimal take on Persona 3 / Hypergryph UI. | https://claude.ai/artifact/7MfqtV6aGy1nFdhqdJ8pzZ |
| `portfolio-lab.html` | Experiment (2026-10-13): live sketch-1 mock-up with 10 type treatments for WELCOME ABOARD (keys 1–0; round 2 kept Jost, Big Shoulders, Stencil, Doto and added Tektur, Grenze Gotisch, Monoton, Zen Tokyo Zoo, Libre Barcode 128 Text, Tourney; WELCOME shifted left to -.62ws) × ticket designs, all white until hover, each a different paper shape so they differ while tucked (N = now, A perforated, B dog-ear = top-right corner folded down, unfolds on hover (clip-path + rotate3d flap; the domed "window" B was rejected), C admit one = concave die-cut corners + ADMIT ONE down both edges, D stamp = perforated all round + punched-hole tear row, E bag tag = rounded top, oval strap slot (mask) + string loop (`STRAP` svg in the wrapper, outside the masked pass) + vertical airport code (the clipped-corner + eyelet version read as an archive folder), F boarding stub = the kept portion of a boarding pass, torn perforation on the LEFT edge; keys N, A–F). Round 2's reference-based B–F were rejected as too similar. Ticket names follow the type. Each type is sized so WELCOME matches the Jost Light width and each ticket name fills the same width; these values (`--wfs`, `--nfs` per `.ty-N`) were measured once and are hard-coded in CSS. Do NOT measure at load: the artifact viewer can load the page hidden, measurements return 0, the size became NaN and WELCOME ABOARD rendered at 0px. The three.js window uses a ResizeObserver for the same reason (both files). Below: fixes at full size and 10 small mock-ups (window shown as a still from `W3.snapshot()`). Deep link `#t3-C`. **Eileen's pick (2026-10-13): type 7 (Doto dot matrix) + ticket F (boarding stub: torn perforated left edge, interior now laid out like A–D so the black role tab reads at rest; stub carries EZA → code and a stacked barcode).** The lab opens on 7-F. For type 7 the hover transition is a pixel dissolve (`pixelWord` + `dotGrid`: canvas-drawn random-cell mask whose cells are exactly Doto's dot grid — 0.1em pitch, each glyph 6 dots wide, grid anchored on the first letter's left edge and on the baseline — so whole dots switch on and off; type 7 has letter-spacing 0 so every letter stays on the grid; mask shared by the word and its glass copy, setTimeout-timed) instead of the GSAP roll. Carried into `portfolio-s1.html` on 2026-10-13: Doto words (700, `calc(var(--wh) * .29)`, letter-spacing 0, `.w1` at -.62ws), Doto 900 ticket names, the pixel dissolve (`pixelWord`/`dotGrid`, ~0.25s) replacing the GSAP roll, and the F boarding-stub ticket as the only pass design (white, drop shadow, torn left edge, right notch at the stub, stub with EZA → code + stacked barcode). Page headings (WALLET, ID, case titles) are still Jost.

**Fixes (2026-10-14):**
- HTTPS is on. The certificate had never been requested; removing and re-adding the custom domain through the Pages API (`cname` null, then `www.eileen-z.com`) started it, it was approved within two minutes, and `https_enforced` is now true. http:// and the bare domain 301 to https://www.eileen-z.com. GitHub made two CNAME commits on `s1-site` doing this; the local branch is fast-forwarded to them.
- Landing intro: WELCOME ABOARD and EZ AIR start fully out of sight and enter only after the line has crossed (1.45 s); the screen opens at 2.7 s. Each word starts just past the line *and* past its half's padding: CSS `translateY(calc(112% + gap))` / `translateY(calc(-110% - gap))`, matched by GSAP `fromTo` with `yPercent` plus `y` = the half's padding read at run time. (A plain percentage broke once EZ AIR moved down: -300% of a 13px word is less than the 54–96px gap, so the wordmark showed before the line.) WELCOME ABOARD is bigger (clamp 34–172px, 10vw). EZ AIR is face D, Michroma 400 (clamp 12–26px, 1.6vw, tracked .3em), a little below the line (`.in-bot` padding-top clamp 18–40px, 3.6vh; 40–96px was "way too far", the original 12–24px "too close"). The other faces are in `ezair-type-lab.html` (https://claude.ai/artifact/8JLzqig7EvztVnZxpMCZoq, 18 options A–R).
- Pop-up footer: the ← (previous flight) button is gone; "← All flights" and "Next flight →" remain. The keyboard's left/right arrows still step between projects.

**Window, merged into the main page (2026-10-14, local and in the artifact, not committed or pushed):**
- `portfolio-s1.html`'s window (`W3`, same interface: mount / setScene / pause) is now the lab's Current design without overlays: the reference drawing's window set into the page (a shallow recess shaded along its top, the blue-grey frame and inner wall sunk a little down-right, longer glass 598 × 915 ref px, a dark seal on the right, a solid blind with a pill handle), in the whiter colours. Outside is the raymarched cloud sea in the bottom third, drifting left to right; hovering a ticket eases it into that project's colours (the live site's painted-scene palettes). Only the glass shifts a little with the pointer. Grain finish.
- Removed with it: the painted Monument Valley views, the wing, the toon-cloud sky. Backup of the page before the merge: scratchpad `s1-before-newwindow.html`.
- `.w-mask` follows the new glass (a clip-path that also stops at the blind's edge). Lower-word colours changed so they read on the clouds: Motif #465bcf, PixAI #6e58d8.
- Overlays (doodles, loong, floating figure, pixel characters) stay in the labs until the real loong and PixAI assets are ready.

**Window and landing (2026-10-14, earlier, superseded where it describes the window):**
- **Welcome view:** a live three.js sky (`makeSky()`, rendered by W3 to a render target only while it's on the glass). A cloud sea of toon-shaded billows in three rows: far ones small and pale blue, near ones big and white, and within each row the sizes are skewed (mostly small, a few tall) so the top edge rises and falls. Each billow is a big ball with a smaller one tucked in front. No small floating clouds above it.
- **Project views,** painted on canvas, minimal after Monument Valley: flat pastel planes, simple geometric forms lit from the left (a light face and a shadow face), lots of empty sky, one accent each. Helpers: `face`, `isoBox` (isometric box), `onFace` (a point on a box face), `isoDoor` (arched opening on either face), `column` (tapered hexagonal prism), `peak` (two-tone faceted peak).
  - `motif`: one cobalt "wardrobe" tower on a pale plinth in still water, its arched door open on a lit closet with a white dress on a hanger; a gold cornice and flag, a stepping stone, a peach-gold sky;
  - `shanhai`: mountains and seas: one big asymmetric faceted mountain (gentle shoulder with pines, steep shaded cliff), a floating islet with a pine, a small rock at sea, a band of mist, a seal-red sun. Sizes deliberately very different (Eileen found same-sized peaks uncomfortable);
  - `pixai`: a floating island with a small domed tower under a big moon, violet-to-pink sky, diamond sparkles;
  - `dreamin`: faceted snowy hills, geometric pines and one amber lantern under a navy night.
- **Wing:** on its own layer above every view, tinted per view (`VIEW[id].tint`). Back to the original flat shapes and colours (winglet, wing top, three flaps, panel lines). The reflective-finish and gap-fill versions were tried and dropped; backups in the scratchpad (`s1-views-v2-gapwing.html`).
- **Replay:** clicking "Eileen Zhang" (top left, on the landing and on Wallet/ID) clears the hash and reloads, so the landing intro plays again. Temporary, at Eileen's request.
- **Hover words:** the top word holds WELCOME's left edge; the bottom word holds ABOARD's right edge (`.w2` anchored with `right`).
- **Landing intro (GSAP):** a blue screen; a plane draws a line across it; WELCOME ABOARD (Doto) rises above the line and EZ AIR (Archivo, wide) drops below; then the screen splits open along the line. Click or any key skips it; reduced motion skips it entirely.
- **Wallet / ID:** the work-in-progress note is removed locally. The live site still shows it until the next push.

**Window experiments (2026-10-14, nothing here touches `portfolio-s1.html`):**
- `window-overlay-lab.html` (https://claude.ai/artifact/Ktt2BGbVSvTieki78XFVgw): the new window on its own. The frame is rebuilt in three.js from Eileen's reference drawing (back plate, frame, inner wall, glass, dark seal, blind with handle), thinner and shaded. Outside is a raymarched cloud sea in the bottom third with no sun or moon. Each panel changes the palette and adds an overlay:
  - Motif: crayon doodles and stickers on the glass;
  - ShanHai: a black-and-white loong that glitches into colour (placeholder; Eileen is making a Tripo model);
  - PixAI: a figure floating and drawing (placeholder; Eileen is making the artwork);
  - Dreamin: pixel characters hopping on the cloud tops.
  Grain or Dither finish.
- `portfolio-xlab.html` (https://claude.ai/artifact/32QquvmFBhC6W4EivX2UVm): a copy of the landing page with that window built in as `W4` beside the original `W3`. A lab panel (top right) switches Frame (Current / A / B / C / F / H / Original / Live site), Overlays (On / Off), Words over the frame (Show / Hide) and Finish (Grain / Dither). A hybrid (original shape with flat 2D reference details) was tried and dropped: Eileen likes the original because its depth is real (a 3D object turned toward the light, showing a dark tunnel wall), it is restrained (three flat bands), it uses flat colour like the rest of the site, and the composition (words, tag, mask) was built around it. The three new frames follow that: real 3D, flat colours, few parts, the same 194 × 314 glass in the same place.
  - A · Blind: the original, plus the reference's pull-down blind as a flat panel inside the tunnel.
  - B · Layered: the reference drawing's layers as a real object: a pale back slab set down and right, the blue-grey frame, a light inner wall that turns dark just before the glass, and the blind.
  - C · Solid: one chunky light slab with a dark tunnel, turned a little further.
  - F · Current, real: Current's own shapes (reference px, scaled) built as layers and seen face-on through an off-axis camera (`camF`, `setViewOffset`): the front stays square while the opening shows its right and bottom walls, light then a short dark seal. Soft CSS drop shadow. (D · Front and E · Wide, the same idea with the original's proportions and with wider glass, were tried and discarded.)
  - Current, reworked (2026-10-14): set into the page rather than sitting on it. G (a deep, tilting version) was tried and scratched. Now: a shallow recess shaded along its top edge (WC.recess), the frame and inner wall sunk a little down-right inside it and shaded like a hollow (darker above), no bevel highlight, no whole-panel tilt (only the glass group and seal shift with the pointer). Wider frame band (24–40 ref px), longer glass (598 × 915 ref px), the blind solid with a faint shadow on the glass (uBlind 0.35) and a soft edge line. The overlay lab still shows the earlier Current.
  - Whiter colours (2026-10-14): the site window's bands in the lab are lifted toward white (outer #e9ecf3, blue-grey ring #c6cdd9, bezel #eef0f5; the dark tunnel stays) on Live site, Original and A, and Current uses the same family (recess #cdd2dc → #f1f3f7, frame #bcc4d1 → #cbd2dd, inner wall #e1e4ec → #eef0f5, blind #eaedf3, handle #b9c1ce). `portfolio-s1.html` keeps its original colours.
  - H · Reference angle: the reference drawing's angle, showing more of the right and bottom sides. Built as an oblique (cabinet) view: an orthographic camera and a shear matrix on the group (`setShear`) so depth slides things down-right at a fixed rate, with no perspective scaling. The frame is a slab (blue-grey face, pale sides) with an even 32 px band; the pane (glass and blind) stands proud of it, sitting 45 px down-right in a slightly larger opening so its face lands on the opening's top-left edge. Result, from the glass outward on the right: dark seal, pale pane edge, blue-grey band, pale frame side, close to the reference's measured bands. The shear leans a little with the pointer.
  - The blind is one solid colour (#dde1ea) everywhere, in both labs.
  The cloud sea uses the live site's softer colours (welcome sky #3d69c0 → #86a6e1 → #aac2ee; the painted scenes' palettes for the projects), in both labs. Hovering a ticket drives both windows. For the current frame, the letter mask follows the new glass and the blind's edge.
- `cloud-sea-lab.html` (https://claude.ai/artifact/Frq1NApGXCVoEBTrB9qW6b): the earlier five-palette study, kept as published.

**Live site (2026-10-13):** https://www.eileen-z.com
- GitHub Pages serves the `s1-site` branch (root). `index.html` forwards to `portfolio-s1.html`; the `CNAME` file holds `www.eileen-z.com`; `.nojekyll` is set.
- GoDaddy DNS: four A records for `@` (185.199.108–111.153) and `www` CNAME → `eileenyhz.github.io`. NS, SOA, `_domainconnect` and `_dmarc` are untouched; forwarding is off.
- To update the site, commit to `s1-site` and push; Pages rebuilds by itself. `main` is untouched.
- HTTPS is enforced once GitHub issues the certificate.

**Temporary (2026-10-13):** Wallet and ID are blurred and inert (`.pg.wip`) under a sticky note: "EZ is working on this rn, come back later :)", in Gochi Hand (Eileen's pick; capital EZ avoids the "e3" look). The header stays usable. To undo, remove `WIP_NOTE` and the `wip` class in `openPage`.

**Details pass (2026-10-13):**
- **Order:** Motif (flagship), then newest first: ShanHai 2025, PixAI 2023, Dreamin 2022. Flight numbers follow the order: EZ01 MTF, EZ02 SHH, EZ03 PXA, EZ04 DRM.
- **Hero:** words are name + year; the hover tag shows the flight (`EZ02 · SHH`).
- **Centring:** the tickets, the WELCOME ABOARD block and the visible window frame all sit on the page centre:
  - the deck is at 15.6 / 33.2 / 50.8 / 68.4cqw;
  - the window box sits `.009wh` right of centre to offset its 0.24rad turn;
  - `.w1` is at -.828ws and `.w2` at .252ws.
- **Ticket colours, a set of four (dark, light, light, dark):**
  - Motif: cobalt + yellow;
  - ShanHai: cream + seal red;
  - PixAI: lavender #e4dcfe + violet #6b3ae6;
  - Dreamin: night navy #1b2147 + lantern amber #f2a65a.
- **Pop-up:**
  - picture panels are tinted per project (`pv`); Dreamin's is dark (`dark: true`);
  - Dreamin's opening shows the whole game frame;
  - the pass is 760px max, with tighter spacing on screens 760px tall and under;
  - an opened step scrolls into view;
  - the 3D window pauses while a pass is open (`W3.pause`);
  - Tab stays inside the pass;
  - the stub has a ← Prev button; "All flights" closes the pass.
- **Header:** Wallet and ID use the landing header in the same place: name on the left (goes home), nav on the right. The page fade no longer slides up, and the stage is `overflow: clip` so focus can't scroll it. Nav greys are darker (`--mute`).
- **Phones (stage under 600px):** words fit the width and centre on the window; the tickets are a swipeable row of 150px tickets; the hover tag is hidden.

**Content (2026-10-13, latest):**
- Tickets:
  - P1: Mōtif · Agentic fashion · 2024 · "Co-founder · Design";
  - P2: PixAI · AI art generator · 2023 · "PM · UI/UX". Visit link: pixai.art/en. Full case from `pixai-content.html`:
    - three steps: guided model upload, daily rewards, sorted notifications;
    - outcome: CTR 3% → 12%, +18% daily engagement, +7% feature adoption from A/B tests on core flows;
    - team: Raven G. (CEO);
    - cover: a hand-placed collage (`cls: "collage"`, position per screen) of the task hub, guided upload and notifications on a lavender tint;
    - ticket image: the two notification screens;
    - no "+" rows. The model-detail screen and upload iterations were dropped;
  - P3: Dreamin · GenAI game engine · 2022 · "Design lead", full case from `dreamin-content.html`;
  - P4: ShanHai on the ticket, "Stories of ShanHai" in the pop-up (`long`) · Indie game · 2025 · "Art · UI/UX".
- Roles with several parts use " · ", not commas.
- One-line ticket names set `--nup: 8.2cqh`, which lifts the role tab, rule and blurb under the name and makes the preview taller.
- Dream!n:
  - the outcome is 50k MAU in the first month, 3 games per user a week, backed by Miracle Plus;
  - the team is Felix W. and Allen Z.;
  - the screens are 2026 reconstructions, and the case says so;
  - the >80% "want to make a game" figure is left out: its source is pending.
- Each case has `extras` (the "+" rows): Motif has style-card polaroids; ShanHai has UI system and Characters and buildings. Game loop was removed at Eileen's request.

**Content (2026-10-13, earlier): projects 1 and 4 are real.**
- P1 is Mōtif and P4 is Stories of ShanHai. P2 and P3 stay placeholders; Dream!n and PixAI are unfinished.
- Case studies live in the ticket pop-up; there is no separate case page. The pop-up:
  - is laid out for one focal point: a text column on the left (title, pitch, outcome, problem, then the steps as a list with one step open at a time) and one large picture on the right for the open step. On phones the picture sits inside the open step;
  - has two columns: the text on the left (the ticket's type and date row and the name in Doto, the pitch, a What / For / Team / Outcome list, the problem, then the steps) and the picture panel on the right;
  - has the boarding-pass shape: the ticket's perforated left edge, rounded right corners and stub notch;
  - has a pinned footer that is the stub, in the ticket's stub colours. It holds "← All flights", Boarding stub · Seq · EZA → code, and "Next flight". There is no barcode, which read as confusing;
  - runs a tour when opened. The full-screen opening was dropped at Eileen's request, so the pass opens half text and half picture:
    - the cover shows for 5s: Motif shows the UI collage cropped from `motif_2025.pdf` page 5; ShanHai shows the complete restored world (`sh-world.jpg`). The scroll illustration is a draft; don't use it;
    - then the steps open one by one with their screens, 8s each, and loop back to the cover;
    - clicking a step stops the tour;
    - phones, reduced motion and placeholders get no tour;
  - Team lists collaborators only, with last initials;
  - each step shows two screens:
    - ShanHai steps (stacked): empty scroll and first courtyard; expedition and web MVP; halfway restored and `shanhai_cc1` (farmhouse upgrade);
    - Motif step 3: style profile and Designer DNA;
  - Motif's style cards are drawn as the app's polaroids: picture, #tag, lv., progress bar.
- The three-column version with the real ticket on a rail was tried and rejected (backup `s1-popup-v4-3col.html` in the scratchpad).
- Doto has no Ō, so the Motif ticket name and hero word use a plain O.
  - switches flights with the left and right arrow keys;
  - uses only Inter Tight for text and Geist Mono for small labels; bold marks what matters, grey what supports it.
- Each case study (`CS` in `portfolio-s1.html`) follows the mentor's frame:
  - overview: what, for whom, role, collaborators;
  - outcome numbers;
  - one big pain point;
  - the user flow split before, while and after, each with a sub-pain;
  - one solution and screen per part;
  - a look and visuals strip.
- Facts come from `motif_2025.pdf`, `SH_2025.pdf` and `motif-agent-content.html`. The Motif framing is the three agents: Wardrobe Keeper, Personal Stylist and Style Analyst.
- Images are resized copies in `img/`, taken from `~/Desktop/portfolio26_content_prep` (`figma_materials`, `resources`). They are published with the artifact through `files`.
- Tickets:
  - they show real screens in the preview;
  - names can be split into `lines`, and long names shrink to fit;
  - `hero` sets the two words that replace WELCOME ABOARD.
- Scene changes: P4 shows the mountain view (`peaks`) and P3 the night city.
- Jost misplaces the macron on Ō, so the Motif case heading uses `head: "Motif"`.
- Not committed. The repo is public, so ask before committing the images or the collaborator names.

**Window, current (2026-10-13, final for now): reverted to the beginning version.** After comparing side by side, Eileen preferred the first window, so `portfolio-s1.html` is back to it exactly: the flat panel (outer ring, ring, extruded bezel with near-black inner walls, no shade) and painted glass views (`paintGlass`, `SCN`, `cumulus`, `wing`) that cross-fade with GSAP. Scenes: sky / coast / dunes / peaks / city (p1 coast SEA, p2 dunes DUN, p3 peaks ALP, p4 city CTY); letters over the glass use the original `OV`. Every experiment after it was discarded: toon cabin window, crayon views, window lab, Aviator world, minimal geometric world, and a low-poly rebuild of the beginning scenes. Their notes below are history only; backups are in the session scratchpad.

**Window, superseded (2026-10-13):** the original flat panel (#d4d8e6 / #a8b2c4 / bezel with #0b0d12 walls, MeshBasic) with the shade pushed fully up, and through it the live low-poly world pared down to the portfolio's graphic language: flat single-colour skies (scene background + matching fog), plain white lights (hemisphere + one key, no pink ambient) so facets read as flat tones, no cube clouds (replaced by three clean flattened icosahedron clouds drifting across), and each destination coloured from its project's ticket: default = pale #eef1f7 sky over a cobalt #2448d8 faceted sea; p1 coast = cobalt sea + yellow #f4c430 faceted sun; p2 fields = #9cc767 hills + #24331a cone trees; p3 dunes = sand #dcc9a3 + black cacti and a black faceted sun; p4 city = lavender ground + #1f9a73 buildings with lavender windows. Project → scene mapping changed: p2 fields, p3 dunes. Letters over the glass use the ticket colours (`OV`).

**Window, superseded refinement (2026-10-13):** the world flows slower (ground roll .00016 rad/frame, wave speed .008–.023); the horizon sits on the lower third of the glass (camera at y 230 looking at (0, 256, -790)); the ground is a much larger cylinder (R 3000, 200×17 segments, 1700 long) so the horizon reads almost straight; fog 700–2600; clouds are refined low-poly cumulus (4–5 icosahedron puffs on a flattened base, emissive white .32); props are respread over z -230…-1160; the sun is r170 at (260, -20, -2200).

**Comparison:** `portfolio-window-compare.html` (https://claude.ai/artifact/HLmmNxpi1Nr83BEvY7r3XB) shows the first window from the sketch mock-ups (painted gradient views + wing, GSAP crossfade) beside the current one, both driven by the same destination buttons. Its two windows are copied from `s1-before-window.html` (scratchpad backup) and `portfolio-s1.html`; it does not update when s1 changes. Note the old project order was sky / coast / dunes / peaks / city.

**Window, previous (after Eileen chose the style of Codrops' "The Aviator"):** `portfolio-s1.html` renders a live low-poly world into the glass through a render target: an Aviator-style rolling cylinder (radius 600, waves driven by a position hash so the seam never cracks), cube-cluster clouds on a slower ring, fog, hemisphere + pink ambient + directional light with soft shadows, and a gradient sky card. Destinations (`DEST`) ease their colours and grow props in and out: sky = Aviator sea, coast = low-poly sun, dunes = sand with cacti, fields = green with cone trees, city = night buildings with lit windows. The panel is a faceted, bevelled warm-white frame (MeshPhong flatShading, curveSegments 7) with a dark seal and the shade pushed fully up. Letters over the glass: Aviator red over sky, white over sea/ground. No wing (removed; it read as a grey sliver). The window lab still shows the older options.

**Window, before that:** `portfolio-s1.html` had the previous panel with the shade pushed fully up (only its lip and grip show; no blink, the view cross-fades again) and hand-drawn crayon views after Eileen's crayon reference (`paper()`, `tooth()` paper grain on a crayon layer and a pencil layer, `rough()` wobbly outlines, `pencil()`, looping contrails, `sparkle()`); no wing. Letters over the glass take the drawing's crayon colour. **`portfolio-window-lab.html`** (new, https://claude.ai/artifact/F8ewnQXFk3yYkMDVqvgX5p) mixes panel (Classic / Ink line / Slim with dimming tint), rendering (Crayon / Poster / Riso two-ink halftone over the poster drawing) and wing (Swept / Engine / Tip / None); stills of all 9 panel × rendering pairs and 4 wings come from a second WebGL renderer so the live view never flickers. Waiting on Eileen's pick.

**Window, earlier state (`portfolio-s1.html`):** the previous flat panel (outer ring, ring, extruded bezel with near-black inner walls) plus a flat pull-down shade (basic-material plate clipped by a world-space plane at its bottom edge, a #a8b2c4 lip, a grip and a thin translucent shadow on the glass). Shade rests at 20% of the glass; a new view blinks it shut and lifts it again (lerp .34, ~0.45s). Views: one flat sky colour each, organic flat clouds (`cloud()`: flat base + scalloped quadratic top, one flat shadow band; the deck clouds have none), contrail on the default sky, cel-shaded dunes, patchwork fields with the plane's shadow, flat city, printed grain 16. **Rejected the same day:** a toon-shaded lofted cabin window with stepped sky bands ("looks worse than the previous version"); notes below describe it for reference only.

Rejected toon version: a cabin window built from lofted rounded-rect outlines (`ring` + `loft`): plastic surround face + rim, a deep reveal tapering from 240×366 to 196×316 over 50 units, a dark seal, the glass (ShapeGeometry with remapped UVs), and a pull-down shade (toon plane clipped by a world-space clipping plane at its bottom edge, plus a lip bar and grip). Toon shading: MeshToonMaterial with a 3-step NearestFilter ramp, ambient .46 + directional .56 from the upper left, so faces read as flat bands. Shade covers 30% at rest (WELCOME ABOARD), 14% on a project; changing the view blinks it shut (~0.2s), swaps the texture, and lifts it (~0.45s total). The shade fraction is pushed to CSS `--shade` and `.w-mask` uses `clip-path: inset(var(--shade))` so the letters only recolor over open glass. Views repainted flat (stepped bands, two-tone hard-edged clouds via `cloud()`, cel-shaded dunes, perspective patchwork fields with the plane's shadow after Eileen's poster reference, flat night city) with a printed grain (`grain()`); "peaks" became "fields" (p3 code FLD). Rendering references: a flat cel-shaded 3D street scene and a flat blue/green plane-and-shadow poster. | https://claude.ai/artifact/TrVWmT9F1u8Mf29rE2sXpX |
| `portfolio-sketches.html` | The 4-tab comparison of Eileen's 3 sketches (sketch 2 in two versions), with Wallet, ID and case study pages. Kept as a record. | https://claude.ai/artifact/D1vJx5B9faGCjkQRhThFsi |
| `portfolio-concepts.html` | Earlier 3-concept mock-up (side window / train carriage / gate reader). | https://claude.ai/artifact/67KonwdfUSAbEmBsr7NdZH |
| `portfolio.html` | Single-page site, last state = white Hiroto-style "object cluster" (rejected as ugly). Contains the full **Wallet page** (card stack + receipt printer + gallery + lightbox) and **ID page** (tilting ID card) to reuse. | https://claude.ai/artifact/JHbJkSKqaPCnVbudx2jaia |
| `portfolio-grid-draft.html` | Previous single-page version (grid hero, GSAP split intro, bottom ticket dock). Kept as draft. | (was v2 of the link above) |
| `portfolio-directions.html` | The A / B / C comparison draft. **A = the preferred ticket design.** Keep as reference; user asked not to change it. | https://claude.ai/artifact/N9yamMt3eis4Xeyxrik5YZ |
| `.claude/launch.json` | Preview server config (python http.server, port 4173). | — |
| `HANDOFF.md` | This file. | — |

Artifacts are private claude.ai pages; republishing the same file path from the original session updated the same URL. From a new session, pass the URL as `url` to update in place (read it first).

## 4. Work completed (chronological, short)

1. Reference research and 6 portfolio directions → narrowed to Records vs Welcome Aboard.
2. Records direction (three.js crate, lvn-style) → dropped by user.
3. Welcome Aboard A/B/C (`portfolio-directions.html`): A ticket deck, B departure board with particles + receipt printer, C scrolling site with wallet gallery + ID page.
4. Combined single site (`portfolio.html` / grid draft): GSAP split-screen intro, ticket dock, wallet page, ID page, project pop-up.
5. Hiroto-style object cluster (rejected).
6. Three concepts (`portfolio-concepts.html`).
7. Eileen's sketches → `portfolio-sketches.html`, iterated 4 times:
   - three.js window from Eileen's reference panel; mirrored text inside the glass **removed**; shade lip **removed** (sketch shows open sky).
   - Proportions measured from sketches (window ~43–45% of stage height; WELCOME starts ~0.46 window-widths left of the window at its top edge; ABOARD starts at window center on its bottom edge; ticket x positions from the sketch).
   - Poster-style extras (script line, caption blocks, date) were tried and **removed** at user request.
   - Font for WELCOME/ABOARD changed to **Jost 300**; overlap recolor added.
   - Tucked tickets now peek ~13 cqh so the two-line project name is fully readable; hover raises to 27 cqh.
   - Sketch 2·tickets: three new tickets matching sketch shapes/colors.
   - Wallet and passport reverted exactly to the first version (incl. "Wallet"/"Passport" captions in sketch 3).

## 5. Current implementation state (`portfolio-sketches.html`)

Tabs:
1. **Sketch 1** — name top-left, nav "Selected work / Wallet / ID" top-right, window centered (`--cx 49.5cqw --cy 47cqh --wh 43cqh`), four version-A passes tucked at bottom (`data-pos` on `.deck`).
2. **Sketch 2 · objects** — white left 60%, cobalt tray right 40% (`--tray`). Wallet (top right of tray) and passport (first-version design), white line ticket (`.s-tick`) that fans the four passes on hover. Bottom-left three lines (name / role / contact).
3. **Sketch 2 · tickets** — same left side; menu bottom-left (Selected work / Wallet / ID); three projects as new tickets at the sketch's three spots (`.s-grey`, `.s-blue`, `.s-tick`).
4. **Sketch 3** — name centered top, no nav; window centered; wallet in bottom-left corner, ticket book (passes) bottom center, passport bottom-right corner.

Clicks: passes / tk2 tickets → project pop-up (`openModal`); its "Read the full case study" button → **case study page**; wallet / passport / nav → **Wallet page** and **ID page**. Pages open in a `.pg` layer inside the active stage (`openPage(k, view, id)` / `closePage(k)`), with a sticky bar ("← Flights", name, Selected work / Wallet / ID). Wallet = card stack + receipt printer + gallery + full-size viewer (`#lb`, arrow keys); ID = tilting passenger card + bio. Esc closes viewer → pop-up → page.

## 6. Unfinished tasks and next steps

- Eileen picked **sketch 1**; it now lives in `portfolio-s1.html`. Waiting on Eileen's feedback on the new tickets, cards and wallet folder.
- Not yet restyled to the new look: the ID page and the case study page (still the earlier versions).
- Replace placeholder content (project names, summaries, colors, destinations, images, bio, links).
- Possibly use a real sky/clouds photo for the window glass if Eileen supplies one (Eileen has a photo-like reference; current clouds are painted in canvas).
- Mobile layouts for the sketch tabs are only proportional scaling; the chosen direction needs a real phone layout.
- Optional: intro animation (GSAP split screen exists in `portfolio-grid-draft.html` / `portfolio.html`) if Eileen still wants one for the final site.

## 7. Bugs, blockers, known issues

- The white/blue overlap copy of WELCOME/ABOARD is a flat CSS clip approximating the 3D-rotated glass; at extreme pointer positions the recolor edge can drift a few px. Parallax was reduced to keep it small (`rx/ry` lerp in `W3` loop).
- Painted clouds still look slightly "bubbly"; a photo texture would fix it.
- GSAP animations look slow/stuck in the Claude desktop Browser pane when it is hidden (throttled timers); they run normally in a real browser. Verify timing in a real browser.
- `portfolio-concepts.html` / `portfolio-directions.html` particle and older code is kept only as reference; B's particle window was disliked.
- Repo: https://github.com/eileenyhz/portfolio26_v0.1 (public, branch `main`). GitHub CLI lives at `~/.local/gh/gh_2.102.0_macOS_arm64/bin/gh` (not on PATH); git uses it as credential helper.

## 8. Commands to build and test

No build. Serve the folder and open a file:

```bash
python3 -m http.server 4180 --directory /Users/eileenzhang/Desktop/Work/portfolio_cc
```

Then open `http://localhost:4180/portfolio-sketches.html#s1` (also `#s2a`, `#s2b`, `#s3`).

Quick JS syntax check of the last inline script (what was used during development):

```bash
python3 -c "s=open('portfolio-sketches.html').read(); i=s.rfind('<script>'); open('/tmp/x.js','w').write(s[i+8:s.rfind('</script>')])" && node --check /tmp/x.js
```

Test checklist: each tab at ~1280×900; hover each ticket (window scene, word roll, tag, tray color, overlap color); click a ticket (pop-up) → "Read the full case study" (case page); wallet / passport / nav (Wallet and ID pages); wallet card → receipt + gallery → image viewer; Esc; console has no errors.

## 9. Important context and constraints

- User is Eileen Zhang (designer & developer). Eileen gives terse, visual feedback, often with sketches/screenshots; follow sketches **exactly** (positions, proportions, shapes, colors) and don't add unrequested decoration.
- Eileen asked to see interpretation first and wait for approval when a new direction comes in; for small fix lists, apply directly.
- Before presenting, verify every state in a browser preview and fix defects first (Eileen was frustrated by low polish).
- Keep `portfolio-directions.html` unchanged (it is "the draft"). Keep version A's ticket design wherever passes appear unless told otherwise.
- Artifact rules: pages must be self-contained; only the allowed CDNs; no `alert/confirm`; images as data URIs or CSS/canvas.
- Fonts in current file: Jost (WELCOME/ABOARD), Inter Tight (UI/tickets), Instrument Serif (pop-up accent), Geist Mono (labels).

## 10. Rebuild on Astro (`site/`, 2026-10-14, not committed or pushed)

Eileen asked for a modern stack and URLs without `.html`. `portfolio-s1.html` stays the design reference; `site/` is the production rebuild of it.

**Stack**: Astro 7 (static output, `build.format: "directory"`, `trailingSlash: "always"`), TypeScript 6 strict (`@astrojs/check` does not support TS 7 yet), React 19 islands, React Three Fiber 9 + three 0.186 for the window, GSAP 3.15 (intro), nanostores (the hovered view, shared between the page script and the window island), Vitest 5, Playwright, Prettier. Node 22 is installed user-locally at `~/.local/node` (Astro 7 needs >= 22.12; the system Node is 18).

**URLs**: `/`, `/work/motif/`, `/work/shanhai/`, `/work/pixai/`, `/work/dreamin/`, `/playground/`, `/about/`. Each is a real pre-rendered page with its own title, description, canonical and Open Graph tags. A case study opens as a sheet over the landing: clicking a ticket or Next flight swaps the sheet in place and `pushState`s its URL; back/forward work; loading `/work/{slug}/` directly opens that sheet. Internal links always carry the trailing slash so GitHub Pages never redirects.

**Layout of `site/src`**:
- `data/`: typed content (`projects.ts` with `slug`, `case-studies.ts`, `wallet.ts`, `views.ts` palettes and letter colours, `types.ts`). Kept as compact one-line-per-entry tables (excluded from Prettier on purpose).
- `lib/`: pure HTML builders and helpers ported from s1 (`tickets.ts`, `case-study.ts`, `wallet.ts`, `text-effects.ts`, `format.ts`).
- `components/window/`: `frame.ts` (the window geometry, stencil blind, palette states), `sky.frag.glsl` (raymarched cloud sea), `glass.frag.glsl`, `SkyWindow.tsx` (the R3F island: `<Canvas flat linear>`, colour management off, renders sky into a target then the window).
- `components/*.astro`, `layouts/Base.astro`, `pages/` (index, `work/[slug]`, wallet, id), `scripts/` (landing, intro, wallet page, ID page), `styles/global.css` (s1's CSS).
- The intro plays once per browser session (`sessionStorage` `ez-intro`; an inline head script hides it before first paint); the name in the corner replays it.

**Tests**: `src/**/*.test.ts` (77 unit tests: unique slugs, every referenced image exists in `public/`, project order, palettes, ticket/sheet/receipt builders). `e2e/site.spec.ts` (18 Playwright tests against the production build on port 4322: intro hidden before the line and removed after, click/reduced-motion skip, window canvas with no console errors, hover words and tag, ticket → `/work/motif/`, Next flight / All flights / back / forward, arrow keys and Escape, direct case-study URLs with canonical and OG tags, header links, Wallet receipt and viewer, ID card).

**CI**: `.github/workflows/site.yml` runs format check, `astro check`, unit tests, build, e2e on every push/PR that touches `site/`, and uploads the build as a Pages artifact. The deploy job runs only from a manual dispatch with "deploy" ticked, and will only work once Pages' source is switched from the `s1-site` branch to GitHub Actions (not done; needs Eileen's go-ahead). Suggested before switching: tag the live commit `v1-live`.

**Parity check** (`npm run test:parity`, `playwright.parity.config.ts`, `e2e-parity/parity.spec.ts`): the same script runs against `portfolio-s1.html` (served by `python3 -m http.server` from the repo root) to record screenshots, then against the site's build, which must match them. Both runs freeze the clock (`page.clock`) and step it 50 ms at a time, so the intro, the window's clouds and every animation line up frame for frame. States: 16 intro frames, landing, hover on each ticket, each case study plus a step, Next flight and All flights, Wallet (card, receipt, viewer), ID (and tilt), at 1440×900 and 390×844. Allowances equal the reference's own run-to-run noise: 10 px on desktop, 400 px on phones (dot letters over the WebGL layer). Remaining differences are single cloud-edge pixels from three r128 vs r186 shader maths, invisible at 3× zoom. Verified it fails when a known bug is put back. `parity-report/side-by-side.png` is an old-vs-new contact sheet. Bugs it found and fixed: (1) R3F turns colour management back on unless the Canvas has `legacy`, which made the frame and blind darker; (2) Lightning CSS keeps only the last of `backdrop-filter` / `-webkit-backdrop-filter`, so the blur behind the pop-up and the page bar was gone (prefixed first now); (3) the nav was uppercase, but the reference's nav is buttons, whose browser default turns off text-transform and letter-spacing, so it shows "Selected work" (now matched).

Deliberate differences from the reference: the intro plays once per browser session instead of on every load (Wallet and ID are now real pages, so returning to `/` would otherwise replay it); going to Wallet or ID is a page load rather than a layer over the landing.

**Found along the way**: the nav's decorative "●" (CSS `::before`) was part of each link's accessible name; now `content: "●" / ""`. The window chunk is ~240 kB gzipped (three + R3F, loaded after first paint); the warning limit is raised with a note. `astro preview` keeps a lock file; the e2e server uses `--ignore-lock`. After editing `astro.config.mjs` the dev server can serve "504 Outdated Optimize Dep": restart it.

**After the audit (2026-10-14)**: the site in `site/` is now the source of truth; `portfolio-s1.html` (artifact v46) is frozen as the pre-rebuild page, and `npm run compare:s1` (formerly test:parity) reports what has changed since it.
- Words over the window are off (`SHOW_WORDS` in `src/components/WindowBox.astro`, also hidden in s1). The hover tag has no arrow.
- Phones and tablets (`max-width: 900px`, or any touch screen): the window in the top half, the four tickets open in their colours in a 2 x 2 grid below (four across in landscape). Cards size from their cell (`--tw`, `--th`); a card shorter than 140px inside drops its description.
- Phone case study: straight down, no accordions: cover after the lede (`.mc-cover`), every step open with its pictures, the year clear of the close button.
- Case studies have a Role row (drafts written from the case content; Eileen to correct). PixAI: ticket now "Upload and retention redesigns." (no "for an AI art app": it is a website), team of three (Raven G., an unnamed design lead, Eileen), +7% adoption under the guided upload and +18% daily engagement under daily rewards. A/B testing work stays out on purpose.
- ShanHai: the old guide is a cut-out (`sh-oldman.png`, background removed); the characters grid fills the panel (3 x 4); the tiles are wider.
- Link previews: tab title "Eileen Zhang"; each case page has its own description (`meta` in projects.ts); preview images are screenshots of the built site, `npm run og` writes `public/og/*.jpg` (home, made for LinkedIn: the intro's cobalt WELCOME ABOARD frame, caught on a frozen clock 2.5 s in, with the four tickets resting white along its bottom edge down to their roles; Eileen: the landing shrank to an unreadable thumbnail. After a deploy, refresh LinkedIn's cached thumbnail with linkedin.com/post-inspector).
- Nav renamed (2026-10-14) to plain words: Selected work · Playground · About (were Selected work · Wallet · ID); pages and URLs `/playground/` and `/about/`, headings PLAYGROUND and ABOUT. The wallet cards and the ID card stay as the pages' objects, and internal names (wallet.ts, wallet-page.ts, id-page.ts, .wl-*) are unchanged. On phones the links fold into a menu (below).
- Site switches (`site/src/site-switches.ts`): `down` builds every page as the cobalt preparing screen (`src/pages/preparing.astro`, dot-matrix board cycling PREPARING / FOR DEPARTURE and GATE OPENS / SHORTLY, via `src/middleware.ts` rewrites; canonical keeps each page's own address); `/preparing/` exists anytime to preview, with noindex while the site is up. `wip` puts the first live site's sticky note ("EZ is working on this rn, come back later :)", Gochi Hand) over Playground and About, which blur. `down` defaults off, `wip` on (2026-10-15: Playground and About launch under the note while their copy is placeholder); env `SITE_DOWN=1` / `SITE_WIP=0` etc. overrides for one build, and the Actions workflow has the same two checkboxes when started by hand (its tests always run on a normal build first).
- Cursor: C (the intro's jet) is on the site, `src/scripts/cursor.ts`, loaded by Base on every page for fine pointers only (touch keeps its own; reduced motion drops the trail). The plane is the pointer: system cursor hidden (`html.c-plane`), nose at the hotspot, heading from the last 8 px of travel and held when still. Its colour follows the surface pixel by pixel: each shape is drawn twice, white in `mix-blend-mode: difference` and cobalt in `screen` (cobalt on white, white on ink/navy, pale on cobalt, bright blue on the yellow stub, split across edges). Each layer is appended straight to body, never wrapped, or the blending would not reach the page. The dotted contrail leaves from the tail (20 px behind the nose), never shows within 11 px of the plane's middle, is at most 140 px long and fades along its length within 0.6 s (70 px was too short, uncapped too long). Tag: BOARD over tickets and Next flight, VIEW over zoomable pictures. The lab (round 4+, https://claude.ai/artifact/PJxCcVLcY9bFrYUtCURvQH) keeps A (dot-matrix trail) and B (paper plane) for reference.
- Decided without asking (Eileen: "think and decide on your own", likes the current vibe): window stays its size; case-study pictures open full size on click (`.zoom`, Escape or click to close); the desktop tour only changes the picture and marks the step (`li.tour`), never opens text, and ends on any click, scroll, key or pointer over the text; tickets show a focus outline on their holder (the mask clips their own); one h1 per page (hidden on the landing and case pages, the big titles on Playground and About), sheet titles are h2; /work/{slug}/ pages render their sheet in the HTML (data-case, kept by landing.ts); Dreamin's cover is a collage of its three steps on navy; "MiraclePlus"; pictures are WebP from `media/` originals (`npm run images`, 6.9 MB → 1.7 MB; ShanHai's page 6.1 → 0.85 MB) and load lazily except each cover.
- 404: `src/pages/404.astro`, the cobalt board (shared `CobaltBoard.astro` with the preparing screen) cycling FLIGHT / NOT FOUND and GATE / 404, with "← All flights". Mōtif is spelled with the macron everywhere (Doto, Inter Tight and Geist Mono all have Ō).
- Browser tests build and serve their own copy (`astro.e2e.config.mjs` → `dist-e2e/`, switches forced off), so they pass whatever the switches say; CI then builds the site to ship with the real switches.
- Landing layouts (2026-10-15, final rework): two arrangements split at 800 px, Eileen's breakpoint (she looked at 778 px, then chose 800). 800 px and up with a mouse: the original tucked deck, unchanged at 1440 (slots 15.6 / 33.2 / 50.8 / 68.4% of the width). Under 800 px, and touch screens at any width: the window on top and the four tickets scattered along the bottom edge, a little tilted (±1.5 to 3.5°), as if dropped there; Mōtif (flagship) and ShanHai (newest) in front, tucked into the edge; PixAI and Dreamin behind, showing down to their roles, their covered descriptions hidden so no cut-off words peek out; hovering one behind lifts it to the front. Smooth resizing (Eileen: "make sure there's a smooth transition when I resize"): one ticket width for every layout, `--tk-w: max(16cqw, min(38cqw, 160px))` on .stage, so crossing 800 px never resizes a ticket; the row is laid out from the centre (`--i` per slot in TicketDeck.astro) and the scatter in ticket widths from the centre, both with `left`/`top`, which transition (.5s), so tickets glide between arrangements; the window eases its size and place the same way. The scatter's window is 72% of the space above the tickets, at most 38% of the height (Eileen: the window was too big at ~450 px wide, then the tickets too big at ~540 px; tickets now stop at 160 px wide). The ticket is never reshaped (1 : 1.7). Tried and dropped along the way: a three-way split with a 640–799 px row of four (two jumps when resizing), a scrolling phone page, one straight pile, two straight piles, a looser scatter.
- Phone menu (2026-10-15): under 640 px the header is the name and a menu icon (`.hd-menu` in Header.astro, two lines that cross into an x while open, named "Menu" for screen readers; Eileen asked for an icon, not the word); it unfolds the three links over the whole screen in large Jost capitals with hairlines, the current page marked with the dot. Escape, a link, tabbing out, or widening past 640 px folds it. The page bar gives up its blur while the menu is open (the blur would trap the fixed menu inside the bar).
- Nav targets for the plane (2026-10-15, Eileen: the top nav was hard to click): every header link takes clicks 12 px above and below its words and half an em to each side (padding cancelled by a negative margin, so nothing moves), and over anything clickable the plane draws in to 80% toward its nose, so more of the target shows and the change says it is on target.
- Cursor steadiness: the plane turns only once the pointer is 30 px from where it last turned (Eileen's rule), and never while over something clickable. It remembers its position and heading across page loads (sessionStorage `ez-cursor`), and the normal pointer shows until the first move on a fresh visit.
- Copy (2026-10-15): Mōtif's line "An agentic system that styles what you own and shops what you’re missing." (Eileen: say "agentic system" and show that it shops new items) (the earlier "An AI stylist for the clothes you already own." was off topic, a longer one too long); Dreamin's "Describe a world in a few sentences, then play it as a game."; Role rows are the plain roles (Co-founder · Design, Art · UI/UX, PM · UI/UX intern, Design lead; the PixAI ticket stays "PM · UI/UX", intern is in the case study only); PixAI team "Raven G. (CEO) · Anonymous (product lead)"; PixAI's guided upload: "Form completion rose about 20%." (+7% feature adoption stays in Outcome only).
- Live (2026-10-15): www.eileen-z.com serves the Astro site from `main`. GitHub Pages builds with GitHub Actions now (it used to serve the s1-site branch as is); the domain and HTTPS carried over, http and the bare domain redirect to https://www.eileen-z.com. The commit that was live before is tagged `v1-live`. To publish: push to main, then Actions → Site → Run workflow on main with "Deploy" ticked (the "down" and "wip" boxes can only switch those on for that deploy; off means the value in site-switches.ts, where wip is on). The workflow runs every check first and deploys only if they pass. To go back to the old site: run `git switch -c restore v1-live`, then set Pages back to the s1-site branch (Settings → Pages → Deploy from a branch). Pushing a change to `.github/workflows/` needs the GitHub login's "workflow" permission (granted 2026-10-15 via `gh auth refresh -s workflow`). The `*-lab.html` experiment pages stay local, out of the public repo. The first deploy stopped on a timing-based resize test (CI draws WebGL in software, so the glide had finished before the test looked); it now listens for the transition event instead.
- Feedback round (2026-10-16, from designers who tried the live site; local, not yet deployed): (1) the custom plane pointer is gone, the site uses the system pointer: a pointer drawn by the page lags whenever the page is busy, it had already cost click accuracy, and its two full-screen blend layers made the browser re-blend the whole page every frame (the plane stays in the intro; cursor-lab keeps the designs); the nav links keep their larger click area. (2) Ticket hover tightened (Emil Kowalski's "you don't need animations"): rise .25 s with no overshoot, return .15 s; colours fill in .22 s and drain in .15 s; no delay on the picture. (3) Ticket shadow 5 px at 8% (was 12 px at 12%). (4) The window draws at most 1.5 device pixels per pixel and redraws the cloud sky 30 times a second (glass and frame every frame). (5) Intro lag (a second report): the plane now waits for the window's first frame (`$ready` in stores/window.ts, at most 1.5 s), so the page's start-up (three.js, shader compiles: four 50–90 ms long tasks around 0.2–0.6 s) happens under the still cover. Measured, 4x slower CPU: landing main thread 45.6% → 23.1% busy; worst frame during the flight 117 ms → 17 ms, take-off 0.64 → 0.92 s. The link-preview script now follows the plane instead of a fixed 2.5 s. The parity harness's intro frames will be offset by that wait (it compares against the old page, which starts at once). `site-compare.html` at the repo root (local, untracked) shows the frozen current build (port 4410, served from the scratchpad) beside the new build (`site (launch check)`, port 4400).
- Next: Playground and About copy is placeholder (they launched under the sticky note). The window overlays (Mōtif doodles, ShanHai loong, PixAI figure, Dreamin pixel characters) join once the loong GLB and the PixAI artwork are ready; until then they live in `window-overlay-lab.html` and `portfolio-xlab.html`.
- Switch previews: `npm run dev:down` / `npm run dev:wip`, or the "site (down)" / "site (notes on)" entries in .claude/launch.json (they run beside the main dev server with --ignore-lock).
- Favicon: design 11 from `favicon-lab.html` round 3 (white "ez" and a sky-blue #9fb8f6 full stop, Inter Tight 800, on cobalt #1f3ccf), "for now". `npm run icons` (site/scripts/icons.mjs) renders it from the real font into `public/favicon.ico` (16, 32, 48 px PNG entries) and `public/apple-touch-icon.png` (180 px, square). Astro's favicon.svg is gone.
- Intro can no longer leave a blue screen: `Intro.astro` removes the cover if the intro script has not started by page load + 0.6 s (and hides it without scripts); `intro.ts` finishes the intro after 8 s of visible time even where animation frames are throttled (the desktop app's browser pane). Cause found: after a dev-server restart (any `package.json` edit) a page loaded earlier requests stale modules, the intro script fails, and nothing removed the cover. Reload the page after the dev server restarts.
- Open, no reply yet: bigger window on tall screens (comparison image `site/parity-report/window-size.png`), desktop auto-tour, image zoom, focus outlines, headings, 404 page, soft images, ShanHai itch.io link, Motif spelling, Dreamin cover and MiraclePlus spelling, image weight.

Commands (prefix `export PATH=~/.local/node/bin:$PATH`):

```bash
cd site && npm run dev          # http://localhost:4321 (or preview_start "site" in the desktop app)
cd site && npm run check && npm test && npm run build && npm run test:e2e
cd site && npm run format       # Prettier
```
