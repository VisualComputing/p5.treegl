# p5.treegl

Shader development and space transformations [WEBGL](https://p5js.org/reference/#/p5/WEBGL) [p5.js](https://p5js.org/) library.

- [Shaders](#shaders)
  - [Setup](#setup)
  - [uniformsUI](#uniformsui)
  - [Apply shader](#apply-shader)
  - [Post-effects](#post-effects)
  - [Macros](#macros)
  - [Bind matrices](#bind-matrices)
- [Space transformations](#space-transformations)
  - [Matrix operations](#matrix-operations)
  - [Matrix queries](#matrix-queries)
  - [Frustum queries](#frustum-queries)
  - [Coordinate space conversions](#coordinate-space-conversions)
  - [Heads Up Display](#heads-up-display)
- [Utilities](#utilities)
- [Drawing stuff](#drawing-stuff)
- [Installation](#installation)
- [vs-code \& vs-codium \& gitpod hacking instructions](#vs-code--vs-codium--gitpod-hacking-instructions)

In `p5.treegl`, all matrix operations are [immutable](https://developer.mozilla.org/en-US/docs/Glossary/Primitive). For example, `invMatrix` does not modify its parameter but returns a new matrix:

```js
let matrix = new p5.Matrix()
// invMatrix doesn't modify its matrix param, it gives a new value
let iMatrix = invMatrix(matrix)
// iMatrix !== matrix
```

Note that functions in the [Shaders](#shaders) and [Matrix operations](#matrix-operations) sections are available only to `p5`; those in the [Matrix Queries](#matrix-queries), [Bind Matrices](#bind-matrices), [Space Transformations](#space-transformations), [Heads Up Display](#heads-up-display), [Utilities](#utilities), and [Drawing Stuff](#drawing-stuff) sections are accessible to both `p5` and [p5.RendererGL](https://p5js.org/reference/#/p5.Renderer) instances; functions in the [Frustum Queries](#frustum-queries) section are available to `p5`, [p5.RendererGL](https://p5js.org/reference/#/p5.Renderer), and [p5.Matrix](https://github.com/processing/p5.js/blob/main/src/webgl/p5.Matrix.js) instances.

# Shaders

`p5.treegl` simplifies the creation and application of shaders in `WEBGL`. It covers the essentials from setting up shaders with [`Setup`](#setup), managing shader uniforms through a [uniforms user interface](#uniformsui), applying shaders using [`Apply shader`](#apply-shader), enhancing visuals with [`Post-effects`](#post-effects), setting common uniform variables using several [`Macros`](#macros), and binding matrices in [`Bind matrices`](#bind-matrices).

Have a look at the [toon shading](https://nakednous.github.io/posts/toon/), [blur with focal point](https://nakednous.github.io/posts/blur/), [post-effects](https://nakednous.github.io/posts/post_effects/), and [gpu-based photomosaic](https://nakednous.github.io/posts/photomosaic/) examples.

## Setup

The `readShader` and `makeShader` functions take a fragment shader —specified in either `GLSL ES 1.00` or `GLSL ES 3.00`— to create and return a [`p5.Shader`](https://p5js.org/reference/#/p5.Shader) object. They parse the fragment shader and use the `matrices` param to infer the corresponding vertex shader which is then logged to the console. These functions also create a [uniformsUI](#uniformsui) user interface with [p5.Elements](https://p5js.org/reference/#/p5.Element) from the fragment shader's uniform variables' comments, and if a `key` is provided, bind the shader to it, enabling its use as a [Post-effect](#post-effects).

1. `readShader(fragFilename, [matrices = Tree.NONE], [uniformsUIConfig], [key])`: Akin to [loadShader](https://p5js.org/reference/#/p5/loadShader), this function reads a fragment shader from a file, generates and logs a vertex shader to the console, and returns a `p5.Shader` instance. It builds a `uniformsUI` user interface using `uniformsUIConfig` and, if a `key` is given, it binds the shader to this `key` for potential use as a [Post-effect](#post-effects). Note that the last three parameters of this function are optional and can be specified in any order.
2. `makeShader(fragSrc, [matrices = Tree.NONE], [uniformsUIConfig], [key])`: Akin to [createShader](https://p5js.org/reference/#/p5/createShader), this function takes a fragment shader source string, generates and logs a vertex shader, and returns a `p5.Shader`. It also sets up a `uniformsUI` user interface with `uniformsUIConfig` and, if a `key` is provided, binds the shader to this keyfor potential use as a [Post-effect](#post-effects). Note that the last three parameters of this function are optional and can be specified in any order.

**Vertex shader generation observations**

- The `matrices` parameter uses the following mask bit fields `Tree.vMatrix`, `Tree.pMatrix`, `Tree.mvMatrix`, `Tree.pmvMatrix`, and `Tree.NONE` which is the default, to determine how vertices are projected onto NDC, according to the following rules (where `p` is set to `vec4(aPosition, 1.0)`):
   | Mask bit fields                   | `gl_Position`                              |
   |-----------------------------------|--------------------------------------------|
   | `Tree.NONE`                       | `p`                                        |
   | `Tree.vMatrix`                    | `uViewMatrix * p`                          |
   | `Tree.pMatrix`                    | `uProjectionMatrix * p`                    |
   | `Tree.mvMatrix`                   | `uModelViewMatrix * p`                     |
   | `Tree.vMatrix` \| `Tree.pMatrix`  | `uProjectionMatrix * uViewMatrix * p`      |
   | `Tree.mvMatrix` \| `Tree.pMatrix` | `uProjectionMatrix * uModelViewMatrix * p` |
   | `Tree.pmvMatrix`                  | `uModelViewProjectionMatrix * p`           |
- The fragment shader's `varyings` variables are parsed to determine which and how vertex attributes should be interpolated from the vertex shader, following these naming conventions:
   | type | name           | space   |
   |------|----------------|---------|
   | `vec4` | `color4`     | color   |
   | `vec2` | `texcoords2` | texture |
   | `vec2` | `position2`  | local   |
   | `vec3` | `position3`  | local   |
   | `vec4` | `position4`  | eye     |
   | `vec3` | `normal3`    | eye     |

**Examples:**

- **Example 1:** `readShader('shader.frag')` (or `makeShader`) `WEBGL2` (`GLSL ES 3.00`) `shader.frag`, with no `varyings` and `highp` `precision`:

  ```glsl
  // inferred vertex shader
  #version 300 es
  precision highp float;
  in vec3 aPosition;
  void main() {
    gl_Position = vec4(aPosition, 1.0);
  }
  ```

- **Example 2:** Similar to **Example 1** but with `WEBGL` (`GLSL ES 1.00`):

  ```glsl
  // inferred vertex shader
  precision highp float;
  attribute vec3 aPosition;
  void main() {
    gl_Position = vec4(aPosition, 1.0);
  }
  ```

- **Example 3:** `readShader('shader.frag', Tree.pmvMatrix)` (or `makeShader`) `WEBGL2` `shader.frag` defining `normal3` and `position4` varyings, and `mediump` `precision`:

  ```glsl
  // shader.frag excerpt
  #version 300 es
  precision mediump float;
  in vec3 normal3;
  in vec4 position4;
  // ...
  ```

  infers the following vertex shader:

  ```glsl
  // inferred vertex shader
  #version 300 es
  precision mediump float;
  in vec3 aPosition;
  in vec3 aNormal;
  uniform mat3 uNormalMatrix;
  uniform mat4 uModelViewMatrix;
  uniform mat4 uModelViewProjectionMatrix;
  out vec3 normal3;
  out vec4 position4;
  void main() {
    normal3 = normalize(uNormalMatrix * aNormal);
    position4 = uModelViewMatrix * vec4(aPosition, 1.0);
    gl_Position = uModelViewProjectionMatrix * vec4(aPosition, 1.0);
  }
  ```

## uniformsUI

By parsing comments within `glsl` `shader` code, a `shader.uniformsUI` object is built, mapping uniform variable names to [p5.Element](https://p5js.org/reference/#/p5.Element) instances for interactively adjusting their values.

Supported elements include [sliders](https://p5js.org/reference/#/p5/createSlider) for `int` and `float` types, [color pickers](https://p5js.org/reference/#/p5/createColorPicker) for `vec4` types, and [checkboxes](https://p5js.org/reference/#/p5/createCheckbox) for `bool` types, as highlighted in the following examples:

* **Sliders**: Create a slider by annotating a uniform `float` or `int` declaration in your shader code. The comment should specify the minimum value, maximum value, default value, and step value.

  Example:
  ```glsl
  uniform float speed; // 1, 10, 5, 0.1
  ```
  This creates a slider for `speed` with a range from 1 to 10, a default value of 5, and a step of 0.1. The speed slider may be accessed as `custom_shader.uniformsUI.speed`.

* **Color Picker**: To create a color picker, annotate a `vec4` uniform. The comment can specify the default color using a CSS color name.

  Example:
  ```glsl
  uniform vec4 color; // 'magenta'
  ```
  This creates a color picker for `color` with a default value of magenta.

* **Checkboxes**: For `bool` uniforms, a checkbox is created. The comment can specify the default state as true or false.

  Example:
  ```glsl
  uniform bool isActive; // true
  ```
  This creates a checkbox for `isActive` that is checked by default.

These functions manipulate the `uniformsUI`:

1. `parseUniformsUI(shader, [{ [x = 0], [y = 0], [offset = 0], [width = 120], [color] }])`: Parses `shader` uniform variable comments into the `shader.uniformsUI` map. It automatically calls `configUniformsUI` with the provided `uniformsUIConfig` object. This function should be invoked on custom shaders created with [loadShader](https://p5js.org/reference/#/p5/loadShader) or [createShader](https://p5js.org/reference/#/p5/createShader), while `readShader` and `makeShader` already call it internally.
2. `configUniformsUI(shader, [{ [x = 0], [y = 0], [offset = 0], [width = 120], [color] }])`: Configures the layout and appearance of the `shader.uniformsUI` elements based on the provided parameters:
   - `x` and `y`: Set the initial position of the first UI element.
   - `offset`: Determines the spacing between consecutive UI elements.
   - `width`: Sets the width of the sliders and color pickers.
   - `color`: Specifies the text color for the UI elements' labels.
3. `showUniformsUI(shader)`: Displays the `shader.uniformsUI` elements associated with the `shader`'s uniforms. It attaches necessary event listeners to update the shader uniforms based on user interactions.
4. `hideUniformsUI(shader)`: Hides the `shader.uniformsUI` elements and removes the event listeners, stopping any further updates to the `shader` uniforms from ui interactions.
5. `resetUniformsUI(shader)`: Hides and resets the `shader.uniformsUI` which should be restored with a call to `parseUniformsUI(shader, configUniformsUI)`.
6. `setUniformsUI(shader)`: Iterates over the `uniformsUI` map and sets the shader's uniforms based on the current values of the corresponding UI elements. This method should be called within the `draw` loop to ensure the shader uniforms are continuously updated. Note that `applyShader` automatically calls this method.

## Apply shader

The `applyShader` function applies a `shader` to a given `scene` and `target`, invoking `setUniformsUI(shader)` and enabling the passing of custom uniform values not specified in [uniformsUI](#uniformsui).

1. `applyShader(shader, [{ [target], [uniforms], [scene], [options] }])` applies `shader` to the specified `target` (which can be the current context, a [p5.Framebuffer](https://p5js.org/reference/#/p5.Framebuffer) or a [p5.Graphics](https://p5js.org/reference/#/p5.Graphics)), emits the `shader` `uniformsUI` (calling `shader.setUniformsUI()`) and the `uniforms` object (formatted as `{ uniform_1_name: value_1, ..., uniform_n_name: value_n }`), renders geometry by executing `scene(options)` (defaults to an overlaying `quad` if not specified), and returns the `target` for method chaining.
2. `overlay(flip)`: A default rendering method used by `applyShader`, which covers the screen with a [quad](https://p5js.org/reference/#/p5/quad). It can also be called between [beginHUD and endHUD](#heads-up-display) to specify the scene geometry in screen space.

## Post-effects

Post-effects[^1] play a key role in dynamic visual rendering, allowing for the interactive blending of various shader effects such as _bloom_, _motion blur_, _ambient occlusion_, and _color grading_, into a rendered scene. A user-space array of `effects` may be sequentially applied to a source `layer` with `applyEffects(layer, effects, [uniforms], [flip])`. Example usage:

```glsl
// noise_shader
uniform sampler2D blender; // <- shared layer should be named 'blender'
uniform float time;
```

```glsl
// bloom_shader
uniform sampler2D blender; // <- shared layer should be named 'blender'
uniform sampler2D depth;
```

```js
// p5 setup
let layer
let effects[] // user space array of shaders

function setup() {
  createCanvas(600, 400, WEBGL)
  layer = createFramebuffer()
  // instantiate shaders with keys for later
  // uniform settings and add them to effects
  effects.push(makeShader(noise_shader, 'noise'))
  effects.push(makeShader(bloom_shader, 'bloom'))
}
```

```js
// p5 draw
function draw() {
  layer.begin()
  // render scene into layer
  layer.end()
  // render target by applying effects to layer
  let uniforms = { // emit uniforms to shaders (besides uniformsUI)
    bloom: { depth: layer.depth }, // <- use bloom key
    noise: { time: millis() / 1000 } // <- use noise key
  }
  const target = applyEffects(layer, effects, uniforms);
  // display target using screen space coords
  beginHUD()
  image(target, 0, 0)
  endHUD()
}
```

```js
// p5 keyPressed
function keyPressed() {
  // swap effects
  [effects[0], effects[1]] = [effects[1], effects[0]]
}
```

1. `applyEffects(layer, effects, [uniforms = {}], [flip = true])`: Sequentially applies all effects (in the order they were added) to the source [p5.Framebuffer](https://p5js.org/reference/#/p5.Framebuffer) `layer`. The `uniforms` param map shader `keys` to their respective uniform values, formatted as `{ uniform_1_name: value_1, ..., uniform_n_name: value_n }`, provided that a `sampler2D uniform blender` variable is declared in each shader effect as a common layer. The `flip` boolean indicates whether the final image should be vertically flipped. This method processes each effect, applying its shader with the corresponding uniforms (with `applyShader`), and returns the final processed layer, now modified by all effects. Note that the last two parameters of this function are optional and can be specified in any order.
2. `createBlender(effects, [options={}])`: [Creates](https://p5js.org/reference/#/p5/createFramebuffer) and attaches an fbo layer with specified `options` to each shader in the `effects` array. If `createBlender` is not called, `applyEffects` automatically generates a blender layer for each shader, utilizing default options.
3. `removeBlender(effects)`: Removes the individual fbo layers associated with each shader in the `effects` array, freeing up resources by invoking [remove](https://p5js.org/reference/#/p5.Framebuffer/remove).

[^1]: For an in-depth review, please refer to the [post-effects](https://visualcomputing.github.io/posteffects/) study conducted by Diego Bulla.

## Macros

Retrieve image offset, mouse position, pointer position and screen resolution which are common `uniform vec2` variables

1. `texOffset(image)` which is the same as: `return [1 / image.width, 1 / image.height]`.
2. `mousePosition()` which is the same as: `return [this.mouseX * this.pixelDensity(), (this.height - this.mouseY) * this.pixelDensity()]`.
3. `pointerPosition(pointerX, pointerY)` which is the same as: `return [pointerX * this.pixelDensity(), (this.height - pointerY) * this.pixelDensity()]`. Available to both, the `p5` object and [p5.RendererGL](https://p5js.org/reference/#/p5.Renderer) instances.
4. `resolution()` which is the same as: `return [this.width * this.pixelDensity(), this.height * this.pixelDensity()]`. Available to both, the `p5` object and [p5.RendererGL](https://p5js.org/reference/#/p5.Renderer) instances.

## Bind matrices

By specifying additional matrices alongside those already emitted automatically by [p5.js](https://github.com/processing/p5.js/blob/main/contributor_docs/webgl_mode_architecture.md), such as `uProjectionMatrix` and `uViewMatrix`, developers can leverage enhanced transformations in their shaders.

1. `bindMatrices(matrices = Tree.NONE)`: Binds additional matrices to the current renderer specified by the `matrices` bit mask, thereby enabling the following matrix uniforms to be emitted to the shader: `Tree.eMatrix` (emits `uEyeMatrix`), `Tree.mMatrix` (emits `uModelMatrix`), `Tree.pvMatrix` (emits `uProjectionViewMatrix`), and `Tree.pvInvMatrix` (emits `uProjectionViewInverseMatrix`). For example:

```js
// Bind additional eMatrix and mMatrix to the current renderer
// should be called after setAttributes
bindMatrices(Tree.eMatrix | Tree.mMatrix)
```

# Space transformations

This section delves into matrix manipulations and queries which are essential for 3D rendering. It includes functions for matrix operations like creation, inversion, and multiplication in the [Matrix operations](#matrix-operations) subsection, and offers methods to retrieve transformation matrices and perform space conversions in [Matrix queries](#matrix-queries), [Frustum queries](#frustum-queries), and [Coordinate Space conversions](#coordinate-space-conversions), facilitating detailed control over 3D scene transformations.

Have a look at the [blur with focal point](https://nakednous.github.io/posts/blur/), and [post-effects](https://nakednous.github.io/posts/post_effects/) examples.

## Matrix operations

1. `iMatrix()`: Returns the identity matrix.
2. `tMatrix(matrix)`: Returns the tranpose of `matrix`.
3. `invMatrix(matrix)`: Returns the inverse of `matrix`.
4. `axbMatrix(a, b)`: Returns the product of the `a` and `b` matrices.

**Observation:** All returned matrices are instances of [p5.Matrix](https://github.com/processing/p5.js/blob/main/src/webgl/p5.Matrix.js).

## Matrix queries

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

## Frustum queries

1. `lPlane()`: Returns the left clipping plane.
2. `rPlane()`: Returns the right clipping plane.
3. `bPlane()`: Returns the bottom clipping plane.
4. `tPlane()`: Returns the top clipping plane.
5. `nPlane()`: Returns the near clipping plane.
6. `fPlane()`: Returns the far clipping plane.
7. `fov()`: Returns the vertical field-of-view (fov) in radians.
8. `hfov()`: Returns the horizontal field-of-view (hfov) in radians.
9. `isOrtho()`: Returns the camera projection type: `true` for orthographic and `false` for perspective.

## Coordinate space conversions

1. `treeLocation(vector = Tree.ORIGIN, [{[from = Tree.EYE], [to = Tree.WORLD], [pMatrix], [vMatrix], [eMatrix], [pvMatrix], [pvInvMatrix]}])`: transforms locations (points) from matrix `from` to matrix `to`. 
2. `treeDisplacement(vector = Tree._k, [{[from = Tree.EYE], [to = Tree.WORLD], [vMatrix], [eMatrix], [pMatrix]}])`: transforms displacements (vectors) from matrix `from` to matrix `to`.

Pass matrix params when you *cached* those matrices (see the [previous section](#matrix-queries)), either to speedup computations, e.g.,

```js
let pvInv

function draw() {
  // cache pvInv at the beginning of the rendering loop
  // note that this matrix rarely change within the iteration
  pvInv = pvInvMatrix()
  // ...
  // speedup treeLocation
  treeLocation(vector, { from: Tree.WORLD, to: Tree.SCREEN, pvInvMatrix: pvInv })
  treeLocation(vector, { from: Tree.WORLD, to: Tree.SCREEN, pvInvMatrix: pvInv })
  // ... many more treeLocation calls....
  // ... all the above treeLocation calls used the (only computed once) cached pvInv matrix
}
```

or to transform points (and vectors) between local spaces, e.g.,

```js
let model

function draw() {
  // ...
  // save model matrix as it is set just before drawing your model
  model = mMatrix()
  drawModel()
  // continue drawing your tree...
  // let's draw a bulls eye at the model origin screen projection
  push()
  let screenProjection = treeLocation(Tree.ORIGIN, { from: model, to: Tree.SCREEN })
  // which is the same as:
  // let screenProjection = treeLocation(createVector(0, 0, 0), { from: model, to: Tree.SCREEN });
  // or,
  // let screenProjection = treeLocation([0, 0, 0], { from: model, to: Tree.SCREEN });
  // or, more simply:
  // let screenProjection = treeLocation({ from: model, to: Tree.SCREEN });
  bullsEye({ x: screenProjection.x, y: screenProjection.y })
  pop()
}
```

**Observations**

1. Returned transformed vectors are instances of [p5.Vector](https://p5js.org/reference/#/p5.Vector).
2. `from` and `to` may also be specified as either: `Tree.WORLD`, `Tree.EYE`, `Tree.SCREEN`, `Tree.NDC` or `Tree.MODEL`.
3. When no matrix params (`eMatrix`, `pMatrix`,...) are passed the renderer [current values](#matrix-queries) are used instead.
4. The default `treeLocation` call (i.e., `treeLocation(Tree.ORIGIN, {from: Tree.EYE, to: Tree.WORLD)`) returns the [camera world position](https://learnopengl.com/Getting-started/Camera).
5. Note that the default `treeDisplacement` call (i.e., `treeDisplacement(Tree._k, {from: Tree.EYE, to: Tree.WORLD)`) returns the normalized [camera viewing direction](https://learnopengl.com/Getting-started/Camera).
6. Other useful vector constants, different than `Tree.ORIGIN` (i.e., `[0, 0, 0]`) and `Tree._k` (i.e., `[0, 0, -1]`), are: `Tree.i` (i.e., `[1, 0, 0]`), `Tree.j` (i.e., `[0, 1, 0]`), `Tree.k` (i.e., `[0, 0, 1]`), `Tree._i` (i.e., `[-1, 0, 0]`) and `Tree._j` (i.e., `[0, -1, 0]`).

## Heads Up Display

1. `beginHUD()`: Begins [Heads Up Display](https://en.wikipedia.org/wiki/Head-up_display), so that geometry specified between `beginHUD()` and `endHUD()` is defined in window space. Should always be used in conjunction with `endHUD`.
2. `endHUD()`: Ends [Heads Up Display](https://en.wikipedia.org/wiki/Head-up_display), so that geometry specified between `beginHUD()` and `endHUD()` is defined in window space. Should always be used in conjunction with `beginHUD`.

# Utilities

This section comprises a collection of handy functions designed to facilitate common tasks in 3D graphics, such as pixel ratio calculations, mouse picking and visibility determination.

1. `pixelRatio(location)`: Returns the world to pixel ratio units at given world location, i.e., a line of `n * pixelRatio(location)` world units will be projected with a length of `n` pixels on screen.
2. `mousePicking({ [mMatrix = this.mMatrix()], [x], [y], [size = 50], [shape = Tree.CIRCLE], [eMatrix], [pMatrix], [vMatrix], [pvMatrix] })`: same as `return this.pointerPicking(this.mouseX, this.mouseY, { mMatrix: mMatrix, x: x, y: y, size: size, shape: shape, eMatrix: eMatrix, pMatrix: pMatrix, vMatrix: vMatrix, pvMatrix: pvMatrix })` (see below).
3. `pointerPicking(pointerX, pointerY, { [mMatrix = this.mMatrix()], [x], [y], [size = 50], [shape = Tree.CIRCLE], [eMatrix], [pMatrix], [vMatrix], [pvMatrix] })`: Returns `true` if `pointerX`, `pointerY` lies within the screen space circle centered at (`x`, `y`) and having `size` diameter. Pass `mMatrix` to compute (`x`, `y`) as the screen space projection of the local space origin (defined by `mMatrix`), having `size` as its bounding sphere diameter. Use `Tree.SQUARE` to use a squared shape instead of a circled one.
4. `visibility`: Returns object visibility, either as `Tree.VISIBLE`, `Tree.INVISIBLE`, or `Tree.SEMIVISIBLE`. Object may be either a _point_: `visibility({ center, [bounds = this.bounds([{[eMatrix = this.eMatrix()], [vMatrix = this.vMatrix()]}])]})`, a _ball_: `visibility({ center, radius, [bounds = this.bounds()]})` or an _axis-aligned box_: `visibility({ corner1, corner2, [bounds = this.bounds()]})`.
5. `bounds()`: Returns the [general form](http://www.songho.ca/math/plane/plane.html) of the current frustum six plane equations, i.e., _ax + by + cz + d = 0_, formatted as an object literal having keys: `Tree.LEFT`, `Tree.RIGHT`, `Tree.BOTTOM`, `Tree.TOP`, `Tree.NEAR` and `Tree.FAR`, e.g., access the near plane coefficients as:
   ```js
   let bounds = bounds()
   let near = bounds[Tree.NEAR] // near.a, near.b, near.c and near.d
   ```

# Drawing stuff

This section includes a range of functions designed for visualizing various graphical elements in 3D space, such as axes, grids, bullseyes, and view frustums. These tools are essential for debugging, illustrating spatial relationships, and enhancing the visual comprehension of 3D scenes. Have a look at the [toon shading](https://nakednous.github.io/posts/toon/), [blur with focal point](https://nakednous.github.io/posts/blur/), and [post-effects](https://nakednous.github.io/posts/post_effects/) examples.

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

Clone the repo (`git clone https://github.com/VisualComputing/p5.treegl`) and open it with your favorite editor.

Don't forget to check these [p5.js](https://p5js.org/) references:

1. [Library creation](https://github.com/processing/p5.js/blob/main/contributor_docs/creating_libraries.md).
2. [Software architecture](https://github.com/processing/p5.js/blob/main/src/core/README.md).
3. [Webgl mode](https://github.com/processing/p5.js/blob/main/contributor_docs/webgl_mode_architecture.md).