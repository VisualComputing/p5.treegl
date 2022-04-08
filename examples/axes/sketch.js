// check box
let auto_rotate;

function setup() {
  createCanvas(400, 400, WEBGL);
  resizeCanvas(windowWidth, windowHeight);
  textureMode(NORMAL);
  auto_rotate = createCheckbox('auto rotate', false);
  auto_rotate.style('color', 'magenta');
  auto_rotate.position(10, 10);
}

function draw() {
  background(200);
  if (auto_rotate.checked()) {
    rotateZ(frameCount * 0.01);
    rotateX(frameCount * 0.01);
    rotateY(frameCount * 0.01);
  }
  else {
    orbitControl();
  }
  axes({ size: 100 });
  push();
  stroke('red');
  strokeWeight(1.3);
  //grid({ size: 100 });
  dottedGrid();
  pop();
  push();
  strokeWeight(4);
  stroke('green');
  squaredBullsEye({ x: 100, y: 200, size: 100 });
  pop();
  circledBullsEye({ x: 100, y: 100 }); 
  push();
  stroke('magenta');
  circledBullsEye(); 
  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}