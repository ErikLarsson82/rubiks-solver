const fs = require('fs')
const R = require('ramda')
const { moves } = require('./common')

const MOVES = process.argv[2] || 2;

const permutations = R.compose(R.sequence(R.of), R.flip(R.repeat));

console.log(`Creating non-distinct scramble set of maximum ${MOVES} moves`)

const perms = permutations(MOVES, moves)

const file = `scrambles/perm-moveset-${MOVES}.json`
fs.writeFileSync(file, JSON.stringify(perms))
console.log(`Saved ${perms.length} permutations to file scrambles/perm-moveset-${MOVES}.json`)
