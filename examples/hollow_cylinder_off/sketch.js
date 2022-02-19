// texture
let img;
// p5.Graphics
let pg;
// check boxes
let hud;
// select
let mode;

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
  mode = createSelect();
  mode.position(10, 40);
  mode.option('Fill');
  mode.option('Wiredframe');
  mode.option('Texture');
  mode.value('Texture');
}

function draw() {
  background('#316DCA');
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
  /*
  pg.rotateZ(frameCount * 0.01);
  pg.rotateX(frameCount * 0.01);
  pg.rotateY(frameCount * 0.01);
  //pass image as texture
  //pg.texture(img);
  pg.noFill();
  pg.stroke(255, 0, 255);
  pg.hollowCylinder({ radius: 50, detail : 32 });
  */
  switch(mode.value()) {
    case 'Fill':
      pg.fill(255, 0, 0);
      break;
    case 'Wiredframe':
      pg.noFill();
      pg.stroke(0, 255, 255);
      break;
    default:
      pg.texture(img);
  }
  pg.rotateZ(frameCount * 0.01);
  pg.rotateX(frameCount * 0.01);
  pg.rotateY(frameCount * 0.01);
  pg.hollowCylinder({ radius: 50, detail : 32 });
  if(hud.checked()) {
    // init p5.treegl.HUD
    beginHUD();
  }
  else {
    rotateZ(frameCount * 0.01);
    rotateX(frameCount * 0.01);
    rotateY(frameCount * 0.01);
  }
  image(pg, -150, -150);
  if(hud.checked()) {
    // end p5.treegl.HUD
    endHUD();
  }
  pg.pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}