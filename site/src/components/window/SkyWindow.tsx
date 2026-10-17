import { useStore } from "@nanostores/react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { PALETTES } from "../../data/views";
import type { ViewId } from "../../data/types";
import { $paused, $ready, $view } from "../../stores/window";
import { F, GLASS, PX, applyState, buildWindow, mixState, toState, type SkyState } from "./frame";

// colours are given as authored, with no colour management or tone mapping, so they match the design exactly. The
// Canvas's `legacy` keeps it that way: without it, R3F turns colour management back on and the frame renders darker.
THREE.ColorManagement.enabled = false;

const STATES = Object.fromEntries(Object.entries(PALETTES).map(([id, p]) => [id, toState(p)])) as Record<
  ViewId,
  SkyState
>;
const ease = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
// the cloud sky is the costly part to draw, and it drifts slowly: redrawn at most 30 times a second, it looks the same
const SKY_EVERY = 1000 / 30;

function WindowScene() {
  const { camera, size } = useThree();
  const view = useStore($view);
  const paused = useStore($paused);
  const parts = useMemo(buildWindow, []);
  useEffect(() => parts.dispose, [parts]);

  // the colours ease from the current view to the next
  const fade = useRef({ from: STATES.sky, to: STATES.sky, cur: STATES.sky, t0: -1e9 });
  useEffect(() => applyState(parts.sky.uniforms, STATES.sky), [parts]);
  useEffect(() => {
    const f = fade.current;
    if (f.to === STATES[view]) return;
    Object.assign(f, { from: f.cur, to: STATES[view], t0: performance.now() });
  }, [view]);

  // the glass shifts a little with the pointer
  const pointer = useRef({ tx: 0, ty: 0, sx: 0, sy: 0 });
  useEffect(() => {
    const on = (e: PointerEvent) =>
      Object.assign(pointer.current, { tx: e.clientX / innerWidth - 0.5, ty: e.clientY / innerHeight - 0.5 });
    addEventListener("pointermove", on);
    return () => removeEventListener("pointermove", on);
  }, []);

  // framing: the canvas overhangs the window box by 6% top and bottom and 12% each side; the glass is drawn 0.84 of the
  // box tall, its middle a little left of the box's centre
  useEffect(() => {
    const { width: w, height: h } = size;
    if (!w || !h) return;
    const wh = h / 1.12;
    const ws = w / 1.24;
    const k = PX * wh;
    const left = F.centre[0] - (0.588 * ws) / k;
    const top = F.centre[1] - (0.56 * wh) / k;
    const vw = w / k;
    const vh = h / k;
    const cam = camera as THREE.PerspectiveCamera;
    cam.fov = 18;
    cam.near = 10;
    cam.far = 40000;
    cam.aspect = w / h;
    cam.position.set(left + vw / 2, -(top + vh / 2), vh / 2 / Math.tan(THREE.MathUtils.degToRad(9)));
    cam.lookAt(left + vw / 2, -(top + vh / 2), 0);
    cam.updateProjectionMatrix();
    const t = parts.sky.target;
    t.setSize(Math.max(2, Math.round(GLASS.w * k * 0.6)), Math.max(2, Math.round(GLASS.h * k * 0.6)));
    parts.sky.uniforms.uRes.value.set(t.width, t.height);
  }, [size, camera, parts]);

  const start = useRef(performance.now());
  const frame = useRef(0);
  const skyAt = useRef(-1e9); // when the sky was last drawn
  // priority 1: this loop does the rendering, the sky into its target, then the window
  useFrame(({ gl, scene, camera: cam }) => {
    if (paused) return;
    const now = performance.now();
    const f = fade.current;
    const k = Math.min(Math.max((now - f.t0) / 900, 0), 1);
    if (k < 1) {
      f.cur = mixState(f.from, f.to, ease(k));
      applyState(parts.sky.uniforms, f.cur);
    } else if (f.cur !== f.to) {
      f.cur = f.to;
      applyState(parts.sky.uniforms, f.cur);
    }
    const p = pointer.current;
    p.sx += (p.tx - p.sx) * 0.06;
    p.sy += (p.ty - p.sy) * 0.06;
    parts.inner.position.set(2.5 * p.sx, -2 * p.sy, 0);
    parts.seal.position.x = F.seal + 3 * p.sx;
    const u = parts.sky.uniforms;
    // the sky redraws at most 30 times a second (and at once while it changes colour); the glass and frame every frame,
    // so the glass still follows the pointer smoothly
    if (now - skyAt.current >= SKY_EVERY - 2 || k < 1) {
      skyAt.current = now;
      u.uTime.value = reduced() ? 30 : 30 + (now - start.current) / 1000;
      u.uFrame.value = frame.current++ % 64;
      gl.setRenderTarget(parts.sky.target);
      gl.render(parts.sky.scene, parts.sky.camera);
      gl.setRenderTarget(null);
    }
    parts.glassUniforms.uTime.value = now / 1000;
    gl.render(scene, cam);
    if (!$ready.get()) $ready.set(true);
  }, 1);

  return <primitive object={parts.root} />;
}

/**
 * The airplane window on the landing: a live cloud sea through the glass; hovering a ticket eases it into that project's
 * colours. Drawn at most 1.5 device pixels per pixel: on 2x screens that is 44% fewer pixels, which the eye does not miss.
 */
export default function SkyWindow() {
  return (
    <Canvas legacy flat linear dpr={[1, 1.5]} gl={{ antialias: true, alpha: true, stencil: true }} aria-hidden="true">
      <WindowScene />
    </Canvas>
  );
}
