'use strict';

var gBoard = [];
var gLevels = [{ size: 4, mines: 2 }, { size: 8, mines: 12 }, { size: 12, mines: 30 }]
var gCurrLevel = gLevels[0];
var gShowAllMines = false;
var gTimerId; 
// var startStopWatch = false;
var gGame = {
    isOn: false,
    shownCount: 0,
    isMarkedCount: 0,
    secsPassed: 0
}

initBoard(0)

function initBoard(level) {
    gCurrLevel = gLevels[level]
    buildBoard()
    renderBoard()
}

function buildBoard() {
    gBoard = [];
    for (var x = 0; x < gCurrLevel.size; x++) {
        gBoard[x] = [];
        for (var y = 0; y < gCurrLevel.size; y++) {
            gBoard[x][y] = {
                minesAroundCount: 0,
                isMine: false,
                isShown: false,
                isMarked: false,
            };
        }
    }

    var minesCount = 0;
    while (minesCount < gCurrLevel.mines) {
        var xIdx = getRandomInt(0, gCurrLevel.size);
        var yIdx = getRandomInt(0, gCurrLevel.size);
        if (gBoard[xIdx][yIdx].isMine) continue
        minesCount++;
        gBoard[xIdx][yIdx].isMine = true;
    }
}

function renderBoard() {
    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = '';
    for (var x = 0; x < gCurrLevel.size; x++) {
        var elTr = document.createElement("tr")
        for (var y = 0; y < gCurrLevel.size; y++) {
            var elTd = document.createElement("td")

            elTd.className = gBoard[x][y].isMine && gShowAllMines ? "mine" : "unknown"; //add class         
            elTd.setAttribute("x", x);
            elTd.setAttribute("y", y);
            elTd.innerHTML = "&nbsp;"
            elTd.onclick = handleCellClick; 
            elTd.oncontextmenu = handleCellRightClick;
            gBoard[x][y].element = elTd;
            elTr.appendChild(elTd); //add td to tr
        }

        elBoard.appendChild(elTr); //add tr to the hard coded table in HTML
    }
}

function handleCellClick(e) {
    var x = +e.target.getAttribute("x");
    var y = +e.target.getAttribute("y");
    if (!gTimerId) startStopWatch()

    if (gBoard[x][y].isMine) {
        gShowAllMines = true;
        renderBoard(gCurrLevel.size);
        gameOver();
    } else {
        var minesCount = getMinesCountAroundCell(x, y);
        if (minesCount) {
            gBoard[x][y].element.innerText = minesCount;
        } else {
            getNeighboursMineCount(x, y);
        }
        gBoard[x][y].isShown = true;
        gBoard[x][y].element.className = 'revealed-cell';
        if (checkGameWin()) {
            gameWon()
        }
    }
}

function getNeighboursMineCount(cellX, cellY) {
    gBoard[cellX][cellY].element.className = 'revealed-cell';
    for (var x = cellX - 1; x <= cellX + 1; x++) {
        if (x < 0 || x >= gBoard.length) continue;
        for (var y = cellY - 1; y <= cellY + 1; y++) {
            if (y < 0 || y >= gBoard[0].length) continue;
            if (x === cellX && y === cellY) continue;

            gBoard[x][y].isShown = true;
            gBoard[x][y].element.className = 'revealed-cell';
            var minesCount = getMinesCountAroundCell(x, y);
            gBoard[x][y].element.innerHTML = minesCount ? minesCount : "&nbsp;";
            gBoard[x][y].element.onclick = null;
        }
    }
}

function getMinesCountAroundCell(cellX, cellY) {
    var minesAroundCount = 0;
    for (var x = cellX - 1; x <= cellX + 1; x++) {
        if (x < 0 || x >= gCurrLevel.size) continue;
        for (var y = cellY - 1; y <= cellY + 1; y++) {
            if (y < 0 || y >= gCurrLevel.size) continue;
            if (x === cellX && y === cellY) continue;
            if (gBoard[x][y].isMine) {
                minesAroundCount++;
            }
        }
    }
    return minesAroundCount
}

function checkGameWin() {
    gGame.shownCount = 0;
    for (var x = 0; x < gCurrLevel.size; x++) {
        for (var y = 0; y < gCurrLevel.size; y++) {
            if (gBoard[x][y].isShown) {
                ++gGame.shownCount
                console.log('show count:', gGame.shownCount);
            }
        }
    }
    return gCurrLevel.size ** 2 - gCurrLevel.mines === gGame.shownCount
}

function gameOver() {
    clearInterval(gTimerId);
    var modalOverLay = document.querySelector('.modal-overlay');
    var modal = document.querySelector('.modal');
    modal.innerText = 'Game Over';
    modalOverLay.style.visibility = "visible";
    modal.style.visibility = "visible";
}

function gameWon() {
    clearInterval(gTimerId);
    var modalOverLay = document.querySelector('.modal-overlay');
    var modal = document.querySelector('.modal');
    modal.innerText = 'Game Won';
    modalOverLay.style.visibility = "visible";
    modal.style.visibility = "visible";
}

function handleCellRightClick(e) {
    e.preventDefault()
    e.target.classList.toggle('flag') 
}

function getRandomInt(min, max) {
    min = Math.floor(min);
    max = Math.ceil(max);
    return Math.floor(Math.random() * (max - min) + min);
}

function startStopWatch() {
    var timer = document.querySelector('.controls .timer');
    var startTime = Date.now();
    gTimerId = setInterval(function() {
        var delta = Date.now() - startTime;
        timer.innerText = new Date(delta).toISOString().substr(14, 7)
    }, 100)
}