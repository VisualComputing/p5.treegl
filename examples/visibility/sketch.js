'use strict';

let fbo1, fbo2;
let cam1, cam2;
let length = 600;
let hue;
const size = 30
let foreshortening = true;
let box = false;

function setup() {
  createCanvas(length, length / 2);
  // frame buffer object instances (FBOs)
  fbo1 = createGraphics(width / 2, height, WEBGL);
  fbo2 = createGraphics(width / 2, height, WEBGL);
  //fbo2.ortho();
  fbo2.ortho(-fbo2.width / 2, fbo2.width / 2, -fbo2.height / 2, fbo2.height / 2, 1, 10000);
  // FBOs cams
  cam1 = new Dw.EasyCam(fbo1._renderer, { distance: 200 });
  let state1 = cam1.getState();
  cam1.attachMouseListeners(this._renderer);
  cam1.state_reset = state1;   // state to use on reset (double-click/tap)
  cam1.setViewport([0, 0, width / 2, height]);
  cam1.setPanScale(0.005);
  cam2 = new Dw.EasyCam(fbo2._renderer, { rotation: [0.94, 0.33, 0, 0] });
  cam2.attachMouseListeners(this._renderer);
  let state2 = cam2.getState();
  cam2.state_reset = state2;   // state to use on reset (double-click/tap)
  cam2.setViewport([width / 2, 0, width / 2, height]);
  document.oncontextmenu = function () { return false; }
  // scene
  print(fbo1.distanceToBound([], Tree.NEAR));
}

function draw() {
  fbo1.background(175, 125, 115);
  fbo1.reset();
  fbo1.axes({ size: 100, bits: Tree.X | Tree.YNEG });
  fbo1.grid();
  scene1();
  beginHUD();
  image(fbo1, 0, 0);
  endHUD();
  fbo2.background(130);
  fbo2.reset();
  fbo2.axes();
  fbo2.grid();
  scene2();
  fbo2.push();
  fbo2.strokeWeight(3);
  fbo2.stroke(255, 0, 255);
  fbo2.fill(255, 0, 255, 100);
  fbo2.viewFrustum({ fbo: fbo1, bits: Tree.BODY });
  // other options are:
  //fbo2.viewFrustum({ fbo: fbo1, bits: Tree.NEAR | Tree.BODY, viewer: () => fbo2.axes({ size: 50, bits: Tree.Y | Tree.X }) });
  //fbo2.viewFrustum({ fbo: fbo1, bits: Tree.NEAR | Tree.BODY, viewer: () => fbo2.box(30) });
  //fbo2.viewFrustum({fbo: fbo1, bits: Tree.NEAR | Tree.BODY, viewer: Tree.NONE});
  fbo2.pop();
  beginHUD();
  image(fbo2, width / 2, 0);
  endHUD();
}

function scene1() {
  let vis = fbo1.visibility(box ? { corner1: [-size / 2, -size / 2, -size / 2], corner2: [size / 2, size / 2, size / 2] } :
    { center: [0, 0, 0], radius: size });
  hue = vis === Tree.VISIBLE ? 'green' : vis === Tree.SEMIVISIBLE ? 'blue' : 'red';
  fbo1.fill(hue);
  fbo1.noStroke();
  box ? fbo1.box(size) : fbo1.sphere(size);
}

function scene2() {
  fbo2.fill(hue);
  fbo2.noStroke();
  box ? fbo2.box(size) : fbo2.sphere(size);
}

function keyPressed() {
  if (key === 'p') {
    foreshortening = !foreshortening;
    let eyeZ = (fbo1.height / 2) / tan(PI / 6);
    foreshortening ? fbo1.perspective(PI / 3, fbo1.width / fbo1.height, eyeZ / 10, eyeZ) :
    fbo1.ortho(-fbo1.width / 2, fbo1.width / 2, -fbo1.height / 2, fbo1.height / 2, 1, 500);
  }
  if (key === 'b') {
    box = !box;
  }
}