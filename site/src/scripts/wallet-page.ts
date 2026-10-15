import { WALLET } from "../data/wallet";
import { fileHTML, lightboxHTML, receiptHTML } from "../lib/wallet";
import { flapAll } from "../lib/text-effects";

const reduce = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const stack = document.getElementById("wl-stack") as HTMLElement;
const paper = document.getElementById("paper") as HTMLElement;
const file = document.getElementById("wl-file") as HTMLElement;
const lb = document.getElementById("lb") as HTMLElement;
let selected = "";

/** Picks a card: it lifts, its receipt prints, and its file shows beside it. */
function select(id: string, tap: boolean): void {
  const e = WALLET.find((x) => x.id === id);
  if (!e) return;
  selected = id;
  stack.querySelectorAll<HTMLElement>(".wc").forEach((b) => {
    const on = b.dataset.wcard === id;
    b.classList.toggle("on", on);
    b.setAttribute("aria-pressed", String(on));
  });
  const card = stack.querySelector<HTMLElement>(`[data-wcard="${id}"]`);
  if (card && tap) {
    card.classList.remove("tap");
    void card.offsetWidth;
    card.classList.add("tap");
  }
  // on phones the stack is a sideways row: bring the chosen card into view
  if (card && stack.scrollWidth > stack.clientWidth)
    stack.scrollBy({
      left: card.getBoundingClientRect().left - stack.getBoundingClientRect().left - 4,
      behavior: tap && !reduce() ? "smooth" : "auto",
    });
  paper.innerHTML = receiptHTML(e);
  const printed = paper.firstElementChild as HTMLElement | null;
  paper.animate([{ height: "0px" }, { height: `${printed?.offsetHeight ?? 0}px` }], {
    duration: reduce() ? 1 : 1100,
    easing: "steps(26, end)",
  });
  file.innerHTML = fileHTML(e);
  flapAll(file);
  file.animate(
    [
      { opacity: 0, translate: "0 8px" },
      { opacity: 1, translate: "0 0" },
    ],
    { duration: reduce() ? 1 : 420, easing: "cubic-bezier(.16,1,.3,1)" },
  );
}

/* the viewer for one piece */
let lbState: { eid: string; i: number } | null = null;
function openViewer(eid: string, i: number): void {
  const e = WALLET.find((x) => x.id === eid);
  if (!e) return;
  lbState = { eid, i };
  lb.innerHTML = lightboxHTML(e, i);
  lb.hidden = false;
  lb.querySelector<HTMLElement>("[data-lbclose]")?.focus({ preventScroll: true });
}
function closeViewer(): void {
  lb.hidden = true;
  lb.innerHTML = "";
  lbState = null;
}
function stepViewer(d: number): void {
  if (!lbState) return;
  const e = WALLET.find((x) => x.id === lbState?.eid);
  if (e) openViewer(e.id, (lbState.i + d + e.imgs) % e.imgs);
}

document.addEventListener("click", (ev) => {
  const t = ev.target as Element;
  if (lbState) {
    if (t.closest("[data-lbclose]") || t === lb) return closeViewer();
    const nav = t.closest<HTMLElement>("[data-lbnav]");
    if (nav) return stepViewer(Number(nav.dataset.lbnav));
    const go = t.closest<HTMLElement>("[data-lbgo]");
    if (go) return openViewer(lbState.eid, Number(go.dataset.lbgo));
    return;
  }
  const wc = t.closest<HTMLElement>("[data-wcard]");
  if (wc?.dataset.wcard && wc.dataset.wcard !== selected) return select(wc.dataset.wcard, true);
  const th = t.closest<HTMLElement>("[data-th]");
  if (th?.dataset.th) {
    const [eid, i] = th.dataset.th.split(":");
    openViewer(eid, Number(i));
  }
});
document.addEventListener("keydown", (e) => {
  if (!lbState) return;
  if (e.key === "Escape") closeViewer();
  else if (e.key === "ArrowRight") stepViewer(1);
  else if (e.key === "ArrowLeft") stepViewer(-1);
});

flapAll(document);
select(WALLET[0].id, false);
