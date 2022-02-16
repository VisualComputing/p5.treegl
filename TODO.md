# TODO

lib should only work in **p5 WEBGL** mode.

The main tasks to be completed before the first public release are:

## 1. API compatibility with ~~nub-1 beta3~~ nub treegl branch

**treegl** API compatibility ~~>= [nub-1 beta3](https://github.com/VisualComputing/nub/releases/tag/0.9.97)~~ with [nub treegl](https://github.com/VisualComputing/nub/tree/treegl) branch.

### Observations

Respect to [nub-1 beta3](https://github.com/VisualComputing/nub/releases/tag/0.9.97) the nub **treegl** git branch implements all of the following:

1. Java-17 and processing beta 5 (though beta 6 has been released some days ago) versions used.
2. Scene and Graph were merged into the new [Scene](https://github.com/VisualComputing/nub/blob/treegl/src/nub/core/Scene.java) class.
3. The projection matrix was decoupled from the scene and hence its dimensions are no longer handled by the lib. [Ortho](https://processing.org/reference/ortho_.html), [perspective](https://processing.org/reference/perspective_.html) and/or [frustum](https://processing.org/reference/frustum_.html) should be explicitly called in user space (the defaults are usually good enough).
4. The matrix handler functionality was also merged into the scene.
5. Since WEBGL is always 3D, all 2D stuff was removed.
6. Depending on whether or not the scene handles the eye matrix, the library now works in two modes, dubbed **female** and **male**: In **female** mode the eye is handled either with the low-level [camera](https://processing.org/reference/camera_.html) command or with a third party lib, such as [peasycam](https://github.com/jdf/peasycam) ([here](https://github.com/VisualComputing/nub/tree/treegl/testing/src/female) some examples); whereas in **male** mode, the eye should explicitly be set with the `setEye` command for the lib to handle the camera ([here](https://github.com/VisualComputing/nub/tree/treegl/testing/src/male) some examples). These modes target a possible in-depth, proper solution to the __"eye node and p5.Camera syncing"__ issue pointed below.

## 2. Scene

No `Scene` object is really needed. There's only a `static node tree` and some [p5.RendererGL](https://github.com/processing/p5.js/blob/main/src/webgl/p5.RendererGL.js) instances each having an `eye node`. To be able to support both, onscreen and offscreen **nub scenes** a given `scene_method` should then be implemented using the **p5** "wrapper method pattern" as follows:

```js
p5.prototype.scene_method = function(...args) {
   this._renderer.scene_method(args);
}
```

```js
p5.RendererGL.prototype.scene_method = function(args) {
  // actual nub scene method implementation goes here
}
```

### Proof-of-concept

Following this pattern onscreen scenes would use a method such as [cylinder](https://github.com/VisualComputing/p5.treegl/blob/2f480b30d76feb2c5dcd673512cdb21d1ed701fd/p5.treegl.js#L72) as follows:

```js
function setup() {
  createCanvas(400, 400, WEBGL);
}

function draw() {
  background(200);
  orbitControl();
  fill(255, 0, 0);
  cylinder({ radius: 50, detail : 10 });
}
```

whereas offscreen scenes would use the method as:

```js
let pg;

function setup() {
  createCanvas(400, 400, WEBGL);
  pg = createGraphics(300, 300, WEBGL);
}

function draw() {
  background(200);
  orbitControl();
  pg.background(255, 0, 0);
  pg.fill(0, 255, 255);
  pg.cylinder({ radius: 50, detail : 10 });
  image(pg, -150, -150);
}
```

Refer to the [cylinder](https://github.com/VisualComputing/p5.treegl/tree/main/examples/cylinder) and [cylinder_off](https://github.com/VisualComputing/p5.treegl/tree/main/examples/cylinder_off) treegl examples, respectively.

## 3. Picking

1. Front buffer picking.
2. Back buffer picking.
   1. First, implement picking as it's done in nub (using a back buffer).
   2. Optimize it with [per-pixel based picking](https://webglfundamentals.org/webgl/lessons/webgl-picking.html).

## 4. Eye node and p5.Camera syncing

Sync the `eye` node with [p5.Camera](https://github.com/processing/p5.js/blob/main/src/webgl/p5.Camera.js) matrices in both directions.

Require to extend `p5.Camera` by adding the necessary methods? If yes, it is discussed [here](https://github.com/processing/p5.js/blob/main/contributor_docs/creating_libraries.md#you-can-extend-p5js-classes-as-well-by-adding-methods-to-their-prototypes).

## 5. Port nub examples

Port main [nub basic and demo examples](https://github.com/VisualComputing/nub/tree/master/examples).

## 6. Setter and getter [computed properties](https://www.w3schools.com/js/js_object_accessors.asp) (aka object accessors)

1. **Quaternion**: `x`, `y` `z` and `w`.
2. **Node**: `reference`, `animationTime`, `bullsEyeSize`, `highlight`, `hud`, `shape`, `position`, `orientation`, `magnitude`, `worldPosition`, `worldOrientation`, `worldMagnitude`, `xAxis`, `yAxis` and `zAxis`.
3. **p5.RendererGL**: `center`, `eye`, `fov`, `hfov`, `radius`, `type`, `upVector`, `viewDirection`, `zNear` and `zFar`.

## 7. [Typing destructured object params in ts](https://mariusschulz.com/blog/typing-destructured-object-parameters-in-typescript)

(see also [Destructuring assignment](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment))

1. **Quaternion**: `from` (maybe it should be renamed to `createRotation`).
2. **Node**: `createNode` `configHint`, and `addKeyFrame`.
3. **p5.RendererGL**: `createGraphics`, `display`, `tracks`, `tag`, `updateTag`, `fit` and all the interactivity methods: `shift`, `spin`, `lookAround`, `cad`, `moveForward`, `zoom` and `turn`.

## 8. IK

1. IK filters:
   1. _Hinge_.
   2. _Cone_.
   3. `FILTER` node visual hint.
2. IK Framework:
   1. **p5.tree** as a framework for IK algorithms.
   2. Proof-of-concept: **FABRIK**, **CCD**, **TIK**.
