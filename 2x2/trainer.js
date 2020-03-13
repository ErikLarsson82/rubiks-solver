
/*
	Training tool to solve a 2x2 Rubiks Cube - data model completely made up by me

	The tool outputs data into a folder it creates called 'training-data'

	Run the tool with # node trainer.js reset
	The reset flag creates a brand new net for training

	Fiddle with hyper parameters to find an optimal policy-finding policy (meta puns are tight)

	Use any program to serve the folder as HTTP-server (like 'serve' in npmjs) and visit 'statistics.html'
	to view live graph visualizations as the network trains
*/

let cube, net, trainer, file, dataCollection, lastEpochResults, scrambles

const {
	createCube,
	persist,
	compare,
	up,
	down,
	left,
	right,
	front,
	back,
	scrambleCube,
	moveFuncs,
	binary,
	randomAgent
} = require('./common')
const brain = require('../brain-browser.js')
const fs = require('fs')
const R = require('ramda')
const colors = require('colors')
const dir = 'training-data'

const startDate = new Date()
const LOGGING = true
const DEBUG_LOGGING = true
const WRITE_FILES = true
const LOG_INTERVAL = 1

const HYPER = {
	"EPOCHS": 1,
	"MOVES": 2,
	"NETS": 1,
	"SCRAMBLE_SIZE": 100,
	"TRAINING_OPTIONS": {
		iterations: 50,
		log: true,
	  	logPeriod: 1,
	},
	"BRAIN_CONFIG": {}
}

function initTrainer() {
	
	scrambles = new Array(HYPER["SCRAMBLE_SIZE"]).fill().map(() => [randomAgent(), randomAgent()])

	if (!fs.existsSync(dir)) fs.mkdirSync(dir)

	log('\n\n--- [ 2X2 RUBICS CUBE SOLVING USING BRAIN.JS ] ---')
	log('Hyper-parameters', HYPER)
	log('\n--- [ SETUP ] ---')

	try {
		const rawFile = fs.readFileSync(`${dir}/data-collection.json`)
		dataCollection = JSON.parse(rawFile)
	} catch(e) {
		console.error('Cannot read file data-collection.json')
		return
	}

	net = new brain.NeuralNetwork(HYPER["BRAIN_CONFIG"])

	persist(createCube())

	train()
}

function train() {
	
	log('\n\n--- [ BEGIN TRAINING ] ---')

	for (var j = 0; j < HYPER.EPOCHS; j++) {

		log(`\n\n\nRunning brain.js train API`)
		const trainingStats = net.train(dataCollection, HYPER["TRAINING_OPTIONS"])

		const epochFitness = determineFitness()
		
		lastEpochResults = {
			trainingStats: trainingStats,
			epochFitness: epochFitness
		}

		if (epochFitness.filter(isSuccess).length === scrambles.length) break;
	}

	logResults()
}

function solveCube(scramble) {
	for (var i = 0; i < HYPER.MOVES; i++) {
		const binaryCube = binary(cube)
		policy = brain.likely(binaryCube, net)
		cube = moveFuncs[policy](cube)
		if (compare(cube)) break;
	}

	return compare(cube) ? i : -1
}

function aggregateRewards(snaps) {
	binarySnapshotsAggregate = binarySnapshotsAggregate.concat(snaps)

	log('Reward percentage', `${snaps.filter(positiveReward).length} / ${snaps.length}`)
	log('Binary aggregate', `${binarySnapshotsAggregate.filter(positiveReward).length} / ${binarySnapshotsAggregate.length}`)
	snaps.map(prettySnap).forEach(x => log(x))
}

function assignRewards({ binarySnapshots, success }) {
	return binarySnapshots.map(x => brainJsFormat(success, x, 1))
}

function logResults() {
	log('\n--- [ FINAL RESULT BY PLAYING TEST-DATA ] ---')
	log(`\nTraining Stats: ${lastEpochResults.trainingStats.error}`)
	log("Last epoch fitness:")
	lastEpochResults.epochFitness.forEach(x => log(x))
	log(`Success rate: ${ ((lastEpochResults.epochFitness.filter(isSuccess).length / lastEpochResults.epochFitness.length ) * 100).toFixed(1)}%`)
}

function logEpochToFile(epoch, trainingStats, epochFitness) {
	console.log('trainingStats', epoch, trainingStats, epochFitness)

	if (epoch % LOG_INTERVAL === 0) {
		writeLogFile('training', epoch, true)
	}
}

function positiveReward(obj) {
	const target = obj.output
	return target["F"] > 0 ||
		target["F'"] > 0 ||
		target["B"] > 0 ||
		target["B'"] > 0 ||
		target["L"] > 0 ||
		target["L'"] > 0 ||
		target["R"] > 0 ||
		target["R'"] > 0 ||
		target["U"] > 0 ||
		target["U'"] > 0 ||
		target["B"] > 0 ||
		target["B'"] > 0
}

