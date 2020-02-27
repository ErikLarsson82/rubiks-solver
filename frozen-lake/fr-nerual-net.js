const convnetjs = require("convnetjs");
const fs = require('fs')
const R = require('ramda')
const namespace = ["UP", "DOWN", "LEFT", "RIGHT"]

const map = 
`FSFG
FHFH
FFFH
HFFG`.split('')

const HYPER = {
	"ITERATIONS": 100,
	"MOVES": 5,
	"EXPLORATION_RATE": 0.01,
	"NETS": 1
}

const results = []

let agentIndex, net, trainer

/*
SFFF
FHFH
FFFH
HFFG
*/

for (var deepNetTraining = 0; deepNetTraining < HYPER.NETS; deepNetTraining++) {
	resetGame()

	net = new convnetjs.Net();

	net.makeLayers([
	    {type: 'input', out_sx: 1, out_sy: 1, out_depth: 4},
	    {type: 'fc', num_neurons: 4, activation: 'tanh'},
	    {type: 'softmax', num_classes: 4}
	]);

	trainer = new convnetjs.Trainer(net);

	var point = new convnetjs.Vol(1,1,4);

	point.w = [0,1,0,1]

	//console.log('Starting weights for idx 0', net.forward(point))

	for (var k = 0; k < HYPER.ITERATIONS; k++) {
		trainIteration()
	}

	const result = playGame()
	
	results.push({ moves: result })

	if (deepNetTraining % 1 === 0)
		console.log(`Training net ${deepNetTraining} - result: ${result}`)

}

/*
const dir = 'training-data'
if (!fs.existsSync(dir)) fs.mkdirSync(dir)
const filename = `${dir}/fl-qtables-${formatDate(new Date())}.json`
fs.writeFileSync(filename, JSON.stringify({ filename: filename, results: results, "hyper-parameters": HYPER }))
*/
const filename = "[disabled]"
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
	agentIndex = 1
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

function dec2bin(dec){
    return (dec >>> 0).toString(2);
}

// Takes an array of floats representing binary data
// and rounds, converts to binary and then to the decimal
// equivalent. [0.1, 0.1, 0.9, 0.9] -> 3
function predictionToDirectionIdx(decimalArray) {
	return parseInt(decimalArray.map(x => Math.round(x)).join(''), 2)
}

// Converts agent index (player position on map) to an array
// representing binary data with floats, inverse of 
// predictionToDirectionIdx
// example 3 -> [0.0, 0.0, 1.0, 1.0]
function agentIndexToBinary(idx) {
	const floatme = x => x === "1" ? 1.0 : 0.0
	return leftPad("0000", idx.toString(2)).split('').map(floatme)
}

function moveIndexToBinary(idx) {
	const floatme = x => x === "1" ? 1.0 : 0.0
	return leftPad("00", idx.toString(2)).split('').map(floatme)
}

function leftPad(template, str) {
	const full = template.concat(str)
	return full.substr(str.length)
}

function extractHighestIndex(arr) {
	let highestValue = 0
	let highestIdx = 0
	arr.forEach((value, idx) => {
		if (value > highestValue) {
			highestValue = value
			highestIdx = idx
		}
	})
	return highestIdx
}

function trainIteration() {
	let moveSet = []
	resetGame()

	console.log('\n\n--- Training iteration ----')
	for (var i = 0; i < HYPER.MOVES; i++) {
		
		point.w = agentIndexToBinary(agentIndex)
		const prediction = net.forward(point)
		const highestIndex = extractHighestIndex(prediction.w)
		let move = namespace[highestIndex]
		
		console.log(`Agent Index: ${agentIndex}\nPrediction array: ${prediction.w}\nExtracted prediction index: ${highestIndex}\nMove: ${move}`) //'prediction',agentIndex , prediction.w, move)
		
		// Binary
		// UP = 00
		// DOWN = 01
		// LEFT = 10
		// RIGHT = 11


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
	//console.log('moveSet to adjustAllMoves', moveSet)

	const gameoverMove = moveSet.find(x => x.gameover === true)
	const reward = gameoverMove && gameoverMove.reward === 1 || false
	moveSet.forEach(data => {
		const addition = {
			UP: 0,
			DOWN: 1,
			LEFT: 2,
			RIGHT: 3
		}
		//const target = (data.agentIndex * 4) + addition[data.move]
		//qTable[target] = qTable[target] + (reward ? 1 : -0.01)
		point.w = agentIndexToBinary(data.agentIndex)
		const moveIndex = namespace.findIndex(x => x === data.move)
		if (reward) {
			//const desiredOutput = moveIndexToBinary(namespace.findIndex(x => x === data.move))
			trainer.train(point, moveIndex)
			console.log('completed - reward:', point.w, moveIndex)	
		} else {
			new Array(4).fill().forEach((v, i) => {
				if (i !== moveIndex) {
					trainer.train(point, i)
					console.log('failed - reward:', point.w, i)	
				}
			})
			/*for (var otherMove in addition) {
				if (otherMove !== data.move) {
					//const desiredOutput = moveIndexToBinary(namespace.findIndex(x => x === data.move))
					//trainer.train(point, desiredOutput)
					//console.log('incomplete - reward:', point.w, desiredOutput, data)
				}
			}*/
			//trainer.train(point, )
		}
		
	})
}

function pretty(arr) {
	return `[ ${ arr.map(x => x.toFixed(2)).join(', ') } ]`
}

function playGame() {
	resetGame()
	for (var i = 0; i < HYPER.MOVES; i++) {
		point.w = agentIndexToBinary(agentIndex)
		const prediction = net.forward(point)
		const highestIndex = extractHighestIndex(prediction.w)
		const move = namespace[highestIndex]
		
		moveAgent(move)
		
		const result = resolveMove(move)
		
		//console.log('im moving', move, result)

		if (result.reward === 1) {
			return i
		}
	}
	return -1
}
