precision highp float;
//#version 120

/*
// Used a bigger poisson disk kernel than in the tutorial to get smoother results
const vec2 poissonDisk[9] = vec2[] (
vec2(0.95581, -0.18159),
vec2(0.50147, -0.35807),
vec2(0.69607, 0.35559),
vec2(-0.0036825, -0.59150),
vec2(0.15930, 0.089750),
vec2(-0.65031, 0.058189),
vec2(0.11915, 0.78449),
vec2(-0.34296, 0.51575),
vec2(-0.60380, -0.41527)
);
*/

// Unpack the 16bit depth float from the first two 8bit channels of the rgba vector
float unpackDepth(vec4 color) {
    return color.r + color.g / 255.0;
}

uniform sampler2D shadowMap;
varying vec4 vVertexColor;
varying vec4 shadowCoord;
varying float lightIntensity;

void main(void) {
    // Project shadow coords, needed for a perspective light matrix (spotlight)
    vec3 shadowCoordProj = shadowCoord.xyz / shadowCoord.w;

    // Only render shadow if fragment is facing the light
    if (lightIntensity > 0.5) {
        vec2 poissonDisk[9];
        poissonDisk[0] = vec2(0.95581, -0.18159);
        poissonDisk[1] = vec2(0.50147, -0.35807);
        poissonDisk[2] = vec2(0.69607, 0.35559);
        poissonDisk[3] = vec2(-0.0036825, -0.59150);
        poissonDisk[4] = vec2(0.15930, 0.089750);
        poissonDisk[5] = vec2(-0.65031, 0.058189);
        poissonDisk[6] = vec2(0.11915, 0.78449);
        poissonDisk[7] = vec2(-0.34296, 0.51575);
        poissonDisk[8] = vec2(-0.60380, -0.41527);
        
        float visibility = 9.0;
        // I used step() instead of branching, should be much faster this way
        for (int n = 0; n < 9; ++n)
        visibility += step(shadowCoordProj.z, unpackDepth(texture2D(shadowMap, shadowCoordProj.xy + poissonDisk[n] / 512.0)));
        gl_FragColor = vec4(vVertexColor.rgb * min(visibility * 0.05556, lightIntensity), vVertexColor.a);
    } else
    gl_FragColor = vec4(vVertexColor.rgb * lightIntensity, vVertexColor.a);
}
