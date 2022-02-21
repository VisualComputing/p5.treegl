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

  p5.prototype.beginHUD = function () {
    this._renderer.beginHUD();
  }

  p5.prototype.endHUD = function () {
    this._renderer.endHUD();
  }

  p5.RendererGL.prototype.beginHUD = function () {
    this._cacheModelView = this.uMVMatrix.copy();
    this._cacheProjection = this.uPMatrix.copy();
    this._rendererState = this.push();
    let gl = this.drawingContext;
    gl.flush();
    gl.disable(gl.DEPTH_TEST);
    let z = Number.MAX_VALUE;
    this.resetMatrix();
    this._curCamera.ortho(-this.width / 2, this.width / 2, -this.height / 2, this.height / 2, -z, z);
  }

  p5.RendererGL.prototype.endHUD = function () {
    let gl = this.drawingContext;
    gl.flush();
    gl.enable(gl.DEPTH_TEST);
    this.pop(this._rendererState);
    this.uPMatrix.set(this._cacheProjection);
    this.uMVMatrix.set(this._cacheModelView);
  }

  p5.prototype.emitMousePosition = function (shader, {
    graphics = this,
    mouseX = this.mouseX,
    mouseY = this.mouseY,
    uniform = 'u_mouse' } = {}) {
    shader.setUniform(uniform, [mouseX * this.pixelDensity(), (graphics.height - mouseY) * this.pixelDensity()]);
  }

  p5.prototype.emitResolution = function (shader, {
    graphics = this,
    uniform = 'u_resolution' } = {}) {
    shader.setUniform(uniform, [graphics.width * this.pixelDensity(), graphics.height * this.pixelDensity()]);
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