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
	binary
} = require('./common')

const brain = require('../brain-browser.js')
const fs = require('fs')
const R = require('ramda')
const colors = require('colors')
const dir = 'training-data'
const filename = 'data-collection.json'
const filepath = `${dir}/${filename}`

const ITERATIONS = 1
const MOVES = 1

function initCollector() {
	console.log('Init collector')
	snapshots = []

	if (!fs.existsSync(dir)) fs.mkdirSync(dir)

	collectData()

	persistFile()

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
		cube = front(cube)

		const snap = {
			input: binary(cube),
			output: { ["F'"]: 1 }
		}

		snapshots.push(snap)
	}
}

function persistFile() {
	console.log('Persist file')
	const json = snapshots

	fs.writeFileSync(filepath, JSON.stringify(json))
}

initCollector()