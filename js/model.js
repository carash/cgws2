/**
File horse.js memodelkan sebuah kuda primitif, model dikendalikan dengan 3 slider yang mengatur rotasi kamera, sudut paha atas, dan sudut paha bawah.
Pengaturan sudut suhu atas akan berpengaruh pada paha bawah dan sebaliknya.

Dibuat oleh Tjokorde Gde Agung Octavio Putra & Achmad Firdaus
**/

"use strict";

var canvas, gl, program, shadowProgram, fbo;

var NumVertices = 36; //(6 faces)(2 triangles/face)(3 vertices/triangle)

var metal = new Image();
metal.src = "./img/metal.jpg"

var stone = new Image();
stone.src = "./img/stone.jpg"

var wood = new Image();
wood.src = "./img/wood.png"

var black = new Image();
black.src = "./img/black.jpg"

var points = [];
var colors = [];
var normals = [];
var numChecks = 32;
var texSize = 64;

var wireframe = document.getElementsByName('wireframe');

var lightPosition = vec4(0.0, 0.0, 12.0, 0.0);
var lightAmbient = vec4(0.3, 0.3, 0.3, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

var materialAmbient = vec4(1.0, 0.0, 1.0, 1.0);
var materialDiffuse = vec4(1.0, 0.8, 0.0, 1.0);
var materialSpecular = vec4(1.0, 0.8, 0.0, 1.0);
var materialShininess = 100.0;

var ctm;
var ambientColor, diffuseColor, specularColor;
var viewerPos;

var isForward;
var isOn = 1;
var isLightMove = true;

var vertices = [
    vec4(-0.5, -0.5, 0.5, 1.0),
    vec4(-0.5, 0.5, 0.5, 1.0),
    vec4(0.5, 0.5, 0.5, 1.0),
    vec4(0.5, -0.5, 0.5, 1.0),
    vec4(-0.5, -0.5, -0.5, 1.0),
    vec4(-0.5, 0.5, -0.5, 1.0),
    vec4(0.5, 0.5, -0.5, 1.0),
    vec4(0.5, -0.5, -0.5, 1.0)
];

var texCoordsArray = [];

var texCoord = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 0)
];

// RGBA colors
var vertexColors = [
    vec4(1.0, 1.0, 1.0, 1.0), // black
    vec4(1.0, 1.0, 1.0, 1.0), // red
    vec4(1.0, 1.0, 1.0, 1.0), // yellow
    vec4(1.0, 1.0, 1.0, 1.0), // green
    vec4(1.0, 1.0, 1.0, 1.0), // blue
    vec4(1.0, 1.0, 1.0, 1.0), // magenta
    vec4(1.0, 1.0, 1.0, 1.0), // white
    vec4(1.0, 1.0, 1.0, 1.0) // cyan
];

// Create a checkerboard pattern using floats


var image1 = new Array()
for (var i = 0; i < texSize; i++) image1[i] = new Array();
for (var i = 0; i < texSize; i++)
    for (var j = 0; j < texSize; j++)
        image1[i][j] = new Float32Array(4);
for (var i = 0; i < texSize; i++)
    for (var j = 0; j < texSize; j++) {
        var c = (((i & 0x8) == 0) ^ ((j & 0x8) == 0));
        image1[i][j] = [c, c, c, 1];
    }

// Convert floats to ubytes for texture

var image2 = new Uint8Array(4 * texSize * texSize);

for (var i = 0; i < texSize; i++)
    for (var j = 0; j < texSize; j++)
        for (var k = 0; k < 4; k++)
            image2[4 * texSize * i + 4 * j + k] = 255 * image1[i][j][k];

var image3 = new Uint8Array(4 * texSize * texSize);

for (var i = 0; i < texSize; i++) {
    for (var j = 0; j < texSize; j++) {
        var patchx = Math.floor(i / (texSize / numChecks));
        if (patchx % 2) c = 255;
        else c = 0;
        image3[4 * i * texSize + 4 * j] = c;
        image3[4 * i * texSize + 4 * j + 1] = c;
        image3[4 * i * texSize + 4 * j + 2] = c;
        image3[4 * i * texSize + 4 * j + 3] = 255;
    }
}

var image4 = new Uint8Array(4 * texSize * texSize);

// Create a checkerboard pattern
for (var i = 0; i < texSize; i++) {
    for (var j = 0; j < texSize; j++) {
        var patchy = Math.floor(j / (texSize / numChecks));
        if (patchy % 2) c = 255;
        else c = 0;
        image4[4 * i * texSize + 4 * j] = c;
        image4[4 * i * texSize + 4 * j + 1] = c;
        image4[4 * i * texSize + 4 * j + 2] = c;
        image4[4 * i * texSize + 4 * j + 3] = 255;
    }
}

var image5 = new Uint8Array(4 * texSize * texSize);

for (var i = 0; i < texSize; i++) {
    for (var j = 0; j < texSize; j++) {
        var patchx = Math.floor(i / (texSize / numChecks));
        var patchy = Math.floor(j / (texSize / numChecks));
        if (patchx % 2 ^ patchy % 2) c = 255;
        else c = 0;
        //c = 255*(((i & 0x8) == 0) ^ ((j & 0x8)  == 0))
        image5[4 * i * texSize + 4 * j] = c;
        image5[4 * i * texSize + 4 * j + 1] = c;
        image5[4 * i * texSize + 4 * j + 2] = c;
        image5[4 * i * texSize + 4 * j + 3] = 255;
    }
}

var image6 = new Uint8Array(4 * texSize * texSize);

