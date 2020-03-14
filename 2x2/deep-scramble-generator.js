const fs = require('fs')
const R = require('ramda')
const { moves, randomAgent } = require('./common')
const ProgressBar = require('progress')

const MOVES = process.argv[2] || 25;
const SCRAMBLE_TOTALS = 100;

var bar = new ProgressBar('Scrambles [:bar] :percent of :total :etas', { total: SCRAMBLE_TOTALS, width: 20 });

let scrambles = []

for (var i = 0; i < SCRAMBLE_TOTALS; i++) {
	const scramble = new Array(MOVES).fill().map(randomAgent)
	scrambles.push(scramble)
	bar.tick(1)
}

const file = `scrambles/deep-scramble.json`
console.log('Saving to file', file)
fs.writeFileSync(file, JSON.stringify(scrambles))
console.log(`Saved ${SCRAMBLE_TOTALS} scrambles with ${MOVES} depth`)

