precision mediump float;

uniform sampler2D depthMap;
uniform float ambient;
uniform vec4 uMaterialColor;
varying vec3 normal3;
varying vec3 direction3;
varying vec4 lPosition4;

vec2 poissonDisk(int n) {
  if (n == 0) {
    return vec2(0.95581, -0.18159);
  }
  if (n == 1) {
    return vec2(0.50147, -0.35807);
  }
  if (n == 2) {
    return vec2(0.69607, 0.35559);
  }
  if (n == 3) {
    return vec2(-0.0036825, -0.59150);
  }
  if (n == 4) {
    return vec2(0.15930, 0.089750);
  }
  if (n == 5) {
    return vec2(-0.65031, 0.058189);
  }
  if (n == 6) {
    return vec2(0.11915, 0.78449);
  }
  if (n == 7) {
    return vec2(-0.34296, 0.51575);
  }
  return vec2(-0.60380, -0.41527);
}

// following: https://learnopengl.com/Advanced-Lighting/Shadows/Shadow-Mapping

float visibility(vec4 lPosition4) {
  float visibility = 9.0;
  // Project shadow coords, needed for a perspective light matrix (spotlight)
  vec3 lPosition3 = lPosition4.xyz / lPosition4.w;
  // I used step() instead of branching, should be much faster this way
  for (int n = 0; n < 9; ++n) {
    visibility += step(lPosition3.z, texture2D(depthMap, lPosition3.xy + poissonDisk(n) / 512.0).r);
  }
  return visibility;
}

void main() {
  float diffuse = max(0.0, dot(direction3, normal3));
  gl_FragColor = (ambient + min(visibility(lPosition4) * 0.05556, diffuse)) * uMaterialColor;
}