import * as THREE from "three";
import type { Palette } from "../../data/types";
import glassFrag from "./glass.frag.glsl?raw";
import skyFrag from "./sky.frag.glsl?raw";

/** A rounded rectangle in the reference drawing's px (y down): x0, y0, x1, y1, top radius, bottom radius. */
export type Rect = [number, number, number, number, number, number];

/**
 * The window, measured from Eileen's reference drawing (px, y down): a shallow recess shaded along its top, the blue-grey
 * frame and inner wall sunk a little down-right inside it, the glass with a dark seal on its right and a solid blind.
 */
export const F = {
  recess: [127, 132, 829, 1163, 242, 272] as Rect,
  frame: [137, 142, 819, 1153, 232, 262] as Rect,
  hole: [161, 170, 791, 1113, 210, 240] as Rect,
  glass: [161, 170, 759, 1085, 210, 210] as Rect,
  handle: [426, 236, 512, 246, 5, 5] as Rect,
  seal: 13,
  sink: [3, -4] as const,
  /** The point placed at the window box's centre (horizontally, the glass's centre sits a little left of it). */
  centre: [460, 647.5] as const,
};
/** The glass, as a box. */
export const GLASS = { x0: 161, y0: 170, w: 598, h: 915 };
/** px per reference px, as a share of the window box's height: the glass is drawn 0.84 of the box tall. */
export const PX = 0.777 / 845;
/** The blind's lower edge. */
export const arcY = (x: number) => -472 + Math.sqrt(733 * 733 - (x - 487) ** 2);
/** Cloud drift, world units per second. */
export const SPEED = 0.9;

/** A rounded rectangle as a three.js shape (y up). */
export function roundedRect([x0, y0, x1, y1, rt, rb]: Rect): THREE.Shape {
  const s = new THREE.Shape();
  const k = 0.5523;
  s.moveTo(x0 + rt, -y0);
  s.lineTo(x1 - rt, -y0);
  s.bezierCurveTo(x1 - rt + rt * k, -y0, x1, -(y0 + rt - rt * k), x1, -(y0 + rt));
  s.lineTo(x1, -(y1 - rb));
  s.bezierCurveTo(x1, -(y1 - rb + rb * k), x1 - rb + rb * k, -y1, x1 - rb, -y1);
  s.lineTo(x0 + rb, -y1);
  s.bezierCurveTo(x0 + rb - rb * k, -y1, x0, -(y1 - rb + rb * k), x0, -(y1 - rb));
  s.lineTo(x0, -(y0 + rt));
  s.bezierCurveTo(x0, -(y0 + rt - rt * k), x0 + rt - rt * k, -y0, x0 + rt, -y0);
  return s;
}

const flat = (color: string, extra: Partial<THREE.MeshBasicMaterialParameters> = {}) =>
  new THREE.MeshBasicMaterial({ color, depthTest: false, depthWrite: false, ...extra });

/** A vertical gradient between two reference rows. */
const gradient = (top: string, bottom: string, y0: number, y1: number) =>
  new THREE.ShaderMaterial({
    depthTest: false,
    depthWrite: false,
    uniforms: {
      cA: { value: new THREE.Color(top) },
      cB: { value: new THREE.Color(bottom) },
      yA: { value: -y0 },
      yB: { value: -y1 },
    },
    vertexShader:
      "varying float vY; void main() { vY = position.y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    fragmentShader:
      "uniform vec3 cA; uniform vec3 cB; uniform float yA; uniform float yB; varying float vY; void main() { gl_FragColor = vec4(mix(cA, cB, clamp((vY - yA) / (yB - yA), 0.0, 1.0)), 1.0); }",
  });

// the glass and the seal mark the stencil; the blind is drawn only there
const WRITE = {
  stencilWrite: true,
  stencilRef: 1,
  stencilFunc: THREE.AlwaysStencilFunc,
  stencilZPass: THREE.ReplaceStencilOp,
};
const TEST = {
  stencilWrite: true,
  stencilRef: 1,
  stencilFunc: THREE.EqualStencilFunc,
  stencilFail: THREE.KeepStencilOp,
  stencilZFail: THREE.KeepStencilOp,
  stencilZPass: THREE.KeepStencilOp,
};

