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
  //orbitControl();
  background(200);
  rotateZ(frameCount * 0.01);
  rotateX(frameCount * 0.01);
  rotateY(frameCount * 0.01);
  //fill(255, 0, 0);
  //texture(img);
  noFill();
  stroke(0, 255, 255);
  hollowCylinder({ radius: 50, detail : 32 });
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}