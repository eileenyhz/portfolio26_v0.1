// The cloud sea, raymarched: domes of random size over a dense floor, frayed by 3D noise, drifting toward +x.
// The camera sits just above the cloud tops; steps grow with distance, fine up close and coarse in the haze.
uniform float uTime; uniform float uFrame; uniform float uSpeed;
uniform vec2 uRes; uniform mat4 uInvVP; uniform vec3 uCam; uniform sampler2D uRand;
uniform vec3 uTop; uniform vec3 uMid; uniform vec3 uHor; uniform vec3 uLit; uniform vec3 uShade; uniform vec3 uSunDir;
vec4 rnd(vec2 i) { return texture2D(uRand, (mod(i, 64.0) + 0.5) / 64.0); }
float hash3(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float vnoise(vec3 x) {
  vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash3(i), hash3(i + vec3(1, 0, 0)), f.x), mix(hash3(i + vec3(0, 1, 0)), hash3(i + vec3(1, 1, 0)), f.x), f.y),
             mix(mix(hash3(i + vec3(0, 0, 1)), hash3(i + vec3(1, 0, 1)), f.x), mix(hash3(i + vec3(0, 1, 1)), hash3(i + vec3(1, 1, 1)), f.x), f.y), f.z);
}
float fbm3(vec3 p) { return 0.5 * vnoise(p) + 0.25 * vnoise(p * 2.03) + 0.125 * vnoise(p * 4.01); }
float vnoise2(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(rnd(i).x, rnd(i + vec2(1.0, 0.0)).x, f.x), mix(rnd(i + vec2(0.0, 1.0)).x, rnd(i + vec2(1.0, 1.0)).x, f.x), f.y); }
// domes of random size, one per cell; the tallest wins, so neighbours meet in creases
float puffs(vec2 p) {
  vec2 i = floor(p), f = fract(p); float h = 0.0;
  for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
    vec2 g = vec2(float(x), float(y)); vec4 o = rnd(i + g); vec2 d = g + o.xy - f;
    float r = 0.3 + 0.62 * o.z * o.w; float q = r * r - dot(d, d);
    if (q > 0.0) h = max(h, sqrt(q));
  }
  return h;
}
float topH(vec2 q) { return 0.8 * vnoise2(q * 0.02) + 8.5 * puffs(q * 0.05) + 2.0 * puffs(q * 0.12 + 17.0); }
float density(vec3 p) {
  vec2 q = p.xz - vec2(uTime * uSpeed, 0.0);
  float d = topH(q) - p.y;
  if (d < -0.8) return 0.0;
  float n = fbm3(vec3(q.x, p.y * 1.3, q.y) * 0.3);
  return clamp(d * 1.3 + (n - 0.45) * 0.5 + smoothstep(0.4, -0.6, p.y), 0.0, 1.0);
}
float hg(float mu, float g) { float g2 = g * g; return (1.0 - g2) / (12.566 * pow(1.0 + g2 - 2.0 * g * mu, 1.5)); }
vec3 skyCol(vec3 rd) { float e = rd.y; return mix(mix(uHor, uMid, smoothstep(0.0, 0.14, e)), uTop, smoothstep(0.14, 0.45, e)); }
void main() {
  vec2 frag = gl_FragCoord.xy;
  vec4 w = uInvVP * vec4(frag / uRes * 2.0 - 1.0, 1.0, 1.0);
  vec3 ro = uCam, rd = normalize(w.xyz / w.w - ro);
  vec3 acc = vec3(0.0); float T = 1.0;
  if (rd.y < -0.0001) {
    // from the highest cloud top down to the floor; steps grow with distance, fine up close, coarse in the haze
    float t0 = max((9.6 - ro.y) / rd.y, 1.0), t1 = min((-0.5 - ro.y) / rd.y, 300.0);
    vec3 j3 = fract(vec3(frag.xyx + uFrame * 17.37) * 0.1031); j3 += dot(j3, j3.yzx + 33.33);
    float t = t0 + fract((j3.x + j3.y) * j3.z) * clamp(t0 * 0.03, 0.12, 4.0), ph = hg(dot(rd, uSunDir), 0.6);
    for (int i = 0; i < 110; i++) {
      if (t > t1) break;
      float dt = clamp(t * 0.03, 0.12, 4.0);
      vec3 p = ro + rd * t;
      float den = density(p);
      if (den > 0.002) {
        float light = exp(-(density(p + uSunDir * 0.8) * 0.8 + density(p + uSunDir * 2.2)) * 1.3);
        vec3 c = mix(uShade, uLit, clamp(light * 0.85 + clamp((p.y + 0.4) / 10.0, 0.0, 1.0) * 0.3, 0.0, 1.0));
        c += uLit * ph * 0.3 * (1.0 - den);
        c = mix(c, uHor, smoothstep(80.0, 260.0, t) * 0.8);
        float a = 1.0 - exp(-den * dt * 1.5);
        acc += T * a * c; T *= 1.0 - a;
        if (T < 0.02) break;
      }
      t += dt;
    }
  }
  gl_FragColor = vec4(acc + T * skyCol(rd), 1.0);
}
