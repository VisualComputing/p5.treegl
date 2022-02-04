let shader_toy;

function preload() {
  shader_toy = getShader('shader.frag');
}

function setup() {
  createCanvas(640, 360, WEBGL);
  noStroke();
  shader(shader_toy);
  emitResolution(shader_toy, 'resolution');
}

function draw() {
  background(0);
  emitMousePosition(shader_toy, 'mouse');
  shader_toy.setUniform('time', Date.now());
  //shader.set("time", (float)(millis()/1000.0));
  cover();
}

/*
let mask_shader;
let enable_shader;
let img;

function preload() {
  mask_shader = getShader('shader.frag');
  img = loadImage('mandrill.png');
}

function setup() {
  createCanvas(400, 400, WEBGL);
  noStroke();
  enable_shader = false;
}

function draw() {
  if (enable_shader) {
    emitMousePosition(mask_shader);
    cover(true);
  }
  else {
    background(200);
    orbitControl();
    rotateY(0.5);
    box(30, 50);
  }
}

function keyPressed () {
  if (key == 'b') {
    enable_shader = !enable_shader;
  }
  if (enable_shader) {
    shader(mask_shader);
    mask_shader.setUniform('texture', img);
    mask_shader.setUniform('radius', 50*pixelDensity());
    emitResolution(mask_shader);
    //shaderBoxInstance.setUniform('mask', [1/9, 1/9, 1/9, 1/9, 1/9, 1/9, 1/9, 1/9, 1/9]);
    //shaderBoxInstance.setUniform('mask', [-1, -1, -1, -1, 8, -1, -1, -1, -1]);
    mask_shader.setUniform('mask', [0, -1, 0, -1, 5, -1, 0, -1, 0]);
    mask_shader.setUniform('texOffset', [1 / img.width, 1 / img.height]);
  }
  else {
    resetShader();
  }
}

/*
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  emitResolution(shader_box);
}
// */