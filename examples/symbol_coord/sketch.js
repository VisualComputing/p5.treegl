'use strict';

let image_src;
let video_src;
let mosaic;
// ui
let resolution;
let video_on;
let mode;

let palette;

function preload() {
  // paintings are stored locally in the paintings dir
  // and name sequentially as: p1.jpg, p2.jpg, ... p30.jpg
  // so we pick up one randomly just for fun:
  image_src = loadImage(`paintings/p${int(random(1, 31))}.jpg`);
  video_src = createVideo(['wagon.webm']);
  video_src.hide();
  mosaic = readShader('pixelator.frag',
           { matrices: Tree.NONE, varyings: Tree.texcoords2 });
  palette = loadImage(`paintings/p${int(random(1, 31))}.jpg`);
}

function setup() {
  createCanvas(600, 600, WEBGL);
  textureMode(NORMAL);
  noStroke();
  shader(mosaic);
  resolution = createSlider(1, 100, 30, 1);
  resolution.position(10, 35);
  resolution.style('width', '80px');
  resolution.input(() => mosaic.setUniform('resolution', resolution.value()));
  mosaic.setUniform('resolution', resolution.value());
  video_on = createCheckbox('video', false);
  video_on.changed(() => {
    if (video_on.checked()) {
      mosaic.setUniform('source', video_src);
      video_src.loop();
    } else {
      mosaic.setUniform('source', image_src);
      video_src.pause();
    }
  });
  mosaic.setUniform('source', image_src);
  video_on.position(10, 55);
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
  mosaic.setUniform('palette', palette);
}

function draw() {
  // which previous exercise does this code actually solve?
  /*
        y                  v
        |                  |
  (-1,1)|     (1,1)        (0,1)     (1,1)
  *_____|_____*            *__________*   
  |     |     |            |          |        
  |_____|_____|__x         | texture  |        
  |     |     |            |  space   |
  *_____|_____*            *__________*___ u
  (-1,-1)    (1,-1)       (0,0)    (1,0) 
  */
  beginShape();
  vertex(-1, -1, 0, 0, 1);
  vertex(1, -1, 0, 1, 1);
  vertex(1, 1, 0, 1, 0);
  vertex(-1, 1, 0, 0, 0);
  endShape();
}
