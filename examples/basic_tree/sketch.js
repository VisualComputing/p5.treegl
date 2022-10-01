'use strict';

// obje model
let fox;
// texture
let fox_tex;
// check box
let auto_rotate;
// select
let mode;
let easycam;
let frames = 0;

function preload() {
  // obj model took from this discourse thread:
  // https://discourse.processing.org/t/load-obj-model-with-mtl-file-and-jpg-texture/4634/7
  fox_tex = loadImage('fox.png');
  fox = loadModel('fox.obj', true);
}

function setup() {
  createCanvas(400, 400, WEBGL);
  textureMode(NORMAL);
  auto_rotate = createCheckbox('auto rotate', true);
  auto_rotate.style('color', 'magenta');
  auto_rotate.position(10, 10);
  mode = createSelect();
  mode.position(10, 35);
  mode.option('Fill');
  mode.option('Wiredframe');
  mode.option('Texture');
  mode.value('Texture');
  easycam = createEasyCam();
  let state = {
    distance: 250,                 // scalar
    center: [0, 0, 0],         // vector
    rotation: [0, 0, 0, 1],  // quaternion
  };
  easycam.setState(state, 1000); // animate to state over the period of 1 second
}

function draw() {
  background(200);
  push();
  strokeWeight(0.5);
  stroke('purple');
  grid({ style: Tree.SOLID });
  pop();
  // display all axes without labels (Tree.LABELS)
  axes({ bits: Tree.X | Tree.Y | Tree.Z | Tree._X | Tree._Y | Tree._Z });
  rotateZ(frames * 0.01);
  rotateX(frames * 0.01);
  rotateY(frames * 0.01);
  if (auto_rotate.checked()) {
    frames++;
  }
  axes({ size: 30 });
  push();
  switch (mode.value()) {
    case 'Fill':
      fill(255, 0, 0);
      break;
    case 'Wiredframe':
      noFill();
      stroke(0, 255, 255);
      break;
    default:
      noStroke();
      texture(fox_tex);
  }
  model(fox);
  pop();
  push();
  translate(-70, 50);
  rotateY(frames * 0.01);
  axes({ size: 30 });
  noStroke();
  fill(0, 255, 255, 125);
  sphere(10);
  // the screen projection of sphere local space origin
  // origin is used below to center the bullsEye display
  let screenProjection = treeLocation(/*[0, 0, 0],*/ { from: Tree.MODEL, to: Tree.SCREEN });
  pop();
  push();
  translate(70, -50);
  rotateZ(frames * 0.01);
  axes({ size: 30 });
  noStroke();
  fill(255, 0, 255, 125);
  sphere(10);
  pop();
  push();
  stroke('purple');
  strokeWeight(6);
  bullsEye({ x: screenProjection.x, y: screenProjection.y });
  pop();
}