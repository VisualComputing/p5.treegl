let easycam;
let p, v, pv;

let log;
let world;
let pnt, vec;

let cacheInit;

function setup() {
  createCanvas(600, 450, WEBGL);
  // /*
  // define initial state
  let state = {
    distance: 764.411,
    center: [0, 0, 0],
    rotation: [0, 0, 0, 1],
  };
  console.log(Dw.EasyCam.INFO);
  easycam = new Dw.EasyCam(this._renderer);
  easycam.state_reset = state;   // state to use on reset (double-click/tap)
  easycam.setState(state, 2000); // now animate to that state
  // */
  pnt = createVector(150, 150, 150);
  world = true;

  //ortho(-width / 2, width / 2, -height / 2, height / 2);
  //let eyeZ = (height / 2) / tan(PI / 6);
  //perspective(PI / 3, width / height, eyeZ / 10, eyeZ * 10);

  console.log(pixelDensity());
  //pixelDensity(1);
}

function draw() {
  if (cacheInit) {
    pv = cachePVMatrix();
  }
  background(120);
  push();
  noFill();
  strokeWeight(3);
  box(300);
  pop();
  push();
  fill(0, 0, 255);
  box(150);
  pop();
  push();
  strokeWeight(10);
  if (world) {
    stroke(255, 0, 0);
    point(pnt.x, pnt.y, pnt.z);
  }
  else {
    if (log === frameCount) {
      console.log('P', this._renderer.cPMatrix);
      console.log('V', this._renderer.cVMatrix);
      console.log('PV', this._renderer.cPVMatrix);
    }
    if (cacheInit) {
      vec = screenLocation({ vector: pnt });
    }
    else {
      vec = screenLocation({ vector: pnt, pvMatrix: pv });
    }
    if (log === frameCount) {
      console.log(vec);
    }
    vec = cacheInit ? screenLocation({ vector: pnt, pvMatrix: pv }) : screenLocation({ vector: pnt });
    beginHUD();
    stroke(cacheInit ? 'yellow' : 'white');
    point(vec.x, vec.y);
    endHUD();
  }
  pop();
}

function keyPressed() {
  if (key === 'c') {
    cacheInit = !cacheInit;
  }
  if (key === 'l') {
    let p_ = cachePMatrix().copy();
    let v_ = cacheVMatrix().copy();
    let pv_ = p_.copy();
    //pv_.mult(v_);
    pv_.times(v_);
    console.log('p_', p_);
    console.log('v_', v_);
    console.log('pv_', pv_);
    log = frameCount + 1;
  }
  if (key === 'w') {
    world = !world;
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