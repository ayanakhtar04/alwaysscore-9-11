const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');

// Load background image
const backgroundImage = new Image();
backgroundImage.src = 'background.png'; // Replace 'background.jpg' with the correct path to your background image

// Load airplane image
const airplaneImg = new Image();
airplaneImg.src = 'airplane.png'; // Replace 'airplane.png' with the correct path to your airplane image

// Load obstacle image
const obstacleImg = new Image();
obstacleImg.src = 'obstacle.png'; // Replace 'obstacle.png' with the correct path to your obstacle image

// Load explosion image
const explosionImg = new Image();
explosionImg.onload = function() {
    // Call the update function when the explosion image is loaded
    update();
};
explosionImg.src = 'explosion.png'; // Replace 'explosion.png' with the correct path to your explosion image

const character = {
    x: 50,
    y: window.innerHeight - 200, // Adjust the y position to fit the airplane on the ground
    width: 200, // Adjust the width of the airplane
    height: 100, // Adjust the height of the airplane
    speed: 5,
    dx: 0,
    dy: 0,
    jumping: false,
    gravity: 0.5,
    jumpPower: -22,
    alive: true
};

const ground = {
    x: 0,
    y: window.innerHeight - 10,
    width: window.innerWidth,
    height: 10,
    color: 'red'
};

let obstacles = [];
let frame = 0;
let score = 0;
let gameSpeed = character.speed;
let minObstacleGap = 200; // Minimum gap between obstacles
let maxObstacleGap = 400; // Maximum gap between obstacles
let nextObstacleFrame = Math.floor(Math.random() * (maxObstacleGap - minObstacleGap + 1)) + minObstacleGap + 50; // Ensure first obstacle appears sooner

// Obstacle size ranges
const minObstacleWidth = 100; // Minimum obstacle width
const maxObstacleWidth = 200; // Maximum obstacle width
const minObstacleHeight = 350; // Minimum obstacle height
const maxObstacleHeight = 250; // Maximum obstacle height

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ground.y = canvas.height - 10;
    character.y = ground.y - character.height;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function drawBackground() {
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
}

function drawCharacter() {
    ctx.drawImage(airplaneImg, character.x, character.y, character.width, character.height);
}

function drawGround() {
    ctx.fillStyle = ground.color;
    ctx.fillRect(ground.x, ground.y, ground.width, ground.height);
}

