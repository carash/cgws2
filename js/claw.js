"use strict";

var canvas,
	gl,
	program;

var NumVertices = 36; //(6 faces)(2 triangles/face)(3 vertices/triangle)

var points = [];
var colors = [];
var normals = [];

var lightPosition = vec4(5.0, 5.0, 5.0, 0.0);
var lightAmbient = vec4(0.5, 0.5, 0.5, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

var materialAmbient = vec4(1.0, 0.0, 1.0, 1.0);
var materialDiffuse = vec4(1.0, 0.8, 0.0, 1.0);
var materialSpecular = vec4(1.0, 0.8, 0.0, 1.0);
var materialShininess = 100.0;

var ctm;
var ambientColor,
	diffuseColor,
	specularColor;
var viewerPos;

var vertices = [
	vec4(-0.5, -0.5, 0.5, 1.0),
	vec4(-0.5, 0.5, 0.5, 1.0),
	vec4(0.5, 0.5, 0.5, 1.0),
	vec4(0.5, -0.5, 0.5, 1.0),
	vec4(-0.5, -0.5, -0.5, 1.0),
	vec4(-0.5, 0.5, -0.5, 1.0),
	vec4(0.5, 0.5, -0.5, 1.0),
	vec4(0.5, -0.5, -0.5, 1.0),
];

// RGBA colors
var vertexColors = [
	vec4(0.0, 0.0, 0.0, 1.0), // black
	vec4(1.0, 0.0, 0.0, 1.0), // red
	vec4(1.0, 1.0, 0.0, 1.0), // yellow
	vec4(0.0, 1.0, 0.0, 1.0), // green
	vec4(0.0, 0.0, 1.0, 1.0), // blue
	vec4(1.0, 0.0, 1.0, 1.0), // magenta
	vec4(1.0, 1.0, 1.0, 1.0), // white
	vec4(0.0, 1.0, 1.0, 1.0), // cyan
];

var worldPos = function() {
	var pos = [0, 0, 0]
	var curr = this

	while (curr.parent) {
		pos[0] += curr.offset[0];
		pos[1] += curr.offset[1];
		pos[2] += curr.offset[2];
		curr = curr.parent
	}

	pos[0] += curr.offset[0];
	pos[1] += curr.offset[1];
	pos[2] += curr.offset[2];

	return pos
}

var worldMat = function() {
	var mat = translate(0, 0, 0);
	var par = [this.offsetMat];
	var curr = this.parent;

	while (curr) {
		par.push(curr.offsetMat);
		curr = curr.parent;
	}

	par.reverse()
	par.forEach(function(m) {
		mat = mult(mat, m);
	});

	return mat
}

var calcMat = function() {
	var mat = translate(0, 0, 0);
	var par = [this.offsetMat];
	var curr = this.parent;

	while (curr) {
		par.push(curr.offsetMat);
		curr = curr.parent;
	}

	par.reverse()
	par.forEach(function(m) {
		mat = mult(mat, m);
	});

	return mat
}

var clawMachine = {}

clawMachine.upperArm = {
	parent: null,
	defaultMat: mult(translate(0.0, 5.0, 0.0), rotate(180, 0, 0, 90)),
	offsetMat: mult(translate(0.0, 5.0, 0.0), rotate(180, 0, 0, 90)),
	width: 1.0,
	height: 3.0,
	calculateMat: calcMat,
};

clawMachine.lowerArm = {
	parent: clawMachine.upperArm,
	defaultMat: translate(0.0, 1.5, 0.0),
	offsetMat: translate(0.0, 1.5, 0.0),
	width: 0.7,
	height: 5.5,
	calculateMat: calcMat,
};

clawMachine.clawBase = {
	parent: clawMachine.lowerArm,
	defaultMat: translate(0.0, 5.5, 0.0),
	offsetMat: translate(0.0, 5.5, 0.0),
	width: 2.3,
	height: 1.0,
	calculateMat: calcMat,
};

clawMachine.upperClaw1 = {
	parent: clawMachine.clawBase,
	defaultMat: mult(translate(0.6, 1.0, 0.0), rotate(-45, 0, 0, 90)),
	offsetMat: mult(translate(0.6, 1.0, 0.0), rotate(-45, 0, 0, 90)),
	width: 0.4,
	height: 1.5,
	calculateMat: calcMat,
};

clawMachine.lowerClaw1 = {
	parent: clawMachine.upperClaw1,
	defaultMat: mult(translate(0.0, 1.5, 0.0), rotate(60, 0, 0, 90)),
	offsetMat: mult(translate(0.0, 1.5, 0.0), rotate(60, 0, 0, 90)),
	width: 0.3,
	height: 1.5,
	calculateMat: calcMat,
};

clawMachine.upperClaw2 = {
	parent: clawMachine.clawBase,
	defaultMat: mult(mult(translate(-0.3, 1.0, 0.5), rotate(-120, 0, 90, 0)), rotate(-45, 0, 0, 90)),
	offsetMat: mult(mult(translate(-0.3, 1.0, 0.5), rotate(-120, 0, 90, 0)), rotate(-45, 0, 0, 90)),
	width: 0.4,
	height: 1.5,
	calculateMat: calcMat,
};

clawMachine.lowerClaw2 = {
	parent: clawMachine.upperClaw2,
	defaultMat: mult(translate(0.0, 1.5, 0.0), rotate(60, 0, 0, 90)),
	offsetMat: mult(translate(0.0, 1.5, 0.0), rotate(60, 0, 0, 90)),
	width: 0.3,
	height: 1.5,
	calculateMat: calcMat,
};

clawMachine.upperClaw3 = {
	parent: clawMachine.clawBase,
	defaultMat: mult(mult(translate(-0.3, 1.0, -0.5), rotate(120, 0, 90, 0)), rotate(-45, 0, 0, 90)),
	offsetMat: mult(mult(translate(-0.3, 1.0, -0.5), rotate(120, 0, 90, 0)), rotate(-45, 0, 0, 90)),
	width: 0.4,
	height: 1.5,
	calculateMat: calcMat,
};

clawMachine.lowerClaw3 = {
	parent: clawMachine.upperClaw3,
	defaultMat: mult(translate(0.0, 1.5, 0.0), rotate(60, 0, 0, 90)),
	offsetMat: mult(translate(0.0, 1.5, 0.0), rotate(60, 0, 0, 90)),
	width: 0.3,
	height: 1.5,
	calculateMat: calcMat,
};

var renderObjects = [
	clawMachine.upperArm,
	clawMachine.lowerArm,
	clawMachine.clawBase,
	clawMachine.upperClaw1,
	clawMachine.lowerClaw1,
	clawMachine.upperClaw2,
	clawMachine.lowerClaw2,
	clawMachine.upperClaw3,
	clawMachine.lowerClaw3,
];

// Parameters controlling the size of the Robot's arm

var BASE_HEIGHT = 3.0;
var BASE_WIDTH = 10.0;
var LOWER_ARM_HEIGHT = 7.0;
var LOWER_ARM_WIDTH = 0.8;
var UPPER_ARM_HEIGHT = 3.0;
var UPPER_ARM_WIDTH = 1;

// Shader transformation matrices

var modelViewMatrix,
	projectionMatrix;

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

var vBuffer,
	cBuffer;

// ----------------------------------------------------------------------------

function quad(a, b, c, d) {
	var t1 = subtract(vertices[b], vertices[a]);
	var t2 = subtract(vertices[c], vertices[b]);
	var normal = cross(t1, t2);
	var normal = vec3(normal);

	colors.push(vertexColors[a]);
	points.push(vertices[a]);
	normals.push(normal);

	colors.push(vertexColors[a]);
	points.push(vertices[b]);
	normals.push(normal);

	colors.push(vertexColors[a]);
	points.push(vertices[c]);
	normals.push(normal);

	colors.push(vertexColors[a]);
	points.push(vertices[a]);
	normals.push(normal);

	colors.push(vertexColors[a]);
	points.push(vertices[c]);
	normals.push(normal);

	colors.push(vertexColors[a]);
	points.push(vertices[d]);
	normals.push(normal);
}

function colorCube() {
	quad(1, 0, 3, 2);
	quad(2, 3, 7, 6);
	quad(3, 0, 4, 7);
	quad(6, 5, 1, 2);
	quad(4, 5, 6, 7);
	quad(5, 4, 0, 1);
}

function scale4(a, b, c) {
	var result = mat4();
	result[0][0] = a;
	result[1][1] = b;
	result[2][2] = c;
	return result;
}

// --------------------------------------------------

window.onload = function init() {
	canvas = document.getElementById("gl-canvas");

	gl = WebGLUtils.setupWebGL(canvas);
	if (!gl) {
		alert("WebGL isn't available");
	}

	gl.viewport(0, 0, canvas.width, canvas.height);

	gl.clearColor(1.0, 1.0, 1.0, 1.0);
	gl.enable(gl.DEPTH_TEST);

	//
	//  Load shaders and initialize attribute buffers
	//
	program = initShaders(gl, "vertex-shader", "fragment-shader");

	gl.useProgram(program);

	colorCube();

	// Load shaders and use the resulting shader program

	program = initShaders(gl, "vertex-shader", "fragment-shader");
	gl.useProgram(program);

	// Create and initialize  buffer objects

	// normals
	var nBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW);

	var vNormal = gl.getAttribLocation(program, "vNormal");
	gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vNormal);

	// positions
	vBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

	var vPosition = gl.getAttribLocation(program, "vPosition");
	gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vPosition);

	//colors
	cBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

	var vColor = gl.getAttribLocation(program, "vColor");
	gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vColor);

	// shades
	viewerPos = vec3(0.0, 0.0, -20.0);

	var ambientProduct = mult(lightAmbient, materialAmbient);
	var diffuseProduct = mult(lightDiffuse, materialDiffuse);
	var specularProduct = mult(lightSpecular, materialSpecular);

	gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"), flatten(ambientProduct));
	gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"), flatten(diffuseProduct));
	gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), flatten(specularProduct));
	gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition));

	gl.uniform1f(gl.getUniformLocation(program, "shininess"), materialShininess);

	document.getElementById("stop").onclick = function(event) {
		stop = 1;
		document.getElementById("stop").disabled = true;
		document.getElementById("demo").disabled = false;
	};

	document.getElementById("demo").onclick = function(event) {
		stop = 0;
		document.getElementById("stop").disabled = false;
		document.getElementById("demo").disabled = true;
	};

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

	projectionMatrix = ortho(-10, 10, -10, 10, -10, 10);
	gl.uniformMatrix4fv(gl.getUniformLocation(program, "projectionMatrix"), false, flatten(projectionMatrix));

	display();
};

