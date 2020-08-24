/*
	Randomly tries to solve the cube and collects binary data of input and output (rewards).

	This data is written to a file and is ready for the neural network training process.
*/

let file, snapshopts

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
	invertMove,
	invertSequence,
	randomAgent
} = require('./common')

const brain = require('../brain-browser.js')
const fs = require('fs')
const R = require('ramda')
const colors = require('colors')
const dir = 'training-data'
const filename = 'data-collection.json'
const filepath = `${dir}/${filename}`

const ITERATIONS = 20000
const MOVES = 3

function initCollector() {
	const start = new Date()
	console.log('Init collector')
	snapshots = []

	if (!fs.existsSync(dir)) fs.mkdirSync(dir)

	collectData()

	persistFile()

	console.log('MOVES', MOVES)
	console.log(`Duration ${ seconds(new Date(), start) }`) 
	console.log('Collection complete', snapshots.length)
}

function collectData() {
	console.log('Collect data')
	for (var i = 0; i < ITERATIONS; i++) {
		solve()
	}
}

function solve() {
	let snaps = []

	let cube = createCube()
	
	for (var i = 0; i < MOVES; i++) {

		const scrambleMove = randomAgent()
		cube = moveFuncs[scrambleMove](cube)

		const snap = {
			input: binary(cube),
			output: { [invertMove(scrambleMove)]: 1 }
		}

		snapshots.push(snap)
	}
}

function persistFile() {
	console.log('Persist file')
	const json = snapshots

	fs.writeFileSync(filepath, JSON.stringify(json))
}

function seconds(dateA, dateB) {
	return `${ Math.round((dateA.getTime() - dateB.getTime()) / 1000) } seconds`
}

initCollector()