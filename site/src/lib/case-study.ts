import { CASE_STUDIES } from "../data/case-studies";
import type { Extra, Project, Shot } from "../data/types";
import { pad } from "./format";
import { artVars, tkVars } from "./tickets";

// pictures load when they are first shown (the cover, shown first, loads straight away)
const img = (src: string, alt: string, style?: string, eager = false) =>
  `<img src="${src}" alt="${alt}" decoding="async"${eager ? "" : ' loading="lazy"'}${style ? ` style="${style}"` : ""}>`;
const facts = (f: [string, string][]) =>
  `<dl class="mc-facts">${f.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join("")}</dl>`;
const shots = (v: { shots: Shot[] }, cls: string, eager = false) =>
  `<figure class="${cls}"><div class="mc-shots">${v.shots.map(([l, src, at]) => img(src, l, at, eager)).join("")}</div><figcaption>${v.shots.map(([l]) => l).join(" · ")}</figcaption></figure>`;

// the extra visual work: the app's polaroids, a grid of cut-out drawings, or rows of sheets
function extra({ step, view: v }: Extra): string {
  if (v.kind === "polaroid")
    return `<figure class="pols"><div class="mc-shots">${v.items
      .map(
        ([src, l, lv, pc]) =>
          `<div class="pol">${img(src, `#${l}`)}<p><span>#${l}</span><small>lv.${lv}</small></p><i style="--p:${pc}%"></i></div>`,
      )
      .join("")}</div><figcaption>${step}</figcaption></figure>`;
  if (v.kind === "cut")
    return `<figure class="art cut"><div class="mc-shots">${v.items.map(([src, l]) => img(src, l)).join("")}</div><figcaption>${v.cap}</figcaption></figure>`;
  return `<figure class="rows"><div class="mc-shots">${v.rows.map((r) => `<div class="row">${r.map(([src, l]) => img(src, l)).join("")}</div>`).join("")}</div><figcaption>${v.cap}</figcaption></figure>`;
}

/** The text column and the picture panel of a case study; a placeholder when it has none yet. */
export function caseBody(p: Project): string {
  const c = CASE_STUDIES[p.id];
  const head = `<div class="mc-hd"><span>${p.kind}</span><span>${p.date}</span></div><h2 class="mc-name">${p.long ?? (p.lines ?? [p.title]).join(" ")}</h2>`;
  if (!c)
    return `<div class="mc-text">${head}<p class="mc-lede">${p.desc}</p>${facts([
      ["Role", p.role],
      ["Type", p.kind],
      ["Date", p.date],
    ])}
      <h4 class="mc-k">Case study</h4><p>Placeholder. Coming soon.</p></div>
    <div class="mc-view"><figure class="on mc-ph art art-${p.art}" style="${artVars(p)}"></figure></div>`;
  // the picture panel: the cover that sets the mood, then one picture per step, then the visual work
  const views = [shots(c.cover, c.cover.cls, true), ...c.sol.map((s) => shots(s, s.fit)), ...c.extras.map(extra)];
  const steps = [
    ...c.sol.map((s, i) => ({
      n: pad(i + 1),
      label: `${s.when} · ${s.step}`,
      body: `<p class="mc-mute">“${s.pain}”</p><p><b>${s.k}</b> ${s.fix}</p>${s.why ? `<p class="mc-why">${s.why}</p>` : ""}`,
    })),
    ...c.extras.map((x) => ({ n: "+", label: x.step, body: `<p>${x.note}</p>` })),
  ];
  return `<div class="mc-text">
      ${head}
      <p class="mc-lede">${c.lede}</p>
      <div class="mc-cover">${views[0]}</div>
      ${facts(c.facts)}
      <h4 class="mc-k">The problem</h4>
      <p class="mc-pain">${c.pain}</p><p class="mc-meta">${c.painNote}</p>
      <h4 class="mc-k">How I solved it</h4>
      <ol class="mc-steps">${steps
        .map(
          (
            s,
            i,
          ) => `<li><button data-step="${i + 1}" aria-expanded="false"><span>${s.n}</span>${s.label}<i aria-hidden="true"></i></button>
        <div class="mc-detail">${s.body}<div class="mc-inline">${views[i + 1]}</div></div></li>`,
        )
        .join("")}</ol>
    </div>
    <div class="mc-view">${views.map((v, i) => (i ? v : v.replace('<figure class="', '<figure class="on '))).join("")}</div>`;
}

/** The whole case study as one sheet, with All flights and the next flight in its stub. */
export function sheetHTML(p: Project, next: Project): string {
  return `<article class="mdl-card" data-case="${p.id}" role="dialog" aria-modal="true" aria-label="${p.title}" tabindex="-1">
      <div class="mc-pass${p.dark ? " dk" : ""}" style="${tkVars(p)};--pv:${p.pv ?? "#f0efeb"}">
        <button class="mdl-x" data-mclose aria-label="Close">×</button>
        <div class="mc-grid">${caseBody(p)}</div>
        <footer class="mc-stub">
          <button class="mc-home" data-mclose><span aria-hidden="true">←</span> All flights</button>
          <div class="mc-route"><span class="mc-k">Boarding stub · Seq 0${p.n}</span><b>EZA<i></i>${p.code}</b></div>
          <span class="mc-go"><a class="mc-next" href="/work/${next.slug}/" data-open="${next.id}">Next flight: ${next.title} →</a></span>
        </footer>
      </div>
    </article>`;
}
