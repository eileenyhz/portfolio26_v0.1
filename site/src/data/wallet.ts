import type { WalletEntry } from "./types";

// Side projects, experiments and commissions on the Wallet page. Copy is placeholder for now.
export const WALLET: WalletEntry[] = [
  { id: "e1", n: "01", title: "Type Study", kind: "Type design", date: "03/2026", d: 1, cc: "#3846a8", ct: "#e9ecff", client: "Personal", tools: "Figma, Glyphs", hours: 14, iters: 9, coffee: 5, imgs: 6, note: "This one is on me :)", desc: "Placeholder: a display typeface drawn from airport signage. Six specimen sheets." },
  { id: "e2", n: "02", title: "Shader Toy", kind: "Generative code", date: "01/2026", d: 2, cc: "#c4583c", ct: "#fff1e8", client: "Personal", tools: "three.js, GLSL", hours: 22, iters: 31, coffee: 11, imgs: 4, note: "Worth every bug.", desc: "Placeholder: a small shader study. Stills from four of the variations.", link: "Open live demo ↗" },
  { id: "e3", n: "03", title: "Tiny Tool", kind: "Web tool", date: "11/2025", d: 3, cc: "#dcdee3", ct: "#1e2024", client: "Personal", tools: "Svelte", hours: 9, iters: 4, coffee: 3, imgs: 3, note: "Made in one weekend!", desc: "Placeholder: a one-weekend utility. Three screenshots and a link to try it.", link: "Try the tool ↗" },
  { id: "e4", n: "04", title: "Printed Zine", kind: "Print", date: "08/2025", d: 4, cc: "#5e7a4c", ct: "#eef4e2", client: "Self-published", tools: "InDesign, Riso", hours: 30, iters: 6, coffee: 14, imgs: 8, note: "Ink still drying", desc: "Placeholder: a 16-page risograph zine. Eight spreads." },
  { id: "e5", n: "05", title: "Art Commissions", kind: "Digital art", date: "2024–26", d: 5, cc: "#1d1c22", ct: "#f2e19a", client: "Various clients", tools: "Procreate, Photoshop", hours: 120, iters: 12, coffee: 40, imgs: 12, note: "Thank you, clients!", desc: "Placeholder: twelve commissioned pieces. Click any piece to view it large." }
];
