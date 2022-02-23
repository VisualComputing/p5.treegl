// texture
let img;
// check box
let auto_rotate;
// select
let mode;
// slider
let details;
let easycam;
let p, v, pv;

let world;
let pnt, vec;

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

  pnt = createVector(120, 80, -200);
  world = true;

  //ortho(-width / 2, width / 2, -height / 2, height / 2);
  let eyeZ = (height/2) / tan(PI/6);
  perspective(PI/3, width/height, eyeZ/10, eyeZ*10);
}

let log;

function draw() {
  //pv = cachePVMatrix();
  background(120);
  push();
  strokeWeight(10);
  if (world) {
    stroke(255, 0, 0);
    point(pnt.x - width / 2, pnt.y - height / 2, pnt.z);
  }
  else {
    if (log === frameCount) {
      console.log('P', this._renderer.cPMatrix);
      console.log('V', this._renderer.cVMatrix);
      console.log('PV', this._renderer.cPVMatrix);
    }
    vec = screenLocation({ vector: pnt });// looks broken
    if (log === frameCount) {
      console.log(vec);
    }
    //vec = screenLocation({ vector: pnt, pvMatrix: pv });
    easycam.beginHUD();
    //beginHUD();
    stroke(255, 255, 0);
    point(vec.x, vec.y);
    //endHUD();
    //point(0, 0);
    easycam.endHUD();
  }
  pop();
  /*
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
  */
}

function keyPressed() {
  if (key === 't') {
    let p_ = cachePMatrix().copy();
    let v_ = cacheVMatrix().copy();
    let pv_ = p_.copy();
    //pv_.mult(v_);
    pv_.times(v_);
    console.log('p', p_);
    console.log('v', v_);
    console.log('pv', pv_);
    /*
    console.log('p', p_);
    console.log('pv', pv_);
    */
  }
  if (key === 'l') {
    log = frameCount + 1;
  }
  if (key === 'w') {
    world = !world;
  }
  if (key === 'e') {
    console.log(view);
  }
  /*
  if (key === 'p') {
    let vector = createVector(100, 500, 0.8);
    //let result = ndcToScreenLocation(vector);
    let result = screenLocation({ vector: vector });
    //let result = screenLocation({ vector: vector, pvMatrix: pvMatrix });
    console.log(result);
  }
  */
  if (key === 'm') {
    console.log(pv);
    //console.log(view);
  }
  if (key === 'v') {
    console.log(vec);
  }
  if (key === 'x') {
    noLoop();
  }
  if (key === 'y') {
    loop();
  }
}

/*
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  easycam.setViewport([0, 0, windowWidth, windowHeight]);
}
*/