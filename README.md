# p5.treegl

High-level space transformations [WEBGL](https://p5js.org/reference/#/p5/WEBGL) [p5.js](https://p5js.org/) library which eases shader development.

- [Shaders](#shaders)
  - [Handling](#handling)
  - [Bind shader](#bind-shader)
  - [Macros](#macros)
- [Basic matrices](#basic-matrices)
- [Matrix queries](#matrix-queries)
- [Bind matrices](#bind-matrices)
- [Space transformations](#space-transformations)
- [Heads Up Display](#heads-up-display)
- [Frustum queries](#frustum-queries)
- [Utilities](#utilities)
- [Drawing stuff](#drawing-stuff)
- [Installation](#installation)
- [vs-code \& vs-codium \& gitpod hacking instructions](#vs-code--vs-codium--gitpod-hacking-instructions)

Observe that *all* matrix operations in `treegl` are [immutable](https://developer.mozilla.org/en-US/docs/Glossary/Primitive), e.g., [invMatrix](#basic-matrices):

```js
let matrix = new p5.Matrix();
// invMatrix doesn't modify its matrix param, it gives a new value
let iMatrix = invMatrix(matrix);
// iMatrix !== matrix
```

Note that the functions in the [shaders](#shaders) and [basic matrices](#basic-matrices) sections are available only to `p5`; those of the [matrix queries](#matrix-queries), [bind matrices](#bind-matrices), [space transformations](#space-transformations), [Heads Up Display](#heads-up-display), [utilities](#utilities) and [drawing stuff](#drawing-stuff) sections are available to `p5`, and [p5.RendererGL](https://p5js.org/reference/#/p5.Renderer) instances; and, those of the [frustum queries](#frustum-queries) section are available to `p5`, [p5.RendererGL](https://p5js.org/reference/#/p5.Renderer) and [p5.Matrix](https://github.com/processing/p5.js/blob/main/src/webgl/p5.Matrix.js) instances.

# Shaders

## Handling

1. `parseVertexShader([{[precision = Tree.highp], [matrices = Tree.NONE], [varyings = Tree.NONE], [version = WEBGL2]}])`: This function interprets the `precision`, `matrices`, `varyings`, and `version` parameters to construct a vertex shader, which it outputs as a string. For instance:
   - Invoking `parseVertexShader()` with no arguments will output (and also log onto the console) the string below:
     ```glsl
     #version 300 es
     precision highp float;
     in vec3 aPosition;
     void main() {
       gl_Position = vec4(aPosition, 1.0);
     }
     ```
   - Whereas invoking `parseVertexShader(version: WEBGL)` generates the following:
     ```glsl
     precision highp float;
     attribute vec3 aPosition;
     void main() {
       gl_Position = vec4(aPosition, 1.0);
     }
     ```
2. `readShader(fragFilename, matrices = Tree.NONE)`: This function, akin to [loadShader](https://p5js.org/reference/#/p5/loadShader), reads a fragment shader from a file path specified as a string, parses it, and returns a [p5.Shader](https://p5js.org/reference/#/p5.Shader). Note that the underlying vertex shader is automatically generated (and logged to the console) through a call to: `parseVertexShader({precision: precision, matrices: matrices, varyings: varyings})`.
3. `makeShader(fragSrc, matrices = Tree.NONE)`: Similar to [createShader](https://p5js.org/reference/#/p5/createShader), this function generates a fragment shader from a string source, parses it, and returns a [p5.Shader](https://p5js.org/reference/#/p5.Shader). Note that the underlying vertex shader is automatically generated (and logged to the console) through a call to: `parseVertexShader({precision: precision, matrices: matrices, varyings: varyings})`.

**Observations**

1. The `precision` parameter sets the precision for floating-point calculations in the vertex shader, selectable as `Tree.lowp`, `Tree.mediump`, or `Tree.highp`, in alignment with [OpenGL's precision qualifiers](https://www.khronos.org/opengl/wiki/Type_Qualifier_(GLSL)#Precision_qualifiers).
2. The `matrices` parameter specifies which [uniform matrices](https://visualcomputing.github.io/docs/shaders/programming_paradigm/) the vertex shader will utilize, with options including `Tree.vMatrix`, `Tree.pMatrix`, `Tree.mvMatrix`, `Tree.pmvMatrix`, `Tree.nMatrix`, or `Tree.NONE` for excluding matrix uniforms. For example, executing `parseVertexShader({ matrices: Tree.pMatrix | Tree.mvMatrix })` generates the following code (and logs it to the console):
   ```glsl
   #version 300 es
   precision highp float;
   in vec3 aPosition;
   uniform mat4 uProjectionMatrix;
   uniform mat4 uModelViewMatrix;
   void main() {
     gl_Position = uProjectionMatrix * uModelViewMatrix *vec4(aPosition, 1.0);
   }
   ```
   Matrix uniform variables are automatically emitted by the [p5 API](https://p5js.org/reference/), for instance, when utilizing commands like [camera](https://p5js.org/reference/#/p5/camera) or [translate](https://p5js.org/reference/#/p5/translate). It's important to align with the matrix uniform variables naming conventions as outlined [here](https://github.com/processing/p5.js/blob/main/contributor_docs/webgl_mode_architecture.md#shader-parameters) when crafting your fragment shader.
3. The `varyings` parameter designates which [vertex attributes](https://visualcomputing.github.io/docs/shaders/programming_paradigm/) are interpolated across to the fragment shader, from options like `Tree.color4`, `Tree.texcoords2` (for [texture coordinates](https://visualcomputing.github.io/docs/shaders/texturing/)), `Tree.position2`, `Tree.position3`, `Tree.position4` (with `position2` and `position3` defined in local space, and `position4` in eye space), `Tree.normal3` (in eye space), or `Tree.NONE` for excluding varyings. For instance, calling `parseVertexShader({ varyings: Tree.color4 | Tree.texcoords2 })` results in:
   ```glsl
   #version 300 es
   precision highp float;
   in vec3 aPosition;
   in vec4 aVertexColor;
   in vec2 aTexCoord;
   out vec4 color4;
   out vec2 texcoords2;
   void main() {
     color4 = aVertexColor;
     texcoords2 = aTexCoord;
     gl_Position = vec4(aPosition, 1.0);
   }
   ```
   Remember to adhere to the `varying` naming conventions established in the vertex shader, as it must match the naming used in your custom fragment shader.
4. For effective parsing of varying variables in fragment shaders with `readShader(fragFilename, matrices = Tree.NONE)` and `makeShader(fragSrc, matrices = Tree.NONE)`, adherence to the following naming convention is essential:
   | Fragment shader<br> varying variable | `parseVertexShader`<br> bit | Space |
   | ------------------------------------ | --------------------------- | ----- |
   | color4                               | Tree.color4                 | n.a.  |
   | texcoords2                           | Tree.texcoords2             | n.a.  |
   | position2                            | Tree.position2              | local |
   | position3                            | Tree.position3              | local |
   | position4                            | Tree.position4              | eye   |
   | normal3                              | Tree.normal3                | eye   |
   | n.a.                                 | Tree.NONE                   | n.a.  |

Feel free to explore the capabilities of the `parseVertexShader` function detailed earlier by adjusting the `precision`, `matrices`, and `varyings` parameters to identify the outputs that best align with your needs.

## Bind shader

1. `bindShader(shader, [{ [target], [uniforms], [scene], [options] }])` applies `shader` to the specified `target` (which can be the current context, a [p5.Framebuffer](https://p5js.org/reference/#/p5.Framebuffer) or a [p5.Graphics](https://p5js.org/reference/#/p5.Graphics)), emits the `shader` `uniforms` (formatted as `{ uniform_1_name: value_1, ..., uniform_n_name: value_n }`), executes `scene(options)` to render the `scene` (defaults to an overlaying `quad` if not specified), and returns the `target` for method chaining.
2. `overlay(flip)`: A default rendering method used by `bindShader`, which covers the screen with a [quad](https://p5js.org/reference/#/p5/quad). It can be called independently between [beginHUD and endHUD](#heads-up-display) for direct screen space effect application.

## Macros

Retrieve image offset, mouse position, pointer position and screen resolution which are common `uniform vec2` variables

1. `texOffset(image)` which is the same as: `return [1 / image.width, 1 / image.height]`.
2. `mousePosition()` which is the same as: `return [this.mouseX * this.pixelDensity(), (this.height - this.mouseY) * this.pixelDensity()]`.
3. `pointerPosition(pointerX, pointerY)` which is the same as: `return [pointerX * this.pixelDensity(), (this.height - pointerY) * this.pixelDensity()]`. Available to both, the `p5` object and [p5.RendererGL](https://p5js.org/reference/#/p5.Renderer) instances.
4. `resolution()` which is the same as: `return [this.width * this.pixelDensity(), this.height * this.pixelDensity()]`. Available to both, the `p5` object and [p5.RendererGL](https://p5js.org/reference/#/p5.Renderer) instances.

# Basic matrices

1. `iMatrix()`: Returns the identity matrix.
2. `tMatrix(matrix)`: Returns the tranpose of `matrix`.
3. `invMatrix(matrix)`: Returns the inverse of `matrix`.
4. `axbMatrix(a, b)`: Returns the product of the `a` and `b` matrices.

**Observation:** All returned matrices are instances of [p5.Matrix](https://github.com/processing/p5.js/blob/main/src/webgl/p5.Matrix.js).

# Matrix queries

1. `pMatrix()`: Returns the current projection matrix.
2. `mvMatrix([{[vMatrix], [mMatrix]}])`: Returns the modelview matrix.
3. `mMatrix([{[eMatrix], [mvMatrix]}])`: Returns the model matrix. This matrix defines a local space transformation according to [translate](https://p5js.org/reference/#/p5/translate), [rotate](https://p5js.org/reference/#/p5/rotate) and [scale](https://p5js.org/reference/#/p5/scale) commands. Refer also to [push](https://p5js.org/reference/#/p5/push) and [pop](https://p5js.org/reference/#/p5/pop).
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

# Bind matrices

1. `bindMatrices(matrices = Tree.NONE)`: Binds additional matrices to the current renderer specified by the `matrices` bit mask, thereby enabling the following matrix uniforms to be emitted to the shader: `Tree.eMatrix` (emits `uEyeMatrix`), `Tree.mMatrix` (emits `uModelMatrix`), `Tree.pvMatrix` (emits `uProjectionViewMatrix`), and `Tree.pvInvMatrix` (emits `uProjectionViewInverseMatrix`). For example:

```js
// Bind additional eMatrix and mMatrix to the current renderer
// should be called after setAttributes
bindMatrices(Tree.eMatrix | Tree.mMatrix);
```

By specifying additional matrices alongside those automatically emitted by [p5.js](https://p5js.org/), such as `uProjectionMatrix`, `uViewMatrix`, etc., developers can leverage enhanced visual effects and transformations in their shaders.

# Space transformations

1. `treeLocation(vector = Tree.ORIGIN, [{[from = Tree.EYE], [to = Tree.WORLD], [pMatrix], [vMatrix], [eMatrix], [pvMatrix], [pvInvMatrix]}])`: transforms locations (points) from matrix `from` to matrix `to`. 
2. `treeDisplacement(vector = Tree._k, [{[from = Tree.EYE], [to = Tree.WORLD], [vMatrix], [eMatrix], [pMatrix]}])`: transforms displacements (vectors) from matrix `from` to matrix `to`.

Pass matrix params when you *cached* those matrices (see the [previous section](#matrix-queries)), either to speedup computations, e.g.,

```js
let pvInv;

function draw() {
  // cache pvInv at the beginning of the rendering loop
  // note that this matrix rarely change within the iteration
  pvInv = pvInvMatrix();
  // ...
  // speedup treeLocation
  treeLocation(vector, { from: Tree.WORLD, to: Tree.SCREEN, pvInvMatrix: pvInv });
  treeLocation(vector, { from: Tree.WORLD, to: Tree.SCREEN, pvInvMatrix: pvInv });
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
  let screenProjection = treeLocation(Tree.ORIGIN, { from: model, to: Tree.SCREEN });
  // which is the same as:
  // let screenProjection = treeLocation(createVector(0, 0, 0), { from: model, to: Tree.SCREEN });
  // or,
  // let screenProjection = treeLocation([0, 0, 0], { from: model, to: Tree.SCREEN });
  // or, more simply:
  // let screenProjection = treeLocation({ from: model, to: Tree.SCREEN });
  bullsEye({ x: screenProjection.x, y: screenProjection.y });
  pop();
}
```

**Observations**

1. Returned transformed vectors are instances of [p5.Vector](https://p5js.org/reference/#/p5.Vector).
2. `from` and `to` may also be specified as either: `Tree.WORLD`, `Tree.EYE`, `Tree.SCREEN`, `Tree.NDC` or `Tree.MODEL`.
3. When no matrix params (`eMatrix`, `pMatrix`,...) are passed the renderer [current values](#matrix-queries) are used instead.
4. The default `treeLocation` call (i.e., `treeLocation(Tree.ORIGIN, {from: Tree.EYE, to: Tree.WORLD)`) returns the [camera world position](https://learnopengl.com/Getting-started/Camera).
5. Note that the default `treeDisplacement` call (i.e., `treeDisplacement(Tree._k, {from: Tree.EYE, to: Tree.WORLD)`) returns the normalized [camera viewing direction](https://learnopengl.com/Getting-started/Camera).
6. Other useful vector constants, different than `Tree.ORIGIN` (i.e., `[0, 0, 0]`) and `Tree._k` (i.e., `[0, 0, -1]`), are: `Tree.i` (i.e., `[1, 0, 0]`), `Tree.j` (i.e., `[0, 1, 0]`), `Tree.k` (i.e., `[0, 0, 1]`), `Tree._i` (i.e., `[-1, 0, 0]`) and `Tree._j` (i.e., `[0, -1, 0]`).

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
9. `isOrtho()`: Returns the camera projection type: `true` for orthographic and `false` for perspective.

# Utilities

1. `pixelRatio(location)`: Returns the world to pixel ratio units at given world location, i.e., a line of `n * pixelRatio(location)` world units will be projected with a length of `n` pixels on screen.
2. `mousePicking({ [mMatrix = this.mMatrix()], [x], [y], [size = 50], [shape = Tree.CIRCLE], [eMatrix], [pMatrix], [vMatrix], [pvMatrix] })`: same as `return this.pointerPicking(this.mouseX, this.mouseY, { mMatrix: mMatrix, x: x, y: y, size: size, shape: shape, eMatrix: eMatrix, pMatrix: pMatrix, vMatrix: vMatrix, pvMatrix: pvMatrix })` (see below).
3. `pointerPicking(pointerX, pointerY, { [mMatrix = this.mMatrix()], [x], [y], [size = 50], [shape = Tree.CIRCLE], [eMatrix], [pMatrix], [vMatrix], [pvMatrix] })`: Returns `true` if `pointerX`, `pointerY` lies within the screen space circle centered at (`x`, `y`) and having `size` diameter. Pass `mMatrix` to compute (`x`, `y`) as the screen space projection of the local space origin (defined by `mMatrix`), having `size` as its bounding sphere diameter. Use `Tree.SQUARE` to use a squared shape instead of a circled one.
4. `visibility`: Returns object visibility, either as `Tree.VISIBLE`, `Tree.INVISIBLE`, or `Tree.SEMIVISIBLE`. Object may be either a _point_: `visibility({ center, [bounds = this.bounds([{[eMatrix = this.eMatrix()], [vMatrix = this.vMatrix()]}])]})`, a _ball_: `visibility({ center, radius, [bounds = this.bounds()]})` or an _axis-aligned box_: `visibility({ corner1, corner2, [bounds = this.bounds()]})`.
5. `bounds()`: Returns the [general form](http://www.songho.ca/math/plane/plane.html) of the current frustum six plane equations, i.e., _ax + by + cz + d = 0_, formatted as an object literal having keys: `Tree.LEFT`, `Tree.RIGHT`, `Tree.BOTTOM`, `Tree.TOP`, `Tree.NEAR` and `Tree.FAR`, e.g., access the near plane coefficients as:
   ```js
   let bounds = bounds();
   let near = bounds[Tree.NEAR];// near.a, near.b, near.c and near.d
   ```

# Drawing stuff

1. `axes([{ [size = 100], [bits = Tree.LABELS | Tree.X | Tree.Y | Tree.Z] }])`: Draws axes with given `size` in world units, and bitwise mask that may be composed of `Tree.X`, `Tree._X`, `Tree.Y`, `Tree._Y`, `Tree.Z`, `Tree._Z` and `Tree.LABELS` `bits`.
2. `grid([{ [size = 100], [subdivisions = 10], [style = Tree.DOTS] }])`: Draws grid with given `size` in world units, `subdivisions` and `dotted` (`Tree.DOTS`) or solid (`Tree.SOLID`) lines.
3. `cross([{ [mMatrix = this.mMatrix()], [x], [y], [size = 50], [eMatrix], [pMatrix], [vMatrix], [pvMatrix] }])`: Draws a cross at `x`, `y` screen coordinates with given `size` in pixels. Pass `mMatrix` to compute (`x`, `y`) as the screen space projection of the local space origin (defined by `mMatrix`).
4. `bullsEye([{ [mMatrix = this.mMatrix()], [x], [y], [size = 50], [shape = Tree.CIRCLE], [eMatrix], [pMatrix], [vMatrix], [pvMatrix] }])`:  Draws a circled bullseye (use `Tree.SQUARE` to draw it as a square) at `x`, `y` screen coordinates with given `size` in pixels. Pass `mMatrix` to compute (`x`, `y`) as the screen space projection of the local space origin (defined by `mMatrix`).
5. `viewFrustum([{ [pg], [bits = Tree.NEAR | Tree.FAR], [viewer = () => this.axes({ size: 50, bits: Tree.X | Tree._X | Tree.Y | Tree._Y | Tree.Z | Tree._Z })], [eMatrix = pg?.eMatrix()], [pMatrix = pg?.pMatrix()], [vMatrix = this.vMatrix()] }])`: Draws a view frustum based on the specified bitwise mask bits `Tree.NEAR`, `Tree.FAR`, `Tree.APEX`, `Tree.BODY`, and `viewer`  callback visual representation. The function determines the view frustum's position, orientation, and viewing volume either from a given `pg`, or directly through `eMatrix` and `pMatrix` parameters.

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