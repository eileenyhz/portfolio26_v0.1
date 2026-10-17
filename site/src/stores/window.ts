import { atom } from "nanostores";
import type { ViewId } from "../data/types";

/** The view outside the window; the landing sets it on hover, the window island eases into it. */
export const $view = atom<ViewId>("sky");

/** True while something covers the window (the case-study sheet), so it can stop rendering. */
export const $paused = atom(false);

/** True once the window has drawn its first frame: its start-up (the 3D library, the shaders) is done. The intro waits
 * for it, so the page's heaviest moment happens under the still cover, not during the flight. */
export const $ready = atom(false);
