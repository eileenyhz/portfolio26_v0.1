import type { Palette, ViewId } from "./types";

/** The sky per view: the painted scenes' palettes, as sky and cloud colours; dir is where the light comes from. */
export const PALETTES: Record<ViewId, Palette> = {
  sky: { top: "#3d69c0", mid: "#86a6e1", hor: "#aac2ee", lit: "#ffffff", shade: "#a9b6d8", dir: [-0.75, 0.5, 0.05] },
  motif: { top: "#465bcf", mid: "#a3a5ec", hor: "#ffd0b4", lit: "#fff2e6", shade: "#a59fd9", dir: [-0.6, 0.35, -0.5] },
  shanhai: { top: "#efe4cf", mid: "#f4ecdc", hor: "#f7f0e3", lit: "#fffaf2", shade: "#a3b09f", dir: [0.5, 0.5, -0.3] },
  pixai: { top: "#6e58d8", mid: "#b79ef0", hor: "#f6c6e6", lit: "#fff0f8", shade: "#9a83e8", dir: [-0.5, 0.4, -0.4] },
  dreamin: { top: "#121842", mid: "#232c66", hor: "#34428a", lit: "#c9d3f2", shade: "#56639f", dir: [0.4, 0.55, -0.2] },
};

/** Letters over the glass, per view: the top word sits on the sky, the lower word on the clouds. */
export const LETTER_COLOURS: Record<ViewId, [top: string, lower: string]> = {
  sky: ["#ffffff", "#2c5cc0"],
  motif: ["#ffffff", "#465bcf"],
  shanhai: ["#1d1b18", "#b5432f"],
  pixai: ["#ffffff", "#6e58d8"],
  dreamin: ["#ffffff", "#f2a65a"],
};
