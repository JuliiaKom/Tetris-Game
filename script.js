

const PLAYFIELD_COLUMNS = 10;
const PLAYFIELD_ROWS = 20;
const overlay = document.querySelector('.overlay');
const btnRestart = document.querySelector('.btn-restart');
const scoreElement = document.querySelector('#score');
let audioPlayer = document.querySelector('#audioPlayer');
let soundButton = document.querySelector('.sound_button');
let playfield;
let tetromino;
let score = 0;
let intervalId;
let nextElement = document.querySelector('.next-tetromino');
let isGameOver = false;
let isPaused = false;
let up = document.querySelector('.up');
let down = document.querySelector('.down');
let left = document.querySelector('.left');
let right = document.querySelector('.right');

const TETROMINO_NAMES = ['O', 'J', 'I', 'Z', 'K', 'T', 'S', 'L', 'U', 'X'];
const TETROMINOES = {
    'O': [
        [1, 1],
        [1, 1]
    ],
    'J': [
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 0]
    ],
    'I': [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ],
    'Z': [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0]
    ],
    'K': [
        [0, 1, 0],
        [0, 1, 1],
        [0, 1, 0]
    ],
    'T': [
        [1, 1, 1],
        [0, 1, 0],
        [0, 0, 0]
    ],
    'S': [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0]
    ],
    'L': [
        [0, 0, 0],
        [1, 1, 1],
        [0, 0, 1]
    ],
    'U': [
        [1, 0, 1],
        [1, 1, 1],
        [0, 0, 0]
    ],
    'X': [
        [0, 1, 0],
        [1, 1, 1],
        [0, 1, 0]
    ]
}
let cells;
init();


function init() {
    score = 0;
    scoreElement.innerHTML = 0;
    isGameOver = false;
    generatePlayField();
    generateRandomElement();
    cells = document.querySelectorAll(".grid div");
    moveDown();

}

btnRestart.addEventListener('click', function () {
    document.querySelector('.grid').innerHTML = '';
    overlay.style.display = 'none';
    init();
})

function convertPositionToIndex(row, column) {
    return row * PLAYFIELD_COLUMNS + column;
}

function generatePlayField() {
    for (let i = 0; i < PLAYFIELD_ROWS * PLAYFIELD_COLUMNS; i++) {
        const div = document.createElement("div");
        document.querySelector('.grid').append(div);
    }

    playfield = new Array(PLAYFIELD_ROWS).fill()
        .map(() => new Array(PLAYFIELD_COLUMNS).fill(0))
    // console.table(playfield);   
}

function generateRandomElement() {
    const randomIndex = Math.floor(Math.random() * TETROMINO_NAMES.length);
    const name = TETROMINO_NAMES[randomIndex];
    const matrix = TETROMINOES[name];
    const rowTetro = -2;

    tetromino = {
        name,
        matrix,
        row: rowTetro,
        column: Math.floor((PLAYFIELD_COLUMNS - matrix[0].length) / 2)
    };
    displayNextTetromino();
}

// Функція генерації наступної фігури
//
function displayNextTetromino() {
	// Генеруємо наступну фігуру
	const tetroNameLength = TETROMINO_NAMES.length - 1;

	const name = TETROMINO_NAMES[randomIndex];
	const matrix = TETROMINOES[name];

	let nextTetromino = {
		name,
		matrix,
	};

	nextElement.innerHTML = '';

	for (let row = 0; row < 4; row++) {
		for (let column = 0; column < 4; column++) {
			const cell = document.createElement('div');
			cell.classList.add('next-tetromino-cell');
			if (matrix[row] && matrix[row][column]) {
				cell.classList.add(nextTetromino.name);
			}

			nextElement.appendChild(cell);
		}
	}
}

function placeTetromino() {
    const matrixSize = tetromino.matrix.length;
    for (let row = 0; row < matrixSize; row++) {
        for (let column = 0; column < matrixSize; column++) {
            if (isOutsideOfTopboard(row)) {
                isGameOver = true;
                return;
            }
            if (tetromino.matrix[row][column]) {
                // playfield[tetromino.row + row][tetromino.column + column] = tetromino.name;
                if (tetromino.row + row >= 0
                    && tetromino.row + row < PLAYFIELD_ROWS
                    && tetromino.column + column >= 0
                    && tetromino.column + column < PLAYFIELD_COLUMNS) {
                    playfield[tetromino.row + row][tetromino.column + column] = tetromino.name;
                }
            }
        }
    }
    const rowsCleared = findFilledRows();
    removeFillRows(rowsCleared);
    generateRandomElement();
}

