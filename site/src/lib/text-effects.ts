import { chars } from "./format";

const reduce = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const GLYPHS = "abcdefghijklmnopqrstuvwxyz0123456789";
// the latest run per element, so a newer effect cancels an older one
const runs = new WeakMap<Element, number>();
const next = (el: Element) => {
  const t = (runs.get(el) ?? 0) + 1;
  runs.set(el, t);
  return t;
};

/** Text settles letter by letter out of random glyphs, like a split-flap board. */
export function scramble(el: HTMLElement, text: string): void {
  if (reduce()) {
    el.textContent = text;
    return;
  }
  const start = performance.now();
  const per = 28;
  const token = next(el);
  (function tick(now: number) {
    if (runs.get(el) !== token) return;
    const k = now - start;
    let out = "";
    for (let i = 0; i < text.length; i++)
      out += " .·→".includes(text[i]) || k > i * per + 140 ? text[i] : GLYPHS[(Math.random() * GLYPHS.length) | 0];
    el.textContent = out;
    if (k < text.length * per + 170) requestAnimationFrame(tick);
    else el.textContent = text;
  })(performance.now());
}

/** Every element marked data-flap scrambles into its text, one after another. */
export function flapAll(root: ParentNode): void {
  root
    .querySelectorAll<HTMLElement>("[data-flap]")
    .forEach((el, i) => setTimeout(() => scramble(el, el.dataset.flap ?? ""), i * 60));
}

interface DotGrid {
  p: number;
  x: number;
  y: number;
  cols: number;
  rows: number;
}

let maskCanvas: HTMLCanvasElement | null = null;
function pixelMask(w: number, h: number, g0: DotGrid, order: number[], shown: number): string {
  const cv = (maskCanvas ??= document.createElement("canvas"));
  const dpr = Math.min(devicePixelRatio || 1, 2);
  cv.width = Math.ceil(w * dpr);
  cv.height = Math.ceil(h * dpr);
  const g = cv.getContext("2d");
  if (!g) return "";
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.clearRect(0, 0, w, h);
  g.fillStyle = "#000";
  for (let i = 0; i < shown; i++) {
    const k = order[i];
    g.fillRect(g0.x + (k % g0.cols) * g0.p, g0.y + ((k / g0.cols) | 0) * g0.p, g0.p, g0.p);
  }
  return cv.toDataURL();
}

// Doto is drawn on a 0.1em grid (each letter six dots wide); mask cells on the letters' own grid switch whole dots
function dotGrid(el: HTMLElement): DotGrid {
  const p = parseFloat(getComputedStyle(el).fontSize) * 0.1;
  const box = el.getBoundingClientRect();
  const first = el.querySelector(".ch");
  const mark = document.createElement("i");
  mark.style.cssText = "display:inline-block;width:0;height:0;vertical-align:baseline";
  el.appendChild(mark);
  const ox = (first ? first.getBoundingClientRect().left : box.left) - box.left;
  const oy = mark.getBoundingClientRect().top - box.top;
  mark.remove();
  const x = (ox % p) - p;
  const y = (oy % p) - p;
  return { p, x, y, cols: Math.ceil((el.offsetWidth - x) / p), rows: Math.ceil((el.offsetHeight - y) / p) };
}

/** How fast a pixel dissolve runs: the steps to break a word up, the steps to build one, and the time per step. */
export interface Pace {
  out: number;
  in: number;
  ms: number;
}
/** The landing's quick swap (about a quarter of a second). */
const QUICK: Pace = { out: 4, in: 6, ms: 22 };

type MaskStyle = CSSStyleDeclaration & { webkitMaskImage: string; webkitMaskSize: string; webkitMaskRepeat: string };
function setMask(els: HTMLElement[], url: string | null, w = 0, h = 0): void {
  els.forEach((e) => {
    const s = e.style as MaskStyle;
    s.webkitMaskImage = s.maskImage = url ? `url(${url})` : "";
    s.webkitMaskSize = s.maskSize = url ? `${w}px ${h}px` : "";
    s.webkitMaskRepeat = s.maskRepeat = url ? "no-repeat" : "";
  });
}

/** Shows (or hides) the first element's dots in a random order over `steps` steps; all elements share one mask. */
function dissolve(els: HTMLElement[], token: number, out: boolean, steps: number, ms: number, done: () => void): void {
  const el = els[0];
  const w = el.offsetWidth;
  const h = el.offsetHeight;
  const grid = dotGrid(el);
  const n = grid.cols * grid.rows;
  const order = [...Array(n).keys()];
  for (let i = n - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [order[i], order[j]] = [order[j], order[i]];
  }
  let i = 0;
  (function tick() {
    if (runs.get(el) !== token) return;
    i++;
    const f = i / steps;
    setMask(els, pixelMask(w, h, grid, order, Math.round(n * (out ? 1 - f : f))), w, h);
    if (i < steps) setTimeout(tick, ms);
    else done();
  })();
}

/**
 * Changes a word with a pixel dissolve: it breaks up dot by dot and the new word builds up the same way. All the given
 * elements (the word and its copy over the glass) share one mask. Timed with setTimeout so it always finishes.
 */
export function pixelWord(els: HTMLElement[], text: string, pace: Pace = QUICK): void {
  const el = els[0];
  if (!el || el.dataset.t === text) return;
  const token = next(el);
  els.forEach((e) => (e.dataset.t = text));
  if (reduce()) {
    els.forEach((e) => (e.innerHTML = chars(text)));
    return;
  }
  dissolve(els, token, true, pace.out, pace.ms, () => {
    els.forEach((e) => (e.innerHTML = chars(text)));
    dissolve(els, token, false, pace.in, pace.ms, () => {
      if (runs.get(el) === token) setMask(els, null);
    });
  });
}

/** Builds the words already in the elements dot by dot, from nothing. */
export function pixelIn(els: HTMLElement[], pace: Pace = QUICK): void {
  const el = els[0];
  if (!el || reduce()) return;
  const token = next(el);
  setMask(els, pixelMask(el.offsetWidth, el.offsetHeight, dotGrid(el), [], 0), el.offsetWidth, el.offsetHeight);
  dissolve(els, token, false, pace.in, pace.ms, () => {
    if (runs.get(el) === token) setMask(els, null);
  });
}
