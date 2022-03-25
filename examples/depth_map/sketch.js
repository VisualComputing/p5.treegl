let easycam;
let pointLights;
let depthMap;
let depthShader;
let camera;
let near, far;
let boxes;

function preload() {
  //depthShader = readShader('depth_nonlinear.frag');
  depthShader = readShader('depth_linear.frag');
}

function setup() {
  //pixelDensity(1);
  createCanvas(300, 300, WEBGL);
  noStroke();
  depthMap = createGraphics(width / 2, height / 2, WEBGL);
  depthMap.shader(depthShader);
  depthMap.noStroke();
  camera = depthMap.createCamera();
  //console.log(camera);
  setAttributes('antialias', true);

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
  // suppress right-click context menu
  document.oncontextmenu = function () { return false; }

  colorMode(RGB, 1);
  let trange = 100;
  boxes = [];
  for (let i = 0; i < 100; i++) {
    boxes.push(
      {
        position: createVector((random() * 2 - 1) * trange, (random() * 2 - 1) * trange, (random() * 2 - 1) * trange),
        size: random() * 25 + 8,
        color: color(random(), random(), random())
      }
    );
  }
}

/*
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  easycam.setViewport([0, 0, windowWidth, windowHeight]);
}
*/

function draw() {
  background(0);
  updateLights();
  scene(this);
  displayLights(this);
  camera.setPosition(pointLights[0].pos.x, pointLights[0].pos.y, pointLights[0].pos.z);
  depthMap.background(125);
  depthMap.reset();
  scene(depthMap);
  displayLights(depthMap);
  beginHUD();
  image(depthMap, width / 2, height / 2);
  endHUD();
}

function scene(graphics) {
  boxes.forEach(box => {
    graphics.push();
    graphics.fill(box.color);
    graphics.translate(box.position);
    graphics.box(box.size);
    graphics.pop();
  }
  );
}

function displayLights(graphics) {
  pointLights.forEach(light => {
    graphics.push();
    graphics.translate(light.pos);
    graphics.fill(light.col);
    graphics.sphere(3);
    graphics.pop();
  });
}

function updateLights() {
  let angle = frameCount * 0.03;
  let rad = 30;
  let px = cos(angle) * rad;
  let py = sin(angle) * rad;

  let r = (sin(angle) * 0.5 + 0.5);
  let g = (sin(angle * 0.5 + PI / 2) * 0.5 + 0.5);
  let b = (sin(frameCount * 0.02) * 0.5 + 0.5);

  let pz = sin(frameCount * 0.02);
  pointLights = [
    {
      pos: createVector(px, py, 0),
      col: color(1 - r, r / 2, r),
      att: 80,
    },
    {
      pos: createVector(50, 50, pz * 40),
      col: color(r, 1, g),
      att: 80,
    },
    {
      pos: createVector(-50, -50, -pz * 40),
      col: color(1, r, g),
      att: 80,
    },
  ];
}