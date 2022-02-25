let easycam;
let state
let p, v, pv, pvInv;

let log;
let world;
let pnt, toScreen, fromScreen;

let cacheInit;
let persp;

function setup() {
  createCanvas(600, 450, WEBGL);
  // easy stuff
  state = {
    distance: 764.411,
    center: [0, 0, 0],
    rotation: [0, 0, 0, 1],
  };
  console.log(Dw.EasyCam.INFO);
  easycam = new Dw.EasyCam(this._renderer);
  easycam.state_reset = state;   // state to use on reset (double-click/tap)
  easycam.setState(state, 2000); // now animate to that state
  // world point to be projected onto screen
  pnt = createVector(150, 150, 150);
  world = true;

  console.log(pixelDensity());
  //pixelDensity(1);

  persp = true;
}

function draw() {
  if (cacheInit) {
    pvInvMatrix();
    //pv = cachePVMatrix();
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
    /*
    if (log === frameCount) {
      console.log('P', this._renderer.cPMatrix);
      console.log('V', this._renderer.cVMatrix);
      console.log('PV', this._renderer.cPVMatrix);
    }
    */
    toScreen = cacheInit ? screenLocation({ vector: pnt, pvMatrix: _renderer.cPVMatrix }) : screenLocation({ vector: pnt });
    beginHUD();
    stroke(cacheInit ? 'yellow' : 'white');
    //stroke('white');
    point(toScreen.x, toScreen.y);
    endHUD();

    fromScreen = cacheInit ? treeLocation({ vector: toScreen, pvInvMatrix: _renderer.cPVInvMatrix }) : treeLocation({ vector: toScreen });
    if (log === frameCount) {
      console.log('pnt', pnt, 'toScreen', toScreen, 'frameScreen', fromScreen);
    }
  }
  pop();
}

function keyPressed() {
  if (key === 'p') {
    persp = !persp;
    if (persp) {
      //let eyeZ = (height / 2) / tan(PI / 6);
      //perspective(PI / 3, width / height, eyeZ / 10, eyeZ * 10);
      perspective();
    }
    else {
      ortho(-width / 2, width / 2, -height / 2, height / 2, 1, 5000);
    }
    //easycam.setState(state, 2000);
  }
  if (key === 'c') {
    cacheInit = !cacheInit;
  }
  if (key === 'l') {
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