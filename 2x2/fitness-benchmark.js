
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
	binaryStr,
	randomAgent,
	moves,
	solveCube
} = require('./common')
const fs = require('fs')
const brain = require('../brain-browser.js')
const colors = require('colors')
const ProgressBar = require('progress')
const { sort } = require('ramda')
const rel = '2x2'

require('dotenv').config()
const ATTEMPTS = (process.env.ATTEMPTS && parseInt(process.env.ATTEMPTS)) || 1000;
const FITNESS_TESTS = (process.env.FITNESS_TESTS && parseInt(process.env.FITNESS_TESTS));
const NOVEL_TESTS = (process.env.NOVEL_TESTS && parseInt(process.env.NOVEL_TESTS));
const PRINT_SOLUTION_LIST = false
const ONLY_SUCCESS = true
const RANDOM_AGENT = false
let printFirst = false

console.log(FITNESS_TESTS, NOVEL_TESTS)

const filename = '/training-data/training.json' //`/brains/2020-08-06-00-10-10-impressive.json`

let testDuration, scrambles, net, bar

let fitness = {
	training: false,
	dataset: []
}

function logFitness(iteration, running) {
	console.log('\n\n --- \x1b[4m\x1b[32m2x2/\x1b[35mfitness-benchmark.js\x1b[0m ---')
	
	console.log('\n\nRunning fitness benchmark')
	if (iteration !== null) {
		
		net = new brain.NeuralNetwork().fromJSON(loadNet())
		
		// Training scrambles
		scrambles = loadScrambles('training-scrambles').slice(0, FITNESS_TESTS)

		bar = new ProgressBar('Fitness training     [:bar] :percent of :total :etas :token1', { total: scrambles.length, width: 40, complete: '=', incomplete: ' ' });

		const fitA = determineFitness()

		const rateA = ((fitA.filter(isSuccess).length / fitA.length ) * 100).toFixed(1)
		console.log(`Success rate: ${ colors.bold(colors.cyan(rateA)) }%\n`)

		// Novel scrambles
		scrambles = loadScrambles('novel-scrambles').slice(0, NOVEL_TESTS)

		bar = new ProgressBar('Fitness novel        [:bar] :percent of :total :etas :token1', { total: scrambles.length, width: 40, complete: '=', incomplete: ' ' });

		const fitB = determineFitness()

		const rateB = ((fitB.filter(isSuccess).length / fitB.length ) * 100).toFixed(1)
		console.log(`Success rate: ${ colors.bold(colors.cyan(rateB)) }%`)

		const data = {
			"fitness-training-data": fitA,
			"fitness-novel-data": fitB,
			iteration: iteration,
			date: new Date()
		}
		fitness.dataset.push(data)
	}
	fitness.training = running

	if (!fs.existsSync(`${rel}/fitness-logs`)) fs.mkdirSync(`${rel}/fitness-logs`)
	const path = `${rel}/fitness-logs/fitness.json`
	console.log('\n\nWriting file', path, fitness.training)
	fs.writeFileSync( path, JSON.stringify(fitness) )
}

function initFitness() {
	console.log(`\n\n--- [ DETERMINE FITNESS ] ---`)
	console.log('Attempts', ATTEMPTS)

	persist(createCube())
	console.log('\n\n--- [ LOADING NET ] ---')
	net = new brain.NeuralNetwork().fromJSON(loadNet())
	console.log('Done')

	testTarget('training-scrambles')
	testTarget('novel-scrambles')
}

function testTarget(target) {
	const color = target === 'training-scrambles' ? colors.brightCyan : colors.green;
	
	console.log(`\n\n--- [ LOADING ${color(target.toUpperCase())} SCRAMBLES ] ---`)
	scrambles = loadScrambles(target).slice(0, target === 'training-scrambles' ? FITNESS_TESTS : NOVEL_TESTS)
	if (!scrambles) {
		console.log('Could not load scramble file')
		return
	}
	console.log(`${scrambles.length} scrambles loaded from file`)

	bar = new ProgressBar('Fitness [:bar] :percent of :total :etas :token1', { total: scrambles.length, width: 40 });

	console.log(`\n\n--- [ TESTING ${color(target.toUpperCase())} SCRAMBLES ] ---`)
	const start = new Date()
	const fitness = determineFitness()
	testDuration = seconds(new Date(), start)

	console.log(`${ scrambles.length} tested`)

	logResults(fitness, target)
}

function loadNet() {
	const file = `${rel}${filename}`
	try {
		const rawFile = fs.readFileSync(file)
		return JSON.parse(rawFile).net
	} catch(e) {
		console.error(`Error loading file ${file}`, e)
	}
}

function loadScrambles(target) {
	const file = `${rel}/scrambles/${target}.json`
	try {
		const rawFile = fs.readFileSync(file)
		return JSON.parse(rawFile)
	} catch(e) {
		console.error(`Error loading file ${file}`, e)
	}
}

function logResults(fitness, target) {
	const color = target === 'training-scrambles' ? colors.brightCyan : colors.green;
	console.log(`\n--- [ FINAL RESULT BY PLAYING ${ color(target.toUpperCase())} ] ---`)
	console.log('\nTesting duration:', testDuration)
	const rate = ((fitness.filter(isSuccess).length / fitness.length ) * 100).toFixed(1)
	console.log(`\nSuccess rate: ${ colors.bold(colors.cyan(rate)) }%`)
}

function determineFitness() {
	let success = 0
	const fitness = scrambles.map((scramble, idx) => {
		cube = scrambleCube(scramble)
		let r = solveCube(scramble, randomUberAgent, ATTEMPTS, false)
		if (r.correct !== -1) success += 1

		bar.tick({ token1: `${ (100 * (success / (idx+1))).toFixed(0) }% success` })

		return r
	})

	return fitness
}

function seconds(dateA, dateB) {
	return `${ Math.round((dateA.getTime() - dateB.getTime()) / 1000) } seconds`
}

function randomUberAgent() {
	return {
		"U": Math.random(),
		"U'": Math.random(),
		"D": Math.random(),
		"D'": Math.random(),
		"L": Math.random(),
		"L'": Math.random(),
		"R": Math.random(),
		"R'": Math.random(),
		"F": Math.random(),
		"F'": Math.random(),
		"B": Math.random(),
		"B'": Math.random()
	}
}

function hasSeenIt(arr, cubeStr, policy) {
	return arr.find(x => x.cubeStr === cubeStr && x.policy === policy) !== undefined
}

function sortedPairs(arr) {
	return sort((a,b) => a.value > b.value ? -1 : 1, Object.values(arr).map((x, i) => ({ policy: Object.keys(arr)[i], value: x })))
} 

function primPrint(move) {
	if (move === "L'") return "l'"
	if (move === "R'") return "r'"
	if (move === "F'") return "f'"
	if (move === "B'") return "b'"
	if (move === "U'") return "u'"
	if (move === "D'") return "d'"

	return move
}


function isSuccess(x) {
	return x !== -1
}

if (process.argv[2] === "run") {
	initFitness()
}


if (typeof module !== "undefined" && module.exports) {
	module.exports = {
		logFitness
	}
}
