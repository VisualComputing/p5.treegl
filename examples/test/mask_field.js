let maskShader;
let img;

function preload() {
  // a shader is composed of two parts, a vertex shader, and a fragment shader
  // the vertex shader prepares the vertices and geometry to be drawn
  // the fragment shader renders the actual pixel colors
  // loadShader() is asynchronous so it needs to be in preload
  // loadShader() first takes the filename of a vertex shader, and then a frag shader
  // these file types are usually .vert and .frag, but you can actually use anything. .glsl is another common one
  maskShader = loadShader('/sketches/shaders/shader.vert', '/sketches/shaders/mask_field.frag');
  //img = loadImage('/shaders/docs/sketches/vc/fire_breathing.jpg');
  img = loadImage('/sketches/shaders/mandrill.png');
}

function setup() {
  // shaders require WEBGL mode to work
  //createCanvas(800, 600, WEBGL);
  createCanvas(600, 600, WEBGL);
  // Both defaults work just as well
  // If none is provided perspective is used
  //let eyeZ = (height/2.0) / tan(PI*60.0/360.0);
  //perspective(PI/3.0, width/height, eyeZ/10.0, eyeZ*10.0);
  //ortho(-width/2, width/2, -height/2, height/2);
  // other examples:
  noStroke();
  shader(maskShader);
  textureMode(NORMAL);
  maskShader.setUniform('texture', img);
  maskShader.setUniform('radius', 50*pixelDensity());
  maskShader.setUniform('u_resolution', [width*pixelDensity(), height*pixelDensity()]);
  //maskShader.setUniform('mask', [1/9, 1/9, 1/9, 1/9, 1/9, 1/9, 1/9, 1/9, 1/9]);
  //maskShader.setUniform('mask', [-1, -1, -1, -1, 8, -1, -1, -1, -1]);
  maskShader.setUniform('mask', [0, -1, 0, -1, 5, -1, 0, -1, 0]);
  maskShader.setUniform('texOffset', [1 / img.width, 1 / img.height]);
}

function draw() {
  background(0);
  maskShader.setUniform('u_mouse', [mouseX*pixelDensity(), (height - mouseY)*pixelDensity()]);
  cover(true);
}

function cover(texture = false) {
  beginShape();
  if (texture) {
    vertex(-width / 2, -height / 2, 0, 0, 0);
    vertex(width / 2, -height / 2, 0, 1, 0);
    vertex(width / 2, height / 2, 0, 1, 1);
    vertex(-width / 2, height / 2, 0, 0, 1);
  }
  else {
    vertex(-width / 2, -height / 2, 0);
    vertex(width / 2, -height / 2, 0);
    vertex(width / 2, height / 2, 0);
    vertex(-width / 2, height / 2, 0);
  }
  endShape(CLOSE);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}