let pg;
let img;

function preload() {
  img = loadImage('img.png');
}

function setup() {
  createCanvas(400, 400, WEBGL);
  pg = createGraphics(300, 300, WEBGL);
  pg.textureMode(NORMAL);
}

function draw() {
  background('#316DCA');
  //it seems orbit control doesn't work here
  orbitControl();
  pg.background(0);  
  /*
  key line, since from here:
  https://p5js.org/reference/#/p5.Graphics
  It says:
  Resets certain values such as those modified by functions in the
  Transform and in the Lights categories that are not automatically
  reset with graphics buffer objects. Calling this in draw() will
  copy the behavior of the standard canvas.
  */
  pg.reset();
  pg.rotateZ(frameCount * 0.01);
  pg.rotateX(frameCount * 0.01);
  pg.rotateY(frameCount * 0.01);
  //pass image as texture
  pg.texture(img);
  //pg.box(width / 2);
  pg.cylinder({ radius: 50, detail : 32, texture: true });
  image(pg, -150, -150);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}