let pg1, pg2;
let easycam;

function setup() {
  createCanvas(600, 400, WEBGL);
  pg1 = createGraphics(width, height, WEBGL);
  pg2 = createGraphics(width / 2, height / 2, WEBGL);
  let state = {
    distance: 200,
    center: [0, 0, 0],
    rotation: [0, 0, 0, 1],
  };
  easycam = new Dw.EasyCam(pg1._renderer);
  easycam.attachMouseListeners(this._renderer);
  easycam.state_reset = state;   // state to use on reset (double-click/tap)
  easycam.setState(state); // now animate to that state
  // suppress right-click context menu
  document.oncontextmenu = function () { return false; }
  //pg1.camera(0, 0, 200, 0, 0, 0, 0, 1, 0);
  pg2.camera(200, 0, 0, 0, 0, 0, 0, 1, 0);
}

function draw() {
  pg1.background(175, 125, 115);
  pg1.reset();
  pg1.axes();
  pg1.grid();
  beginHUD();
  image(pg1, 0, 0);
  endHUD();
  pg2.background(150);
  pg2.reset();
  pg2.axes();
  pg2.grid();
  pg2.viewFrustum(pg1);
  beginHUD();
  image(pg2, width / 2, height / 2);
  endHUD();
}