precision mediump float;

// source (image or video) is sent by the sketch
uniform sampler2D source;
// palette is sent by the sketch
uniform sampler2D palette;
// number of palette elements is sent by the sketch
uniform float n;
// displays original
uniform bool original;
// toggles keys
uniform bool keys;
// target horizontal & vertical resolution
uniform float resolution;

// interpolated texcoord (same name and type as in vertex shader)
// defined as a (normalized) vec2 in [0..1]
varying vec2 texcoords2;

float luma(vec3 key) {
  return 0.299 * key.r + 0.587 * key.g + 0.114 * key.b;
}

void main() {
  if (original) {
    gl_FragColor = texture2D(source, texcoords2);
  }
  else {
    // i. define symbolCoord as a texcoords2 remapping in [0.0, resolution] ∈ R
    vec2 symbolCoord = texcoords2 * resolution;
    // ii. define stepCoord as a symbolCoord remapping in [0.0, resolution] ∈ Z
    vec2 stepCoord = floor(symbolCoord);
    // iii. remap symbolCoord to [0.0, 1.0] ∈ R
    symbolCoord = symbolCoord - stepCoord;
    // remap stepCoord to [0.0, 1.0] ∈ R
    stepCoord = stepCoord / vec2(resolution);
    // get vec4 color hash key
    vec4 key = texture2D(source, stepCoord);
    if (keys) {
      gl_FragColor = key;
    } else {
      // define paletteCoord as: vec2(luma' + s', symbolCoord.t), see fig:
      // *__________1__________2_________...________n
      // |          |          |          |         |
      // |          |     luma'|          |         |
      // |----------|--------->|      s'  |         |
      // |          |          |------>*  |         |
      // *__________|__________|__________|_________|
      // 1. luma' (i.e., offset in palette)
      // luma(key.rgb) * n : define luma' in [0.0, n] ∈ R
      // floor(luma(key.rgb) * n)) : remap luma' to [0.0, n] ∈ Z
      // floor(luma(key.rgb) * n)) / n : remap luma' to [0.0, 1.0] ∈ R
      // (see: https://thebookofshaders.com/glossary/?search=floor)
      // 2. s'
      // symbolCoord.s / n : remap symbolCoord.s to [0.0, 1 / n] ∈ R
      vec2 paletteCoord = vec2((floor(luma(key.rgb) * n) + symbolCoord.s) / n, symbolCoord.t);
      vec4 paletteTexel = texture2D(palette, paletteCoord);
      gl_FragColor = paletteTexel;
    }
  }
}