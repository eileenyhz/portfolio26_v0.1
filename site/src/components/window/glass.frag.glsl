// The glass: the sky, the blind's faint shadow just under its edge, a faint sheen, and a little grain.
uniform sampler2D uSky; uniform float uTime; varying vec2 vUv;
float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
void main() {
  vec3 col = texture2D(uSky, vUv).rgb;
  vec2 ref = vec2(161.0 + vUv.x * 598.0, 170.0 + (1.0 - vUv.y) * 915.0);
  float arcY = -472.0 + sqrt(733.0 * 733.0 - (ref.x - 487.0) * (ref.x - 487.0));
  col *= 1.0 - 0.07 * (1.0 - smoothstep(arcY, arcY + 14.0, ref.y));
  float u = vUv.x * 0.7 + (1.0 - vUv.y) * 0.5;
  col = mix(col, vec3(1.0), (smoothstep(0.28, 0.33, u) * (1.0 - smoothstep(0.33, 0.47, u)) + 0.6 * smoothstep(0.52, 0.54, u) * (1.0 - smoothstep(0.54, 0.58, u))) * 0.07);
  col += (hash12(gl_FragCoord.xy + fract(uTime * 7.31) * 91.7) - 0.5) * 0.06;
  gl_FragColor = vec4(col, 1.0);
}
