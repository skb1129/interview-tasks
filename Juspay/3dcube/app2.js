const vertices = [[-1, -1, -1], [1, -1, -1], [-1, 1, -1], [1, 1, -1], [-1, -1, 1], [1, -1, 1], [-1, 1, 1], [1, 1, 1]];

const edges = [[0, 1], [1, 3], [3, 2], [2, 0], [2, 6], [3, 7], [0, 4], [1, 5], [6, 7], [6, 4], [7, 5], [4, 5]];

const canvas = document.getElementById("canvas");

const ctx = canvas.getContext("2d");

const PROJECTION_CENTER_X = canvas.width / 2;
const PROJECTION_CENTER_Y = canvas.height / 2;
const FIELD_OF_VIEW = canvas.width;

ctx.fillStyle = "#000000";

edges.forEach(edge => {
    const v1 = {
        x: vertices[edge[0]][0],
        y: vertices[edge[0]][1],
        z: vertices[edge[0]][2]
    };
    const v2 = {
        x: vertices[edge[1]][0],
        y: vertices[edge[1]][1],
        z: vertices[edge[1]][2]
    };
    const p1 = project(v1.x, v1.y, v1.z);
    const p2 = project(v2.x, v2.y, v2.z);
    line(ctx, p1, p2);
});

function line(context, p1, p2) {
    context.beginPath();
    context.moveTo(p1.x, p1.y);
    context.lineTo(p2.x, p2.y);
    context.stroke();
}


function project(x, y, z) {
    const size = FIELD_OF_VIEW / (FIELD_OF_VIEW + z);
    x = (x * size) + PROJECTION_CENTER_X;
    y = (y * size) + PROJECTION_CENTER_Y;
    return { size, x, y };
}

function rotate(threep, xdegree, ydegree, zdegree) {
    // return 3dp
}