// Create a checkerboard pattern
for (var i = 0; i < texSize; i++) {
    for (var j = 0; j < texSize; j++) {
        image6[4 * i * texSize + 4 * j] = 127 + 127 * Math.sin(0.1 * i * j);
        image6[4 * i * texSize + 4 * j + 1] = 127 + 127 * Math.sin(0.1 * i * j);
        image6[4 * i * texSize + 4 * j + 2] = 127 + 127 * Math.sin(0.1 * i * j);
        image6[4 * i * texSize + 4 * j + 3] = 255;
    }
}

var horse = {
    render: renderModel,
    base: {
        width: 5.0,
        height: 2.0
    },
    upperArm: {
        width: 0.5,
        height: 5.0
    },
    lowerArm: {
        height: 5.0,
        width: 0.5
    },
    pos: [0.0, 0.0, 0.0],
    rot: [0.0, 0.0, 0.0]
};

var wall = {
    base: {
        width: 5.0,
        height: 20.0
    },
    pos: [0.0, 0.0, 0.0],
    rot: [0.0, 0.0, 0.0]
};

var calcMat = function() {
    // var mat = translate(0, 0, 0);
    // var par = [this.offsetMat];
    // var curr = this.parent;
    //
    // while (curr) {
    //     par.push(curr.offsetMat);
    //     curr = curr.parent;
    // }
    //
    // par.reverse()
    // par.forEach(function(m) {
    //     mat = mult(mat, m);
    // });
    //
    // return mat

    if (this.parent == null) {
        return this.offsetMat;
    }
    return mult(this.parent.resultMat, this.offsetMat)
}

var clawMachine = {}

clawMachine.upperArm = {
    parent: null,
    defaultMat: mult(translate(0.0, 5.0, 0.0), rotate(180, 0, 0, 90)),
    resultMat: mult(translate(0.0, 5.0, 0.0), rotate(180, 0, 0, 90)),
    offsetMat: mult(translate(0.0, 5.0, 0.0), rotate(180, 0, 0, 90)),
    width: 1.0,
    height: 3.0,
    calculateMat: calcMat,
};

clawMachine.lowerArm = {
    parent: clawMachine.upperArm,
    defaultMat: translate(0.0, 1.5, 0.0),
    resultMat: translate(0.0, 1.5, 0.0),
    offsetMat: translate(0.0, 1.5, 0.0),
    width: 0.7,
    height: 5.5,
    calculateMat: calcMat,
};

clawMachine.clawBase = {
    parent: clawMachine.lowerArm,
    defaultMat: translate(0.0, 5.5, 0.0),
    resultMat: translate(0.0, 5.5, 0.0),
    offsetMat: translate(0.0, 5.5, 0.0),
    width: 2.3,
    height: 1.0,
    calculateMat: calcMat,
};

clawMachine.upperClaw1 = {
    parent: clawMachine.clawBase,
    defaultMat: mult(translate(0.6, 1.0, 0.0), rotate(-45, 0, 0, 90)),
    resultMat: mult(translate(0.6, 1.0, 0.0), rotate(-45, 0, 0, 90)),
    offsetMat: mult(translate(0.6, 1.0, 0.0), rotate(-45, 0, 0, 90)),
    width: 0.4,
    height: 1.5,
    calculateMat: calcMat,
};

clawMachine.lowerClaw1 = {
    parent: clawMachine.upperClaw1,
    defaultMat: mult(translate(0.0, 1.5, 0.0), rotate(60, 0, 0, 90)),
    resultMat: mult(translate(0.0, 1.5, 0.0), rotate(60, 0, 0, 90)),
    offsetMat: mult(translate(0.0, 1.5, 0.0), rotate(60, 0, 0, 90)),
    width: 0.3,
    height: 1.5,
    calculateMat: calcMat,
};

clawMachine.upperClaw2 = {
    parent: clawMachine.clawBase,
    defaultMat: mult(mult(translate(-0.3, 1.0, 0.5), rotate(-120, 0, 90, 0)), rotate(-45, 0, 0, 90)),
    resultMat: mult(mult(translate(-0.3, 1.0, 0.5), rotate(-120, 0, 90, 0)), rotate(-45, 0, 0, 90)),
    offsetMat: mult(mult(translate(-0.3, 1.0, 0.5), rotate(-120, 0, 90, 0)), rotate(-45, 0, 0, 90)),
    width: 0.4,
    height: 1.5,
    calculateMat: calcMat,
};

clawMachine.lowerClaw2 = {
    parent: clawMachine.upperClaw2,
    defaultMat: mult(translate(0.0, 1.5, 0.0), rotate(60, 0, 0, 90)),
    resultMat: mult(translate(0.0, 1.5, 0.0), rotate(60, 0, 0, 90)),
    offsetMat: mult(translate(0.0, 1.5, 0.0), rotate(60, 0, 0, 90)),
    width: 0.3,
    height: 1.5,
    calculateMat: calcMat,
};

clawMachine.upperClaw3 = {
    parent: clawMachine.clawBase,
    defaultMat: mult(mult(translate(-0.3, 1.0, -0.5), rotate(120, 0, 90, 0)), rotate(-45, 0, 0, 90)),
    resultMat: mult(mult(translate(-0.3, 1.0, -0.5), rotate(120, 0, 90, 0)), rotate(-45, 0, 0, 90)),
    offsetMat: mult(mult(translate(-0.3, 1.0, -0.5), rotate(120, 0, 90, 0)), rotate(-45, 0, 0, 90)),
    width: 0.4,
    height: 1.5,
    calculateMat: calcMat,
};

