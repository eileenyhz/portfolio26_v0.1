import { atom } from "nanostores";
import type { ViewId } from "../data/types";

/** The view outside the window; the landing sets it on hover, the window island eases into it. */
export const $view = atom<ViewId>("sky");

/** True while something covers the window (the case-study sheet), so it can stop rendering. */
export const $paused = atom(false);
