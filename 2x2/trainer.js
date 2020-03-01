
/*
	Training tool to solve a 2x2 Rubiks Cube - data model completely made up by me

	The tool outputs data into a folder it creates called 'training-data'

	Run the tool with # node trainer.js reset
	The reset flag creates a brand new net for training

	Fiddle with hyper parameters to find an optimal policy-finding policy (meta puns are tight)

	Use any program to serve the folder as HTTP-server (like 'serve' in npmjs) and visit 'statistics-graph-2x2.html'
	to view live graph visualizations as the network trains
*/

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
} = require('./2x2cube-common')
const scrambles = require('./scrambles')
const brain = require('../brain-browser.js')
const fs = require('fs')
const R = require('ramda')
const dir = 'training-data'

const startDate = new Date()
const LOGGING = false
const WRITE_FILES = true
const LOG_INTERVAL = 1

if (!fs.existsSync(dir)) fs.mkdirSync(dir)
const filename = `${dir}/2x2cube-${formatDate(new Date())}.json`
const trainingfile = `${dir}/training.json`

const HYPER = {
	"ITERATIONS": 1000,
	"MOVES": 1,
	"EXPLORATION_RATE": 0.0,
	"NETS": 1,
	"SUCCESS_RATE": 1,
	"OTHER_RATE": 0.1,
	"NEUTRAL_RATE": -0.001,
	"FAIL_RATE": -0.1,
	"TRAINING_OPTIONS": {
		//iterations: 500, // the maximum times to iterate the training data --> number greater than 0
	    //errorThresh: 0.005, // the acceptable error percentage from training data --> number between 0 and 1
	    log: true, // true to use console.log, when a function is supplied it is used --> Either true or a function
	    logPeriod: 200, // iterations between logging out --> number greater than 0
	    //learningRate: 0.9, // scales with delta to effect training rate --> number between 0 and 1
	    //momentum: 0.1, // scales with next layer's change value --> number between 0 and 1
	    //callback: null, // a periodic call back that can be triggered while training --> null or function
	    //callbackPeriod: 10, // the number of iterations through the training data between callback calls --> number greater than 0
	    //timeout: 60000, // the max number of milliseconds to train for --> number greater than 0
	},
	"BRAIN_CONFIG": {
		//inputSize: 20,
		//inputRange: 20,
		//hiddenLayers: [500, 200],
		//outputSize: 20,
		//learningRate: 0.95,
		//decayRate: 0.999,
		//reinforce: true, // not used since not FeedForward
		//binaryThresh: 0.5,
  		//hiddenLayers: [10, 4], // array of ints for the sizes of the hidden layers in the network
  		//activation: 'leaky-relu', // supported activation types: ['sigmoid', 'relu', 'leaky-relu', 'tanh'],
  		//leakyReluAlpha: 0.01, // supported for activation type 'leaky-relu'
	}
}

let cube, net, trainer, newNetworkNeeded, fitnessSnapshots, totalIterations

function initTrainer() {
	fitnessSnapshots = []
	totalIterations = 0

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
	cube = createCube()

	if (newNetworkNeeded) {
		net = new brain.NeuralNetwork(HYPER["BRAIN_CONFIG"])
		net.train({ input: binary(cube), output: { F: 0.5, B: 0.5, L: 0.5, R: 0.5, U: 0.5, D: 0.5 } }, { iterations: 1 })
	} else {
		console.error('Cannot load from file - not implemented')
		//net = new brain.NeuralNetwork(HYPER["BRAIN_CONFIG"]).fromJS(file.net)
	}
}

