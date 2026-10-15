// The site's pointer, for mouse and trackpad: the intro's plane, its nose exactly at the pointer, facing the way it last
// flew, with a dotted contrail behind it. Touch screens keep their own behaviour; with reduced motion there is no trail.
//
// Its colour follows what is under it, pixel by pixel: each shape is drawn twice, a white copy in "difference" blending
// and a cobalt copy in "screen" blending on top. Over white that comes out cobalt, over ink or navy white, and over
// colours a light contrasting tone; where the plane straddles an edge, each part takes its own colour.

const COBALT = "#1f3ccf";
const PLANE = "M45 24l-8-3H27L19 9h-4l5 12H11l-4-5H4l2 8-2 8h3l4-5h9l-5 12h4l8-12h10z";
const NOSE: [number, number] = [22.5, 12]; // its tip, in its 24 px box (see .cur-plane)
const REST = (-3 * Math.PI) / 4; // before the first move it points up and left, like an arrow
const DOT_GAP = 7;
const TAIL = 20; // the contrail starts this far behind the nose, at the tail
const BODY = 11; // and never shows within this distance of the plane's middle
const DOT_LIFE = 600;
const TRAIL_MAX = 140; // the contrail is at most this long, and fades along its length
const TURN_DISTANCE = 30; // the plane turns only once the pointer is this far from where it last turned
const LOCKED = 0.8; // over something to click the plane draws in to this size, toward its nose, so more of the target shows
const CLICKABLE = "a, button, [role='button'], .tk, .wc, .ph-i, .mdl-card .mc-shots img";
const SAVED = "ez-cursor"; // where the plane is kept across page loads (sessionStorage)

interface Saved {
  x: number;
  y: number;
  angle: number;
  t: number;
}

/** Keeps only the newest stretch of a path, at most `max` pixels long. */
function shorten<T extends { x: number; y: number }>(path: T[], max: number): T[] {
  let length = 0;
  for (let i = path.length - 1; i > 0; i--) {
    length += Math.hypot(path[i].x - path[i - 1].x, path[i].y - path[i - 1].y);
    if (length > max) return path.slice(i - 1);
  }
  return path;
}

/** What the tag beside the plane says over this element, if anything. */
function tagFor(el: Element | null): string {
  if (!el) return "";
  if (el.closest(".tk, .mc-next")) return "BOARD";
  if (el.closest(".mdl-card .mc-shots img")) return "VIEW";
  return "";
}

