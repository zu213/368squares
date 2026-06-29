
export function createChickens(handleDrag,validMoves){
    let chickens = document.createElement('div')
    let chicken1 = document.createElement('div')
    let chicken2 = document.createElement('div')
    chickens.classList.add('draggable')
    chickens.classList.add('chicken-holder')
    chicken1.classList.add('chicken')
    chicken2.classList.add('chicken')
    chickens.appendChild(chicken1)
    chickens.appendChild(chicken2)

    let classChickens = assignPositions(chickens, validMoves)
    if(!classChickens) return

    // Drag Start Event
    classChickens.addEventListener("mousedown", (e) => {
        e.preventDefault()
        handleDrag(e)
    })

    classChickens.addEventListener("touchstart", (e) => {
        e.preventDefault()
        let touch = e.touches[0] || e.changedTouches[0]
        handleDrag(touch)
    }, { passive: false })

    return classChickens
}

function assignPositions(chickens, validMoves){
    let randomNum = Math.random()
    if((randomNum <= 0.5 || !validMoves[0]) && validMoves[1]) {
        chickens.children[0].classList.add('top')
        chickens.children[1].classList.add('bottom')
    }else if(validMoves[0]){
        chickens.children[0].classList.add('left')
        chickens.children[1].classList.add('right')
    } else {
        return
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