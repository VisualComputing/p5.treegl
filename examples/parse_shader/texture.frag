precision mediump float;

// texture is sent by the sketch
uniform sampler2D texture;

// interpolated color (same name and type as in vertex shader)
varying vec4 color4;
// interpolated texcoord (same name and type as in vertex shader)
varying vec2 texCoords2;

void main() {
  // texture2D(texture, texCoords2) samples texture at texCoords2 
  // and returns the normalized texel color
  // texel color times color4 gives the final normalized pixel color
  gl_FragColor = texture2D(texture, texCoords2) * color4;
  //gl_FragColor = color4;
}