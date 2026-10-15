import { pixelIn, pixelWord, type Pace } from "../lib/text-effects";

// The cobalt board (CobaltBoard.astro): its first message builds dot by dot, then every few seconds it swaps to the next,
// like a departures sign.
const SLOW: Pace = { out: 10, in: 16, ms: 45 };
const STAGGER = 260;

const board = document.querySelector<HTMLElement>(".pp-board");
const messages: [string, string][] = JSON.parse(board?.dataset.messages ?? "[]");
const lines = [...document.querySelectorAll<HTMLElement>(".pp-line")];

lines.forEach((line, i) =>
  setTimeout(() => {
    line.style.visibility = "visible"; // revealed and masked in one go, so it never flashes in full
    pixelIn([line], SLOW);
  }, i * STAGGER),
);

if (messages.length > 1 && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  let k = 0;
  setInterval(() => {
    k = (k + 1) % messages.length;
    lines.forEach((line, i) => setTimeout(() => pixelWord([line], messages[k][i], SLOW), i * STAGGER));
  }, 5200);
}
