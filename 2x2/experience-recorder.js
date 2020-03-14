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
const dir = 'experience-data'
const filename = process.argv[2] || 'experience-collection' 
const filepath = `${dir}/${filename}.json`

const MILLION = 1000000
const THOUSAND = 1000

const EXPERIENCE_PARAMETERS = {
	6: 2, //3 * MILLION,
	12: 2, //500 * THOUSAND
}

function initCollector() {
	const start = new Date()
	console.log('Init collector')
	snapshots = []

	if (!fs.existsSync(dir)) fs.mkdirSync(dir)

	collectData()

	persistFile()

	console.log(`Duration ${ seconds(new Date(), start) }`) 
	console.log('Collection complete', snapshots.length)
}

function collectData() {
	console.log('Collect data')
	for (var key in EXPERIENCE_PARAMETERS) {
		console.log(`Collecting ${EXPERIENCE_PARAMETERS[key]} iterations with ${key} depth`)
		for (var i = 0; i < EXPERIENCE_PARAMETERS[key]; i++) {
			solve(key)
		}
	}
}

function solve(moves) {
	let snaps = []

	let cube = createCube()
	
	for (var i = 0; i < moves; i++) {

		const scrambleMove = randomAgent()
		cube = moveFuncs[scrambleMove](cube)

		// TODO implement falloff function!
		
		const snap = {
			input: binary(cube),
			output: { [invertMove(scrambleMove)]: 1 }
		}

		snapshots.push(snap)
	}
}

function persistFile() {
	console.log('Persist file')
	const json = {
		"experience-parameters": EXPERIENCE_PARAMETERS,
		"snapshots": snapshots
	}

	fs.writeFileSync(filepath, JSON.stringify(json))
}

function seconds(dateA, dateB) {
	return `${ Math.round((dateA.getTime() - dateB.getTime()) / 1000) } seconds`
}

initCollector()