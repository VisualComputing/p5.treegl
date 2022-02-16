function setup() {
  createCanvas(400, 400, WEBGL);
  noStroke();
}

function draw() {
  background(200);
  orbitControl();
  fill(255, 0, 0);
  cylinder({ radius: 50, detail : 10 });
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  emitResolution(shader_box);
}