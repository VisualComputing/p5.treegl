/*
PVector lightDir = new PVector();
PShader defaultShader;
PGraphics shadowMap;
int landscape = 1;
*/

let lightDir;
let shadowMap;
let shadowShader;
let defaultShader;
let landscape;
let easycam;

function preload() {
    //shadowShader = readShader('depth_frag.glsl');
    //defaultShader = loadShader('shadow_vert.glsl', 'shadow_frag.glsl');
}

function setup() {
    createCanvas(600, 600, WEBGL);
    lightDir = createVector();
    landscape = 1;
    //initShadowPass();
    //initDefaultPass();

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

/*
function initShadowPass() {
    shadowMap = createGraphics(2048, 2048, WEBGL);
    shadowMap.noSmooth(); // Antialiasing on the shadowMap leads to weird artifacts
    //shadowMap.loadPixels(); // Will interfere with noSmooth() (probably a bug in Processing)
    //shadowMap.beginDraw();
    shadowMap.noStroke();
    shadowMap.shader(shadowShader);
    shadowMap.ortho(-200, 200, -200, 200, 10, 400); // Setup orthogonal view matrix for the directional light
    //shadowMap.endDraw();
}
*/

function draw() {
    //background(125);
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
    //background(0xff222222);
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
            //canvas.fill(0xffff5500);
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
            //canvas.fill(0xffff5500);
            canvas.fill('#FF5500');
            for (let n = 0; n < 20; ++n, angle += rotation) {
                canvas.push();
                canvas.translate(sin(angle) * 70, cos(angle * 4) * 10, cos(angle) * 70);
                canvas.box(10, 100, 10);
                canvas.pop();
            }
            //canvas.fill(0xff0055ff);
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

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    easycam.setViewport([0, 0, windowWidth, windowHeight]);
}

/*
void draw() {
    // Calculate the light direction (actually scaled by negative distance)
    float lightAngle = frameCount * 0.002;
    lightDir.set(sin(lightAngle) * 160, 160, cos(lightAngle) * 160);

    // Render shadow pass
    shadowMap.beginDraw();
    shadowMap.camera(lightDir.x, lightDir.y, lightDir.z, 0, 0, 0, 0, 1, 0);
    shadowMap.background(0xffffffff); // Will set the depth to 1.0 (maximum depth)
    renderLandscape(shadowMap);
    shadowMap.endDraw();
    shadowMap.updatePixels();

    // Update the shadow transformation matrix and send it, the light
    // direction normal and the shadow map to the default shader.
    updateDefaultShader();

    // Render default pass
    background(0xff222222);
    renderLandscape(g);

    // Render light source
    pushMatrix();
    fill(0xffffffff);
    translate(lightDir.x, lightDir.y, lightDir.z);
    box(5);
    popMatrix();
}

public void initShadowPass() {
    shadowMap = createGraphics(2048, 2048, P3D);
    String[] vertSource = {
        "uniform mat4 transform;",

        "attribute vec4 vertex;",

        "void main() {",
        "gl_Position = transform * vertex;",
        "}"
    };
    String[] fragSource = {

        // In the default shader we won't be able to access the shadowMap's depth anymore,
        // just the color, so this function will pack the 16bit depth float into the first
        // two 8bit channels of the rgba vector.
        "vec4 packDepth(float depth) {",
        "float depthFrac = fract(depth * 255.0);",
        "return vec4(depth - depthFrac / 255.0, depthFrac, 1.0, 1.0);",
        "}",

        "void main(void) {",
        "gl_FragColor = packDepth(gl_FragCoord.z);",
        "}"
    };
    shadowMap.noSmooth(); // Antialiasing on the shadowMap leads to weird artifacts
    //shadowMap.loadPixels(); // Will interfere with noSmooth() (probably a bug in Processing)
    shadowMap.beginDraw();
    shadowMap.noStroke();
    shadowMap.shader(new PShader(this, vertSource, fragSource));
    shadowMap.ortho(-200, 200, -200, 200, 10, 400); // Setup orthogonal view matrix for the directional light
    shadowMap.endDraw();
}

public void initDefaultPass() {
    String[] vertSource = {
        "uniform mat4 transform;",
        "uniform mat4 modelview;",
        "uniform mat3 normalMatrix;",
        "uniform mat4 shadowTransform;",
        "uniform vec3 lightDirection;",

        "attribute vec4 vertex;",
        "attribute vec4 color;",
        "attribute vec3 normal;",

        "varying vec4 vertColor;",
        "varying vec4 shadowCoord;",
        "varying float lightIntensity;",

        "void main() {",
        "vertColor = color;",
        "vec4 vertPosition = modelview * vertex;", // Get vertex position in model view space
        "vec3 vertNormal = normalize(normalMatrix * normal);", // Get normal direction in model view space
        "shadowCoord = shadowTransform * (vertPosition + vec4(vertNormal, 0.0));", // Normal bias removes the shadow acne
        "lightIntensity = 0.5 + dot(-lightDirection, vertNormal) * 0.5;",
        "gl_Position = transform * vertex;",
        "}"
    };
    String[] fragSource = {
        "#version 120",

        // Used a bigger poisson disk kernel than in the tutorial to get smoother results
        "const vec2 poissonDisk[9] = vec2[] (",
        "vec2(0.95581, -0.18159), vec2(0.50147, -0.35807), vec2(0.69607, 0.35559),",
        "vec2(-0.0036825, -0.59150), vec2(0.15930, 0.089750), vec2(-0.65031, 0.058189),",
        "vec2(0.11915, 0.78449), vec2(-0.34296, 0.51575), vec2(-0.60380, -0.41527)",
        ");",

        // Unpack the 16bit depth float from the first two 8bit channels of the rgba vector
        "float unpackDepth(vec4 color) {",
        "return color.r + color.g / 255.0;",
        "}",

        "uniform sampler2D shadowMap;",

        "varying vec4 vertColor;",
        "varying vec4 shadowCoord;",
        "varying float lightIntensity;",

        "void main(void) {",

        // Project shadow coords, needed for a perspective light matrix (spotlight)
        "vec3 shadowCoordProj = shadowCoord.xyz / shadowCoord.w;",

        // Only render shadow if fragment is facing the light
        "if(lightIntensity > 0.5) {",
        "float visibility = 9.0;",

        // I used step() instead of branching, should be much faster this way
        "for(int n = 0; n < 9; ++n)",
        "visibility += step(shadowCoordProj.z, unpackDepth(texture2D(shadowMap, shadowCoordProj.xy + poissonDisk[n] / 512.0)));",

        "gl_FragColor = vec4(vertColor.rgb * min(visibility * 0.05556, lightIntensity), vertColor.a);",
        "} else",
        "gl_FragColor = vec4(vertColor.rgb * lightIntensity, vertColor.a);",

        "}"
    };
    shader(defaultShader = new PShader(this, vertSource, fragSource));
    noStroke();
    perspective(60 * DEG_TO_RAD, (float)width / height, 10, 1000);
}

void updateDefaultShader() {

    // Bias matrix to move homogeneous shadowCoords into the UV texture space
    PMatrix3D shadowTransform = new PMatrix3D(
    0.5, 0.0, 0.0, 0.5,
    0.0, 0.5, 0.0, 0.5,
    0.0, 0.0, 0.5, 0.5,
    0.0, 0.0, 0.0, 1.0
);

    // Apply project modelview matrix from the shadow pass (light direction)
    shadowTransform.apply(((PGraphicsOpenGL)shadowMap).projmodelview);

    // Apply the inverted modelview matrix from the default pass to get the original vertex
    // positions inside the shader. This is needed because Processing is pre-multiplying
    // the vertices by the modelview matrix (for better performance).
    PMatrix3D modelviewInv = ((PGraphicsOpenGL)g).modelviewInv;
    shadowTransform.apply(modelviewInv);

    // Convert column-minor PMatrix to column-major GLMatrix and send it to the shader.
    // PShader.set(String, PMatrix3D) doesn't convert the matrix for some reason.
    defaultShader.set("shadowTransform", new PMatrix3D(
        shadowTransform.m00, shadowTransform.m10, shadowTransform.m20, shadowTransform.m30,
        shadowTransform.m01, shadowTransform.m11, shadowTransform.m21, shadowTransform.m31,
        shadowTransform.m02, shadowTransform.m12, shadowTransform.m22, shadowTransform.m32,
        shadowTransform.m03, shadowTransform.m13, shadowTransform.m23, shadowTransform.m33
    ));

    // Calculate light direction normal, which is the transpose of the inverse of the
    // modelview matrix and send it to the default shader.
    float lightNormalX = lightDir.x * modelviewInv.m00 + lightDir.y * modelviewInv.m10 + lightDir.z * modelviewInv.m20;
    float lightNormalY = lightDir.x * modelviewInv.m01 + lightDir.y * modelviewInv.m11 + lightDir.z * modelviewInv.m21;
    float lightNormalZ = lightDir.x * modelviewInv.m02 + lightDir.y * modelviewInv.m12 + lightDir.z * modelviewInv.m22;
    float normalLength = sqrt(lightNormalX * lightNormalX + lightNormalY * lightNormalY + lightNormalZ * lightNormalZ);
    defaultShader.set("lightDirection", lightNormalX / -normalLength, lightNormalY / -normalLength, lightNormalZ / -normalLength);

    // Send the shadowmap to the default shader
    defaultShader.set("shadowMap", shadowMap);

}

public void keyPressed() {
    if (key != CODED) {
        if (key >= '1' && key <= '3')
            landscape = key - '0';
        else if (key == 'd') {
            shadowMap.beginDraw(); shadowMap.ortho(-200, 200, -200, 200, 10, 400); shadowMap.endDraw();
        } else if (key == 's') {
            shadowMap.beginDraw(); shadowMap.perspective(60 * DEG_TO_RAD, 1, 10, 1000); shadowMap.endDraw();
        }
    }
}

public void renderLandscape(PGraphics canvas) {
    switch (landscape) {
        case 1: {
            float offset = -frameCount * 0.01;
            canvas.fill(0xffff5500);
            for (int z = -5; z < 6; ++z)
            for (int x = -5; x < 6; ++x) {
                canvas.pushMatrix();
                canvas.translate(x * 12, sin(offset + x) * 20 + cos(offset + z) * 20, z * 12);
                canvas.box(10, 100, 10);
                canvas.popMatrix();
            }
        } break;
        case 2: {
            float angle = -frameCount * 0.0015, rotation = TWO_PI / 20;
            canvas.fill(0xffff5500);
            for (int n = 0; n < 20; ++n, angle += rotation) {
                canvas.pushMatrix();
                canvas.translate(sin(angle) * 70, cos(angle * 4) * 10, cos(angle) * 70);
                canvas.box(10, 100, 10);
                canvas.popMatrix();
            }
            canvas.fill(0xff0055ff);
            canvas.sphere(50);
        } break;
        case 3: {
            float angle = -frameCount * 0.0015, rotation = TWO_PI / 20;
            canvas.fill(0xffff5500);
            for (int n = 0; n < 20; ++n, angle += rotation) {
                canvas.pushMatrix();
                canvas.translate(sin(angle) * 70, cos(angle) * 70, 0);
                canvas.box(10, 10, 100);
                canvas.popMatrix();
            }
            canvas.fill(0xff00ff55);
            canvas.sphere(50);
        }
    }
    canvas.fill(0xff222222);
    canvas.box(360, 5, 360);
}
*/