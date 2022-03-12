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
    distance: 730.7707043259237,
    center: [-171.71754067715335, -13.306287366010695, -5.383726155867617],
    rotation: [-0.10543233539799196, 0.016249581962348766, 0.30986156074636084, 0.9447781680957708],
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
  //perspective(PI / 3, width / height, 2.1, 50.2);
  //perspective();
  let eyeZ = (height / 2) / tan(PI / 6);
  perspective(PI / 3, width / height, eyeZ / 10, eyeZ * 10);

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
  translate(50, 100, 0);
  fill(0, 0, 255);
  box(150);
  // /*
  if (log === frameCount) {
    let m = mMatrix();
    let v = vMatrix();
    let mv = v.copy().apply(m);
    let cmv = mvMatrix();
    console.log(mv);
    console.log(cmv);
    let _mv = mvMatrix({mMatrix: m, vMatrix: v});
    console.log(_mv);
    console.log(tMatrix(_mv));
    let vec4 = [10, - 5, 15, 1];
    let pvec = createVector(...vec4);
    console.log(pvec);
    console.log('mult4', _mv.mult4(pvec));
    console.log('_mult4', _mv._mult4(vec4));
  }
  //*/
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
    /*
    if (log === frameCount) {
      console.log('pnt', pnt, 'toScreen', toScreen, 'fromScreen', fromScreen);
    }
    */
  }
  pop();
}

function keyPressed() {
  if (key === 'p') {
    persp = !persp;
    if (persp) {
      let eyeZ = (height / 2) / tan(PI / 6);
      perspective(PI / 3, width / height, eyeZ / 10, eyeZ * 10);
      //perspective();
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
  if (key === 'v') {
    v = vMatrix();
    console.log(v);
  }
  if (key === 's') {
    let s = easycam.state.copy();
    console.log(s);
  }
  if (key === 'd') {
    let i = iMatrix();
    let e = eMatrix();
    let v = createVector(15, -25, 70);
    let r = treeDisplacement(v, {from: 'WORLD', to: 'EYE'});
    console.log('*', treeDisplacement(v, {from: i, to: e}));
    console.log(dMatrix(i, e).mult3(v));
    console.log(r);
    console.log(treeDisplacement(v, {from: i, to: 'EYE'}));
    let r_ = treeDisplacement(r, {from: 'EYE', to: 'WORLD'});
    console.log(r_);
    console.log(treeDisplacement(r, {from: 'EYE', to: i}));
    console.log('+', treeDisplacement(r, {from: e, to: i}));
    console.log(dMatrix(e, i).mult3(r));
  }
}

/*
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  easycam.setViewport([0, 0, windowWidth, windowHeight]);
}
*/