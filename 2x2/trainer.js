
/*
	Training tool to solve a 2x2 Rubiks Cube - data model completely made up by me

	The tool outputs data into a folder it creates called 'training-data'

	Run the tool with # node trainer.js reset
	The reset flag creates a brand new net for training

	Fiddle with hyper parameters to find an optimal policy-finding policy (meta puns are tight)

	Use any program to serve the folder as HTTP-server (like 'serve' in npmjs) and visit 'statistics-graph-2x2.html'
	to view live graph visualizations as the network trains
*/

const { createCube, persist, compare, up, down, left, right, front, back, scrambleCube, moveFuncs } = require('./2x2cube-common')
const scrambles = require('./scrambles')
const brain = require('../brain-browser.js')
const fs = require('fs')
const R = require('ramda')
const dir = 'training-data'

const startDate = new Date()
const LOGGING = true
const WRITE_FILES = true
const LOG_INTERVAL = 1

if (!fs.existsSync(dir)) fs.mkdirSync(dir)
const filename = `${dir}/2x2cube-${formatDate(new Date())}.json`
const trainingfile = `${dir}/training.json`

const HYPER = {
	"ITERATIONS": 10000,
	"MOVES": 10,
	"EXPLORATION_RATE": 0.01,
	"NETS": 1,
	"SUCCESS_RATE": 1,
	"NEUTRAL_RATE": -0.001,
	"FAIL_RATE": -0.01,
	"TRAINING_OPTIONS": {
		//iterations: 10000, // the maximum times to iterate the training data --> number greater than 0
	    errorThresh: 0.005, // the acceptable error percentage from training data --> number between 0 and 1
	    //log: true, // true to use console.log, when a function is supplied it is used --> Either true or a function
	    //logPeriod: 10000, // iterations between logging out --> number greater than 0
	    learningRate: 0.01, // scales with delta to effect training rate --> number between 0 and 1
	    momentum: 0.1, // scales with next layer's change value --> number between 0 and 1
	    callback: null, // a periodic call back that can be triggered while training --> null or function
	    callbackPeriod: 10, // the number of iterations through the training data between callback calls --> number greater than 0
	    timeout: 60000, // the max number of milliseconds to train for --> number greater than 0
	},
	"BRAIN_CONFIG": {
		//inputSize: 20,
		//inputRange: 20,
		//hiddenLayers: [4],
		//outputSize: 20,
		//learningRate: 0.05,
		//decayRate: 0.999,
		//reinforce: true, // not used since not FeedForward
		binaryThresh: 0.5,
  		//hiddenLayers: [10, 4], // array of ints for the sizes of the hidden layers in the network
  		//activation: 'relu', // supported activation types: ['sigmoid', 'relu', 'leaky-relu', 'tanh'],
  		//leakyReluAlpha: 0.01, // supported for activation type 'leaky-relu'
	}
}

let cube, net, trainer, newNetworkNeeded, fitnessSnapshots

function initTrainer() {
	fitnessSnapshots = []

	log('\n\n--- [ 2X2 RUBICS CUBE SOLVING USING BRAIN.JS ] ---')
	log('Hyper-parameters', HYPER)
	log('\n--- [ SETUP ] ---')

	let rawFile, file
	try {
		rawFile = fs.readFileSync(`${dir}/training.json`)
		file = JSON.parse(rawFile)
	} catch(e) {

	}

	newNetworkNeeded = process.argv[2] === "reset" || !file

	log(newNetworkNeeded ? 'New network created' : 'Reading file net.json')

	log('\n--- [ BEGIN TRAINING ] ---')
	train()
}

function setup() {
	//cube = createCube()

	if (newNetworkNeeded) {
		net = new brain.NeuralNetwork(HYPER["BRAIN_CONFIG"])
		net.train([{ input: 1, output: 1 }], HYPER["TRAINING_OPTIONS"])
	} else {
		console.error('Reimplement this plz')
		//net = new brain.NeuralNetwork(HYPER["BRAIN_CONFIG"]).fromJS(file.net)
	}
}

function train() {
	setup()

	const results = new Array(HYPER.ITERATIONS).fill().map((x, i) => {
		const trainingStats = trainIteration()
		const solveStats = logIteration(i, trainingStats)

		return {
			trainingStats: trainingStats,
			solveStats: solveStats
		}
	})

	if (WRITE_FILES) {
		writeTrainingLogFile(false)
	}

	log('\n--- [ RESULTS BY PLAYING TEST-DATA ] ---')
	results.forEach(point => {
		log(`\nTraining Stats: ${point.trainingStats.error}`)
		point.solveStats.forEach(x => log(x))
		log(`Success rate: ${ ((point.solveStats.filter(isSuccess).length / point.solveStats.length ) * 100).toFixed(1)}%`)
		
	})
}

function isSuccess(x) {
	return x.success !== -1
}

function logIteration(iteration, stats) {
	if (iteration % LOG_INTERVAL === 0) {
		const iterationFitness = scrambles.map(solveCube)

		fitnessSnapshots.push({ fitness: iterationFitness, date: new Date().toISOString() })
		if (WRITE_FILES) {
			writeTrainingLogFile(true)
		}
		return iterationFitness
	}
}

function writeTrainingLogFile(isTraining) {
	const jsonStr = JSON.stringify({ training: isTraining, "max-fitness": scrambles.length, filename: filename, fitnessSnapshots: fitnessSnapshots, "hyper-parameters": HYPER, net: net.toJSON() })
	fs.writeFileSync(trainingfile, jsonStr)
}

function trainIteration() {
	return { error: 0.2 }
}

function solveCube(scramble) {
	const solution = []
	cube = createCube()
	persist(cube)

	cube = scrambleCube(cube, scramble)

	new Array(HYPER.MOVES).fill().forEach((x, i) => {

		if (compare(cube)) {
			return
		}
		const policy = ['L', 'R', 'F', 'B', 'U', 'D'][Math.floor(Math.random() * 6)] // random policy 'L' // ask net
		solution.push(policy)

		cube = moveFuncs[policy](cube)
	})

	return {
		scramble: scramble,
		solution: solution,
		success: compare(cube) ? solution.length : -1
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

initTrainer()