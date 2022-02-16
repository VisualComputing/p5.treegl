let pg;

function setup() {
  createCanvas(400, 400, WEBGL);
  pg = createGraphics(300, 300, WEBGL);
}

function draw() {
  background(200);
  orbitControl();
  pg.background(255, 0, 0);
  pg.fill(0, 255, 255);
  pg.cylinder({ radius: 50, detail : 10 });
  image(pg, -150, -150);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  emitResolution(shader_box);
}