clawMachine.lowerClaw3 = {
    parent: clawMachine.upperClaw3,
    defaultMat: mult(translate(0.0, 1.5, 0.0), rotate(60, 0, 0, 90)),
    resultMat: mult(translate(0.0, 1.5, 0.0), rotate(60, 0, 0, 90)),
    offsetMat: mult(translate(0.0, 1.5, 0.0), rotate(60, 0, 0, 90)),
    width: 0.3,
    height: 1.5,
    calculateMat: calcMat,
};

// Parameters controlling the size of the Robot's arm

var BASE_HEIGHT = 3.0;
var BASE_WIDTH = 8.0;
var LOWER_ARM_HEIGHT = 4.0;
var LOWER_ARM_WIDTH = 0.5;
var UPPER_ARM_HEIGHT = 3.0;
var UPPER_ARM_WIDTH = 0.8;
var WALL_WIDTH = 1.0;
var WALL_HEIGHT = 40.0;

// Shader transformation matrices

var modelViewMatrix, projectionMatrix, wallviewMatrix;
var viewProjMatrixFromLight, mvpMatrixFromLight, shadowMap;

// Array of rotation angles (in degrees) for each rotation axis

var Base = 0;
var LowerArm = 1;
var UpperArm = 2;


var theta = [0, 0, 0];
var anim = 0;
var animSign = 1;
var stop = 0;
var demo = true;

var angle = 0;

var modelViewMatrixLoc;
var normalMatrix;

var vBuffer, cBuffer;

//----------------------------------------------------------------------------

function requestCORSIfNotSameOrigin(img, url) {
    if ((new URL(url)).origin !== window.location.origin) {
        img.crossOrigin = "";
    }
}

//----------------------------------------------------------------------------

var texture;

function configureTexture(image) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    requestCORSIfNotSameOrigin(image, image.src);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
}
//----------------------------------------------------------------------------

function quad(a, b, c, d) {
    var t1 = subtract(vertices[b], vertices[a]);
    var t2 = subtract(vertices[c], vertices[b]);
    var normal = cross(t1, t2);
    var normal = vec3(normal);
    colors.push(vertexColors[a]);
    points.push(vertices[a]);
    normals.push(normal)
    texCoordsArray.push(texCoord[0]);

    colors.push(vertexColors[a]);
    points.push(vertices[b]);
    normals.push(normal)
    texCoordsArray.push(texCoord[1]);

    colors.push(vertexColors[a]);
    points.push(vertices[c]);
    normals.push(normal)
    texCoordsArray.push(texCoord[2]);

    colors.push(vertexColors[a]);
    points.push(vertices[a]);
    normals.push(normal)
    texCoordsArray.push(texCoord[0]);

    colors.push(vertexColors[a]);
    points.push(vertices[c]);
    normals.push(normal)
    texCoordsArray.push(texCoord[2]);

    colors.push(vertexColors[a]);
    points.push(vertices[d]);
    normals.push(normal)
    texCoordsArray.push(texCoord[3]);
}


function colorCube() {
    quad(1, 0, 3, 2);
    quad(2, 3, 7, 6);
    quad(3, 0, 4, 7);
    quad(6, 5, 1, 2);
    quad(4, 5, 6, 7);
    quad(5, 4, 0, 1);
}

//____________________________________________

// Remmove when scale in MV.js supports scale matrices

function scale4(a, b, c) {
    var result = mat4();
    result[0][0] = a;
    result[1][1] = b;
    result[2][2] = c;
    return result;
}

var clawData = {
    posx: 0,
    posz: 0,
    extend: -1.5,
    baseraise: 0,
    baserot: 0,
    clawangle: 0,
    clawgrip: 0,
};

var vx = 0;
var vz = 0;
var extend = 0;
var basey = 0;
var basez = 0;
var clawopen = 0;

//--------------------------------------------------


