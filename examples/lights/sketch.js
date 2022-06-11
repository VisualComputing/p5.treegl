/**
 * Adapted from here:
 * https://github.com/freshfork/p5.EasyCam/edit/master/examples/RandomBoxes/RandomBoxes.js
 */

let easycam;
let directLights, ambient;
let boxes;

function setup() {
  //pixelDensity(1);
  createCanvas(400, 400, WEBGL);
  axes();
  noStroke();
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

  //ambient = color(0.0002, 0.0004, 0.0006);
  ambient = color(0.12, 0.14, 0.1);
  directLights = [
    {
      dir: Tree.i,
      col: color(0.9, 0, 0),
    },
    {
      dir: Tree._i,
      col: color(0, 0.9, 0),
    },
    {
      dir: Tree.j,
      col: color(0, 0, 0.9),
    },
    {
      dir: Tree._j,
      col: color(0.9, 0.9, 0),
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
  let pointLights = [
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

  //ambientLight(ambient);
  
  directLights.forEach(light => directionalLight(
    light.col,
    // transform to camera-space
    // treeDisplacement(light.dir, { from: Tree.WORLD, to: Tree.EYE, eMatrix: e })
    treeDisplacement(light.dir, { from: Tree.EYE, to: Tree.WORLD })
    ));
    /*
  pointLights.forEach(light => {
    pointLight(light.col, light.pos);
    push();
    translate(light.pos);
    emissiveMaterial(light.col);
    fill(light.col);
    sphere(3);
    pop();
  });
  // */

  boxes.forEach(element => {
    push();
    translate(element.position);
    box(element.size);
    pop();
  }
  );
}