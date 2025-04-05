

var remainingChickens = 368
var chickenGen
var isDragging = false
var direction
var offsetX
var offsetY
var genChicken = true
var draggable

document.addEventListener("DOMContentLoaded", function () {
    let grid = document.getElementById("grid")

    for(var i = 0; i < 6; i++){
        let gridRowElement = document.createElement('div') 
        gridRowElement.classList.add('gridRow')
        for(var j = 0; j<6; j++){
            let gridColumnElement = document.createElement('div')
            gridColumnElement.innerHTML = `<div id="${i*6 + j}" class="gridElementInner"></div>`
            gridColumnElement.classList.add('gridElement')
            gridRowElement.appendChild(gridColumnElement)
        }
        grid.appendChild(gridRowElement)
    }

    generateChicken()

    // Mouse Move -> Move Element with Cursor
    document.addEventListener("mousemove", (e) => {
        if (isDragging) {
            draggable.style.position = 'fixed'
            draggable.style.left = `${e.clientX - 10}px`
            draggable.style.top = `${e.clientY - 10}px`
        }
    })

    document.addEventListener("touchmove", (e) => {
        if (isDragging) {
            e.preventDefault()
            let touch = e.touches[0] || e.changedTouches[0]
            draggable.style.position = 'fixed'
            draggable.style.left = `${touch.clientX - 10}px`
            draggable.style.top = `${touch.clientY - 10}px`
        }
    }, { passive: false })

    // allow Dropping in Grid
    document.addEventListener("mouseup", (e) => {
        if (isDragging) {
            checkValidPlace(e, direction, draggable)
            isDragging = false
        }
    })

    document.addEventListener("touchend", (e) => {
        if (isDragging) {
            e.preventDefault()
            let touch = e.touches[0] || e.changedTouches[0]
            checkValidPlace(touch, direction, draggable)
            isDragging = false
        }
     }, { passive: false })

    updateChickens()
})

function assignPositions(chickens){
    let randomNum = Math.random()
    if(randomNum <= 0.5){
        chickens.children[0].classList.add('top')
        chickens.children[1].classList.add('bottom')
    }else{
        chickens.children[0].classList.add('left')
        chickens.children[1].classList.add('right')
    }
    for(var i = 0; i < 2; i++){
        let colour = Math.random()
        if(colour <= 0.25){
            chickens.children[i].classList.add('pink')
        }else  if(colour <= 0.5){
            chickens.children[i].classList.add('red')
        }else  if(colour <= 0.75){
            chickens.children[i].classList.add('green')
        }else {
            chickens.children[i].classList.add('yellow')
        }
    }
    return chickens
}

function checkValidPlace(e, direction, draggable){
    // left: 1, up: 2, right: 3, down: 4
    draggable.style.display = "none"
    let element = document.elementFromPoint(e.clientX, e.clientY)
    draggable.style.display = "block"

    if(direction == 2  && Number(element.id) % 6 != 5){
        let elementAbove = document.getElementById(`${Number(element.id) + 1}`)
        if(element.innerHTML == '' && elementAbove && elementAbove?.innerHTML == '' && !element.classList.contains('chicken') && !elementAbove.classList.contains('chicken')){
            const left = draggable.querySelector('.left')
            left.classList.remove('left')
            const right = draggable.querySelector('.right')
            right.classList.remove('right')
            element.appendChild(left) // Move draggable to cell
            elementAbove.appendChild(right)
            draggable.classList.remove('draggable')
            checkMatch(Number(element.id))
            checkMatch(Number(element.id) + 1)
            generateChicken()

        }else{
            chickenGen.appendChild(draggable)
        }
    } else if(Number(element.id) % 6 < 30) {
        let elementAbove = document.getElementById(`${Number(element.id) + 6}`)
        if(element.innerHTML == '' && elementAbove && elementAbove?.innerHTML == '' && !element.classList.contains('chicken') && !elementAbove.classList.contains('chicken')){
            element.appendChild(draggable.querySelector('.top')) // Move draggable to cell
            elementAbove.appendChild(draggable.querySelector('.bottom'))
            draggable.classList.remove('draggable')
            checkMatch(Number(element.id))
            checkMatch(Number(element.id) + 6)
            generateChicken()

        }else{
            chickenGen.appendChild(draggable)
        }
    }
    draggable.style.position = "relative" // Reset position to align with cell
    draggable.style.left = "0px"
    draggable.style.top = "0px"
}


