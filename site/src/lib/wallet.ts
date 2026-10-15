import type { WalletEntry } from "../data/types";
import { WALLET } from "../data/wallet";
import { pad } from "./format";

const NFC = `<svg class="wc-nfc" viewBox="0 0 12 16" aria-hidden="true"><path d="M2 5.5a3.6 3.6 0 0 1 0 5"/><path d="M5.5 3.5a7 7 0 0 1 0 9"/><path d="M9 1.5a10.5 10.5 0 0 1 0 13"/></svg>`;
const STAR = `<svg class="a-star" viewBox="0 0 40 40"><path d="M20 2c1.4 11 5 15.6 16 18c-11 2.4-14.6 7-16 18c-1.4-11-5-15.6-16-18c11-2.4 14.6-7 16-18z"/><path d="M20 10c.8 6 2.6 8.6 9 10c-6.4 1.4-8.2 4-9 10c-.8-6-2.6-8.6-9-10c6.4-1.4 8.2-4 9-10z"/><path d="M20 0v40M0 20h40" stroke-dasharray="1 2"/></svg>`;
const ART: Record<WalletEntry["d"], string> = {
  1: `<i class="a-glyph">Ag</i>`,
  2: `<i class="a-shade"></i>`,
  3: `<i class="a-grid"></i><i class="a-haz"></i>`,
  4: `<i class="a-riso"></i><i class="a-dots"></i>`,
  5: `<i class="a-frame"></i>${STAR}`,
};
/** The binder clip that holds the receipt. */
export const BCLIP = `<svg viewBox="0 0 60 46" aria-hidden="true"><path d="M17 20L21 3.5Q30 .5 39 3.5L43 20" fill="none" stroke="#9aa0aa" stroke-width="2.4" stroke-linejoin="round"/><path d="M5 18H55L51 44H9Z" fill="#1d1f24"/><path d="M8 21H52" stroke="#4a4e57" stroke-width="1.4"/></svg>`;

/** One card in the wallet stack. */
export const cardHTML = (
  e: WalletEntry,
): string => `<button class="wc" data-wcard="${e.id}" style="--cc:${e.cc};--ct:${e.ct}" aria-label="${e.kind}: ${e.title}" aria-pressed="false">
    <span class="wc-face"><span class="wc-art">${ART[e.d]}</span>
      <span class="wc-type">${e.kind}</span><span class="wc-chip"></span>${NFC}
      <span class="wc-det">${e.tools}</span><span class="wc-date">${e.date}</span></span>
  </button>`;

const ASPECTS = [1, 0.78, 1.3, 0.72, 1.12, 1.5, 0.86];
/** A placeholder piece's shape and colours, varied by its place in the set. */
export function thumbStyle(e: WalletEntry, i: number): { ar: number; cls: string; style: string } {
  const ar = ASPECTS[(i * 3 + parseInt(e.n, 10)) % ASPECTS.length];
  const swap = i % 2;
  return { ar, cls: "abcd"[i % 4], style: `--c1:${swap ? e.ct : e.cc};--c2:${swap ? e.cc : e.ct}` };
}

/** The receipt that prints for the chosen card, dated now. */
export function receiptHTML(e: WalletEntry, now = new Date()): string {
  const date = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
  const time = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  const stars = "* ".repeat(40);
  return `<div class="receipt" role="group" aria-label="Receipt for ${e.title}" style="--hl:${e.cc};--hlt:${e.ct}">
    <h3>${e.title}</h3>
    <div class="tag">Receipt · Card ${e.n}</div>
    <div>${date} · ${time}<br>Made ${e.date}</div>
    <div class="row small" style="margin-top:4cqw"><span>Item</span><span>Qty</span></div>
    <div class="stars">${stars}</div>
    <div class="row"><span>Pieces</span><span>${e.imgs}</span></div>
    <div class="row"><span>Hours spent</span><span>${e.hours}</span></div>
    <div class="row"><span>Iterations</span><span>${e.iters}</span></div>
    <div class="row"><span>Cups of coffee</span><span>${e.coffee}</span></div>
    <div class="stars">${stars}</div>
    <div class="row small"><span>Client</span><span>${e.client}</span></div>
    <div class="row small"><span>Made with</span><span>${e.tools}</span></div>
    <div class="row small"><span>Total</span><span>$ 0.00</span></div>
    <div class="row small"><span>Paid with</span><span>EZ card •••• 00${e.n}</span></div>
    <div class="stars">${stars}</div>
    <div class="thanks">Thank you for visiting</div>
    <div class="bars rc-bars"></div>
  </div>`;
}

/** The chosen card's file: title, details and its pieces. */
export function fileHTML(e: WalletEntry): string {
  const photos = Array.from({ length: e.imgs }, (_, i) => {
    const t = thumbStyle(e, i);
    return `<button class="ph-i" data-th="${e.id}:${i}" aria-label="View piece ${i + 1} of ${e.imgs}"><span class="im art art-${t.cls}" style="${t.style};aspect-ratio:${t.ar}"></span><span class="cap mono"><span>${pad(i + 1)}</span><span>${e.date}</span></span></button>`;
  }).join("");
  return `<div class="fz">
      <div class="fz-k mono"><span>Card ${e.n} / ${pad(WALLET.length)}</span><i></i><span>${e.kind}</span></div>
      <h3 class="fz-t" data-flap="${e.title.toUpperCase()}">${e.title}</h3>
      <p class="fz-d">${e.desc}</p>
      <dl class="fz-m"><div><dt>Made</dt><dd>${e.date}</dd></div><div><dt>For</dt><dd>${e.client}</dd></div><div><dt>Tools</dt><dd>${e.tools}</dd></div><div><dt>Pieces</dt><dd>${pad(e.imgs)}</dd></div></dl>
      ${e.link ? `<span class="fz-l mono">${e.link}</span>` : ""}
    </div>
    <div class="ph-h mono"><span>Photos</span><span>${pad(e.imgs)} pieces · click to enlarge</span></div>
    <div class="ph">${photos}</div>`;
}

/** The full-screen viewer for one piece, with a strip of the others. */
export function lightboxHTML(e: WalletEntry, i: number): string {
  const t = thumbStyle(e, i);
  const strip = Array.from({ length: e.imgs }, (_, j) => {
    const s = thumbStyle(e, j);
    return `<button class="art art-${s.cls}" style="${s.style}" data-lbgo="${j}" aria-label="Piece ${j + 1}" aria-current="${j === i}"></button>`;
  }).join("");
  return `<div class="lb-top mono"><span>${e.title} · ${pad(i + 1)} / ${pad(e.imgs)}</span><button data-lbclose aria-label="Close viewer">×</button></div>
    <div class="lb-stage"><button data-lbnav="-1" aria-label="Previous piece">←</button>
      <div class="lb-img art art-${t.cls}" style="${t.style};aspect-ratio:${t.ar}" role="img" aria-label="${e.title}, piece ${i + 1}"></div>
      <button data-lbnav="1" aria-label="Next piece">→</button></div>
    <div class="lb-bot mono"><span>Placeholder caption: client, date, one line of context</span>
      <div class="lb-strip">${strip}</div></div>`;
}
