
console.log('\n\n --- \x1b[4m\x1b[32m2x2/\x1b[35mtrainer.js\x1b[0m ---')

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
	randomDistAgent,
	invertMove,
	moves
} = require('./common')
const { logFitness, determineFitness } = require('./fitness-benchmark.js')
const { permutations } = require('./scramble-permutation-generator.js')
const { generateScrambleSet } = require('./deep-scramble-generator.js')
const brain = require('brain.js')
const fs = require('fs')
const R = require('ramda')
const colors = require('colors')
const rel = '2x2'
const dir = `${rel}/`
const dirData = `${rel}/training-data`
const dirLogs = `${rel}/training-logs`
const dirFitnessLogs = `${rel}/fitness-logs`
const ProgressBar = require('progress')
const fetch = require('node-fetch')

require('dotenv').config()

const startDate = new Date()
const LOGGING = true
const DEBUG_LOGGING = true
const WRITE_FILES = true
const LOG_INTERVAL = 1

const SECOND = 1000
const MINUTE = SECOND * 60
const HOUR = MINUTE * 60
const DAYS = HOUR * 24

const MOVES = (process.env.MOVES && parseInt(process.env.MOVES)) || 12;
const EPOCHS = (process.env.EPOCHS && parseInt(process.env.EPOCHS)) || 1;
const ITERATIONS = (process.env.ITERATIONS && parseInt(process.env.ITERATIONS)) || 20000;
const EXPERIENCE_SNAPSHOTS = (process.env.EXPERIENCE_SNAPSHOTS && parseInt(process.env.EXPERIENCE_SNAPSHOTS)) || 10;

const ERROR_THRESH = (process.env.ERROR_THRESH && parseFloat(process.env.ERROR_THRESH)) || 0.002;










const HYPER = {
	"EPOCHS": EPOCHS,
	"TRAINING_OPTIONS": {
		iterations: ITERATIONS,
		errorThresh: ERROR_THRESH,
		callback: callback,
		callbackPeriod: 1,
		timeout: SECOND * 10

	},
	"BRAIN_CONFIG": {
		//hiddenLayers: [12],
		//learningRate: 0.4
	}
}

function callback({ error }) {
	bar.tick({'token1': error });
}








function trainerSchema() {
	
	log('\n--- [ 2X2 RUBIKS CUBE SOLVING USING BRAIN.JS ] ---')
	log('Hyper-parameters', HYPER)
	log('\n\n--- [ SETUP ] ---')

	log('Creating new neural network')
	net = new brain.NeuralNetworkGPU(HYPER["BRAIN_CONFIG"])

	log('\n\n--- [ BEGIN TRAINING SCHEMA ] ---')

	log(`Creating non-distinct scramble set of maximum ${3} moves`)
	const scrambles = generateScrambleSet()

	//permutations(2, moves)

	const agent = cube => net.run(binary(cube))
	
	for (var j = 0; j < HYPER.EPOCHS; j++) {
		log(`\n\n\n\x1b[36mEpoch \x1b[0m${j+1} of ${HYPER.EPOCHS}`)
	
		log(`Determine current fitness`)
		const fit = determineFitness(scrambles, cube => j === 0 ? randomDistAgent() : agent(cube), MOVES)
		const onlySuccess = fit.filter(x=>x.correct !== -1)
		log(onlySuccess.length, 'of', fit.length)

		const experienceSnapshots = []

		log('\nGenerate new experience data')
		do {
			let cube = createCube()

			if (onlySuccess.length > 0) {
				const r1 = Math.floor(Math.random() * (onlySuccess.length-1))
				const seq = onlySuccess[r1]
				const r2 = Math.floor(Math.random() * (seq.scramble.length+1))
				const scr = seq.scramble.slice(0, r2)
				for (var i = 0; i < scr.length; i++) {
					cube = moveFuncs[scr[i]](cube)
				}
			}

			const agentMove = randomAgent()
			cube = moveFuncs[agentMove](cube)

			experienceSnapshots.push({
				input: binary(cube),
				output: {
					[invertMove(agentMove)]: 1
				}
			})
			

		} while (experienceSnapshots.length < EXPERIENCE_SNAPSHOTS)
		log(experienceSnapshots.length, 'generated\n')

		bar = new ProgressBar('Training network     [:bar] :percent of :total :etas - error :token1', { total: HYPER["TRAINING_OPTIONS"].iterations, width: 40, complete: '=', incomplete: ' ' });
		bar.tick({ token1: "N/A" })
		
		const trainingStats = net.train(experienceSnapshots, HYPER["TRAINING_OPTIONS"])
		log(`\nTraining stats`, trainingStats)

		log('\n')
	}

	log('Final fitness test')
	const fit = determineFitness(scrambles, agent, MOVES)

	log(fit.filter(x=>x.correct !== -1).length, 'of', fit.length)
}



















function killSwitch() {

	console.log(' --- \x1b[32mDONE\x1b[0m --- ')
	process.exit(0)
}

function rand(input) {
  return Math.floor(Math.random() * (input+1))
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
		writeFile(`${dirData}/training.json`, epoch, true)
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

function writeFile(path, epochs, isTraining) {
	if (!WRITE_FILES) return

	log(`Writing file ${path} epoch ${epochs} - training: ${isTraining}\n`)

	const json = {
		"training": isTraining,
		"epochs": epochs,
		"file": path,
		"hyper-parameters": HYPER,
		"env-file": {
			MOVES: process.env.MOVES,
			ATTEMPTS: process.env.ATTEMPTS,
			SCRAMBLES: process.env.SCRAMBLES,
			FITNESS_TESTS: process.env.FITNESS_TESTS,
			NOVEL_TESTS: process.env.NOVEL_TESTS,
		},
		"net": net.toJSON()
	}

	fs.writeFileSync(path, JSON.stringify(json))
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

trainerSchema()
