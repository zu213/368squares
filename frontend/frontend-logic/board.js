export function elementGridToNumbers(elementGrid) {
    var numberGrid = []
    elementGrid.forEach((row) => {
        var numberRow = []
        row.forEach((cell) => {
            let chicken = cell.querySelector('.chicken')
            if(!chicken){
                numberRow.push(0)
            } else {
                let classList = chicken.classList
                if(classList.contains('yellow')) numberRow.push(1)
                else if(classList.contains('red')) numberRow.push(2)
                else if(classList.contains('pink')) numberRow.push(3)
                else if(classList.contains('green')) numberRow.push(4)
                else numberRow.push(0)
            }
        })
        numberGrid.push(numberRow)
    })
    return numberGrid
}

export function findWhatToRemove(board) {
    var remove = []

    for(var i = 0; i < 6; i++){
        var row = Array(6).fill(0)
        for(var j = 2; j < 6; j++){
            if(board[i][j] !== 0 && board[i][j] === board[i][j-1] && board[i][j-1] ===
    board[i][j-2]){
                row[j] = row[j-1] = row[j-2] = 1
            }
        }
        remove.push(row)
    }

    for(var i = 0; i < 6; i++){
        for(var j = 2; j < 6; j++){
            if(board[j][i] !== 0 && board[j][i] === board[j-1][i] && board[j-1][i] ===
    board[j-2][i]){
                remove[j][i] = remove[j-1][i] = remove[j-2][i] = 1
            }
        }
    }

    return remove
}

export function removeStuffFromGrid(elementGrid, removeGrid, numberGrid) {
    var score = 0
    for(var i = 0; i < 6; i++){
        for(var j = 0; j < 6; j++){
            if(removeGrid[i][j] === 1){
                elementGrid[i][j].innerHTML = ''
                numberGrid[i][j] = 0
                score++
            }
        }
    }
    return score
}

export function checkGameOver(numberBoard) {
    var horizontalMoves = false
    var verticalMoves = false

    for(var i = 0; i < 6; i++){
        for(var j = 0; j < 5; j++){
            if(numberBoard[i][j] === 0 && numberBoard[i][j + 1] === 0){
                horizontalMoves = true
            }
        }
    }
    for(var i = 0; i < 6; i++){
        for(var j = 0; j < 5; j++){
            if(numberBoard[j][i] === 0 && numberBoard[j + 1][i] === 0){
                verticalMoves = true
            }
        }
    }
    return [horizontalMoves, verticalMoves]
}

export function getColour(el){
    if(el == '') return 'none'
    if(el.classList.contains('yellow')) return 'yellow'
    if(el.classList.contains('red')) return 'red'
    if(el.classList.contains('pink')) return 'pink'
    if(el.classList.contains('green')) return 'green'
    return 'none'
}