function removeFillRows(rowsCleared) {
    for (let i = 0; i < rowsCleared.length; i++) {
        const row = rowsCleared[i];
        dropRowsAbove(row);
    }
}

function dropRowsAbove(rowDelete) {
    for (let row = rowDelete; row > 0; row--) {
        playfield[row] = playfield[row - 1]
    }
    playfield[0] = new Array(PLAYFIELD_COLUMNS).fill(0);
}

function findFilledRows() {
    // const rowsClear = [];
    const rowsCleared = [];
    for (let row = 0; row < PLAYFIELD_ROWS; row++) {
        let columnsCleared = 0;
        for (let column = 0; column < PLAYFIELD_COLUMNS; column++) {
            if (playfield[row][column] !== 0) {
                columnsCleared++;
            }
        }
        if (columnsCleared === PLAYFIELD_COLUMNS) {
            rowsCleared.push(row);
        }
    }

    // const rowsCleared = rowsClear.length;

    switch (rowsCleared.length) {
        case 1:
            score += 10;
            break;
        case 2:
            score += 30;
            break;
        case 3:
            score += 50;
            break;
        case 4:
            score += 100;
            break;

        default:
            break;
    }
    scoreElement.innerHTML = score;
    updateLevel(score);
    return rowsCleared;
}

function drawPlayField() {
    for (let row = 0; row < PLAYFIELD_ROWS; row++) {
        for (let column = 0; column < PLAYFIELD_COLUMNS; column++) {
            if (playfield[row][column] == 0) continue;

            const name = playfield[row][column];
            const cellIndex = convertPositionToIndex(row, column);
            // console.log(cellIndex);
            cells[cellIndex].classList.add(name);
        }
    }
}

function drawTetromino() {
    const name = tetromino.name;
    const tetrominoMatrixSize = tetromino.matrix.length;

    for (let row = 0; row < tetrominoMatrixSize; row++) {
        for (let column = 0; column < tetrominoMatrixSize; column++) {

            //Щоб подивитись рузультат алгоритму з функції rotateMatrix()!

            // const cellIndex = convertPositionToIndex(
            //     tetromino.row + row,
            //     tetromino.column + column
            // );
            // cells[cellIndex].innerHTML = showRotated[row][column];
            //-------------------------------------------------
            if (isOutsideOfTopboard(row)) continue;
            if (!tetromino.matrix[row][column]) continue;
            const cellIndex = convertPositionToIndex(
                tetromino.row + row,
                tetromino.column + column
            );
            // console.log(cellIndex);
            cells[cellIndex].classList.add(name);
        }
        //column
    }
    //row
}

function draw() {
    cells.forEach(cell => cell.removeAttribute('class'));
    drawPlayField();
    drawTetromino();
}
// let showRotated = [
//     [1, 2, 3],
//     [4, 5, 6],
//     [7, 8, 9]

// ]

function rotateTetramino() {
    const oldMatrix = tetromino.matrix;
    const rotatedMatrix = rotateMatrix(tetromino.matrix);

    tetromino.matrix = rotatedMatrix;
    if (!isValid()) {
        tetromino.matrix = oldMatrix;
    }
}
function rotate() {
    rotateTetramino();
    draw();
}

// Функції для обробки подій
function rotateTetrominoEvent() {
	rotate();
}

function moveTetrominoDownContinuous    () {
	moveTetrominoDown();
	draw();
}

function moveTetrominoLeftContinuous() {
	moveTetrominoLeft();
	draw();
}

function moveTetrominoRightContinuous() {
	moveTetrominoRight();
	draw();
}
up.addEventListener('click', () => {
    rotateTetrominoEvent();
});

down.addEventListener('click', () => {
    moveTetrominoDownContinuous();
});

left.addEventListener('click', () => {
    moveTetrominoLeftContinuous();
});

right.addEventListener('click', () => {
    moveTetrominoRightContinuous();
});

// Обробка натискання на кнопку
up.addEventListener('mousedown', () => {
    intervalId = setInterval(rotateTetrominoEvent, 100);
});

down.addEventListener('mousedown', () => {
    intervalId = setInterval(moveTetrominoDownContinuous, 100);
});

left.addEventListener('mousedown', () => {
    intervalId = setInterval(moveTetrominoLeftContinuous, 100);
});

