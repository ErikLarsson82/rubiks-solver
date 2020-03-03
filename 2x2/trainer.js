
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
const LOGGING = true
const WRITE_FILES = true
const LOG_INTERVAL = 1

if (!fs.existsSync(dir)) fs.mkdirSync(dir)
const filename = `${dir}/2x2cube-${formatDate(new Date())}.json`
const trainingfile = `${dir}/training.json`

const HYPER = {
	"ITERATIONS": 10,
	"MOVES": 1,
	"EXPLORATION_RATE": 0.5,
	"NETS": 1,
	"SUCCESS_RATE": 1,
	"OTHER_RATE": null,
	"FAIL_RATE": -0.5,
	"TRAINING_OPTIONS": {
		iterations: 20000,
	    log: true,
	    logPeriod: 5000
	},
	"BRAIN_CONFIG": {}
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
		process.exit()
		//net = new brain.NeuralNetwork(HYPER["BRAIN_CONFIG"]).fromJS(file.net)
	}
}

function train() {
	setup()

	let isDone = false
	let breakpoint = HYPER.ITERATIONS

	const results = new Array(HYPER.ITERATIONS).fill().map((x, i) => {
		if (isDone) return null
		log('\n\n\n\n!!! <<<<<<<<<<<<<<<<<< TRAINING >>>>>>>>>>>>>>>>>> !!!')
		const trainingStats = trainIteration()
		log('\n=== <<<<<<<<<<<<<<<<<< SOLVING >>>>>>>>>>>>>>>>>> ===')
		const solveStats = logIteration(i, trainingStats)

		if (solveStats.filter(x => isSuccess(x) && x.exploration === false).length === scrambles.length) {
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

	const data = scrambles.map(scramble => solveCube(scramble, true, true))
	
	data.forEach(d => {
		log(d)
		d.binarySnapshots.forEach(x => log(x.binaryData.join('')))
	})

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
	log('preparedData')
	preparedData.forEach(data => log(data.input.join(''),' - ',data.output))
	return net.train(preparedData, HYPER["TRAINING_OPTIONS"])
}

function solveCube(scramble, collectMoveData, exploreEnabled) {
	const solution = []
	const binarySnapshots = []
	cube = createCube()
	persist(cube)

	cube = scrambleCube(cube, scramble)

	log('For scramble', scramble)

	let exploration = false

	new Array(HYPER.MOVES).fill().forEach((x, i) => {

		if (compare(cube)) {
			return
		}
		const binaryCube = binary(cube)
		const selectRandom = exploreEnabled && Math.random() < HYPER.EXPLORATION_RATE
		let policy
		if (selectRandom) {
			policy = randomAgent()
			exploration = true
		} else {
			policy = brain.likely(binaryCube, net)
		}
		
		log( 'Policy selected: [[ -> ', policy, ' <- ]]', selectRandom ? 'IM SO RANDOM' : '', '\nNet total policy', net.run(binaryCube) )
		solution.push(policy)

		cube = moveFuncs[policy](cube)

		if (collectMoveData)
			binarySnapshots.push({
				binaryData: binaryCube,
				policy: policy
			})
	})

	return {
		scramble: scramble,
		solution: solution,
		binarySnapshots: collectMoveData ? binarySnapshots : null,
		success: compare(cube) ? solution.length : -1,
		exploration: exploration
	}
}

function isSuccess(x) {
	return x.success !== -1
}

function logIteration(iteration, stats) {
	if (iteration % LOG_INTERVAL === 0) {
		const iterationFitness = scrambles.map(x => solveCube(x, false, false))

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