'use strict';

// TODO's
// i. Should drawing stuff be implemented only for p5.prototype just as overlay is?
// ii. Handling other default uniforms such as uSampler (proof-of-concept found on texture branch)
// See:
// https://github.com/processing/p5.js/blob/main/contributor_docs/creating_libraries.md
// https://github.com/processing/p5.js/blob/main/src/core/README.md
// https://github.com/processing/p5.js/blob/main/contributor_docs/webgl_mode_architecture.md
/** @namespace */
var Tree = (function (ext) {
  const INFO = {
    LIBRARY: 'p5.treegl',
    VERSION: '0.8.3',
    HOMEPAGE: 'https://github.com/VisualComputing/p5.treegl'
  };
  Object.freeze(INFO);
  const NONE = 0;
  // Axes constants
  const X = 1 << 0;
  const Y = 1 << 1;
  const Z = 1 << 2;
  const _X = 1 << 3;
  const _Y = 1 << 4;
  const _Z = 1 << 5;
  const LABELS = 1 << 6;
  // Grid style
  const SOLID = 0;
  const DOTS = 1;
  // Bullseye and picking shape
  const SQUARE = 0;
  const CIRCLE = 1;
  // Only picking shape
  const PROJECTION = 2;
  // Frustum constants
  const NEAR = 1 << 0;
  const FAR = 1 << 1;
  const LEFT = 1 << 2;
  const RIGHT = 1 << 3;
  const BOTTOM = 1 << 4;
  const TOP = 1 << 5;
  const BODY = 1 << 6;
  const APEX = 1 << 7;
  // Visibility
  const INVISIBLE = 0;
  const VISIBLE = 1;
  const SEMIVISIBLE = 2;
  // Spaces
  const WORLD = 'WORLD';
  const EYE = 'EYE';
  const NDC = 'NDC';
  const SCREEN = 'SCREEN';
  const MODEL = 'MODEL';
  // Points and Vectors
  const ORIGIN = [0, 0, 0];
  const i = [1, 0, 0];
  const j = [0, 1, 0];
  const k = [0, 0, 1];
  const _i = [-1, 0, 0];
  const _j = [0, -1, 0];
  const _k = [0, 0, -1];
  // Shaders
  // Precision
  const lowp = 0;
  const mediump = 1;
  const highp = 2;
  // Matrices
  const vMatrix = 1 << 0;
  const pMatrix = 1 << 1;
  const mvMatrix = 1 << 2;
  const pmvMatrix = 1 << 3;
  const nMatrix = 1 << 4;
  const eMatrix = 1 << 5; // only tree
  const mMatrix = 1 << 6; // only tree
  const pvMatrix = 1 << 7; // only tree
  const pvInvMatrix = 1 << 8; // only tree
  // Varyings
  const color4 = 1 << 0;
  const texcoords2 = 1 << 1;
  const normal3 = 1 << 2;
  const position2 = 1 << 3;
  const position3 = 1 << 4;
  const position4 = 1 << 5;
  // Extending the namespace
  ext ??= {};
  Object.assign(ext, {
    INFO, NONE, X, Y, Z, _X, _Y, _Z, LABELS,
    SOLID, DOTS, SQUARE, CIRCLE, PROJECTION,
    NEAR, FAR, LEFT, RIGHT, BOTTOM, TOP, BODY, APEX,
    INVISIBLE, VISIBLE, SEMIVISIBLE,
    WORLD, EYE, NDC, SCREEN, MODEL,
    ORIGIN, i, j, k, _i, _j, _k,
    lowp, mediump, highp,
    vMatrix, pMatrix, mvMatrix, pmvMatrix, nMatrix,
    eMatrix, mMatrix, pvMatrix, pvInvMatrix, // only tree
    color4, texcoords2, normal3, position2, position3, position4
  });
  return ext;
})(Tree || {});