right.addEventListener('mousedown', () => {
    intervalId = setInterval(moveTetrominoRightContinuous, 100);
});

// Обробка відтискання кнопки
up.addEventListener('mouseup', () => {
    clearInterval(intervalId);
});

down.addEventListener('mouseup', () => {
    clearInterval(intervalId);
});

left.addEventListener('mouseup', () => {
    clearInterval(intervalId);
});

right.addEventListener('mouseup', () => {
    clearInterval(intervalId);
});

document.addEventListener('keydown', onKeyDown);
function onKeyDown(e) {

    switch (e.key) {
        case '':
            dropTetrominoDown();
            break;
        case 'ArrowUp':
            rotate();
            break;
        case 'ArrowDown':
            moveTetrominoDown();
            break;

        case 'ArrowLeft':
            moveTetrominoLeft();
            break;

        case 'ArrowRight':
            moveTetrominoRight();
            break;
    }
    draw();
}

function dropTetrominoDown() {
    while (!isValid()) {
        tetromino.row++;
    }
    tetromino.row--;
}

function rotateMatrix(matrixTetromino) {
    const N = matrixTetromino.length;
    const rotateMatrix = [];

    for (i = 0; i < N; i++) {
        rotateMatrix[i] = [];
        for (let j = 0; j < N; j++) {
            rotateMatrix[i][j] = matrixTetromino[N - j - 1][i];
        }
    }
    return rotateMatrix;
}

function moveTetrominoDown() {
    tetromino.row += 1;
    if (!isValid()) {
        tetromino.row -= 1;
        placeTetromino();
    }
    if (isGameOver) {
        gameOver();
    }
}

function gameOver() {
    stopMoveDown();
    overlay.style.display = 'flex';
}

function moveTetrominoLeft() {
    tetromino.column -= 1;
    if (!isValid()) {
        tetromino.column += 1;
    }
}

function moveTetrominoRight() {
    tetromino.column += 1;
    if (!isValid()) {
        tetromino.column -= 1;
    }
}

function moveDown() {
    moveTetrominoDown();
    draw();
    stopMoveDown();
    startMoveDown();
}
moveDown();

function startMoveDown() {
    if (!intervalId) {
        intervalId = setTimeout(() => { requestAnimationFrame(moveDown) }, 700);
    }

}

function stopMoveDown() {
    cancelAnimationFrame(intervalId);
    clearTimeout(intervalId);

    intervalId = null;
}

document.addEventListener('DOMContentLoaded', function () {
    let pause_btn = document.querySelector(".pause");

    pause_btn.addEventListener('click', function () {
        if (pause_btn) {
            togglePauseGame();
        }
    })
});

function togglePauseGame() {
    if (isPaused == false) {
        stopMoveDown();
    } else {

        startMoveDown();
    }
    isPaused = !isPaused;
}

function isValid() {
    const matrixSize = tetromino.matrix.length;
    for (let row = 0; row < matrixSize; row++) {
        for (let column = 0; column < matrixSize; column++) {
            if (isOutsideOfGameboard(row, column)) { return false; }
            if (hasCollisions(row, column)) { return false; }
        }
    }
    return true;
}

function isOutsideOfTopboard(row) {
    return tetromino.row + row < 0;
}

function isOutsideOfGameboard(row, column) {
    return tetromino.matrix[row][column] &&
        (
            tetromino.column + column < 0
            || tetromino.column + column >= PLAYFIELD_COLUMNS
            || tetromino.row + row >= playfield.length
        );
}

function hasCollisions(row, column) {
    return tetromino.matrix[row][column]
        && playfield[tetromino.row + row]?.[tetromino.column + column];
}

document.addEventListener('DOMContentLoaded', function () {
    soundButton.addEventListener('click', function () {
        if (audioPlayer.paused) {
            audioPlayer.play();
        } else {
            audioPlayer.pause();
        }
    });
});

document.addEventListener('DOMContentLoaded', function () {
    let timeElement = document.querySelector("#timeGame");
    let seconds = 0;
    let minutes = 0;

    setInterval(function () {
        seconds++;
        if (seconds === 60) {
            seconds = 0;
            minutes++;
        }
        timeElement.textContent = (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds < 10 ? "0" + seconds : seconds);
    }, 1000);
});


function updateLevel() {
    let level = Math.floor(score / 50) + 1
    document.querySelector("#level").textContent = level;
}
