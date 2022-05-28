precision highp float;

// p5
uniform mat4 uProjectionMatrix;
uniform mat4 uModelViewMatrix;
uniform mat3 uNormalMatrix;
// custom
uniform mat4 shadowTransform;
uniform vec3 lightDirection;

attribute vec3 aPosition;
attribute vec4 aVertexColor;
attribute vec3 aNormal;

// varying
varying vec4 vVertexColor;
varying vec4 shadowCoord;
varying float lightIntensity;

void main() {
    // copy / interpolate color
    vVertexColor = aVertexColor;
    vec3 vertNormal = normalize(uNormalMatrix * aNormal);// Get normal direction in model view space
    vec4 vertPosition = uModelViewMatrix * vec4(aPosition, 1.0);
    shadowCoord = shadowTransform * (vertPosition + vec4(vertNormal, 0.0));// Normal bias removes the shadow acne
    lightIntensity = 0.5 + dot(-lightDirection, vertNormal) * 0.5;
    gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
}
