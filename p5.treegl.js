/***************************************************************************************
* p5.treegl.js
* Please add you...
* @author
* @author
* @author Jean Pierre Charalambos, https://github.com/VisualComputing/p5.treegl/
* Released under the terms of the GPLv3, refer to: http://www.gnu.org/licenses/gpl.html
***************************************************************************************/

// See:
// https://github.com/processing/p5.js/blob/main/contributor_docs/creating_libraries.md
// https://github.com/processing/p5.js/blob/main/src/core/README.md
// https://github.com/processing/p5.js/blob/main/contributor_docs/webgl_mode_architecture.md
(function () {
  // 1. Matrix caches

  p5.prototype.cacheMVMatrix = function () {
    return this._renderer.cacheMVMatrix(...arguments);
  }

  p5.RendererGL.prototype.cacheMVMatrix = function () {
    return this.cMVMatrix = arguments.length === 1 ? arguments[0].copy() : this.uMVMatrix.copy();
  }

  p5.prototype.cacheVMatrix = function () {
    return this._renderer.cacheVMatrix(...arguments);
  }

  p5.RendererGL.prototype.cacheVMatrix = function () {
    return this.cVMatrix = arguments.length === 1 ? arguments[0].copy() : this._curCamera.cameraMatrix.copy();
  }

  p5.prototype.cachePMatrix = function () {
    return this._renderer.cachePMatrix(...arguments);
  }

  p5.RendererGL.prototype.cachePMatrix = function () {
    return this.cPMatrix = arguments.length === 1 ? arguments[0].copy() : this.uPMatrix.copy();
  }

  p5.prototype.cachePVMatrix = function () {
    return this._renderer.cachePVMatrix(...arguments);
  }

  p5.RendererGL.prototype.cachePVMatrix = function () {
    return this.cPVMatrix = arguments.length === 1 ? arguments[0].copy() : this.cachePMatrix().copy().apply(this.cacheVMatrix());
  }

  p5.prototype.cachePVInvMatrix = function () {
    return this._renderer.cachePVInvMatrix(...arguments);
  }

  p5.RendererGL.prototype.cachePVInvMatrix = function () {
    return this.cPVInvMatrix = arguments.length === 1 ? arguments[0].copy() : this.cachePVMatrix().copy().invert(this.cachePVMatrix());
  }

  // 2. Space transformations

  p5.prototype.beginHUD = function () {
    this._renderer.beginHUD(...arguments);
  }

  p5.RendererGL.prototype.beginHUD = function () {
    this.cacheMVMatrix();
    this.cachePMatrix();
    this._rendererState = this.push();
    let gl = this.drawingContext;
    gl.flush();
    gl.disable(gl.DEPTH_TEST);
    this.resetMatrix();
    let z = Number.MAX_VALUE;
    this._curCamera.ortho(0, this.width, -this.height, 0, -z, z);
  }

  p5.prototype.endHUD = function () {
    this._renderer.endHUD(...arguments);
  }

  p5.RendererGL.prototype.endHUD = function () {
    let gl = this.drawingContext;
    gl.flush();
    gl.enable(gl.DEPTH_TEST);
    this.pop(this._rendererState);
    this.uPMatrix.set(this.cPMatrix);
    this.uMVMatrix.set(this.cMVMatrix);
  }

  // 2.1 Points

  // NDC stuff needs testing

  p5.prototype.ndcToScreenLocation = function () {
    return this._renderer.ndcToScreenLocation(...arguments);
  }

  p5.RendererGL.prototype.ndcToScreenLocation = function (vector) {
    return createVector(map(vector.x, -1, 1, 0, this.width),
      map(vector.y, -1, 1, 0, this.height),
      map(vector.z, -1, 1, 0, 1));
  }

  p5.prototype.screenToNDCLocation = function () {
    return this._renderer.screenToNDCLocation(...arguments);
  }

  p5.RendererGL.prototype.screenToNDCLocation = function (vector) {
    return createVector(map(vector.x, 0, this.width, -1, 1),
      map(vector.y, 0, this.height, -1, 1),
      map(vector.z, 0, 1, -1, 1));
  }

  p5.prototype.screenLocation = function () {
    return this._renderer.screenLocation(...arguments);
  }

  p5.RendererGL.prototype.screenLocation = function (
    {
      vector = createVector(0, 0, 0.5),
      pvMatrix = this.cachePVMatrix()
    } = {}) {
    let target = Array(4);
    target[0] = pvMatrix.mat4[0] * vector.x + pvMatrix.mat4[4] * vector.y + pvMatrix.mat4[8] * vector.z + pvMatrix.mat4[12];
    target[1] = pvMatrix.mat4[1] * vector.x + pvMatrix.mat4[5] * vector.y + pvMatrix.mat4[9] * vector.z + pvMatrix.mat4[13];
    target[2] = pvMatrix.mat4[2] * vector.x + pvMatrix.mat4[6] * vector.y + pvMatrix.mat4[10] * vector.z + pvMatrix.mat4[14];
    target[3] = pvMatrix.mat4[3] * vector.x + pvMatrix.mat4[7] * vector.y + pvMatrix.mat4[11] * vector.z + pvMatrix.mat4[15];
    if (target[3] == 0) {
      throw new Error('screenLocation broken. Check your cachePVMatrix!');
    }
    let viewport = [0, this.height, this.width, -this.height];
    // ndc, but y is inverted
    target[0] /= target[3];
    target[1] /= target[3];
    target[2] /= target[3];
    // Map x, y and z to range 0-1
    target[0] = target[0] * 0.5 + 0.5;
    target[1] = target[1] * 0.5 + 0.5;
    target[2] = target[2] * 0.5 + 0.5;
    // Map x,y to viewport
    target[0] = target[0] * viewport[2] + viewport[0];
    target[1] = target[1] * viewport[3] + viewport[1];
    return createVector(target[0], target[1], target[2]);
  }

  // warning: cannot use the location fx name

  p5.prototype.locationT = function () {
    return this._renderer.locationT(...arguments);
  }

  // neeeds testing
  p5.RendererGL.prototype.locationT = function (
    {
      vector = createVector(this.width / 2, this.height / 2, 0.5),
      cachePVInvMatrix = this.cachePVInvMatrix()
    } = {}) {
    let viewport = [0, this.height, this.width, -this.height];
    let source = Array(4);
    let target = Array(4);
    source[0] = vector.x;
    source[1] = vector.y;
    source[2] = vector.z;
    source[3] = 1.0;
    // Map x and y from window coordinates
    source[0] = (source[0] - viewport[0]) / viewport[2];
    source[1] = (source[1] - viewport[1]) / viewport[3];
    // Map to range -1 to 1
    source[0] = source[0] * 2 - 1;
    source[1] = source[1] * 2 - 1;
    source[2] = source[2] * 2 - 1;
    // cachePVInvMatrix.multiply(source, target);
    target[0] = cachePVInvMatrix.mat4[0] * source[0] + cachePVInvMatrix.mat4[4] * source[1] + cachePVInvMatrix.mat4[8] * source[2] + cachePVInvMatrix.mat4[12] * source[3];
    target[1] = cachePVInvMatrix.mat4[1] * source[0] + cachePVInvMatrix.mat4[5] * source[1] + cachePVInvMatrix.mat4[9] * source[2] + cachePVInvMatrix.mat4[13] * source[3];
    target[2] = cachePVInvMatrix.mat4[2] * source[0] + cachePVInvMatrix.mat4[6] * source[1] + cachePVInvMatrix.mat4[10] * source[2] + cachePVInvMatrix.mat4[14] * source[3];
    target[3] = cachePVInvMatrix.mat4[3] * source[0] + cachePVInvMatrix.mat4[7] * source[1] + cachePVInvMatrix.mat4[11] * source[2] + cachePVInvMatrix.mat4[15] * source[3];
    if (target[3] == 0) {
      throw new Error('location broken. Check your cachePVInvMatrix!');
    }
    target[0] /= target[3];
    target[1] /= target[3];
    target[2] /= target[3];
    return createVector(target[0], target[1], target[2]);
  }

  // 2.2. Vectors

  // NDC stuff needs testing

  p5.prototype.ndcToScreenDisplacement = function () {
    return this._renderer.ndcToScreenDisplacement(...arguments);
  }

  p5.RendererGL.prototype.ndcToScreenDisplacement = function (vector) {
    return createVector(this.width * vector.x / 2, this.height * vector.y / 2, vector.z / 2);
  }

  p5.prototype.screenToNDCDisplacement = function () {
    return this._renderer.screenToNDCDisplacement(...arguments);
  }

  p5.RendererGL.prototype.screenToNDCDisplacement = function (vector) {
    return createVector(2 * vector.x / this.width, 2 * vector.y / this.height, 2 * vector.z);
  }

  /*
  From nub
  Note 1

  Nub methods:
  Vector displacement(Vector vector)
  Vector screenDisplacement(Vector vector)
  
  (at the very least) require the following p5.Camera methods:
  p5.Camera.prototype.displacement = function ( vector )
  p5.Camera.prototype.Worldisplacement = function ( vector )
  p5.Camera.prototype.location = function ( vector )

  and, optionally:
  p5.Camera.prototype.worldLocation = function ( vector )
  
  Note 2

  The above camera methods need to hack the nub Node
  counterparts, e.g., p5.Camera.prototype.location -> Node.location,
  and to implement Quaternion rotations
  */

  // 3. Drawing stuff

  p5.prototype.hollowCylinder = function () {
    this._renderer.hollowCylinder(...arguments);
  }

  p5.RendererGL.prototype.hollowCylinder = function ({
    radius = 100,
    height = 200,
    detail = 32
  } = {}) {
    this._rendererState = this.push();
    this.beginShape(TRIANGLE_STRIP);
    for (let i = 0; i <= detail; i++) {
      let angle = TWO_PI / detail;
      let x = sin(i * angle);
      let z = cos(i * angle);
      // not even nee to check (this._tex)
      // to see to avoid missing tex p5 warnings
      let u = float(i) / detail;
      this.vertex(x * radius, -height / 2, z * radius, u, 0);
      this.vertex(x * radius, +height / 2, z * radius, u, 1);
    }
    this.endShape();
    this.pop(this._rendererState);
  }

  p5.prototype.axes = function () {
    this._renderer.axes();
  }

  // Adapted from here: https://github.com/VisualComputing/nub/blob/b76a9f0de7c4a56e4c095193f147311ab665299d/src/nub/core/Scene.java#L4970
  // TODO needs fix. Currently broken!
  p5.RendererGL.prototype.axes = function () {
    this._rendererState = this.push();
    let length = 100;
    //this.colorMode(this.RGB, 255);
    let charWidth = length / 40;
    let charHeight = length / 30;
    let charShift = 1.04 * length;
    this._rendererState = this.push();
    this.beginShape(LINES);
    this.strokeWeight(2);
    // The X
    this.stroke(200, 0, 0);
    this.vertex(charShift, charWidth, -charHeight);
    this.vertex(charShift, -charWidth, charHeight);
    this.vertex(charShift, -charWidth, -charHeight);
    this.vertex(charShift, charWidth, charHeight);
    // The Y
    this.stroke(0, 200, 0);
    this.vertex(charWidth, charShift, charHeight);
    this.vertex(0, charShift, 0);
    this.vertex(-charWidth, charShift, charHeight);
    this.vertex(0, charShift, 0);
    this.vertex(0, charShift, 0);
    this.vertex(0, charShift, -charHeight);
    // The Z
    this.stroke(0, 100, 200);
    this.vertex(-charWidth, -charHeight, charShift);
    this.vertex(charWidth, -charHeight, charShift);
    this.vertex(charWidth, -charHeight, charShift);
    this.vertex(-charWidth, charHeight, charShift);
    this.vertex(-charWidth, charHeight, charShift);
    this.vertex(charWidth, charHeight, charShift);
    this.endShape();
    this.pop(this._rendererState);
    // X Axis
    this.stroke(200, 0, 0);
    this.line(0, 0, 0, length, 0, 0);
    // Y Axis
    this.stroke(0, 200, 0);
    this.line(0, 0, 0, 0, length, 0);
    // Z Axis
    this.stroke(0, 100, 200);
    this.line(0, 0, 0, 0, 0, length);
    this.pop(this._rendererState);
  }

  // 4. Shader utilities

  p5.prototype.readShader = function (fragFilename,
    { color = 'vVertexColor',
      texcoord = 'vTexCoord'
    } = {}) {
    let shader = new p5.Shader();
    shader._vertSrc = _vertexShader(color, texcoord);
    this.loadStrings(
      fragFilename,
      result => {
        shader._fragSrc = result.join('\n')
      }
    );
    return shader;
  }

  p5.prototype.makeShader = function (fragSrc,
    { color = 'vVertexColor',
      texcoord = 'vTexCoord'
    } = {}) {
    let shader = new p5.Shader();
    shader._vertSrc = _vertexShader(color, texcoord);
    shader._fragSrc = fragSrc;
    return shader;
  }

  p5.prototype.emitPointerPosition = function () {
    this._renderer.emitPointerPosition(...arguments);
  }

  p5.RendererGL.prototype.emitPointerPosition = function (shader, pointerX, pointerY, uniform = 'u_mouse') {
    shader.setUniform(uniform, [pointerX * pixelDensity(), (this.height - pointerY) * pixelDensity()]);
  }

  p5.prototype.emitResolution = function () {
    this._renderer.emitResolution(...arguments);
  }

  p5.RendererGL.prototype.emitResolution = function (shader, uniform = 'u_resolution') {
    shader.setUniform(uniform, [this.width * pixelDensity(), this.height * pixelDensity()]);
  }

  p5.prototype.emitTexOffset = function (shader, image, uniform = 'u_texoffset') {
    shader.setUniform(uniform, [1 / image.width, 1 / image.height]);
  }

  function _vertexShader(color, texcoord) {
    return `precision highp float;
          attribute vec3 aPosition;
          attribute vec2 aTexCoord;
          attribute vec4 aVertexColor;
          uniform mat4 uProjectionMatrix;
          uniform mat4 uModelViewMatrix;
          varying vec4 ${color};
          varying vec2 ${texcoord};
          void main() {
            ${color} = aVertexColor;
            ${texcoord} = aTexCoord;
            gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
          }`;
  }
})();