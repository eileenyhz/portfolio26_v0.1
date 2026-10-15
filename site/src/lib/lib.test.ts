import { describe, expect, it } from "vitest";
import { PROJECTS } from "../data/projects";
import type { Project } from "../data/types";
import { WALLET } from "../data/wallet";
import { caseBody, sheetHTML } from "./case-study";
import { chars, pad, rnd } from "./format";
import { pdfSVG, prevHTML, ticketHTML, tkName } from "./tickets";
import { lightboxHTML, receiptHTML } from "./wallet";

const [motif, shanhai] = PROJECTS;
const bare: Project = { ...motif, id: "px", slug: "px", prev: undefined, lines: undefined, title: "A Very Longname" };

describe("format", () => {
  it("pads to two digits", () => {
    expect(pad(4)).toBe("04");
    expect(pad(12)).toBe("12");
  });

  it("repeats a seeded sequence within 0–1", () => {
    const a = rnd(7);
    const b = rnd(7);
    const xs = Array.from({ length: 50 }, a);
    expect(Array.from({ length: 50 }, b)).toEqual(xs);
    for (const x of xs) expect(x > 0 && x < 1).toBe(true);
  });

  it("keeps spaces as their own characters", () => {
    expect(chars("A B")).toBe('<span class="ch">A</span><span class="ch">&nbsp;</span><span class="ch">B</span>');
  });
});

describe("tickets", () => {
  it("draw the same barcode for the same seed and a different one for another", () => {
    expect(pdfSVG(1)).toBe(pdfSVG(1));
    expect(pdfSVG(1)).not.toBe(pdfSVG(2));
  });

  it("shrink names longer than seven letters", () => {
    expect(tkName({ ...bare, lines: ["Motif"] })).not.toContain("font-size");
    expect(tkName({ ...bare, lines: ["Longername"] })).toContain("font-size:9.59cqw");
  });

  it("show the placeholder pattern when there is no picture", () => {
    expect(prevHTML(bare, "tk-prev")).toContain(`art-${bare.art}`);
  });

  it("set two pictures as a pair of phone screens", () => {
    const pixai = PROJECTS.find((p) => p.slug === "pixai") as Project;
    expect(prevHTML(pixai, "tk-prev")).toContain("shot phones");
  });

  it("open their project", () => {
    expect(ticketHTML(motif)).toContain(`data-open="${motif.id}"`);
  });
});

describe("case study sheet", () => {
  const html = sheetHTML(motif, shanhai);

  it("links to the next flight by its clean URL", () => {
    expect(html).toContain(`href="/work/${shanhai.slug}/"`);
    expect(html).toContain(`Next flight: ${shanhai.title} →`);
  });

  it("has All flights with a back arrow and no previous-flight button", () => {
    expect(html).toContain('<span aria-hidden="true">←</span> All flights');
    expect(html).not.toContain("mc-prev");
  });

  it("is a labelled modal dialog", () => {
    expect(html).toContain('role="dialog"');
    expect(html).toContain(`aria-label="${motif.title}"`);
  });

  it("has one picture per step plus the cover", () => {
    const body = caseBody(motif);
    const steps = body.match(/data-step="/g)?.length ?? 0;
    const views = body.split('<div class="mc-view">')[1].match(/<figure class="/g)?.length ?? 0;
    expect(steps).toBeGreaterThan(0);
    expect(views).toBe(steps + 1);
  });

  it("falls back to a placeholder without a case study", () => {
    expect(caseBody(bare)).toContain("Coming soon");
  });
});

describe("wallet", () => {
  const e = WALLET[0];

  it("prints the receipt with the card's numbers and the given time", () => {
    const html = receiptHTML(e, new Date(2026, 9, 14, 9, 5));
    expect(html).toContain("14 OCT 2026 · 09:05");
    expect(html).toContain(`<span>Hours spent</span><span>${e.hours}</span>`);
    expect(html).toContain(`EZ card •••• 00${e.n}`);
  });

  it("marks the piece being viewed in the strip", () => {
    const html = lightboxHTML(e, 2);
    expect(html.match(/aria-current="true"/g)).toHaveLength(1);
    expect(html).toContain('data-lbgo="2" aria-label="Piece 3" aria-current="true"');
  });
});