function train() {
	setup()

	let isDone = false
	let breakpoint = HYPER.ITERATIONS

	const results = new Array(HYPER.ITERATIONS).fill().map((x, i) => {
		if (isDone) return null
		log('\n\n\n\nTRAINING')
		const trainingStats = trainIteration()
		log('SOLVING')
		const solveStats = logIteration(i, trainingStats)

		if (solveStats.filter(isSuccess).length === scrambles.length) {
			isDone = true
			breakpoint = i
		}

		return {
			trainingStats: trainingStats,
			solveStats: solveStats
		}
	})

	if (WRITE_FILES) {
		writeTrainingLogFile(breakpoint, false)
	}

	log('\n--- [ RESULTS BY PLAYING TEST-DATA ] ---')
	results.filter(x=>x!==null).forEach(point => {
		log(`\nTraining Stats: ${point.trainingStats.error}`)
		point.solveStats.forEach(x => log(x))
		log(`Success rate: ${ ((point.solveStats.filter(isSuccess).length / point.solveStats.length ) * 100).toFixed(1)}%`)
		
	})
}

function trainIteration() {
	cube = createCube()

	const data = scrambles.map(scramble => solveCube(scramble, true))
	log(data)
	const preparedData = data.flatMap(({ binarySnapshots, success }, i) => {
		return binarySnapshots.map(snap => {
			if (success === -1) {
				return {
					input: snap.binaryData,
					output: {
						...{
							'U': HYPER["OTHER_RATE"],
							'D': HYPER["OTHER_RATE"],
							'F': HYPER["OTHER_RATE"],
							'B': HYPER["OTHER_RATE"],
							'L': HYPER["OTHER_RATE"],
							'R': HYPER["OTHER_RATE"],
						},
						[snap.policy]: HYPER["FAIL_RATE"]
					}	
				}
			}
			return {
				input: snap.binaryData,
				output: {
					...{
						'U': HYPER["OTHER_RATE"],
						'D': HYPER["OTHER_RATE"],
						'F': HYPER["OTHER_RATE"],
						'B': HYPER["OTHER_RATE"],
						'L': HYPER["OTHER_RATE"],
						'R': HYPER["OTHER_RATE"],
					},
					[snap.policy]: HYPER["SUCCESS_RATE"]
				}
			}
		})
	})
	log('preparedData', preparedData)
	return net.train(preparedData, HYPER["TRAINING_OPTIONS"])
}

function solveCube(scramble, collectMoveData) {
	const solution = []
	const binarySnapshots = []
	cube = createCube()
	persist(cube)

	cube = scrambleCube(cube, scramble)

	log('For scramble', scramble)

	new Array(HYPER.MOVES).fill().forEach((x, i) => {

		if (compare(cube)) {
			return
		}
		let policy
		if (Math.random() < HYPER.EXPLORATION_RATE) {
			policy = randomAgent()
		} else {
			policy = brain.likely(binary(cube), net)
		}
		
		log('Policy selected:', policy, 'Net total policy', net.run(binary(cube)))
		solution.push(policy)

		cube = moveFuncs[policy](cube)

		if (collectMoveData)
			binarySnapshots.push({
				binaryData: binary(cube),
				policy: policy
			})
	})

	return {
		scramble: scramble,
		solution: solution,
		binarySnapshots: collectMoveData ? binarySnapshots : null,
		success: compare(cube) ? solution.length : -1
	}
}

function isSuccess(x) {
	return x.success !== -1
}

function logIteration(iteration, stats) {
	if (iteration % LOG_INTERVAL === 0) {
		const iterationFitness = scrambles.map(x => solveCube(x, false))

		fitnessSnapshots.push({ fitness: iterationFitness, date: new Date().toISOString() })
		if (WRITE_FILES) {
			writeTrainingLogFile(iteration, true)
		}
		return iterationFitness
	}
}

function writeTrainingLogFile(trainedIterations, isTraining) {
	const jsonStr = JSON.stringify({
		training: isTraining,
		"max-fitness": scrambles.length,
		"trained-iterations": trainedIterations,
		filename: filename,
		fitnessSnapshots: fitnessSnapshots,
		"hyper-parameters": HYPER,
		net: net.toJSON()
	})
	fs.writeFileSync(trainingfile, jsonStr)
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

function randomAgent() {
	return ['L', 'R', 'F', 'B', 'U', 'D'][Math.floor(Math.random() * 6)]
}

initTrainer()