function prettySnap(snap) {
	return snap.input.join("") + "\n" + formatPolicyObj(snap.output, 2) + "\n"
}

function colorObject(obj, decimals) {

	let highest = "U"

	const list = ["U'", "D", "D'", "L", "L'", "R", "R'", "F", "F'", "B", "B'"]

	list.forEach(move => {
		if (obj[move] !== null && obj[move] > obj[highest]) {
			highest = move
		}
	})
	return value => {
		if (obj[value] === null) return colors.gray("null")

		if (value === highest) return colors.green(obj[value].toFixed(decimals))

		return colors.yellow(obj[value].toFixed(decimals))
	}
}

function formatPolicyObj(obj, decimals) {
	const c = colorObject(obj, decimals)
	return `F: ${ c("F") } F': ${ c("F'") } B: ${ c("B") } B': ${ c("B'") } L: ${ c("L") } L': ${ c("L'") } R: ${ c("R") } R': ${ c("R'") } U: ${ c("U") } U': ${ c("U'") } D: ${ c("D") } D': ${ c("D'") }`
}

function isSuccess(x) {
	return x !== -1
}

function determineFitness() {
	const epochFitness = scrambles.map(scramble => {
		cube = scrambleCube(scramble)
		return solveCube(scramble)
	})

	epochFitness.forEach((x,i) => log(isSuccess(x) ? "✓" : "X", scrambles[i]))

	return epochFitness
}

function writeLogFile(file, epochs, isTraining) {
	if (!WRITE_FILES) return

	const path = `${dir}/${file}.json`
	log(`Writing file ${path} epoch ${epochs} - training: ${isTraining}`)

	const json = {
		training: isTraining,
		"max-fitness": scrambles.length,
		"epochs": epochs,
		file: file,
		"fitness-snapshots": fitnessSnapshots,
		"binary-snapshots": binarySnapshotsAggregate.flatMap(x=>x),
		"hyper-parameters": HYPER,
		"iterations": resultAggregate.filter(x=>x!==null).map(x => x.trainingStats.iterations).reduce((acc, curr) => acc + curr, 0),
		net: net.toJSON()
	}

	fs.writeFileSync(path, JSON.stringify(json))
}

function createTrainingFile() {
	if (!WRITE_FILES) return

	log('Create new training.json file')

	const json = {
		training: true,
		"max-fitness": "-",
		"epochs": "-",
		"fitness-snapshots": [],
		"binary-snapshots": [],
		"hyper-parameters": HYPER,
		"iterations": "-",
		net: null
	}

	fs.writeFileSync(`${dir}/training.json`, JSON.stringify(json))
}

function brainJsFormat(success, snap, falloff) {
	if (success === -1) {
		return {
			input: snap.binaryData,
			output: {
				...{
					"U": HYPER["OTHER_RATE"],
					"D": HYPER["OTHER_RATE"],
					"F": HYPER["OTHER_RATE"],
					"B": HYPER["OTHER_RATE"],
					"L": HYPER["OTHER_RATE"],
					"R": HYPER["OTHER_RATE"],
					"U'": HYPER["OTHER_RATE"],
					"D'": HYPER["OTHER_RATE"],
					"F'": HYPER["OTHER_RATE"],
					"B'": HYPER["OTHER_RATE"],
					"L'": HYPER["OTHER_RATE"],
					"R'": HYPER["OTHER_RATE"],
				},
				[snap.policy]: HYPER["FAIL_RATE"]
			}
		}
	}
	return {
		input: snap.binaryData,
		output: {
			...{
				"U": HYPER["OTHER_RATE"],
				"D": HYPER["OTHER_RATE"],
				"F": HYPER["OTHER_RATE"],
				"B": HYPER["OTHER_RATE"],
				"L": HYPER["OTHER_RATE"],
				"R": HYPER["OTHER_RATE"],
				"U'": HYPER["OTHER_RATE"],
				"D'": HYPER["OTHER_RATE"],
				"F'": HYPER["OTHER_RATE"],
				"B'": HYPER["OTHER_RATE"],
				"L'": HYPER["OTHER_RATE"],
				"R'": HYPER["OTHER_RATE"],
			},
			[snap.policy]: HYPER["SUCCESS_RATE"] * falloff
		}
	}
}

function formatDate(date) {
  return `${date.getFullYear()}-${leftPad("00", date.getMonth().toString())}-${leftPad("00", date.getDate().toString())}-${leftPad("00", date.getHours().toString())}-${leftPad("00", date.getMinutes().toString())}-${leftPad("00", date.getSeconds().toString())}`
}

function leftPad(template, str) {
	const full = template.concat(str)
	return full.substr(str.length)
}

function log() {
	if (!LOGGING) return
	return console.log(...arguments)
}

function debugLog() {
	if (!DEBUG_LOGGING) return
	return log(...arguments)
}

function logObj(obj) {
	log('Object:')
	for (var i in obj) {
		log(`${i}: ${obj[i]}`)
	}
}

initTrainer()
