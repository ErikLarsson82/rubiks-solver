/*
	Randomly tries to solve the cube and collects binary data of input and output (rewards).

	This data is written to a file and is ready for the neural network training process.
*/


console.log('\n\n --- \x1b[4m\x1b[32m2x2/\x1b[35mexperience-recorder.js\x1b[0m ---')

let file, snapshopts, bar, scrambles

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
const rel = '2x2' //remove to create relative paths
const dir = `${rel}/experience-data`
const filename = 'experience-collection' 
const filepath = `${dir}/${filename}.json`
const ProgressBar = require('progress')

require('dotenv').config()
const MOVES = (process.env.MOVES && parseInt(process.env.MOVES)) || 12;

function initCollector() {
	const start = new Date()
	console.log('Init collector')
	snapshots = []
	scrambles = loadScrambles()
	
	bar = new ProgressBar('Experiences [:bar] :percent of :total :etas', { total: scrambles.length, width: 40, complete: '=', incomplete: ' ' });

	if (!fs.existsSync(dir)) fs.mkdirSync(dir)

	collectData()

	persistFile()

	console.log(`Duration ${ seconds(new Date(), start) }`) 
	console.log('Collection complete', snapshots.length)
}


function loadScrambles() {
	const file = `${rel}/scrambles/training-scrambles.json`
	try {
		const rawFile = fs.readFileSync(file)
		return JSON.parse(rawFile)
	} catch(e) {
		console.error(`Error loading file ${file}`, e)
	}
}

function collectData() {
	console.log('Collect data')
	scrambles.forEach(scramble => {
		solve(scramble)
		bar.tick(1)
	})
}

function solve(scramble) {

	let snaps = []

	let cube = createCube()
	
	for (var i = 0; i < MOVES; i++) {

		const scrambleMove = scramble[i]
		cube = moveFuncs[scrambleMove](cube)

		const snap = {
			input: binary(cube),
			output: { [invertMove(scrambleMove)]: falloff(i) }
		}

		snapshots.push(snap)
	}
}

function falloff(x) {
  if (x === 0) return 1
  return 1 / (x+1)
}

function persistFile() {
	console.log('Persist file')
	const json = {
		"snapshots": snapshots
	}

	fs.writeFileSync(filepath, JSON.stringify(json))
}

function seconds(dateA, dateB) {
	return `${ Math.round((dateA.getTime() - dateB.getTime()) / 1000) } seconds`
}

initCollector()