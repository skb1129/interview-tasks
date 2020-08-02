const dataInput = document.getElementById("data");
const lineInput = document.getElementById("line");
const button = document.getElementById("generate");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const margin = 20;
const scale = canvas.width - (2 * margin);
let data, maxX, maxY, graphType, barWidth;

button.addEventListener("click", () => {
    try {
        data = JSON.parse(dataInput.value || "[]");
        data.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
        maxX = Math.max(...data.map(p => p[0]));
        maxY = Math.max(...data.map(p => p[1]));
        barWidth = scale / maxX;
    } catch (e) {
        window.alert("Unable to parse JSON data");
        return;
    }
    graphType = lineInput.checked ? "line" : "bar";
    drawGraph();
});

function line(p1, p2, text1, text2) {
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#00AA00";
    ctx.beginPath();
    text1 && ctx.fillText(text1, p1.x - 20, p1.y - 10);
    text2 && ctx.fillText(text2, p2.x - 20, p2.y - 10);
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
}

function rect(p, text) {
    ctx.fillStyle = "#AA0000";
    ctx.beginPath();
    text && ctx.fillText(text, p.x - barWidth / 2, p.y - 5);
    ctx.fillRect(p.x - barWidth, p.y, barWidth, scale + margin - p.y);
    ctx.stroke();
}

function getScaledPoint(x, y) {
    return { x: margin + (x * scale / maxX), y: margin + scale - (y * scale / maxY) };
};

function drawGraph() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    line(getScaledPoint(0, 0), getScaledPoint(0, maxY), "0, 0", `0, ${maxY}`);
    line(getScaledPoint(0, 0), getScaledPoint(maxX, 0), "", `0, ${maxX}`);
    if (graphType === "line") {
        drawLineGraph();
    } else {
        drawBarGraph();
    }
}

function drawLineGraph() {
    let unscaled = data[0];
    let prevPoint = getScaledPoint(...data[0]);
    for (let index = 1; index < data.length; index++) {
        const point = getScaledPoint(...data[index]);
        line(
            prevPoint,
            point,
            `${unscaled[0]}, ${unscaled[1]}`,
            (index + 1) === data.length ? `${data[index][0]}, ${data[index][1]}` : ""
        );
        prevPoint = point;
        unscaled = data[index];
    }
}

function drawBarGraph() {
    for (let index = 0; index < data.length; index++) {
        const point = getScaledPoint(...data[index]);
        rect(point, `${data[index][0]}, ${data[index][1]}`);
    }
}

// [[3, 3], [1, 2], [6, 10], [4, 5]]
// [[1, 1], [2, 2], [3, 3], [4, 4]]
// [[3, 3], [1, 2], [6, 10], [4, 5], [7, 5], [5, 7], [8, 1], [2, 5], [9, 9]]