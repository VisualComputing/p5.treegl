precision mediump float;

uniform sampler2D depthMap;
uniform float ambient;
uniform vec4 uMaterialColor;
varying vec3 normal3;
varying vec3 direction3;
varying vec4 lPosition4;

// following: https://learnopengl.com/Advanced-Lighting/Shadows/Shadow-Mapping

float visibility(vec4 lPosition4) {
  // perform perspective divide
  vec3 lPosition3=lPosition4.xyz/lPosition4.w;
  // get closest depth value from light's perspective (using [0,1] range fragPosLight as coords)
  float closestDepth=texture2D(depthMap,lPosition3.xy).r;
  // get depth of current fragment from light's perspective
  float currentDepth=lPosition3.z;
  // check whether current frag pos is in shadow
  return currentDepth < closestDepth ? 1.0 : 0.5;
}

void main() {
  float diffuse = max(0.0, dot(direction3, normal3));
  float visibility=visibility(lPosition4);
  // make visibility 1 to render the scene without shadow mapping
  //visibility=1.;
  gl_FragColor = (ambient + visibility*diffuse) * uMaterialColor;
}