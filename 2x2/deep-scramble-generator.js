const fs = require('fs')
const R = require('ramda')
const { moves, randomAgent } = require('./common')

const MOVES = process.argv[2] || 25;
const SCRAMBLE_TOTALS = 10;

let scrambles = []

for (var i = 0; i < SCRAMBLE_TOTALS; i++) {
	const scramble = new Array(MOVES).fill().map(randomAgent)
	scrambles.push(scramble)
}

const file = `scrambles/deep-scramble.json`
fs.writeFileSync(file, JSON.stringify(scrambles))
console.log(`Saved ${SCRAMBLE_TOTALS} scrambles with ${MOVES} depth to file ${file}`)

