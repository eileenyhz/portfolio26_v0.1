# Handoff: "Welcome Aboard" portfolio (Eileen Zhang)

Last updated: 2026-10-12. Everything is static HTML in this folder; there is no build step.

## 1. Original goal and requirements

Eileen is designing her personal portfolio. The work so far is exploration through clickable mock-ups, not a production site.

Content structure (fixed across all versions):
- A landing page that shows taste immediately.
- 3–4 main projects ("selected work").
- A handful of experimental / side projects (incl. multi-image work such as art commissions).
- An About section.

Theme: air travel / boarding. Projects are **boarding passes (tickets)**, side projects live in a **wallet** (bank cards + printed receipts), About is a **passport / ID**. An **airplane window** ("the panel") is the hero object; hovering a project changes the view outside it.

Her stated preferences (accumulated feedback, most recent wins):
- Minimal but catchy; quick to scan; no long scroll, no preloader, few effects. Navigation must need no learning, minimal clicks.
- Liked references: samfcheng.com (clean UX), dennissnellenberg.com, p5aholic.me, lynnandtonic.com, hirotos.com (main page only, for vibe), mikes.cv (gate reader opening), lvn.studio (3D look), the "In-Flight / Landing Point" poster (type layout only, NOT colors, and not copied literally), ticket graphic references (Sound Journey vertical ticket, Mushen, Party Ticket, Red Room, Vertical Park), Dia receipt.
- Strongly prefers **version A's vertical boarding-pass design** (black & white at rest, color + graphic + preview in stub on hover), **tucked at the bottom edge until hovered**, with the **project name clearly visible while tucked**.
- Rejected: particle effects that read as noise, giant headline zones, poster-style extra captions/script text, heavy grotesk on WELCOME/ABOARD, Hiroto-style white "object cluster" page (called ugly), grid/Cappen headline version.

The **current direction** is her own three hand sketches (see §5), built in `portfolio-sketches.html`.

## 2. Architecture and important decisions

- Every deliverable is a single self-contained HTML file (inline CSS + JS). External scripts only from cdnjs / jsdelivr (allowed by the Claude Artifact CSP):
  - three.js r128: `https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js` (UMD; also uses `examples/js/geometries/RoundedBoxGeometry.js` and `examples/js/environments/RoomEnvironment.js` from jsdelivr in older files).
  - GSAP 3.13 + SplitText from cdnjs (`gsap/3.13.0/gsap.min.js`, `SplitText.min.js`).
  - Google Fonts only for fonts.
- Comparison pages use a "shell": tabs + a fake browser frame + three note cards under it. Tabs switch `.stage` sections; keys 1–4 switch tabs; `#hash` deep-links a tab.
- `portfolio-sketches.html` specifics:
  - Each `.stage` is a CSS size container (`container-type: size`); all layout uses `cqw` / `cqh` units measured as percentages from Eileen's sketches, so proportions hold at any size.
  - **One** three.js renderer (`W3`) draws the airplane window; its canvas is re-parented into the active tab's `.w-slot` on tab switch (`show(k)` → `W3.mount`).
  - Window geometry: layered `ShapeGeometry` bezels with holes + an `ExtrudeGeometry` inner bezel whose side walls are near-black (this produces the dark inner edge from her reference), glass = two planes cross-fading `CanvasTexture`s painted per destination (`paintGlass`, `SCN`, `cumulus`, `wing`). Group rotated `y ≈ 0.24` rad with light pointer parallax.
  - WELCOME / ABOARD: Jost 300 caps. A clipped duplicate (`.w-mask` > `.w-mask-in`) recolors the letters where they cross the glass (`--ov1` white over sky, `--ov2` per destination over the lower view; table `OV`).
  - Hover a ticket → `focus(id)` per stage: toggles `.on` on tickets, `W3.setScene`, `rollWord` (GSAP per-letter roll) on both word copies, "proj. 0X" tag (scramble text), tray color (`--tray`) and overlap colors.
  - Tickets: version A `.vt` component (CSS copied verbatim into each file). Sketch 2·tickets uses three **new** tickets (`tk2HTML`: grey slab / blue card / white line ticket) drawn to the sketch, by explicit request.
  - Wallet / passport objects (`.wal`, `.ppt`) are restored **exactly** from the first sketches version (fixed px sizes) by explicit request.
