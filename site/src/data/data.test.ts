import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { CASE_STUDIES } from "./case-studies";
import { PROJECTS } from "./projects";
import { LETTER_COLOURS, PALETTES } from "./views";
import { WALLET } from "./wallet";

const PUBLIC = fileURLToPath(new URL("../../public", import.meta.url));

/** Every "/img/…" path anywhere inside a value. */
function images(v: unknown): string[] {
  if (typeof v === "string") return v.startsWith("/img/") ? [v] : [];
  if (Array.isArray(v)) return v.flatMap(images);
  if (v && typeof v === "object") return Object.values(v).flatMap(images);
  return [];
}

describe("projects", () => {
  it("have unique ids", () => {
    expect(new Set(PROJECTS.map((p) => p.id)).size).toBe(PROJECTS.length);
  });

  it("have unique, URL-safe slugs", () => {
    const slugs = PROJECTS.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of slugs) expect(s).toMatch(/^[a-z0-9-]+$/);
  });

  it("put the flagship first, then the newest first", () => {
    expect(PROJECTS[0].slug).toBe("motif");
    const rest = PROJECTS.slice(1).map((p) => Number(p.year));
    expect(rest).toEqual([...rest].sort((a, b) => b - a));
  });

  it("number their tickets in order", () => {
    expect(PROJECTS.map((p) => p.n)).toEqual(PROJECTS.map((_, i) => String(i + 1).padStart(2, "0")));
  });

  it("each have a sky and letter colours for their view", () => {
    for (const p of PROJECTS) {
      expect(PALETTES[p.scene]).toBeDefined();
      expect(LETTER_COLOURS[p.scene]).toBeDefined();
    }
  });
});

describe("case studies", () => {
  it("each belong to a project", () => {
    const ids = PROJECTS.map((p) => p.id);
    for (const id of Object.keys(CASE_STUDIES)) expect(ids).toContain(id);
  });

  it("have at least one step with screens", () => {
    for (const c of Object.values(CASE_STUDIES)) {
      expect(c.sol.length).toBeGreaterThan(0);
      for (const s of c.sol) expect(s.shots.length).toBeGreaterThan(0);
    }
  });
});

describe("images", () => {
  const all = [...new Set([...images(PROJECTS), ...images(CASE_STUDIES)])];

  it("are referenced at all", () => {
    expect(all.length).toBeGreaterThan(0);
  });

  it.each(all)("%s exists in public/", (src) => {
    expect(existsSync(`${PUBLIC}${src}`)).toBe(true);
  });
});

describe("link previews", () => {
  it.each(["home", ...PROJECTS.map((p) => `work-${p.slug}`)])("og/%s.jpg exists (npm run og)", (name) => {
    expect(existsSync(`${PUBLIC}/og/${name}.jpg`)).toBe(true);
  });

  it("each project has its own description", () => {
    const metas = PROJECTS.map((p) => p.meta);
    expect(new Set(metas).size).toBe(metas.length);
    for (const m of metas) expect(m.length).toBeLessThanOrEqual(160);
  });
});

describe("icons", () => {
  it.each(["favicon.ico", "apple-touch-icon.png"])("%s exists (npm run icons)", (name) => {
    expect(existsSync(`${PUBLIC}/${name}`)).toBe(true);
  });
});

describe("palettes", () => {
  it("use six-digit hex colours", () => {
    for (const p of Object.values(PALETTES))
      for (const c of [p.top, p.mid, p.hor, p.lit, p.shade]) expect(c).toMatch(/^#[0-9a-f]{6}$/i);
  });
});

describe("wallet", () => {
  it("has unique ids and numbers", () => {
    expect(new Set(WALLET.map((e) => e.id)).size).toBe(WALLET.length);
    expect(new Set(WALLET.map((e) => e.n)).size).toBe(WALLET.length);
  });

  it("has at least one piece per card", () => {
    for (const e of WALLET) expect(e.imgs).toBeGreaterThan(0);
  });
});
