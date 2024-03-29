/*
	Training tool to solve my own version (without wind) of Frozen Lake, found in OpenAI Gym

	The tool outputs data into a folder it creates called 'training-data'

	Run the tool with # node fr-neural-net-brainjs.js
	
	Fiddle with hyper parameters to find an optimal policy-finding policy (meta puns are tight)

	Use any program to serve the folder as HTTP-server (like 'serve' in npmjs) and visit 'statistics-graph-deep-rl.html'
	to view live graph visualizations as the network trains
*/
const brain = require('../brain-browser.js')
const fs = require('fs')
const R = require('ramda')
const namespace = ['UP', 'DOWN', 'LEFT', 'RIGHT']
const dir = 'training-data'

const startDate = new Date()
const LOGGING = true
const LOG_INTERVAL = 1

if (!fs.existsSync(dir)) fs.mkdirSync(dir)
const filename = `${dir}/fl-brainjs-${formatDate(new Date())}.json`
const trainingfile = `${dir}/training.json`

const startLocations = [0,1,2,3,4,6,8,9,10,13,14].reverse()

const map = `
FFFF
FHFH
FFFH
HFFG
`.trim().split('').filter(x => ["F","S","H","G"].includes(x))

const HYPER = {
	"ITERATIONS": 100000,
	"MOVES": 7,
	"EXPLORATION_RATE": 0.4,
	"NETS": 1,
	"SUCCESS_RATE": 1,
	"NEUTRAL_RATE": null,
	"FAIL_RATE": null,
	"TRAINING_OPTIONS": {},
	"BRAIN_CONFIG": {}
}

let agentIndex, net, trainer
let fitnessSnapshots = []

log('\n\n--- [ FROZEN LAKE OPEN-AI CHALLENGE USING BRAIN.JS ] ---')
log('Hyper-parameters', HYPER)
log('\n--- [ BEGIN TRAINING ] ---')

let rawFile, file
try {
	rawFile = fs.readFileSync(`${dir}/training.json`)
	file = JSON.parse(rawFile)
} catch(e) {

}
const newNetworkNeeded = process.argv[2] === "reset" || !file

log(newNetworkNeeded ? '\n\nNew network created' : '\n\nReading file net.json')

for (var deepNetTraining = 0; deepNetTraining < HYPER.NETS; deepNetTraining++) {
	resetGame()

	net = new brain.NeuralNetwork(HYPER["BRAIN_CONFIG"])
	net.train([
		{ 
			input: agentIndexToBinary(0),
			output: {
				UP: 0.5,
				DOWN: 0.5,
				LEFT: 0.5,
				RIGHT: 0.5
			}
		}
	], HYPER["TRAINING_OPTIONS"])

	for (var k = 0; k < HYPER.ITERATIONS; k++) {
		const netTrainStats = trainIteration()

		if (k % LOG_INTERVAL === 0) {
			const fitnessThisRound = []
			for (var i = 0; i < startLocations.length; i++) {
				const fitness = playGame(i)
				fitnessThisRound.push(fitness)
				log('Testing starting location', startLocations[i], fitness)
			}
			fitnessSnapshots.push({ fitness: fitnessThisRound, date: new Date().toISOString() })

			const jsonStr = JSON.stringify({ training: true, "max-fitness": startLocations.length, filename: filename, fitnessSnapshots: fitnessSnapshots, "hyper-parameters": HYPER, net: net.toJSON() })
			fs.writeFileSync(trainingfile, jsonStr)

			if (fitnessThisRound.filter(isSuccess).length === startLocations.length) {
				k = Infinity
				log('Breaking prematurely because all starting points where solved')
			}
			renderHelptext(netTrainStats)

		}
	}

}

log(`Results logged to file: ${filename}`)
const jsonStr = JSON.stringify({ training: false, "max-fitness": startLocations.length, filename: filename, fitnessSnapshots: fitnessSnapshots, "hyper-parameters": HYPER, net: net.toJSON() })
fs.writeFileSync(trainingfile, jsonStr)
fs.writeFileSync(filename, JSON.stringify({ training: false, "max-fitness": startLocations.length, filename: filename, fitnessSnapshots: fitnessSnapshots, "hyper-parameters": HYPER, net: net.toJSON() }))

