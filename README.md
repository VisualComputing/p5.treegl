# p5.treegl

High-level matrix transformations [WEBGL](https://p5js.org/reference/#/p5/WEBGL) [p5.js](https://p5js.org/) library which eases shader development.

# Basic matrices

1. `iMatrix()`: Returns the identity matrix.
2. `tMatrix(matrix)`: Returns the tranpose of `matrix`.
3. `invMatrix(matrix)`: Returns the inverse of `matrix`.
4. `axbMatrix(a, b)`: Returns the product of the `a` and `b` matrices.
5. `lMatrix(from, to)`: Returns the 4x4 matrix that transforms locations (points) from matrix `from` to matrix `to`.
6. `dMatrix(from, to)`: Returns the 3x3 matrix that transforms displacements (vectors) from matrix `from` to matrix `to`. The `nMatrix` below is a special case of this one.

# Matrix queries

All of the following functions are available to both, the `p5` object and [p5.RendererGL](https://p5js.org/reference/#/p5.Renderer) instances.

1. `pMatrix()`: Returns the current projection matrix.
2. `mvMatrix()`: Returns the current modelview matrix.
3. `mMatrix()`: Returns the current model matrix.
4. `eMatrix()`: Returns the current eye matrix (the inverse of `vMatrix()`).
5. `vMatrix()`: Returns the view matrix (the inverse of `eMatrix()`).
6. `pvMatrix()`: Returns the current projection times view matrix.
7. `pvInvMatrix()`: Returns the `pvMatrix` inverse.
8. `nMatrix()`: Returns the current [normal matrix](http://www.lighthouse3d.com/tutorials/glsl-12-tutorial/the-normal-matrix/).

# Space transformations

All of the following functions are available to both, the `p5` object and [p5.RendererGL](https://p5js.org/reference/#/p5.Renderer) instances.

1. `beginHUD()`: Begins [Head Up Display](https://en.wikipedia.org/wiki/Head-up_display), so that geometry specified between `beginHUD()` and `endHUD()` is defined in window space. Should always be used in conjunction with `endHUD`.
2. `endHUD()`: Ends [Head Up Display](https://en.wikipedia.org/wiki/Head-up_display), so that geometry specified between `beginHUD()` and `endHUD()` is defined in window space. Should always be used in conjunction with `beginHUD`.
3. `treeLocation(vector, [{[from = SCREEN], [to = WORLD]}])`: transforms locations (points) from matrix `from` to matrix `to`. Note that `from` and `to` may also be specified as either: `'WORLD'`, `'EYE'`, `'SCREEN'` or `'NDC'`.
4. `treeDisplacement(vector, [{[from = EYE], [to = WORLD]}])`: transforms displacements (vectors) from matrix `from` to matrix `to`. Note that `from` and `to` may also be specified as either: `'WORLD'`, `'EYE'`, `'SCREEN'` or `'NDC'`.

# Shader functions

1. `readShader(fragFilename, [{[color = 'vVertexColor'], [texcoord = 'vTexCoord']}])`: creates a vertex shader, reads a fragment shader from (string) file path and returns a [p5.Shader](https://p5js.org/reference/#/p5.Shader). The `color` and `texcoord` params define the color and texture coordinates `varying` variable names, respectively.
2. `makeShader(fragSrc, [{[color= 'vVertexColor'], [texcoord = 'vTexCoord']}])`: creates a vertex shader, loads a fragment shader from (string) source and returns a [p5.Shader](https://p5js.org/reference/#/p5.Shader). The `color` and `texcoord` params define the color and texture coordinates `varying` variable names, respectively.
3. `emitTexOffset(shader, image, [uniform = 'u_texoffset'])`: emits the `image` offset to the `shader` as a `vec2` uniform variable, computed as: `[1 / image.width, 1 / image.height]`. The `uniform` param defines the `varying` variable name.
4. `emitPointerPosition(shader, pointerX, pointerY, [uniform = 'u_mouse'])`: emits the current pointer position to the `shader` as a `vec2` uniform variable, computed as: `[pointerX * pixelDensity(), (height - pointerY) * pixelDensity()]`. The `uniform` param defines the `varying` variable name. Available to both, the `p5` object and [p5.RendererGL](https://p5js.org/reference/#/p5.Renderer) instances.
5. `emitResolution(shader, [uniform = 'u_resolution'])`: emits the current resolution to the `shader` as a `vec2` uniform variable, computed as: `[width * pixelDensity(), height * pixelDensity()]`. The `uniform` param defines the `varying` variable name. Available to both, the `p5` object and [p5.RendererGL](https://p5js.org/reference/#/p5.Renderer) instances.

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