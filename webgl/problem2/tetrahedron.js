/* global mix normalize flatten vec4 subtract mult rotateY scalem translate setWorldAttributes */

// eslint-disable-next-line no-unused-vars
function Tetrahedron(gl, wireframeProgram, gouraudProgram, phongProgram) {

    // initial points for tetrahedron generation
    const va = vec4(0.0, 0.0, -1.0, 1);
    const vb = vec4(0.0, 0.942809, 0.333333, 1);
    const vc = vec4(-0.816497, -0.471405, 0.333333, 1);
    const vd = vec4(0.816497, -0.471405, 0.333333, 1);
    const color = vec4(1.0, 1.0, 1.0);

    const v1 = vec4( -0.5, -0.5,  0.5, 1.0 );
    const v2 = vec4( -0.5,  0.5,  0.5, 1.0 );
    const v3 = vec4(  0.5,  0.5,  0.5, 1.0 );
    const v4 = vec4(  0.5, -0.5,  0.5, 1.0 );
    const v5 = vec4( -0.5, -0.5, -0.5, 1.0 );
    const v6 = vec4( -0.5,  0.5, -0.5, 1.0 );
    const v7 = vec4(  0.5,  0.5, -0.5, 1.0 );
    const v8 = vec4(  0.5, -0.5, -0.5, 1.0 );

    const rotSpeed = 0.2;

    let theta = 0.0;
    let position = vec4(0.0, 0.0, 0.0);
    let nSubdivisions = 4;
    let pointsArray = [];
    let phongNormalsArray = [];
    let gouraudNormalsArray = [];
    let wireframeMode = 0;
    let shapeMode = true;
    let phongMode = false;

    // uses newell method to calculate normal vector for a given polygon
    function newell(p) {
        const U = subtract(p[1], p[0]);
        const V = subtract(p[2], p[1]);

        const Nx = (U[1] * V[2]) - (U[2] * V[1]);
        const Ny = (U[2] * V[0]) - (U[0] * V[2]);
        const Nz = (U[0] * V[1]) - (U[1] * V[0]);

        const N = vec4 (Nx, Ny, Nz);

        return N;
    }

    // given 3 input points, adds the triangle to the array and calls for normal calculations
    function triangle(a, b, c) {

        pointsArray.push(a);
        pointsArray.push(b);
        pointsArray.push(c);

        // use vertex normals for phong lighting
        phongNormalsArray.push(-a[0], -a[1], -a[2], 0.0);
        phongNormalsArray.push(-b[0], -b[1], -b[2], 0.0);
        phongNormalsArray.push(-c[0], -c[1], -c[2], 0.0);

        // use newell face normals for gouraud
        const n = newell([a, b, c]);
        gouraudNormalsArray.push(n[0], n[1], n[2], 0.0);
        gouraudNormalsArray.push(n[0], n[1], n[2], 0.0);
        gouraudNormalsArray.push(n[0], n[1], n[2], 0.0);
    }

    // recursive function to divide each triangle once for each subdivision level
    function divideTriangle(a, b, c, count) {
        if (count > 0) {
            var ab = mix(a, b, 0.5);
            var ac = mix(a, c, 0.5);
            var bc = mix(b, c, 0.5);

            ab = normalize(ab, true);
            ac = normalize(ac, true);
            bc = normalize(bc, true);

            divideTriangle(a, ab, ac, count - 1);
            divideTriangle(ab, b, bc, count - 1);
            divideTriangle(bc, c, ac, count - 1);
            divideTriangle(ab, bc, ac, count - 1);
        }
        else {
            triangle(a, b, c);
        }
    }

    // initializes 3d object as a tetrahedron with 4 triangles
    function tetrahedron(a, b, c, d, n) {
        divideTriangle(a, b, c, n);
        divideTriangle(d, c, b, n);
        divideTriangle(a, d, b, n);
        divideTriangle(a, c, d, n);
    }

    function quad(a, b, c, d, n) {
        divideTriangle(a, c, b, n);
        divideTriangle(a, d, c, n);
    }

    function cube () {
        quad(v1, v2, v3, v4, nSubdivisions);
        quad(v2, v1, v5, v6, nSubdivisions);
        quad(v8, v7, v6, v5, nSubdivisions);
        quad(v4, v3, v7, v8, nSubdivisions);
        quad(v3, v2, v6, v7, nSubdivisions);
        quad(v1, v4, v8, v5, nSubdivisions);
    }

    // initializes scene and calls for a tetrahedron to be generated
    function setup() {
        pointsArray = [];
        phongNormalsArray = [];
        gouraudNormalsArray = [];
        if (shapeMode) {
            tetrahedron(va, vb, vc, vd, nSubdivisions);
        } else {
            cube();
        }
    }
    setup();

    // updates subdivision level based on user input
    this.setSubdivisions = function (n) {
        nSubdivisions = n;
        setup();
    };

    // toggles wireframe mode based on user input
    this.setWireframeMode = function (mode) {
        wireframeMode = mode;
    };

    // switches between phong and gouraud based on user input
    this.setPhongMode = function (mode) {
        phongMode = mode;
    };

    // updates object position as its progress along the path
    this.setPosition = function (p) {
        position = p;
    };

    this.switchShape = function () {
        shapeMode = !shapeMode;
        setup();
    };

    // base render function for tetrahedron, decides which specific function to use based on current render mode
    this.render = function () {
        if (wireframeMode == 2) {
            wireframeRender();
        } else if (wireframeMode == 1) {
            if (phongMode) {
                phongRender();
                wireframeRender();
            }
            else {
                gouraudRender();
                wireframeRender();
            }
        } else if (phongMode) {
            phongRender();
        }
        else {
            gouraudRender();
        }
    };

    // render function for gouraud mode
    function gouraudRender() {
        const program = gouraudProgram;
        setWorldAttributes(program);

        const vBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

        const vPosition = gl.getAttribLocation(program, 'vPosition');
        gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);

        const vNormalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vNormalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(gouraudNormalsArray), gl.STATIC_DRAW);

        const vNormal = gl.getAttribLocation(program, 'vNormal');
        gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vNormal);

        const modelMatrix = mult(mult(translate(position[0], position[1], position[2]), rotateY(theta)), scalem(2.0, 2.0, 2.0));
        theta += rotSpeed;

        const uModelMatrix = gl.getUniformLocation(program, 'modelMatrix');
        gl.uniformMatrix4fv(uModelMatrix, false, flatten(modelMatrix));

        for (var i = 0; i < pointsArray.length; i += 3) {
            gl.drawArrays(gl.TRIANGLES, i, 3);
        }
    }

    // render function for phong mode
    function phongRender() {
        const program = phongProgram;
        setWorldAttributes(program);

        const vBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

        const vPosition = gl.getAttribLocation(program, 'vPosition');
        gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);

        const vNormalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vNormalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(phongNormalsArray), gl.STATIC_DRAW);

        const vNormal = gl.getAttribLocation(program, 'vNormal');
        gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vNormal);

        const modelMatrix = mult(mult(translate(position[0], position[1], position[2]), rotateY(theta)), scalem(2.0, 2.0, 2.0));
        theta += rotSpeed;

        const uModelMatrix = gl.getUniformLocation(program, 'modelMatrix');
        gl.uniformMatrix4fv(uModelMatrix, false, flatten(modelMatrix));

        for (var i = 0; i < pointsArray.length; i += 3) {
            gl.drawArrays(gl.TRIANGLES, i, 3);
        }
    }

    // render function for wireframe mode
    function wireframeRender() {
        const program = wireframeProgram;
        setWorldAttributes(program);

        const vPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vPositionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

        const vPosition = gl.getAttribLocation(program, 'vPosition');
        gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);

        const uColor = gl.getUniformLocation(program, 'uColor');
        gl.uniform4fv(uColor, flatten(color));

        const modelMatrix = mult(mult(translate(position[0], position[1], position[2]), rotateY(theta)), scalem(2.0, 2.0, 2.0));
        theta += rotSpeed;

        const uModelMatrix = gl.getUniformLocation(program, 'modelMatrix');
        gl.uniformMatrix4fv(uModelMatrix, false, flatten(modelMatrix));

        for (var i = 0; i < pointsArray.length; i += 3) {
            gl.drawArrays(gl.LINE_LOOP, i, 3);
        }
    }
}
