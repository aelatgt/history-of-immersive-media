const glsl = `
uniform samplerCube cubeMap;
uniform float time;
uniform float radius;

varying vec2 vUv;
varying vec3 vRay;
varying vec3 vNormal;

#define RING_COLOR vec3(0.1, 0.6, 0.9)
#define RING_WIDTH 0.08
#define RING_HARD_OUTER 0.01
#define RING_HARD_INNER 0.05
#define forward vec3(0.0, 0.0, 1.0)

void main() {
  vec2 coord = vUv * 2.0 - 1.0;
  float noise = snoise(vec3(coord * 1., time)) * 0.5 + 0.5;

  // Polar distance
  float dist = length(coord);
  dist += noise * 0.2;

  float maskOuter = smoothstep(radius, radius - RING_HARD_OUTER, dist);
  float maskInner = smoothstep(radius - RING_WIDTH + RING_HARD_INNER, radius - RING_WIDTH, dist);
  float distortion = smoothstep(radius - 0.2, radius + 0.2, dist);
  vec3 normal = normalize(vNormal);
  float directView = smoothstep(0., 0.8, dot(normal, forward));
  vec3 tangentOutward = vec3(coord, 0.0);
  vec3 ray = mix(vRay, tangentOutward, distortion);
  vec4 texel = textureCube(cubeMap, ray);
  vec3 centerLayer = texel.rgb * maskInner;
  vec3 ringLayer = RING_COLOR * (1. - maskInner);
  vec3 composite = centerLayer + ringLayer;

  gl_FragColor = vec4(composite, (maskOuter - maskInner) + maskInner * directView);
}
`
export default glsl