- Data is placeholder: arrays `P` (projects: id, n, title, kind, year, role, desc, colors c1/c2/t1/ton/t2/son, gfx type, scene, place, code, gate, tray) and `E` (experiments, in files that have the wallet page).

## 3. Files created or modified

| File | What it is | Published artifact |
|---|---|---|
| `portfolio-sketches.html` | **Current work.** 4 tabs built from Eileen's 3 sketches (sketch 2 in two versions). | https://claude.ai/artifact/D1vJx5B9faGCjkQRhThFsi |
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
   - three.js window from her reference panel; mirrored text inside the glass **removed**; shade lip **removed** (sketch shows open sky).
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

Clicks: passes / tk2 tickets → project pop-up (`openModal`); wallet / passport / nav → placeholder sheet (`openSheet`). Esc closes.

## 6. Unfinished tasks and next steps

- **Waiting on Eileen's choice** among the four sketch tabs (and any further visual feedback). Do not start the production build before she picks.
- Then: build the chosen layout as the real site — reuse the Wallet page and ID page from `portfolio.html` (functions `go`, `walletDetail`, `selectWallet`, `printInto`, `openLB`, ID markup), wire nav/objects to them, keep the project pop-up.
- Replace placeholder content (project names, summaries, colors, destinations, images, bio, links).
- Possibly use a real sky/clouds photo for the window glass if Eileen supplies one (she has a photo-like reference; current clouds are painted in canvas).
- Mobile layouts for the sketch tabs are only proportional scaling; the chosen direction needs a real phone layout.
- Optional: intro animation (GSAP split screen exists in `portfolio-grid-draft.html` / `portfolio.html`) if she still wants one for the final site.

## 7. Bugs, blockers, known issues

- The white/blue overlap copy of WELCOME/ABOARD is a flat CSS clip approximating the 3D-rotated glass; at extreme pointer positions the recolor edge can drift a few px. Parallax was reduced to keep it small (`rx/ry` lerp in `W3` loop).
- Painted clouds still look slightly "bubbly"; a photo texture would fix it.
- GSAP animations look slow/stuck in the Claude desktop Browser pane when it is hidden (throttled timers); they run normally in a real browser. Verify timing in a real browser.
- `portfolio-concepts.html` / `portfolio-directions.html` particle and older code is kept only as reference; B's particle window was disliked.
- No git history existed before this handoff; no GitHub remote is configured, and `gh` CLI is not installed on this machine.

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

Test checklist: each tab at ~1280×900; hover each ticket (window scene, word roll, tag, tray color, overlap color); click a ticket (pop-up), wallet/passport (sheet); Esc; console has no errors.

## 9. Important context and constraints

- User is Eileen Zhang (designer & developer). She gives terse, visual feedback, often with sketches/screenshots; follow sketches **exactly** (positions, proportions, shapes, colors) and don't add unrequested decoration.
- She asked to see interpretation first and wait for approval when a new direction comes in; for small fix lists, apply directly.
- Before presenting, verify every state in a browser preview and fix defects first (she was frustrated by low polish).
- Keep `portfolio-directions.html` unchanged (it is "the draft"). Keep version A's ticket design wherever passes appear unless told otherwise.
- Artifact rules: pages must be self-contained; only the allowed CDNs; no `alert/confirm`; images as data URIs or CSS/canvas.
- Fonts in current file: Jost (WELCOME/ABOARD), Inter Tight (UI/tickets), Instrument Serif (pop-up accent), Geist Mono (labels).
