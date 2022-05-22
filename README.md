# p5.treegl
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-2-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

High-level space transformations [WEBGL](https://p5js.org/reference/#/p5/WEBGL) [p5.js](https://p5js.org/) library which eases shader development.

- [Shaders](#shaders)
  - [Handling](#handling)
  - [Macros](#macros)
- [Basic matrices](#basic-matrices)
- [Matrix queries](#matrix-queries)
- [Space transformations](#space-transformations)
- [Heads Up Display](#heads-up-display)
- [Frustum queries](#frustum-queries)
- [Utilities](#utilities)
- [Drawing stuff](#drawing-stuff)
- [Installation](#installation)
- [Hacking](#vs-code--vs-codium--gitpod-hacking-instructions)

Observe that *all* matrix operations in `treegl` are [immutable](https://developer.mozilla.org/en-US/docs/Glossary/Primitive), e.g., [invMatrix](#basic-matrices):

```js
let matrix = new p5.Matrix();
// invMatrix doesn't modify its matrix param, it gives a new value
let iMatrix = invMatrix(matrix);
// iMatrix !== matrix
```

Note that the functions in the [shaders](#shaders) and [basic matrices](#basic-matrices) sections are available only to `p5`; those of the [matrix queries](#matrix-queries), [space transformations](#space-transformations), [Heads Up Display](#heads-up-display), [utilities](#utilities) and [drawing stuff](#drawing-stuff) sections are available to `p5`, and [p5.RendererGL](https://p5js.org/reference/#/p5.Renderer) instances; and, those of the [frustum queries](#frustum-queries) section are available to `p5` and [p5.RendererGL](https://p5js.org/reference/#/p5.Renderer), and [p5.Matrix](https://github.com/processing/p5.js/blob/main/src/webgl/p5.Matrix.js) instances.

# Shaders

## Handling

`readShader` and `makeShader` take only a fragment shader and return a [p5.Shader](https://p5js.org/reference/#/p5.Shader) instance. The behind the scenes vertex shader is actually generated from the following [template literal](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals):

```js
`precision highp float;
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
 }`
```

observe in the code above (and in the function signatures below) that the varying `color` and `texcoord` names (of the color and texture coordinates vertex attributes to be interpolated, resp.) are customizable.

1. `readShader(fragFilename, [{[color = 'vVertexColor'], [texcoord = 'vTexCoord']}])`: (similar to [loadShader](https://p5js.org/reference/#/p5/loadShader)) loads a fragment shader from (string) file path and returns a [p5.Shader](https://p5js.org/reference/#/p5.Shader).
2. `makeShader(fragSrc, [{[color= 'vVertexColor'], [texcoord = 'vTexCoord']}])`: (similar to [createShader](https://p5js.org/reference/#/p5/createShader)) creates a fragment shader from (string) source and returns a [p5.Shader](https://p5js.org/reference/#/p5.Shader).

## Macros

Send common `uniform vec2` variables, such as: image offset, pointer position, and screen resolution, to `shader`. Note that the variable names are customizable.

1. `emitTexOffset(shader, image, [uniform = 'u_texoffset'])` as: `[1 / image.width, 1 / image.height]`.
2. `emitMousePosition(shader, [uniform = 'u_mouse'])` as: `[mouseX * pixelDensity(), (height - mouseY) * pixelDensity()]`.
3. `emitPointerPosition(shader, pointerX, pointerY, [uniform = 'u_pointer'])` as: `[pointerX * pixelDensity(), (height - pointerY) * pixelDensity()]`. Available to both, the `p5` object and [p5.RendererGL](https://p5js.org/reference/#/p5.Renderer) instances.
4. `emitResolution(shader, [uniform = 'u_resolution'])` as: `[width * pixelDensity(), height * pixelDensity()]`. Available to both, the `p5` object and [p5.RendererGL](https://p5js.org/reference/#/p5.Renderer) instances.

# Basic matrices

1. `iMatrix()`: Returns the identity matrix.
2. `tMatrix(matrix)`: Returns the tranpose of `matrix`.
3. `invMatrix(matrix)`: Returns the inverse of `matrix`.
4. `axbMatrix(a, b)`: Returns the product of the `a` and `b` matrices.

**Observation:** All returned matrices are instances of [p5.Matrix](https://github.com/processing/p5.js/blob/main/src/webgl/p5.Matrix.js).

# Matrix queries

1. `pMatrix()`: Returns the current projection matrix.
2. `mvMatrix([{[vMatrix], [mMatrix]}])`: Returns the modelview matrix.
3. `mMatrix([{[eMatrix], [mvMatrix]}])`: Returns the model matrix.
4. `eMatrix()`: Returns the current eye matrix (the inverse of `vMatrix()`). In addition to `p5` and [p5.RendererGL](https://p5js.org/reference/#/p5.Renderer) instances, this method is also available to [p5.Camera](https://p5js.org/reference/#/p5.Camera) objects.
5. `vMatrix()`: Returns the view matrix (the inverse of `eMatrix()`). In addition to `p5` and [p5.RendererGL](https://p5js.org/reference/#/p5.Renderer) instances, this method is also available to [p5.Camera](https://p5js.org/reference/#/p5.Camera) objects.
6. `pvMatrix([{[pMatrix], [vMatrix]}])`: Returns the projection times view matrix.
7. `pvInvMatrix([{[pMatrix], [vMatrix], [pvMatrix]}])`: Returns the `pvMatrix` inverse.
8. `lMatrix([{[from = iMatrix()], [to = this.eMatrix()]}])`: Returns the 4x4 matrix that transforms locations (points) from matrix `from` to matrix `to`.
9. `dMatrix([{[from = iMatrix()], [to = this.eMatrix()]}])`: Returns the 3x3 matrix (only [rotational part](https://visualcomputing.github.io/docs/transformations/affine/#3d-rotation) is needed) that transforms displacements (vectors) from matrix `from` to matrix `to`. The `nMatrix` below is a special case of this one.
10. `nMatrix([{[vMatrix], [mMatrix], [mvMatrix]}])`: Returns the [normal matrix](http://www.lighthouse3d.com/tutorials/glsl-12-tutorial/the-normal-matrix/).

**Observations**

1. All returned matrices are instances of [p5.Matrix](https://github.com/processing/p5.js/blob/main/src/webgl/p5.Matrix.js).
2. The `pMatrix`, `vMatrix`, `pvMatrix`, `eMatrix`, `mMatrix` and `mvMatrix` default values are those [defined by the renderer](#matrix-queries) at the moment the query is issued.

# Space transformations

1. `treeLocation(vector, [{[from = SCREEN], [to = WORLD], [pMatrix], [vMatrix], [eMatrix], [pvMatrix], [pvInvMatrix]}])`: transforms locations (points) from matrix `from` to matrix `to`. 
2. `treeDisplacement(vector, [{[from = EYE], [to = WORLD], [vMatrix], [eMatrix], [pMatrix]}])`: transforms displacements (vectors) from matrix `from` to matrix `to`.

Pass matrix params when you *cached* those matrices (see the [previous section](#matrix-queries)), either to speedup computations, e.g.,

```js
let pvInv;

functon draw() {
  // cache pvInv at the beginning of the rendering loop
  // note that this matrix rarely change within the iteration
  pvInv = pvInvMatrix();
  // ...
  // speedup treeLocation
  treeLocation(vector, { from: 'WORLD', to: 'SCREEN', pvInvMatrix: pvInv });
  treeLocation(vector, { from: 'WORLD', to: 'SCREEN', pvInvMatrix: pvInv });
  // ... many more treeLocation calls....
  // ... all the above treeLocation calls used the (only computed once) cached pvInv matrix
}
```

or to transform points (and vectors) between local spaces, e.g.,

```js
let model;

function draw() {
  // ...
  // save model matrix as it is set just before drawing your model
  model = mMatrix();
  drawModel();
  // continue drawing your tree...
  // let's draw a bulls eye at the model origin screen projection
  push();
  let screenProjection = treeLocation([0, 0, 0], { from: model, to: 'SCREEN' });
  bullsEye({ x: screenProjection.x, y: screenProjection.y });
  pop();
}
```

**Observations**

1. Returned transformed vectors are instances of [p5.Vector](https://p5js.org/reference/#/p5.Vector).
2. `from` and `to` may also be specified as either: `'WORLD'`, `'EYE'`, `'SCREEN'` or `'NDC'`.
3. When no matrix params (`eMatrix`, `pMatrix`,...) are passed the renderer [current values](#matrix-queries) are used instead.

# Heads Up Display

1. `beginHUD()`: Begins [Heads Up Display](https://en.wikipedia.org/wiki/Head-up_display), so that geometry specified between `beginHUD()` and `endHUD()` is defined in window space. Should always be used in conjunction with `endHUD`.
2. `endHUD()`: Ends [Heads Up Display](https://en.wikipedia.org/wiki/Head-up_display), so that geometry specified between `beginHUD()` and `endHUD()` is defined in window space. Should always be used in conjunction with `beginHUD`.

# Frustum queries

1. `lPlane()`: Returns the left clipping plane.
2. `rPlane()`: Returns the right clipping plane.
3. `bPlane()`: Returns the bottom clipping plane.
4. `tPlane()`: Returns the top clipping plane.
5. `nPlane()`: Returns the near clipping plane.
6. `fPlane()`: Returns the far clipping plane.
7. `fov()`: Returns the vertical field-of-view (fov) in radians.
8. `hfov()`: Returns the horizontal field-of-view (hfov) in radians.

# Utilities

1. `pixelRatio(location)`: Returns the world to pixel ratio units at given world location, i.e., a line of `n * pixelRatio(location)` world units will be projected with a length of `n` pixels on screen.
2. `visibility`: Returns object visibility, either as `Tree.VISIBLE`, `Tree.INVISIBLE`, or `Tree.SEMIVISIBLE`. Object may be either a _point_: `visibility({ center, [bounds = this.bounds()]})`, a _ball_: `visibility({ center, radius, [bounds = this.bounds()]})` or an _axis-aligned box_: `visibility({ corner1, corner2, [bounds = this.bounds()]})`.
3. `bounds()`: Returns the current frustum six plane equation coefficients formatted as the above `visibility` functions need them.

# Drawing stuff

1. `axes([{ [size = 100], [bits = Tree.LABELS | Tree.X | Tree.Y | Tree.Z] }])`: Draws axes with given `size` in world units, and bitwise mask that may be composed of `Tree.X`, `Tree.XNEG`, `Tree.Y`, `Tree.YNEG`, `Tree.Z`, `Tree.ZNEG` and `Tree.LABELS` `bits`.
2. `grid([{ [size = 100], [subdivisions = 10], [dotted = true] }])`: Draws grid with given `size` in world units, `subdivisions` and `dotted` or continuous lines.
3. `cross([{ [x = this.width / 2], [y = this.height / 2], [size = 50] }])`: Draws a cross at `x`, `y` screen coordinates with given `size` in pixels.
4. `bullsEye([{ [x = this.width / 2], [y = this.height / 2], [size = 50], [circled = true] }])`:  Draws a `circled` (or squared) bullseye at `x`, `y` screen coordinates with given `size` in pixels.
5. `viewFrustum([{ [fbo = _renderer], [bits = Tree.NEAR | Tree.FAR], [viewer = () => this.axes({ size: 50, bits: Tree.X | Tree.NEG | Tree.Y | Tree.YNEG | Tree.Z | Tree.ZNEG })] }])`: Draws frame buffer object (`fbo`) view frustum representation according to view-frustum bitwise mask `bits` which may be composed of `Tree.NEAR`, `Tree.FAR` and `Tree.BODY` `bits`, and `viewer` callback visual representation.

# Installation

Link the `p5.treegl.js` library into your HTML file, after you have linked in [p5.js](https://p5js.org/libraries/). For example:

```html | index.html
<!doctype html>
<html>
<head>
  <script src="p5.js"></script>
  <script src="p5.sound.js"></script>
  <script src=https://cdn.jsdelivr.net/gh/VisualComputing/p5.treegl/p5.treegl.js></script>
  <script src="sketch.js"></script>
</head>
<body>
</body>
</html>
```

to include its minified version use:

```html
<script src=https://cdn.jsdelivr.net/gh/VisualComputing/p5.treegl/p5.treegl.min.js></script>
```

instead.

# [vs-code](https://code.visualstudio.com/) & [vs-codium](https://vscodium.com/) & [gitpod](https://www.gitpod.io/) hacking instructions

To run and hack the testing [examples](https://github.com/VisualComputing/p5.treegl/tree/main/examples):

1. Clone the repo (`git clone https://github.com/VisualComputing/p5.treegl`) and open it with your favorite editor.
2. Install the [p5-vscode extension](https://marketplace.visualstudio.com/items?itemName=samplavigne.p5-vscode).
3. Head over `examples/*/index.html` and press your editor `Go Live` button.

Don't forget to check these [p5.js](https://p5js.org/) references:

1. [Library creation](https://github.com/processing/p5.js/blob/main/contributor_docs/creating_libraries.md).
2. [Software architecture](https://github.com/processing/p5.js/blob/main/src/core/README.md).
3. [Webgl mode](https://github.com/processing/p5.js/blob/main/contributor_docs/webgl_mode_architecture.md).

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/nakednous"><img src="https://avatars.githubusercontent.com/u/645599?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Jean Pierre Charalambos</b></sub></a><br /><a href="#ideas-nakednous" title="Ideas, Planning, & Feedback">🤔</a> <a href="#design-nakednous" title="Design">🎨</a> <a href="#talk-nakednous" title="Talks">📢</a> <a href="#blog-nakednous" title="Blogposts">📝</a> <a href="#example-nakednous" title="Examples">💡</a> <a href="#tutorial-nakednous" title="Tutorials">✅</a> <a href="#video-nakednous" title="Videos">📹</a> <a href="https://github.com/VisualComputing/p5.treegl/commits?author=nakednous" title="Tests">⚠️</a> <a href="https://github.com/VisualComputing/p5.treegl/issues?q=author%3Anakednous" title="Bug reports">🐛</a> <a href="https://github.com/VisualComputing/p5.treegl/commits?author=nakednous" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/dangulos"><img src="https://avatars.githubusercontent.com/u/38595886?v=4?s=100" width="100px;" alt=""/><br /><sub><b>dangulos</b></sub></a><br /><a href="https://github.com/VisualComputing/p5.treegl/commits?author=dangulos" title="Documentation">📖</a> <a href="https://github.com/VisualComputing/p5.treegl/commits?author=dangulos" title="Tests">⚠️</a> <a href="https://github.com/VisualComputing/p5.treegl/issues?q=author%3Adangulos" title="Bug reports">🐛</a> <a href="https://github.com/VisualComputing/p5.treegl/commits?author=dangulos" title="Code">💻</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!