const fs = require('fs')
const R = require('ramda')
const namespace = ["UP", "DOWN", "LEFT", "RIGHT"]

const map = "SFFFFHFHFFFHHFFG".split('')

const HYPER = {
	"MOVES": 6,
	"ITERATIONS": 10000,
	"TABLES": 1000,
	"EXPLORATION_RATE": 0.01,
	"EXPLORATION_DROPOFF": 0,
}

const results = []

let agentIndex, qTable

/*
SFFF
FHFH
FFFH
HFFG
*/


//initiate hyper-parameters - random or arguments?

for (var qTableTraining = 0; qTableTraining < HYPER.TABLES; qTableTraining++) {
	resetGame()

	qTable = [
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


	for (var k = 0; k < HYPER.ITERATIONS; k++) {
		trainIteration()
	}

	const result = playGame()

	if (qTableTraining % 30 === 0)
		console.log(`Training net ${qTableTraining} - result: ${result}`)
	
	results.push({ moves: result, qTable: qTable })
}

const dir = 'training-data'
if (!fs.existsSync(dir)) fs.mkdirSync(dir)
const filename = `${dir}/fl-qtables-${formatDate(new Date())}.json`
fs.writeFileSync(filename, JSON.stringify({ filename: filename, results: results, "hyper-parameters": HYPER }))

const successes = results.filter(isSuccess).length
const failures = results.filter(isFailure).length
const total = results.length
const successRate = 100 / (total / successes)

console.log(`\nResults logged to file: ${filename}\nSuccess rate: ${successRate}%`)


function isSuccess({ moves }) {
  return moves !== -1
}

function isFailure(x) {
  return !isSuccess(x)
}
		
function formatDate(date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`
}

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

	for (var i = 0; i < HYPER.MOVES; i++) {

		const rows = R.splitEvery(4, qTable)
		const options = rows[agentIndex]

		const maxIdx = options.indexOf(Math.max(...options));

		let move = namespace[maxIdx]

		if (Math.random() < HYPER.EXPLORATION_RATE) {
			move = namespace[Math.floor(Math.random() * 4)]
		}

		const agentIdxBeforeMove = agentIndex
		moveAgent(move)
		
		const result = resolveMove(move)

		moveSet.push({ ...result, move: move, agentIndex: agentIdxBeforeMove })

		if (result.gameover) {
			i = Infinity
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

function pretty(arr) {
	return `[ ${ arr.map(x => x.toFixed(2)).join(', ') } ]`
}

function qTableMove() {
	const options = R.splitEvery(4, qTable)[agentIndex]
	const maxIdx = options.indexOf(Math.max(...options));
	const move = namespace[maxIdx]
	moveAgent(move)
	return resolveMove(move)
}

function playGame() {
	resetGame()
	for (var i = 0; i < 8; i++) {
		if (qTableMove().reward === 1) {
			return i
		}
	}
	return -1
}
