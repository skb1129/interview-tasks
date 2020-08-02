const canvas = document.getElementById('canvas');
gl = canvas.getContext('webgl');

const vertices = [
    // Front face
    -1.0, -1.0, 1.0,
    1.0, -1.0, 1.0,
    1.0, 1.0, 1.0,
    -1.0, 1.0, 1.0,

    // Back face
    -1.0, -1.0, -1.0,
    -1.0, 1.0, -1.0,
    1.0, 1.0, -1.0,
    1.0, -1.0, -1.0,

    // Top face
    -1.0, 1.0, -1.0,
    -1.0, 1.0, 1.0,
    1.0, 1.0, 1.0,
    1.0, 1.0, -1.0,

    // Bottom face
    -1.0, -1.0, -1.0,
    1.0, -1.0, -1.0,
    1.0, -1.0, 1.0,
    -1.0, -1.0, 1.0,

    // Right face
    1.0, -1.0, -1.0,
    1.0, 1.0, -1.0,
    1.0, 1.0, 1.0,
    1.0, -1.0, 1.0,

    // Left face
    -1.0, -1.0, -1.0,
    -1.0, -1.0, 1.0,
    -1.0, 1.0, 1.0,
    -1.0, 1.0, -1.0,
];

const faceColors = [
    [1, 0, 0],    // Front face: red
    [0, 1, 0],    // Top face: blue
    [0, 0, 1],    // Back face: green
    [1, 1, 0],    // Bottom face: yellow
    [0, 1, 1],    // Right face: sky blue
    [1, 0, 1],    // Left face: purple
];

// Convert the array of colors into a table for all the vertices.
let colors = [];
faceColors.forEach(c => { colors = colors.concat([...c, ...c, ...c, ...c]); })

const indices = [
    0, 1, 2, 0, 2, 3,    // front
    4, 5, 6, 4, 6, 7,    // back
    8, 9, 10, 8, 10, 11,   // top
    12, 13, 14, 12, 14, 15,   // bottom
    16, 17, 18, 16, 18, 19,   // right
    20, 21, 22, 20, 22, 23,   // left
];

const vertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

const colorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

const indexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);


// Shaders

// Vertex shader
const vertCode = `
    attribute vec3 position;
    uniform mat4 Pmatrix;
    uniform mat4 Vmatrix;
    uniform mat4 Mmatrix;
    attribute vec3 color;
    varying vec3 vColor;
    void main(void) {
        gl_Position = Pmatrix*Vmatrix*Mmatrix*vec4(position, 1.);
        vColor = color;
    }
`;

// Fragment shader
const fragCode = `
    precision mediump float;
    varying vec3 vColor;
    void main(void) {
        gl_FragColor = vec4(vColor, 1.);
    }
`;

const vertShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertShader, vertCode);
gl.compileShader(vertShader);

const fragShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragShader, fragCode);
gl.compileShader(fragShader);

const shaderProgram = gl.createProgram();
gl.attachShader(shaderProgram, vertShader);
gl.attachShader(shaderProgram, fragShader);
gl.linkProgram(shaderProgram);

const Pmatrix = gl.getUniformLocation(shaderProgram, "Pmatrix");
const Vmatrix = gl.getUniformLocation(shaderProgram, "Vmatrix");
const Mmatrix = gl.getUniformLocation(shaderProgram, "Mmatrix");

gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
const position = gl.getAttribLocation(shaderProgram, "position");
gl.vertexAttribPointer(position, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(position);

gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
const color = gl.getAttribLocation(shaderProgram, "color");
gl.vertexAttribPointer(color, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(color);
gl.useProgram(shaderProgram);


// Matrix

function getProjection(angle, zMin, zMax) {
    const ang = Math.tan((angle * .5) * Math.PI / 180);
    return [
        0.5 / ang, 0, 0, 0,
        0, 0.5 / ang, 0, 0,
        0, 0, -(zMax + zMin) / (zMax - zMin), -1,
        0, 0, (-2 * zMax * zMin) / (zMax - zMin), 0
    ];
}

const projectionMatrix = getProjection(40, 1, 100);
let modelMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
let viewMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

viewMatrix[14] = viewMatrix[14] - 6;


// Mouse events

const DECELERATION = 0.95;
let drag = false;
let oldX, oldY;
let dX = 0, dY = 0;

const mouseDown = (e) => {
    e.preventDefault();
    drag = true;
    oldX = e.pageX;
    oldY = e.pageY;
    return false;
};

const mouseUp = (e) => {
    drag = false;
};

const mouseMove = (e) => {
    e.preventDefault();
    if (!drag) return false;
    dX = (e.pageX - oldX) * 2 * Math.PI / canvas.width;
    dY = (e.pageY - oldY) * 2 * Math.PI / canvas.height;
    ANGLE_X += dX;
    ANGLE_Y += dY;
    oldX = e.pageX;
    oldY = e.pageY;
};

canvas.addEventListener("mousedown", mouseDown, false);
canvas.addEventListener("mouseup", mouseUp, false);
canvas.addEventListener("mouseout", mouseUp, false);
canvas.addEventListener("mousemove", mouseMove, false);


// Rotation

function rotateX(m, angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const mv1 = m[1], mv5 = m[5], mv9 = m[9];

    m[1] = m[1] * c - m[2] * s;
    m[5] = m[5] * c - m[6] * s;
    m[9] = m[9] * c - m[10] * s;

    m[2] = m[2] * c + mv1 * s;
    m[6] = m[6] * c + mv5 * s;
    m[10] = m[10] * c + mv9 * s;
}

function rotateY(m, angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const mv0 = m[0], mv4 = m[4], mv8 = m[8];

    m[0] = c * m[0] + s * m[2];
    m[4] = c * m[4] + s * m[6];
    m[8] = c * m[8] + s * m[10];

    m[2] = c * m[2] - s * mv0;
    m[6] = c * m[6] - s * mv4;
    m[10] = c * m[10] - s * mv8;
}

// Drawing

let ANGLE_X = 0, ANGLE_Y = 0;
let timeOld = 0;

function animate(time) {
    let dt = time - timeOld;

    if (!drag) {
        dX *= DECELERATION, dY *= DECELERATION;
        ANGLE_X += dX, ANGLE_Y += dY;
    }

    modelMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

    rotateY(modelMatrix, ANGLE_X);
    rotateX(modelMatrix, ANGLE_Y);

    timeOld = time;
    gl.enable(gl.DEPTH_TEST);

    gl.clearColor(0, 0, 0, 1);
    gl.clearDepth(1.0);
    gl.viewport(0.0, 0.0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.uniformMatrix4fv(Pmatrix, false, projectionMatrix);
    gl.uniformMatrix4fv(Vmatrix, false, viewMatrix);
    gl.uniformMatrix4fv(Mmatrix, false, modelMatrix);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

    window.requestAnimationFrame(animate);
}
animate(0);