function generateChicken(){
    chickenGen = document.getElementById('chickenGen')
    let chickens = document.createElement('div')
    let chicken1 = document.createElement('div')
    let chicken2 = document.createElement('div')
    chickens.classList.add('draggable')
    chickens.classList.add('chickenHolder')
    chicken1.classList.add('chicken')
    chicken2.classList.add('chicken')
    chickens.appendChild(chicken1)
    chickens.appendChild(chicken2)
    chickenGen.appendChild(assignPositions(chickens))

    draggable = document.querySelector(".draggable")  

    // Drag Start Event
    draggable.addEventListener("mousedown", (e) => handleDrag(e))
    draggable.addEventListener("touchstart", (e) => {
        e.preventDefault()
        let touch = e.touches[0] || e.changedTouches[0]
        handleDrag(touch)
    }, { passive: false })


}

function handleDrag(e) {
    let element = document.elementFromPoint(e.clientX, e.clientY)

    if(element.classList.contains('chickenHolder')){
        direction = element.children[0].classList.contains('top') ? 2 : 1
    } else if(element.classList.contains('top') || element.classList.contains('bottom')){
        direction = 1
    } else if(element.classList.contains('left') || element.classList.contains('right')){
        direction = 2
    } else {
        throw Error('Error')
    }
    isDragging = true
    draggable.style.position = "absolute"
    draggable.style.zIndex = "1000"
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
    let bottomVal = pos % 6
    var el = document.getElementById(bottomVal + 12)
    var lastEl = document.getElementById(bottomVal + 6)
    var lastLastEl = document.getElementById(bottomVal)
    var val = getColour(el.children[0] ?? '')
    var lastVal = getColour(lastEl.children[0] ?? '')
    var lastLastVal = getColour(lastLastEl.children[0] ?? '')

    var remove = false
    var counter = 0

    for(var i = 3; i < 7; i++){
        if(val == lastVal && lastLastVal == lastVal && val != 'none'){
            counter++
            lastLastEl.innerHTML = ''
            remove = true
        } else if((val != lastVal || lastLastVal != lastVal) && remove){
            counter += 2
            lastEl.innerHTML = ''
            lastLastEl.innerHTML = ''
            remove = false
        }
        if(i < 6){
            lastLastVal = lastVal
            lastLastEl = lastEl
            lastVal = val
            lastEl = el
            el = document.getElementById(bottomVal + i * 6)
            val = getColour(el.children[0] ?? '')
        }
    }

    if(remove) {
        lastEl.innerHTML = ''
        el.innerHTML =''
    }


    bottomVal = pos - (pos % 6)
    el = document.getElementById(bottomVal + 2)
    lastEl = document.getElementById(bottomVal + 1)
    lastLastEl = document.getElementById(bottomVal)
    val = getColour(el.children[0] ?? '')
    lastVal = getColour(lastEl.children[0] ?? '')
    lastLastVal = getColour(lastLastEl.children[0] ?? '')
    remove = false

    for(var i = 3; i < 7; i++){
        if(val == lastVal && lastLastVal == lastVal && val != 'none'){
            counter++
            lastLastEl.innerHTML = ''
            remove = true
        } else if((val != lastVal || lastLastVal != lastVal) && remove){
            counter += 2
            lastEl.innerHTML = ''
            lastLastEl.innerHTML = ''
            remove = false
        }
        if(i < 6){
            lastLastVal = lastVal
            lastLastEl = lastEl
            lastVal = val
            lastEl = el
            el = document.getElementById(bottomVal + i)
            val = getColour(el.children[0] ?? '')
        }
    }
    if(remove) {
        lastEl.innerHTML = ''
        el.innerHTML =''
    }

    remainingChickens -= counter
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
    updateChickens()
}