var display = function() {
	requestAnimFrame(display);
	var radios = document.getElementsByName("model");
	renderClaw();
};

// ----------------------------------------------------------------------------

function drawComponent(comp) {
	var s = scale4(comp.width, comp.height, comp.width);
	var instanceMatrix = mult(translate(0.0, 0.5 * comp.height, 0.0), s);

	var t = mult(modelViewMatrix, instanceMatrix);
	gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));
	gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
}

// ----------------------------------------------------------------------------

function base() {
	var s = scale4(BASE_WIDTH, BASE_HEIGHT, BASE_WIDTH);
	var instanceMatrix = mult(translate(0.0, 0.5 * BASE_HEIGHT, 0.0), s);
	var t = mult(modelViewMatrix, instanceMatrix);
	gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));
	gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
}

// ----------------------------------------------------------------------------

function lightBox() {
	var s = scale4(1.0, 1.0, 1.0);
	var instanceMatrix = mult(translate(-5.0, 1.0, 1.0), s);
	var t = mult(modelViewMatrix, instanceMatrix);
	gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));
	gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
}

// ----------------------------------------------------------------------------------

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
var vy = 0;
var extend = false;
var basey = 0;
var basez = 0;
var clawopen = false;

var renderClaw = function() {
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	modelViewMatrix = translate(lightPosition[0], lightPosition[1], lightPosition[2]);
	lightBox();

	if (demo) {

	} else {

	}

	var baseViewMatrix = rotate(theta[0], 0, 1, 0);
	var pos;

	clawMachine.upperArm.offsetMat = mult(clawMachine.upperArm.defaultMat, translate(clawData.posx, 0, clawData.posx));
	modelViewMatrix = mult(baseViewMatrix, clawMachine.upperArm.calculateMat());
	drawComponent(clawMachine.upperArm);

	clawMachine.lowerArm.offsetMat = mult(clawMachine.lowerArm.defaultMat, translate(0, clawData.extend, 0));
	modelViewMatrix = mult(baseViewMatrix, clawMachine.lowerArm.calculateMat());
	drawComponent(clawMachine.lowerArm);

	clawMachine.clawBase.offsetMat = mult(clawMachine.clawBase.defaultMat, mult(rotate(clawData.baserot, 0, 90, 0), rotate(clawData.baseraise, 0, 0, 90)));
	modelViewMatrix = mult(baseViewMatrix, clawMachine.clawBase.calculateMat());
	drawComponent(clawMachine.clawBase);

	clawMachine.upperClaw1.offsetMat = mult(clawMachine.upperClaw1.defaultMat, rotate(clawData.clawangle, 0, 0, 90));
	modelViewMatrix = mult(baseViewMatrix, clawMachine.upperClaw1.calculateMat());
	drawComponent(clawMachine.upperClaw1);

	clawMachine.lowerClaw1.offsetMat = mult(clawMachine.lowerClaw1.defaultMat, rotate(clawData.clawgrip, 0, 0, 90));
	modelViewMatrix = mult(baseViewMatrix, clawMachine.lowerClaw1.calculateMat());
	drawComponent(clawMachine.lowerClaw1);

	clawMachine.upperClaw2.offsetMat = mult(clawMachine.upperClaw2.defaultMat, rotate(clawData.clawangle, 0, 0, 90));
	modelViewMatrix = mult(baseViewMatrix, clawMachine.upperClaw2.calculateMat());
	drawComponent(clawMachine.upperClaw2);

	clawMachine.lowerClaw2.offsetMat = mult(clawMachine.lowerClaw2.defaultMat, rotate(clawData.clawgrip, 0, 0, 90));
	modelViewMatrix = mult(baseViewMatrix, clawMachine.lowerClaw2.calculateMat());
	drawComponent(clawMachine.lowerClaw2);

	clawMachine.upperClaw3.offsetMat = mult(clawMachine.upperClaw3.defaultMat, rotate(clawData.clawangle, 0, 0, 90));
	modelViewMatrix = mult(baseViewMatrix, clawMachine.upperClaw3.calculateMat());
	drawComponent(clawMachine.upperClaw3);

	clawMachine.lowerClaw3.offsetMat = mult(clawMachine.lowerClaw3.defaultMat, rotate(clawData.clawgrip, 0, 0, 90));
	modelViewMatrix = mult(baseViewMatrix, clawMachine.lowerClaw3.calculateMat());
	drawComponent(clawMachine.lowerClaw3);
};

// ----------------------------------------------------------------------------

var render = function() {
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	modelViewMatrix = rotate(theta[Base], 0, 1, 0);
	base();

	modelViewMatrix = mult(modelViewMatrix, translate(0.0, BASE_HEIGHT, 0.0));
	modelViewMatrix = mult(modelViewMatrix, rotate(theta[LowerArm], 0, 0, 1));
	lowerArm();

	modelViewMatrix = mult(modelViewMatrix, translate(0.0, LOWER_ARM_HEIGHT, 0.0));
	modelViewMatrix = mult(modelViewMatrix, rotate(theta[UpperArm], 0, 0, 1));
	upperArm();

	requestAnimFrame(render);
};
