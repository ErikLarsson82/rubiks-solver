
console.log('\n\n --- \x1b[4m\x1b[32m2x2/\x1b[35mdeep-scramble-generator.js\x1b[0m ---')

const fs = require('fs')
const R = require('ramda')
const { moves, randomAgent } = require('./common')
const ProgressBar = require('progress')

require('dotenv').config()
const MOVES = (process.env.MOVES && parseInt(process.env.MOVES)) || 6;
const SCRAMBLES = (process.env.SCRAMBLES && parseInt(process.env.SCRAMBLES)) || 5000;
const rel = '2x2' //remove to create relative paths


function generateScrambleSet() {
	const bar = new ProgressBar('Scrambles [:bar] :percent of :total :etas', { total: SCRAMBLES, width: 40, complete: '=', incomplete: ' ' });
	let scrambles = []

	for (var i = 0; i < SCRAMBLES; i++) {
		const scramble = new Array(MOVES).fill().map(randomAgent)
		scrambles.push(scramble)
		bar.tick(1)
	}
	return scrambles	
}

if (!fs.existsSync(rel + '/scrambles')) fs.mkdirSync(rel + '/scrambles')

const fileA = `${rel}/scrambles/training-scrambles.json`
console.log('\n\nSaving to file', fileA)
fs.writeFileSync(fileA, JSON.stringify(generateScrambleSet()))
console.log(`Saved ${SCRAMBLES} scrambles with ${MOVES} depth`)

const fileB = `${rel}/scrambles/novel-scrambles.json`
console.log('\n\nSaving to file', fileB)
fs.writeFileSync(fileB, JSON.stringify(generateScrambleSet()))
console.log(`Saved ${SCRAMBLES} scrambles with ${MOVES} depth`)