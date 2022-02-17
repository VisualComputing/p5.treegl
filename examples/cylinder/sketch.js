let img;

function preload() {
  img = loadImage('img.jpg');
}

function setup() {
  createCanvas(400, 400, WEBGL);
  noStroke();
  textureMode(NORMAL);
}

function draw() {
  background(200);
  //orbitControl();
  rotateZ(frameCount * 0.01);
  rotateX(frameCount * 0.01);
  rotateY(frameCount * 0.01);
  fill(255, 0, 0);
  texture(img);
  cylinder({ radius: 50, detail : 32, texture: true});
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}