'use strict';

let lightPosition;
let lightAngle;
let depthMap;
let depthShader, shadowShader;
let landscape;
let easycam;
let biasMatrix;
let eyeZ;
let foreshortening = false;
let ambient;

function preload() {
  depthShader = readShader('depth_nonlinear.frag', { varyings: Tree.NONE });
  shadowShader = loadShader('shadow_acne.vert', 'shadow_acne.frag');
}

function setup() {
  createCanvas(400, 400, WEBGL);
  colorMode(RGB, 1);
  noStroke();
  noLights();
  landscape = 1;
  lightPosition = createVector();
  biasMatrix = new p5.Matrix([
    0.5, 0, 0, 0,
    0, -0.5, 0, 0,
    0, 0, 0.5, 0,
    0.5, 0.5, 0.5, 1,
  ]);
  // 1. shadow stuff
  depthMap = createGraphics(width / 2, height / 2, WEBGL);
  depthMap.colorMode(RGB, 1);
  eyeZ = (depthMap.height / 2) / tan(PI / 6);
  depthMap.noSmooth(); // Antialiasing on the shadowMap leads to weird artifacts
  depthMap.noStroke();
  depthMap.shader(depthShader);
  foreshortening ? depthMap.perspective(PI / 3, depthMap.width / depthMap.height, eyeZ / 3, 1.3 * eyeZ) :
    depthMap.ortho(-110, 110, -110, 110, 110, 350);
  // 2. default stuff
  shader(shadowShader);
  // 3. easycam
  easycam = new Dw.EasyCam(this._renderer);
  ambient = createSlider(0, 1, 0.2, 0.05);
  ambient.position(290, 10);
  ambient.style('width', '80px');
  ambient.input(() => { shadowShader.setUniform('ambient', ambient.value()) });
  shadowShader.setUniform('ambient', ambient.value());
}

function draw() {
  // Calculate the light direction (actually scaled by negative distance)
  //e = eMatrix();
  lightAngle = frameCount * 0.002;
  lightPosition.set(sin(lightAngle) * 160, 160, cos(lightAngle) * 160);
  // 1. Render the shadowmap
  depthMap.reset();
  depthMap.background(1);
  depthMap.camera(lightPosition.x, lightPosition.y, lightPosition.z);
  //pv = depthMap.pvMatrix();
  //let l = axbMatrix(pv, e);
  renderLandscape(depthMap);
  // transforms from eye to light
  let lightMatrix = axbMatrix(depthMap.pvMatrix(), eMatrix());
  // remaps from [-1 1] to [0,1] range and inverts y
  lightMatrix = axbMatrix(biasMatrix, lightMatrix);
  shadowShader.setUniform('transform4x4', lightMatrix.mat4);
  shadowShader.setUniform('uLightPosition', treeLocation(lightPosition, { from: Tree.WORLD, to: Tree.EYE }).array());
  shadowShader.setUniform('depthMap', depthMap);
  // Render default pass
  background(0);
  renderLandscape(this);
  // Render light source
  push();
  fill(1, 1, 0, 1);
  noStroke();
  translate(lightPosition.x, lightPosition.y, lightPosition.z);
  sphere(5);
  pop();
}

function renderLandscape(canvas) {
  switch (landscape) {
    case 1: {
      let offset = -frameCount * 0.01;
      fill(1, 0.333, 0, 1);
      for (let z = -5; z < 6; ++z) {
        for (let x = -5; x < 6; ++x) {
          canvas.push();
          canvas.translate(x * 12, sin(offset + x) * 20 + cos(offset + z) * 20, z * 12);
          canvas.box(10, 100, 10);
          canvas.pop();
        }
      }
      break;
    }
    case 2: {
      let angle = -frameCount * 0.0015, rotation = TWO_PI / 20;
      fill(1, 0.333, 0, 1);
      for (let n = 0; n < 20; ++n, angle += rotation) {
        canvas.push();
        canvas.translate(sin(angle) * 70, cos(angle * 4) * 10, cos(angle) * 70);
        canvas.box(10, 100, 10);
        canvas.pop();
      }
      fill(0, 0.333, 1, 1);
      canvas.sphere(50);
      break;
    }
    case 3: {
      let angle = -frameCount * 0.0015;
      let rotation = TWO_PI / 20;
      fill(1, 0.333, 0, 1);
      for (let n = 0; n < 20; ++n, angle += rotation) {
        canvas.push();
        canvas.translate(sin(angle) * 70, cos(angle) * 70, 0);
        canvas.box(10, 10, 100);
        canvas.pop();
      }
      fill(0, 1, 0.333, 1);
      canvas.sphere(50);
      break;
    }
  }
  fill(0.133, 0.133, 0.133, 1);
  canvas.box(360, 5, 360);
}

function keyPressed() {
  if (key === "1" || key === "2" || key === "3") {
    landscape = parseInt(key);
  }
  if (key === 'p') {
    foreshortening = !foreshortening;
    foreshortening ? depthMap.perspective(PI / 3, depthMap.width / depthMap.height, eyeZ / 3, 1.3 * eyeZ) :
      depthMap.ortho(-110, 110, -110, 110, 110, 350);
  }
}

function mouseWheel(event) {
  //comment to enable page scrolling
  return false;
}