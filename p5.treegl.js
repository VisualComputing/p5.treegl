'use strict';

// See:
// https://github.com/processing/p5.js/blob/main/contributor_docs/creating_libraries.md
// https://github.com/processing/p5.js/blob/main/src/core/README.md
// https://github.com/processing/p5.js/blob/main/contributor_docs/webgl_mode_architecture.md
(function () {
  const INFO =
  {
    LIBRARY: 'p5.treegl',
    VERSION: '0.1.0',
    HOMEPAGE: 'https://github.com/VisualComputing/p5.treegl'
  };

  console.log(INFO);

  // 1. Matrix stuff

  p5.Matrix.prototype.mult3 = function (vector) {
    if (this.mat3 === undefined) {
      console.error('mult3 only works with mat3');
      return;
    }
    return createVector(this.mat3[0] * vector.x + this.mat3[3] * vector.y + this.mat3[6] * vector.z,
      this.mat3[1] * vector.x + this.mat3[4] * vector.y + this.mat3[7] * vector.z,
      this.mat3[2] * vector.x + this.mat3[5] * vector.y + this.mat3[8] * vector.z);
  };

  p5.Matrix.prototype.mult4 = function (vector) {
    return createVector(...this._mult4([vector.x, vector.y, vector.z, 1]));
  };

  p5.Matrix.prototype._mult4 = function (vec4) {
    if (this.mat4 === undefined) {
      console.error('_mult4 only works with mat4');
      return;
    }
    return [this.mat4[0] * vec4[0] + this.mat4[4] * vec4[1] + this.mat4[8] * vec4[2] + this.mat4[12] * vec4[3],
    this.mat4[1] * vec4[0] + this.mat4[5] * vec4[1] + this.mat4[9] * vec4[2] + this.mat4[13] * vec4[3],
    this.mat4[2] * vec4[0] + this.mat4[6] * vec4[1] + this.mat4[10] * vec4[2] + this.mat4[14] * vec4[3],
    this.mat4[3] * vec4[0] + this.mat4[7] * vec4[1] + this.mat4[11] * vec4[2] + this.mat4[15] * vec4[3]];
  };

  p5.prototype.tMatrix = function (matrix) {
    return matrix.copy().transpose(matrix);
  }

  p5.prototype.invMatrix = function (matrix) {
    return matrix.copy().invert(matrix);
  }

  p5.prototype.axbMatrix = function (a, b) {
    return a.copy().apply(b);
  }

  p5.prototype.iMatrix = function () {
    return new p5.Matrix();
  }

  // defaults: from: iMatrix, to: eMatrix
  p5.prototype.lMatrix = function (
    {
      from = iMatrix(),
      to = eMatrix()
    } = {}) {
    return invMatrix(to).apply(from);
  }

  // defaults: from: iMatrix, to: eMatrix
  p5.prototype.dMatrix = function (
    {
      from = iMatrix(),
      to = eMatrix(),
      matrix = invMatrix(from).apply(to)
    } = {}) {
    // Note that this transposes mat4 into mat3
    return new p5.Matrix('mat3', [matrix.mat4[0], matrix.mat4[4], matrix.mat4[8],
    matrix.mat4[1], matrix.mat4[5], matrix.mat4[9],
    matrix.mat4[2], matrix.mat4[6], matrix.mat4[10]]);
  }

  p5.prototype.pMatrix = function () {
    return this._renderer.pMatrix(...arguments);
  }

  p5.RendererGL.prototype.pMatrix = function () {
    return this.uPMatrix.copy();
  }

  p5.prototype.mvMatrix = function () {
    return this._renderer.mvMatrix(...arguments);
  }

  // defaults when mMatrix is defined: vMatrix: this.vMatrix, mMatrix:
  // otherwise it returns a copy of the current mvMatrix
  p5.RendererGL.prototype.mvMatrix = function (
    {
      vMatrix,
      mMatrix
    } = {}) {
    return mMatrix ? axbMatrix(vMatrix ?? this.vMatrix(), mMatrix) : this.uMVMatrix.copy();
  }

  p5.prototype.mMatrix = function () {
    return this._renderer.mMatrix(...arguments);
  }

  // defaults: eMatrix: this.eMatrix, mvMatrix: this.mvMatrix
  p5.RendererGL.prototype.mMatrix = function (
    {
      eMatrix = this.eMatrix(),
      mvMatrix = this.mvMatrix()
    } = {}) {
    return axbMatrix(eMatrix, mvMatrix);
  }

  p5.prototype.nMatrix = function () {
    return this._renderer.nMatrix(...arguments);
  }

  p5.RendererGL.prototype.nMatrix = function ({
    vMatrix,
    mMatrix,
    mvMatrix = this.mvMatrix({ mMatrix: mMatrix, vMatrix: vMatrix })
  } = {}) {
    return new p5.Matrix('mat3').inverseTranspose(mvMatrix);
  }

  p5.prototype.vMatrix = function () {
    return this._renderer.vMatrix(...arguments);
  }

  p5.RendererGL.prototype.vMatrix = function () {
    return this._curCamera.vMatrix();
  }

  p5.Camera.prototype.vMatrix = function () {
    return this.cameraMatrix.copy();
  }

  p5.prototype.eMatrix = function () {
    return this._renderer.eMatrix(...arguments);
  }

  p5.RendererGL.prototype.eMatrix = function () {
    return this._curCamera.eMatrix();
  }

  p5.Camera.prototype.eMatrix = function () {
    return invMatrix(this.cameraMatrix);
  }

  p5.prototype.pvMatrix = function () {
    return this._renderer.pvMatrix(...arguments);
  }

  // defaults: pMatrix: this.pMatrix, vMatrix: this.vMatrix
  p5.RendererGL.prototype.pvMatrix = function (
    {
      pMatrix = this.uPMatrix,
      vMatrix = this._curCamera.cameraMatrix
    } = {}) {
    return axbMatrix(pMatrix, vMatrix);
  }

  p5.prototype.pvInvMatrix = function () {
    return this._renderer.pvInvMatrix(...arguments);
  }

  p5.RendererGL.prototype.pvInvMatrix = function (
    {
      pMatrix,
      vMatrix,
      pvMatrix
    } = {}) {
    let matrix = pvMatrix ? pvMatrix.copy() : this.pvMatrix({ pMatrix: pMatrix, vMatrix: vMatrix });
    return matrix.invert(matrix);
  }

  p5.prototype._isOrtho = function () {
    return this._renderer._isOrtho(...arguments);
  }

  p5.RendererGL.prototype._isOrtho = function () {
    return this.uPMatrix._isOrtho();
  }

  p5.Matrix.prototype._isOrtho = function () {
    return this.mat4[15] != 0;
  }

  p5.prototype.nPlane = function () {
    return this._renderer.nPlane(...arguments);
  }

  p5.RendererGL.prototype.nPlane = function () {
    return this.uPMatrix.nPlane();
  }

  p5.Matrix.prototype.nPlane = function () {
    return this.mat4[15] == 0 ? this.mat4[14] / (this.mat4[10] - 1) :
      (1 + this.mat4[14]) / this.mat4[10];
  }

  p5.prototype.fPlane = function () {
    return this._renderer.fPlane(...arguments);
  }

  p5.RendererGL.prototype.fPlane = function () {
    return this.uPMatrix.fPlane();
  }

  p5.Matrix.prototype.fPlane = function () {
    return this.mat4[15] == 0 ? this.mat4[14] / (1 + this.mat4[10]) :
      (this.mat4[14] - 1) / this.mat4[10];
  }

  p5.prototype.lPlane = function () {
    return this._renderer.lPlane(...arguments);
  }

  p5.RendererGL.prototype.lPlane = function () {
    return this.uPMatrix.lPlane();
  }

  p5.Matrix.prototype.lPlane = function () {
    return this.mat4[15] == 1 ? -(1 + this.mat4[12]) / this.mat4[0] :
      this.nPlane() * (this.mat4[8] - 1) / this.mat4[0];
  }

  p5.prototype.rPlane = function () {
    return this._renderer.rPlane(...arguments);
  }

  p5.RendererGL.prototype.rPlane = function () {
    return this.uPMatrix.rPlane();
  }

  p5.Matrix.prototype.rPlane = function () {
    return this.mat4[15] == 1 ? (1 - this.mat4[12]) / this.mat4[0] :
      this.nPlane() * (1 + this.mat4[8]) / this.mat4[0];
  }

  p5.prototype.tPlane = function () {
    return this._renderer.tPlane(...arguments);
  }

  p5.RendererGL.prototype.tPlane = function () {
    return this.uPMatrix.tPlane();
  }

  p5.Matrix.prototype.tPlane = function () {
    // note that inverted values are returned if the projection
    // matrix was set with @function frustum.
    return this.mat4[15] == 1 ? (this.mat4[13] - 1) / this.mat4[5] :
      this.nPlane() * (this.mat4[9] - 1) / this.mat4[5];
  }

  p5.prototype.bPlane = function () {
    return this._renderer.bPlane(...arguments);
  }

  p5.RendererGL.prototype.bPlane = function () {
    return this.uPMatrix.bPlane();
  }

  p5.Matrix.prototype.bPlane = function () {
    // note that inverted values are returned if the projection
    // matrix was set with @function frustum.
    return this.mat4[15] == 1 ? (1 + this.mat4[13]) / this.mat4[5] :
      this.nPlane() * (1 + this.mat4[9]) / this.mat4[5];
  }

  p5.prototype.fov = function () {
    return this._renderer.fov(...arguments);
  }

  p5.RendererGL.prototype.fov = function () {
    return this.uPMatrix.fov();
  }

  p5.Matrix.prototype.fov = function () {
    if (this.mat4[15] != 0) {
      console.error('fov only works for a perspective projection');
      return;
    }
    return Math.abs(2 * Math.atan(1 / this.mat4[5]));
  }

  p5.prototype.hfov = function () {
    return this._renderer.hfov(...arguments);
  }

  p5.RendererGL.prototype.hfov = function () {
    return this.uPMatrix.hfov();
  }

  p5.Matrix.prototype.hfov = function () {
    if (this.mat4[15] != 0) {
      console.error('hfov only works for a perspective projection');
      return;
    }
    return Math.abs(2 * Math.atan(1 / this.mat4[0]));
  }

  // 2. Space transformations

  p5.prototype.beginHUD = function () {
    if (this._renderer instanceof p5.RendererGL) {
      this._renderer.beginHUD(...arguments);
    }
  }

  p5.RendererGL.prototype.beginHUD = function () {
    this.mv = this.mvMatrix();
    this.p = this.pMatrix();
    this._rendererState = this.push();
    let gl = this.drawingContext;
    gl.flush();
    gl.disable(gl.DEPTH_TEST);
    this.resetMatrix();
    let z = Number.MAX_VALUE;
    this._curCamera.ortho(0, this.width, -this.height, 0, -z, z);
  }

  p5.prototype.endHUD = function () {
    if (this._renderer instanceof p5.RendererGL) {
      this._renderer.endHUD(...arguments);
    }
  }

  p5.RendererGL.prototype.endHUD = function () {
    let gl = this.drawingContext;
    gl.flush();
    gl.enable(gl.DEPTH_TEST);
    this.pop(this._rendererState);
    this.uPMatrix.set(this.p);
    this.uMVMatrix.set(this.mv);
  }

  // 2.1 Points

  // NDC stuff needs testing

  p5.prototype.treeLocation = function () {
    return this._renderer.treeLocation(...arguments);
  }

  /**
   * Converts locations (i.e., points) from one space into another.
   * @param  {p5.Vector} vector      location to be converted.
   * @param  {p5.Matrix|String} from source space: either a global
   *                                 transform matrix or 'WORLD', 'EYE',
   *                                 'SCREEN' or 'NDC'.
   * @param  {p5.Matrix|String} to   target space: either a global
   *                                 transform matrix or 'WORLD', 'EYE',
   *                                 'SCREEN' or 'NDC'.
   * @param  {p5.Matrix} pMatrix     projection matrix.
   * @param  {p5.Matrix} vMatrix     view matrix.
   * @param  {p5.Matrix} pvMatrix    projection times view matrix.
   * @param  {p5.Matrix} pvInvMatrix (projection times view matrix)^-1.
   */
  p5.RendererGL.prototype.treeLocation = function (vector, {
    from = 'SCREEN',
    to = 'WORLD',
    pMatrix,
    vMatrix,
    eMatrix,
    pvMatrix,
    pvInvMatrix
  } = {}) {
    if (Array.isArray(vector)) {
      vector = createVector(vector[0] ?? 0, vector[1] ?? 0, vector[2] ?? 0);
    }
    if ((from == 'WORLD') && (to == 'SCREEN')) {
      return this._screenLocation({ vector: vector, pMatrix: pMatrix, vMatrix: vMatrix, pvMatrix: pvMatrix });
    }
    if ((from == 'SCREEN') && (to == 'WORLD')) {
      return this._location({ vector: vector, pMatrix: pMatrix, vMatrix: vMatrix, pvMatrix: pvMatrix, pvInvMatrix: pvInvMatrix });
    }
    if (from == 'SCREEN' && to == 'NDC') {
      return this._screenToNDCLocation(vector);
    }
    if (from == 'NDC' && to == 'SCREEN') {
      return this._ndcToScreenLocation(vector);
    }
    if (from == 'WORLD' && to == 'NDC') {
      return this._screenToNDCLocation(this._screenLocation({ vector: vector, pMatrix: pMatrix, vMatrix: vMatrix, pvMatrix: pvMatrix }));
    }
    if (from == 'NDC' && to == 'WORLD') {
      return this._location({ vector: this._ndcToScreenLocation(vector), pMatrix: pMatrix, vMatrix: vMatrix, pvMatrix: pvMatrix, pvInvMatrix: pvInvMatrix });
    }
    if (from == 'NDC' && (to instanceof p5.Matrix || to == 'EYE')) {
      return (to == 'EYE' ? (vMatrix ?? this.vMatrix()) : invMatrix(to)).mult4(this._location({ vector: this._ndcToScreenLocation(vector), pMatrix: pMatrix, vMatrix: vMatrix, pvMatrix: pvMatrix, pvInvMatrix: pvInvMatrix }));
    }
    if ((from instanceof p5.Matrix || from == 'EYE') && to == 'NDC') {
      return this._screenToNDCLocation(this._screenLocation({ vector: (from == 'EYE' ? (eMatrix ?? this.eMatrix()) : from).mult4(vector), pMatrix: pMatrix, vMatrix: vMatrix, pvMatrix: pvMatrix }));
    }
    if (from == 'WORLD' && (to instanceof p5.Matrix || to == 'EYE')) {
      return (to == 'EYE' ? (vMatrix ?? this.vMatrix()) : invMatrix(to)).mult4(vector);
    }
    if ((from instanceof p5.Matrix || from == 'EYE') && to == 'WORLD') {
      return (from == 'EYE' ? (eMatrix ?? this.eMatrix()) : from).mult4(vector);
    }
    if (from instanceof p5.Matrix && to instanceof p5.Matrix) {
      return lMatrix({ from: from, to: to }).mult4(vector);
    }
    if (from == 'SCREEN' && (to instanceof p5.Matrix || to == 'EYE')) {
      return (to == 'EYE' ? (vMatrix ?? this.vMatrix()) : invMatrix(to)).mult4(this._location({ vector: vector, pMatrix: pMatrix, vMatrix: vMatrix, pvMatrix: pvMatrix, pvInvMatrix: pvInvMatrix }));
    }
    if ((from instanceof p5.Matrix || from == 'EYE') && to == 'SCREEN') {
      return this._screenLocation({ vector: (from == 'EYE' ? (eMatrix ?? this.eMatrix()) : from).mult4(vector), pMatrix: pMatrix, vMatrix: vMatrix, pvMatrix: pvMatrix });
    }
    console.error('couldn\'t parse your treeLocation query!');
    return vector;
  }

  p5.RendererGL.prototype._ndcToScreenLocation = function (vector) {
    return createVector(map(vector.x, -1, 1, 0, this.width),
      map(vector.y, -1, 1, 0, this.height),
      map(vector.z, -1, 1, 0, 1));
  }

  p5.RendererGL.prototype._screenToNDCLocation = function (vector) {
    return createVector(map(vector.x, 0, this.width, -1, 1),
      map(vector.y, 0, this.height, -1, 1),
      map(vector.z, 0, 1, -1, 1));
  }

  p5.RendererGL.prototype._screenLocation = function (
    {
      vector = createVector(0, 0, 0.5),
      pMatrix,
      vMatrix,
      pvMatrix = this.pvMatrix({ pMatrix: pMatrix, vMatrix: vMatrix })
    } = {}) {
    let target = pvMatrix._mult4([vector.x, vector.y, vector.z, 1]);
    if (target[3] == 0) {
      console.error('screenLocation broken. Check your pvMatrix!');
      return;
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

  p5.RendererGL.prototype._location = function (
    {
      vector = createVector(this.width / 2, this.height / 2, 0.5),
      pMatrix,
      vMatrix,
      pvMatrix,
      pvInvMatrix = this.pvInvMatrix({ pMatrix: pMatrix, vMatrix: vMatrix, pvMatrix: pvMatrix })
    } = {}) {
    let viewport = [0, this.height, this.width, -this.height];
    let source = [vector.x, vector.y, vector.z, 1];
    // Map x and y from window coordinates
    source[0] = (source[0] - viewport[0]) / viewport[2];
    source[1] = (source[1] - viewport[1]) / viewport[3];
    // Map to range -1 to 1
    source[0] = source[0] * 2 - 1;
    source[1] = source[1] * 2 - 1;
    source[2] = source[2] * 2 - 1;
    let target = pvInvMatrix._mult4(source);
    if (target[3] == 0) {
      console.error('location broken. Check your pvInvMatrix!');
      return;
    }
    target[0] /= target[3];
    target[1] /= target[3];
    target[2] /= target[3];
    return createVector(target[0], target[1], target[2]);
  }

  // 2.2. Vectors

  // NDC stuff needs testing

  p5.prototype.treeDisplacement = function () {
    return this._renderer.treeDisplacement(...arguments);
  }

  /**
   * Converts displacements (i.e., vectors) from one space into another.
   * @param  {p5.Vector} vector      location to be converted.
   * @param  {p5.Matrix|String} from source space: either a global
   *                                 transform matrix or 'WORLD', 'EYE',
   *                                 'SCREEN' or 'NDC'.
   * @param  {p5.Matrix|String} to   target space: either a global
   *                                 transform matrix or 'WORLD', 'EYE',
   *                                 'SCREEN' or 'NDC'.
   * @param  {p5.Matrix} pMatrix     projection matrix.
   * @param  {p5.Matrix} vMatrix     view matrix.
   * @param  {p5.Matrix} pvMatrix    projection times view matrix.
   * @param  {p5.Matrix} pvInvMatrix (projection times view matrix)^-1.
   */
  p5.RendererGL.prototype.treeDisplacement = function (vector, {
    from = 'EYE',
    to = 'WORLD',
    vMatrix,
    eMatrix,
    pMatrix
  } = {}) {
    if (Array.isArray(vector)) {
      vector = createVector(vector[0] ?? 0, vector[1] ?? 0, vector[2] ?? 0);
    }
    if ((from == 'WORLD') && (to == 'SCREEN')) {
      return this._worldToScreenDisplacement(vector, pMatrix);
    }
    if ((from == 'SCREEN') && (to == 'WORLD')) {
      return this._screenToWorldDisplacement(vector, pMatrix);
    }
    if (from == 'SCREEN' && to == 'NDC') {
      return this._screenToNDCDisplacement(vector);
    }
    if (from == 'NDC' && to == 'SCREEN') {
      return this._ndcToScreenDisplacement(vector);
    }
    if (from == 'WORLD' && to == 'NDC') {
      return this._screenToNDCDisplacement(this._worldToScreenDisplacement(vector, pMatrix));
    }
    if (from == 'NDC' && to == 'WORLD') {
      return this._screenToWorldDisplacement(this._ndcToScreenDisplacement(vector), pMatrix);
    }
    if (from == 'NDC' && to == 'EYE') {
      return dMatrix({ matrix: eMatrix ?? this.eMatrix() }).mult3(this._screenToWorldDisplacement(this._ndcToScreenDisplacement(vector), pMatrix));
    }
    if (from == 'EYE' && to == 'NDC') {
      return this._screenToNDCDisplacement(this._worldToScreenDisplacement(dMatrix({ matrix: vMatrix ?? this.vMatrix() }).mult3(vector), pMatrix));
    }
    if (from == 'SCREEN' && to instanceof p5.Matrix) {
      return dMatrix({ matrix: to }).mult3(this._screenToWorldDisplacement(vector, pMatrix));
    }
    if (from instanceof p5.Matrix && to == 'SCREEN') {
      return this._worldToScreenDisplacement(dMatrix({ matrix: invMatrix(from) }).mult3(vector), pMatrix);
    }
    if (from instanceof p5.Matrix && to instanceof p5.Matrix) {
      return dMatrix({ from: from, to: to }).mult3(vector);
    }
    // all cases below kept for efficiency but they all may
    // be simply expressed in terms of the previous case, by:
    // 'EYE' -> eMatrix()
    // 'WORLD' -> iMatrix()
    if (from == 'EYE' && to == 'WORLD') {
      return dMatrix({ matrix: vMatrix ?? this.vMatrix() }).mult3(vector);
    }
    if (from == 'WORLD' && to == 'EYE') {
      return dMatrix({ matrix: eMatrix ?? this.eMatrix() }).mult3(vector);
    }
    if (from == 'EYE' && to == 'SCREEN') {
      return this._worldToScreenDisplacement(dMatrix({ matrix: vMatrix ?? this.vMatrix() }).mult3(vector), pMatrix);
    }
    if (from == 'SCREEN' && to == 'EYE') {
      return dMatrix({ matrix: eMatrix ?? this.eMatrix() }).mult3(this._screenToWorldDisplacement(vector, pMatrix));
    }
    if (from == 'EYE' && to instanceof p5.Matrix) {
      return dMatrix({ matrix: (vMatrix ?? this.vMatrix()).apply(to) }).mult3(vector);
    }
    if (from instanceof p5.Matrix && to == 'EYE') {
      return dMatrix({ matrix: invMatrix(from).apply(eMatrix ?? this.eMatrix()) }).mult3(vector);
    }
    if (from == 'WORLD' && to instanceof p5.Matrix) {
      return dMatrix({ matrix: to }).mult3(vector);
    }
    if (from instanceof p5.Matrix && to == 'WORLD') {
      return dMatrix({ matrix: invMatrix(from) }).mult3(vector);
    }
    console.error('couldn\'t parse your treeDisplacement query!');
    return vector;
  }

  p5.RendererGL.prototype._worldToScreenDisplacement = function (vector, pMatrix = this.uPMatrix) {
    let eyeVector = this.treeDisplacement(vector, { from: 'WORLD', to: 'EYE' });
    let dx = eyeVector.x;
    let dy = eyeVector.y;
    let perspective = pMatrix.mat4[15] == 0;
    if (perspective) {
      let position = createVector();
      let k = Math.abs(this.treeLocation(position, { from: 'WORLD', to: 'EYE' }).z * Math.tan(this.fov(pMatrix) / 2));
      dx /= 2 * k / this.height;
      dy /= 2 * k / this.height;
    }
    let dz = eyeVector.z;
    // sign is inverted
    dz /= (pMatrix.nPlane() - pMatrix.fPlane()) / (perspective ? Math.tan(this.fov(pMatrix) / 2) : Math.abs(pMatrix.rPlane() - pMatrix.lPlane()) / this.width);
    return createVector(dx, dy, dz);
  }

  p5.RendererGL.prototype._screenToWorldDisplacement = function (vector, pMatrix = this.uPMatrix) {
    let dx = vector.x;
    let dy = vector.y;
    // Scale to fit the screen relative vector displacement
    let perspective = pMatrix.mat4[15] == 0;
    if (perspective) {
      let position = createVector();
      let k = Math.abs(this.treeLocation(position, { from: 'WORLD', to: 'EYE' }).z * Math.tan(this.fov(pMatrix) / 2));
      dx *= 2 * k / this.height;
      dy *= 2 * k / this.height;
    }
    let dz = vector.z;
    dz *= (pMatrix.nPlane() - pMatrix.fPlane()) / (perspective ? Math.tan(this.fov(pMatrix) / 2) : Math.abs(pMatrix.rPlane() - pMatrix.lPlane()) / this.width);
    let eyeVector = createVector(dx, dy, dz);
    return this.treeDisplacement(eyeVector, { from: 'EYE', to: 'WORLD' });
  }

  p5.RendererGL.prototype._ndcToScreenDisplacement = function (vector) {
    return createVector(this.width * vector.x / 2, this.height * vector.y / 2, vector.z / 2);
  }

  p5.RendererGL.prototype._screenToNDCDisplacement = function (vector) {
    return createVector(2 * vector.x / this.width, 2 * vector.y / this.height, 2 * vector.z);
  }

  // 3. Shader utilities

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

  p5.prototype.emitMousePosition = function (shader, uniform = 'u_mouse') {
    shader.setUniform(uniform, [this.mouseX * pixelDensity(), (this.height - this.mouseY) * pixelDensity()]);
  }

  p5.prototype.emitPointerPosition = function () {
    this._renderer.emitPointerPosition(...arguments);
  }

  p5.RendererGL.prototype.emitPointerPosition = function (shader, pointerX, pointerY, uniform = 'u_pointer') {
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

  // 4. Utility functions

  p5.prototype.pixelRatio = function () {
    return this._renderer.pixelRatio(...arguments);
  }

  /**
   * Returns the world to pixel ratio units at given world location.
   * A line of n * pixelRatio(location) world units will be projected
   * with a length of n pixels on screen.
   * @param  {p5.Vector | Array} location      world location reference
   */
  p5.RendererGL.prototype.pixelRatio = function (location) {
    return this._isOrtho() ? Math.abs(this.tPlane() - this.bPlane()) / this.height :
      2 * Math.abs((this.treeLocation(location, { from: 'WORLD', to: 'EYE' })).y) * Math.tan(this.fov() / 2) / this.height;
  }

  // 5. Drawing stuff

  p5.prototype.axes = function () {
    this._renderer.axes(...arguments);
  };

  /**
   * Draws axes.
   */
  p5.RendererGL.prototype.axes = function (size = 100) {
    this._rendererState = this.push();
    const charWidth = size / 40.0;
    const charHeight = size / 30.0;
    const charShift = 1.04 * size;
    this.strokeWeight(1);
    // The X
    this.stroke(200, 0, 0);
    this.line(charShift, charWidth, -charHeight, charShift, -charWidth, charHeight);
    this.line(charShift, -charWidth, -charHeight, charShift, charWidth, charHeight);
    // The Y
    this.stroke(0, 200, 0);
    this.line(charWidth, charShift, charHeight, 0.0, charShift, 0.0);
    this.line(0.0, charShift, 0.0, -charWidth, charShift, charHeight);
    this.line(-charWidth, charShift, charHeight, 0.0, charShift, 0.0);
    this.line(0.0, charShift, 0.0, 0.0, charShift, -charHeight);
    // The Z
    this.stroke(0, 100, 200);
    this.line(-charWidth, -charHeight, charShift, charWidth, -charHeight, charShift);
    this.line(charWidth, -charHeight, charShift, -charWidth, charHeight, charShift);
    this.line(-charWidth, charHeight, charShift, charWidth, charHeight, charShift);
    // X Axis
    this.stroke(200, 0, 0);
    this.line(0, 0, 0, size, 0, 0);
    // Y Axis
    this.stroke(0, 200, 0);
    this.line(0, 0, 0, 0, size, 0);
    // Z Axis
    this.stroke(0, 100, 200);
    this.line(0, 0, 0, 0, 0, size);
    this.pop(this._rendererState);
  };

  p5.prototype.grid = function () {
    this._renderer.grid(...arguments);
  };

  /**
   * Draws grid
   * @param  {Number}  size grid size in world units. Default is 100.
   * @param  {Number}  subdivisions number of grid subdivisions. Default is 10.
   * @param  {Boolean} dotted defines either a continuous or a dotted grid. Default is true.
   */
  p5.RendererGL.prototype.grid = function ({ size = 100, subdivisions = 10, dotted = true } = {}) {
    this._rendererState = this.push();
    if (dotted) {
      let weight = this.curStrokeWeight;
      // other useful as well: this.curStrokeColor this.curFillColor
      let posi = 0;
      let posj = 0;
      this.strokeWeight(weight * 2);
      this.beginShape(POINTS);
      for (let i = 0; i <= subdivisions; ++i) {
        posi = size * (2.0 * i / subdivisions - 1.0);
        for (let j = 0; j <= subdivisions; ++j) {
          posj = size * (2.0 * j / subdivisions - 1.0);
          this.vertex(posi, posj, 0);
        }
      }
      this.endShape();
      const internalSub = 5;
      const subSubdivisions = subdivisions * internalSub;
      this.strokeWeight(weight);
      this.beginShape(POINTS);
      for (let i = 0; i <= subSubdivisions; ++i) {
        posi = size * (2.0 * i / subSubdivisions - 1.0);
        for (let j = 0; j <= subSubdivisions; ++j) {
          posj = size * (2.0 * j / subSubdivisions - 1.0);
          if (((i % internalSub) != 0) || ((j % internalSub) != 0))
            this.vertex(posi, posj, 0);
        }
      }
      this.endShape();
    }
    else {
      for (let i = 0; i <= subdivisions; ++i) {
        const pos = size * (2.0 * i / subdivisions - 1.0);
        this.line(pos, -size, 0, pos, +size, 0);
        this.line(-size, pos, 0, size, pos, 0);
      }
    }
    this.pop(this._rendererState);
  };

  p5.prototype.cross = function () {
    this._renderer.cross(...arguments);
  };

  /**
   * Draws a cross on the screen.
   * @param  {Number} x screen x coordinate. Default is width / 2.
   * @param  {Number} y screen y coordinate. Default is height / 2.
   * @param  {Number} size cross size in pixels. Default is 50.
   */
  p5.RendererGL.prototype.cross = function ({ x = this.width / 2, y = this.height / 2, size = 50 } = {}) {
    const half_size = size / 2.0;
    this._rendererState = this.push();
    this.beginHUD();
    this.line(x - half_size, y, x + half_size, y);
    this.line(x, y - half_size, x, y + half_size);
    this.endHUD();
    this.pop(this._rendererState);
  };

  p5.prototype.bullsEye = function () {
    this._renderer.bullsEye(...arguments);
  };

  /**
   * Draws a circled-shape bulls-eye on the screen.
   * @param  {Number} x screen x coordinate. Default is width / 2
   * @param  {Number} y screen y coordinate. Default is height / 2
   * @param  {Number} size bullseye diameter in pixels. Default is 50
   */

  /**
   * Draws a bulls-eye on the screen.
   * @param  {Number}  x screen x coordinate. Default is width / 2.
   * @param  {Number}  y screen y coordinate. Default is height / 2.
   * @param  {Number}  size bullseye diameter in pixels. Default is 50.
   * @param  {Boolean} circled defines either a circled or a squared shape bulls eye. Default is true.
   */
  p5.RendererGL.prototype.bullsEye = function ({ x = this.width / 2, y = this.height / 2, size = 50, circled = true } = {}) {
    this._rendererState = this.push();
    if (circled) {
      this.beginHUD();
      this._circle({ x, y, radius: size / 2 })
      this.endHUD();
    }
    else {
      const half_length = size / 2.0;
      this.beginHUD();
      this.line((x - half_length), (y - half_length) + (0.6 * half_length), (x - half_length), (y - half_length));
      this.line((x - half_length), (y - half_length), (x - half_length) + (0.6 * half_length), (y - half_length));
      this.line((x + half_length) - (0.6 * half_length), (y - half_length), (x + half_length), (y - half_length));
      this.line((x + half_length), (y - half_length), (x + half_length), ((y - half_length) + (0.6 * half_length)));
      this.line((x + half_length), ((y + half_length) - (0.6 * half_length)), (x + half_length), (y + half_length));
      this.line((x + half_length), (y + half_length), ((x + half_length) - (0.6 * half_length)), (y + half_length));
      this.line((x - half_length) + (0.6 * half_length), (y + half_length), (x - half_length), (y + half_length));
      this.line((x - half_length), (y + half_length), (x - half_length), ((y + half_length) - (0.6 * half_length)));
      this.endHUD();
    }
    this.cross({ x: x, y: y, size: 0.6 * size });
    this.pop(this._rendererState);
  };

  p5.prototype._circle = function () {
    this._renderer._circle(...arguments);
  };

  p5.RendererGL.prototype._circle = function ({ x = this.width / 2, y = this.height / 2, radius = 100, detail = 50 } = {}) {
    this._rendererState = this.push();
    this.translate(x, y);
    const angle = TWO_PI / detail;
    let lastPosition = { x: radius, y: 0 };
    for (let i = 1; i <= detail; i++) {
      let position = { x: cos(i * angle) * radius, y: sin(i * angle) * radius };
      this.line(lastPosition.x, lastPosition.y, position.x, position.y);
      lastPosition = position;
    }
    this.pop(this._rendererState);
  };

  p5.prototype.viewFrustum = function () {
    this._renderer.viewFrustum(...arguments);
  };

  p5.RendererGL.prototype.viewFrustum = function (renderer, {
    near = false,
    far = false
  } = {}) {
    if (this === renderer) {
      console.error('displaying viewFrustum requires a renderer different than this');
      return;
    }
    this._rendererState = this.push();
    this.resetMatrix();
    this.applyMatrix(...this.vMatrix().mat4);
    this.applyMatrix(...renderer.eMatrix().mat4);
    renderer._isOrtho() ? this._viewOrtho(...arguments) : this._viewPerspective(...arguments);
    this.pop(this._rendererState);
  };

  p5.RendererGL.prototype._viewOrtho = function (renderer, {
    near = false,
    far = false
  } = {}) {
    let l = renderer.lPlane();
    let r = renderer.rPlane();
    let b = renderer.bPlane();
    let t = renderer.tPlane();
    let n = renderer.nPlane();
    let f = renderer.fPlane();

    this.line(r, t, -n, r, t, -f);
    this.line(l, t, -n, l, t, -f);
    this.line(l, b, -n, l, b, -f);
    this.line(r, b, -n, r, b, -f);

    if (far) {
      this.beginShape();
      this.vertex(r, t, -f, 0, 0);
      this.vertex(l, t, -f, 1, 0);
      this.vertex(l, b, -f, 1, 1);
      this.vertex(r, b, -f, 0, 1);
      this.endShape();
    }
    else {
      this.line(r, t, -f, l, t, -f);
      this.line(l, t, -f, l, b, -f);
      this.line(l, b, -f, r, b, -f);
      this.line(r, b, -f, r, t, -f);
    }

    if (near) {
      this.beginShape();
      this.vertex(r, t, -n, 0, 0);
      this.vertex(l, t, -n, 1, 0);
      this.vertex(l, b, -n, 1, 1);
      this.vertex(r, b, -n, 0, 1);
      this.endShape();
    }
    else {
      this.line(r, t, -n, l, t, -n);
      this.line(l, t, -n, l, b, -n);
      this.line(l, b, -n, r, b, -n);
      this.line(r, b, -n, r, t, -n);
    }

    // TODO implement near plane texture
    this.axes(50);
  };

  p5.RendererGL.prototype._viewPerspective = function (renderer, {
    near = false,
    far = false
  } = {}) {
    let magnitude = Math.tan(renderer.fov() / 2);
    let aspectRatio = renderer.width / renderer.height;

    const points = [
      { x: 0, y: 0, z: 0 },
      { x: 0, y: 0, z: 0 },
    ];

    points[0].z = renderer.nPlane();
    points[1].z = renderer.fPlane();

    points[0].y = points[0].z * magnitude;
    points[0].x = points[0].y * aspectRatio;

    const ratio = points[1].z / points[0].z;
    points[1].y = ratio * points[0].y;
    points[1].x = ratio * points[0].x;

    this.line(0, 0, 0, points[1].x, points[1].y, -points[1].z);
    this.line(0, 0, 0, -points[1].x, points[1].y, -points[1].z);
    this.line(0, 0, 0, -points[1].x, -points[1].y, -points[1].z);
    this.line(0, 0, 0, points[1].x, -points[1].y, -points[1].z);

    if (far) {
      this.beginShape();
      this.vertex(-points[1].x, points[1].y, -points[1].z, 0, 0);
      this.vertex(points[1].x, points[1].y, -points[1].z, 1, 0);
      this.vertex(points[1].x, -points[1].y, -points[1].z, 0, 1);
      this.vertex(-points[1].x, -points[1].y, -points[1].z, 1, 1);
      this.endShape();
    }
    else {
      this.line(-points[1].x, points[1].y, -points[1].z, points[1].x, points[1].y, -points[1].z);
      this.line(points[1].x, points[1].y, -points[1].z, points[1].x, -points[1].y, -points[1].z);
      this.line(points[1].x, -points[1].y, -points[1].z, -points[1].x, -points[1].y, -points[1].z);
      this.line(-points[1].x, -points[1].y, -points[1].z, -points[1].x, points[1].y, -points[1].z);
    }

    if (near) {
      this.beginShape();
      this.vertex(-points[0].x, points[0].y, -points[0].z, 0, 0);
      this.vertex(points[0].x, points[0].y, -points[0].z, 1, 0);
      this.vertex(points[0].x, -points[0].y, -points[0].z, 0, 1);
      this.vertex(-points[0].x, -points[0].y, -points[0].z, 1, 1);
      this.endShape();
    }
    else {
      this.line(-points[0].x, points[0].y, -points[0].z, points[0].x, points[0].y, -points[0].z);
      this.line(points[0].x, points[0].y, -points[0].z, points[0].x, -points[0].y, -points[0].z);
      this.line(points[0].x, -points[0].y, -points[0].z, -points[0].x, -points[0].y, -points[0].z);
      this.line(-points[0].x, -points[0].y, -points[0].z, -points[0].x, points[0].y, -points[0].z);
    }

    // TODO implement near plane texture
    // this.textureMode(NORMAL);
    // this.tint(255, 126); // Apply transparency without changing color
    // this.texture(renderer);

    this.axes(50);
  };
})();
