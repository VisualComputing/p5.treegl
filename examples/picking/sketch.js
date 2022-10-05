'use strict';

/*
Precise picking ins implemented in webgl2 here:
https://mauriciomeza.github.io/WebGL-Tests/
This example illustrates
a. p5 (https://p5js.org/):
- modelview stack: push, pop
b. p5.treegl (https://github.com/VisualComputing/p5.treegl):
- utilities: mousePicking
- drawing stuff: axes, grid, bullsEye,
*/

let easycam;
let models;
let squared;

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
  background(0.5);
  axes();
  grid();
  models.forEach(element => {
    push();
    translate(element.position);
    let picked = mousePicking({ size: element.size * 2.5, shape: squared ? Tree.SQUARE : Tree.CIRCLE });
    fill(picked ? 'yellow' : element.color);
    noStroke();
    squared ? box(element.size) : sphere(element.size);
    strokeWeight(3);
    stroke(picked ? 'red' : 'blue');
    bullsEye({ size: element.size * 2.5, shape: squared ? Tree.SQUARE : Tree.CIRCLE });
    pop();
  }
  );
}

function keyPressed() {
  squared = !squared;
}