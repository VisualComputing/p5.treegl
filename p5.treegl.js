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

  p5.prototype.cover = function ({
    graphics = this,
    texture = false,
    x = -graphics.width / 2,
    y = -graphics.height / 2,
    w = graphics.width,
    h = graphics.height,
    pattern0 = null,
    pattern1 = pattern0,
    pattern2 = pattern0,
    pattern3 = pattern0 } = {}) {
    if (!(graphics._renderer instanceof p5.RendererGL)) {
      throw new Error(`WEBGL is required to use shaderbox.cover`);
    }
    graphics.beginHUD();
    graphics.beginShape();
    let color = this.color(255);
    if (texture) {
      graphics.textureMode = this.NORMAL;
    }
    graphics.fill(pattern0 ?? color);
    graphics.vertex(x, y, 0, 0, 0);
    graphics.fill(pattern1 ?? color);
    graphics.vertex(x + w, y, 0, texture ? 1 : 0, 0);
    graphics.fill(pattern2 ?? color);
    graphics.vertex(x + w, y + h, 0, texture ? 1 : 0, texture ? 1 : 0);
    graphics.fill(pattern3 ?? color);
    graphics.vertex(x, y + h, 0, 0, texture ? 1 : 0);
    graphics.endShape(this.CLOSE);
    graphics.endHUD();
  }

  p5.prototype.beginHUD = function () {
    this._renderer.beginHUD();
  }

  p5.prototype.endHUD = function () {
    this._renderer.endHUD();
  }

  p5.RendererGL.prototype.beginHUD = function() {
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

  p5.RendererGL.prototype.endHUD = function() {
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