window.onload = function init() {

    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }

    gl.viewport(0, 0, canvas.width, canvas.height);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    shadowProgram = initShaders(gl, "shadow-vertex-shader", "shadow-fragment-shader");
    shadowProgram.a_Position = gl.getAttribLocation(shadowProgram, 'a_Position');
    shadowProgram.u_MvpMatrix = gl.getUniformLocation(shadowProgram, 'u_MvpMatrix');
    if (shadowProgram.a_Position < 0 || !shadowProgram.u_MvpMatrix) {
        console.log('Failed to get the storage location of attribute or uniform variable from shadowProgram');
        return;
    }

    // Initialize framebuffer object (FBO)
    fbo = initFramebufferObject(gl);
    if (!fbo) {
        console.log('Failed to initialize frame buffer object');
        return;
    }
    gl.activeTexture(gl.TEXTURE0); // Set a texture object to the texture unit
    gl.bindTexture(gl.TEXTURE_2D, fbo.texture);


    viewProjMatrixFromLight = new mat4(); // Prepare a view projection matrix for generating a shadow map
    viewProjMatrixFromLight = perspective(5.0, 1.0, 1.0, 100.0);
    viewProjMatrixFromLight = mult(viewProjMatrixFromLight, lookAt(new vec3(lightPosition[0], lightPosition[1], lightPosition[2]), new vec3(0.0, 0.0, 0.0), new vec3(0.0, 1.0, 0.0)));

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders(gl, "vertex-shader", "fragment-shader");

    gl.useProgram(program);

    colorCube();

    // Create and initialize  buffer objects

    // normals
    var nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW);

    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);

    //colors
    cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    // positions
    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    //textures
    var tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW);

    var vTexCoord = gl.getAttribLocation(program, "vTexCoord");
    gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vTexCoord);


    // shades
    viewerPos = vec3(0.0, 0.0, -20.0);

    var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);

    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
        flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
        flatten(diffuseProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"),
        flatten(specularProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"),
        flatten(lightPosition));

    gl.uniform1f(gl.getUniformLocation(program,
        "shininess"), materialShininess);

    texture = gl.createTexture();

    document.getElementById("stop").onclick = function(event) {
        demo = false;
        stop = 1;
        vx = 0;
        vz = 0;
        extend = -1;
        basey = 0;
        basez = 0;
        clawopen = -1;

        document.getElementById("stop").disabled = true;
        document.getElementById("demo").disabled = false;
    }

    document.getElementById("demo").onclick = function(event) {
        stop = 0;
        demo = true;
        document.getElementById("stop").disabled = false;
        document.getElementById("demo").disabled = true;
    }

    document.getElementById("stop-l").onclick = function(event) {
        isLightMove = !isLightMove;
    }

    document.onkeydown = function(event) {
        if (demo) return;
        switch (event.key) {
            case "Enter":
                extend = 1;
                break;
            case "ArrowLeft":
                vx = 1;
                break;
            case "ArrowRight":
                vx = -1;
                break;
            case "ArrowUp":
                vz = 1;
                break;
            case "ArrowDown":
                vz = -1;
                break;
            case "q":
                clawopen = 1;
                break;
            case "a":
                basez = 1;
                break;
            case "d":
                basez = -1;
                break;
            case "w":
                basey = 1;
                break;
            case "s":
                basey = -1;
                break;
        }
    }

    document.onkeyup = function(event) {
        if (demo) return;
        switch (event.key) {
            case "Enter":
                extend = -1;
                break;
            case "ArrowLeft":
                vx = 0;
                break;
            case "ArrowRight":
                vx = 0;
                break;
            case "ArrowUp":
                vz = 0;
                break;
            case "ArrowDown":
                vz = 0;
                break;
            case "q":
                clawopen = -1;
                break;
            case "a":
                basez = 0;
                break;
            case "d":
                basez = 0;
                break;
            case "w":
                basey = 0;
                break;
            case "s":
                basey = 0;
                break;
        }
    }

    document.getElementById("slider1").onchange = function(event) {
        theta[0] = event.target.value;
    };
    document.getElementById("slider2").onchange = function(event) {
        theta[1] = event.target.value;
    };
    document.getElementById("slider3").onchange = function(event) {
        theta[2] = event.target.value;
    };

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    normalMatrix = gl.getUniformLocation(program, "normalMatrix");

    projectionMatrix = perspective(70.0, 1.0, 1.0, 100.0);
    projectionMatrix = mult(projectionMatrix, lookAt(new vec3(0, 0, 20), new vec3(0.0, 0.0, 0.0), new vec3(0.0, 1.0, 0.0)));

    gl.uniformMatrix4fv(gl.getUniformLocation(program, "projectionMatrix"), false, flatten(projectionMatrix));

    mvpMatrixFromLight = gl.getUniformLocation(program, 'u_MvpMatrixFromLight');
    shadowMap = gl.getUniformLocation(program, 'u_ShadowMap');

    display();
}

var display = function() {
    requestAnimFrame(display);
    var radios = document.getElementsByName('radio');
    var materials = document.getElementsByName('material');
    var onLight = document.getElementsByName('onLight');

    if (isLightMove) {
        if (isForward) {
            lightPosition[0] += 0.1;
            lightPosition[1] += 0.1;
        } else {
            lightPosition[0] -= 0.1;
            lightPosition[1] -= 0.1;
        }

        if (lightPosition[1] > 15 || lightPosition[1] < -15) {
            isForward = !isForward;
        }
    }

    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"),
        flatten(lightPosition));

    viewProjMatrixFromLight = perspective(5.0, 1.0, 1.0, 100.0);
    viewProjMatrixFromLight = mult(viewProjMatrixFromLight, lookAt(new vec3(lightPosition[0], lightPosition[1], lightPosition[2]), new vec3(0.0, 0.0, 0.0), new vec3(0.0, 1.0, 0.0)));

    for (var i = 0, length = onLight.length; i < length; i++) {
        if (onLight[i].checked && onLight[i].value == "on") {
            isOn = 1;
            break;
        } else if (onLight[i].checked && onLight[i].value == "off") {
            isOn = 0;
            break;
        }
    }

    gl.uniform1i(gl.getUniformLocation(program, "isOn"), isOn);

    for (var i = 0, length = materials.length; i < length; i++) {
        if (materials[i].checked && materials[i].value == "gloss") {
            // do whatever you want with the checked radio
            materialAmbient = vec4(1.0, 0.0, 1.0, 1.0);
            materialDiffuse = vec4(1.0, 0.8, 0.0, 1.0);
            materialSpecular = vec4(1.0, 0.8, 0.0, 1.0);
            materialShininess = 100.0;
            var ambientProduct = mult(lightAmbient, materialAmbient);
            var diffuseProduct = mult(lightDiffuse, materialDiffuse);
            var specularProduct = mult(lightSpecular, materialSpecular);
            gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
                flatten(ambientProduct));
            gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
                flatten(diffuseProduct));
            gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"),
                flatten(specularProduct));
            gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"),
                flatten(lightPosition));
            gl.uniform1f(gl.getUniformLocation(program,
                "shininess"), materialShininess);
            // only one radio can be logically checked, don't check the rest
            break;
        } else if (materials[i].checked && materials[i].value == "matte") {
            materialAmbient = vec4(0.5, 0.5, 0.5, 1.0);
            materialDiffuse = vec4(0.3, 0.4, 0.5, 1.0);
            materialSpecular = vec4(1.0, 0.8, 0.0, 1.0);
            materialShininess = 250.0;
            var ambientProduct = mult(lightAmbient, materialAmbient);
            var diffuseProduct = mult(lightDiffuse, materialDiffuse);
            var specularProduct = mult(lightSpecular, materialSpecular);
            gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
                flatten(ambientProduct));
            gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
                flatten(diffuseProduct));
            gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"),
                flatten(specularProduct));
            gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"),
                flatten(lightPosition));
            gl.uniform1f(gl.getUniformLocation(program,
                "shininess"), materialShininess);
            break;
        } else if (materials[i].checked && materials[i].value == "metallic") {
            materialAmbient = vec4(0.3, 0.5, 0.9, 1.0);
            materialDiffuse = vec4(0.5, 0.6, 0.7, 7.0);
            materialSpecular = vec4(0.2, 0.2, 0.0, 1.0);
            materialShininess = 50.0;
            var ambientProduct = mult(lightAmbient, materialAmbient);
            var diffuseProduct = mult(lightDiffuse, materialDiffuse);
            var specularProduct = mult(lightSpecular, materialSpecular);
            gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
                flatten(ambientProduct));
            gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
                flatten(diffuseProduct));
            gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"),
                flatten(specularProduct));
            gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"),
                flatten(lightPosition));
            gl.uniform1f(gl.getUniformLocation(program,
                "shininess"), materialShininess);
            break;
        }
    }

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    renderModel();
}

