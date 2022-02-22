// texture
let img;
// check box
let auto_rotate;
// select
let mode;
// slider
let details;
let easycam;
//let pvMatrix;
let vMatrix;

function preload() {
  img = loadImage('img.jpg');
}

function setup() {
  createCanvas(600, 450, WEBGL);
  textureMode(NORMAL);
  auto_rotate = createCheckbox('auto rotate', false);
  auto_rotate.style('color', 'magenta');
  auto_rotate.position(10, 10);
  details = createSlider(3, 50, 20, 1);
  details.position(10, 40);
  details.style('width', '80px');
  mode = createSelect();
  mode.position(10, 70);
  mode.option('Fill');
  mode.option('Wiredframe');
  mode.option('Texture');
  mode.value('Wiredframe');
  //ortho(-width / 2, width / 2, -height / 2, height / 2);
  // define initial state
  let state = {
    distance: 764.411,
    center: [0, 0, 0],
    rotation: [-0.285, -0.257, -0.619, 0.685],
  };
  console.log(Dw.EasyCam.INFO);
  easycam = new Dw.EasyCam(this._renderer);
  easycam.state_reset = state;   // state to use on reset (double-click/tap)
  easycam.setState(state, 2000); // now animate to that state
}

function draw() {
  vMatrix = cacheVMatrix();
  //pvMatrix = cachePVMatrix();
  background(120);
  if (auto_rotate.checked()) {
    rotateZ(frameCount * 0.01);
    rotateX(frameCount * 0.01);
    rotateY(frameCount * 0.01);
  }
  lights();
  scale(10);
  strokeWeight(1);
  switch (mode.value()) {
    case 'Fill':
      fill(255, 0, 0);
      break;
    case 'Wiredframe':
      noFill();
      stroke(0, 255, 255);
      break;
    default:
      texture(img);
  }
  box(30);
  push();
  translate(0, 0, 20);
  fill(0, 0, 255);
  box(5);
  pop();
}

function keyPressed() {
  if (key === 'v') {
    console.log(vMatrix);
  }
  if (key === 'p') {
    let vector = createVector(100, 500, 0.8);
    //let result = ndcToScreenLocation(vector);
    let result = screenLocation({ vector: vector });
    //let result = screenLocation({ vector: vector, pvMatrix: pvMatrix });
    console.log(result);
  }
}

/*
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  easycam.setViewport([0, 0, windowWidth, windowHeight]);
}
*/