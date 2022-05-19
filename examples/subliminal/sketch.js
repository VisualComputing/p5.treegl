let fbo1, fbo2;
let cam1, cam2;
let target = 150;
let length = 600;
let boxes;
let box_key;
let fovy;
const SPEED = 5;

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
  for (let i = 0; i < 10; i++) {
    boxes.push(
      {
        position: createVector((random() * 2 - 1) * trange, (random() * 2 - 1) * trange, (random() * 2 - 1) * trange),
        size: random() * 25 + 8,
        color: color(random(), random(), random())
      }
    );
  }
  fovy = createSlider(PI / 12, PI * (11 / 12), PI / 3, PI / 48);
  fovy.position(10, 10);
  fovy.style('width', '80px');
}

function draw() {
  fbo1.background(200, 125, 115);
  fbo1.reset();
  fbo1.perspective(fovy.value());
  fbo1.axes();
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
  fbo2.viewFrustum(fbo1);
  beginHUD();
  image(fbo2, width / 2, 0);
  endHUD();
}

function scene1() {
  boxes.forEach(box => {
    fbo1.push();
    fbo1.fill(boxes[box_key] === box ? color('red') : box.color);
    fbo1.translate(box.position);
    if (boxes[box_key] === box) {
      if (keyIsPressed && !mouseIsPressed) {
        let boxLocation = fbo1.treeLocation([0, 0, 0], { from: fbo1.mMatrix(), to: 'WORLD' });
        let pixelRatio = fbo1.pixelRatio(boxLocation);
        box.target ??= box.size / pixelRatio;
        box.size = box.target * pixelRatio;
        let eyeLocation = fbo1.treeLocation([0, 0, 0], { from: 'EYE', to: 'WORLD' });
        box.position.add(p5.Vector.sub(boxLocation, eyeLocation).normalize().mult(key === 'w' ? SPEED : -SPEED));
      }
      else {
        box.target = undefined;
      }
    }
    fbo1.box(box.size);
    fbo1.pop();
  }
  );
}

function scene2() {
  boxes.forEach(box => {
    fbo2.push();
    fbo2.fill(boxes[box_key] === box ? color('red') : box.color);
    fbo2.translate(box.position);
    fbo2.box(box.size);
    fbo2.pop();
  }
  );
}

function keyPressed() {
  // press [0..9] keys to pick a box and other keys
  // to unpick, excepting 'w' and 'z' which are used
  // to move the box away or closer to eye.
  if (key !== 'w' && key !== 'z') {
    box_key = parseInt(key);
  }
}