function drawObstacles() {
    obstacles.forEach(obstacle => {
        ctx.drawImage(obstacleImg, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
}

function clear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function newPos() {
    if (!character.alive) return;

    character.x += character.dx;
    character.y += character.dy;

    // Apply gravity
    if (character.y + character.height < ground.y) {
        character.dy += character.gravity;
    } else {
        character.dy = 0;
        character.y = ground.y - character.height;
        character.jumping = false;
    }

    // Prevent going out of canvas
    if (character.x < 0) {
        character.x = 0;
    }

    if (character.x + character.width > canvas.width) {
        character.x = canvas.width - character.width;
    }

    // Collision detection
    obstacles.forEach(obstacle => {
        if (
            character.x + character.width > obstacle.x &&
            character.x < obstacle.x + obstacle.width &&
            character.y + character.height > obstacle.y &&
            character.y < obstacle.y + obstacle.height
        ) {
            character.alive = false;
            gameOver();
        }
    });
}

function drawExplosion() {
    ctx.drawImage(explosionImg, character.x, character.y, character.width, character.height);
}

function update() {
    if (!character.alive) return;

    clear();
    drawBackground();
    drawGround();
    drawObstacles();
    drawCharacter();
    newPos();
    updateObstacles();
    updateScore();
    requestAnimationFrame(update);
}

function updateObstacles() {
    frame++;
    if (frame > nextObstacleFrame) {
        const obstacleWidth = Math.random() * (maxObstacleWidth - minObstacleWidth) + minObstacleWidth;
        const obstacleHeight = Math.random() * (maxObstacleHeight - minObstacleHeight) + minObstacleHeight;
        obstacles.push({
            x: canvas.width,
            y: ground.y - obstacleHeight,
            width: obstacleWidth,
            height: obstacleHeight
        });
        nextObstacleFrame = frame + Math        .floor(Math.random() * (maxObstacleGap - minObstacleGap + 1)) + minObstacleGap;
    }

    obstacles = obstacles.filter(obstacle => obstacle.x + obstacle.width > 0);

    obstacles.forEach(obstacle => {
        obstacle.x -= gameSpeed;
    });
}

function updateScore() {
    score += 0.01;
    scoreDisplay.textContent = `Score: ${Math.floor(score)}`;

    // Increase speed every 50 points
    if (Math.floor(score) % 50 === 0 && gameSpeed === character.speed + Math.floor(score / 50) - 1) {
        gameSpeed++;
    }
}

function gameOver() {
    drawExplosion();
    showModal();
    updateFinalScore();
}

// Add event listeners for keydown and keyup events
window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);

// Define functions to handle key events
function handleKeyDown(event) {
    if (event.key === 'ArrowRight' || event.key === 'Right') {
        character.dx = character.speed;
    } else if (event.key === 'ArrowLeft' || event.key === 'Left') {
        character.dx = -character.speed;
    } else if (event.key === 'ArrowUp' || event.key === 'Up') {
        if (!character.jumping) {
            character.dy = character.jumpPower;
            character.jumping = true;
        }
    }
}

function handleKeyUp(event) {
    if (
        (event.key === 'ArrowRight' || event.key === 'Right') &&
        character.dx > 0
    ) {
        character.dx = 0;
    } else if (
        (event.key === 'ArrowLeft' || event.key === 'Left') &&
        character.dx < 0
    ) {
        character.dx = 0;
    }
}
// Add event listeners for touch events
canvas.addEventListener('touchstart', handleTouchStart);
canvas.addEventListener('touchmove', handleTouchMove);
canvas.addEventListener('touchend', handleTouchEnd);

// Define functions to handle touch events
let touchStartX = 0;
let touchStartY = 0;

function handleTouchStart(event) {
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
}

function handleTouchMove(event) {
    event.preventDefault(); // Prevent scrolling on touch devices
    const touchX = event.touches[0].clientX;
    const touchY = event.touches[0].clientY;
    const deltaX = touchX - touchStartX;
    const deltaY = touchY - touchStartY;
    if (deltaX > 0) {
        character.dx = character.speed;
    } else if (deltaX < 0) {
        character.dx = -character.speed;
    }
    if (deltaY < 0 && !character.jumping) {
        character.dy = character.jumpPower;
        character.jumping = true;
    }
}

function handleTouchEnd(event) {
    character.dx = 0;
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ground.y = canvas.height - 10;
    character.y = ground.y - character.height;
}

// Adjust canvas size on window resize
window.addEventListener('resize', resizeCanvas);
resizeCanvas();


function showModal() {
    // Add code to display game over modal
}

function updateFinalScore() {
    // Add code to update final score
}

// Rest of the code remains unchanged
function gameOver() {
    drawExplosion();
    showModal();
    updateFinalScore();
}

function showModal() {
    const modal = document.getElementById('endModal');
    const span = document.getElementsByClassName('close')[0];
    modal.style.display = 'block';
    span.onclick = function() {
        modal.style.display = 'none';
        resetGame(); // Optional: Add a function to reset the game
    }
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
            resetGame(); // Optional: Add a function to reset the game
        }
    }
}

function updateFinalScore() {
    const finalScoreElement = document.getElementById('finalScore');
    finalScoreElement.textContent = Math.floor(score);
}

function resetGame() {
    // Reset any game variables or state here
    character.alive = true;
    character.x = 50;
    character.y = window.innerHeight - 200;
    obstacles = [];
    frame = 0;
    score = 0;
    gameSpeed = character.speed;
}


