// Revisa si el nombre del usuario ya está almacenado en LocalStorage
let user_name = localStorage.getItem('user_name');

if(user_name === null) {
    // Si no hay un nombre de usuario almacenado, solicita uno nuevo
    user_name = prompt("Por favor, introduce tu nombre:");
    localStorage.setItem('user_name', user_name);
}

const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');
canvas.focus();  // Asegura que el canvas tiene el enfoque

let box = 20;
let snake = [];
let startTime;



snake[0] = {x: 10 * box, y: 10 * box};

let direction;

let game;
let gameOver = false;


function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

canvas.addEventListener('touchstart', function() {
  if (gameOver) {
    restartGame();
  }
});

function getElapsedTime() {
    let elapsedTime = Date.now() - startTime;
    let seconds = Math.floor((elapsedTime / 1000) % 60);
    let minutes = Math.floor((elapsedTime / (1000 * 60)) % 60);
    return `${minutes} min ${seconds} sec`;
}


function startGame() {
    startTime = Date.now();
    game = setInterval(updateGame, 100);
}


function createBackground() {
    context.fillStyle = "lightgreen";
    context.fillRect(0, 0, 15*box, 15*box);
}

function createSnake() {
    for(let i = 0; i < snake.length; i++) {
        context.fillStyle = "green";
        context.fillRect(snake[i].x, snake[i].y, box, box);
    }
}

function updateSnakeDirection(event) {
    if(event.keyCode === 37 && direction !== "right") direction = "left";
    if(event.keyCode === 38 && direction !== "down") direction = "up";
    if(event.keyCode === 39 && direction !== "left") direction = "right";
    if(event.keyCode === 40 && direction !== "up") direction = "down";
    //console.log(direction);
}

window.focus();
window.addEventListener('keydown', updateSnakeDirection);
document.body.addEventListener('keydown', updateSnakeDirection);



let touchStartX = null;
let touchStartY = null;

document.addEventListener('touchstart', function(e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
}, false);

document.addEventListener('touchend', function(e) {
    let touchEndX = e.changedTouches[0].clientX;
    let touchEndY = e.changedTouches[0].clientY;
    handleSwipe(touchStartX, touchStartY, touchEndX, touchEndY);
}, false);

function handleSwipe(startX, startY, endX, endY) {
    let diffX = endX - startX;
    let diffY = endY - startY;

    if (Math.abs(diffX) > Math.abs(diffY)) {
        // Movimiento horizontal
        direction = (diffX > 0) ? 'right' : 'left';
    } else {
        // Movimiento vertical
        direction = (diffY > 0) ? 'down' : 'up';
    }
}

document.body.addEventListener('touchmove', function(e) { e.preventDefault(); }, false);


let apple = {
    x: Math.floor(Math.random() * 15) * box,
    y: Math.floor(Math.random() * 15) * box
}

function createApple() {
    context.fillStyle = "red";
    context.fillRect(apple.x, apple.y, box, box);
}

function checkAppleCollision() {
    if(snake[0].x == apple.x && snake[0].y == apple.y) {
        // Incrementa el tamaño de la serpiente
        let tail = {x: snakeX, y: snakeY}; 
        snake.push(tail);
        
        // Genera una nueva manzana en una ubicación aleatoria
        apple = {
            x: Math.floor(Math.random() * 15) * box,
            y: Math.floor(Math.random() * 15) * box
        }
    } else {
        // Mueve la serpiente
        snake.pop();
    }
}

let score = 0;
function drawGameOver() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "black";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "white";
    context.font = "10px Arial";
    context.textAlign = "center";
    context.fillText("¡Game Over!", canvas.width / 2, canvas.height / 2);
    context.fillText(`Tu puntaje es de ${score}`, canvas.width / 2, canvas.height / 2 + 40);
    context.fillText(`Tiempo de juego: ${getElapsedTime()}`, canvas.width / 2, canvas.height / 2 + 60);

    context.font = "15px Arial";
    context.fillText("Presiona Enter para comenzar de nuevo", canvas.width / 2, canvas.height / 2 + 80);
              document.body.addEventListener('keydown', restartGameOnEnter, {once: true});

  
}

function checkSelfCollision() {
    for(let i = 1; i < snake.length; i++) {
        if(snake[0].x === snake[i].x && snake[0].y === snake[i].y) {
            clearInterval(game);
            gameOver = true;
            drawGameOver();
            return true;
        }
    }
    return false;
}
function restartGameOnEnter(event) {
  if (event.key === 'Enter') {
    restartGame();
  }
}
function restartGame() {
    snake = [{x: box, y: box}];
    score = 0;
    direction = "right";
    gameOver = false;
    startTime = Date.now();
    window.removeEventListener('keydown', restartGameOnEnter);
    startGame();
}

function updateGame() {
    if(checkSelfCollision()) {
        return;
    }
    createBackground();
    createSnake();
    createApple();
    drawScore();
    let snakeX = snake[0].x;
    let snakeY = snake[0].y;

    if(direction === "right") snakeX = (snakeX + box) % (box * 15);
    if(direction === "left") snakeX = (snakeX - box + (box * 15)) % (box * 15);
    if(direction === "up") snakeY = (snakeY - box + (box * 15)) % (box * 15);
    if(direction === "down") snakeY = (snakeY + box) % (box * 15);

    if(snakeX == apple.x && snakeY == apple.y) {
        // La serpiente ha comido una manzana. Incrementa el score y genera una nueva manzana en una ubicación aleatoria
        score++;
        apple = {
            x: Math.floor(Math.random() * 15) * box,
            y: Math.floor(Math.random() * 15) * box
        }
    } else {
        // La serpiente no ha comido una manzana. Elimina la cola de la serpiente
        snake.pop();
    }

    // Siempre agrega una nueva cabeza a la serpiente
    let newHead = {x: snakeX, y: snakeY};
    snake.unshift(newHead);

}

function drawScore() {
    context.fillStyle = "white";
    context.font = "16px Arial";
    context.textAlign = "end";
    context.fillText(score, canvas.width - 10, 30);
    context.fillText(getElapsedTime(), canvas.width - 10, 50);

}

// Dibuja el estado inicial del juego
createBackground();
createSnake();
createApple();
drawScore();

// Iniciar el juego por primera vez
startGame();