

var remainingChickens = 368
var chickenGen
var isDragging = false
var direction
var offsetX
var offsetY
var genChicken = true
var draggable

document.addEventListener("DOMContentLoaded", function () {
    let grid = document.getElementById("grid");

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
            draggable.style.left = `${e.clientX - offsetX}px`;
            draggable.style.top = `${e.clientY - offsetY}px`;
        }
    });

    // Allow Dropping in Grid
    document.addEventListener("mouseup", (e) => {

            if (isDragging) {
                checkValidPlace(e, direction, draggable)
            }
            isDragging = false;

    });

    updateChickens()
});

function assignPositions(chickens){
    let randomNum = Math.random();
    if(randomNum <= 0.5){
        chickens.children[0].classList.add('top')
        chickens.children[1].classList.add('bottom')
    }else{
        chickens.children[0].classList.add('left')
        chickens.children[1].classList.add('right')
    }
    for(var i = 0; i < 2; i++){
        let colour = Math.random();
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
    draggable.style.display = "none";
    let element = document.elementFromPoint(e.clientX, e.clientY)
    draggable.style.display = "block";

    if(direction == 1 && Number(element.id) % 6 != 0){
        let elementAbove = document.getElementById(`${Number(element.id) - 1}`)
        if(element.innerHTML == '' && elementAbove && elementAbove?.innerHTML == ''){
            console.log(draggable)
            element.appendChild(draggable.querySelector('.right')); // Move draggable to cell
            elementAbove.appendChild(draggable.querySelector('.left'))
            draggable.classList.remove('draggable')
            checkMatch(Number(element.id))
            checkMatch(Number(element.id) - 1)
            generateChicken()

        }else{
            chickenGen.appendChild(draggable)
        }
    } else if(direction == 2 && Number(element.id) > 5){
        let elementAbove = document.getElementById(`${Number(element.id) - 6}`)
        if(element.innerHTML == '' && elementAbove && elementAbove?.innerHTML == ''){
            element.appendChild(draggable.querySelector('.bottom')); // Move draggable to cell
            elementAbove.appendChild(draggable.querySelector('.top'))
            draggable.classList.remove('draggable')
            checkMatch(Number(element.id))
            checkMatch(Number(element.id) - 6)
            generateChicken()

        }else{
            chickenGen.appendChild(draggable)
        }
    } else if(direction == 3  && Number(element.id) % 6 != 5){
        let elementAbove = document.getElementById(`${Number(element.id) + 1}`)
        if(element.innerHTML == '' && elementAbove && elementAbove?.innerHTML == ''){
            element.appendChild(draggable.querySelector('.left')); // Move draggable to cell
            elementAbove.appendChild(draggable.querySelector('.right'))
            draggable.classList.remove('draggable')
            checkMatch(Number(element.id))
            checkMatch(Number(element.id) + 1)
            generateChicken()

        }else{
            chickenGen.appendChild(draggable)
        }
    } else if(Number(element.id) % 6 < 30) {
        let elementAbove = document.getElementById(`${Number(element.id) + 6}`)
        if(element.innerHTML == '' && elementAbove && elementAbove?.innerHTML == ''){
            element.appendChild(draggable.querySelector('.top')); // Move draggable to cell
            elementAbove.appendChild(draggable.querySelector('.bottom'))
            draggable.classList.remove('draggable')
            checkMatch(Number(element.id))
            checkMatch(Number(element.id) + 6)
            generateChicken()

        }else{
            chickenGen.appendChild(draggable)
        }
    }
    draggable.style.position = "relative"; // Reset position to align with cell
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

    draggable = document.querySelector(".draggable");    

    // Drag Start Event
    draggable.addEventListener("mousedown", (e) => {

        let element = document.elementFromPoint(e.clientX, e.clientY)
        let rect = element.getBoundingClientRect();

        // Calculate the offset of the mouse click relative to the element's position
        offsetX = e.clientX - rect.left;   // Horizontal offset
        offsetY = e.clientY - rect.top;  
        console.log(element)
        if(element.classList.contains('chickenHolder')){
            direction = element.children[0].classList.contains('top') ? 2 : 1
        } else if(element.classList.contains('top')){
            direction = 4
        }else if(element.classList.contains('bottom')){
            direction = 2
        }else if(element.classList.contains('left')){
            direction = 3
        }else if(element.classList.contains('right')){
            direction = 1
        } else {
            throw Error('a')
        }
        console.log(direction)
        isDragging = true;
        draggable.style.position = "absolute";
        draggable.style.zIndex = "1000";
    });
}

function getColour(el){
    if(el == '') return 'none'
    if(el.classList.contains('yellow')) return 'yellow'
    if(el.classList.contains('red')) return 'yellow'
    if(el.classList.contains('pink')) return 'yellow'
    if(el.classList.contains('green')) return 'yellow'
    return 'none'
}

function updateChickens(){
    document.getElementById('remainingChickens').innerText = remainingChickens
}

function checkMatch(pos){
    let bottomVal = pos % 6
    var el = document.getElementById(bottomVal)
    var lastEl = document.getElementById(bottomVal + 6)
    var lastLastEl = document.getElementById(bottomVal)
    var val = getColour(el.children[0] ?? '')
    var lastVal = getColour(lastEl.children[0] ?? '')
    var lastLastVal = getColour(lastLastEl.children[0] ?? '')

    var remove = false
    var counter = 0
    console.log(pos)

    for(var i = 3; i < 7; i++){
        console.log(val, lastVal, lastLastVal)

        if(val == lastVal && lastLastVal == lastVal && val != 'none'){
            counter++
            lastLastEl.innerHTML = ''
            remove = true
        }
        if(i < 6){
            lastLastVal = lastVal
            lastLastEl = lastEl
            lastVal = val
            lastEl = el
            el = document.getElementById(bottomVal + i * 6).children[0] ?? ''
            val = getColour(el)
        }
    }

    if(remove){
        counter += 2
        lastEl.innerHTML = ''
        el.innerHTML = ''
    }
    console.log('counter:',counter)
    remainingChickens -= counter
    updateChickens()
}