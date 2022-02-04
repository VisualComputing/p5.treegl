let shaderB;

function setup() {
  createCanvas(400, 400, WEBGL);
  shaderB = false;
}

function draw() {
  if (shaderB) {
    cover();
  }
  else {
    background(200);
    orbitControl();
    rotateY(0.5);
    box(30, 50);
  }
}

function keyPressed () {
  if (key == 'b') {
    shaderB = !shaderB;
  }
}