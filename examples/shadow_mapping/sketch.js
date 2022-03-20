let lightDir;
let shadowMap;
let depthShader;
let shadowShader;
let landscape;
let easycam;
let biasMatrix;

function preload() {
    depthShader = readShader('depth_frag.glsl');
    shadowShader = loadShader('shadow_vert.glsl', 'shadow_frag.glsl');
}

function setup() {
    createCanvas(600, 600, WEBGL);
    lightDir = createVector();
    landscape = 1;
    biasMatrix = new p5.Matrix([0.5, 0, 0, 0,
        0, 0.5, 0, 0,
        0, 0, 0.5, 0,
        0.5, 0.5, 0.5, 1]);
    // 1. shadow stuff
    shadowMap = createGraphics(2048, 2048, WEBGL);
    shadowMap.noSmooth(); // Antialiasing on the shadowMap leads to weird artifacts
    //shadowMap.loadPixels(); // Will interfere with noSmooth() (probably a bug in Processing)
    //shadowMap.beginDraw();
    shadowMap.noStroke();
    shadowMap.shader(depthShader);
    shadowMap.ortho(-200, 200, -200, 200, 10, 400); // Setup orthogonal view matrix for the directional light
    //shadowMap.endDraw();
    // 2. default stuff

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
    // Calculate the light direction (actually scaled by negative distance)
    lightAngle = frameCount * 0.002;
    lightDir.set(sin(lightAngle) * 160, 160, cos(lightAngle) * 160);

    /*
    // Render shadow pass
    shadowMap.beginDraw();
    shadowMap.camera(lightDir.x, lightDir.y, lightDir.z, 0, 0, 0, 0, 1, 0);
    shadowMap.background('#FFFFFF'); // Will set the depth to 1.0 (maximum depth)
    renderLandscape(shadowMap);
    shadowMap.endDraw();
    shadowMap.updatePixels();
    */

    // Update the shadow transformation matrix and send it, the light
    // direction normal and the shadow map to the default shader.
    //updateDefaultShader();

    // Render default pass
    background('#222222');
    renderLandscape(this);

    // Render light source
    push();
    fill('#FFFFFF');
    translate(lightDir.x, lightDir.y, lightDir.z);
    box(5);
    pop();
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