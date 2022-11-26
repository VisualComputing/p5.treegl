'use strict';

let palette;
let pg;
let mosaic;
let paintings;
let video_src;
// ui
let resolution;
let video_on;
let mode;

const SAMPLE_RES = 30;

function preload() {
  video_src = createVideo(['/sketches/shaders/wagon.webm']);
  video_src.hide();
  mosaic = readShader('/sketches/shaders/mosaic.frag',
                      { matrices: Tree.NONE, varyings: Tree.texcoords2 });
  paintings = [];
  for (let i = 1; i <= 30; i++) {
    paintings.push(loadImage(`/sketches/shaders/paintings/p${i}.jpg`));
  }
}

function setup() {
  createCanvas(650, 650, WEBGL);
  textureMode(NORMAL);
  noStroke();
  shader(mosaic);
  resolution = createSlider(10, 200, SAMPLE_RES, 1);
  resolution.position(10, 35);
  resolution.style('width', '80px');
  resolution.input(() => { mosaic.setUniform('resolution', resolution.value()) });
  mosaic.setUniform('resolution', resolution.value());
  video_on = createCheckbox('video', false);
  video_on.style('color', 'magenta');
  video_on.changed(() => {
    if (video_on.checked()) {
      mosaic.setUniform('source', video_src);
      video_src.loop();
    } else {
      mosaic.setUniform('source', random(paintings));
      video_src.pause();
    }
  });
  video_on.position(10, 55);
  mosaic.setUniform('source', random(paintings));
  mode = createSelect();
  mode.position(10, 75);
  mode.option('original');
  mode.option('keys');
  mode.option('symbols');
  mode.selected('symbols');
  mode.changed(() => {
    mosaic.setUniform('original', mode.value() === 'original');
    mosaic.setUniform('keys', mode.value() === 'keys');
  });
  palette = createQuadrille(paintings);
  pg = createGraphics(SAMPLE_RES * palette.width, SAMPLE_RES);
  mosaic.setUniform('n', palette.width);
  sample();
}

function keyPressed() {
  if (key === 'r' && !video_on.checked()) {
    mosaic.setUniform('source', random(paintings));
  }
}

function sample() {
  if (pg.width !== SAMPLE_RES * palette.width) {
    pg = createGraphics(SAMPLE_RES * palette.width, SAMPLE_RES);
    mosaic.setUniform('n', palette.width);
  }
  palette.sort({ ascending: true, cellLength: SAMPLE_RES });
  drawQuadrille(palette, { graphics: pg, cellLength: SAMPLE_RES, outlineWeight: 0 });
  mosaic.setUniform('palette', pg);
}

function draw() {
  beginShape();
  vertex(-1, -1, 0, 0, 1);
  vertex(1, -1, 0, 1, 1);
  vertex(1, 1, 0, 1, 0);
  vertex(-1, 1, 0, 0, 0);
  endShape();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
