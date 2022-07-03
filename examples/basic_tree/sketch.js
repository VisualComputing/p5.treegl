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
    //rotation : [1, 1, 1, 0],  // quaternion
  };
  easycam.setState(state, 1000); // animate to state over the period of 1 second
  //parseVertexShader({ precision: Tree.mediump, matrices: Tree.pmvMatrix, varyings: Tree.color4 });
  //parseVertexShader({ precision: Tree.mediump, matrices: Tree.pMatrix | Tree.mvMatrix, varyings: Tree.color4 });
  //parseVertexShader({ precision: Tree.lowp, varyings: Tree.color4 });
  //parseVertexShader();
  parseVertexShader({ matrices: Tree.pMatrix | Tree.mvMatrix });
  //parseVertexShader({ precision: Tree.highp, matrices: Tree.NONE, varyings: Tree.color4 | Tree.normal3 | Tree.texcoords2 | Tree.position2 });
}

function draw() {
  background(200);
  grid({ style: Tree.SOLID });
  axes();
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
      texture(img);
  }
  cylinder(30, 60, details.value(), details.value());
  pop();
  push();
  translate(-50, 30);
  rotateY(frames * 0.01);
  sphere1 = mMatrix();
  axes({ size: 30 });
  noStroke();
  fill(0, 255, 255, 125);
  sphere(10);
  pop();
  push();
  translate(50, -30);
  rotateZ(frames * 0.01);
  sphere2 = mMatrix();
  axes({ size: 30 });
  noStroke();
  fill(255, 0, 255, 125);
  sphere(10);
  pop();
  push();
  screenProjection = treeLocation([0, 0, 0], { from: sphere1, to: Tree.SCREEN });
  stroke('purple');
  strokeWeight(6);
  bullsEye({ x: screenProjection.x, y: screenProjection.y });
  pop();
}

function keyPressed() {
  if (key === 'l') {
    print('mMatrix', treeLocation([0, 0, 0], { from: sphere1, to: sphere2 }));
  }
  if (key === 'd') {
    let screenProjection = treeLocation([0, 0, 0], { from: sphere1, to: Tree.SCREEN });
    let worldProjection = treeLocation(screenProjection, { to: sphere1, from: Tree.SCREEN });
    print('s: ', screenProjection);
    print('w: ', worldProjection);
    let model2ndc = treeLocation([0, 0, 0], { from: sphere1, to: Tree.NDC });
    let ndc2model = treeLocation(model2ndc, { to: sphere1, from: Tree.NDC });
    print('model2ndc: ', model2ndc);
    print('ndc2model: ', ndc2model);
    let e2s = treeDisplacement([0, 0, -100], { from: Tree.EYE, to: Tree.SCREEN });
    let s2e = treeDisplacement(e2s, { to: Tree.EYE, from: Tree.SCREEN });
    print('e2s: ', e2s);
    print('s2e: ', s2e);
    let m2w = treeDisplacement([0, 10, 0], { from: sphere1, to: Tree.WORLD });
    let w2m = treeDisplacement(m2w, { to: sphere1, from: Tree.WORLD });
    print('m2w: ', m2w);
    print('d_m2w:', dMatrix({ from: sphere1, to: iMatrix() }).mult3(createVector(0, 10, 0)));
    print('w2m: ', w2m);
    print('d_w2m:', dMatrix({ to: sphere1, from: iMatrix() }).mult3(m2w));
    let m2e = treeDisplacement([-5, 10, 5], { from: sphere1, to: Tree.EYE });
    let e2m = treeDisplacement(m2e, { to: sphere1, from: Tree.EYE });
    print('m2e: ', m2e);
    print('e2m: ', e2m);
    let m2s = treeDisplacement([5, -15, 25], { from: sphere1, to: Tree.SCREEN });
    let s2m = treeDisplacement(m2s, { to: sphere1, from: Tree.SCREEN });
    print('m2s: ', m2s);
    print('s2m: ', s2m);
    let e2n = treeDisplacement([5, 10, -5], { from: Tree.EYE, to: Tree.NDC });
    let n2e = treeDisplacement(e2n, { to: Tree.EYE, from: Tree.NDC });
    print('e2n: ', e2n);
    print('n2e: ', n2e);
  }
}
