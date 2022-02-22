# p5.treegl

library description pending.

# Functions

## readShader

Creates a vertex shader, reads a fragment shader and returns a [p5.Shader](https://p5js.org/reference/#/p5.Shader).

### Syntax

`readShader(fragFilename, [{[color], [texcoord]}])`

### Parameters

| parameter    | description                                                           |
|--------------|-----------------------------------------------------------------------|
| fragFilename | String: path to file containing fragment shader source                |
| color        | String: vertex color varying variable name. Default is `vVertexColor` |
| texcoord     | String: vertex color varying variable name. Default is `vTexCoord`    |

## makeShader

Creates a vertex shader, loads a fragment shader and returns a [p5.Shader](https://p5js.org/reference/#/p5.Shader).

### Syntax

`makeShader(fragSrc, [{[color], [texcoord]}])`

### Parameters

| parameter    | description                                                           |
|--------------|-----------------------------------------------------------------------|
| fragSrc      | String: source code for the fragment shader                           |
| color        | String: vertex color varying variable name. Default is `vVertexColor` |
| texcoord     | String: vertex color varying variable name. Default is `vTexCoord`    |

## cover

Covers exactly the window with a rectangle defined with [beginShape](https://p5js.org/reference/#/p5/beginShape) and [endShape](https://p5js.org/reference/#/p5/endShape).

### Syntax

`cover([{[renderer], [texture], [x], [y], [w], [h], [pattern1], [pattern0], [pattern2], [pattern3]}])`

### Parameters

| parameter| description                                                                                                  |
|----------|--------------------------------------------------------------------------------------------------------------|
| renderer | p5.Graphics or p5.Renderer: (offscreen) renderer context to fill. Default is (the onscreen) `this._renderer` |
| texture  | Boolean: defines normal texture coordinates on the four rectangle vertices. Default is `false`               |
| x        | Number: cover x-coordinate. Default is `-renderer.width / 2`                                                 |
| y        | Number: cover y-coordinate. Default is `-renderer.height / 2`                                                |
| w        | Number: cover width. Default is `renderer.width`                                                             |
| h        | Number: cover height. Default is `renderer.height`                                                           |
| pattern0 | p5.Color: upper left corner vertex color. Default is `null`                                                  |
| pattern1 | p5.Color: upper right corner vertex color. Default is `pattern0`                                             |
| pattern2 | p5.Color: lower right corner vertex color. Default is `pattern0`                                             |
| pattern3 | p5.Color: lower left corner vertex color. Default is `pattern0`                                              |

## beginHUD

Begins [Head Up Display](https://en.wikipedia.org/wiki/Head-up_display), so that geometry specified between `beginHUD()` and `endHUD()` is defined in window space.

### Syntax

`beginHUD([renderer])`

### Parameters

| parameter| description                                                                                          |
|----------|------------------------------------------------------------------------------------------------------|
| renderer | p5.Graphics or p5.Renderer: (offscreen) renderer context. Default is (the onscreen) `this._renderer` |

## endHUD

Ends [Head Up Display](https://en.wikipedia.org/wiki/Head-up_display), so that geometry specified between `beginHUD()` and `endHUD()` is defined in window space.

### Syntax

`endHUD([renderer])`

### Parameters

| parameter| description                                                                                          |
|----------|------------------------------------------------------------------------------------------------------|
| renderer | p5.Graphics or p5.Renderer: (offscreen) renderer context. Default is (the onscreen) `this._renderer` |

## emitPointerPosition

Emits the current mouse position as a `vec2` uniform variable defined as: `[mouseX * pixelDensity(), (renderer.height - mouseY) * pixelDensity()]`.

### Syntax

`emitPointerPosition(shader, [{[renderer], [mouseX], [mouseY], [uniform]}])`

### Parameters

| parameter| description                                                                                          |
|----------|------------------------------------------------------------------------------------------------------|
| shader   | p5.Shader: uniform variable targer shader                                                            |
| renderer | p5.Graphics or p5.Renderer: (offscreen) renderer context. Default is (the onscreen) `this._renderer` |
| mouseX   | Number: mouse x position. Default is `this.mouseX`                                                   |
| mouseY   | Number: mouse y position. Default is `this.mouseY`                                                   |
| uniform  | String: name of the uniform variable. Default is `u_mouse`                                           |

## emitResolution

Emits the current window resolution as a `vec2` uniform variable defined as: `[renderer.width * pixelDensity(), renderer.height * pixelDensity()]`.

### Syntax

`emitResolution(shader, [{[renderer], [uniform]}])`

### Parameters

| parameter| description                                                                                          |
|----------|------------------------------------------------------------------------------------------------------|
| shader   | p5.Shader: uniform variable targer shader                                                            |
| renderer | p5.Graphics or p5.Renderer: (offscreen) renderer context. Default is (the onscreen) `this._renderer` |
| uniform  | String: name of the uniform variable. Default is `u_resolution`                                      |

## emitTexOffset

Emits the image offset as a `vec2` uniform variable defined as: `[1 / image.width, 1 / image.height]`.

### Syntax

`emitTexOffset(shader, image, [uniform])`

### Parameters

| parameter| description                                                    |
|----------|----------------------------------------------------------------|
| shader   | p5.Shader: uniform variable targer shader                      |
| image    | p5.Image: source image                                         |
| uniform  | String: name of the uniform variable. Default is `u_texoffset` |

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