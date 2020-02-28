const brain = require('../brain-browser.min.js')
const fs = require('fs')
const R = require('ramda')
const namespace = ['UP', 'DOWN', 'LEFT', 'RIGHT']

const LOGGING = true

const map = `
FSFF
FHFH
FFFH
HFFG
`.trim().split('').filter(x => ["F","S","H","G"].includes(x))

const HYPER = {
	"ITERATIONS": 10000,
	"MOVES": 6,
	"EXPLORATION_RATE": 0.3,
	"NETS": 20,
	"SUCCESS_RATE": 1,
	"FAIL_RATE": -0.0001,
	"START_LOCATION": map.findIndex(x=>x === "S")
}

let agentIndex, net, trainer, results, trainingData

log('\n\n--- [ FROZEN LAKE OPEN-AI CHALLANGE USING BRAIN.JS ] ---')
log('Hyper-parameters', HYPER)
log('\n--- [ BEGIN TRAINING ] ---')

results = []

//log(agentIndexToBinary(2))

for (var deepNetTraining = 0; deepNetTraining < HYPER.NETS; deepNetTraining++) {
	trainingData = []
	resetGame()

	/*const config = {
	  binaryThresh: 0.5,
	  //hiddenLayers: [3], // array of ints for the sizes of the hidden layers in the network
	  activation: 'leaky-relu', // supported activation types: ['sigmoid', 'relu', 'leaky-relu', 'tanh'],
	  leakyReluAlpha: 0.01, // supported for activation type 'leaky-relu'
	}*/

	net = new brain.NeuralNetwork()

	//Initiate first network with random numbers
	net.train([
		{ 
			input: agentIndexToBinary(HYPER.START_LOCATION),
			output: {
				UP: 0.5,
				DOWN: 0.5,
				LEFT: 0.5,
				RIGHT: 0.5
			}
		}
	])

	//log(`Before training - Probability agentIndex ${agentIndexToBinary(HYPER.START_LOCATION)}: `, net.run(agentIndexToBinary(HYPER.START_LOCATION)))

	for (var k = 0; k < HYPER.ITERATIONS; k++) {
		if (k % 1000 === 0) {
			log('---- iteration', k)
		}
		trainIteration()
	}

	const result = playGame()
	
	results.push({ moves: result })

	//if (deepNetTraining % 10 === 0)
	log(`Training net ${deepNetTraining} - result: ${result}`)

	//log(trainingData)

	//map.forEach((x, i) => log(`index ${agentIndexToBinary(i)}`, brain.likely(agentIndexToBinary(i), net), net.run(agentIndexToBinary(i))))
	//log('running 1', brain.likely(1, net), net.run(1))
	//log('running 2', brain.likely(2, net), net.run(2))
}

/*
const dir = 'training-data'
if (!fs.existsSync(dir)) fs.mkdirSync(dir)
const filename = `${dir}/fl-brainjs-${formatDate(new Date())}.json`
fs.writeFileSync(filename, JSON.stringify({ filename: filename, results: results, "hyper-parameters": HYPER }))
*/
const filename = "[disabled]"
const successes = results.filter(isSuccess).length
const failures = results.filter(isFailure).length
const total = results.length
const successRate = 100 / (total / successes)

log(`\n\n --- [ TRAINING COMPLETE ] ---\nResults logged to file: ${filename}\nNets trained: ${HYPER.NETS}\n\n --- [ PLAYING GAMES ] ---\nSuccesses: ${successes}\nFailures: ${failures}\nSuccess rate: ${successRate}%`)

function trainIteration() {
	let moveSet = []
	resetGame()

	//log('\n\n--- Training iteration ----')
	for (var i = 0; i < HYPER.MOVES; i++) {
		
		/*
		point.w = agentIndexToBinary(agentIndex)
		const prediction = net.forward(point)
		const highestIndex = extractHighestIndex(prediction.w)
		let move = namespace[highestIndex]
		
		log(`Agent Index: ${agentIndex}\nPrediction array: ${prediction.w}\nExtracted prediction index: ${highestIndex}\nMove: ${move}`) //'prediction',agentIndex , prediction.w, move)
		
		// Binary
		// UP = 00
		// DOWN = 01
		// LEFT = 10
		// RIGHT = 11
		*/
		
		let move = brain.likely(agentIndexToBinary(agentIndex), net)

		//log('move', move, agentIndex)

		if (Math.random() < HYPER.EXPLORATION_RATE) {
			move = namespace[Math.floor(Math.random() * 4)]
		}

		const agentIdxBeforeMove = agentIndex
		
		//render()

		moveAgent(move)
		
		const result = resolveMove(move)

		if (result.reward === 1) {
			moveSet = moveSet.map((x, i) => ({ ...x, reward: Math.min(x.reward + (1 / (moveSet.length+1) * (i+1)), 1) }))
			//console.log('adjusting existing moveSet this run', moveSet)
		}

		moveSet.push({ ...result, move: move, agentIndex: agentIdxBeforeMove })

		if (result.gameover) {
			i = Infinity
		}
	}

	//createTrainingdata(moveSet)
	trainingData = trainingData.concat(moveSet)

	//log('Training net using all current trainingData')
	net.train(trainingData.map(prepareData))

	//log(trainingData.map(prepareData))
}