//------------------------------------------------------------------------------

var g_normalMatrix = new mat4(); // Coordinate transformation matrix for normals
var g_mvpMatrixFromLight = new mat4(); // MVP from light

function drawComponent(comp) {
    var s = scale4(comp.width, comp.height, comp.width);
    var instanceMatrix = mult(translate(0.0, 0.5 * comp.height, 0.0), s);

    var t = mult(modelViewMatrix, instanceMatrix);

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));
    g_normalMatrix = inverse(t);
    g_normalMatrix = transpose(g_normalMatrix);
    gl.uniformMatrix4fv(normalMatrix, false, flatten(g_normalMatrix));
    for (var i = 0, length = wireframe.length; i < length; i++) {
        if (wireframe[i].checked && wireframe[i].value == "on") {
            gl.drawArrays(gl.LINE_STRIP, 0, NumVertices);
        }
        if (wireframe[i].checked && wireframe[i].value == "off") {
            gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
        }
    }

    if (isOn) {
        g_mvpMatrixFromLight = mult(viewProjMatrixFromLight, t);
        g_mvpMatrixFromLight = mult(translate(0, 0, -10), g_mvpMatrixFromLight);
        g_mvpMatrixFromLight = mult(translate(-lightPosition[0], -lightPosition[1], 0), g_mvpMatrixFromLight);

        configureTexture(black);
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(g_mvpMatrixFromLight));
        for (var i = 0, length = wireframe.length; i < length; i++) {
            if (wireframe[i].checked && wireframe[i].value == "on") {
                gl.drawArrays(gl.LINE_STRIP, 0, NumVertices);
            }
            if (wireframe[i].checked && wireframe[i].value == "off") {
                gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
            }
        }
    }
}

//------------------------------------------------------------------------------

function base() {
    var s = scale4(BASE_WIDTH, BASE_HEIGHT, BASE_WIDTH);
    var instanceMatrix = mult(translate(0.0, 0.5 * BASE_HEIGHT, 0.0), s);
    var t = mult(modelViewMatrix, instanceMatrix);

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));
    g_normalMatrix = inverse(t);
    g_normalMatrix = transpose(g_normalMatrix);
    gl.uniformMatrix4fv(normalMatrix, false, flatten(g_normalMatrix));
    for (var i = 0, length = wireframe.length; i < length; i++) {
        if (wireframe[i].checked && wireframe[i].value == "on") {
            gl.drawArrays(gl.LINE_STRIP, 0, NumVertices);
        }
        if (wireframe[i].checked && wireframe[i].value == "off") {
            gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
        }
    }

    if (isOn) {
        g_mvpMatrixFromLight = mult(viewProjMatrixFromLight, t);
        g_mvpMatrixFromLight = mult(translate(0, 0, -10), g_mvpMatrixFromLight);
        g_mvpMatrixFromLight = mult(translate(-lightPosition[0], -lightPosition[1], 0), g_mvpMatrixFromLight);

        configureTexture(black);
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(g_mvpMatrixFromLight));
        for (var i = 0, length = wireframe.length; i < length; i++) {
            if (wireframe[i].checked && wireframe[i].value == "on") {
                gl.drawArrays(gl.LINE_STRIP, 0, NumVertices);
            }
            if (wireframe[i].checked && wireframe[i].value == "off") {
                gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
            }
        }
    }
}

//BLOCK-------------------------------------------------------------------------

function block() {
    var s = scale4(BASE_HEIGHT, BASE_HEIGHT, BASE_HEIGHT);
    var instanceMatrix = mult(translate(0.0, 0.5 * BASE_HEIGHT, 0.0), s);
    var t = mult(modelViewMatrix, instanceMatrix);

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));
    g_normalMatrix = inverse(t);
    g_normalMatrix = transpose(g_normalMatrix);
    gl.uniformMatrix4fv(normalMatrix, false, flatten(g_normalMatrix));
    for (var i = 0, length = wireframe.length; i < length; i++) {
        if (wireframe[i].checked && wireframe[i].value == "on") {
            gl.drawArrays(gl.LINE_STRIP, 0, NumVertices);
        }
        if (wireframe[i].checked && wireframe[i].value == "off") {
            gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
        }
    }

    if (isOn) {
        g_mvpMatrixFromLight = mult(viewProjMatrixFromLight, t);
        g_mvpMatrixFromLight = mult(translate(0, 0, -10), g_mvpMatrixFromLight);
        g_mvpMatrixFromLight = mult(translate(-lightPosition[0], -lightPosition[1], 0), g_mvpMatrixFromLight);

        configureTexture(black);
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(g_mvpMatrixFromLight));
        for (var i = 0, length = wireframe.length; i < length; i++) {
            if (wireframe[i].checked && wireframe[i].value == "on") {
                gl.drawArrays(gl.LINE_STRIP, 0, NumVertices);
            }
            if (wireframe[i].checked && wireframe[i].value == "off") {
                gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
            }
        }
    }
}

