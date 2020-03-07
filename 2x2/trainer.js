
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
} = require('./common')
const scrambles = require('./scrambles')
const brain = require('../brain-browser.js')
const fs = require('fs')
const R = require('ramda')
const dir = 'training-data'

const startDate = new Date()
const LOGGING = true
const DEBUG_LOGGING = false
const WRITE_FILES = true
const LOG_INTERVAL = 1

if (!fs.existsSync(dir)) fs.mkdirSync(dir)

const HYPER = {
	"EPOCHS": 10000,
	"MOVES": 5,
	"EXPLORATION_RATE": 0.5,
	"NETS": 1,
	"SUCCESS_RATE": 1,
	"OTHER_RATE": 0.01,
	"FAIL_RATE": -0.1,
	"TRAINING_OPTIONS": {
		iterations: 2000,
		//errorThresh: 0.02,
		timeout: 60000,
	  	log: true,
	  	logPeriod: 1
	},
	"BRAIN_CONFIG": {
		hiddenLayers: [480],
		//learningRate: 0.5,
		binaryThresh: 0.5
	}
}

let cube, net, trainer, newNetworkNeeded, fitnessSnapshots, resultAggregate, binarySnapshotsAggregate

function initTrainer() {
	fitnessSnapshots = []
	resultAggregate = []
	binarySnapshotsAggregate = []

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
		net = new brain.NeuralNetworkGPU(HYPER["BRAIN_CONFIG"])
		log(net.train({ input: binary(cube), output: { F: 0.5, B: 0.5, L: 0.5, R: 0.5, U: 0.5, D: 0.5 } }, { iterations: 1 }))
	} else {
		console.error('Cannot load from file - not implemented')
		process.exit()
	}

	createTrainingFile()
}

function train() {
	setup()

	let isDone = false
	let breakpoint = HYPER.EPOCHS

	const results = new Array(HYPER.EPOCHS).fill().map((x, i) => {
		if (isDone) return null
		log('\n\n\n\n!!! <<<<<<<<<<<<<<<<<< TRAINING >>>>>>>>>>>>>>>>>> !!!')
		const trainingStats = trainEpoch()
		log('\n=== <<<<<<<<<<<<<<<<<< SOLVING >>>>>>>>>>>>>>>>>> ===')
		const solveStats = logEpoch(i)

		if (solveStats.filter(x => isSuccess(x) && x.exploration === false).length === scrambles.length) {
			isDone = true
			breakpoint = i
		}

		log('trainingStats', i, trainingStats)

		return {
			trainingStats: trainingStats,
			solveStats: solveStats
		}
	})

	resultAggregate = results

	if (WRITE_FILES) {
		writeLogFile('training', breakpoint, false)
		writeLogFile(`${formatDate(new Date())}`, breakpoint, false)
	}

	log('\n--- [ FINAL RESULT BY PLAYING TEST-DATA ] ---')
	const filtered = results.filter(x=>x!==null)
	const last = filtered.pop()
	log(`\nTraining Stats: ${last.trainingStats.error}`)
	log(last.trainingStats)
	last.solveStats.forEach(x => log(x))
	log(`Success rate: ${ ((last.solveStats.filter(isSuccess).length / last.solveStats.length ) * 100).toFixed(1)}%`)
}

function trainEpoch() {
	cube = createCube()

	const data = scrambles.map(scramble => solveCube(scramble, true, true))

	const rewardedPolicyBinarySnapshots = data.flatMap(({ binarySnapshots, success }, i) => {
		return binarySnapshots.map(x => brainJsFormat(success, x))
	})

	const onlySuccessBinarySnapshots = data.flatMap(({ binarySnapshots, success }, i) => {
		return success !== -1 ? binarySnapshots.map(x => brainJsFormat(success, x)) : []
	})

	rewardedPolicyBinarySnapshots.forEach(data => {
		debugLog(`Snapshot:\n${data.input.join('')}\nReward:`)
		debugLog(data.output)
	})

	log(`\n\n\nRunning brain.js train API`)
	const trainingResult = net.train(rewardedPolicyBinarySnapshots.concat(binarySnapshotsAggregate), HYPER["TRAINING_OPTIONS"])
	
	binarySnapshotsAggregate = binarySnapshotsAggregate.concat(onlySuccessBinarySnapshots)

	log('Binary aggregate', binarySnapshotsAggregate.length)
	log(binarySnapshotsAggregate)

	return trainingResult
}

function solveCube(scramble, collectMoveData, exploreEnabled) {
	const solution = []
	const binarySnapshots = []
	cube = createCube()
	persist(cube)

	cube = scrambleCube(cube, scramble)
	
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

		debugLog( 'Policy selected: [[ -> ', policy, ' <- ]]', selectRandom ? 'IM SO RANDOM' : '', '\nNet total policy', net.run(binaryCube) )
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

function logEpoch(epoch) {
	if (epoch % LOG_INTERVAL === 0) {
		const epochFitness = scrambles.map(x => solveCube(x, false, false))

		epochFitness.forEach(x => log(x.success !== -1 ? "✓" : "X", x.scramble.join(" "), " -> ", x.solution.join(" ")))

		fitnessSnapshots.push({ fitness: epochFitness, date: new Date().toISOString() })
		if (WRITE_FILES) {
			writeLogFile('training', epoch, true)
		}
		return epochFitness
	}
}

function writeLogFile(file, epochs, isTraining) {
	const jsonStr = JSON.stringify({
		training: isTraining,
		"max-fitness": scrambles.length,
		"epochs": epochs,
		file: file,
		"fitness-snapshots": fitnessSnapshots,
		"binary-snapshots": binarySnapshotsAggregate.flatMap(x=>x),
		"hyper-parameters": HYPER,
		"iterations": resultAggregate.filter(x=>x!==null).map(x => x.trainingStats.iterations).reduce((acc, curr) => acc + curr, 0),
		net: net.toJSON()
	})
	fs.writeFileSync(`${dir}/${file}.json`, jsonStr)
}

function createTrainingFile() {
	fs.writeFileSync(`${dir}/training.json`, JSON.stringify({
		training: true,
		"max-fitness": "-",
		"epochs": "-",
		"fitness-snapshots": [],
		"binary-snapshots": [],
		"hyper-parameters": HYPER,
		"iterations": "-",
		net: net.toJSON()
	}))
}

function brainJsFormat(success, snap) {
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
	return ['L', 'R', 'F', 'B', 'U', 'D'][Math.floor(Math.random() * 6)]
}

initTrainer()
