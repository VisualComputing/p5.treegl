'use strict';

// texture
let fire;
// check box
let auto_rotate;
// select
let mode;
// slider
let details;

let easycam;
let frames = 0;

function preload() {
  fire = loadImage('fire_breather.jpg');
}

function setup() {
  createCanvas(400, 400, WEBGL);
  textureMode(NORMAL);
  auto_rotate = createCheckbox('auto rotate', true);
  auto_rotate.style('color', 'magenta');
  auto_rotate.position(10, 10);
  details = createSlider(3, 16, 13, 1);
  details.position(10, 40);
  details.style('width', '80px');
  mode = createSelect();
  mode.position(10, 70);
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
  foreshortening ? perspective() : ortho();
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
      texture(fire);
  }
  cylinder(30, 60, details.value(), details.value());
  pop();
  push();
  translate(-50, 30);
  rotateY(frames * 0.01);
  // no need to specify the point to be located since it's the origin
  let screenProjection = treeLocation(/*[0, 0, 0],*/ { from: Tree.MODEL, to: Tree.SCREEN });
  axes({ size: 30 });
  noStroke();
  fill(0, 255, 255, 125);
  sphere(10);
  pop();
  push();
  translate(50, -30);
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