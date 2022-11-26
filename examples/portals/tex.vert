precision mediump float;
attribute vec3 aPosition;
uniform mat4 uModelViewProjectionMatrix;
varying vec4 position4;
void main() {
  //position2 = vec4(aPosition, 1.0).xy;
  position4 = (uModelViewProjectionMatrix * vec4(aPosition, 1.0));
  gl_Position = uModelViewProjectionMatrix * vec4(aPosition, 1.0);
}