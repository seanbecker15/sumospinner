const display = document.getElementById("canvas");
const context = display.getContext("2d");
const socket = io();

const gridSize = 1000;

let displaySize = display.width = display.height = Math.min(window.innerWidth, window.innerHeight) * 2;
let blockSize = displaySize / gridSize;

display.style.width = (displaySize / 2) + "px";
display.style.height = (displaySize / 2) + "px";
let playing = false;
context.font = '50px arial'
context.fillStyle = 'rgb(255,0,0)';
context.textAlign = 'center';
context.fillText('waiting for game...', 500 * blockSize, 500 * blockSize);
context.fill();

let spinnerBlue = new Image();
spinnerBlue.src = './spinner-blue.svg';
let spinnerRed = new Image();
spinnerRed.src = './spinner-red.svg';

let rotation = 0;
let spinners = [];

socket.on("update", function (data) {
    spinners = data;
    requestAnimationFrame(frame);
});

socket.on('startGame', function (data) {
    playing = true;
});

socket.on('win', function () {
    playing = false;
    context.clearRect(0, 0, displaySize, displaySize);
    context.font = '50px arial';
    context.fillStyle = 'rgb(255,0,0)';
    context.textAlign = 'center';
    context.fillText('You won! Wait to play again...', 500 * blockSize, 500 * blockSize);
    context.fill();
    setTimeout(function () {
        socket.emit('waitForGame');
    }, 1000);
    // Idea: Winner of game is placed at beginning of queue
})

socket.on('lose', function () {
    playing = false;
    context.clearRect(0, 0, displaySize, displaySize);
    context.font = '50px arial';
    context.fillStyle = 'rgb(255,0,0)';
    context.textAlign = 'center';
    context.fillText('You lost :( Wait to play again...', 500 * blockSize, 500 * blockSize);
    context.fill();
    setTimeout(function () {
        socket.emit('waitForGame');
    }, 1000);
    // Idea: loser of game is pushed to end of queue
})

socket.emit("waitForGame");

let keys = {};
const converter = {
    38: 'w', 87: 'w',
    40: 's', 83: 's',
    37: 'a', 65: 'a',
    39: 'd', 68: 'd'
}

document.onkeydown = function (event) {
    if (converter[event.keyCode]) {
        event = event || window.event;
        keys[converter[event.keyCode]] = true;
        //console.log(`Added ${event.keyCode}; keys = ${Object.keys(keys)}`);
        const keysPressed = Object.keys(keys).sort().join('');
        socket.emit('keyPress', keysPressed);
    }
};

document.onkeyup = function (event) {
    if (converter[event.keyCode]) {
        event = event || window.event;
        delete keys[converter[event.keyCode]];
        //console.log(`Removed ${converter[event.keyCode]}`);
    }
}

window.onresize = function () {
    displaySize = display.width = display.height = Math.min(window.innerWidth, window.innerHeight) * 2;
    blockSize = displaySize / gridSize;
    display.style.width = (displaySize / 2) + "px";
    display.style.height = (displaySize / 2) + "px";
};

function drawSpinner(spinner, image) {
    context.save();
    let x = spinner.x * blockSize;
    let y = spinner.y * blockSize;
    let w = 120 * blockSize;
    let h = 120 * blockSize;
    context.translate(x, y);
    rotation += spinner.dtheta;
    context.rotate(rotation * Math.PI / 180);
    context.translate(-x, -y);
    context.drawImage(image, x - w / 2, y - h / 2, w, h);
    context.drawImage(image, x - w / 2, y - h / 2, w, h);
    context.restore();
}

function frame() {
    context.clearRect(0, 0, displaySize, displaySize);
    drawSpinner(spinners[1], spinnerRed);
    drawSpinner(spinners[0], spinnerBlue);
    context.fill();
}