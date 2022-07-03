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
  push();
  strokeWeight(5);
  axes({ size: 100, bits: Tree.LABELS });
  pop();
  push();
  stroke('red');
  strokeWeight(1.3);
  //grid({ size: 100 });
  pop();
  push();
  strokeWeight(4);
  stroke('green');
  bullsEye({ x: 100, y: 200, size: 100, shape: Tree.SQUARE });
  pop();
  bullsEye({ x: 100, y: 100 }); 
  push();
  stroke('magenta');
  bullsEye(); 
  pop();
}

/*
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
*/