//
//  initShaders.js
//

// eslint-disable-next-line no-unused-vars
function initShaders(gl, vertexShaderId, fragmentShaderId) {
    let vertShdr;
    let fragShdr;

    const vertElem = document.getElementById(vertexShaderId);
    if (!vertElem) {
        alert('Unable to load vertex shader ' + vertexShaderId);
        return -1;
    }
    else {
        vertShdr = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertShdr, vertElem.text);
        gl.compileShader(vertShdr);
        if (!gl.getShaderParameter(vertShdr, gl.COMPILE_STATUS)) {
            const msg = 'Vertex shader failed to compile.  The error log is:'
                + '<pre>' + gl.getShaderInfoLog(vertShdr) + '</pre>';
            alert(msg);
            return -1;
        }
    }

    const fragElem = document.getElementById(fragmentShaderId);
    if (!fragElem) {
        alert('Unable to load vertex shader ' + fragmentShaderId);
        return -1;
    }
    else {
        fragShdr = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragShdr, fragElem.text);
        gl.compileShader(fragShdr);
        if (!gl.getShaderParameter(fragShdr, gl.COMPILE_STATUS)) {
            const msg = 'Fragment shader failed to compile.  The error log is:'
                + '<pre>' + gl.getShaderInfoLog(fragShdr) + '</pre>';
            alert(msg);
            return -1;
        }
    }

    const program = gl.createProgram();
    gl.attachShader(program, vertShdr);
    gl.attachShader(program, fragShdr);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        var msg = 'Shader program failed to link.  The error log is:'
            + '<pre>' + gl.getProgramInfoLog(program) + '</pre>';
        alert(msg);
        return -1;
    }

    return program;
}

/*
// Get a file as a string using  AJAX
function loadFileAJAX(name) {
    var xhr = new XMLHttpRequest(),
        okStatus = document.location.protocol === "file:" ? 0 : 200;
    xhr.open('GET', name, false);
    xhr.send(null);
    return xhr.status == okStatus ? xhr.responseText : null;
};


function initShadersFromFiles(gl, vShaderName, fShaderName) {
    function getShader(gl, shaderName, type) {
        var shader = gl.createShader(type),
            shaderScript = loadFileAJAX(shaderName);
        if (!shaderScript) {
            alert("Could not find shader source: "+shaderName);
        }
        gl.shaderSource(shader, shaderScript);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert(gl.getShaderInfoLog(shader));
            return null;
        }
        return shader;
    }
    var vertexShader = getShader(gl, vShaderName, gl.VERTEX_SHADER),
        fragmentShader = getShader(gl, fShaderName, gl.FRAGMENT_SHADER),
        program = gl.createProgram();

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
        return null;
    }


    return program;
};
*/
