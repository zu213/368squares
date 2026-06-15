export function postInputToBoard(inputText) {
    fetch("https://368-api.vercel.app/api/add", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            value: inputText
        })
    })
    .catch(err => console.error(err))
}

export function fetchBoard() {
    return fetch("https://368-api.vercel.app/api/list")
    .then(res => res.json())
}