//------------------------------------------------------------------------------

function upperArm() {
    var s = scale4(UPPER_ARM_WIDTH, UPPER_ARM_HEIGHT, UPPER_ARM_WIDTH);
    var instanceMatrix = mult(translate(0.0, 0.5 * UPPER_ARM_HEIGHT, 0.0), s);
    var t = mult(modelViewMatrix, instanceMatrix);

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));
    g_normalMatrix = inverse(t);
    g_normalMatrix = transpose(g_normalMatrix);
    gl.uniformMatrix4fv(normalMatrix, false, flatten(g_normalMatrix));
    for (var i = 0, length = wireframe.length; i < length; i++) {
        if (wireframe[i].checked && wireframe[i].value == "on") {
            gl.drawArrays(gl.LINE_STRIP, 0, NumVertices);
        }
        if (wireframe[i].checked && wireframe[i].value == "off") {
            gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
        }
    }

    if (isOn) {
        g_mvpMatrixFromLight = mult(viewProjMatrixFromLight, t);
        g_mvpMatrixFromLight = mult(translate(0, 0, -10), g_mvpMatrixFromLight);
        g_mvpMatrixFromLight = mult(translate(-lightPosition[0], -lightPosition[1], 0), g_mvpMatrixFromLight);

        configureTexture(black);
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(g_mvpMatrixFromLight));
        for (var i = 0, length = wireframe.length; i < length; i++) {
            if (wireframe[i].checked && wireframe[i].value == "on") {
                gl.drawArrays(gl.LINE_STRIP, 0, NumVertices);
            }
            if (wireframe[i].checked && wireframe[i].value == "off") {
                gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
            }
        }
    }
}

//----------------------------------------------------------------------------

function lowerArm() {
    var s = scale4(LOWER_ARM_WIDTH, LOWER_ARM_HEIGHT, LOWER_ARM_WIDTH);
    var instanceMatrix = mult(translate(0.0, 0.5 * LOWER_ARM_HEIGHT, 0.0), s);
    var t = mult(modelViewMatrix, instanceMatrix);

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));
    g_normalMatrix = inverse(t);
    g_normalMatrix = transpose(g_normalMatrix);
    gl.uniformMatrix4fv(normalMatrix, false, flatten(g_normalMatrix));
    for (var i = 0, length = wireframe.length; i < length; i++) {
        if (wireframe[i].checked && wireframe[i].value == "on") {
            gl.drawArrays(gl.LINE_STRIP, 0, NumVertices);
        }
        if (wireframe[i].checked && wireframe[i].value == "off") {
            gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
        }
    }

    if (isOn) {
        g_mvpMatrixFromLight = mult(viewProjMatrixFromLight, t);
        g_mvpMatrixFromLight = mult(translate(0, 0, -10), g_mvpMatrixFromLight);
        g_mvpMatrixFromLight = mult(translate(-lightPosition[0], -lightPosition[1], 0), g_mvpMatrixFromLight);

        configureTexture(black);
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(g_mvpMatrixFromLight));
        for (var i = 0, length = wireframe.length; i < length; i++) {
            if (wireframe[i].checked && wireframe[i].value == "on") {
                gl.drawArrays(gl.LINE_STRIP, 0, NumVertices);
            }
            if (wireframe[i].checked && wireframe[i].value == "off") {
                gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
            }
        }
    }
}

//----------------------------------------------------------------------------

function walls() {
    var s = scale4(WALL_WIDTH, WALL_HEIGHT, WALL_HEIGHT);
    var instanceMatrix = mult(translate(0.0, 0.5 * WALL_HEIGHT, 0.0), s);
    var t = mult(modelViewMatrix, instanceMatrix);

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));
    g_normalMatrix = inverse(t);
    g_normalMatrix = transpose(g_normalMatrix);
    gl.uniformMatrix4fv(normalMatrix, false, flatten(g_normalMatrix));
    gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
}

//--------------------------------------------------------------------------

function lightBox() {
    var s = scale4(1.0, 1.0, 1.0);
    var instanceMatrix = mult(translate(lightPosition[0], lightPosition[1], lightPosition[2]), s);
    var t = mult(modelViewMatrix, instanceMatrix);

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));
    g_normalMatrix = inverse(t);
    g_normalMatrix = transpose(g_normalMatrix);
    gl.uniformMatrix4fv(normalMatrix, false, flatten(g_normalMatrix));
    gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
}

//----------------------------------------------------------------------------------

