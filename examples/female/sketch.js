let easycam;
let state;
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

  //frustum([left], [right], [bottom], [top], [near], [far]);
  //frustum(-150.1, 200.2, -90.3,      70.4, 1.5, 5000.6);

  //let eyeZ = (height / 2) / tan(PI / 6);
  //perspective(PI / 3, width / height, eyeZ / 10, eyeZ * 10);
  perspective(PI / 3, width / height, 2.1, 50.2);

//ortho([left], [right], [bottom], [top], [near], [far])
  //ortho(-150.1, 200.2, -90.3,      70.4, 1.5, 4500.6);
  console.log('near', this._renderer._near());
  console.log('far', this._renderer._far());
  console.log('left', this._renderer._left());
  console.log('right', this._renderer._right());
  console.log('bottom', this._renderer._bottom());
  console.log('top', this._renderer._top());
  console.log('fov', this._renderer._fov());
  console.log('hfov', this._renderer._hfov());
}

function draw() {
  if (cacheInit) {
    pv = pvMatrix();
    pvInv = pvInvMatrix({ pvMatrix: pv });
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
    toScreen = cacheInit ? treeLocation(pnt, { from: 'WORLD', to: 'SCREEN', pvMatrix: pv }) : treeLocation(pnt, { from: 'WORLD', to: 'SCREEN' });
    beginHUD();
    stroke(cacheInit ? 'yellow' : 'white');
    //stroke('white');
    point(toScreen.x, toScreen.y);
    endHUD();
    fromScreen = cacheInit ? treeLocation(toScreen, { from: 'SCREEN', to: 'WORLD', pvInvMatrix: pvInv }) : treeLocation(toScreen, { from: 'SCREEN', to: 'WORLD' });
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