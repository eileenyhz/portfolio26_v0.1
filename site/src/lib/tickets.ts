import type { MarkId, Project } from "../data/types";
import { rnd } from "./format";

/** CSS custom properties for a project's placeholder art. */
export const artVars = (p: Project): string => `--c1:${p.c1};--c2:${p.c2}`;

/** CSS custom properties for a project's ticket and stub. */
export const tkVars = (p: Project): string => `${artVars(p)};--t1:${p.t1};--ton:${p.ton};--t2:${p.t2};--son:${p.son}`;

/** The small drawing beside the project name: a different mark per project, always on a stem. */
export const MARK: Record<MarkId, string> = {
  star: `<path d="M16 0V66"/><path class="f" d="M16 22c1 9 3 11 13 12c-10 1-12 3-13 12c-1-9-3-11-13-12c10-1 12-3 13-12z"/>`,
  ring: `<path d="M16 0V24M16 44V66"/><circle cx="16" cy="34" r="10"/><path d="M3 34H29"/><circle class="f" cx="16" cy="34" r="2.6"/>`,
  diamond: `<path d="M16 0V22M16 46V66"/><path d="M16 22l12 12-12 12-12-12z"/><path class="f" d="M16 29l5 5-5 5-5-5z"/>`,
  aster: `<path d="M16 0V66"/><path d="M5 26l22 16M27 26L5 42M3 34h26"/>`,
};

/** A stacked (PDF417-like) barcode, drawn from a seed so each project keeps its own. */
export function pdfSVG(seed: number): string {
  const r = rnd(seed * 17 + 3);
  let d = "M0 0h2v23h-2zM98 0h2v23h-2z";
  for (let row = 0; row < 4; row++) {
    let x = 4;
    while (x < 95) {
      const w = 1 + ((r() * 3) | 0);
      if (r() < 0.56) d += `M${x} ${row * 6}h${Math.min(w, 95 - x)}v5h-${Math.min(w, 95 - x)}z`;
      x += w + (r() < 0.5 ? 1 : 0);
    }
  }
  return `<svg class="pdf" viewBox="0 0 100 23" preserveAspectRatio="none" shape-rendering="crispEdges" aria-hidden="true"><path d="${d}"/></svg>`;
}

/** How a ticket sets its name: one line per entry. */
export const tkLines = (p: Project): string[] => p.lines ?? p.title.split(" ");

/** The ticket name; names longer than seven letters shrink to fit beside the mark. */
export function tkName(p: Project): string {
  const l = tkLines(p);
  const n = Math.max(...l.map((x) => x.length));
  return `<span class="tk-name"${n > 7 ? ` style="font-size:${((13.7 * 7) / n).toFixed(2)}cqw"` : ""}>${l.join("<br>")}</span>`;
}

/** A project's picture: its own screens when it has them, the placeholder pattern otherwise. */
export function prevHTML(p: Project, cls: string): string {
  if (!p.prev) return `<span class="${cls} art art-${p.art}" style="${artVars(p)}"></span>`;
  const zoom = p.zoom ? ` style="transform:scale(${p.zoom[0]});transform-origin:${p.zoom[1]}"` : "";
  return `<span class="${cls} shot${p.prev.length > 1 ? " phones" : ""}">${p.prev.map((x) => `<img src="${x}" alt="" decoding="async"${zoom}>`).join("")}</span>`;
}

/** One boarding pass on the landing: it opens the project's case study. */
export function ticketHTML(p: Project): string {
  return `<button class="tk" data-open="${p.id}" data-p="${p.id}" style="${tkVars(p)};--nup:${tkLines(p).length > 1 ? 0 : 8.2}cqh" aria-label="${p.title}, ${p.kind}, ${p.date}. Open details">
    <span class="tk-hd"><span>${p.kind}</span><span>${p.date}</span></span>
    <span class="tk-top">${tkName(p)}<svg class="tk-mark" viewBox="0 0 32 66" aria-hidden="true">${MARK[p.mark]}</svg></span>
    <span class="tk-rule"></span>
    <span class="tk-role"><span>${p.role}</span></span>
    <span class="tk-desc">${p.desc}</span>
    ${prevHTML(p, "tk-prev")}
    <span class="tk-stub"><span class="st-f"><span class="sf-h"><span>Boarding stub</span><span>Seq 0${p.n}</span></span><span class="sf-codes"><b>EZA</b><i></i><b>${p.code}</b></span>${pdfSVG(+p.n)}</span></span>
  </button>`;
}
