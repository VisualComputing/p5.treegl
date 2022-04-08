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
  // drawAxes({ length: 100 });
  // drawGrid({ size: 100 });
  // drawDottedGrid({ size: 100 });
  drawSquaredBullsEye({ x: 100, y: 100 });
  // drawCircledBullsEye({ x: 100, y: 100 }); 
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}