function trainIteration() {
	let moveSet = []
	resetGame()
	const startIdx = agentIndex

	for (var i = 0; i < HYPER.MOVES; i++) {
		
		let move = brain.likely(agentIndexToBinary(agentIndex), net)

		if (Math.random() < HYPER.EXPLORATION_RATE) {
			move = namespace[Math.floor(Math.random() * 4)]
		}

		const agentIdxBeforeMove = agentIndex

		moveAgent(move)
		
		const result = resolveMove(move)

		if (result.reward === 1) {
			moveSet = moveSet.map((x, i) => ({ ...x, reward: 1 }))
		}

		moveSet.push({ ...result, move: move, agentIndex: agentIdxBeforeMove, startIdx: startIdx })

		if (result.gameover) {
			i = Infinity
		}
	}

	moveSet.map(prettyData).forEach(x => log(x))
	log(`${moveSet.filter(x => x.reward > 0).length} of ${moveSet.length} is reward > 0`)
	log(`${moveSet.filter(x => x.reward === 1).length} of ${moveSet.length} is reward = 1`)
	log(`${moveSet.filter(x => x.reward === 1 && x.gameover).length} of ${moveSet.length} is frisbee reaching move`)
	log(`${moveSet.filter(x => x.reward === 0 && x.gameover).length} of ${moveSet.length} is hole falling move`)

	return net.train(moveSet.map(prepareData), HYPER["TRAINING_OPTIONS"])
}

function renderHelptext(result) {

	const successes = fitnessSnapshots.flatMap(x => x.fitness).filter(isSuccess).length
	const failures = fitnessSnapshots.flatMap(x => x.fitness).filter(isFailure).length
	const total = fitnessSnapshots.flatMap(x => x.fitness).length
	const successRate = 100 / (total / successes)
	
	log(`

--- [ ITERATION COMPLETE ] ---
Net training result: ${printResult(result)}
Nets trained: ${HYPER.NETS}
Time: ${ Math.round((new Date().getTime() - startDate.getTime()) / 1000)} seconds

--- [ PLAYING GAMES ] ---
Successes: ${successes}
Failures: ${failures}
Success rate: ${successRate.toFixed(2)}%
	`)

	renderPrediction()

}

function prepareData({gameover, reward, move, agentIndex}) {
	if (reward) {
		return {
			input: agentIndexToBinary(agentIndex),
			output: {
				[move]: HYPER["SUCCESS_RATE"]
			}
		}
	}
	if (gameover && !reward) {
		return {
			input: agentIndexToBinary(agentIndex),
			output: {
				[move]: HYPER["NEUTRAL_RATE"]
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

function moveAgent(dir) {
	if (dir === 'UP' && agentIndex > 3) {
		agentIndex = agentIndex - 4
	}
	if (dir === 'DOWN' && agentIndex <= 11) {
		agentIndex = agentIndex + 4
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

function print(id) {
	log( `index ${id}`, net.run(id) )
}

function halflife(a, b) {
  if (a === 0) return 0
  return a / b
}

function log() {
	if (!LOGGING) return
	return console.log(...arguments)
}

function isSuccess(data) {
  return data !== -1
}

function isFailure(x) {
  return !isSuccess(x)
}
		
function formatDate(date) {
  return `${date.getFullYear()}-${leftPad("00", date.getMonth().toString())}-${leftPad("00", date.getDate().toString())}-${leftPad("00", date.getHours().toString())}-${leftPad("00", date.getMinutes().toString())}-${leftPad("00", date.getSeconds().toString())}`
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

function renderPrediction() {
	for (var i = 0; i < 4; i++) {
		const row = 4 * i
		let o = ""
		for (var j = 0; j < 4; j++) {
			const target = row + j

			o += startLocations.includes(target) ? brain.likely(agentIndexToBinary(row + j), net).substr(0, 1) + " " : "- "
		}
		o += "\n"
		log(o)	
	}
}

function resetGame(id) {
	if (id === undefined) {
		agentIndex = pickRandomStart()
	} else {
		agentIndex = startLocations[id]
	}
}

function dec2bin(dec){
    return (dec >>> 0).toString(2);
}

function pickRandomStart() {
	return startLocations[Math.floor(Math.random() * startLocations.length)]
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

function printResult(x) {
	return `{ error: ${x.error}, iterations: ${x.iterations} }`
}

function prettyData({gameover, reward, move, agentIndex, startIdx}) {
	return `gameover ${gameover}, reward ${reward}, move ${move}, agentIndex ${agentIndex}, startIdx ${startIdx}`
}

function playGame(start) {
	resetGame(start)
	log(`\n\n\nStarting game at [[[[ ${start} ${ agentIndex} ]]]]`)
	for (var j = 0; j < HYPER.MOVES; j++) {

		render()
		const move = brain.likely(agentIndexToBinary(agentIndex), net)

		log('Moving', move)
		moveAgent(move)
		
		const result = resolveMove(move)

		log('new agentIndex', agentIndex)

		if (result.reward === 1) {
			log('Frisbee found\n\n')
			return j
		}
		if (result.gameover) {
			log('Died in hole\n\n')
			return -1
		}
	}
	log('Died from starvation\n\n')
	return -1
}