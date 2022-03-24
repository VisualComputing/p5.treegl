/**
 * Adapted from here:
 * https://github.com/freshfork/p5.EasyCam/edit/master/examples/RandomBoxes/RandomBoxes.js
 */

let easycam;
let depth_map;
let depthShader;
let near, far;

function preload() {
  depthShader = readShader('depthmap.frag');
}

function setup() {
  //pixelDensity(1);

  createCanvas(400, 400, WEBGL);
  setAttributes('antialias', true);

  // define initial state
  let state = {
    distance: 164.411,
    center: [0, 0, 0],
    rotation: [-0.285, -0.257, -0.619, 0.685],
  };

  near = 1;
  far = 500;

  console.log(Dw.EasyCam.INFO);

  easycam = new Dw.EasyCam(this._renderer);
  easycam.state_reset = state;   // state to use on reset (double-click/tap)
  easycam.setState(state, 2000); // now animate to that state

  // suppress right-click context menu
  document.oncontextmenu = function () { return false; }

  depth_map = false;
}

function keyPressed() {
  toggleShader();
}

function toggleShader() {
  depth_map = !depth_map;
  if (depth_map) {
    shader(depthShader);
    depthShader.setUniform('near', near);
    depthShader.setUniform('far', far);
  }
  else {
    resetShader();
  }
}

/*
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  easycam.setViewport([0, 0, windowWidth, windowHeight]);
}
*/

let e;

function backupCameraMatrix() {
  e = eMatrix();
}

let matWhite = {
  diff: [1, 1, 1],
  spec: [1, 1, 1],
  spec_exp: 400.0,
};

let ambientlight = {
  col: [0.0002, 0.0004, 0.0006],
};

let directlights = [
  {
    dir: [-1, -1, -2],
    col: [0.0010, 0.0005, 0.00025],
  },
];

function draw() {
  if (!depth_map) {
    // save current state of the modelview matrix
    backupCameraMatrix();
    let angle = frameCount * 0.03;
    let rad = 30;
    let px = cos(angle) * rad;
    let py = sin(angle) * rad;

    let r = (sin(angle) * 0.5 + 0.5);
    let g = (sin(angle * 0.5 + PI / 2) * 0.5 + 0.5);
    let b = (sin(frameCount * 0.02) * 0.5 + 0.5);

    let pz = sin(frameCount * 0.02);
    let pointlights = [
      {
        pos: [px, py, 0, 1],
        col: [1 - r, r / 2, r],
        att: 80,
      },

      {
        pos: [50, 50, pz * 40, 1],
        col: [r, 1, g],
        att: 80,
      },

      {
        pos: [-50, -50, -pz * 40, 1],
        col: [1, r, g],
        att: 80,
      },
    ];

    setAmbientlight(ambientlight);
    setDirectlight(directlights);
    setPointlight(pointlights);

    push();
    for (let i = 0; i < pointlights.length; i++) {
      let pl = pointlights[i];
      push();
      translate(pl.pos[0], pl.pos[1], pl.pos[2]);
      emissiveMaterial(pl.col[0] * 255, pl.col[1] * 255, pl.col[2] * 255);
      fill(pl.col[0] * 255, pl.col[1] * 255, pl.col[2] * 255);
      sphere(3);
      pop();
    }
    pop();
  }

  // projection
  perspective(60 * PI / 180, width / height, near, far);

  // clear BG
  background(0);
  noStroke();

  rand.seed = 0;
  let count = 100;
  let trange = 100;
  for (let i = 0; i < count; i++) {
    let dx = rand() * 25 + 8;
    let tx = (rand() * 2 - 1) * trange;
    let ty = (rand() * 2 - 1) * trange;
    let tz = (rand() * 2 - 1) * trange;
    push();
    translate(tx, ty, tz);
    box(dx);
    pop();
  }
}

let rand = function () {
  this.x = ++rand.seed;
  this.y = ++rand.seed;
  let val = Math.sin(this.x * 12.9898 + this.y * 78.233) * 43758.545;
  return (val - Math.floor(val));
}

rand.seed = 0;

function setAmbientlight(ambientlight) {
  ambientLight(ambientlight.col[0] * 255, ambientlight.col[1] * 255, ambientlight.col[2] * 255);
}

function setDirectlight(directlights) {
  for (let i = 0; i < directlights.length; i++) {
    let light = directlights[i];
    // normalize
    let x = light.dir[0];
    let y = light.dir[1];
    let z = light.dir[2];
    let mag = Math.sqrt(x * x + y * y + z * z); // should not be zero length
    // transform to camera-space
    let light_dir = treeDisplacement(createVector(x / mag, y / mag, z / mag), { from: 'WORLD', to: 'EYE', eMatrix: e });
    directionalLight(light.col[0] * 255, light.col[1] * 255, light.col[2] * 255, light_dir.x, light_dir.y, light_dir.z);
  }
}

function setPointlight(pointlights) {
  for (let i = 0; i < pointlights.length; i++) {
    let light = pointlights[i];
    pointLight(light.col[0] * 255, light.col[1] * 255, light.col[2] * 255, light.pos[0], light.pos[1], light.pos[2]);
  }
}