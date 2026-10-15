/** The window's views: the welcome sky and one per project. */
export type ViewId = "sky" | "motif" | "shanhai" | "pixai" | "dreamin";

/** The small drawing beside a ticket's name. */
export type MarkId = "star" | "ring" | "diamond" | "aster";

export interface Project {
  id: string;
  /** Used in the case study's URL: /work/{slug}. */
  slug: string;
  /** The case study page's description for search results and link previews. */
  meta: string;
  /** Sequence number on the ticket, "01"… */
  n: string;
  title: string;
  /** How the name breaks on the ticket, one entry per line. */
  lines?: string[];
  /** The full name in the case study, when the ticket uses a short one. */
  long?: string;
  /** The two words over the window on hover. */
  hero?: [string, string];
  kind: string;
  date: string;
  year: string;
  role: string;
  mark: MarkId;
  desc: string;
  /** Placeholder art pattern: a–d. */
  art: string;
  c1: string;
  c2: string;
  /** Ticket colours: face, ink on face, stub, ink on stub. */
  t1: string;
  ton: string;
  t2: string;
  son: string;
  scene: ViewId;
  /** Three-letter airport-style code on the stub. */
  code: string;
  gate: string;
  /** The ticket's picture; one image, or two for a pair of phone screens. */
  prev?: string[];
  /** Picture zoom and focus point. */
  zoom?: [number, string];
  /** The case study's picture-panel background. */
  pv?: string;
  out?: string;
  /** A dark case-study sheet. */
  dark?: boolean;
}

/** A screen in a case study: label, image, optional inline style (collage placement). */
export type Shot = [label: string, src: string, style?: string];

export interface Step {
  when: string;
  step: string;
  pain: string;
  k: string;
  fix: string;
  why?: string;
  /** How its screens sit: phone screens side by side, or wide screens stacked. */
  fit: "phone" | "wide";
  shots: Shot[];
}

export type ExtraView =
  | { kind: "polaroid"; items: [src: string, label: string, level: number, percent: number][] }
  | { kind: "cut"; cap: string; items: [src: string, label: string][] }
  | { kind: "rows"; cap: string; rows: [src: string, label: string][][] };

export interface Extra {
  step: string;
  note: string;
  view: ExtraView;
}

export interface CaseStudy {
  lede: string;
  /** Label and value; values may hold inline HTML. */
  facts: [string, string][];
  cover: { cls: string; shots: Shot[] };
  pain: string;
  painNote: string;
  sol: Step[];
  extras: Extra[];
}

export interface WalletEntry {
  id: string;
  n: string;
  title: string;
  kind: string;
  date: string;
  /** Which card art: 1–5. */
  d: 1 | 2 | 3 | 4 | 5;
  /** Card colour and its ink. */
  cc: string;
  ct: string;
  client: string;
  tools: string;
  hours: number;
  iters: number;
  coffee: number;
  imgs: number;
  note: string;
  desc: string;
  link?: string;
}

/** The window's sky for one view: gradient, cloud light and shade, light direction. */
export interface Palette {
  top: string;
  mid: string;
  hor: string;
  lit: string;
  shade: string;
  dir: [number, number, number];
}
