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
const MOVES = 200

let testDuration, scrambles, net

function initFitness() {
	console.log('\n\n--- [ LOADING NET ] ---')
	net = new brain.NeuralNetwork().fromJSON(loadNet())
	console.log('Done')

	console.log('\n\n--- [ LOADING SCRAMBLES ] ---')
	scrambles = loadScrambles()
	if (!scrambles) {
		console.log('Could not load scramble file')
		return
	}
	console.log(`${scrambles.length} scrambles loaded from file`)

	console.log('\n\n--- [ TESTING SCRAMBLES ] ---')
	const start = new Date()
	const fitness = determineFitness()
	testDuration = seconds(new Date(), start)
	
	console.log(`${ scrambles.length} tested`)

	logResults(fitness)
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

function loadScrambles() {
	const file = `scrambles/deep-scramble.json`
	try {
		const rawFile = fs.readFileSync(file)
		return JSON.parse(rawFile)
	} catch(e) {
		console.error(`Error loading file ${file}`, e)
	}
}

function logResults(fitness) {
	console.log('\n--- [ FINAL RESULT BY PLAYING TEST-DATA ] ---')
	console.log('\nTesting duration:', testDuration)
	const rate = ((fitness.filter(isSuccess).length / fitness.length ) * 100).toFixed(1)
	console.log(`\nSuccess rate: ${ colors.bold(colors.cyan(rate)) }%`)
}

function determineFitness() {
	const fitness = scrambles.map(scramble => {
		cube = scrambleCube(scramble)
		return solveCube(scramble)
	})

	return fitness
}

function seconds(dateA, dateB) {
	return `${ Math.round((dateA.getTime() - dateB.getTime()) / 1000) } seconds`
}

function solveCube(scramble) {
	for (var i = 0; i < MOVES; i++) {
		const binaryCube = binary(cube)
		policy = brain.likely(binaryCube, net)
		cube = moveFuncs[policy](cube)
		if (compare(cube)) break;
	}

	return compare(cube) ? i : -1
}


function isSuccess(x) {
	return x !== -1
}


initFitness()