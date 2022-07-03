let easycam;
let models;
let picked, squared, cached = true;
let pv, e, m;

function setup() {
  createCanvas(400, 400, WEBGL);
  // define initial state
  let state = {
    distance: 300,
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
  models = [];
  for (let i = 0; i < 25; i++) {
    models.push(
      {
        position: createVector((random() * 2 - 1) * trange, (random() * 2 - 1) * trange, (random() * 2 - 1) * trange),
        size: random() * 25 + 8,
        color: color(random(), random(), random())
      }
    );
  }
}

function draw() {
  // (optionally) cache pv and e matrices to speedup computations
  if (cached) {
    pv = pvMatrix();
    e = eMatrix();
  }
  background(0.5);
  axes();
  grid();
  models.forEach(element => {
    push();
    translate(element.position);
    // cache model matrix, just before drawing it
    m = mMatrix();
    let picked = cached ? mousePicking({ mMatrix: m, size: element.size * 2.5, pvMatrix: pv, eMatrix: e, shape: squared ? Tree.SQUARE : Tree.CIRCLE })
      : mousePicking({ mMatrix: m, size: element.size * 2.5, shape: squared ? Tree.SQUARE : Tree.CIRCLE })
    fill(picked ? 'white' : element.color);
    noStroke();
    squared ? box(element.size) : sphere(element.size);
    strokeWeight(3);
    stroke(picked ? 'yellow' : cached ? 'red' : 'blue');
    if (cached) {
      //cross({ mMatrix: m, size: element.size * 2.5, pvMatrix: pv, eMatrix: e, shape: squared ? Tree.SQUARE : Tree.CIRCLE });
      bullsEye({ mMatrix: m, size: element.size * 2.5, pvMatrix: pv, eMatrix: e, shape: squared ? Tree.SQUARE : Tree.CIRCLE });
    }
    else {
      //cross({ mMatrix: m, size: element.size * 2.5, shape: squared ? Tree.SQUARE : Tree.CIRCLE });
      bullsEye({ mMatrix: m, size: element.size * 2.5, shape: squared ? Tree.SQUARE : Tree.CIRCLE });
    }
    pop();
  }
  );
}

function keyPressed() {
  if (key === 's') {
    squared = !squared;
  }
  if (key === 'c') {
    cached = !cached;
  }
}