function start(): void {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");

  // every layer sits straight on the page (not inside a wrapper) so its blending mixes with the page itself
  const make = <K extends keyof HTMLElementTagNameMap>(tag: K, cls: string) => {
    const el = document.createElement(tag);
    el.className = cls;
    el.setAttribute("aria-hidden", "true");
    document.body.append(el);
    return el;
  };
  const trails = [make("canvas", "cur-trail cur-diff"), make("canvas", "cur-trail cur-screen")];
  const planes = ["cur-plane cur-diff", "cur-plane cur-screen"].map((cls) => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", cls);
    svg.setAttribute("viewBox", "0 0 48 48");
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML = `<path d="${PLANE}"/>`;
    document.body.append(svg);
    return svg;
  });
  const tag = make("span", "cur-tag");
  const pens = trails.map((c) => c.getContext("2d") as CanvasRenderingContext2D);

  const dpr = () => Math.min(devicePixelRatio || 1, 2);
  const size = () =>
    trails.forEach((c, i) => {
      c.width = innerWidth * dpr();
      c.height = innerHeight * dpr();
      pens[i].setTransform(dpr(), 0, 0, dpr(), 0, 0);
    });
  size();
  addEventListener("resize", size);

  // where the pointer is and which way the plane faces; it holds its heading when still or making small adjustments
  // ax, ay: where it last turned; scale and fit: its size now, and the size it is drawing to
  const P = { x: 0, y: 0, ax: 0, ay: 0, angle: REST, target: REST, scale: 1, fit: 1, seen: false, moved: 0 };
  let trail: { x: number; y: number; t: number }[] = [];

  /** The plane replaces the pointer once it has somewhere to be (the normal pointer shows until then). */
  const show = () => {
    P.seen = true;
    document.documentElement.classList.add("c-plane");
    planes.forEach((p) => p.classList.add("on"));
  };

  // across a page load (a click on the nav) the plane stays where it was, facing the same way, instead of starting over
  try {
    const saved: Saved | null = JSON.parse(sessionStorage.getItem(SAVED) ?? "null");
    // only straight after leaving a page (a click on a link), never on a later visit, so it never shows somewhere stale
    if (saved && Date.now() - saved.t < 4_000) {
      Object.assign(P, { x: saved.x, y: saved.y, ax: saved.x, ay: saved.y, angle: saved.angle, target: saved.angle });
      show();
    }
  } catch {
    /* storage blocked: it simply starts fresh */
  }
  const save = () => {
    try {
      const saved: Saved = { x: P.x, y: P.y, angle: P.target, t: Date.now() };
      if (P.seen) sessionStorage.setItem(SAVED, JSON.stringify(saved));
    } catch {
      /* storage blocked */
    }
  };
  addEventListener("pagehide", save);

  const place = () => {
    const [nx, ny] = NOSE;
    const t = `translate(${P.x}px, ${P.y}px) rotate(${P.angle}rad) scale(${P.scale}) translate(${-nx}px, ${-ny}px)`;
    planes.forEach((p) => (p.style.transform = t));
    tag.style.transform = `translate(${P.x + 14}px, ${P.y + 16}px)`;
  };

  addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
    const now = performance.now();
    P.x = e.clientX;
    P.y = e.clientY;
    if (!P.seen) {
      show();
      P.ax = P.x;
      P.ay = P.y;
    }
    // small movements never turn the plane: only once it is TURN_DISTANCE from where it last turned, and never while it
    // is over something to click, so aiming stays steady
    const over = !!(e.target as Element).closest?.(CLICKABLE);
    P.fit = over ? LOCKED : 1;
    if (over) {
      P.ax = P.x;
      P.ay = P.y;
    } else if (Math.hypot(P.x - P.ax, P.y - P.ay) > TURN_DISTANCE) {
      P.target = Math.atan2(P.y - P.ay, P.x - P.ax);
      P.ax = P.x;
      P.ay = P.y;
    }
    const label = tagFor(e.target as Element);
    tag.textContent = label;
    tag.classList.toggle("on", !!label);
    P.moved = now;
    place(); // straight away, so the plane never trails the pointer by a frame
  });
  document.documentElement.addEventListener("pointerleave", () => {
    P.seen = false;
    planes.forEach((p) => p.classList.remove("on"));
    tag.classList.remove("on");
  });

  (function frame(now: number) {
    requestAnimationFrame(frame);
    if (!P.seen) return;
    const d = Math.atan2(Math.sin(P.target - P.angle), Math.cos(P.target - P.angle));
    P.angle += reduce.matches ? d : d * 0.22;
    P.scale += reduce.matches ? P.fit - P.scale : (P.fit - P.scale) * 0.3;
    place();
    // the contrail: a dot every few pixels along the path, fading out; its canvases rest when it is empty
    // the contrail leaves from the tail, and only while the plane is flying (not while it turns in place)
    const cos = Math.cos(P.angle);
    const sin = Math.sin(P.angle);
    if (!reduce.matches && now - P.moved < 120) {
      const tx = P.x - cos * TAIL;
      const ty = P.y - sin * TAIL;
      const last = trail[trail.length - 1];
      if (!last || Math.hypot(tx - last.x, ty - last.y) > 3) trail.push({ x: tx, y: ty, t: now });
    }
    trail = shorten(
      trail.filter((p) => now - p.t < DOT_LIFE),
      TRAIL_MAX,
    );
    let total = 0;
    for (let j = 1; j < trail.length; j++)
      total += Math.hypot(trail[j].x - trail[j - 1].x, trail[j].y - trail[j - 1].y);
    const mx = P.x - (cos * TAIL) / 2;
    const my = P.y - (sin * TAIL) / 2;
    trails.forEach((c) => c.classList.toggle("on", trail.length > 1));
    pens.forEach((g, i) => {
      g.clearRect(0, 0, innerWidth, innerHeight);
      g.fillStyle = i === 0 ? "#ffffff" : COBALT;
      let run = 0;
      for (let j = 1; j < trail.length; j++) {
        const a = trail[j - 1];
        const b = trail[j];
        const len = Math.hypot(b.x - a.x, b.y - a.y);
        for (let s = (DOT_GAP - (run % DOT_GAP)) % DOT_GAP; s < len; s += DOT_GAP) {
          const k = s / len;
          const x = a.x + (b.x - a.x) * k;
          const y = a.y + (b.y - a.y) * k;
          if (Math.hypot(x - mx, y - my) < BODY) continue; // never on the plane itself
          const fromTail = total - (run + s); // 0 at the tail, TRAIL_MAX at the far end
          g.globalAlpha = Math.max(0, (1 - (now - b.t) / DOT_LIFE) * (1 - fromTail / TRAIL_MAX));
          g.fillRect(Math.round(x) - 1, Math.round(y) - 1, 2, 2);
        }
        run += len;
      }
      g.globalAlpha = 1;
    });
  })(performance.now());
}

if (matchMedia("(hover: hover) and (pointer: fine)").matches) start();
