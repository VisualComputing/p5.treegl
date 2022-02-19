// texture
let img;
// check box
let auto_rotate;
// select
let mode;

function preload() {
  img = loadImage('img.jpg');
}

function setup() {
  createCanvas(400, 400, WEBGL);
  textureMode(NORMAL);
  auto_rotate = createCheckbox('auto rotate', true);
  auto_rotate.style('color', 'magenta');
  auto_rotate.position(10, 10);
  mode = createSelect();
  mode.position(10, 40);
  mode.option('Fill');
  mode.option('Wiredframe');
  mode.option('Texture');
  mode.value('Wiredframe');
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
  switch(mode.value()) {
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
  hollowCylinder({ radius: 50, detail : 32 });
  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}