export interface SkyUniforms {
  [name: string]: THREE.IUniform;
  uTime: THREE.IUniform<number>;
  uFrame: THREE.IUniform<number>;
  uSpeed: THREE.IUniform<number>;
  uRes: THREE.IUniform<THREE.Vector2>;
  uInvVP: THREE.IUniform<THREE.Matrix4>;
  uCam: THREE.IUniform<THREE.Vector3>;
  uRand: THREE.IUniform<THREE.DataTexture>;
  uSunDir: THREE.IUniform<THREE.Vector3>;
  uTop: THREE.IUniform<THREE.Color>;
  uMid: THREE.IUniform<THREE.Color>;
  uHor: THREE.IUniform<THREE.Color>;
  uLit: THREE.IUniform<THREE.Color>;
  uShade: THREE.IUniform<THREE.Color>;
}

export interface WindowParts {
  /** Everything drawn on the page, in reference px. */
  root: THREE.Group;
  /** The glass and what sits on it; it shifts a little with the pointer. */
  inner: THREE.Group;
  seal: THREE.Mesh;
  /** The sky pass: a full-screen quad raymarched into a target the glass samples. */
  sky: { scene: THREE.Scene; camera: THREE.PerspectiveCamera; target: THREE.WebGLRenderTarget; uniforms: SkyUniforms };
  glassUniforms: { uSky: THREE.IUniform<THREE.Texture>; uTime: THREE.IUniform<number> };
  dispose: () => void;
}

