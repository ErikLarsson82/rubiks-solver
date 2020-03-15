
/*
	Training tool to solve a 2x2 Rubiks Cube - data model completely made up by me

	The tool outputs data into a folder it creates called 'training-data'

	Run the tool with # node trainer.js reset
	The reset flag creates a brand new net for training

	Fiddle with hyper parameters to find an optimal policy-finding policy (meta puns are tight)

	Use any program to serve the folder as HTTP-server (like 'serve' in npmjs) and visit 'statistics.html'
	to view live graph visualizations as the network trains
*/

let cube, net, trainer, file, experience, lastEpochResults, trainDuration, testDuration, bar

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
	randomAgent,
	moves
} = require('./common')
const { logFitness } = require('./fitness-benchmark.js')
const brain = require('../brain-browser.js')
const fs = require('fs')
const R = require('ramda')
const colors = require('colors')
const dir = 'training-data'
const ProgressBar = require('progress')
const fetch = require('node-fetch')

const startDate = new Date()
const LOGGING = true
const DEBUG_LOGGING = true
const WRITE_FILES = true
const LOG_INTERVAL = 1

const MINUTE = 1000 * 60

const HYPER = {
	"EPOCHS": 100,
	"NETS": 1,
	"TRAINING_OPTIONS": {
		iterations: 100,
		errorThresh: 0.005,
		timeout: 1000 * 30,
		callback: callback,
		callbackPeriod: 1
	},
	"BRAIN_CONFIG": {}
}

function callback({ error }) {
	bar.tick({'token1': error });
}

function initTrainer() {
	
	if (!fs.existsSync(dir)) fs.mkdirSync(dir)

	log('\n--- [ 2X2 RUBICS CUBE SOLVING USING BRAIN.JS ] ---')
	log('Hyper-parameters', HYPER)
	log('\n\n--- [ SETUP ] ---')

	try {
		const rawFile = fs.readFileSync(`experience-data/experience-collection.json`)
		const parsed = JSON.parse(rawFile)
		experience = parsed.snapshots

		log(`File experience-collection read - binary samples ${experience.length} - parameters`, parsed["experience-parameters"])
	} catch(e) {
		console.error('Cannot read file experience-collection.json')
		return
	}

	log('Creating new neural network')
	net = new brain.NeuralNetwork(HYPER["BRAIN_CONFIG"])

	persist(createCube())

	train()
}

async function train() {

	// move this init
	const path = `fitness-logs/fitness.json`
	console.log('Writing file on startup', path)
	fs.writeFileSync( path, JSON.stringify({ training: true, dataset: [] }) )

	log('Websocket ping')
	await fetch('http://localhost:5000/ping')

	log('\n\n--- [ BEGIN TRAINING ] ---')
	log(`Running brain.js train API`)
	let start = new Date()

	for (var j = 0; j < HYPER.EPOCHS; j++) {
		bar = new ProgressBar('Training network     [:bar] :percent of :total :etas - error :token1', { total: HYPER["TRAINING_OPTIONS"].iterations, width: 40 });
		bar.tick({ token1: "N/A" })

		const trainingStats = net.train(experience, HYPER["TRAINING_OPTIONS"])
		console.log(`\nTraining stats`, trainingStats)
		
		writeLogFile('training', j, true)

		logFitness(j, true)
		
		log('Websocket ping')
		await fetch('http://localhost:5000/ping')

		log('\n')
	}

	logFitness(null, false)

	trainDuration = seconds(new Date(), start)
	log(`Training complete in ${trainDuration}\n`)

	writeLogFile('training', j, false)
	writeLogFile(`${formatDate(new Date())}`, j, false)
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

function seconds(dateA, dateB) {
	return `${ Math.round((dateA.getTime() - dateB.getTime()) / 1000) } seconds`
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

const permutations = R.compose(R.sequence(R.of), R.flip(R.repeat));

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

function writeLogFile(file, epochs, isTraining) {
	if (!WRITE_FILES) return

	const path = `${dir}/${file}.json`
	log(`Writing file ${path} epoch ${epochs} - training: ${isTraining}\n`)

	const json = {
		"training": isTraining,
		"epochs": epochs,
		"file": file,
		"hyper-parameters": HYPER,
		"net": net.toJSON()
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
