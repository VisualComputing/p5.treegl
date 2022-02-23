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

  // 0. Matrix multiplication!

  p5.Matrix.prototype.times = function (matrix) {
    let r00 = this.mat4[0] * matrix.mat4[0] + this.mat4[4] * matrix.mat4[1] + this.mat4[8] * matrix.mat4[2] + this.mat4[12] * matrix.mat4[3];
    let r01 = this.mat4[0] * matrix.mat4[4] + this.mat4[4] * matrix.mat4[5] + this.mat4[8] * matrix.mat4[6] + this.mat4[12] * matrix.mat4[7];
    let r02 = this.mat4[0] * matrix.mat4[8] + this.mat4[4] * matrix.mat4[9] + this.mat4[8] * matrix.mat4[10] + this.mat4[12] * matrix.mat4[11];
    let r03 = this.mat4[0] * matrix.mat4[12] + this.mat4[4] * matrix.mat4[13] + this.mat4[8] * matrix.mat4[14] + this.mat4[12] * matrix.mat4[15];

    let r10 = this.mat4[1] * matrix.mat4[0] + this.mat4[5] * matrix.mat4[1] + this.mat4[9] * matrix.mat4[2] + this.mat4[13] * matrix.mat4[3];
    let r11 = this.mat4[1] * matrix.mat4[4] + this.mat4[5] * matrix.mat4[5] + this.mat4[9] * matrix.mat4[6] + this.mat4[13] * matrix.mat4[7];
    let r12 = this.mat4[1] * matrix.mat4[8] + this.mat4[5] * matrix.mat4[9] + this.mat4[9] * matrix.mat4[10] + this.mat4[13] * matrix.mat4[11];
    let r13 = this.mat4[1] * matrix.mat4[12] + this.mat4[5] * matrix.mat4[13] + this.mat4[9] * matrix.mat4[14] + this.mat4[13] * matrix.mat4[15];

    let r20 = this.mat4[2] * matrix.mat4[0] + this.mat4[6] * matrix.mat4[1] + this.mat4[10] * matrix.mat4[2] + this.mat4[14] * matrix.mat4[3];
    let r21 = this.mat4[2] * matrix.mat4[4] + this.mat4[6] * matrix.mat4[5] + this.mat4[10] * matrix.mat4[6] + this.mat4[14] * matrix.mat4[7];
    let r22 = this.mat4[2] * matrix.mat4[8] + this.mat4[6] * matrix.mat4[9] + this.mat4[10] * matrix.mat4[10] + this.mat4[14] * matrix.mat4[11];
    let r23 = this.mat4[2] * matrix.mat4[12] + this.mat4[6] * matrix.mat4[13] + this.mat4[10] * matrix.mat4[14] + this.mat4[14] * matrix.mat4[15];

    let r30 = this.mat4[3] * matrix.mat4[0] + this.mat4[7] * matrix.mat4[1] + this.mat4[11] * matrix.mat4[2] + this.mat4[15] * matrix.mat4[3];
    let r31 = this.mat4[3] * matrix.mat4[4] + this.mat4[7] * matrix.mat4[5] + this.mat4[11] * matrix.mat4[6] + this.mat4[15] * matrix.mat4[7];
    let r32 = this.mat4[3] * matrix.mat4[8] + this.mat4[7] * matrix.mat4[9] + this.mat4[11] * matrix.mat4[10] + this.mat4[15] * matrix.mat4[11];
    let r33 = this.mat4[3] * matrix.mat4[12] + this.mat4[7] * matrix.mat4[13] + this.mat4[11] * matrix.mat4[14] + this.mat4[15] * matrix.mat4[15];

    this.mat4[0] = r00;
    this.mat4[4] = r01;
    this.mat4[8] = r02;
    this.mat4[12] = r03;
    this.mat4[1] = r10;
    this.mat4[5] = r11;
    this.mat4[9] = r12;
    this.mat4[13] = r13;
    this.mat4[2] = r20;
    this.mat4[6] = r21;
    this.mat4[10] = r22;
    this.mat4[14] = r23;
    this.mat4[3] = r30;
    this.mat4[7] = r31;
    this.mat4[11] = r32;
    this.mat4[15] = r33;
  }

  // 1. Matrix caches

  p5.prototype.cacheMVMatrix = function () {
    return this._renderer.cacheMVMatrix(...arguments);
  }

  p5.RendererGL.prototype.cacheMVMatrix = function () {
    this.cMVMatrix = this.uMVMatrix.copy();
    return this.cMVMatrix;
  }

  p5.prototype.cacheVMatrix = function () {
    return this._renderer.cacheVMatrix(...arguments);
  }

  p5.RendererGL.prototype.cacheVMatrix = function () {
    this.cVMatrix = this._curCamera.cameraMatrix.copy();
    return this.cVMatrix;
  }

  p5.prototype.cachePMatrix = function () {
    return this._renderer.cachePMatrix(...arguments);
  }

  p5.RendererGL.prototype.cachePMatrix = function () {
    this.cPMatrix = this.uPMatrix.copy();
    return this.cPMatrix;
  }

  p5.prototype.cachePVMatrix = function () {
    return this._renderer.cachePVMatrix(...arguments);
  }
  p5.RendererGL.prototype.cachePVMatrix = function () {
    this.cacheVMatrix();
    this.cachePMatrix();
    this.cPVMatrix = this.cPMatrix.copy();
    this.cPVMatrix.times(this.cVMatrix.copy());
    return this.cPVMatrix;
  }

  p5.prototype.cachePVInvMatrix = function () {
    return this._renderer.cachePVInvMatrix(...arguments);
  }

  p5.RendererGL.prototype.cachePVInvMatrix = function () {
    this.cachePVMatrix();
    this.cPVInvMatrix = this.cPVMatrix.copy();
    this.cPVInvMatrix.invert();
    return this.cPVInvMatrix;
  }

  // 2. Space transformations

  p5.prototype.beginHUD = function () {
    this._renderer.beginHUD(...arguments);
  }

  p5.prototype.endHUD = function () {
    this._renderer.endHUD(...arguments);
  }

  p5.RendererGL.prototype.beginHUD = function () {
    this.cacheMVMatrix();
    this.cachePMatrix();
    this._rendererState = this.push();
    let gl = this.drawingContext;
    gl.flush();
    gl.disable(gl.DEPTH_TEST);
    let z = Number.MAX_VALUE;
    this.resetMatrix();
    this._curCamera.ortho(-this.width / 2, this.width / 2, -this.height / 2, this.height / 2, -z, z);
  }

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
    let _in = Array(4);
    let out = Array(4);
    _in[0] = vector.x;
    _in[1] = vector.y;
    _in[2] = vector.z;
    _in[3] = 1;
    out[0] = pvMatrix.mat4[0] * _in[0] + pvMatrix.mat4[4] * _in[1] + pvMatrix.mat4[8] * _in[2]
      + pvMatrix.mat4[12] * _in[3];
    out[1] = pvMatrix.mat4[1] * _in[0] + pvMatrix.mat4[5] * _in[1] + pvMatrix.mat4[9] * _in[2]
      + pvMatrix.mat4[13] * _in[3];
    out[2] = pvMatrix.mat4[2] * _in[0] + pvMatrix.mat4[6] * _in[1] + pvMatrix.mat4[10] * _in[2]
      + pvMatrix.mat4[14] * _in[3];
    out[3] = pvMatrix.mat4[3] * _in[0] + pvMatrix.mat4[7] * _in[1] + pvMatrix.mat4[11] * _in[2]
      + pvMatrix.mat4[15] * _in[3];
    if (out[3] == 0)
      return null;
    let viewport = Array(4);
    viewport[0] = 0;
    viewport[1] = height;
    viewport[2] = width;
    viewport[3] = -height;
    // ndc, but y is inverted
    out[0] /= out[3];
    out[1] /= out[3];
    out[2] /= out[3];
    // Map x, y and z to range 0-1
    out[0] = out[0] * 0.5 + 0.5;
    out[1] = out[1] * 0.5 + 0.5;
    out[2] = out[2] * 0.5 + 0.5;
    // Map x,y to viewport
    out[0] = out[0] * viewport[2] + viewport[0];
    out[1] = out[1] * viewport[3] + viewport[1];
    return createVector(out[0], out[1], out[2]);
  }

  /*
  p5.prototype.location = function () {
    return this._renderer.location(...arguments);
  }

  p5.RendererGL.prototype.location = function (vector) {
    let viewport = [0, this.height, this.width, -this.height];
    let _in = [vector.x, vector.y, vector.z, 1];
    let out = [];
    // Map x and y from window coordinates
    vector.x = (vector.x - viewport[0]) / viewport[2];
    vector.y = (vector.y - viewport[1]) / viewport[3];
    // Map to range -1 to 1
    vector.x = vector.x * 2 - 1;
    vector.y = vector.y * 2 - 1;
    vector.z = vector.z * 2 - 1;
    projectionViewInverseMatrix.multiply(_in, out);
    if (out[3] === 0) {
      throw new Error('location broken. Make sure to call _bind first');
    }
    out[0] /= out[3];
    out[1] /= out[3];
    out[2] /= out[3];
    return new Vector(out[0], out[1], out[2]);
  }
  */

  /*
  public Vector ndcToScreenDisplacement(Vector vector) {
    return new Vector(width() * vector.x() / 2, height() * vector.y() / 2, vector.z() / 2);
  }

  public Vector screenToNDCDisplacement(Vector vector) {
    return new Vector(2 * vector.x() / (float) width(), 2 * vector.y() / (float) height(), 2 * vector.z());
  }

  public Vector displacement(Vector vector) {
    return this.displacement(vector, null);
  }

  public Vector displacement(Vector vector, Node node) {
    float dx = vector.x();
    float dy = _leftHanded ? vector.y() : -vector.y();
    // Scale to fit the screen relative vector displacement
    if (_type == Type.PERSPECTIVE) {
      Vector position = node == null ? new Vector() : node.worldPosition();
      float k = Math.abs(_eye.location(position)._vector[2] * (float) Math.tan(fov() / 2.0f));
      dx *= 2.0 * k / ((float) height());
      dy *= 2.0 * k / ((float) height());
    }
    float dz = vector.z();
    dz *= (near() - far()) / (_type == Type.PERSPECTIVE ? (float) Math.tan(fov() / 2.0f) : Math.abs(right() - left()) / (float) width());
    Vector eyeVector = new Vector(dx, dy, dz);
    return node == null ? _eye.worldDisplacement(eyeVector) : node.displacement(eyeVector, _eye);
  }

  public Vector screenDisplacement(Vector vector) {
    return screenDisplacement(vector, null);
  }

  public Vector screenDisplacement(Vector vector, Node node) {
    Vector eyeVector = _eye.displacement(vector, node);
    float dx = eyeVector.x();
    float dy = _leftHanded ? eyeVector.y() : -eyeVector.y();
    if (_type == Type.PERSPECTIVE) {
      Vector position = node == null ? new Vector() : node.worldPosition();
      float k = Math.abs(_eye.location(position)._vector[2] * (float) Math.tan(fov() / 2.0f));
      dx /= 2.0 * k / ((float) height() * _eye.worldMagnitude());
      dy /= 2.0 * k / ((float) height() * _eye.worldMagnitude());
    }
    float dz = eyeVector.z();
    // sign is inverted
    dz /= (near() - far()) / (_type == Type.PERSPECTIVE ? (float) Math.tan(fov() / 2.0f) : Math.abs(right() - left()) / (float) width());
    return new Vector(dx, dy, dz);
  }
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

  p5.RendererGL.prototype.endHUD = function () {
    let gl = this.drawingContext;
    gl.flush();
    gl.enable(gl.DEPTH_TEST);
    this.pop(this._rendererState);
    this.uPMatrix.set(this.cPMatrix);
    this.uMVMatrix.set(this.cMVMatrix);
  }

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