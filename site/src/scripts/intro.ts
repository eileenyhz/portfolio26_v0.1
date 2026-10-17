import gsap from "gsap";
import { $ready } from "../stores/window";

/** The longest the plane waits for the window to start (a page whose window fails still gets its intro). */
const WAIT_MAX = 1500;

/**
 * A plane crosses the blue screen leaving a line; once it has crossed, WELCOME ABOARD rises above the line and EZ AIR drops
 * below it; then the screen opens along the line. Plays once per visit (the name in the corner replays it); click or any key
 * skips it; reduced motion never shows it. The cover shows at once, but the plane takes off only once the window has
 * drawn its first frame (at most WAIT_MAX): the page's start-up, the heaviest work it does, then happens under the still
 * cover instead of stuttering the flight.
 */
export function playIntro(): void {
  const el = document.querySelector<HTMLElement>(".intro");
  if (!el) return;
  if (
    matchMedia("(prefers-reduced-motion: reduce)").matches ||
    document.documentElement.classList.contains("intro-seen")
  ) {
    el.remove();
    return;
  }
  try {
    sessionStorage.setItem("ez-intro", "seen");
  } catch {
    /* storage blocked: the intro plays on every visit instead */
  }
  el.dataset.playing = ""; // tells the fallback in Intro.astro that the intro has started
  const line = el.querySelector(".in-line");
  const plane = el.querySelector(".in-plane");
  const top = el.querySelector<HTMLElement>(".in-top");
  const bot = el.querySelector<HTMLElement>(".in-bot");
  if (!line || !plane || !top || !bot) return;
  // each word starts just past the line, beyond its half's padding, so none of it shows before the line has crossed
  const gap = (half: HTMLElement, side: "paddingTop" | "paddingBottom") =>
    parseFloat(getComputedStyle(half)[side]) || 0;
  // a safety net for views that throttle animation frames while still on screen (some embedded browsers): after 8 s of
  // visible time the intro finishes whatever its frame rate. Time in a hidden tab does not count, so a page opened in the
  // background still plays its intro when the tab is shown.
  let shown = 0;
  const guard = setInterval(() => {
    if (document.visibilityState === "visible") shown += 500;
    if (shown >= 8000) tl.progress(1);
  }, 500);
  const tl = gsap.timeline({
    paused: true,
    onComplete: () => {
      clearInterval(guard);
      el.remove();
    },
  });
  tl.to(plane, { x: () => innerWidth + 80, duration: 1.15, ease: "power2.inOut" }, 0.25)
    .to(line, { scaleX: 1, duration: 1.15, ease: "power2.inOut" }, 0.3)
    .fromTo(
      top.firstElementChild,
      { yPercent: 112, y: gap(top, "paddingBottom") },
      { yPercent: 0, y: 0, duration: 0.8, ease: "expo.out" },
      1.45,
    )
    .fromTo(
      bot.firstElementChild,
      { yPercent: -110, y: -gap(bot, "paddingTop") },
      { yPercent: 0, y: 0, duration: 0.8, ease: "expo.out" },
      1.55,
    )
    .to(line, { opacity: 0, duration: 0.25 }, 2.7)
    .to(top, { yPercent: -100, duration: 1, ease: "expo.inOut" }, 2.7)
    .to(bot, { yPercent: 100, duration: 1, ease: "expo.inOut" }, 2.7);
  const fly = () => {
    if (!tl.paused() || tl.progress() > 0) return;
    unsubscribe();
    clearTimeout(timeout);
    tl.play();
  };
  const timeout = setTimeout(fly, WAIT_MAX);
  const unsubscribe = $ready.subscribe((ready) => {
    if (ready) queueMicrotask(fly);
  });
  const skip = () => tl.progress(1);
  el.addEventListener("click", skip);
  addEventListener("keydown", skip, { once: true });
}
