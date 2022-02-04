# TODO

lib should only work in **p5 WEBGL** mode.

The main tasks to be completed before the first public release are:

## 1. API compatibility with nub-1 beta3

**treegl** API compatibility >= [nub-1 beta3](https://github.com/VisualComputing/nub/releases/tag/0.9.97).

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

Following this pattern onscreen scenes would use the method as:

```js
function setup() {
  createCanvas(100, 100, WEBGL);
}

function draw() {
  background(200);
  scene_method();
}
```

whereas offscreen scenes would use the method as:

```js
let pg;

function setup() {
  createCanvas(100, 100, WEBGL);
  pg = createGraphics(100, 100, WEBGL);
}

function draw() {
  background(200);
  pg.scene_method();
  image(pg, 50, 50);
}
```

Refer to all visual computing [shader](https://visualcomputing.github.io/docs/shaders/) examples.

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
