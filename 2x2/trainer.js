
/*
	Training tool to solve a 2x2 Rubiks Cube - data model completely made up by me

	The tool outputs data into a folder it creates called 'training-data'

	Run the tool with # node trainer.js reset
	The reset flag creates a brand new net for training

	Fiddle with hyper parameters to find an optimal policy-finding policy (meta puns are tight)

	Use any program to serve the folder as HTTP-server (like 'serve' in npmjs) and visit 'statistics.html'
	to view live graph visualizations as the network trains
*/

let cube, net, trainer, newNetworkNeeded, fitnessSnapshots, resultAggregate, binarySnapshotsAggregate, file, lastEpochResults, explorationIndex

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
	binary
} = require('./common')
const scrambles = require('./scrambles')
const brain = require('../brain-browser.js')
const fs = require('fs')
const R = require('ramda')
const colors = require('colors')
const dir = 'training-data'

const startDate = new Date()
const LOGGING = false
const DEBUG_LOGGING = false
const WRITE_FILES = true
const LOG_INTERVAL = 1

const HYPER = {
	"EXPLORATION": 1000,
	"EPOCHS": 0,
	"AGGREGATE_TESTDATA": true,
	"MOVES": 20,
	"EXPLORATION_RATE": 0.1,
	"NETS": 1,
	"SUCCESS_RATE": 1,
	"OTHER_RATE": null,
	"FAIL_RATE": null,
	"TRAINING_OPTIONS": {
		iterations: 100000,
		errorThresh: 0.0002,
		log: true,
	  	logPeriod: 1000,
	},
	"BRAIN_CONFIG": {
		hiddenLayers: [12]
	}
}

function initTrainer() {
	fitnessSnapshots = []
	resultAggregate = []
	binarySnapshotsAggregate = []

	if (!fs.existsSync(dir)) fs.mkdirSync(dir)

	log('\n\n--- [ 2X2 RUBICS CUBE SOLVING USING BRAIN.JS ] ---')
	log('Hyper-parameters', HYPER)
	log('\n--- [ SETUP ] ---')

	try {
		const rawFile = fs.readFileSync(`${dir}/training.json`)
		file = JSON.parse(rawFile)
	} catch(e) {
		console.error('Cannot read file')
	}

	newNetworkNeeded = process.argv[2] === "reset" || !file

	log(newNetworkNeeded ? 'New network created' : 'Reading file net.json')

	if (newNetworkNeeded) {
		net = new brain.NeuralNetwork(HYPER["BRAIN_CONFIG"])
		createTrainingFile()
	} else {
		net = new brain.NeuralNetwork(HYPER["BRAIN_CONFIG"]).fromJSON(file.net)
		log('Loading network from file')
	}

	persist(createCube())

	train()	
}

function train() {
	
	log('\n\n--- [ GATHERING EXPLORATION DATA ] ---')
	
	for (var i = 0; i < HYPER.EXPLORATION; i++) {
		console.log('Exploring', i)
		explore()
	}

	console.log('Binary aggregate', `${binarySnapshotsAggregate.filter(positiveReward).length} / ${binarySnapshotsAggregate.length}`)

	log('\n\n--- [ FIRST TRAINING CHUNK ] ---')
	net.train(binarySnapshotsAggregate.filter(positiveReward), HYPER["TRAINING_OPTIONS"])

	const epochFitness = determineFitness()
	logEpochToFile(0, [], epochFitness)		

	if (HYPER.EPOCHS === 0) return

	log('\n\n--- [ BEGIN TRAINING ] ---')

	for (var j = 0; j < HYPER.EPOCHS; j++) {

		const trainingStats = trainEpoch()
		const epochFitness = determineFitness()
		
		const epochResult = {
			trainingStats: trainingStats,
			epochFitness: epochFitness
		}

		lastEpochResults = epochResult

		if (HYPER["AGGREGATE_TESTDATA"]) {
			resultAggregate.push(epochResult)
		}

		if (explorationIndex && j === 0) {
			explorationIndex = false
		}

		if (epochFitness.filter(x => isSuccess(x)).length === scrambles.length) break;

		logEpochToFile(j, trainingStats, epochFitness)		
	}


	writeLogFile('training', j, false)
	writeLogFile(`${formatDate(new Date())}`, j, false)

	logResults()
}

function explore() {
	cube = createCube()

	const experience = scrambles.map(scramble => {
		cube = scrambleCube(scramble)
		return solveCube(scramble, true, () => true)
	})

	const rewardedPolicyBinarySnapshots = experience.flatMap(assignRewards)
	
	aggregateRewards(rewardedPolicyBinarySnapshots)
}

function trainEpoch() {
	log('\n\n\n\n!!! <<<<<<<<<<<<<<<<<< TRAINING >>>>>>>>>>>>>>>>>> !!!')
		
	cube = createCube()

	const experience = scrambles.map(scramble => {
		cube = scrambleCube(scramble)
		return solveCube(scramble, true, () => Math.random() < HYPER.EXPLORATION_RATE)
	})

	const rewardedPolicyBinarySnapshots = experience.flatMap(assignRewards)
	
	aggregateRewards(rewardedPolicyBinarySnapshots)
	
	log(`\n\n\nRunning brain.js train API`)

	return net.train(binarySnapshotsAggregate, HYPER["TRAINING_OPTIONS"])
}

function solveCube(scramble, collectMoveData, exploreFunc) {
	const solution = []
	const binarySnapshots = []
	
	let exploration = false

	for (var i = 0; i < HYPER.MOVES; i++) {
		const binaryCube = binary(cube)
		let policy
		if (exploreFunc()) {
			policy = randomAgent()
			exploration = true
		} else {
			policy = brain.likely(binaryCube, net)
		}
		
		debugLog(scramble, 'Policy [[ -> ', policy, ' <- ]]', exploration ? 'EXPLORATION' : '') //formatPolicyObj(net.run(binaryCube), 4)
		
		solution.push(policy)

		cube = moveFuncs[policy](cube)

		if (collectMoveData) {
			binarySnapshots.push({
				binaryData: binaryCube,
				policy: policy
			})
		}

		if (compare(cube)) break;
	}

	return {
		scramble: scramble,
		solution: solution,
		binarySnapshots: collectMoveData ? binarySnapshots : null,
		success: compare(cube) ? solution.length : -1,
		exploration: exploration
	}
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
	return x.success !== -1
}

function determineFitness() {
	const epochFitness = scrambles.map(scramble => {
		cube = scrambleCube(scramble)
		return solveCube(scramble, false, () => false)
	})

	epochFitness.forEach(x => log(x.success !== -1 ? "✓" : "X", x.scramble.join(" "), " -> ", x.solution.join(" ")))

	fitnessSnapshots.push({ fitness: epochFitness, date: new Date().toISOString() })
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

function randomAgent() {
	return ["L", "R", "F", "B", "U", "D", "L'", "R'", "F'", "B'", "U'", "D'"][Math.floor(Math.random() * 12)]
}

initTrainer()
