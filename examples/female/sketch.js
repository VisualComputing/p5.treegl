// texture
let img;
// check box
let auto_rotate;
// select
let mode;
// slider
let details;

let easycam;

function preload() {
  img = loadImage('img.jpg');
}

function setup() {
  createCanvas(400, 400, WEBGL);
  textureMode(NORMAL);
  auto_rotate = createCheckbox('auto rotate', true);
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

  /*
  // define initial state
  let state = {
    distance: 164.411,
    center: [0, 0, 0],
    rotation: [-0.285, -0.257, -0.619, 0.685],
  };
  console.log(Dw.EasyCam.INFO);
  easycam = new Dw.EasyCam(this._renderer);
  easycam.state_reset = state;   // state to use on reset (double-click/tap)
  easycam.setState(state, 2000); // now animate to that state
  */
}

function draw() {
  background(200);
  // /*
  if (auto_rotate.checked()) {
    rotateZ(frameCount * 0.01);
    rotateX(frameCount * 0.01);
    rotateY(frameCount * 0.01);
  }
  else {
    orbitControl();
  }
  // */
  push();
  switch(mode.value()) {
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
  hollowCylinder({ radius: 50, detail : details.value() });
  pop();
}

function keyPressed() {
  _bind();
  let vector = createVector(-0.1, 0.5, 0.8);
  //let result = ndcToScreenLocation(vector);
  let result = screenLocation(vector);
  console.log(result);
  /*
  _bind();
  let pv = cPVMatrix();
  let pvi = pv.copy();
  pvi.invert();
  console.log(pvi);
  console.log(cPVInvMatrix());
  */
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  //easycam.setViewport([0, 0, windowWidth, windowHeight]);
}