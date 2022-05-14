'use strict';

let fbo1, fbo2;
let cam1, cam2;
let target = 150;
let length = 600;
let box_key_matrix;
let boxes;
let box_key;
let fovy;

function setup() {
  createCanvas(length, length / 2);
  // frame buffer object instances (FBOs)
  fbo1 = createGraphics(width / 2, height, WEBGL);
  fbo2 = createGraphics(width / 2, height, WEBGL);
  // FBOs cams
  cam1 = new Dw.EasyCam(fbo1._renderer, { distance: 200 });
  let state1 = cam1.getState();
  cam1.attachMouseListeners(this._renderer);
  cam1.state_reset = state1;   // state to use on reset (double-click/tap)
  cam1.setViewport([0, 0, width / 2, height]);
  cam2 = new Dw.EasyCam(fbo2._renderer, { rotation: [0.94, 0.33, 0, 0] });
  cam2.attachMouseListeners(this._renderer);
  let state2 = cam2.getState();
  cam2.state_reset = state2;   // state to use on reset (double-click/tap)
  cam2.setViewport([width / 2, 0, width / 2, height]);
  document.oncontextmenu = function () { return false; }
  // scene
  colorMode(RGB, 1);
  let trange = 100;
  boxes = [];
  for (let i = 0; i < 9; i++) {
    boxes.push(
      {
        position: createVector((random() * 2 - 1) * trange, (random() * 2 - 1) * trange, (random() * 2 - 1) * trange),
        size: random() * 25 + 8,
        color: color(random(), random(), random())
      }
    );
  }
  fovy = createSlider(PI / 12, PI * (11 / 12), PI / 3, PI / 12);
  fovy.position(10, 10);
  fovy.style('width', '80px');
}

function draw() {
  fbo1.background(200, 125, 115);
  fbo1.reset();
  fbo1.perspective(fovy.value());
  fbo1.axes();
  fbo1.grid();
  box_key_matrix = undefined;
  scene(fbo1, true);
  beginHUD();
  image(fbo1, 0, 0);
  endHUD();
  fbo2.background(130);
  fbo2.reset();
  fbo2.axes();
  fbo2.grid();
  scene(fbo2);
  fbo2.viewFrustum(fbo1);
  beginHUD();
  image(fbo2, width / 2, 0);
  endHUD();
}

function scene(graphics, update = false) {
  boxes.forEach(box => {
    graphics.push();
    graphics.fill(boxes[box_key - 1] === box ? color('red') : box.color);
    graphics.translate(box.position);
    if (update) {
      let mMatrix = graphics.mMatrix();
      let pixelRatio = graphics.pixelRatio(graphics.treeLocation([0, 0, 0], { from: mMatrix, to: 'WORLD' }));
      if (box_key && !mouseIsPressed) {
        if (boxes[box_key - 1] === box) {
          box_key_matrix = mMatrix;
          box.size = box.target * pixelRatio;
        }
      }
      else {
        box.target = box.size / pixelRatio;
      }
    }
    graphics.box(box.size);
    graphics.pop();
  }
  );
}

function keyPressed() {
  // press [1..9] keys to pick a box and other keys
  // including 0 to unpick, excepting 'w' and 'z'
  // which are used to move the box away or closer to eye.
  if (key !== 'w' && key !== 'z') {
    box_key = parseInt(key);
  }
  else if (box_key) {
    moveBox(key === 'w' ? 10 : -10);
  }
}

function moveBox(z) {
  if (box_key_matrix) {
    let v1 = fbo1.treeLocation([0, 0, 0], { from: box_key_matrix, to: 'WORLD' });
    let v2 = fbo1.treeLocation([0, 0, 0], { from: 'EYE', to: 'WORLD' });
    let v = p5.Vector.sub(v1, v2);
    v.normalize();
    v.mult(z);
    boxes[box_key - 1].position.add(v);
  }
}