/** Builds the window and its sky once; the island adds framing, colours and the frame loop. */
export function buildWindow(): WindowParts {
  const root = new THREE.Group();
  const disposables: { dispose(): void }[] = [];
  const add = (geo: THREE.BufferGeometry, mat: THREE.Material, order: number, parent: THREE.Object3D = root) => {
    const m = new THREE.Mesh(geo, mat);
    m.renderOrder = order;
    parent.add(m);
    disposables.push(geo, mat);
    return m;
  };
  add(
    new THREE.ShapeGeometry(roundedRect(F.recess), 48),
    gradient("#cdd2dc", "#f1f3f7", F.recess[1], F.recess[1] + 260),
    0,
  ); // shadowed at the top
  const sunk = new THREE.Group(); // everything inside sits a little down-right
  sunk.position.set(F.sink[0], F.sink[1], 0);
  root.add(sunk);
  add(
    new THREE.ShapeGeometry(roundedRect(F.frame), 48),
    gradient("#bcc4d1", "#cbd2dd", F.frame[1], F.frame[3]),
    1,
    sunk,
  );
  add(new THREE.ShapeGeometry(roundedRect(F.hole), 48), gradient("#e1e4ec", "#eef0f5", F.hole[1], F.hole[3]), 2, sunk);
  const inner = new THREE.Group();
  sunk.add(inner);
  const glassShape = roundedRect(F.glass);
  add(new THREE.ShapeGeometry(glassShape, 48), flat("#cbd1dc"), 3, inner).position.y = -5;
  const seal = add(new THREE.ShapeGeometry(glassShape, 48), flat("#08090c", WRITE), 4, inner);

  // the glass samples the sky's render target
  const target = new THREE.WebGLRenderTarget(2, 2, { depthBuffer: false });
  const glassUniforms = { uSky: { value: target.texture as THREE.Texture }, uTime: { value: 0 } };
  const glassGeo = new THREE.ShapeGeometry(glassShape, 48);
  const uv = glassGeo.attributes.uv;
  const pos = glassGeo.attributes.position;
  for (let i = 0; i < pos.count; i++)
    uv.setXY(i, (pos.getX(i) - GLASS.x0) / GLASS.w, (pos.getY(i) + GLASS.y0 + GLASS.h) / GLASS.h);
  add(
    glassGeo,
    new THREE.ShaderMaterial({
      uniforms: glassUniforms,
      depthTest: false,
      depthWrite: false,
      fragmentShader: glassFrag,
      vertexShader:
        "varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      ...WRITE,
    }),
    5,
    inner,
  );
  const blind = [new THREE.Vector2(130, -150), new THREE.Vector2(840, -150)];
  for (let x = 840; x >= 130; x -= 10) blind.push(new THREE.Vector2(x, -arcY(x)));
  add(new THREE.ShapeGeometry(new THREE.Shape(blind)), flat("#eaedf3", TEST), 6, inner);
  const lip: THREE.Vector2[] = [];
  for (let x = 130; x <= 840; x += 10) lip.push(new THREE.Vector2(x, -(arcY(x) - 3)));
  for (let x = 840; x >= 130; x -= 10) lip.push(new THREE.Vector2(x, -arcY(x)));
  add(new THREE.ShapeGeometry(new THREE.Shape(lip)), flat("#f3f5f8", TEST), 7, inner);
  add(new THREE.ShapeGeometry(roundedRect(F.handle), 12), flat("#b9c1ce"), 8, inner);

  // a 64 x 64 table of random numbers the sky reads to place its cloud domes
  const rand = new Uint8Array(64 * 64 * 4);
  let s = 20261014;
  for (let i = 0; i < rand.length; i++) {
    s = (s * 16807) % 2147483647;
    rand[i] = Math.floor((s / 2147483647) * 256);
  }
  const randTex = new THREE.DataTexture(rand, 64, 64, THREE.RGBAFormat);
  randTex.magFilter = randTex.minFilter = THREE.NearestFilter;
  randTex.needsUpdate = true;
  const skyCam = new THREE.PerspectiveCamera(35, GLASS.w / GLASS.h, 0.1, 1000);
  skyCam.position.set(0, 10.2, 24);
  skyCam.lookAt(0, 22.7, -100);
  skyCam.updateMatrixWorld();
  const uniforms: SkyUniforms = {
    uTime: { value: 0 },
    uFrame: { value: 0 },
    uSpeed: { value: SPEED },
    uRes: { value: new THREE.Vector2(1, 1) },
    uInvVP: {
      value: new THREE.Matrix4().multiplyMatrices(skyCam.projectionMatrix, skyCam.matrixWorldInverse).invert(),
    },
    uCam: { value: skyCam.position },
    uRand: { value: randTex },
    uSunDir: { value: new THREE.Vector3() },
    uTop: { value: new THREE.Color() },
    uMid: { value: new THREE.Color() },
    uHor: { value: new THREE.Color() },
    uLit: { value: new THREE.Color() },
    uShade: { value: new THREE.Color() },
  };
  const skyScene = new THREE.Scene();
  const quadGeo = new THREE.PlaneGeometry(2, 2);
  const quadMat = new THREE.ShaderMaterial({
    uniforms,
    depthTest: false,
    depthWrite: false,
    vertexShader: "void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }",
    fragmentShader: skyFrag,
  });
  const quad = new THREE.Mesh(quadGeo, quadMat);
  quad.frustumCulled = false;
  skyScene.add(quad);
  disposables.push(quadGeo, quadMat, randTex, target);

  return {
    root,
    inner,
    seal,
    sky: { scene: skyScene, camera: skyCam, target, uniforms },
    glassUniforms,
    dispose: () => disposables.forEach((d) => d.dispose()),
  };
}

/** A palette as live three.js values, so colours can ease from one view to the next. */
export interface SkyState {
  top: THREE.Color;
  mid: THREE.Color;
  hor: THREE.Color;
  lit: THREE.Color;
  shade: THREE.Color;
  dir: THREE.Vector3;
}
const KEYS = ["top", "mid", "hor", "lit", "shade"] as const;
export const toState = (p: Palette): SkyState => ({
  top: new THREE.Color(p.top),
  mid: new THREE.Color(p.mid),
  hor: new THREE.Color(p.hor),
  lit: new THREE.Color(p.lit),
  shade: new THREE.Color(p.shade),
  dir: new THREE.Vector3(...p.dir).normalize(),
});
export function mixState(a: SkyState, b: SkyState, k: number): SkyState {
  const o = {} as SkyState;
  KEYS.forEach((n) => (o[n] = a[n].clone().lerp(b[n], k)));
  o.dir = a.dir.clone().lerp(b.dir, k).normalize();
  return o;
}
export function applyState(u: SkyUniforms, s: SkyState): void {
  u.uTop.value.copy(s.top);
  u.uMid.value.copy(s.mid);
  u.uHor.value.copy(s.hor);
  u.uLit.value.copy(s.lit);
  u.uShade.value.copy(s.shade);
  u.uSunDir.value.copy(s.dir);
}
