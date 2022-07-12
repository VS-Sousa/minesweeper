function minesweeper() {
    var cells = [];
    var bombs = [];
    const easyRatio = 0.126;
    const normalRatio = 0.181;
    const hardRatio = 0.206;
    var numberOfMines = 0;
    var numberOfSafeCells = 0;
    var progress = 0;
    var numberOfFlags = 0;
    var isFirstMove = true;
    var time = 0;
    var timer;

    function renderCell(cell) {
        let element = document.createElement('div');
        element.id = `divCell#${cell.x},${cell.y}`;
        element.classList.add('cell');
        element.classList.add('secret');

        if ((cell.x % 2) != (cell.y % 2)) {
            element.classList.add('alternative');
        }

        element.addEventListener('click', () => {
            handleDig(cell.x, cell.y);
        });
        element.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            handleFlag(cell.x, cell.y);
        })

        document.getElementById('gridBoard').appendChild(element);
    }

    function createBoard(rows, columns, difficulty) {
        for (let indexRow = 0; indexRow < rows; indexRow++) {
            let currentRow = [];
            
            for (let index = 0; index < columns; index++) {
                let cell = {
                    x: indexRow,
                    y: index,
                    hint: 0,
                    isBomb: false,
                    isFlagged: false,
                    wasReavealed: false,
                }

                currentRow.push(cell);
                renderCell(cell);
            }

            cells.push(currentRow);
        }
        
        switch (difficulty) {
            case 'easy':
                numberOfMines = Math.floor((rows * columns) * easyRatio);
                break;
            case 'hard':
                numberOfMines = Math.floor((rows * columns) * hardRatio);
                break;
            default:
                numberOfMines = Math.floor((rows * columns) * normalRatio);
                break;
        }

        numberOfFlags = numberOfMines
        numberOfSafeCells = (rows * columns) - numberOfMines;
        document.getElementById('spnFlags').innerText = numberOfFlags;
    }

    function setUpBoard(x, y) {
        let rows = cells.length;
        let columns = cells[0].length;

        for (let index = 1; index <= numberOfMines; index++) {
            let randomX = Math.floor(Math.random() * rows)
            let randomY = Math.floor(Math.random() * columns)
            
            if (
                (randomX >= x-1 && randomX <= x+1) 
                && (randomY >= y-1 && randomY <= y+1)
            ) {
                index--;
            } else {
                let isAlreadyBomb = cells[randomX][randomY].isBomb;

                if (isAlreadyBomb) {
                    index--;
                } else {
                    let bomb = {
                        x: randomX,
                        y: randomY
                    }

                    cells[randomX-1] && cells[randomX-1][randomY-1] && !cells[randomX-1][randomY-1].isBomb && cells[randomX-1][randomY-1].hint++;
                    cells[randomX-1] && cells[randomX-1][randomY] && !cells[randomX-1][randomY].isBomb && cells[randomX-1][randomY].hint++;
                    cells[randomX-1] && cells[randomX-1][randomY+1] && !cells[randomX-1][randomY+1].isBomb && cells[randomX-1][randomY+1].hint++;

                    cells[randomX] && cells[randomX][randomY-1] && !cells[randomX][randomY-1].isBomb && cells[randomX][randomY-1].hint++;
                    cells[randomX] && cells[randomX][randomY+1] && !cells[randomX][randomY+1].isBomb && cells[randomX][randomY+1].hint++;

                    cells[randomX+1] && cells[randomX+1][randomY-1] && !cells[randomX+1][randomY-1].isBomb && cells[randomX+1][randomY-1].hint++;
                    cells[randomX+1] && cells[randomX+1][randomY] && !cells[randomX+1][randomY].isBomb && cells[randomX+1][randomY].hint++;
                    cells[randomX+1] && cells[randomX+1][randomY+1] && !cells[randomX+1][randomY+1].isBomb && cells[randomX+1][randomY+1].hint++;

                    cells[randomX][randomY].isBomb = true;
                    bombs.push(bomb);
                }
            }
        }

        isFirstMove = false;
    }

    function startTimer() {
        timer = setInterval(() => {
            time++;
            document.getElementById('spnTime').innerText = String(time).padStart(3,'0');
        }, 1000);
    }

    function renderHint(x, y, hint) {
        let element = document.getElementById(`divCell#${x},${y}`);
        element.classList.remove('secret');

        if (hint != 0) {
            element.style.backgroundImage = `url('./assets/img/${hint}.png')`;
        }

        cells[x][y].wasReavealed = true;
        progress++;
    }

    function dig(x, y) {
        if (!cells[x][y].wasReavealed) {
            renderHint(x, y, cells[x][y].hint);
        }

        if (cells[x][y].hint == 0) {
            for (let indexRow = x-1; indexRow <= x+1; indexRow++) {
                if (indexRow >= 0 && indexRow < cells.length) {
                    for (let index = y-1; index <= y+1; index++) {
                        if (
                            index >=0 && index < cells[0].length 
                            && !(indexRow == x && index == y)
                        ) {
                            if (
                                !cells[indexRow][index].isBomb 
                                && !cells[indexRow][index].wasReavealed
                                && !cells[indexRow][index].isFlagged
                            ){
                                renderHint(indexRow, index, cells[indexRow][index].hint);
    
                                if (cells[indexRow][index].hint == 0) {
                                    dig(indexRow, index);
                                }

                            }
                        }
                    }
                }
            }
        }
    }

    function stopTimer() {
        clearInterval(timer);
    }

    function renderBomb(x, y) {
        let element = document.getElementById(`divCell#${x},${y}`);
        element.classList.remove('secret');
        element.classList.remove('flagged');
        element.classList.add('bomb');

        cells[x][y].wasReavealed = true;
    }

    function handleGameOver(x, y) {
        stopTimer();
        renderBomb(x, y);

        bombs.forEach((bomb, i) => {
            if (!cells[bomb.x][bomb.y].wasReavealed) {
                setTimeout(() => renderBomb(bomb.x, bomb.y), (i+1) * 250);
            }
        });

        setTimeout(() => {
            alert('Game Over! Tente novamente');
            window.location.reload();
        }, numberOfMines * 250 + 250);
    }

    function handleVictory() {
        stopTimer();
        setTimeout(() => {
            alert('Parabéns, você ganhou!');
            window.location.reload();
        }, 750);
    }

    function handleDig(x, y) {
        if (isFirstMove) {
            setUpBoard(x, y);
            startTimer();
        }
        
        const isAlreadyRevealed = cells[x][y].wasReavealed;

        if (isAlreadyRevealed) {
            return;
        }

        const kaboom = cells[x][y].isBomb;

        if (kaboom) {
            handleGameOver(x, y);
            return;
        }

        dig(x, y);

        const hasFinished = progress == numberOfSafeCells;

        if (hasFinished) {
            handleVictory();
        }
    }

    function renderFlag(x, y) {
        let element = document.getElementById(`divCell#${x},${y}`);
        element.classList.add('flagged');

        cells[x][y].isFlagged = true;
        numberOfFlags--;
        document.getElementById('spnFlags').innerText = numberOfFlags;
    }

    function removeFlag(x, y) {
        let element = document.getElementById(`divCell#${x},${y}`);
        element.classList.remove('flagged');

        cells[x][y].isFlagged = false;
        numberOfFlags++;
        document.getElementById('spnFlags').innerText = numberOfFlags;
    }

    function handleFlag(x, y) {
        const isAlreadyRevealed = cells[x][y].wasReavealed;

        if (isAlreadyRevealed) {
            return;
        }

        if (cells[x][y].isFlagged) {
            removeFlag(x, y);
        } else {
            renderFlag(x, y);
        }
    }

    return {
        createBoard
    }
}