(function () {
  console.log(Tree.INFO);

  // 1. Matrix stuff

  p5.Matrix.prototype.mult3 = function (vector) {
    if (this.mat3 === undefined) {
      console.error('mult3 only works with mat3');
      return;
    }
    return new p5.Vector(this.mat3[0] * vector.x + this.mat3[3] * vector.y + this.mat3[6] * vector.z,
      this.mat3[1] * vector.x + this.mat3[4] * vector.y + this.mat3[7] * vector.z,
      this.mat3[2] * vector.x + this.mat3[5] * vector.y + this.mat3[8] * vector.z);
  }

  p5.Matrix.prototype.mult4 = function (vector) {
    return new p5.Vector(...this._mult4([vector.x, vector.y, vector.z, 1]));
  }

  p5.Matrix.prototype._mult4 = function (vec4) {
    if (this.mat4 === undefined) {
      console.error('_mult4 only works with mat4');
      return;
    }
    return [this.mat4[0] * vec4[0] + this.mat4[4] * vec4[1] + this.mat4[8] * vec4[2] + this.mat4[12] * vec4[3],
    this.mat4[1] * vec4[0] + this.mat4[5] * vec4[1] + this.mat4[9] * vec4[2] + this.mat4[13] * vec4[3],
    this.mat4[2] * vec4[0] + this.mat4[6] * vec4[1] + this.mat4[10] * vec4[2] + this.mat4[14] * vec4[3],
    this.mat4[3] * vec4[0] + this.mat4[7] * vec4[1] + this.mat4[11] * vec4[2] + this.mat4[15] * vec4[3]];
  }

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

  p5.prototype.lMatrix = function (...args) {
    return this._renderer.lMatrix(...args);
  }

  // defaults: from: iMatrix, to: eMatrix
  p5.RendererGL.prototype.lMatrix = function (
    {
      from = new p5.Matrix(),
      to = this.eMatrix()
    } = {}) {
    return to.copy().invert(to).apply(from);
  }

  p5.prototype.dMatrix = function (...args) {
    return this._renderer.dMatrix(...args);
  }

  // defaults: from: iMatrix, to: eMatrix
  p5.RendererGL.prototype.dMatrix = function (
    {
      from = new p5.Matrix(),
      to = this.eMatrix(),
      matrix = from.copy().invert(from).apply(to)
    } = {}) {
    // Note that this transposes mat4 into mat3
    return new p5.Matrix('mat3', [matrix.mat4[0], matrix.mat4[4], matrix.mat4[8],
    matrix.mat4[1], matrix.mat4[5], matrix.mat4[9],
    matrix.mat4[2], matrix.mat4[6], matrix.mat4[10]]);
  }

  p5.prototype.pMatrix = function (...args) {
    return this._renderer.pMatrix(...args);
  }

  p5.RendererGL.prototype.pMatrix = function () {
    return this.uPMatrix.copy();
  }

  p5.prototype.mvMatrix = function (...args) {
    return this._renderer.mvMatrix(...args);
  }

  // defaults when mMatrix is defined: vMatrix: this.vMatrix, mMatrix:
  // otherwise it returns a copy of the current mvMatrix
  p5.RendererGL.prototype.mvMatrix = function (
    {
      vMatrix,
      mMatrix
    } = {}) {
    return mMatrix ? (vMatrix ?? this.vMatrix()).copy().apply(mMatrix) : this.uMVMatrix.copy();
  }

  p5.prototype.mMatrix = function (...args) {
    return this._renderer.mMatrix(...args);
  }

  // defaults: eMatrix: this.eMatrix, mvMatrix: this.mvMatrix
  p5.RendererGL.prototype.mMatrix = function (
    {
      eMatrix = this.eMatrix(),
      mvMatrix = this.mvMatrix()
    } = {}) {
    return eMatrix.copy().apply(mvMatrix);
  }

  p5.prototype.nMatrix = function (...args) {
    return this._renderer.nMatrix(...args);
  }

  p5.RendererGL.prototype.nMatrix = function ({
    vMatrix,
    mMatrix,
    mvMatrix = this.mvMatrix({ mMatrix, vMatrix })
  } = {}) {
    return new p5.Matrix('mat3').inverseTranspose(mvMatrix);
  }

  // TODO check where to replace vMatrix for: this._curCamera.cameraMatrix

  p5.prototype.vMatrix = function (...args) {
    return this._renderer.vMatrix(...args);
  }

  p5.RendererGL.prototype.vMatrix = function () {
    return this._curCamera.vMatrix();
  }

  p5.Camera.prototype.vMatrix = function () {
    return this.cameraMatrix.copy();
  }

  p5.prototype.eMatrix = function (...args) {
    return this._renderer.eMatrix(...args);
  }

  p5.RendererGL.prototype.eMatrix = function () {
    return this._curCamera.eMatrix();
  }

  p5.Camera.prototype.eMatrix = function () {
    return this.cameraMatrix.copy().invert(this.cameraMatrix);
  }

  p5.prototype.pmvMatrix = function (...args) {
    return this._renderer.pmvMatrix(...args);
  }

  p5.RendererGL.prototype.pmvMatrix = function (
    {
      pMatrix = this.uPMatrix,
      vMatrix,
      mMatrix,
      mvMatrix = this.mvMatrix({ mMatrix, vMatrix })
    } = {}) {
    return pMatrix.copy().apply(mvMatrix);
  }

  p5.prototype.pvMatrix = function (...args) {
    return this._renderer.pvMatrix(...args);
  }

  // defaults: pMatrix: this.pMatrix, vMatrix: this.vMatrix
  p5.RendererGL.prototype.pvMatrix = function (
    {
      pMatrix = this.uPMatrix,
      vMatrix = this._curCamera.cameraMatrix
    } = {}) {
    return pMatrix.copy().apply(vMatrix);
  }

  p5.prototype.pvInvMatrix = function (...args) {
    return this._renderer.pvInvMatrix(...args);
  }

  p5.RendererGL.prototype.pvInvMatrix = function (
    {
      pMatrix,
      vMatrix,
      pvMatrix
    } = {}) {
    let matrix = pvMatrix ? pvMatrix.copy() : this.pvMatrix({ pMatrix, vMatrix });
    return matrix.invert(matrix);
  }

  p5.prototype.isOrtho = function (...args) {
    return this._renderer.isOrtho(...args);
  }

  p5.RendererGL.prototype.isOrtho = function () {
    return this.uPMatrix.isOrtho();
  }

  p5.Matrix.prototype.isOrtho = function () {
    return this.mat4[15] != 0;
  }

  p5.prototype.nPlane = function (...args) {
    return this._renderer.nPlane(...args);
  }

  p5.RendererGL.prototype.nPlane = function () {
    return this.uPMatrix.nPlane();
  }

  p5.Matrix.prototype.nPlane = function () {
    return this.mat4[15] == 0 ? this.mat4[14] / (this.mat4[10] - 1) :
      (1 + this.mat4[14]) / this.mat4[10];
  }

  p5.prototype.fPlane = function (...args) {
    return this._renderer.fPlane(...args);
  }

  p5.RendererGL.prototype.fPlane = function () {
    return this.uPMatrix.fPlane();
  }

  p5.Matrix.prototype.fPlane = function () {
    return this.mat4[15] == 0 ? this.mat4[14] / (1 + this.mat4[10]) :
      (this.mat4[14] - 1) / this.mat4[10];
  }

  p5.prototype.lPlane = function (...args) {
    return this._renderer.lPlane(...args);
  }

  p5.RendererGL.prototype.lPlane = function () {
    return this.uPMatrix.lPlane();
  }

  p5.Matrix.prototype.lPlane = function () {
    return this.mat4[15] == 1 ? -(1 + this.mat4[12]) / this.mat4[0] :
      this.nPlane() * (this.mat4[8] - 1) / this.mat4[0];
  }

  p5.prototype.rPlane = function (...args) {
    return this._renderer.rPlane(...args);
  }

  p5.RendererGL.prototype.rPlane = function () {
    return this.uPMatrix.rPlane();
  }

  p5.Matrix.prototype.rPlane = function () {
    return this.mat4[15] == 1 ? (1 - this.mat4[12]) / this.mat4[0] :
      this.nPlane() * (1 + this.mat4[8]) / this.mat4[0];
  }

  p5.prototype.tPlane = function (...args) {
    return this._renderer.tPlane(...args);
  }

  p5.RendererGL.prototype.tPlane = function () {
    return this.uPMatrix.tPlane();
  }

  p5.Matrix.prototype.tPlane = function () {
    // note that swaped values between bPlane and tPlane are returned
    // if the projection matrix was set with @function frustum.
    return this.mat4[15] == 1 ? (this.mat4[13] - 1) / this.mat4[5] :
      this.nPlane() * (this.mat4[9] - 1) / this.mat4[5];
  }

  p5.prototype.bPlane = function (...args) {
    return this._renderer.bPlane(...args);
  }

  p5.RendererGL.prototype.bPlane = function () {
    return this.uPMatrix.bPlane();
  }

  p5.Matrix.prototype.bPlane = function () {
    // note that swaped values between bPlane and tPlane are returned
    // if the projection matrix was set with @function frustum.
    return this.mat4[15] == 1 ? (1 + this.mat4[13]) / this.mat4[5] :
      this.nPlane() * (1 + this.mat4[9]) / this.mat4[5];
  }

  p5.prototype.fov = function (...args) {
    return this._renderer.fov(...args);
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

  p5.prototype.hfov = function (...args) {
    return this._renderer.hfov(...args);
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

  p5.prototype.beginHUD = function (...args) {
    if (this._renderer instanceof p5.RendererGL) {
      this._renderer.beginHUD(...args);
    }
  }

  p5.RendererGL.prototype.beginHUD = function () {
    this.mv = this.mvMatrix();
    this.p = this.pMatrix();
    this._rendererState = this.push();
    let gl = this.drawingContext;
    gl.flush();
    gl.disable(gl.DEPTH_TEST);
    this.uMVMatrix = new p5.Matrix();
    let z = Number.MAX_VALUE;
    this._curCamera.ortho(0, this.width, -this.height, 0, -z, z);
    this._hud = true;
  }

  p5.prototype.endHUD = function (...args) {
    if (this._renderer instanceof p5.RendererGL) {
      this._renderer.endHUD(...args);
    }
  }

  p5.RendererGL.prototype.endHUD = function () {
    let gl = this.drawingContext;
    gl.flush();
    gl.enable(gl.DEPTH_TEST);
    this.pop(this._rendererState);
    this.uPMatrix.set(this.p);
    this.uMVMatrix.set(this.mv);
    this._hud = false;
  }

  // 2.1 Points

  // NDC stuff needs testing

  p5.prototype._map = function (...args) {
    return this._renderer._map(...args);
  }

  p5.RendererGL.prototype._map = function (n, start1, stop1, start2, stop2) {
    return (n - start1) / (stop1 - start1) * (stop2 - start2) + start2;
  }

  p5.prototype.treeLocation = function (...args) {
    return this._renderer.treeLocation(...args);
  }

  /**
   * Converts locations (i.e., points) from one space into another.
   * @param  {p5.Vector} vector      location to be converted.
   * @param  {p5.Matrix|String} from source space: either a global
   *                                 transform matrix or Tree.WORLD, Tree.EYE,
   *                                 Tree.SCREEN, Tree.NDC or Tree.MODEL.
   * @param  {p5.Matrix|String} to   target space: either a global
   *                                 transform matrix or Tree.WORLD, Tree.EYE,
   *                                 Tree.SCREEN, Tree.NDC or Tree.MODEL.
   * @param  {p5.Matrix} pMatrix     projection matrix.
   * @param  {p5.Matrix} vMatrix     view matrix.
   * @param  {p5.Matrix} pvMatrix    projection times view matrix.
   * @param  {p5.Matrix} pvInvMatrix (projection times view matrix)^-1.
   */
  p5.RendererGL.prototype.treeLocation = function (...args) {
    return args.length === 1 && args[0] instanceof Object && !(args[0] instanceof p5.Vector) && !(Array.isArray(args[0])) ?
      this._treeLocation(Tree.ORIGIN, args[0]) : this._treeLocation(...args);
  }

  p5.prototype._treeLocation = function (...args) {
    return this._renderer._treeLocation(...args);
  }

  p5.RendererGL.prototype._treeLocation = function (vector = Tree.ORIGIN,
    {
      from = Tree.EYE,
      to = Tree.WORLD,
      pMatrix,
      vMatrix,
      eMatrix,
      pvMatrix,
      pvInvMatrix
    } = {}) {
    if (Array.isArray(vector)) {
      vector = new p5.Vector(vector[0] ?? 0, vector[1] ?? 0, vector[2] ?? 0);
    }
    if (from == Tree.MODEL) {
      from = this.mMatrix({ eMatrix });
    }
    if (to == Tree.MODEL) {
      to = this.mMatrix({ eMatrix });
    }
    if ((from == Tree.WORLD) && (to == Tree.SCREEN)) {
      return this._screenLocation({ vector, pMatrix, vMatrix, pvMatrix });
    }
    if ((from == Tree.SCREEN) && (to == Tree.WORLD)) {
      return this._location({ vector, pMatrix, vMatrix, pvMatrix, pvInvMatrix });
    }
    if (from == Tree.SCREEN && to == Tree.NDC) {
      return this._screenToNDCLocation(vector);
    }
    if (from == Tree.NDC && to == Tree.SCREEN) {
      return this._ndcToScreenLocation(vector);
    }
    if (from == Tree.WORLD && to == Tree.NDC) {
      return this._screenToNDCLocation(this._screenLocation({ vector, pMatrix, vMatrix, pvMatrix }));
    }
    if (from == Tree.NDC && to == Tree.WORLD) {
      return this._location({ vector: this._ndcToScreenLocation(vector), pMatrix, vMatrix, pvMatrix, pvInvMatrix });
    }
    if (from == Tree.NDC && (to instanceof p5.Matrix || to == Tree.EYE)) {
      return (to == Tree.EYE ? (vMatrix ?? this.vMatrix()) : to.copy().invert(to)).mult4(this._location({ vector: this._ndcToScreenLocation(vector), pMatrix, vMatrix, pvMatrix, pvInvMatrix }));
    }
    if ((from instanceof p5.Matrix || from == Tree.EYE) && to == Tree.NDC) {
      return this._screenToNDCLocation(this._screenLocation({ vector: (from == Tree.EYE ? (eMatrix ?? this.eMatrix()) : from).mult4(vector), pMatrix, vMatrix, pvMatrix }));
    }
    if (from == Tree.WORLD && (to instanceof p5.Matrix || to == Tree.EYE)) {
      return (to == Tree.EYE ? (vMatrix ?? this.vMatrix()) : to.copy().invert(to)).mult4(vector);
    }
    if ((from instanceof p5.Matrix || from == Tree.EYE) && to == Tree.WORLD) {
      return (from == Tree.EYE ? (eMatrix ?? this.eMatrix()) : from).mult4(vector);
    }
    if (from instanceof p5.Matrix && to instanceof p5.Matrix) {
      return this.lMatrix({ from: from, to: to }).mult4(vector);
    }
    if (from == Tree.SCREEN && (to instanceof p5.Matrix || to == Tree.EYE)) {
      return (to == Tree.EYE ? (vMatrix ?? this.vMatrix()) : to.copy().invert(to)).mult4(this._location({ vector, pMatrix, vMatrix, pvMatrix, pvInvMatrix }));
    }
    if ((from instanceof p5.Matrix || from == Tree.EYE) && to == Tree.SCREEN) {
      return this._screenLocation({ vector: (from == Tree.EYE ? (eMatrix ?? this.eMatrix()) : from).mult4(vector), pMatrix, vMatrix, pvMatrix });
    }
    if (from instanceof p5.Matrix && to == Tree.EYE) {
      return (vMatrix ?? this.vMatrix()).mult4(from.mult4(vector));
    }
    if (from == Tree.EYE && to instanceof p5.Matrix) {
      return to.copy().invert(to).mult4((eMatrix ?? this.eMatrix()).mult4(vector));
    }
    console.error('couldn\'t parse your treeLocation query!');
    return vector;
  }

  p5.RendererGL.prototype._ndcToScreenLocation = function (vector) {
    return new p5.Vector(this._map(vector.x, -1, 1, 0, this.width),
      this._map(vector.y, -1, 1, 0, this.height),
      this._map(vector.z, -1, 1, 0, 1));
  }

  p5.RendererGL.prototype._screenToNDCLocation = function (vector) {
    return new p5.Vector(this._map(vector.x, 0, this.width, -1, 1),
      this._map(vector.y, 0, this.height, -1, 1),
      this._map(vector.z, 0, 1, -1, 1));
  }

  p5.RendererGL.prototype._screenLocation = function (
    {
      vector = new p5.Vector(0, 0, 0.5),
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
    return new p5.Vector(target[0], target[1], target[2]);
  }

  p5.RendererGL.prototype._location = function (
    {
      vector = new p5.Vector(this.width / 2, this.height / 2, 0.5),
      pMatrix,
      vMatrix,
      pvMatrix,
      pvInvMatrix = this.pvInvMatrix({ pMatrix, vMatrix, pvMatrix })
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
    return new p5.Vector(target[0], target[1], target[2]);
  }

  // 2.2. Vectors

  // NDC stuff needs testing

  p5.prototype.treeDisplacement = function (...args) {
    return this._renderer.treeDisplacement(...args);
  }

  /**
   * Converts displacements (i.e., vectors) from one space into another.
   * @param  {p5.Vector} vector      location to be converted.
   * @param  {p5.Matrix|String} from source space: either a global
   *                                 transform matrix or Tree.WORLD, Tree.EYE,
   *                                 Tree.SCREEN, Tree.NDC or Tree.MODEL.
   * @param  {p5.Matrix|String} to   target space: either a global
   *                                 transform matrix or Tree.WORLD, Tree.EYE,
   *                                 Tree.SCREEN, Tree.NDC or Tree.MODEL.
   * @param  {p5.Matrix} pMatrix     projection matrix.
   * @param  {p5.Matrix} vMatrix     view matrix.
   * @param  {p5.Matrix} pvMatrix    projection times view matrix.
   * @param  {p5.Matrix} pvInvMatrix (projection times view matrix)^-1.
   */
  p5.RendererGL.prototype.treeDisplacement = function (...args) {
    return args.length === 1 && args[0] instanceof Object && !(args[0] instanceof p5.Vector) && !(Array.isArray(args[0])) ?
      this._treeDisplacement(Tree._k, args[0]) : this._treeDisplacement(...args);
  }

  p5.prototype._treeDisplacement = function (...args) {
    return this._renderer._treeDisplacement(...args);
  }

  p5.RendererGL.prototype._treeDisplacement = function (vector = Tree._k,
    {
      from = Tree.EYE,
      to = Tree.WORLD,
      vMatrix,
      eMatrix,
      pMatrix
    } = {}) {
    if (Array.isArray(vector)) {
      vector = new p5.Vector(vector[0] ?? 0, vector[1] ?? 0, vector[2] ?? 0);
    }
    if (from == Tree.MODEL) {
      from = this.mMatrix({ eMatrix });
    }
    if (to == Tree.MODEL) {
      to = this.mMatrix({ eMatrix });
    }
    if ((from == Tree.WORLD) && (to == Tree.SCREEN)) {
      return this._worldToScreenDisplacement(vector, pMatrix);
    }
    if ((from == Tree.SCREEN) && (to == Tree.WORLD)) {
      return this._screenToWorldDisplacement(vector, pMatrix);
    }
    if (from == Tree.SCREEN && to == Tree.NDC) {
      return this._screenToNDCDisplacement(vector);
    }
    if (from == Tree.NDC && to == Tree.SCREEN) {
      return this._ndcToScreenDisplacement(vector);
    }
    if (from == Tree.WORLD && to == Tree.NDC) {
      return this._screenToNDCDisplacement(this._worldToScreenDisplacement(vector, pMatrix));
    }
    if (from == Tree.NDC && to == Tree.WORLD) {
      return this._screenToWorldDisplacement(this._ndcToScreenDisplacement(vector), pMatrix);
    }
    if (from == Tree.NDC && to == Tree.EYE) {
      return this.dMatrix({ matrix: eMatrix ?? this.eMatrix() }).mult3(this._screenToWorldDisplacement(this._ndcToScreenDisplacement(vector), pMatrix));
    }
    if (from == Tree.EYE && to == Tree.NDC) {
      return this._screenToNDCDisplacement(this._worldToScreenDisplacement(this.dMatrix({ matrix: vMatrix ?? this.vMatrix() }).mult3(vector), pMatrix));
    }
    if (from == Tree.SCREEN && to instanceof p5.Matrix) {
      return this.dMatrix({ matrix: to }).mult3(this._screenToWorldDisplacement(vector, pMatrix));
    }
    if (from instanceof p5.Matrix && to == Tree.SCREEN) {
      return this._worldToScreenDisplacement(this.dMatrix({ matrix: from.copy().invert(from) }).mult3(vector), pMatrix);
    }
    if (from instanceof p5.Matrix && to instanceof p5.Matrix) {
      return this.dMatrix({ from: from, to: to }).mult3(vector);
    }
    // all cases below kept for efficiency but they all may
    // be simply expressed in terms of the previous case, by:
    // Tree.EYE -> eMatrix()
    // Tree.WORLD -> iMatrix()
    if (from == Tree.EYE && to == Tree.WORLD) {
      return this.dMatrix({ matrix: vMatrix ?? this.vMatrix() }).mult3(vector);
    }
    if (from == Tree.WORLD && to == Tree.EYE) {
      return this.dMatrix({ matrix: eMatrix ?? this.eMatrix() }).mult3(vector);
    }
    if (from == Tree.EYE && to == Tree.SCREEN) {
      return this._worldToScreenDisplacement(this.dMatrix({ matrix: vMatrix ?? this.vMatrix() }).mult3(vector), pMatrix);
    }
    if (from == Tree.SCREEN && to == Tree.EYE) {
      return this.dMatrix({ matrix: eMatrix ?? this.eMatrix() }).mult3(this._screenToWorldDisplacement(vector, pMatrix));
    }
    if (from == Tree.EYE && to instanceof p5.Matrix) {
      return this.dMatrix({ matrix: (vMatrix ?? this.vMatrix()).apply(to) }).mult3(vector);
    }
    if (from instanceof p5.Matrix && to == Tree.EYE) {
      return this.dMatrix({ matrix: from.copy().invert(from).apply(eMatrix ?? this.eMatrix()) }).mult3(vector);
    }
    if (from == Tree.WORLD && to instanceof p5.Matrix) {
      return this.dMatrix({ matrix: to }).mult3(vector);
    }
    if (from instanceof p5.Matrix && to == Tree.WORLD) {
      return this.dMatrix({ matrix: from.copy().invert(from) }).mult3(vector);
    }
    if (from instanceof p5.Matrix && to == Tree.NDC) {
      return this._screenToNDCDisplacement(this._worldToScreenDisplacement(this.dMatrix({ matrix: from.copy().invert(from) }).mult3(vector), pMatrix));
    }
    if (from == Tree.NDC && to instanceof p5.Matrix) {
      return this.dMatrix({ matrix: to }).mult3(this._screenToWorldDisplacement(this._ndcToScreenDisplacement(vector), pMatrix));
    }
    console.error('couldn\'t parse your treeDisplacement query!');
    return vector;
  }

  p5.RendererGL.prototype._worldToScreenDisplacement = function (vector, pMatrix = this.uPMatrix) {
    let eyeVector = this._treeDisplacement(vector, { from: Tree.WORLD, to: Tree.EYE });
    let dx = eyeVector.x;
    let dy = eyeVector.y;
    let perspective = pMatrix.mat4[15] == 0;
    if (perspective) {
      let position = new p5.Vector();
      let k = Math.abs(this._treeLocation(position, { from: Tree.WORLD, to: Tree.EYE }).z * Math.tan(this.fov(pMatrix) / 2));
      dx /= 2 * k / this.height;
      dy /= 2 * k / this.height;
    }
    let dz = eyeVector.z;
    // sign is inverted
    dz /= (pMatrix.nPlane() - pMatrix.fPlane()) / (perspective ? Math.tan(this.fov(pMatrix) / 2) : Math.abs(pMatrix.rPlane() - pMatrix.lPlane()) / this.width);
    return new p5.Vector(dx, dy, dz);
  }

  p5.RendererGL.prototype._screenToWorldDisplacement = function (vector, pMatrix = this.uPMatrix) {
    let dx = vector.x;
    let dy = vector.y;
    // Scale to fit the screen relative vector displacement
    let perspective = pMatrix.mat4[15] == 0;
    if (perspective) {
      let position = new p5.Vector();
      let k = Math.abs(this._treeLocation(position, { from: Tree.WORLD, to: Tree.EYE }).z * Math.tan(this.fov(pMatrix) / 2));
      dx *= 2 * k / this.height;
      dy *= 2 * k / this.height;
    }
    let dz = vector.z;
    dz *= (pMatrix.nPlane() - pMatrix.fPlane()) / (perspective ? Math.tan(this.fov(pMatrix) / 2) : Math.abs(pMatrix.rPlane() - pMatrix.lPlane()) / this.width);
    let eyeVector = new p5.Vector(dx, dy, dz);
    return this._treeDisplacement(eyeVector, { from: Tree.EYE, to: Tree.WORLD });
  }

  p5.RendererGL.prototype._ndcToScreenDisplacement = function (vector) {
    return new p5.Vector(this.width * vector.x / 2, this.height * vector.y / 2, vector.z / 2);
  }

  p5.RendererGL.prototype._screenToNDCDisplacement = function (vector) {
    return new p5.Vector(2 * vector.x / this.width, 2 * vector.y / this.height, 2 * vector.z);
  }

  // 3. Shader utilities

  const __setMatrixUniforms = p5.Shader.prototype._setMatrixUniforms;

  p5.Shader.prototype._setMatrixUniforms = function (...args) {
    __setMatrixUniforms.apply(this, ...args);
    const matrices = this._renderer._matrices;
    if (matrices) {
      // this.uniforms.uNormalMatrix condition taken from upstream _setMatrixUniforms
      (!this.uniforms.uNormalMatrix && (matrices & Tree.nMatrix) !== 0) && this.setUniform('uNormalMatrix', this._renderer.nMatrix().mat3);
      ((matrices & Tree.eMatrix) !== 0) && this.setUniform('uEyeMatrix', this._renderer.eMatrix().mat4);
      ((matrices & Tree.mMatrix) !== 0) && this.setUniform('uModelMatrix', this._renderer.mMatrix().mat4);
      ((matrices & Tree.pvMatrix) !== 0) && this.setUniform('uProjectionViewMatrix', this._renderer.pvMatrix().mat4);
      ((matrices & Tree.pvInvMatrix) !== 0) && this.setUniform('uProjectionViewInverseMatrix', this._renderer.pvInvMatrix().mat4);
    }
  }

  p5.prototype.bindMatrices = function (...args) {
    this._renderer.bindMatrices(...args);
  }

  p5.RendererGL.prototype.bindMatrices = function (matrices = Tree.NONE) {
    this._matrices = matrices;
  }

  p5.prototype._swapArgs = function (arg2, arg3) {
    let matrices = Tree.NONE;
    let uiConfig = undefined;
    if (typeof arg2 === 'number') {
      matrices = arg2;
      uiConfig = typeof arg3 === 'object' ? arg3 : undefined;
    } else if (typeof arg2 === 'object') {
      uiConfig = arg2;
      matrices = typeof arg3 === 'number' ? arg3 : Tree.NONE;
    }
    return { matrices, uiConfig };
  }

  p5.prototype.readShader = function (fragFilename, arg2 = {}, arg3 = {}) {
    const shader = new p5.Shader();
    const { matrices, uiConfig } = this._swapArgs(arg2, arg3);
    shader._pMatrix = (matrices & Tree.pmvMatrix) === Tree.pmvMatrix || (matrices & Tree.pMatrix) === Tree.pMatrix;
    this.loadStrings(fragFilename, (result) => {
      const source = result.join('\n');
      shader._fragSrc = source;
      this._coupledWith = fragFilename.substring(fragFilename.lastIndexOf('/') + 1);
      const target = this._parseFragmentShader(source);
      shader._vertSrc = this.parseVertexShader({ version: target.version, precision: target.precision, varyings: target.varyings, matrices, _specs: false });
      this.parseUniformsUI(shader, uiConfig);
      this._coupledWith = undefined;
    });
    return shader;
  }

  p5.prototype.makeShader = function (source, arg2 = {}, arg3 = {}) {
    const shader = new p5.Shader();
    const { matrices, uiConfig } = this._swapArgs(arg2, arg3);
    shader._pMatrix = (matrices & Tree.pmvMatrix) === Tree.pmvMatrix || (matrices & Tree.pMatrix) === Tree.pMatrix;
    this._coupledWith = 'the fragment shader provided as param in makeShader()';
    const target = this._parseFragmentShader(source);
    shader._vertSrc = this.parseVertexShader({ version: target.version, precision: target.precision, varyings: target.varyings, matrices, _specs: false });
    shader._fragSrc = source;
    this.parseUniformsUI(shader, uiConfig);
    this._coupledWith = undefined;
    return shader;
  }

  p5.prototype._parseFragmentShader = function (source) {
    const firstLineEndIndex = source.indexOf('\n'); // check version in the first line
    const firstLine = source.substring(0, firstLineEndIndex);
    const version = firstLine.includes('300') ? 2 : 1;
    let precision = Tree.highp; // initialize precision
    let varyings = Tree.NONE; // initialize varyings
    const precisionRegex = /precision\s+(highp|mediump|lowp)\s+float;/; // Regex for precision and varyings
    const varyingKeyword = version === 2 ? 'in' : 'varying';
    const varyingRegex = new RegExp(`${varyingKeyword}\\s+(vec[234])\\s+(\\w+);`, 'g');
    const precisionMatch = source.match(precisionRegex);
    if (precisionMatch) {
      precision = Tree[precisionMatch[1]];
    }
    let match;
    while ((match = varyingRegex.exec(source)) !== null) {
      const varyingType = match[1];
      const varyingName = match[2];
      const expectedTypeNumber = varyingName[varyingName.length - 1];
      if (!['color4', 'texcoords2', 'normal3', 'position2', 'position3', 'position4'].includes(varyingName)) {
        throw new Error(`Unsupported varying found: ${varyingName}`);
      }
      if (!varyingType.endsWith(expectedTypeNumber)) {
        throw new Error(`Unsupported varying type for ${varyingName}: expected vec${expectedTypeNumber}, found ${varyingType}`);
      }
      varyings |= Tree[varyingName];
    }
    return { version, precision, varyings };
  }

  p5.prototype.parseVertexShader = function ({
    precision = Tree.highp,
    matrices = Tree.NONE,
    varyings = Tree.NONE,
    version = 2,
    _specs = true
  } = {}) {
    const advice = `
/*
${this._coupledWith ? 'Vertex shader code to be coupled with ' + this._coupledWith : ''} 
Generated with treegl version ${Tree.INFO.VERSION}
${_specs ? `
Feel free to copy, paste, edit and save it.
Refer to createShader (https://p5js.org/reference/#/p5/createShader),
loadShader (https://p5js.org/reference/#/p5/loadShader), readShader
and makeShader (https://github.com/VisualComputing/p5.treegl#handling),
for details.` : ''}
*/`;
    const directive = '#version 300 es\n';
    const attribute = version.toString().includes('2') ? 'in' : 'attribute';
    const interpolant = version.toString().includes('2') ? 'out' : 'varying';
    const color4 = (varyings & Tree.color4) !== 0;
    const texcoords2 = (varyings & Tree.texcoords2) !== 0;
    const normal3 = (varyings & Tree.normal3) !== 0;
    const position2 = (varyings & Tree.position2) !== 0;
    const position3 = (varyings & Tree.position3) !== 0;
    const position4 = (varyings & Tree.position4) !== 0;
    const v = (matrices & Tree.vMatrix) !== 0;
    const pmv = (matrices & Tree.pmvMatrix) !== 0;
    const p = (matrices & Tree.pMatrix) !== 0;
    const mv = (matrices & Tree.mvMatrix) !== 0 || position4;
    const n = (matrices & Tree.nMatrix) !== 0 || normal3;
    const target = `gl_Position =${pmv ? ' uModelViewProjectionMatrix * ' :
      (p && v ? ' uProjectionMatrix * uViewMatrix * ' :
        (p && mv ? ' uProjectionMatrix * uModelViewMatrix * ' :
          (p ? ' uProjectionMatrix * ' :
            (v ? ' uViewMatrix * ' :
              (mv ? ' uModelViewMatrix * ' : ' ')))))}vec4(aPosition, 1.0)`;
    const vertexShader = `
precision ${precision === Tree.highp ? 'highp' : (precision === Tree.mediump ? 'mediump' : 'lowp')} float;
${attribute} vec3 aPosition;
${color4 ? `${attribute} vec4 aVertexColor;` : ''}
${texcoords2 ? `${attribute} vec2 aTexCoord;` : ''}
${normal3 ? `${attribute} vec3 aNormal;` : ''}
${v ? 'uniform mat4 uViewMatrix;' : ''}
${p ? 'uniform mat4 uProjectionMatrix;' : ''}
${n ? 'uniform mat3 uNormalMatrix;' : ''}
${mv ? 'uniform mat4 uModelViewMatrix;' : ''}
${pmv ? 'uniform mat4 uModelViewProjectionMatrix;' : ''}
${color4 ? `${interpolant} vec4 color4;` : ''}
${texcoords2 ? `${interpolant} vec2 texcoords2;` : ''}
${normal3 ? `${interpolant} vec3 normal3;` : ''}
${position2 ? `${interpolant} vec2 position2;` : ''}
${position3 ? `${interpolant} vec3 position3;` : ''}
${position4 ? `${interpolant} vec4 position4;` : ''}
void main() {
  ${color4 ? 'color4 = aVertexColor;' : ''}
  ${texcoords2 ? 'texcoords2 = aTexCoord;' : ''}
  ${normal3 ? 'normal3 = normalize(uNormalMatrix * aNormal);' : ''}
  ${position2 ? 'position2 = vec4(aPosition, 1.0).xy;' : ''}
  ${position3 ? 'position3 = vec4(aPosition, 1.0).xyz;' : ''}
  ${position4 ? 'position4 = uModelViewMatrix * vec4(aPosition, 1.0);' : ''}
  ${target};
}`;
    let result = version.toString().includes('2') ? directive + advice + vertexShader : advice + vertexShader;
    result = result.split(/\r?\n/)
      .filter(line => line.trim() !== '')
      .join('\n');
    console.log(result);
    return result;
  }

  p5.prototype.parseUniformsUI = function (shader, { x = 0, y = 0, offset = 0, width = 120, color } = {}) {
    if (shader.uniformsUI) {
      console.log('Overwriting uniformsUI for this shader.');
      this.hideUniformsUI(shader);
    }
    shader.uniformsUI = {};
    shader.uniformsUI = this._parseUniformsUI(shader._vertSrc, shader.uniformsUI);
    shader.uniformsUI = this._parseUniformsUI(shader._fragSrc, shader.uniformsUI);
    this.configUniformsUI(shader, { x, y, offset, width, color });
    return shader.uniformsUI;
  }

  p5.prototype._parseUniformsUI = function (source, uniformsUI) {
    const lines = source.split('\n');
    const createSliderElement = (params, isFloat) => {
      const [min, max, value = min, step = (isFloat ? 0.1 : 1)] = params;
      return this.createSlider(min, max, value, step).hide();
    };
    lines.forEach((line) => {
      if (line.trim() === '' || line.trim().startsWith('//')) {
        return;
      }
      const uniformPattern = /uniform\s+(\w+)\s+(\w+);\s*\/\/\s*(.*)/;
      const match = line.match(uniformPattern);
      if (!match) return;
      const [_, type, name, comment] = match;
      if (type === 'vec4') {
        const trimmedComment = comment.trim().replace(/['"]/g, ''); // Remove quotes if present
        if (!trimmedComment) {
          uniformsUI[name] = this.createColorPicker('white').hide();
          console.log(`Created default color picker for '${name}' with white color.`);
        } else if (!trimmedComment.includes(',') && /^[a-zA-Z]+$/.test(trimmedComment)) {
          uniformsUI[name] = this.createColorPicker(trimmedComment).hide();
          console.log(`Created color picker for '${name}' with color: ${trimmedComment}`);
        } else {
          console.debug(`Failed to create color picker for '${name}': Unsupported color format '${trimmedComment}'.`);
        }
      } else if (type === 'float' || type === 'int') {
        const params = comment.split(',').map(param => parseFloat(param.trim()));
        if (params.length >= 2) {
          uniformsUI[name] = createSliderElement(params, type === 'float');
          console.log(`Created slider for '${name}' with params: ${params.join(', ')}`);
        } else {
          console.debug(`Failed to parse slider for '${name}': Expected format 'min, max, [value], [step]' but got '${comment}'`);
        }
      } else if (type === 'bool') {
        const trimmedComment = comment.trim().toLowerCase().replace(/['"]/g, '');
        const falsyValues = ['0', 'false', 'null', 'undefined', ''];
        const defaultValue = !falsyValues.includes(trimmedComment);
        const checkboxWrapper = this.createCheckbox(name, defaultValue).hide();
        console.log(`Created checkbox for '${name}' with default value: ${defaultValue}`);
        uniformsUI[name] = checkboxWrapper;
      }
    });
    return uniformsUI;
  }

  p5.prototype.configUniformsUI = function (shader, { x = 0, y = 0, offset = 0, width = 120, color/*, bg_color,*/ } = {}) {
    const elementHeight = {
      slider: 35,
      checkbox: 30,
      color: 40
    };
    for (const key in shader.uniformsUI) {
      const element = shader.uniformsUI[key];
      if (element instanceof p5.Element) {
        const elementType = element.elt.type || (element.elt.tagName.toLowerCase() === 'div' ? element.elt.getElementsByTagName('input')[0].type : undefined);
        const height = elementType === 'range' ? elementHeight.slider :
          elementType === 'checkbox' ? elementHeight.checkbox :
            elementType === 'color' ? elementHeight.color : 0;
        elementType === 'range' && element.style('width', `${width}px`);
        element.position(x, y);
        y += height + offset;
        // TODO should this prop really go?
        // bg_color && (element.elt.style.backgroundColor = bg_color);
        color && (element.elt.style.color = color);
      }
    }
  }

  p5.prototype.hideUniformsUI = function (shader) {
    if (!shader.uniformsUI) {
      console.log('No uniformsUI found for this shader. Call parseUniformsUI(shader) first');
      return;
    }
    for (const key in shader.uniformsUI) {
      const element = shader.uniformsUI[key];
      element.hide();
      if (element.eventListener) {
        element.elt.removeEventListener('input', element.eventListener);
        element.eventListener = undefined;
      }
    }
  }

  p5.prototype.showUniformsUI = function (shader) {
    if (!shader.uniformsUI) {
      console.log('No uniformsUI found for this shader. Call parseUniformsUI(shader) first');
      return;
    }
    for (const key in shader.uniformsUI) {
      const element = shader.uniformsUI[key];
      element.show();
      element.eventListener = () => {
        shader._setUniformUI(key, element);
      };
      element.elt.addEventListener('input', element.eventListener);
      shader._setUniformUI(key, element);
    }
  }

  p5.Shader.prototype._setUniformUI = function (key, element) {
    const elementType = element.elt.type || (element.elt.tagName.toLowerCase() === 'div' ? element.elt.getElementsByTagName('input')[0].type : undefined);
    if (elementType === 'color') {
      const _color = element.color();
      // TODO p5.prototype needed to parse color picker which seems unaffected by colorMode calls
      // should be tested in instance mode and if it works taken as a model to implement stuff such as _map, _circle, etc.
      this.setUniform(key, [p5.prototype.red(_color) / 255, p5.prototype.green(_color) / 255, p5.prototype.blue(_color) / 255, p5.prototype.alpha(_color) / 255]);
    } else if (elementType === 'range') {
      this.setUniform(key, element.value());
    } else if (elementType === 'checkbox') {
      this.setUniform(key, element.checked());
    } else {
      console.debug('Unsupported element type in found in _setUniformUI');
    }
  }

  p5.Shader.prototype.setUniformsUI = function () {
    for (const key in this.uniformsUI) {
      this._setUniformUI(key, this.uniformsUI[key]);
    }
  }

  /**
   * Applies a shader (`effect`) to a specified rendering `target`, sets shader `uniforms`,
   * and optionally executes a `scene` function with provided `options`. If no `scene` is specified,
   * a default overlaying quad is rendered. The function facilitates method chaining by returning the `target`.
   * @param {p5.Shader} effect - The shader to be applied.
   * @param {Object} config - Configuration object containing:
   *   @param {p5.Graphics|p5.Framebuffer} [config.target=this] - The target to which the shader is applied. 
   *        Can be the current context, a p5.Graphics object, or a p5.Framebuffer.
   *   @param {Object} config.uniforms - Object containing shader uniforms in the format 
   *        { uniform_1_name: value_1, ..., uniform_n_name: value_n }.
   *   @param {Function} [config.scene] - Optional function to execute for rendering the scene.
   *   @param {Object} [config.options] - Optional object to pass additional parameters to the `scene` function.
   * @returns {p5.Graphics|p5.Framebuffer} - The rendering target for method chaining.
   */
  p5.prototype.applyShader = function (effect, { target, uniforms, scene, options = {} } = {}) {
    target instanceof p5.Framebuffer && target.begin();
    const context = target instanceof p5.Graphics ? target : this;
    context.shader(effect);
    effect.setUniformsUI();
    for (const key in uniforms) {
      effect.setUniform(key, uniforms[key]);
    }
    target && (options.target = target);
    if (typeof scene === 'function') {
      scene(options);
    }
    else {
      effect._pMatrix && this.beginHUD();
      context.overlay(options.flip);
      effect._pMatrix && this.endHUD();
    }
    target instanceof p5.Framebuffer && target.end();
    return target || context;
  }

  p5.prototype.texOffset = function (image) {
    return [1 / image.width, 1 / image.height];
  }

  p5.prototype.mousePosition = function () {
    return [this.mouseX * this.pixelDensity(), (this.height - this.mouseY) * this.pixelDensity()];
  }

  p5.prototype.pointerPosition = function (...args) {
    return this._renderer.pointerPosition(...args);
  }

  p5.RendererGL.prototype.pointerPosition = function (pointerX, pointerY) {
    return [pointerX * this.pixelDensity(), (this.height - pointerY) * this.pixelDensity()];
  }

  p5.prototype.resolution = function (...args) {
    return this._renderer.resolution(...args);
  }

  p5.RendererGL.prototype.resolution = function () {
    return [this.width * this.pixelDensity(), this.height * this.pixelDensity()];
  }

  // 4. Utility functions

  p5.prototype.pixelRatio = function (...args) {
    return this._renderer.pixelRatio(...args);
  }

  /**
   * Returns the world to pixel ratio units at given world location.
   * A line of n * pixelRatio(location) world units will be projected
   * with a length of n pixels on screen.
   * @param  {p5.Vector | Array} location      world location reference
   */
  p5.RendererGL.prototype.pixelRatio = function (location) {
    return this.isOrtho() ? Math.abs(this.tPlane() - this.bPlane()) / this.height :
      2 * Math.abs((this._treeLocation(location, { from: Tree.WORLD, to: Tree.EYE, vMatrix: this._curCamera.cameraMatrix })).z) * Math.tan(this.fov() / 2) / this.height;
  }

  p5.prototype.visibility = function (...args) {
    return this._renderer.visibility(...args);
  }

  /**
   * Returns object visibility (i.e, lies within the eye bounds)
   * either Tree.VISIBLE, Tree.INVISIBLE, or Tree.SEMIVISIBLE.
   * Object may be either a point, a sphere or an axis-aligned box.
   * @param  {p5.Vector | Array} corner1 box corner1, use it with corner2.
   * @param  {p5.Vector | Array} corner2 box corner2, use it with corner1.
   * @param  {p5.Vector | Array} center sphere (or point) center.
   * @param  {Number}            radius sphere radius.
   * @param  {Array}             bounds frustum equations 6x4 matrix.
   */
  p5.RendererGL.prototype.visibility = function ({
    corner1,
    corner2,
    center,
    radius,
    bounds = this.bounds()
  } = {}) {
    return center ? radius ? this._ballVisibility(center, radius, bounds) : this._pointVisibility(center, bounds)
      : corner1 && corner2 ? this._boxVisibility(corner1, corner2, bounds) : console.error('couldn\'t parse your visibility query!');
  }

  p5.RendererGL.prototype._pointVisibility = function (point, bounds = this.bounds()) {
    for (const key in bounds) {
      let d = this.distanceToBound(point, key, bounds);
      if (d > 0) {
        return Tree.INVISIBLE;
      }
      if (d === 0) {
        return Tree.SEMIVISIBLE;
      }
    }
    return Tree.VISIBLE;
  }

  p5.RendererGL.prototype._ballVisibility = function (center, radius, bounds = this.bounds()) {
    let allInForAllPlanes = true;
    for (const key in bounds) {
      let d = this.distanceToBound(center, key, bounds);
      if (d > radius) {
        return Tree.INVISIBLE;
      }
      if ((d > 0) || (-d < radius)) {
        allInForAllPlanes = false;
      }
    }
    if (allInForAllPlanes) {
      return Tree.VISIBLE;
    }
    return Tree.SEMIVISIBLE;
  }

  p5.RendererGL.prototype._boxVisibility = function (corner1, corner2, bounds = this.bounds()) {
    if (Array.isArray(corner1)) {
      corner1 = new p5.Vector(corner1[0] ?? 0, corner1[1] ?? 0, corner1[2] ?? 0);
    }
    if (Array.isArray(corner2)) {
      corner2 = new p5.Vector(corner2[0] ?? 0, corner2[1] ?? 0, corner2[2] ?? 0);
    }
    let allInForAllPlanes = true;
    for (const key in bounds) {
      let allOut = true;
      for (let c = 0; c < 8; ++c) {
        let pos = new p5.Vector(((c & 4) != 0) ? corner1.x : corner2.x, ((c & 2) != 0) ? corner1.y : corner2.y,
          ((c & 1) != 0) ? corner1.z : corner2.z);
        if (this.distanceToBound(pos, key, bounds) > 0) {
          allInForAllPlanes = false;
        }
        else {
          allOut = false;
        }
      }
      // The eight points are on the outside side of this plane
      if (allOut) {
        return Tree.INVISIBLE;
      }
    }
    if (allInForAllPlanes) {
      return Tree.VISIBLE;
    }
    // Too conservative, but tangent cases are too expensive to detect
    return Tree.SEMIVISIBLE;
  }

  p5.prototype.bounds = function (...args) {
    return this._renderer.bounds(...args);
  }

  /**
   * Returns the 6 plane equations of the eye frustum bounds defined
   * in the world coordinate system encoded as an object literal
   * having 'Tree.LEFT' (left plane), 'Tree.RIGHT' (right plane),
   * 'Tree.NEAR' (near plane), 'Tree.FAR' (far plane) 'Tree.TOP'
   * (top plane) and 'Tree.BOTTOM' (bottom plane) keys.
   * Each key holds a plane equation of the form:
   * a*x + b*y + c*z + d = 0,  where a, b, c and d are the 4
   * keys of each object literal.
   */
  p5.RendererGL.prototype.bounds = function ({
    vMatrix,
    eMatrix
  } = {}) {
    const n = this.nPlane();
    const f = this.fPlane();
    const l = this.lPlane();
    const r = this.rPlane();
    const b = this.bPlane();
    const t = this.tPlane();
    let normals = Array(6);
    let distances = Array(6);
    // Computed once and for all
    // TODO experimental: no need to normalize
    const pos = this._treeLocation([0, 0, 0], { from: Tree.EYE, to: Tree.WORLD, eMatrix });
    const viewDir = this._treeDisplacement([0, 0, -1], { from: Tree.EYE, to: Tree.WORLD, vMatrix });
    // same as: let viewDir = this.treeDisplacement();
    const up = this._treeDisplacement([0, 1, 0], { from: Tree.EYE, to: Tree.WORLD, vMatrix });
    const right = this._treeDisplacement([1, 0, 0], { from: Tree.EYE, to: Tree.WORLD, vMatrix });
    const posViewDir = p5.Vector.dot(pos, viewDir);
    if (this.isOrtho()) {
      normals[0] = p5.Vector.mult(right, -1);
      normals[1] = right;
      normals[4] = up;
      normals[5] = p5.Vector.mult(up, -1);
      distances[0] = p5.Vector.dot(p5.Vector.sub(pos, p5.Vector.mult(right, -l)), normals[0]);
      distances[1] = p5.Vector.dot(p5.Vector.add(pos, p5.Vector.mult(right, r)), normals[1]);
      distances[4] = p5.Vector.dot(p5.Vector.add(pos, p5.Vector.mult(up, -b)), normals[4]);
      distances[5] = p5.Vector.dot(p5.Vector.sub(pos, p5.Vector.mult(up, t)), normals[5]);
    }
    else {
      const hfovr = Math.atan2(r, n);
      const shfovr = Math.sin(hfovr);
      const chfovr = Math.cos(hfovr);
      const hfovl = Math.atan2(l, n);
      const shfovl = Math.sin(hfovl);
      const chfovl = Math.cos(hfovl);
      normals[0] = p5.Vector.add(p5.Vector.mult(viewDir, shfovl), p5.Vector.mult(right, -chfovl));
      normals[1] = p5.Vector.add(p5.Vector.mult(viewDir, -shfovr), p5.Vector.mult(right, chfovr));
      const fovt = Math.atan2(t, n);
      const sfovt = Math.sin(fovt);
      const cfovt = Math.cos(fovt);
      const fovb = Math.atan2(b, n);
      const sfovb = Math.sin(fovb);
      const cfovb = Math.cos(fovb);
      normals[4] = p5.Vector.add(p5.Vector.mult(viewDir, -sfovt), p5.Vector.mult(up, cfovt));
      normals[5] = p5.Vector.add(p5.Vector.mult(viewDir, sfovb), p5.Vector.mult(up, -cfovb));
      distances[0] = shfovl * posViewDir - chfovl * p5.Vector.dot(pos, right);
      distances[1] = -shfovr * posViewDir + chfovr * p5.Vector.dot(pos, right);
      distances[4] = -sfovt * posViewDir + cfovt * p5.Vector.dot(pos, up);
      distances[5] = sfovb * posViewDir - cfovb * p5.Vector.dot(pos, up);
    }
    // Front and far planes eqns are the same for all projections.
    normals[2] = p5.Vector.mult(viewDir, -1);
    normals[3] = viewDir;
    distances[2] = -posViewDir - n;
    distances[3] = posViewDir + f;
    let bounds = {};
    bounds[Tree.LEFT] = { a: normals[0].x, b: normals[0].y, c: normals[0].z, d: distances[0] };
    bounds[Tree.RIGHT] = { a: normals[1].x, b: normals[1].y, c: normals[1].z, d: distances[1] };
    bounds[Tree.NEAR] = { a: normals[2].x, b: normals[2].y, c: normals[2].z, d: distances[2] };
    bounds[Tree.FAR] = { a: normals[3].x, b: normals[3].y, c: normals[3].z, d: distances[3] };
    bounds[Tree.TOP] = { a: normals[4].x, b: normals[4].y, c: normals[4].z, d: distances[4] };
    bounds[Tree.BOTTOM] = { a: normals[5].x, b: normals[5].y, c: normals[5].z, d: distances[5] };
    return bounds;
  }

  p5.prototype.distanceToBound = function (...args) {
    return this._renderer.distanceToBound(...args);
  }

  /**
   * Returns the signed distance between location and the frustum plane defined
   * by bounds and key which may be either Tree.LEFT, Tree.RIGHT, Tree.BOTTOM,
   * Tree.TOP, Tree.NEAR or Tree.FAR. The distance is negative if the point lies
   * in the planes's bounding halfspace, and positive otherwise.
   */
  p5.RendererGL.prototype.distanceToBound = function (location, key, bounds = this.bounds()) {
    if (Array.isArray(location)) {
      location = new p5.Vector(location[0] ?? 0, location[1] ?? 0, location[2] ?? 0);
    }
    return p5.Vector.dot(location, new p5.Vector(bounds[key].a, bounds[key].b, bounds[key].c)) - bounds[key].d;
  }

  p5.prototype.mousePicking = function ({
    mMatrix = this.mMatrix(),
    x,
    y,
    size = 50,
    shape = Tree.CIRCLE,
    eMatrix,
    pMatrix,
    vMatrix,
    pvMatrix
  } = {}) {
    return this.pointerPicking(this.mouseX, this.mouseY, { mMatrix, x, y, size, shape, eMatrix, pMatrix, vMatrix, pvMatrix });
  }

  p5.prototype.pointerPicking = function (...args) {
    return this._renderer.pointerPicking(...args);
  }

  /**
   * Returns true if pointer is close enough to pointerX, pointerY screen location.
   * @param  {p5.Matrix} mMatrix model space matrix origin to compute (x, y) from.
   * @param  {Number}    x screen x coordinate. Default is width / 2.
   * @param  {Number}    y screen y coordinate. Default is height / 2.
   * @param  {Number}    size bullseye diameter. Default is 50.
   * @param  {Number}    shape either Tree.CIRCLE, Tree.SQUARE or Tree.PROJECTION. Default is Tree.CIRCLE.
   */
  p5.RendererGL.prototype.pointerPicking = function (pointerX, pointerY, {
    mMatrix = this.mMatrix(),
    x,
    y,
    size = 50,
    shape = Tree.CIRCLE,
    eMatrix,
    pMatrix,
    vMatrix,
    pvMatrix
  } = {}) {
    if (!(x && y)) {
      let screenLocation = this.treeLocation({ from: mMatrix, to: Tree.SCREEN, pMatrix, vMatrix, pvMatrix });
      x = screenLocation.x;
      y = screenLocation.y;
      size = size / this.pixelRatio(this.treeLocation({ from: mMatrix, to: Tree.WORLD, eMatrix }));
    }
    // TODO implement webgl picking here using a switch statement: Tree.CIRCLE, Tree.SQUARE, Tree.PROJECTION
    let radius = size / 2;
    return shape === Tree.CIRCLE ?
      Math.sqrt(Math.pow((x - pointerX), 2.0) + Math.pow((y - pointerY), 2.0)) < radius :
      ((Math.abs(pointerX - x) < radius) && (Math.abs(pointerY - y) < radius));
  }

  // 5. Drawing stuff

  /**
   * NDC plane shape,
   * i.e., x, y and z vertex coordinates ∈ [-1..1]
   * assuming textureMode is NORMAL, i.e., u, v texture coordinates ∈ [0..1]
   * see: https://p5js.org/reference/#/p5/beginShape
   *      https://p5js.org/reference/#/p5/vertex
   *         y                  v
   *         |                  |
   * (-1,1,0)|   (1,1,0)        (0,1)     (1,1)
   *   *_____|_____*            *__________*
   *   |     |     |            |          |
   *   |____NDC____|__x         | texture  |
   *   |     |     |            |  space   |
   *   *_____|_____*            *__________*___ u
   * (-1,-1,0)   (1,-1,0)       (0,0)    (1,0)  
   * @param {Boolean} flip flip when using projection matrix
   */
  p5.prototype.overlay = function (flip = !this._renderer._hud) {
    if (this._renderer._hud) {
      this.quad(0, flip ? this.height : 0, this.width, flip ? this.height : 0, this.width, flip ? 0 : this.height, 0, flip ? 0 : this.height);
    } else {
      this.quad(-1, flip ? 1 : -1, 1, flip ? 1 : -1, 1, flip ? -1 : 1, -1, flip ? -1 : 1);
    }
    // TODO this._renderer.overlay(...args) gives bug: p5.Geometry.prototype._getFaceNormal: face has colinear sides or a repeated vertex
  }

  p5.prototype.axes = function (...args) {
    this._renderer.axes(...args);
  }

  /**
   * Draws axes.
   * @param  {Number}  size size in world units.
   * @param  {Number}  bits bitwise mask that may be composed of Tree.X, Tree._X,
   *                        Tree.Y, Tree._Y, Tree.Z, Tree._Z and Tree.LABELS bits.
   */
  p5.RendererGL.prototype.axes = function ({ size = 100, bits = Tree.LABELS | Tree.X | Tree.Y | Tree.Z } = {}) {
    this._rendererState = this.push();
    if ((bits & Tree.LABELS) !== 0) {
      const charWidth = size / 40.0;
      const charHeight = size / 30.0;
      const charShift = 1.04 * size;
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
    }
    // X Axis
    this.stroke(200, 0, 0);
    if ((bits & Tree.X) !== 0) {
      this.line(0, 0, 0, size, 0, 0);
    }
    if ((bits & Tree._X) !== 0) {
      this.line(0, 0, 0, -size, 0, 0);
    }
    // Y Axis
    this.stroke(0, 200, 0);
    if ((bits & Tree.Y) !== 0) {
      this.line(0, 0, 0, 0, size, 0);
    }
    if ((bits & Tree._Y) !== 0) {
      this.line(0, 0, 0, 0, -size, 0);
    }
    // Z Axis
    this.stroke(0, 100, 200);
    if ((bits & Tree.Z) !== 0) {
      this.line(0, 0, 0, 0, 0, size);
    }
    if ((bits & Tree._Z) !== 0) {
      this.line(0, 0, 0, 0, 0, -size);
    }
    this.pop(this._rendererState);
  }

  p5.prototype.grid = function (...args) {
    this._renderer.grid(...args);
  }

  /**
   * Draws grid
   * @param  {Number}  size grid size in world units. Default is 100.
   * @param  {Number}  subdivisions number of grid subdivisions. Default is 10.
   * @param  {Number}  style either Tree.DOTS or Tree.SOLID. Default is Tree.DOTS.
   */
  p5.RendererGL.prototype.grid = function ({ size = 100, subdivisions = 10, style = Tree.DOTS } = {}) {
    this._rendererState = this.push();
    if (style === Tree.DOTS) {
      let weight = this.curStrokeWeight;
      // other useful as well: this.curStrokeColor this.curFillColor
      let posi = 0;
      let posj = 0;
      this.strokeWeight(weight * 2);
      this.beginShape(0x0000);
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
      this.beginShape(0x0000);
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
  }

  p5.prototype.cross = function (...args) {
    this._renderer.cross(...args);
  }

  /**
   * Draws a cross on the screen.
   * @param  {p5.Matrix} mMatrix model space matrix origin to compute (x, y) from.
   * @param  {Number}    x screen x coordinate. Default is width / 2.
   * @param  {Number}    y screen y coordinate. Default is height / 2.
   * @param  {Number}    size cross size. Default is 50.
   */
  p5.RendererGL.prototype.cross = function ({
    mMatrix = this.mMatrix(),
    x,
    y,
    size = 50,
    eMatrix,
    pMatrix,
    vMatrix,
    pvMatrix
  } = {}) {
    if (!(x && y)) {
      let screenLocation = this.treeLocation({ from: mMatrix, to: Tree.SCREEN, pMatrix, vMatrix, pvMatrix });
      x = screenLocation.x;
      y = screenLocation.y;
      size = size / this.pixelRatio(this.treeLocation({ from: mMatrix, to: Tree.WORLD, eMatrix }));
    }
    const half_size = size / 2.0;
    this._rendererState = this.push();
    this.beginHUD();
    this.line(x - half_size, y, x + half_size, y);
    this.line(x, y - half_size, x, y + half_size);
    this.endHUD();
    this.pop(this._rendererState);
  }

  p5.prototype.bullsEye = function (...args) {
    this._renderer.bullsEye(...args);
  }

  /**
   * Draws a bulls-eye on the screen.
   * @param  {p5.Matrix} mMatrix model space matrix origin to compute (x, y) from.
   * @param  {Number}    x screen x coordinate. Default is width / 2.
   * @param  {Number}    y screen y coordinate. Default is height / 2.
   * @param  {Number}    size bullseye diameter. Default is 50.
   * @param  {Number}    shape either Tree.CIRCLE or Tree.SQUARE. Default is Tree.CIRCLE.
   */
  p5.RendererGL.prototype.bullsEye = function ({
    mMatrix = this.mMatrix(),
    x,
    y,
    size = 50,
    shape = Tree.CIRCLE,
    eMatrix,
    pMatrix,
    vMatrix,
    pvMatrix
  } = {}) {
    if (!(x && y)) {
      let screenLocation = this.treeLocation({ from: mMatrix, to: Tree.SCREEN, pMatrix, vMatrix, pvMatrix });
      x = screenLocation.x;
      y = screenLocation.y;
      size = size / this.pixelRatio(this.treeLocation({ from: mMatrix, to: Tree.WORLD, eMatrix }));
    }
    this._rendererState = this.push();
    if (shape === Tree.CIRCLE) {
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
  }

  p5.prototype._circle = function (...args) {
    this._renderer._circle(...args);
  }

  p5.RendererGL.prototype._circle = function ({ filled = false, x = this.width / 2, y = this.height / 2, radius = 100, detail = 50 } = {}) {
    this._rendererState = this.push();
    if (filled) {
      this.beginShape(0x0005);
      for (let t = 0; t <= detail; t++) {
        const x = Math.cos(t * (2 * Math.PI) / detail);
        const y = Math.sin(t * (2 * Math.PI) / detail);
        this.vertex(0, 0, 0, 0.5, 0.5)
        this.vertex(radius * x, radius * y, 0, (x * 0.5) + 0.5, (y * 0.5) + 0.5);
      }
      this.endShape();
    }
    else {
      this.translate(x, y);
      const angle = (2 * Math.PI) / detail;
      let lastPosition = { x: radius, y: 0 };
      for (let i = 1; i <= detail; i++) {
        let position = { x: Math.cos(i * angle) * radius, y: Math.sin(i * angle) * radius };
        this.line(lastPosition.x, lastPosition.y, position.x, position.y);
        lastPosition = position;
      }
    }
    this.pop(this._rendererState);
  }

  p5.prototype.viewFrustum = function (...args) {
    this._renderer.viewFrustum(...args);
  }

  /**
   * Display view frustum, either from pg or eMatrix and pMatrix.
   * @param  {p5.RendererGL | p5.Graphics} pg renderer which viewing frustum is to be displayed.
   * @param  {p5.Matrix} eMatrix eye matrix defining viewfrustum position and orientation.
   * @param  {p5.Matrix} pMatrix projection matrix defining view frustum projection.
   * @param  {Number}   bits bitwise view-frustum mask that may be composed of Tree.NEAR, Tree.FAR and Tree.BODY bits.
   * @param  {Function} viewer callback pg visual representation.
   */
  p5.RendererGL.prototype.viewFrustum = function ({
    vMatrix = this.vMatrix(),
    pg,
    eMatrix = pg?.eMatrix(),
    pMatrix = pg?.pMatrix(),
    bits = Tree.NEAR | Tree.FAR,
    viewer = () => this.axes({ size: 50, bits: Tree.X | Tree._X | Tree.Y | Tree._Y | Tree.Z | Tree._Z })
  } = {}) {
    if (this === pg) {
      console.error('displaying viewFrustum requires a pg different than this');
      return;
    }
    if ((!pMatrix || !eMatrix)) {
      console.error('displaying viewFrustum requires either a pg or projection and eye matrices');
      return;
    }
    // save state
    this._rendererState = this.push();
    this.uMVMatrix = new p5.Matrix();
    // transform from world space to this eye
    this.applyMatrix(...(vMatrix).mat4);
    // transform from eye space to world space
    this.applyMatrix(...(eMatrix).mat4);
    // frustum rendering begins here...
    if (viewer !== Tree.NONE) {
      viewer();
    }
    const is_ortho = pMatrix.isOrtho();
    const apex = !is_ortho && ((bits & Tree.APEX) !== 0);
    const n = -pMatrix.nPlane();
    const f = -pMatrix.fPlane();
    const l = pMatrix.lPlane();
    const r = pMatrix.rPlane();
    // TODO hack: fixes frustum() drawing
    // camera projections should be called as:
    //   pg.ortho(lPlane.value(), rPlane.value(), bPlane.value(), tPlane.value(), nPlane.value(), fPlane.value());
    // pg.frustum(lPlane.value(), rPlane.value(), tPlane.value(), bPlane.value(), nPlane.value(), fPlane.value());
    const t = pMatrix.isOrtho() ? -pMatrix.tPlane() : pMatrix.tPlane();
    const b = pMatrix.isOrtho() ? -pMatrix.bPlane() : pMatrix.bPlane();
    // l, r, b, t f values
    const ratio = is_ortho ? 1 : f / n;
    const _l = ratio * l;
    const _r = ratio * r;
    const _b = ratio * b;
    const _t = ratio * t;
    if ((bits & Tree.FAR) !== 0) {
      this.beginShape();
      this.vertex(_l, _t, f);
      this.vertex(_r, _t, f);
      this.vertex(_r, _b, f);
      this.vertex(_l, _b, f);
      this.endShape('close');
    }
    else {
      this.line(_l, _t, f, _r, _t, f);
      this.line(_r, _t, f, _r, _b, f);
      this.line(_r, _b, f, _l, _b, f);
      this.line(_l, _b, f, _l, _t, f);
    }
    if ((bits & Tree.BODY) !== 0) {
      this.beginShape();
      this.vertex(_l, _t, f);
      this.vertex(l, t, n);
      this.vertex(r, t, n);
      this.vertex(_r, _t, f);
      this.endShape();
      this.beginShape();
      this.vertex(_r, _t, f);
      this.vertex(r, t, n);
      this.vertex(r, b, n);
      this.vertex(_r, _b, f);
      this.endShape();
      this.beginShape();
      this.vertex(_r, _b, f);
      this.vertex(r, b, n);
      this.vertex(l, b, n);
      this.vertex(_l, _b, f);
      this.endShape();
      this.beginShape();
      this.vertex(l, t, n);
      this.vertex(_l, _t, f);
      this.vertex(_l, _b, f);
      this.vertex(l, b, n);
      this.endShape();
      if (apex) {
        this.line(0, 0, 0, r, t, n);
        this.line(0, 0, 0, l, t, n);
        this.line(0, 0, 0, l, b, n);
        this.line(0, 0, 0, r, b, n);
      }
    }
    else {
      this.line(apex ? 0 : r, apex ? 0 : t, apex ? 0 : n, _r, _t, f);
      this.line(apex ? 0 : l, apex ? 0 : t, apex ? 0 : n, _l, _t, f);
      this.line(apex ? 0 : l, apex ? 0 : b, apex ? 0 : n, _l, _b, f);
      this.line(apex ? 0 : r, apex ? 0 : b, apex ? 0 : n, _r, _b, f);
    }
    // TODO implement near plane texture
    // Something along the lines
    // this.textureMode(NORMAL);
    // this.tint(255, 126); // Apply transparency without changing color
    // this.texture(pg);
    // doesn't work since this.texture is not found
    if ((bits & Tree.NEAR) !== 0) {
      this.beginShape();
      this.vertex(l, t, n);
      this.vertex(r, t, n);
      this.vertex(r, b, n);
      this.vertex(l, b, n);
      this.endShape('close');
    }
    else {
      this.line(l, t, n, r, t, n);
      this.line(r, t, n, r, b, n);
      this.line(r, b, n, l, b, n);
      this.line(l, b, n, l, t, n);
    }
    // restore state
    this.pop(this._rendererState);
  }
})();