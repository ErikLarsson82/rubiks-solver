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
const fs = require('fs')
const brain = require('../brain-browser.js')
const colors = require('colors')
const ProgressBar = require('progress')

require('dotenv').config()
const MOVES = (process.env.MOVES && parseInt(process.env.MOVES)) || process.argv[2] || 12;

let testDuration, scrambles, net, bar

let printFirst = true

function initFitness() {
	console.log(`\n\n--- [ DETERMINE FITNESS ] ---`)
	console.log('Moves', MOVES)

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
	scrambles = loadScrambles(target)
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
	const file = `training-data/training.json`
	try {
		const rawFile = fs.readFileSync(file)
		return JSON.parse(rawFile).net
	} catch(e) {
		console.error(`Error loading file ${file}`, e)
	}
}

function loadScrambles(target) {
	const file = `scrambles/${target}.json`
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
		let r = solveCube(scramble)
		if (r !== -1) success += 1
		bar.tick({ token1: `${ (100 * (success / (idx+1))).toFixed(0) }% success` })
		return r
	})

	return fitness
}

function seconds(dateA, dateB) {
	return `${ Math.round((dateA.getTime() - dateB.getTime()) / 1000) } seconds`
}
 
function solveCube(scramble) {
	let solution = []
	for (var i = 0; i < MOVES; i++) {
		const binaryCube = binary(cube)
		policy = brain.likely(binaryCube, net)
		solution.push(policy)
		cube = moveFuncs[policy](cube)
		if (compare(cube)) break;
	}

	if (printFirst && compare(cube)) {
		printFirst = false
		console.log('Scramble', scramble.map(primPrint))
		console.log('Solution', solution.map(primPrint))
	}

	return compare(cube) ? i : -1
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


initFitness()
