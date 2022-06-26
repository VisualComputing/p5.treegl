// texture
let img;
// p5.Graphics
let pg;
// check boxes
let hud;
// select
let mode;
// slider
let details;

function preload() {
  img = loadImage('img.png');
}

function setup() {
  createCanvas(400, 400, WEBGL);
  pg = createGraphics(300, 300, WEBGL);
  pg.textureMode(NORMAL);
  hud = createCheckbox('Heads Up Display', true);
  hud.style('color', 'cyan');
  hud.position(10, 10);
  details = createSlider(3, 50, 20, 1);
  details.position(10, 40);
  details.style('width', '80px');
  mode = createSelect();
  mode.position(10, 70);
  mode.option('Fill');
  mode.option('Wiredframe');
  mode.option('Texture');
  mode.value('Texture');
}

let circled = true;
let dotted = true;

function draw() {
  background('#316DCA');
  pg.perspective();
  //pg.ortho();
  if (frameCount === 5) {
    //viewFrustum(pg); // good
    pg.viewFrustum(_renderer); // good
    //viewFrustum(_renderer); // bad
  }
  pg.push();
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
  //pg.axes();
  pg.push();
  pg.stroke('magenta');
  pg.grid({ style: dotted ? Tree.DOTS : Tree.SOLID });
  pg.strokeWeight(3);
  pg.stroke('orange');
  pg.bullsEye({ size: 100, shape: circled ? Tree.CIRCLE : Tree.SQUARE });
  pg.pop();
  switch (mode.value()) {
    case 'Fill':
      pg.fill(255, 0, 0);
      break;
    case 'Wiredframe':
      pg.noFill();
      pg.stroke(0, 255, 255);
      break;
    default:
      pg.noStroke();
      pg.texture(img);
  }
  pg.rotateZ(frameCount * 0.01);
  pg.rotateX(frameCount * 0.01);
  pg.rotateY(frameCount * 0.01);
  pg.cylinder(50, 200);
  //pg.cone(50, 200);
  if (hud.checked()) {
    // init p5.treegl.HUD
    beginHUD();
  }
  else {
    rotateZ(frameCount * 0.01);
    rotateX(frameCount * 0.01);
    rotateY(frameCount * 0.01);
  }
  if (hud.checked()) {
    image(pg, 50, 50);
    // end p5.treegl.HUD
    endHUD();
  }
  else {
    image(pg, -150, -150);
  }
  pg.pop();
}

function keyPressed() {
  if (key === 'c') {
    circled = !circled;
  }
  if (key === 'd') {
    dotted = !dotted;
  }
}