
const fs = require('fs')
const R = require('ramda')
const { moves, randomAgent } = require('./common')
const ProgressBar = require('progress')

require('dotenv').config()
const MOVES = (process.env.MOVES && parseInt(process.env.MOVES)) || process.argv[2] || 12;
const SCRAMBLES = (process.env.SCRAMBLES && parseInt(process.env.SCRAMBLES)) || process.argv[3] || 2;

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

if (!fs.existsSync('scrambles')) fs.mkdirSync('scrambles')

const fileA = `scrambles/training-scrambles.json`
console.log('\n\nSaving to file', fileA)
fs.writeFileSync(fileA, JSON.stringify(generateScrambleSet()))
console.log(`Saved ${SCRAMBLES} scrambles with ${MOVES} depth`)

const fileB = `scrambles/novel-scrambles.json`
console.log('\n\nSaving to file', fileB)
fs.writeFileSync(fileB, JSON.stringify(generateScrambleSet()))
console.log(`Saved ${SCRAMBLES} scrambles with ${MOVES} depth`)