import { PROJECTS } from "../data/projects";
import { LETTER_COLOURS } from "../data/views";
import { sheetHTML } from "../lib/case-study";
import { pixelWord, scramble } from "../lib/text-effects";
import { $paused, $view } from "../stores/window";

const reduce = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const stage = document.getElementById("stage") as HTMLElement;
const mdl = stage.querySelector<HTMLElement>(".mdl") as HTMLElement;
const byId = (id: string) => PROJECTS.find((p) => p.id === id);
const bySlug = (slug: string) => PROJECTS.find((p) => p.slug === slug);
const HOME_TITLE = document.title;

/* ---------- hover: the view, the words and the tag follow the hovered ticket ---------- */
let current = "~";
function focus(id: string): void {
  if (id === current) return;
  current = id;
  const p = byId(id);
  stage.querySelectorAll<HTMLElement>(".deck .tk").forEach((t) => t.classList.toggle("on", t.dataset.p === id));
  $view.set(p ? p.scene : "sky");
  const [a, ...rest] = p ? (p.hero ?? p.title.toUpperCase().split(" ")) : ["WELCOME", "ABOARD"];
  pixelWord([...stage.querySelectorAll<HTMLElement>(".w1")], a);
  pixelWord([...stage.querySelectorAll<HTMLElement>(".w2")], rest.join(" ") || a);
  const tag = stage.querySelector<HTMLElement>(".w-tag");
  const tagText = tag?.querySelector<HTMLElement>(".tagt");
  if (tag && tagText) {
    if (p) {
      tag.classList.add("on");
      scramble(tagText, `EZ${p.n} · ${p.code}`);
    } else tag.classList.remove("on");
  }
  const [top, lower] = LETTER_COLOURS[p ? p.scene : "sky"];
  stage.style.setProperty("--ov1", top);
  stage.style.setProperty("--ov2", lower);
}
const covered = () => !mdl.hidden;
stage.addEventListener("pointerover", (e) => {
  if (covered()) return;
  const t = (e.target as Element).closest<HTMLElement>("[data-p]");
  focus(t?.dataset.p ?? "");
});
stage.addEventListener("pointerleave", () => focus(""));
stage.addEventListener("focusin", (e) => {
  const t = (e.target as Element).closest<HTMLElement>("[data-p]");
  if (t?.dataset.p && !covered()) focus(t.dataset.p);
});

/* ---------- the case study: one sheet over the landing, at its own URL (/work/{slug}/) ---------- */
let tour: { t: number } | null = null;
function stopTour(): void {
  if (tour) clearTimeout(tour.t);
  tour = null;
}
/** Shows the cover (0) or a step (1…) in the picture panel and opens that step in the text. */
function showStep(card: HTMLElement, k: number): void {
  card.querySelectorAll(".mc-steps li").forEach((li, j) => {
    li.classList.remove("tour");
    li.classList.toggle("on", j + 1 === k);
    li.firstElementChild?.setAttribute("aria-expanded", String(j + 1 === k));
  });
  card.querySelectorAll(".mc-view > figure").forEach((f, j) => f.classList.toggle("on", j === k));
  // keep the opened step in sight inside the text column
  const box = card.querySelector<HTMLElement>(".mc-text");
  const li = k ? card.querySelectorAll<HTMLElement>(".mc-steps li")[k - 1] : null;
  if (box && li && box.scrollHeight > box.clientHeight) {
    const end = li.offsetTop + li.offsetHeight + 16;
    if (end > box.scrollTop + box.clientHeight)
      box.scrollTo({ top: end - box.clientHeight, behavior: reduce() ? "auto" : "smooth" });
  }
}
/** During the tour: shows the cover (0) or a step's picture (1…) and marks that step, without opening its text. */
function showPicture(card: HTMLElement, k: number): void {
  card.querySelectorAll(".mc-steps li").forEach((li, j) => li.classList.toggle("tour", j + 1 === k));
  card.querySelectorAll(".mc-view > figure").forEach((f, j) => f.classList.toggle("on", j === k));
}
/**
 * The tour: the picture panel moves from the cover through the steps on its own, so the sheet shows its work without a
 * click. It never touches the text, and any sign of reading or choosing ends it: a click, a scroll, a key, or the pointer
 * moving onto the text.
 */
function startTour(card: HTMLElement): void {
  stopTour();
  const view = card.querySelector<HTMLElement>(".mc-view");
  const n = card.querySelectorAll(".mc-view > figure").length;
  if (reduce() || n < 2 || !view?.offsetParent) return; // phones, reduced motion and placeholders keep still
  let k = 0;
  const next = () => {
    k = (k + 1) % n;
    showPicture(card, k);
    if (tour) tour.t = window.setTimeout(next, k ? 8000 : 5000);
  };
  tour = { t: window.setTimeout(next, 5000) };
  for (const type of ["pointerdown", "wheel", "keydown"])
    card.addEventListener(type, stopTour, { once: true, passive: true });
  const text = card.querySelector(".mc-text");
  text?.addEventListener("pointerenter", stopTour, { once: true });
  text?.addEventListener("scroll", stopTour, { once: true, passive: true });
}

