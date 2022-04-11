# p5.treegl
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

High-level space transformations [WEBGL](https://p5js.org/reference/#/p5/WEBGL) [p5.js](https://p5js.org/) library which eases shader development.

- [Shaders](#shaders)
  - [Handling](#handling)
  - [Macros](#macros)
- [Basic matrices](#basic-matrices)
- [Space transformations](#space-transformations)
- [Heads Up Display](#heads-up-display)
- [Matrix queries](#matrix-queries)
- [Frustum queries](#frustum-queries)
- [Drawing stuff](#drawing-stuff)
- [Installation](#installation)
- [Hacking](#vs-code--vs-codium--gitpod-hacking-instructions)

Note that the functions in the [shaders](#shaders) and [basic matrices](#basic-matrices) sections are available only to `p5`, while those of the [space transformations](#space-transformations), [Heads Up Display](#heads-up-display), [matrix queries](#matrix-queries) and [frustum queries](#frustum-queries) sections are also available to [p5.RendererGL](https://p5js.org/reference/#/p5.Renderer) instances.

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
5. `lMatrix(from, to)`: Returns the 4x4 matrix that transforms locations (points) from matrix `from` to matrix `to`.
6. `dMatrix(from, to)`: Returns the 3x3 matrix that transforms displacements (vectors) from matrix `from` to matrix `to`. The `nMatrix` below is a special case of this one.

**Observation:** All returned matrices are instances of [p5.Matrix](https://github.com/processing/p5.js/blob/main/src/webgl/p5.Matrix.js).

# Space transformations

1. `treeLocation(vector, [{[from = SCREEN], [to = WORLD], [pMatrix], [vMatrix], [eMatrix], [pvMatrix], [pvInvMatrix]}])`: transforms locations (points) from matrix `from` to matrix `to`. 
2. `treeDisplacement(vector, [{[from = EYE], [to = WORLD], [vMatrix], [eMatrix], [pMatrix]}])`: transforms displacements (vectors) from matrix `from` to matrix `to`.

**Observations**

1. Returned transformed vectors are instances of [p5.Vector](https://p5js.org/reference/#/p5.Vector).
2. `from` and `to` may also be specified as either: `'WORLD'`, `'EYE'`, `'SCREEN'` or `'NDC'`.
3. When no matrix params are passed the renderer [current values](#matrix-queries) are used instead.

# Heads Up Display

1. `beginHUD()`: Begins [Heads Up Display](https://en.wikipedia.org/wiki/Head-up_display), so that geometry specified between `beginHUD()` and `endHUD()` is defined in window space. Should always be used in conjunction with `endHUD`.
2. `endHUD()`: Ends [Heads Up Display](https://en.wikipedia.org/wiki/Head-up_display), so that geometry specified between `beginHUD()` and `endHUD()` is defined in window space. Should always be used in conjunction with `beginHUD`.

# Matrix queries

1. `pMatrix()`: Returns the current projection matrix.
2. `mvMatrix([{[vMatrix], [mMatrix]}])`: Returns the modelview matrix.
3. `mMatrix([{[eMatrix], [mvMatrix]}])`: Returns the model matrix.
4. `eMatrix()`: Returns the current eye matrix (the inverse of `vMatrix()`). In addition to `p5` and [p5.RendererGL](https://p5js.org/reference/#/p5.Renderer) instances, this method is also available to [p5.Camera](https://p5js.org/reference/#/p5.Camera) objects.
5. `vMatrix()`: Returns the view matrix (the inverse of `eMatrix()`). In addition to `p5` and [p5.RendererGL](https://p5js.org/reference/#/p5.Renderer) instances, this method is also available to [p5.Camera](https://p5js.org/reference/#/p5.Camera) objects.
6. `pvMatrix([{[pMatrix], [vMatrix]}])`: Returns the projection times view matrix.
7. `pvInvMatrix([{[pMatrix], [vMatrix], [pvMatrix]}])`: Returns the `pvMatrix` inverse.
8. `nMatrix([{[vMatrix], [mMatrix], [mvMatrix]}])`: Returns the [normal matrix](http://www.lighthouse3d.com/tutorials/glsl-12-tutorial/the-normal-matrix/).

**Observations**

1. All returned matrices are instances of [p5.Matrix](https://github.com/processing/p5.js/blob/main/src/webgl/p5.Matrix.js).
2. When no matrix params are passed the renderer [current values](#matrix-queries) are used instead.

# Frustum queries

1. `lPlane([pMatrix])`: Returns the left clipping plane.
2. `rPlane([pMatrix])`: Returns the right clipping plane.
3. `bPlane([pMatrix])`: Returns the bottom clipping plane.
4. `tPlane([pMatrix])`: Returns the top clipping plane.
5. `nPlane([pMatrix])`: Returns the near clipping plane.
6. `fPlane([pMatrix])`: Returns the far clipping plane.
7. `fov([pMatrix])`: Returns the vertical field-of-view (fov) in radians.
8. `hfov([pMatrix])`: Returns the horizontal field-of-view (hfov) in radians.

**Observation:** when no projection (`pMatrix`) matrix is passed the renderer [current value](#matrix-queries) is used instead.

# Drawing stuff

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
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!