function prepareData({gameover, reward, move, agentIndex}) {
	if (gameover && reward) {
		return {
			input: agentIndexToBinary(agentIndex),
			output: {
				[move]: HYPER["SUCCESS_RATE"]
			}
		}
	}
	return {
		input: agentIndexToBinary(agentIndex),
		output: {
			[move]: HYPER["FAIL_RATE"]
		}
	}
}

function obsolete(moveSet) {
	log('moveSet to createTrainingdata', moveSet)

	const gameoverMove = moveSet.find(x => x.gameover === true)
	const reward = gameoverMove && gameoverMove.reward === 1 || false
	moveSet.forEach(data => {
		
		/*point.w = agentIndexToBinary(data.agentIndex)
		const moveIndex = namespace.findIndex(x => x === data.move)
		if (reward) {
			//const desiredOutput = moveIndexToBinary(namespace.findIndex(x => x === data.move))
			trainer.train(point, moveIndex)
			log('completed - reward:', point.w, moveIndex)	
		} else {
			new Array(4).fill().forEach((v, i) => {
				if (i !== moveIndex) {
					trainer.train(point, i)
					log('failed - reward:', point.w, i)	
				}
			})
			for (var otherMove in addition) {
				if (otherMove !== data.move) {
					//const desiredOutput = moveIndexToBinary(namespace.findIndex(x => x === data.move))
					//trainer.train(point, desiredOutput)
					//log('incomplete - reward:', point.w, desiredOutput, data)
				}
			}
			//trainer.train(point, )
		}
		*/
	})
}

function moveAgent(dir) {
	//log('im moving', dir, agentIndex)
	if (dir === 'UP' && agentIndex > 3) {
		agentIndex = agentIndex - 4
	}
	if (dir === 'DOWN' && agentIndex <= 11) {
		agentIndex = agentIndex + 4
		//log('down takes me to', agentIndex)
	}
	if (dir === 'LEFT' && ![0, 4, 8, 12].includes(agentIndex)) {
		agentIndex = agentIndex - 1
	}
	if (dir === 'RIGHT' && ![3, 7, 11, 15].includes(agentIndex)) {
		agentIndex = agentIndex + 1
	}
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



// ----------------------------- HELPERS -----------------------------

function log() {
	if (!LOGGING) return
	return console.log(...arguments)
}

function isSuccess({ moves }) {
  return moves !== -1
}

function isFailure(x) {
  return !isSuccess(x)
}
		
function formatDate(date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`
}

function playerOrTile(idx) {
	return idx === agentIndex ? "*" : map[idx]
}

function render() {
	for (var i = 0; i < 4; i++) {
		const row = 4 * i
		log(`${playerOrTile(row + 0)}${playerOrTile(row + 1)}${playerOrTile(row + 2)}${playerOrTile(row + 3)}`)
	}
}

function resetGame() {
	agentIndex = HYPER["START_LOCATION"]
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


function pretty(arr) {
	return `[ ${ arr.map(x => x.toFixed(2)).join(', ') } ]`
}

function playGame() {
	resetGame()
	for (var i = 0; i < HYPER.MOVES; i++) {
		/*
		point.w = agentIndexToBinary(agentIndex)
		const prediction = net.forward(point)
		const highestIndex = extractHighestIndex(prediction.w)
		const move = namespace[highestIndex]
		*/

		const move = brain.likely(agentIndexToBinary(agentIndex), net)

		moveAgent(move)
		
		const result = resolveMove(move)
		
		//log('im moving', move, result)

		if (result.reward === 1) {
			return i
		}
	}
	return -1
}