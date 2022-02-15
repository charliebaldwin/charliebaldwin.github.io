/* global WebGLUtils vec4 initShaders flatten perspective Tetrahedron Path lookAt vec3 mult */

// PROJECT 02
// CS 4731
// Charlie Baldwin

// Note: I changed some of the input keys to a setup I found to be more intuitive. The controls are listed on the HTML page

// Additional included features:
// * Instead of just being a toggle, pressing W cycles between shaded, shaded + wireframe, and wireframe only
// * press F to aim camera towards object, allowing you to get a better view of it
// * Press D to swap between culling front and back faces
// * Press R to swap between using a tetrahedron or a cube as the base shape. This code was designed working with a tetra. so it will
//           work better in that mode.

let gl;
let gouraudProgram, phongProgram, wireframeProgram;
let viewMatrix, projectionMatrix;

let frontMode = false;
let followMode = false;

// canvas size
let canvasWidth = 400;
let canvasHeight = 400;

let tetrahedron = null;
let tetrahedronDivisions = 4;
let tetraWireframe = false;
let tetraPhongMode = false;

let path = null;
let pathDivisions = 0;

let animationEnabled = true;
let animationPosition = 0.0;

const eye = vec3(0, 0, 20.0);
const tooClose = vec3(0, 0, 5.0);
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);
const fov = 50;

const bgColor = vec4(0, 0, 0, 1);

const lightPosition = vec4(30.0, 10.0, 10.0, 0.0);
const lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
const lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
const lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

const materialAmbient = vec4(1.0, 0.0, 1.0, 1.0);
const materialDiffuse = vec4(1.0, 0.8, 0.0, 1.0);
const materialSpecular = vec4(1.0, 1.0, 1.0, 1.0);
const materialShininess = 20.0;

// eslint-disable-next-line no-unused-vars
function main() {
    // Retrieve <canvas> element
    const canvas = document.getElementById('webgl');
    canvasWidth = canvas.clientWidth;
    canvasHeight = canvas.clientHeight;

    // Get the rendering context for WebGL
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    // Initialize shaders and programs
    gouraudProgram = initShaders(gl, 'gouraud-vertex-shader', 'plain-fragment-shader');
    phongProgram = initShaders(gl, 'phong-vertex-shader', 'phong-fragment-shader');
    wireframeProgram = initShaders(gl, 'wireframe-vertex-shader', 'plain-fragment-shader');

    // Set up the viewport
    gl.viewport(0, 0, canvasWidth, canvasHeight);
    gl.clearColor(bgColor[0], bgColor[1], bgColor[2], bgColor[3]);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    // Initialize path
    path = new Path(gl, wireframeProgram);
    path.setSubdivisions(pathDivisions);

    // Initialize geometry
    tetrahedron = new Tetrahedron(gl, wireframeProgram, gouraudProgram, phongProgram);
    tetrahedron.setPosition(path.getPoint(animationPosition));
    tetrahedron.setSubdivisions(tetrahedronDivisions);
    tetrahedron.setWireframeMode(tetraWireframe);

    render();

    // Updates title tagline to display which rendering mode is currently active
    function setTitle() {
        let s = '';
        if (tetraWireframe == 2) {
            s = '(Wireframe)';
        } else if (tetraWireframe == 1) {
            if (tetraPhongMode) {
                s = '(Phong + WF)';
            }
            else {
                s = '(Gouraud + WF)';
            }
        } else if (tetraPhongMode) {
            s = '(Phong)';
        }
        else {
            s = '(Gouraud)';
        }
        document.getElementById('mode').innerHTML = s;
    }
    setTitle();

    // Input handlers
    window.onkeypress = function (event) {
        var key = event.key;
        switch (key) {
            case 'e': // more tetra subdivisions
                tetrahedronDivisions += 1;
                tetrahedron.setSubdivisions(tetrahedronDivisions);
                break;
            case 'q': // fewer tetra subdivisions
                tetrahedronDivisions = Math.max(0, tetrahedronDivisions - 1);
                tetrahedron.setSubdivisions(tetrahedronDivisions);
                break;
            case 'w': // toggle wireframe mode
                tetraWireframe += 1;
                if (tetraWireframe > 2) {
                    tetraWireframe = 0;
                }
                tetrahedron.setWireframeMode(tetraWireframe);
                setTitle();
                break;
            case 's': // change shading mode
                tetraPhongMode = !tetraPhongMode;
                tetrahedron.setPhongMode(tetraPhongMode);
                setTitle();
                break;
            case 'a': // toggle path animation
                animationEnabled = !animationEnabled;
                break;
            case 'i': // more path subdivisions
                pathDivisions += 1;
                path.setSubdivisions(pathDivisions);
                break;
            case 'j': // fewer path subdivisions
                pathDivisions = Math.max(0, pathDivisions - 1);
                path.setSubdivisions(pathDivisions);
                break;
            case 'd': // flip culling modes
                frontMode = !frontMode;
                break;
            case 'f': // camera tracks object
                followMode = !followMode;
                break;
            case 'r':
                tetrahedron.switchShape();
                break;
        }
    };
}

// basic render function, used to update path motion, and call object-specific render functions
function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // when animation is enabled, move the object alonng the path
    if (animationEnabled) {
        animationPosition = (animationPosition + 0.001) % 1.0;
        tetrahedron.setPosition(path.getPoint(animationPosition));
    }

    path.render(); // in path.js
    tetrahedron.render();  // in tetrahedron.js

    requestAnimationFrame(render);
}

// helper function to update various world properties & matrices based on inputs, called from inside tetrahedron.js
// eslint-disable-next-line no-unused-vars
function setWorldAttributes(program) {
    gl.useProgram(program);
    gl.enable(gl.CULL_FACE);
    if (!frontMode) {
        gl.cullFace(gl.BACK);
    } else {
        gl.cullFace(gl.FRONT);
    }

    // switches camera between sitting at the default position and pointing towards object
    if (followMode) {
        viewMatrix = lookAt(tooClose, vec3(path.getPoint(animationPosition)), up);
    }
    else {
        viewMatrix = lookAt(eye, at, up);
    }

    projectionMatrix = perspective(fov, (canvasWidth / canvasHeight), 0.1, 40);

    const uViewMatrix = gl.getUniformLocation(program, 'viewMatrix');
    gl.uniformMatrix4fv(uViewMatrix, false, flatten(viewMatrix));

    const uProjectionMatrix = gl.getUniformLocation(program, 'projectionMatrix');
    gl.uniformMatrix4fv(uProjectionMatrix, false, flatten(projectionMatrix));

    const diffuseProduct = mult(lightDiffuse, materialDiffuse);
    const specularProduct = mult(lightSpecular, materialSpecular);
    const ambientProduct = mult(lightAmbient, materialAmbient);

    gl.uniform4fv(gl.getUniformLocation(program, 'diffuseProduct'), flatten(diffuseProduct));
    gl.uniform4fv(gl.getUniformLocation(program, 'specularProduct'), flatten(specularProduct));
    gl.uniform4fv(gl.getUniformLocation(program, 'ambientProduct'), flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, 'lightPosition'), flatten(lightPosition));
    gl.uniform1f(gl.getUniformLocation(program, 'shininess'), materialShininess);
}
