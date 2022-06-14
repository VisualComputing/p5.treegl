let lightPosition;
let depthMap;
let depthCamera;
let depthShader;
let shadowShader;
let landscape;
let easycam;
let biasMatrix, lightMatrix;
let linear;

function preload() {
    //depthShader = readShader('depth_pack.frag');
    //depthShader = readShader('depth_nonlinear.frag');
    // just for debugging
    depthShader = readShader('depth_linear.frag');
    linear = true;
    shadowShader = loadShader('shadow_vert.glsl', 'shadow_frag.glsl');
}

function setup() {
    createCanvas(600, 600, WEBGL);
    landscape = 1;
    lightPosition = createVector();
    biasMatrix = new p5.Matrix([0.5, 0, 0, 0,
        0, 0.5, 0, 0,
        0, 0, 0.5, 0,
        0.5, 0.5, 0.5, 1]);
    // 1. shadow stuff
    depthMap = createGraphics(width / 2, height / 2, WEBGL);
    depthCamera = depthMap.createCamera();
    depthMap.noSmooth(); // Antialiasing on the shadowMap leads to weird artifacts
    depthMap.noStroke();
    depthMap.shader(depthShader);
    // 2. default stuff
    //shader(shadowShader);
    // 3. easycam
    // define initial state
    let state = {
        distance: 164.411,
        center: [0, 0, 0],
        rotation: [-0.285, -0.257, -0.619, 0.685],
    };
    console.log(Dw.EasyCam.INFO);
    easycam = new Dw.EasyCam(this._renderer);
    //easycam.state_reset = state;   // state to use on reset (double-click/tap)
    //easycam.setState(state, 2000); // now animate to that state
}

function draw() {
    let e = eMatrix();
    // Calculate the light direction (actually scaled by negative distance)
    lightAngle = frameCount * 0.002;
    lightPosition.set(sin(lightAngle) * 160, 160, cos(lightAngle) * 160);
    // 1. Render the shadowmap
    depthMap.reset();
    depthCamera.setPosition(lightPosition.x, lightPosition.y, lightPosition.z);
    depthCamera.lookAt(0, 0, 0);
    depthMap.background('#FFFFFF');
    depthMap.ortho(-110, 110, -110, 110, 90, 400);
    //let eyeZ = (depthMap.height / 2) / tan(PI / 6);
    //depthMap.perspective(PI / 3, depthMap.width / depthMap.height, eyeZ / 10, 2 * eyeZ);
    let pv = depthMap.pvMatrix();
    if (linear) {
        depthShader.setUniform('near', depthMap.nPlane());
        depthShader.setUniform('far', depthMap.fPlane());
    }
    renderLandscape(depthMap);
    // Update the shadow transformation matrix and send it, the light
    // direction normal and the shadow map to the default shader.
    /*
    lightMatrix = axbMatrix(biasMatrix, pv);
    let st = axbMatrix(lightMatrix, e);
    shadowShader.setUniform('shadowTransform', st.mat4);
    let worldLightDirection = lightPosition.copy();
    worldLightDirection.mult(-1).normalize();
    let lightDirection = treeDisplacement(worldLightDirection, { from: Tree.WORLD, to: Tree.EYE });
    shadowShader.setUniform('lightDirection', [lightDirection.x, lightDirection.y, lightDirection.z]);
    shadowShader.setUniform('shadowMap', depthMap);
    if (frameCount <= 10) {
        console.log(frameCount);
        console.log(lightDirection);
        console.log(st);
    }
    // */
    // Render default pass
    background('#222222');
    renderLandscape(this);
    // Render light source
    // /*
    push();
    fill('#FFFFFF');
    translate(lightPosition.x, lightPosition.y, lightPosition.z);
    box(5);
    pop();
    //*/
    // /*
    beginHUD();
    image(depthMap, width / 2, height / 2);
    endHUD();
    //*/
}

function renderLandscape(canvas) {
    switch (landscape) {
        case 1: {
            let offset = -frameCount * 0.01;
            canvas.fill('#FF5500');
            for (let z = -5; z < 6; ++z) {
                for (let x = -5; x < 6; ++x) {
                    canvas.push();
                    canvas.translate(x * 12, sin(offset + x) * 20 + cos(offset + z) * 20, z * 12);
                    canvas.box(10, 100, 10);
                    canvas.pop();
                }
            }
        } break;
        case 2: {
            let angle = -frameCount * 0.0015, rotation = TWO_PI / 20;
            canvas.fill('#FF5500');
            for (let n = 0; n < 20; ++n, angle += rotation) {
                canvas.push();
                canvas.translate(sin(angle) * 70, cos(angle * 4) * 10, cos(angle) * 70);
                canvas.box(10, 100, 10);
                canvas.pop();
            }
            canvas.fill('#0055FF');
            canvas.sphere(50);
        } break;
        case 3: {
            let angle = -frameCount * 0.0015, rotation = TWO_PI / 20;
            canvas.fill('#FF5500');
            for (let n = 0; n < 20; ++n, angle += rotation) {
                canvas.push();
                canvas.translate(sin(angle) * 70, cos(angle) * 70, 0);
                canvas.box(10, 10, 100);
                canvas.pop();
            }
            canvas.fill('#00FF55');
            canvas.sphere(50);
        }
    }
    canvas.fill('#222222');
    canvas.box(360, 5, 360);
}

function keyPressed() {
    if (key === '1' || key === '2' || key === '3') {
        //landscape = parseInt(key, 10);
        landscape = parseInt(key);
    }
    /*
    if (key != CODED) {
        if (key >= '1' && key <= '3')
            landscape = key - '0';
        else if (key == 'd') {
            shadowMap.beginDraw(); shadowMap.ortho(-200, 200, -200, 200, 10, 400); shadowMap.endDraw();
        } else if (key == 's') {
            shadowMap.beginDraw(); shadowMap.perspective(60 * DEG_TO_RAD, 1, 10, 1000); shadowMap.endDraw();
        }
    }
    */
}

/*
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    easycam.setViewport([0, 0, windowWidth, windowHeight]);
}
*/