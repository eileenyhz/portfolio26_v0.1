/** Two-digit numbers: 1 → "01". */
export const pad = (n: number): string => String(n).padStart(2, "0");

/** A small seeded random generator (Park–Miller), so drawn details like barcodes stay the same on every build. */
export function rnd(seed: number): () => number {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

/** Splits text into one span per character (spaces kept), for the dot-by-dot word swaps. */
export const chars = (t: string): string =>
  [...t].map((c) => `<span class="ch">${c === " " ? "&nbsp;" : c}</span>`).join("");
