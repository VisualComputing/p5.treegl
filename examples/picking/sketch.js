let easycam;
let boxes;
let picked;

function setup() {
  //pixelDensity(1);
  createCanvas(400, 400, WEBGL);
  //setAttributes('antialias', true);

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
  for (let i = 0; i < 1; i++) {
    boxes.push(
      {
        position: createVector((random() * 2 - 1) * trange, (random() * 2 - 1) * trange, (random() * 2 - 1) * trange),
        size: random() * 25 + 8,
        color: color(random(), random(), random())
      }
    );
  }
}

function draw() {
  background(0.5);
  axes();
  grid();
  boxes.forEach(element => {
    push();
    translate(element.position);
    let mat = mMatrix();
    fill(element.color);
    //box(element.size);
    noStroke();
    sphere(element.size);
    strokeWeight(3);
    //stroke(mousePicking({ mMatrix: mat, size: element.size * 2.5 }) ? 'white' : 'red');
    //cross({ mMatrix: mat, size: element.size * 2.5 });
    //bullsEye({ mMatrix: mat, size: element.size * 2.5 });
    //stroke(mousePicking({ mMatrix: mat, size: element.size * 2.5, circled: false }) ? 'white' : 'red');
    //bullsEye({ mMatrix: mat, size: element.size * 2.5, circled: false });
    stroke(mousePicking({ mMatrix: mat, size: element.size * 2.5, ref: Tree.SCREEN }) ? 'white' : 'red');
    bullsEye({ mMatrix: mat, size: element.size * 2.5, ref: Tree.SCREEN });
    pop();
  }
  );
}
