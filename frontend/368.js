import { fetchBoard, postInputToBoard } from './frontend-logic/bridge.js'
import { createChickens } from './frontend-logic/createChickens.js'
import { elementGridToNumbers, findWhatToRemove, removeStuffFromGrid, checkGameOver, getColour } from './frontend-logic/board.js'

var remainingChickens = 368
var cachedBoard = []
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
            clearHighlights()
            checkValidPlace(e, direction, chickenDragElement)
            isDragging = false
        }
    })

    document.addEventListener("touchend", (e) => {
        if (isDragging) {
            e.preventDefault()
            clearHighlights()
            let touch = e.touches[0] || e.changedTouches[0]
            checkValidPlace(touch, direction, chickenDragElement)
            isDragging = false
        }
     }, { passive: false })

    updateChickens()
    loadLeaderboard()
    document.getElementById('resetButton').addEventListener('click', resetBoard)
    document.getElementById('infoButton').addEventListener('click', showInfoPopup)
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

var highlightedCells = []

function clearHighlights() {
    highlightedCells.forEach(el => el.classList.remove('drop-highlight'))
    highlightedCells = []
}

function moveSquare(e) {
    if (isDragging) {
        chickenDragElement.style.position = 'fixed'
        chickenDragElement.style.left = `${e.clientX - offsetX}px`
        chickenDragElement.style.top = `${e.clientY - offsetY}px`

        clearHighlights()
        chickenDragElement.style.display = "none"
        const xPoint = e.clientX - (offsetX - 20) * 0.5
        const yPoint = e.clientY - offsetY * 0.5
        let element = document.elementFromPoint(xPoint, yPoint)
        chickenDragElement.style.display = "block"
        if (!element) return
        if (element.innerHTML != '') element = element.childNodes[0]
        if (!element || !element.id) return

        let partner = null
        if (direction == 2 && Number(element.id) % 6 != 5)
            partner = document.getElementById(`${Number(element.id) + 1}`)
        else if (direction == 1 && Number(element.id) < 30)
            partner = document.getElementById(`${Number(element.id) + 6}`)

        if (partner) {
            element.classList.add('drop-highlight')
            partner.classList.add('drop-highlight')
            highlightedCells = [element, partner]
        }
    }
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
        showGameOver(remainingChickens)
        return
    }

    remainingChickens -= score
    updateChickens()
}

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
    document.getElementById('chickenGenerator').innerHTML = ''
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

async function loadLeaderboard() {
    const leaderboard = document.getElementById('leaderboard-list')
    leaderboard.innerHTML = ''
    const boardList = await fetchBoard().catch(() => null)
    if (!boardList) {
        leaderboard.innerHTML = '<div class="leaderboard-error">Couldn\'t load scores</div>'
        return
    }
    cachedBoard = boardList.slice(0, 10)
    cachedBoard.forEach((entry, i) => {
        const entryElement = document.createElement('div')
        entryElement.classList.add('leaderboard-entry')
        entryElement.innerHTML = `<span class="leaderboard-rank">${i + 1}</span><span class="leaderboard-name">${entry.name}</span><span class="leaderboard-score">${entry.score}</span>`
        leaderboard.appendChild(entryElement)
    })
}

function showInfoPopup() {
    const template = document.getElementById('infoPopupTemplate')
    const popup = template.content.cloneNode(true)
    const container = popup.querySelector('.leaderboard-form-container')

    const close = () => document.body.removeChild(container)

    popup.querySelector('.leaderboard-close').addEventListener('click', close)
    container.addEventListener('click', (e) => {
        if (e.target === container) close()
    })

    document.body.appendChild(popup)
}

function showGameOver(score) {
    const scoreSubmitTemplate = document.getElementById('leaderboardEntryTemplate')
    const scoreSubmitElement = scoreSubmitTemplate.content.cloneNode(true)

    scoreSubmitElement.querySelector('.leaderboard-score-input').textContent = score

    const scoreForm = scoreSubmitElement.querySelector('#scoreForm')
    const container = scoreSubmitElement.querySelector('.leaderboard-form-container')

    const close = () => document.body.removeChild(container)

    scoreSubmitElement.querySelector('.leaderboard-close').addEventListener('click', close)

    container.addEventListener('click', (e) => {
        if (e.target === container) close()
    })

    scoreForm.addEventListener('submit', (e) => {
        e.preventDefault()
        const nameInput = scoreForm.querySelector('.leaderboard-name-input')
        const qualifies = cachedBoard.length < 10 || score < cachedBoard[cachedBoard.length - 1].score
        if (qualifies) {
            postInputToBoard(nameInput.value, score).then(() => {
                loadLeaderboard()
                close()
            })
        } else {
            close()
        }
    })

    document.body.appendChild(scoreSubmitElement)
}