/* ---------- a case study's pictures open full size: click a picture, then anywhere (or Escape) to close ---------- */
let zoom: HTMLElement | null = null;
function openZoom(pic: HTMLImageElement): void {
  stopTour();
  zoom = document.createElement("div");
  zoom.className = "zoom";
  zoom.setAttribute("role", "dialog");
  zoom.setAttribute("aria-modal", "true");
  zoom.setAttribute("aria-label", pic.alt || "Picture");
  const big = document.createElement("img");
  big.src = pic.currentSrc || pic.src;
  big.alt = pic.alt;
  const cap = document.createElement("p");
  cap.className = "mono";
  cap.textContent = pic.alt;
  const x = document.createElement("button");
  x.type = "button";
  x.className = "zoom-x";
  x.setAttribute("aria-label", "Close picture");
  x.textContent = "×";
  zoom.append(big, cap, x);
  zoom.addEventListener("click", closeZoom);
  document.body.appendChild(zoom);
  x.focus({ preventScroll: true });
}
function closeZoom(): void {
  zoom?.remove();
  zoom = null;
  mdl.querySelector<HTMLElement>(".mdl-card")?.focus({ preventScroll: true });
}

function openCase(id: string, push = true): void {
  const p = byId(id);
  if (!p) return;
  const i = PROJECTS.indexOf(p);
  const card = sheetHTML(p, PROJECTS[(i + 1) % PROJECTS.length]);
  // switching flights keeps the backdrop and swaps the sheet
  const old = mdl.querySelector<HTMLElement>(".mdl-card");
  if (old?.dataset.case === id) {
    // already in the page: a case study's own address renders its sheet
  } else if (mdl.hidden || !old) mdl.innerHTML = `<div class="mdl-back" data-mclose></div>${card}`;
  else old.outerHTML = card;
  mdl.hidden = false;
  focus(id);
  $paused.set(true);
  document.title = `${p.long ?? p.title} · Eileen Zhang`;
  if (push) history.pushState({ case: id }, "", `/work/${p.slug}/`);
  const el = mdl.querySelector<HTMLElement>(".mdl-card");
  if (el) {
    el.focus({ preventScroll: true });
    // on phones and tablets every step is laid out open, so the step headings are not toggles
    if (matchMedia("(max-width: 900px)").matches)
      el.querySelectorAll<HTMLElement>("[data-step]").forEach((b) => {
        b.setAttribute("aria-expanded", "true");
        b.tabIndex = -1;
      });
    startTour(el);
  }
}
function closeCase(push = true): void {
  if (mdl.hidden) return;
  stopTour();
  mdl.hidden = true;
  mdl.innerHTML = "";
  focus("");
  $paused.set(false);
  document.title = HOME_TITLE;
  if (push) history.pushState({}, "", "/");
}
function stepCase(d: number): void {
  const i = PROJECTS.findIndex((x) => x.id === current);
  openCase(PROJECTS[(i + d + PROJECTS.length) % PROJECTS.length].id);
}

stage.addEventListener("click", (e) => {
  const t = e.target as Element;
  if (t.closest("[data-mclose]")) {
    closeCase();
    return;
  }
  const pic = t.closest<HTMLImageElement>(".mdl-card .mc-shots img");
  if (pic) {
    openZoom(pic);
    return;
  }
  const sp = t.closest<HTMLElement>("[data-step]");
  if (sp) {
    const card = sp.closest<HTMLElement>(".mdl-card");
    if (!card) return;
    stopTour();
    showStep(card, sp.parentElement?.classList.contains("on") ? 0 : Number(sp.dataset.step));
    return;
  }
  const o = t.closest<HTMLElement>("[data-open]");
  if (o?.dataset.open) {
    e.preventDefault(); // Next flight is a real link; the landing swaps the sheet in place
    openCase(o.dataset.open);
  }
});

// back and forward move between the landing and the case studies
addEventListener("popstate", () => {
  const m = location.pathname.match(/^\/work\/([^/]+)/);
  const p = m ? bySlug(m[1]) : undefined;
  if (p) openCase(p.id, false);
  else closeCase(false);
});

document.addEventListener("keydown", (e) => {
  if (zoom) {
    if (e.key === "Escape") closeZoom();
    if (e.key !== "Tab") e.preventDefault();
    return;
  }
  if (!mdl.hidden && (e.key === "ArrowRight" || e.key === "ArrowLeft")) {
    stepCase(e.key === "ArrowRight" ? 1 : -1);
    return;
  }
  if (!mdl.hidden && e.key === "Tab") {
    // keep focus inside the sheet
    const f = [...mdl.querySelectorAll<HTMLElement>(".mdl-card button, .mdl-card a[href]")].filter(
      (x) => x.offsetParent,
    );
    const i = f.indexOf(document.activeElement as HTMLElement);
    if (e.shiftKey ? i <= 0 : i === f.length - 1) {
      e.preventDefault();
      f[e.shiftKey ? f.length - 1 : 0]?.focus();
    }
    return;
  }
  if (e.key === "Escape") closeCase();
});

// opened at /work/{slug}: show that case study straight away
if (stage.dataset.open) openCase(stage.dataset.open, false);
