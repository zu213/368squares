import { fetchBoard } from './bridge.js'
import { createChickens } from './createChickens.js'

var remainingChickens = 368
var isDragging = false
var direction
var offsetX = 0
var offsetY = 0
var genChicken = true
var chickenDragElement
var gameOver = false
var validMoves = [true, true]

document.addEventListener("DOMContentLoaded", function () {
    let grid = document.getElementById("grid")

    for(var i = 0; i < 6; i++){
        let gridRowElement = document.createElement('div') 
        gridRowElement.classList.add('grid-row')
        for(var j = 0; j<6; j++){
            let gridColumnElement = document.createElement('div')
            gridColumnElement.innerHTML = `<div id="${i*6 + j}" class="grid-element-inner"></div>`
            gridColumnElement.classList.add('grid-element')
            gridRowElement.appendChild(gridColumnElement)
        }
        grid.appendChild(gridRowElement)
    }

    generateChicken()

    // Mouse Move -> Move Element with Cursor
    document.addEventListener("mousemove", (e) => {
        e.preventDefault()
        moveSquare(e)
    })

    document.addEventListener("touchmove", (e) => {
        let touch = e.touches[0] || e.changedTouches[0]
        e.preventDefault()
        moveSquare(touch)
    }, { passive: false })

    // allow Dropping in Grid
    document.addEventListener("mouseup", (e) => {
        if (isDragging) {
            checkValidPlace(e, direction, chickenDragElement)
            isDragging = false
        }
    })

    document.addEventListener("touchend", (e) => {
        if (isDragging) {
            e.preventDefault()
            let touch = e.touches[0] || e.changedTouches[0]
            checkValidPlace(touch, direction, chickenDragElement)
            isDragging = false
        }
     }, { passive: false })

    updateChickens()
    loadLeaderboard()
    document.getElementById('resetButton').addEventListener('click', resetBoard)
})

function checkValidPlace(e, direction, chickenDragElement){
    // left: 1, up: 2, right: 3, down: 4
    chickenDragElement.style.display = "none"
    const xPoint = e.clientX - (offsetX - 20) * 0.5
    const yPoint = e.clientY - offsetY * 0.5
    let element = document.elementFromPoint(xPoint, yPoint)
    if(element.innerHTML != '') element = element.childNodes[0]
    chickenDragElement.style.display = "block"

    if(direction == 2  && Number(element.id) % 6 != 5){
        let elementAbove = document.getElementById(`${Number(element.id) + 1}`)
        if(element.innerHTML == '' && elementAbove && elementAbove?.innerHTML == '' && !element.classList.contains('chicken') && !elementAbove.classList.contains('chicken')){
            const left = chickenDragElement.querySelector('.left')
            left.classList.remove('left')
            const right = chickenDragElement.querySelector('.right')
            right.classList.remove('right')
            element.appendChild(left) // Move draggable to cell
            elementAbove.appendChild(right)
            chickenDragElement.classList.remove('draggable')
            checkMatch(Number(element.id))
            generateChicken()

        }else{
            document.getElementById('chickenGenerator').appendChild(chickenDragElement)
        }
    } else if(direction == 1 && Number(element.id) % 6 < 30) {
        let elementAbove = document.getElementById(`${Number(element.id) + 6}`)
        if(element.innerHTML == '' && elementAbove && elementAbove?.innerHTML == '' && !element.classList.contains('chicken') && !elementAbove.classList.contains('chicken')){
            console.log(element)
            element.appendChild(chickenDragElement.querySelector('.top')) // Move draggable to cell
            elementAbove.appendChild(chickenDragElement.querySelector('.bottom'))
            chickenDragElement.classList.remove('draggable')
            checkMatch(Number(element.id))
            generateChicken()

        }else{
            document.getElementById('chickenGenerator').appendChild(chickenDragElement)
        }
    }
    chickenDragElement.style.position = "relative" // Reset position to align with cell
    chickenDragElement.style.left = "0px"
    chickenDragElement.style.top = "0px"
}


function generateChicken(){
    if(gameOver) return
    chickenDragElement = createChickens(handleDrag, validMoves)
    document.getElementById('chickenGenerator').appendChild(chickenDragElement)
}

function handleDrag(e) {
    let element = document.elementFromPoint(e.clientX, e.clientY)
    const offsetEl = element.classList.contains('chickenHolder') ? element : element.parentElement
    const rect = offsetEl.getBoundingClientRect()
    offsetX = e.clientX - rect.left
    offsetY = e.clientY - rect.top

    if(element.classList.contains('chickenHolder')){
        direction = element.children[0].classList.contains('top') ? 2 : 1
    } else if(element.classList.contains('top') || element.classList.contains('bottom')){
        offsetY += 10
        direction = 1
    } else if(element.classList.contains('left') || element.classList.contains('right')){
        direction = 2
    } else {
        throw Error('Error')
    }
    isDragging = true
    chickenDragElement.style.zIndex = "1000"
}

function moveSquare(e) {
    if (isDragging) {
        chickenDragElement.style.position = 'fixed'
        chickenDragElement.style.left = `${e.clientX - offsetX}px`
        chickenDragElement.style.top = `${e.clientY - offsetY}px`
    }
}

function getColour(el){
    if(el == '') return 'none'
    if(el.classList.contains('yellow')) return 'yellow'
    if(el.classList.contains('red')) return 'red'
    if(el.classList.contains('pink')) return 'pink'
    if(el.classList.contains('green')) return 'green'
    return 'none'
}

function updateChickens(){
    document.getElementById('remainingChickens').innerText = `${remainingChickens} remaining`
}

function checkMatch(pos){
    var toRemove = []
    var counter = 0

    const elementBoard = boardToElementGrid()
    const numberBoard = elementGridToNumbers(elementBoard)
    const removeBoard = findWhatToRemove(numberBoard)
    const score = removeStuffFromGrid(elementBoard, removeBoard, numberBoard)
    validMoves = checkGameOver(numberBoard)
    if (!validMoves[0] && !validMoves[1]){
        gameOver = true
        alert('Game Over!')
        return
    }

    remainingChickens -= score
    updateChickens()
}

function showGameOver() {}

function resetBoard() {

    const grid = document.getElementById('grid')
    for(var i = 0; i < 6; i++){
        for(var j = 0; j<6; j++){
            grid.children[i].children[j].children[0].innerHTML = ''
        }
    }
    remainingChickens = 368
    gameOver = false
    validMoves = [true, true]
    updateChickens()
    generateChicken()
}

function boardToElementGrid() {
    var elementGrid = []
    document.querySelectorAll('.grid-row').forEach((el, index) => {
        let row = []
        el.childNodes.forEach((cell) => {
            row.push(cell.childNodes[0])
        })
        elementGrid.push(row)
    })
    return elementGrid
}

function elementGridToNumbers(elementGrid) {
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

function findWhatToRemove(board) {

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

function removeStuffFromGrid(elementGrid, removeGrid, numberGrid) {
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

function checkGameOver(numberBoard) {
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

async function loadLeaderboard() {
    const leaderboard = document.getElementById('leaderboard-list')
    const boardList = await fetchBoard()
    for(const entry of boardList) {
        const entryElement = document.createElement('div')
        entryElement.classList.add('leaderboard-entry')
        entryElement.innerHTML = `<span class="leaderboard-name">${entry.name}</span>
                                  <span class="leaderboard-score">${entry.score}</span>`
        leaderboard.appendChild(entryElement)
    }
}