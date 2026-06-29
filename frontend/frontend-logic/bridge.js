export function postInputToBoard(name, score) {
    name = name.replaceAll(":", "")
    return fetch("https://368-api.vercel.app/api/add", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            value: `${name}:${score}`
        })
    })
    .catch(err => console.error(err))
}

export function fetchBoard() {
    return fetch("https://368-api.vercel.app/api/list")
    .then(res => res.json())
    .then(data => {
        return data.map(entry => {
            const serailized = entry.split(":")
            return {name: serailized[0], score: parseInt(serailized[1])}
        })
    })
}