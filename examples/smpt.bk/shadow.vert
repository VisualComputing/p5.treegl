precision mediump float;
attribute vec3 aPosition;
attribute vec3 aNormal;
uniform mat4 uProjectionMatrix;
//uniform mat4 uModelViewProjectionMatrix;
uniform mat4 uModelViewMatrix;
uniform mat3 uNormalMatrix;

// custom
// transforms from eye to light
uniform mat4 transform4x4;
// light position in eye space
uniform vec3 uLightPosition;

// out
varying vec3 normal3;
varying vec3 direction3;
varying vec4 lPosition4;

void main() {
  // normal vector in eye space
  normal3 = normalize(uNormalMatrix * aNormal);
  // local to eye transform
  vec4 position4 = uModelViewMatrix * vec4(aPosition, 1.0);
  // eye to light transform
  // Normal bias removes the shadow acne
  lPosition4 = transform4x4 * (position4 + vec4(normal3, 0.0));
  // light direction in eye space
  //direction3 = normalize(uLightPosition - vec3(position4));
  direction3 = normalize(uLightPosition - position4.xyz);
  //gl_Position = uModelViewProjectionMatrix * vec4(aPosition, 1.0);
  // eye to clip space transform
  gl_Position = uProjectionMatrix * position4;
}