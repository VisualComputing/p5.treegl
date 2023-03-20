'use strict';

// See:
// https://github.com/processing/p5.js/blob/main/contributor_docs/creating_libraries.md
// https://github.com/processing/p5.js/blob/main/src/core/README.md
// https://github.com/processing/p5.js/blob/main/contributor_docs/webgl_mode_architecture.md

/** @namespace  */
var Tree = (function (ext) {
  const INFO =
  {
    LIBRARY: 'p5.treegl',
    VERSION: '0.6.2',
    HOMEPAGE: 'https://github.com/VisualComputing/p5.treegl'
  };
  Object.freeze(INFO);
  const NONE = 0;
  // Axes consts
  const X = 1 << 0;
  const Y = 1 << 1;
  const Z = 1 << 2;
  const _X = 1 << 3;
  const _Y = 1 << 4;
  const _Z = 1 << 5;
  const LABELS = 1 << 6;
  // grid style
  const SOLID = 0;
  const DOTS = 1
  // bullseye and picking shape
  const SQUARE = 0;
  const CIRCLE = 1;
  // only picking shape
  const PROJECTION = 2;
  // Frustum consts
  const NEAR = 1 << 0;
  const FAR = 1 << 1;
  const LEFT = 1 << 2;
  const RIGHT = 1 << 3;
  const BOTTOM = 1 << 4;
  const TOP = 1 << 5;
  const BODY = 1 << 6;
  // visibility
  const INVISIBLE = 0;
  const VISIBLE = 1;
  const SEMIVISIBLE = 2;
  // spaces
  const WORLD = 'WORLD';
  const EYE = 'EYE';
  const NDC = 'NDC';
  const SCREEN = 'SCREEN';
  const MODEL = 'MODEL';
  // points
  const ORIGIN = [0, 0, 0];
  // vectors
  const i = [1, 0, 0];
  const j = [0, 1, 0];
  const k = [0, 0, 1];
  const _i = [-1, 0, 0];
  const _j = [0, -1, 0];
  const _k = [0, 0, -1];
  // shaders
  // precision
  const lowp = 0;
  const mediump = 1;
  const highp = 2;
  // in
  const pmvMatrix = 1 << 0;
  const pMatrix = 1 << 1;
  const mvMatrix = 1 << 2;
  const nMatrix = 1 << 3;
  // out
  const color4 = 1 << 0;
  const texcoords2 = 1 << 1;
  const normal3 = 1 << 2;
  const position2 = 1 << 3;
  const position3 = 1 << 4;
  const position4 = 1 << 5;
  ext ??= {};
  ext.INFO = INFO;
  ext.NONE = NONE;
  ext.X = X;
  ext.Y = Y;
  ext.Z = Z;
  ext._X = _X;
  ext._Y = _Y;
  ext._Z = _Z;
  ext.LABELS = LABELS;
  ext.SOLID = SOLID;
  ext.DOTS = DOTS;
  ext.SQUARE = SQUARE;
  ext.CIRCLE = CIRCLE;
  ext.PROJECTION = PROJECTION;
  ext.NEAR = NEAR;
  ext.FAR = FAR;
  ext.LEFT = LEFT;
  ext.RIGHT = RIGHT;
  ext.BOTTOM = BOTTOM;
  ext.TOP = TOP;
  ext.BODY = BODY;
  ext.INVISIBLE = INVISIBLE;
  ext.VISIBLE = VISIBLE;
  ext.SEMIVISIBLE = SEMIVISIBLE;
  ext.WORLD = WORLD;
  ext.EYE = EYE;
  ext.NDC = NDC;
  ext.SCREEN = SCREEN;
  ext.MODEL = MODEL;
  ext.ORIGIN = ORIGIN;
  ext.i = i;
  ext.j = j;
  ext.k = k;
  ext._i = _i;
  ext._j = _j;
  ext._k = _k;
  ext.lowp = lowp;
  ext.mediump = mediump;
  ext.highp = highp;
  ext.pmvMatrix = pmvMatrix;
  ext.pMatrix = pMatrix;
  ext.mvMatrix = mvMatrix;
  ext.nMatrix = nMatrix;
  ext.color4 = color4;
  ext.texcoords2 = texcoords2;
  ext.normal3 = normal3;
  ext.position2 = position2;
  ext.position3 = position3;
  ext.position4 = position4;
  return ext;
})(Tree);


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
  };

  p5.Matrix.prototype.mult4 = function (vector) {
    return new p5.Vector(...this._mult4([vector.x, vector.y, vector.z, 1]));
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

  p5.prototype.lMatrix = function () {
    return this._renderer.lMatrix(...arguments);
  }

  // defaults: from: iMatrix, to: eMatrix
  p5.RendererGL.prototype.lMatrix = function (
    {
      from = new p5.Matrix(),
      to = this.eMatrix()
    } = {}) {
    return to.copy().invert(to).apply(from);
  }

  p5.prototype.dMatrix = function () {
    return this._renderer.dMatrix(...arguments);
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
    return mMatrix ? (vMatrix ?? this.vMatrix()).copy().apply(mMatrix) : this.uMVMatrix.copy();
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
    return eMatrix.copy().apply(mvMatrix);
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

  // TODO check where to replace vMatrix for:
  // this._curCamera.cameraMatrix

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
    return this.cameraMatrix.copy().invert(this.cameraMatrix);
  }

  p5.prototype.pmvMatrix = function () {
    return this._renderer.pmvMatrix(...arguments);
  }

  p5.RendererGL.prototype.pmvMatrix = function (
    {
      pMatrix = this.uPMatrix,
      vMatrix,
      mMatrix,
      mvMatrix = this.mvMatrix({ mMatrix: mMatrix, vMatrix: vMatrix })
    } = {}) {
    return pMatrix.copy().apply(mvMatrix);
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
    return pMatrix.copy().apply(vMatrix);
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

  p5.prototype.isOrtho = function () {
    return this._renderer.isOrtho(...arguments);
  }

  p5.RendererGL.prototype.isOrtho = function () {
    return this.uPMatrix.isOrtho();
  }

  p5.Matrix.prototype.isOrtho = function () {
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
    // note that swaped values between bPlane and tPlane are returned
    // if the projection matrix was set with @function frustum.
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
    // note that swaped values between bPlane and tPlane are returned
    // if the projection matrix was set with @function frustum.
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
    this.uMVMatrix = new p5.Matrix();
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

  p5.prototype._map = function () {
    return this._renderer._map(...arguments);
  }

  p5.RendererGL.prototype._map = function (n, start1, stop1, start2, stop2) {
    return (n - start1) / (stop1 - start1) * (stop2 - start2) + start2;
  }

  p5.prototype.treeLocation = function () {
    return this._renderer.treeLocation(...arguments);
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
  p5.RendererGL.prototype.treeLocation = function () {
    return arguments.length === 1 && arguments[0] instanceof Object && !(arguments[0] instanceof p5.Vector) && !(Array.isArray(arguments[0])) ?
      this._treeLocation(Tree.ORIGIN, arguments[0]) : this._treeLocation(...arguments);
  }

  p5.prototype._treeLocation = function () {
    return this._renderer._treeLocation(...arguments);
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
      from = this.mMatrix({ eMatrix: eMatrix });
    }
    if (to == Tree.MODEL) {
      to = this.mMatrix({ eMatrix: eMatrix });
    }
    if ((from == Tree.WORLD) && (to == Tree.SCREEN)) {
      return this._screenLocation({ vector: vector, pMatrix: pMatrix, vMatrix: vMatrix, pvMatrix: pvMatrix });
    }
    if ((from == Tree.SCREEN) && (to == Tree.WORLD)) {
      return this._location({ vector: vector, pMatrix: pMatrix, vMatrix: vMatrix, pvMatrix: pvMatrix, pvInvMatrix: pvInvMatrix });
    }
    if (from == Tree.SCREEN && to == Tree.NDC) {
      return this._screenToNDCLocation(vector);
    }
    if (from == Tree.NDC && to == Tree.SCREEN) {
      return this._ndcToScreenLocation(vector);
    }
    if (from == Tree.WORLD && to == Tree.NDC) {
      return this._screenToNDCLocation(this._screenLocation({ vector: vector, pMatrix: pMatrix, vMatrix: vMatrix, pvMatrix: pvMatrix }));
    }
    if (from == Tree.NDC && to == Tree.WORLD) {
      return this._location({ vector: this._ndcToScreenLocation(vector), pMatrix: pMatrix, vMatrix: vMatrix, pvMatrix: pvMatrix, pvInvMatrix: pvInvMatrix });
    }
    if (from == Tree.NDC && (to instanceof p5.Matrix || to == Tree.EYE)) {
      return (to == Tree.EYE ? (vMatrix ?? this.vMatrix()) : to.copy().invert(to)).mult4(this._location({ vector: this._ndcToScreenLocation(vector), pMatrix: pMatrix, vMatrix: vMatrix, pvMatrix: pvMatrix, pvInvMatrix: pvInvMatrix }));
    }
    if ((from instanceof p5.Matrix || from == Tree.EYE) && to == Tree.NDC) {
      return this._screenToNDCLocation(this._screenLocation({ vector: (from == Tree.EYE ? (eMatrix ?? this.eMatrix()) : from).mult4(vector), pMatrix: pMatrix, vMatrix: vMatrix, pvMatrix: pvMatrix }));
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
      return (to == Tree.EYE ? (vMatrix ?? this.vMatrix()) : to.copy().invert(to)).mult4(this._location({ vector: vector, pMatrix: pMatrix, vMatrix: vMatrix, pvMatrix: pvMatrix, pvInvMatrix: pvInvMatrix }));
    }
    if ((from instanceof p5.Matrix || from == Tree.EYE) && to == Tree.SCREEN) {
      return this._screenLocation({ vector: (from == Tree.EYE ? (eMatrix ?? this.eMatrix()) : from).mult4(vector), pMatrix: pMatrix, vMatrix: vMatrix, pvMatrix: pvMatrix });
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
    return new p5.Vector(target[0], target[1], target[2]);
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
  p5.RendererGL.prototype.treeDisplacement = function () {
    return arguments.length === 1 && arguments[0] instanceof Object && !(arguments[0] instanceof p5.Vector) && !(Array.isArray(arguments[0])) ?
      this._treeDisplacement(Tree._k, arguments[0]) : this._treeDisplacement(...arguments);
  }

  p5.prototype._treeDisplacement = function () {
    return this._renderer._treeDisplacement(...arguments);
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
      from = this.mMatrix({ eMatrix: eMatrix });
    }
    if (to == Tree.MODEL) {
      to = this.mMatrix({ eMatrix: eMatrix });
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

  p5.prototype.readShader = function (fragFilename, {
    precision,
    matrices,
    varyings
  } = {}) {
    let shader = new p5.Shader();
    this._coupledWith = fragFilename.substring(fragFilename.lastIndexOf('/') + 1);
    shader._vertSrc = this.parseVertexShader({ precision: precision, matrices: matrices, varyings: varyings, _specs: false });
    this._coupledWith = undefined;
    this.loadStrings(
      fragFilename,
      result => {
        shader._fragSrc = result.join('\n')
      }
    );
    return shader;
  }

  p5.prototype.makeShader = function (fragSrc, {
    precision,
    matrices,
    varyings
  } = {}) {
    let shader = new p5.Shader();
    this._coupledWith = 'the fragment shader provided as param in makeShader()';
    shader._vertSrc = this.parseVertexShader({ precision: precision, matrices: matrices, varyings: varyings, _specs: false });
    this._coupledWith = undefined;
    shader._fragSrc = fragSrc;
    return shader;
  }

  p5.prototype.parseVertexShader = function ({
    precision = Tree.mediump,
    matrices = Tree.NONE,
    varyings = Tree.NONE,
    _specs = true
  } = {}) {
    let floatPrecision = `precision ${precision === Tree.highp ? 'highp' : `${precision === Tree.mediump ? 'mediump' : 'lowp'}`} float;`
    let color4 = ~(varyings | ~Tree.color4) === 0;
    let texcoords2 = ~(varyings | ~Tree.texcoords2) === 0;
    let normal3 = ~(varyings | ~Tree.normal3) === 0;
    let position2 = ~(varyings | ~Tree.position2) === 0;
    let position3 = ~(varyings | ~Tree.position3) === 0;
    let position4 = ~(varyings | ~Tree.position4) === 0;
    let pmv = ~(matrices | ~Tree.pmvMatrix) === 0;
    let p = ~(matrices | ~Tree.pMatrix) === 0;
    let mv = (~(matrices | ~Tree.mvMatrix) === 0) || position4;
    let n = (~(matrices | ~Tree.nMatrix) === 0) || normal3;
    const target = `gl_Position =${pmv ? ' uModelViewProjectionMatrix * ' : `${p && mv ? ' uProjectionMatrix * uModelViewMatrix *' : ''} `}vec4(aPosition, 1.0)`;
    let vertexShader = `
${floatPrecision}
attribute vec3 aPosition;
${color4 ? 'attribute vec4 aVertexColor;' : ''}
${texcoords2 ? 'attribute vec2 aTexCoord;' : ''}
${normal3 ? 'attribute vec3 aNormal;' : ''}
${pmv ? 'uniform mat4 uModelViewProjectionMatrix;' : ''}
${p ? 'uniform mat4 uProjectionMatrix;' : ''}
${mv ? 'uniform mat4 uModelViewMatrix;' : ''}
${n ? 'uniform mat3 uNormalMatrix;' : ''}
${color4 ? 'varying vec4 color4;' : ''}
${texcoords2 ? 'varying vec2 texcoords2;' : ''}
${normal3 ? 'varying vec3 normal3;' : ''}
${position2 ? 'varying vec2 position2;' : ''}
${position3 ? 'varying vec3 position3;' : ''}
${position4 ? 'varying vec4 position4;' : ''}
void main() {
  ${color4 ? 'color4 = aVertexColor;' : ''}
  ${texcoords2 ? 'texcoords2 = aTexCoord;' : ''}
  ${normal3 ? 'normal3 = normalize(uNormalMatrix * aNormal);' : ''}
  ${position2 ? 'position2 = vec4(aPosition, 1.0).xy;' : ''}
  ${position3 ? 'position3 = vec4(aPosition, 1.0).xyz;' : ''}
  ${position4 ? 'position4 = uModelViewMatrix * vec4(aPosition, 1.0);' : ''}
  ${target};
}
`;
    let advice = `
/*
${this._coupledWith ? 'Vertex shader code to be coupled with ' + this._coupledWith : ''} 
Generated with treegl version ${Tree.INFO.VERSION}
${_specs ? `
Feel free to copy, paste, edit and save it.
Refer to createShader (https://p5js.org/reference/#/p5/createShader),
loadShader (https://p5js.org/reference/#/p5/loadShader), readShader
and makeShader (https://github.com/VisualComputing/p5.treegl#handling),
for details.` : ''}
*/
`;
    let result = advice + vertexShader;
    result = result.split(/\r?\n/)
      .filter(line => line.trim() !== '')
      .join("\n");
    console.log(result);
    return result;
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
    return this.isOrtho() ? Math.abs(this.tPlane() - this.bPlane()) / this.height :
      2 * Math.abs((this._treeLocation(location, { from: Tree.WORLD, to: Tree.EYE, vMatrix: this._curCamera.cameraMatrix })).z) * Math.tan(this.fov() / 2) / this.height;
  }

  p5.prototype.visibility = function () {
    return this._renderer.visibility(...arguments);
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

  p5.prototype.bounds = function () {
    return this._renderer.bounds(...arguments);
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
    const pos = this._treeLocation([0, 0, 0], { from: Tree.EYE, to: Tree.WORLD, eMatrix: eMatrix });
    const viewDir = this._treeDisplacement([0, 0, -1], { from: Tree.EYE, to: Tree.WORLD, vMatrix: vMatrix });
    // same as: let viewDir = this.treeDisplacement();
    const up = this._treeDisplacement([0, 1, 0], { from: Tree.EYE, to: Tree.WORLD, vMatrix: vMatrix });
    const right = this._treeDisplacement([1, 0, 0], { from: Tree.EYE, to: Tree.WORLD, vMatrix: vMatrix });
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

  p5.prototype.distanceToBound = function () {
    return this._renderer.distanceToBound(...arguments);
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
    return this.pointerPicking(this.mouseX, this.mouseY, { mMatrix: mMatrix, x: x, y: y, size: size, shape: shape, eMatrix: eMatrix, pMatrix: pMatrix, vMatrix: vMatrix, pvMatrix: pvMatrix });
  }

  p5.prototype.pointerPicking = function () {
    return this._renderer.pointerPicking(...arguments);
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
      let screenLocation = this.treeLocation({ from: mMatrix, to: Tree.SCREEN, pMatrix: pMatrix, vMatrix: vMatrix, pvMatrix: pvMatrix });
      x = screenLocation.x;
      y = screenLocation.y;
      size = size / this.pixelRatio(this.treeLocation({ from: mMatrix, to: Tree.WORLD, eMatrix: eMatrix }));
    }
    // TODO implement webgl picking here using a switch statement: Tree.CIRCLE, Tree.SQUARE, Tree.PROJECTION
    let radius = size / 2;
    return shape === Tree.CIRCLE ?
      Math.sqrt(Math.pow((x - pointerX), 2.0) + Math.pow((y - pointerY), 2.0)) < radius :
      ((Math.abs(pointerX - x) < radius) && (Math.abs(pointerY - y) < radius));
  }

  // 5. Drawing stuff

  p5.prototype.axes = function () {
    this._renderer.axes(...arguments);
  };

  /**
   * Draws axes.
   * @param  {Number}  size size in world units.
   * @param  {Number}  bits bitwise mask that may be composed of Tree.X, Tree._X,
   *                        Tree.Y, Tree._Y, Tree.Z, Tree._Z and Tree.LABELS bits.
   */
  p5.RendererGL.prototype.axes = function ({ size = 100, bits = Tree.LABELS | Tree.X | Tree.Y | Tree.Z } = {}) {
    this._rendererState = this.push();
    if (~(bits | ~Tree.LABELS) === 0) {
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
    if (~(bits | ~Tree.X) === 0) {
      this.line(0, 0, 0, size, 0, 0);
    }
    if (~(bits | ~Tree._X) === 0) {
      this.line(0, 0, 0, -size, 0, 0);
    }
    // Y Axis
    this.stroke(0, 200, 0);
    if (~(bits | ~Tree.Y) === 0) {
      this.line(0, 0, 0, 0, size, 0);
    }
    if (~(bits | ~Tree._Y) === 0) {
      this.line(0, 0, 0, 0, -size, 0);
    }
    // Z Axis
    this.stroke(0, 100, 200);
    if (~(bits | ~Tree.Z) === 0) {
      this.line(0, 0, 0, 0, 0, size);
    }
    if (~(bits | ~Tree._Z) === 0) {
      this.line(0, 0, 0, 0, 0, -size);
    }
    this.pop(this._rendererState);
  };

  p5.prototype.grid = function () {
    this._renderer.grid(...arguments);
  };

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
  };

  p5.prototype.cross = function () {
    this._renderer.cross(...arguments);
  };

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
      let screenLocation = this.treeLocation({ from: mMatrix, to: Tree.SCREEN, pMatrix: pMatrix, vMatrix: vMatrix, pvMatrix: pvMatrix });
      x = screenLocation.x;
      y = screenLocation.y;
      size = size / this.pixelRatio(this.treeLocation({ from: mMatrix, to: Tree.WORLD, eMatrix: eMatrix }));
    }
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
      let screenLocation = this.treeLocation({ from: mMatrix, to: Tree.SCREEN, pMatrix: pMatrix, vMatrix: vMatrix, pvMatrix: pvMatrix });
      x = screenLocation.x;
      y = screenLocation.y;
      size = size / this.pixelRatio(this.treeLocation({ from: mMatrix, to: Tree.WORLD, eMatrix: eMatrix }));
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
  };

  p5.prototype._circle = function () {
    this._renderer._circle(...arguments);
  };

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
  };

  p5.prototype.viewFrustum = function () {
    this._renderer.viewFrustum(...arguments);
  };

  /**
   * Display fbo view frustum.
   * @param  {p5.RendererGL | p5.Graphics} fbo renderer which viewing frustum is to be displayed.
   * @param  {Number}   bits bitwise view-frustum mask that may be composed of Tree.NEAR, Tree.FAR and Tree.BODY bits.
   * @param  {Function} viewer callback fbo visual representation.
   */

  p5.RendererGL.prototype.viewFrustum = function ({
    vMatrix,
    eMatrix,
    fbo = _renderer,
    bits = Tree.NEAR | Tree.FAR,
    viewer = () => this.axes({ size: 50, bits: Tree.X | Tree._X | Tree.Y | Tree._Y | Tree.Z | Tree._Z })
  } = {}) {
    if (this === fbo) {
      console.error('displaying viewFrustum requires an fbo different than this');
      return;
    }
    // save state
    this._rendererState = this.push();
    this.uMVMatrix = new p5.Matrix();
    // transform from world space to this eye
    this.applyMatrix(...(vMatrix ?? this.vMatrix()).mat4);
    // transform from fbo eye space to world space
    this.applyMatrix(...(eMatrix ?? fbo.eMatrix()).mat4);
    // frustum rendering begins here...
    if (viewer !== Tree.NONE) {
      viewer();
    }
    const is_ortho = fbo.isOrtho();
    const n = -fbo.nPlane();
    const f = -fbo.fPlane();
    const l = fbo.lPlane();
    const r = fbo.rPlane();
    // TODO hack: fixes frustum() drawing
    // camera projections should be called as:
    //   fbo.ortho(lPlane.value(), rPlane.value(), bPlane.value(), tPlane.value(), nPlane.value(), fPlane.value());
    // fbo.frustum(lPlane.value(), rPlane.value(), tPlane.value(), bPlane.value(), nPlane.value(), fPlane.value());
    const t = fbo.isOrtho() ? -fbo.tPlane() : fbo.tPlane();
    const b = fbo.isOrtho() ? -fbo.bPlane() : fbo.bPlane();
    // l, r, b, t f values
    const ratio = is_ortho ? 1 : f / n;
    const _l = ratio * l;
    const _r = ratio * r;
    const _b = ratio * b;
    const _t = ratio * t;
    if (~(bits | ~Tree.FAR) === 0) {
      this.beginShape();
      this.vertex(_l, _t, f);
      this.vertex(_r, _t, f);
      this.vertex(_r, _b, f);
      this.vertex(_l, _b, f);
      this.endShape();
    }
    else {
      this.line(_l, _t, f, _r, _t, f);
      this.line(_r, _t, f, _r, _b, f);
      this.line(_r, _b, f, _l, _b, f);
      this.line(_l, _b, f, _l, _t, f);
    }
    if (~(bits | ~Tree.BODY) === 0) {
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
      if (!is_ortho) {
        this.line(0, 0, 0, r, t, n);
        this.line(0, 0, 0, l, t, n);
        this.line(0, 0, 0, l, b, n);
        this.line(0, 0, 0, r, b, n);
      }
    }
    else {
      this.line(is_ortho ? r : 0, is_ortho ? t : 0, is_ortho ? n : 0, _r, _t, f);
      this.line(is_ortho ? l : 0, is_ortho ? t : 0, is_ortho ? n : 0, _l, _t, f);
      this.line(is_ortho ? l : 0, is_ortho ? b : 0, is_ortho ? n : 0, _l, _b, f);
      this.line(is_ortho ? r : 0, is_ortho ? b : 0, is_ortho ? n : 0, _r, _b, f);
    }
    // TODO implement near plane texture
    // Something along the lines
    // this.textureMode(NORMAL);
    // this.tint(255, 126); // Apply transparency without changing color
    // this.texture(fbo);
    // doesn't work since this.texture is not found
    if (~(bits | ~Tree.NEAR) === 0) {
      this.beginShape();
      this.vertex(l, t, n);
      this.vertex(r, t, n);
      this.vertex(r, b, n);
      this.vertex(l, b, n);
      this.endShape();
    }
    else {
      this.line(l, t, n, r, t, n);
      this.line(r, t, n, r, b, n);
      this.line(r, b, n, l, b, n);
      this.line(l, b, n, l, t, n);
    }
    // restore state
    this.pop(this._rendererState);
  };
})();