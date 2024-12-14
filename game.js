const canvas = document.getElementById('canvas');
const gl = canvas.getContext('webgl');
const scoreElement = document.getElementById('score');

function createShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
}

const vertexShader = createShader(gl.VERTEX_SHADER, `
    attribute vec2 position;
    uniform vec2 resolution;
    uniform vec2 translation;
    uniform float scale;

    void main() {
        vec2 scaledPosition = position * scale + translation;
        vec2 clipSpace = (scaledPosition / resolution * 2.0 - 1.0) * vec2(1, -1);
        gl_Position = vec4(clipSpace, 0, 1);
    }
`);

const fragmentShader = createShader(gl.FRAGMENT_SHADER, `
    precision mediump float;
    uniform vec4 color;

    void main() {
        gl_FragColor = color;
    }
`);

const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);

const positionAttribute = gl.getAttribLocation(program, 'position');
const resolutionUniform = gl.getUniformLocation(program, 'resolution');
const translationUniform = gl.getUniformLocation(program, 'translation');
const scaleUniform = gl.getUniformLocation(program, 'scale');
const colorUniform = gl.getUniformLocation(program, 'color');


const circleVertices = new Float32Array(202); 
circleVertices[0] = 0; 
circleVertices[1] = 0; 

for (let i = 0; i <= 100; i++) {

    const angle = (i / 50) * Math.PI;
    circleVertices[i * 2] = Math.cos(angle);
    circleVertices[i * 2 + 1] = Math.sin(angle);

}

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, circleVertices, gl.STATIC_DRAW);

let ball = {
    
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 60,
    speed: 2,
    direction: Math.random() * Math.PI * 2,

    color: [0, 0, 1, 1] 
};

let score = 0;

function drawBall() {
    gl.uniform2f(translationUniform, ball.x, ball.y);
    gl.uniform1f(scaleUniform, ball.radius);
    gl.uniform4fv(colorUniform, ball.color);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 102); 
}

function moveBall() {
    ball.x += Math.cos(ball.direction) * ball.speed;
    ball.y += Math.sin(ball.direction) * ball.speed;

    if (ball.x < ball.radius || ball.x > canvas.width - ball.radius) {
        ball.direction = Math.PI - ball.direction;
    }
    
    if (ball.y < ball.radius || ball.y > canvas.height - ball.radius) {
        ball.direction = -ball.direction;
    }
}

function resetBall() {

    ball.x = Math.random() * (canvas.width - ball.radius * 2) + ball.radius;
    ball.y = Math.random() * (canvas.height - ball.radius * 2) + ball.radius;
    ball.direction = Math.random() * Math.PI * 2;

}

function updateScore() {
    score++;
    scoreElement.textContent = score;

    if(score > 8 && score < 20){

        ball.speed = 3;
        ball.radius = ball.radius - 1;
        ball.color = [0, 0.5, 0.5, 1]; 
    }

    if(score > 20 && score < 30){

        ball.speed = 4;
        ball.color = [0.5, 0, 0.5, 1]; 
    }

    if(score > 30 && score < 40){
        ball.speed = 5;
        ball.radius = ball.radius - 1;
        ball.color = [1, 0.5, 0, 1]; 
    }

    if(score > 40){

        ball.speed = 6;
        ball.color = [1, 0, 0, 1]; 
    }
}

function gameLoop() {

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);
    gl.enableVertexAttribArray(positionAttribute);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    gl.vertexAttribPointer(positionAttribute, 2, gl.FLOAT, false, 0, 0);
    gl.uniform2f(resolutionUniform, canvas.width, canvas.height);

    moveBall();
    drawBall();
    
    requestAnimationFrame(gameLoop);
}

canvas.addEventListener('click', (event) => {

    const rect = canvas.getBoundingClientRect();

    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;
    
    const distance = Math.hypot(clickX - ball.x, clickY - ball.y);
    
    if (distance < ball.radius + 30) {

        updateScore();
        resetBall();
    }
});

resetBall();
gameLoop();