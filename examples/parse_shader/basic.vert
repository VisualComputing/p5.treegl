precision highp float;

attribute vec3 aPosition;
attribute vec2 aTexCoord;
attribute vec4 aVertexColor;
//uniform mat4 uProjectionMatrix;
//uniform mat4 uModelViewMatrix;
uniform mat4 pmvMatrix;
varying vec4 vVertexColor;
varying vec2 vTexCoord;

void main() {
  vVertexColor = aVertexColor;
  vTexCoord = aTexCoord;
  gl_Position = pmvMatrix * vec4(aPosition, 1.0);
  //gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
}