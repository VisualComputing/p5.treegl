precision mediump float;

// palette is sent by the sketch
uniform sampler2D palette;
// toggles keys
uniform bool keys;
// source (image or video) is sent by the sketch
uniform sampler2D source;
// displays original
uniform bool original;
// target horizontal & vertical resolution
uniform float resolution;

// interpolated texcoord (same name and type as in vertex shader)
// defined as a (normalized) vec2 in [0..1]
varying vec2 texcoords2;

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
    vec4 paletteTexel = texture2D(palette, symbolCoord);
    gl_FragColor = keys ? key : paletteTexel;
  }
}