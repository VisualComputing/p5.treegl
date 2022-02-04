precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float radius;

uniform sampler2D texture;
uniform vec2 texOffset;
// holds the 3x3 kernel
uniform float mask[9];

// we need our interpolated color
varying vec4 vVertexColor;
// we need our interpolated tex coord
varying vec2 vTexCoord;

float map(float value, float start1, float stop1, float start2, float stop2) {
  return start2 + (value - start1) * (stop2 - start2) / (stop1 - start1);
}

vec2 map(vec2 value, vec2 start1, vec2 stop1, vec2 start2, vec2 stop2) {
  return start2 + (value - start1) * (stop2 - start2) / (stop1 - start1);
}

vec3 map(vec3 value, vec3 start1, vec3 stop1, vec3 start2, vec3 stop2) {
  return start2 + (value - start1) * (stop2 - start2) / (stop1 - start1);
}

vec4 map(vec4 value, vec4 start1, vec4 stop1, vec4 start2, vec4 stop2) {
  return start2 + (value - start1) * (stop2 - start2) / (stop1 - start1);
}

void main() {
  /*
  vec2 st = gl_FragCoord.xy/u_resolution;
  vec2 mouse = map(u_mouse, vec2(0.0), u_resolution, vec2(0.0), vec2(1.0));
  float pct = distance(st, mouse);
  if (pct >= 0.2) {
     gl_FragColor = texture2D(texture, vTexCoord) * vVertexColor;
  }
  */
  //vec2 st = gl_FragCoord.xy/u_resolution;
  //vec2 mouse = map(u_mouse, vec2(0.0), u_resolution, vec2(0.0), vec2(1.0));
  float pct = distance(gl_FragCoord.xy, u_mouse);
  if (pct >= radius) {
    gl_FragColor = texture2D(texture, vTexCoord) * vVertexColor;
  }
  else {
    // 1. Use offset to move along texture space.
    // In this case to find the indeces of the texel neighbours.
    vec2 tc0 = vTexCoord + vec2(-texOffset.s, -texOffset.t);
    vec2 tc1 = vTexCoord + vec2(         0.0, -texOffset.t);
    vec2 tc2 = vTexCoord + vec2(+texOffset.s, -texOffset.t);
    vec2 tc3 = vTexCoord + vec2(-texOffset.s,          0.0);
    vec2 tc4 = vTexCoord + vec2(         0.0,          0.0);
    vec2 tc5 = vTexCoord + vec2(+texOffset.s,          0.0);
    vec2 tc6 = vTexCoord + vec2(-texOffset.s, +texOffset.t);
    vec2 tc7 = vTexCoord + vec2(         0.0, +texOffset.t);
    vec2 tc8 = vTexCoord + vec2(+texOffset.s, +texOffset.t);

    // 2. Sample texel neighbours within the rgba array
    vec4 rgba[9];
    rgba[0] = texture2D(texture, tc0);
    rgba[1] = texture2D(texture, tc1);
    rgba[2] = texture2D(texture, tc2);
    rgba[3] = texture2D(texture, tc3);
    rgba[4] = texture2D(texture, tc4);
    rgba[5] = texture2D(texture, tc5);
    rgba[6] = texture2D(texture, tc6);
    rgba[7] = texture2D(texture, tc7);
    rgba[8] = texture2D(texture, tc8);

    // 3. Apply convolution kernel
    vec4 convolution;
    for (int i = 0; i < 9; i++) {
      convolution += rgba[i]*mask[i];
    }

    // 4. Mix convolution & color
    gl_FragColor = vec4(convolution.rgb, 1.0) * vVertexColor; 
  }
}