var renderModel = function() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    modelViewMatrix = translate(0, 0, 0);
    configureTexture(wood);
    lightBox();

    var threshold = 15;

    if (stop == 0) {
        anim = anim + animSign;
        if (anim > threshold) {
            animSign = -1;
        } else if (anim < -threshold) {
            animSign = 1;
        }
        var wiggle = anim;


        var baseViewMatrix = rotate(theta[0], 0, 1, 0);
        var wallviewMatrix = rotate(0, 0, 1, 0);
        var x = Number(theta[1]) + wiggle;
        var x2 = Number(theta[1]) + wiggle;
        modelViewMatrix = rotate(theta[0], 0, 1, 0);

    } else {
        anim = anim + animSign;
        if (anim > threshold) {
            animSign = 0;
        } else if (anim < -threshold) {
            animSign = 0;
        }
        var wiggle = anim;


        var baseViewMatrix = rotate(theta[0], 0, 1, 0);
        var wallviewMatrix = rotate(0, 0, 1, 0);
        var x = Number(theta[1]) + wiggle;
        var x2 = Number(theta[1]) + wiggle;
        modelViewMatrix = rotate(theta[0], 0, 1, 0);

    }
    configureTexture(metal);
    base();

    //Right Front Leg
    modelViewMatrix = mult(baseViewMatrix, translate(horse.base.width * 1.5, horse.base.height * 1.5, horse.base.width / 1.5));
    modelViewMatrix = mult(modelViewMatrix, rotate(90, 0, 90, 0));
    configureTexture(stone);
    block();

    //Right Front Leg
    modelViewMatrix = mult(baseViewMatrix, translate(horse.base.width / 2, horse.base.height / 2, horse.base.width / 1.5));
    modelViewMatrix = mult(modelViewMatrix, rotate(180, 0, 0 + x / 60 + theta[2] / 60, 1));
    configureTexture(stone);
    upperArm();

    //Right Front Ankle
    modelViewMatrix = mult(modelViewMatrix, translate(0.0, horse.upperArm.height - 2, 0.0));
    modelViewMatrix = mult(modelViewMatrix, rotate(x2 + 15, -90, 0, 1));
    configureTexture(stone);
    lowerArm();

    //right back
    modelViewMatrix = mult(baseViewMatrix, translate(horse.base.width / 2, horse.base.height / 2, -horse.base.width / 1.5));
    modelViewMatrix = mult(modelViewMatrix, rotate(180, 0, 0 + x / 60 + theta[2] / 60, 1));
    configureTexture(wood);
    upperArm();

    modelViewMatrix = mult(modelViewMatrix, translate(0.0, horse.upperArm.height - 2, 0.0));
    modelViewMatrix = mult(modelViewMatrix, rotate(x + 15, -90, 0, 1));
    configureTexture(wood);
    lowerArm();

    //left front
    modelViewMatrix = mult(baseViewMatrix, translate(-horse.base.width / 2, horse.base.height / 2, horse.base.width / 1.5));
    modelViewMatrix = mult(modelViewMatrix, rotate(180, 0, 0 - x / 60 + theta[2] / 60, 1));
    configureTexture(stone);
    upperArm();

    modelViewMatrix = mult(modelViewMatrix, translate(0.0, horse.upperArm.height - 2, 0.0));
    modelViewMatrix = mult(modelViewMatrix, rotate(x - 15, +90, 0, 1));

    configureTexture(stone);
    lowerArm();

    //left back
    modelViewMatrix = mult(baseViewMatrix, translate(-horse.base.width / 2, horse.base.height / 2, -horse.base.width / 1.5));
    modelViewMatrix = mult(modelViewMatrix, rotate(180, 0, 0 - x / 60 + theta[2] / 60, 1));
    configureTexture(wood);
    upperArm();

    modelViewMatrix = mult(modelViewMatrix, translate(0.0, horse.upperArm.height - 2, 0.0));
    modelViewMatrix = mult(modelViewMatrix, rotate(x - 15, +90, 0, 1));
    configureTexture(wood);
    lowerArm();

    modelViewMatrix = mult(wallviewMatrix, translate(0, -wall.base.height, -10));
    modelViewMatrix = mult(modelViewMatrix, rotate(90, 0, 90, 0));
    configureTexture(stone);
    walls();

    modelViewMatrix = translate(0, 0, 0);
    var wallviewMatrix = rotate(0, 0, 1, 0);

    //Robotic Arm---------------------------------------------------------------

    if (demo) {
        //

        /* moving posx
        if (vx == 0) vx = 1;
        if (clawData.posx >= 5) vx = -1;
        if (clawData.posx <= -5) vx = 1;
        clawData.posx += 0.05 * vx;
        */
        clawData.posx = 6
        // console.log(clawData.posx);

        // moving extend
        if (extend == 0) extend = 1;
        if (clawData.extend >= 1.5) extend = -1;
        if (clawData.extend <= -1.5) extend = 1;
        clawData.extend += 0.035 * extend;

        // moving basey
        if (basey == 0) basey = 1;
        if (clawData.baseraise >= 90) basey = -1;
        if (clawData.baseraise <= 0) basey = 1;
        clawData.baseraise += 0.7 * basey;

        // rotating basez
        basez = 1;
        clawData.baserot += 1 * basez;

        // opening claw
        if (clawopen == 0) clawopen = 1;
        if (clawData.clawangle >= 25) clawopen = -1;
        if (clawData.clawangle <= -25) clawopen = 1;
        clawData.clawangle += 0.5 * clawopen;
    } else {
        if ((vx > 0 && clawData.posx < 5) || (vx < 0 && clawData.posx > -5)) clawData.posx += 0.05 * vx;
        if ((extend > 0 && clawData.extend < 1.5) || (extend < 0 && clawData.extend > -1.5)) clawData.extend += 0.035 * extend;
        if ((basey > 0 && clawData.baseraise < 90) || (basey < 0 && clawData.baseraise > 0)) clawData.baseraise += 0.7 * basey;
        clawData.baserot += 1 * basez;
        if ((clawopen > 0 && clawData.clawangle < 25) || (clawopen < 0 && clawData.clawangle > -25)) clawData.clawangle += 1.5 * clawopen;
    }

    var baseViewMatrix = rotate(theta[0], 0, 1, 0);
    var pos;

    clawMachine.upperArm.offsetMat = mult(clawMachine.upperArm.defaultMat, translate(clawData.posx, 0, clawData.posx));
    clawMachine.upperArm.resultMat = clawMachine.upperArm.calculateMat();
    modelViewMatrix = mult(baseViewMatrix, clawMachine.upperArm.resultMat);
    configureTexture(metal);
    drawComponent(clawMachine.upperArm);

    clawMachine.lowerArm.offsetMat = mult(clawMachine.lowerArm.defaultMat, translate(0, clawData.extend, 0));
    clawMachine.lowerArm.resultMat = clawMachine.lowerArm.calculateMat();
    modelViewMatrix = mult(baseViewMatrix, clawMachine.lowerArm.resultMat);
    configureTexture(stone);
    drawComponent(clawMachine.lowerArm);

    clawMachine.clawBase.offsetMat = mult(clawMachine.clawBase.defaultMat, mult(rotate(clawData.baserot, 0, 90, 0), rotate(clawData.baseraise, 0, 0, 90)));
    clawMachine.clawBase.resultMat = clawMachine.clawBase.calculateMat();
    modelViewMatrix = mult(baseViewMatrix, clawMachine.clawBase.resultMat);
    configureTexture(wood);
    drawComponent(clawMachine.clawBase);

    clawMachine.upperClaw1.offsetMat = mult(clawMachine.upperClaw1.defaultMat, rotate(clawData.clawangle, 0, 0, 90));
    clawMachine.upperClaw1.resultMat = clawMachine.upperClaw1.calculateMat();
    modelViewMatrix = mult(baseViewMatrix, clawMachine.upperClaw1.resultMat);
    configureTexture(metal);
    drawComponent(clawMachine.upperClaw1);

    clawMachine.lowerClaw1.offsetMat = mult(clawMachine.lowerClaw1.defaultMat, rotate(clawData.clawgrip, 0, 0, 90));
    clawMachine.lowerClaw1.resultMat = clawMachine.lowerClaw1.calculateMat();
    modelViewMatrix = mult(baseViewMatrix, clawMachine.lowerClaw1.resultMat);
    configureTexture(stone);
    drawComponent(clawMachine.lowerClaw1);

    clawMachine.upperClaw2.offsetMat = mult(clawMachine.upperClaw2.defaultMat, rotate(clawData.clawangle, 0, 0, 90));
    clawMachine.upperClaw2.resultMat = clawMachine.upperClaw2.calculateMat();
    modelViewMatrix = mult(baseViewMatrix, clawMachine.upperClaw2.resultMat);
    configureTexture(wood);
    drawComponent(clawMachine.upperClaw2);

    clawMachine.lowerClaw2.offsetMat = mult(clawMachine.lowerClaw2.defaultMat, rotate(clawData.clawgrip, 0, 0, 90));
    clawMachine.lowerClaw2.resultMat = clawMachine.lowerClaw2.calculateMat();
    modelViewMatrix = mult(baseViewMatrix, clawMachine.lowerClaw2.resultMat);
    configureTexture(metal);
    drawComponent(clawMachine.lowerClaw2);

    clawMachine.upperClaw3.offsetMat = mult(clawMachine.upperClaw3.defaultMat, rotate(clawData.clawangle, 0, 0, 90));
    clawMachine.upperClaw3.resultMat = clawMachine.upperClaw3.calculateMat();
    modelViewMatrix = mult(baseViewMatrix, clawMachine.upperClaw3.resultMat);
    configureTexture(stone);
    drawComponent(clawMachine.upperClaw3);

    clawMachine.lowerClaw3.offsetMat = mult(clawMachine.lowerClaw3.defaultMat, rotate(clawData.clawgrip, 0, 0, 90));
    clawMachine.lowerClaw3.resultMat = clawMachine.lowerClaw3.calculateMat();
    modelViewMatrix = mult(baseViewMatrix, clawMachine.lowerClaw3.resultMat);
    configureTexture(wood);
    drawComponent(clawMachine.lowerClaw3);


    modelViewMatrix = mult(wallviewMatrix, translate(0, -wall.base.height, -10));
    modelViewMatrix = mult(modelViewMatrix, rotate(90, 0, 90, 0));
    configureTexture(stone);
    walls();

};

