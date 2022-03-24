/**
 * Adapted from here:
 * https://github.com/freshfork/p5.EasyCam/edit/master/examples/RandomBoxes/RandomBoxes.js
 */

let easycam;
let directlights, ambient;

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
  console.log(Dw.EasyCam.INFO);
  easycam = new Dw.EasyCam(this._renderer);
  easycam.state_reset = state;   // state to use on reset (double-click/tap)
  easycam.setState(state, 2000); // now animate to that state
  // suppress right-click context menu
  document.oncontextmenu = function () { return false; }

  colorMode(RGB, 1);
  ambient = color(0.0002, 0.0004, 0.0006);
  directlights = [
    {
      dir: createVector(-1, -1, -2).normalize(),
      col: color(0.0010, 0.0005, 0.00025),
    },
  ];
}

/*
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  easycam.setViewport([0, 0, windowWidth, windowHeight]);
}
*/

/*
let e;

function backupCameraMatrix() {
  e = eMatrix();
}
*/

function draw() {
  background(0);
  // save current state of the modelview matrix
  //backupCameraMatrix();
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

  ambientLight(ambient);
  setDirectlight(directlights);
  setPointlight(pointlights);

  push();
  for (let i = 0; i < pointlights.length; i++) {
    let pl = pointlights[i];
    push();
    translate(pl.pos);
    emissiveMaterial(pl.col);
    fill(pl.col);
    sphere(3);
    pop();
  }
  pop();

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

function setDirectlight(directlights) {
  for (let i = 0; i < directlights.length; i++) {
    let light = directlights[i];
    // transform to camera-space
    let light_dir = treeDisplacement(light.dir, { from: 'WORLD', to: 'EYE' /*, eMatrix: e*/ });
    directionalLight(light.col, light_dir);
  }
}

function setPointlight(pointlights) {
  for (let i = 0; i < pointlights.length; i++) {
    let light = pointlights[i];
    pointLight(light.col, light.pos);
  }
}