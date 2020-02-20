/*
SFFF
FHFH
FFFH
HFFG
*/

const map = "SFFFFHFHFFFHHFFG".split('')

const qTable = [
	0,0,0,0, // S
	0,0,0,0, // F
	0,0,0,0, // F
	0,0,0,0, // F

	0,0,0,0, // F
	0,0,0,0, // H
	0,0,0,0, // F
	0,0,0,0, // H

	0,0,0,0, // F
	0,0,0,0, // F
	0,0,0,0, // F
	0,0,0,0, // H

	0,0,0,0, // H
	0,0,0,0, // F
	0,0,0,0, // F
	0,0,0,0, // G
]
const namespace = ["UP", "DOWN", "LEFT", "RIGHT"]
		
let agentIndex

function moveAgent(dir) {
	if (dir === "UP" && agentIndex > 3) {
		agentIndex = agentIndex - 4
	}
	if (dir === "DOWN" && agentIndex <= 11) {
		agentIndex = agentIndex + 4
	}
	if (dir === "LEFT" && ![0, 4, 8, 12].includes(agentIndex)) {
		agentIndex = agentIndex - 1
	}
	if (dir === "RIGHT" && ![3, 7, 11, 15].includes(agentIndex)) {
		agentIndex = agentIndex + 1
	}
}

function playerOrTile(idx) {
	return idx === agentIndex ? "*" : map[idx]
}

function render() {
	for (var i = 0; i < 4; i++) {
		const row = 4 * i
		console.log(`${playerOrTile(row + 0)}${playerOrTile(row + 1)}${playerOrTile(row + 2)}${playerOrTile(row + 3)}`)
	}
}

render()

window.addEventListener("keydown", e => {
	if (e.keyCode === 81) {
		qTableMove()
	}
	if (e.keyCode === 13) {
		trainIteration()
		console.log(R.splitEvery(4, qTable).forEach(x => console.log(x)))
	}
	if (e.keyCode === 80) {
		playGame()
	}

	if (e.keyCode === 38) {
		moveAgent("UP")
		console.log('-------------------------------------')
		render()
	}
	if (e.keyCode === 40) {
		moveAgent("DOWN")
		console.log('-------------------------------------')
		render()
	}
	if (e.keyCode === 37) {
		moveAgent("LEFT")
		console.log('-------------------------------------')
		render()
	}
	if (e.keyCode === 39) {
		moveAgent("RIGHT")
		console.log('-------------------------------------')
		render()
	}

})

function resetGame() {
	agentIndex = 0
}

function resolveMove() {
	if (map[agentIndex] === "H") {
		return { gameover: true, reward: 0 }
	}
	if (map[agentIndex] === "G") {
		return { gameover: true, reward: 1 }
	}
	return { gameover: false, reward: 0 }
}

function trainIteration() {
	let moveSet = []
	resetGame()

	for (var i = 0; i < 20; i++) {

		const cooking = R.splitEvery(4, qTable)
		const options = cooking[agentIndex]

		const maxIdx = options.indexOf(Math.max(...options));

		let move = namespace[maxIdx]

		if (Math.random() < 0.3) {
			move = namespace[Math.floor(Math.random() * 4)]
		}

		const agentIdxBeforeMove = agentIndex
		moveAgent(move)
		
		const result = resolveMove(move)

		moveSet.push({ ...result, move: move, agentIndex: agentIdxBeforeMove })

		if (result.gameover) {
			i = Infinity
			if (result.reward === 1) {
				//console.log('Game over, FRISBEE')
				//debugger
			}
		}
	}

	adjustAllMoves(moveSet)
}

function adjustAllMoves(moveSet) {
	const gameoverMove = moveSet.find(x => x.gameover === true)
	const reward = gameoverMove && gameoverMove.reward === 1 || false
	moveSet.forEach(data => {
		const addition = {
			UP: 0,
			DOWN: 1,
			LEFT: 2,
			RIGHT: 3
		}
		const target = (data.agentIndex * 4) + addition[data.move]
		qTable[target] = qTable[target] + (reward ? 1 : -0.01)
	})
}

for (var k = 0; k < 10000; k++) {
	trainIteration()
}

console.log(R.splitEvery(4, qTable).forEach(x => console.log(x)))

//resetGame()

function qTableMove() {
	const options = R.splitEvery(4, qTable)[agentIndex]
	const maxIdx = options.indexOf(Math.max(...options));
	const move = namespace[maxIdx]
	moveAgent(move)
	const result = resolveMove(move)
	console.log('-----------------------------------')
	render()
	return result
}

function playGame() {
	console.log('Playing game')
	resetGame()
	for (var i = 0; i < 8; i++) {
		if (qTableMove().reward === 1) {
			console.log('Frisbee found!')
			return
		}
	}
	console.log('Froze to death')
}