function initFramebufferObject(gl) {
    var framebuffer, texture, depthBuffer;

    // Define the error handling function
    var error = function() {
        if (framebuffer) gl.deleteFramebuffer(framebuffer);
        if (texture) gl.deleteTexture(texture);
        if (depthBuffer) gl.deleteRenderbuffer(depthBuffer);
        return null;
    }

    // Create a framebuffer object (FBO)
    framebuffer = gl.createFramebuffer();
    if (!framebuffer) {
        console.log('Failed to create frame buffer object');
        return error();
    }

    // Create a texture object and set its size and parameters
    texture = gl.createTexture(); // Create a texture object
    if (!texture) {
        console.log('Failed to create texture object');
        return error();
    }
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 512, 512, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    // Create a renderbuffer object and Set its size and parameters
    depthBuffer = gl.createRenderbuffer(); // Create a renderbuffer object
    if (!depthBuffer) {
        console.log('Failed to create renderbuffer object');
        return error();
    }
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, 512, 512);

    // Attach the texture and the renderbuffer object to the FBO
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);

    // Check if FBO is configured correctly
    var e = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (gl.FRAMEBUFFER_COMPLETE !== e) {
        console.log('Frame buffer object is incomplete: ' + e.toString());
        return error();
    }

    framebuffer.texture = texture; // keep the required object

    // Unbind the buffer object
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);

    return framebuffer;
}
