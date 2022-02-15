/* global mix  flatten vec4  translate setWorldAttributes */

// eslint-disable-next-line no-unused-vars
function Path(gl, program) {

    const path = [];
    // default points for the path
    path.push(vec4(-8.0, 8.0, 0.0));
    path.push(vec4(2.0, 4.0, 0.0));
    path.push(vec4(6.0, 6.0, 0.0));
    path.push(vec4(10.0, -8.0, 0.0));
    path.push(vec4(2.0, -2.0, 0.0));
    path.push(vec4(-6.0, -2.0, 0.0));

    const color = vec4(1, 1, 1);

    let nSubdivisions = 0;
    let pointsArray = [];

    // subdivides path n times using chaikin algorithm
    function chaikin(points, n) {
        if (n <= 0) {
            return points;
        }

        const newPoints = [];

        for (let i = 0; i < points.length; i++) {
            const a = points[i];
            const b = points[(i + 1) % points.length];
            newPoints.push(mix(a, b, 0.25));
            newPoints.push(mix(a, b, 0.75));
        }

        return chaikin(newPoints, n - 1);
    }

    // initializes and updates path
    function setup() {
        pointsArray = chaikin(path, nSubdivisions);
    }

    // updates number of subdivisions and runs setup again
    this.setSubdivisions = function (n) {
        nSubdivisions = n;
        setup();
    };

    // given a position as a percentage of distance along the path, returns the corresponding point in world space
    this.getPoint = function (pos) {
        const x = pointsArray.length * pos;
        const i = Math.trunc(x);
        const a = pointsArray[i];
        const b = pointsArray[(i + 1) % pointsArray.length];
        return mix(a, b, (x - i));
    };

    setup();

    this.render = function () {
        setWorldAttributes(program);
        const vBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

        const vPosition = gl.getAttribLocation(program, 'vPosition');
        gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);

        const uColor = gl.getUniformLocation(program, 'uColor');
        gl.uniform4fv(uColor, flatten(color));

        const modelMatrix = translate(0, 0, 0);

        const uModelMatrix = gl.getUniformLocation(program, 'modelMatrix');
        gl.uniformMatrix4fv(uModelMatrix, false, flatten(modelMatrix));

        gl.drawArrays(gl.LINE_LOOP, 0, pointsArray.length);
    };

}
