// texture
let img;
// check box
let auto_rotate;
// select
let mode;
// slider
let details;

let easycam;
let frames = 0;
let sphere1;
let sphere2;
let screenProjection;
let modelProjection;

function preload() {
  img = loadImage('img.jpg');
}

function setup() {
  createCanvas(400, 400, WEBGL);
  textureMode(NORMAL);
  auto_rotate = createCheckbox('auto rotate', true);
  auto_rotate.style('color', 'magenta');
  auto_rotate.position(10, 10);
  details = createSlider(3, 50, 20, 1);
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
    //rotation : [1, 1, 1, 0],  // quaternion
  };
  easycam.setState(state, 1000); // animate to state over the period of 1 second
}

function draw() {
  background(200);
  grid({ dotted: false });
  axes();
  rotateZ(frames * 0.01);
  rotateX(frames * 0.01);
  rotateY(frames * 0.01);
  if (auto_rotate.checked()) {
    frames++;
  }
  axes(30);
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
      texture(img);
  }
  hollowCylinder({ radius: 15, height: 40, detail: details.value() });
  pop();
  push();
  translate(-50, 30);
  rotateY(frames * 0.01);
  sphere1 = mMatrix();
  axes(30);
  noStroke();
  fill(0, 255, 255, 125);
  sphere(5);
  pop();
  push();
  translate(50, -30);
  rotateZ(frames * 0.01);
  sphere2 = mMatrix();
  axes(30);
  noStroke();
  fill(255, 0, 255, 125);
  sphere(5);
  pop();
  push();
  screenProjection = treeLocation([0, 0, 0], { from: sphere1, to: 'SCREEN' });
  //stroke('green');
  //strokeWeight(8);
  //bullsEye({ x: screenProjection.x, y: screenProjection.y });
  pop();
}

function keyPressed() {
  if (key === 'l') {
    print('mMatrix', treeLocation([0, 0, 0], { from: sphere1, to: sphere2 }));
  }
  if (key === 'd') {
    let screenProjection = treeLocation([0, 0, 0], { from: sphere1, to: 'SCREEN' });
    let worldProjection = treeLocation(screenProjection, { to: sphere1, from: 'SCREEN' });
    print('s: ', screenProjection);
    print('w: ', worldProjection);
    let model2ndc = treeLocation([0, 0, 0], { from: sphere1, to: 'NDC' });
    let ndc2model = treeLocation(model2ndc, { to: sphere1, from: 'NDC' });
    print('model2ndc: ', model2ndc);
    print('ndc2model: ', ndc2model);
    let e2s = treeDisplacement([0, 0, -100], { from: 'EYE', to: 'SCREEN' });
    let s2e = treeDisplacement(e2s, { to: 'EYE', from: 'SCREEN' });
    print('e2s: ', e2s);
    print('s2e: ', s2e);
  }
}
