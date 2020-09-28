/*
	Common file for both Web rendering of cubes and node Trainers of cube solves

	Schema for cubits ID
	Top layer viewed from top:
	01
	23

	Bottom layer viewed from top:
	45
	67

	Using one-hot-encoding for position and rotation for each cubit, the two lines below is probably deprecated
	24 rotations per cubit - 8 cubits = 192
	00000 - 00000 - 00000 - 00000 - 00000 - 00000 - 00000 - 00000 - [000] */

const { sort } = require('ramda')

const moves = ["U", "U'", "D", "D'", "L", "L'", "R", "R'", "F", "F'", "B", "B'"]

function createCube() {
	return [
		defs({ id: 0, position: 0, up: 'white', back: 'blue', left: 'orange' }),
		defs({ id: 1, position: 1, up: 'white', back: 'blue', right: 'red' }),
		defs({ id: 2, position: 2, up: 'white', front: 'green', left: 'orange' }),
		defs({ id: 3, position: 3, up: 'white', front: 'green', right: 'red' }),
		defs({ id: 4, position: 4, down: 'yellow', back: 'blue', left: 'orange' }),
		defs({ id: 5, position: 5, down: 'yellow', back: 'blue', right: 'red' }),
		defs({ id: 6, position: 6, down: 'yellow', front: 'green', left: 'orange' }),
		defs({ id: 7, position: 7, down: 'yellow', front: 'green', right: 'red' }),
	]
}


function solveCube(scramble, agent, attempts, print) {
	let solution = []
	let visitedSteps = []

	for (var i = 0; i < attempts; i++) {
		const binaryCube = binary(cube)
		
		let policy, hasSeen

		const sortedPolicyDistribution = sortedPairs(agent(cube))

		//console.log('sortedPolicyDistribution', sortedPolicyDistribution, agent(cube))

	    do {
	    	policy = sortedPolicyDistribution.shift().policy
	    	
	    	hasSeen = hasSeenIt(visitedSteps, binaryStr(cube), policy)

	    } while (hasSeen && policy !== undefined) 

	    visitedSteps.push({
			cubeStr: binaryStr(cube),
			policy: policy
		})    	

		solution.push(policy)
		cube = moveFuncs[policy](cube)
		if (compare(cube)) break;
	}

	if (print) {
		console.log('Scramble', scramble.map(primPrint), 'Solution', solution.map(primPrint), compare(cube) ? '\x1b[42m\x1b[37mCORRECT\x1b[0m' : '\x1b[41m\x1b[37mINCORRECT\x1b[0m')	
	}

	return {
		scramble: scramble,
		solution: solution,
		correct: compare(cube) ? i : -1	
	}
}

function sortedPairs(arr) {
	return sort((a,b) => a.value > b.value ? -1 : 1, Object.values(arr).map((x, i) => ({ policy: Object.keys(arr)[i], value: x })))
}


function hasSeenIt(visitedSteps, cubeStr, policy) {
	return visitedSteps.find(x => x.cubeStr === cubeStr && x.policy === policy) !== undefined
}


const positions = {
	"R": [3,1,5,7],
	"R'": [3,1,5,7].reverse(),
	"L": [0,2,6,4],
	"L'": [0,2,6,4].reverse(),
	"F": [2,3,7,6],
	"F'": [2,3,7,6].reverse(),
	"B": [1,0,4,5],
	"B'": [1,0,4,5].reverse(),
	"U": [0,1,3,2],
	"U'": [0,1,3,2].reverse(),
	"D": [4,6,7,5],
	"D'": [4,6,7,5].reverse()
}

const moveFuncs = {
	"U": up,
	"U'": upPrim,
	"D": down,
	"D'": downPrim,
	"L": left,
	"L'": leftPrim,
	"R": right,
	"R'": rightPrim,
	"F": front,
	"F'": frontPrim,
	"B": back,
	"B'": backPrim
}

function right(cube) {
	let unaffected = cube.filter(cubit => !positions["R"].includes(cubit.position))

	let affected = cube.filter(cubit => positions["R"].includes(cubit.position))

	affected = affected.map(corner => {
		const newCorner = {}
		newCorner.right = corner.right
		newCorner.left = corner.left

		newCorner.up = corner.front
		newCorner.back = corner.up
		newCorner.down = corner.back
		newCorner.front = corner.down
		newCorner.id = corner.id
		newCorner.position = cycle(positions["R"], corner.position)

		return newCorner
	})

	return [ ...unaffected, ...affected ]
}

function rightPrim(cube) {
	let unaffected = cube.filter(cubit => !positions["R'"].includes(cubit.position))

	let affected = cube.filter(cubit => positions["R'"].includes(cubit.position))

	affected = affected.map(corner => {
		const newCorner = {}
		newCorner.right = corner.right
		newCorner.left = corner.left

		newCorner.up = corner.back
		newCorner.back = corner.down
		newCorner.down = corner.front
		newCorner.front = corner.up
		newCorner.id = corner.id
		newCorner.position = cycle(positions["R'"], corner.position)

		return newCorner
	})

	return [ ...unaffected, ...affected ]
}

function left(cube) {
	let unaffected = cube.filter(cubit => !positions["L"].includes(cubit.position))

	let affected = cube.filter(cubit => positions["L"].includes(cubit.position))

	affected = affected.map(corner => {
		const newCorner = {}
		newCorner.right = corner.right
		newCorner.left = corner.left

		newCorner.up = corner.back
		newCorner.back = corner.down
		newCorner.down = corner.front
		newCorner.front = corner.up
		newCorner.id = corner.id
		newCorner.position = cycle(positions["L"], corner.position)

		return newCorner
	})

	return [ ...unaffected, ...affected ]
}

function leftPrim(cube) {
	let unaffected = cube.filter(cubit => !positions["L'"].includes(cubit.position))

	let affected = cube.filter(cubit => positions["L'"].includes(cubit.position))

	affected = affected.map(corner => {
		const newCorner = {}
		newCorner.right = corner.right
		newCorner.left = corner.left

		newCorner.up = corner.front
		newCorner.back = corner.up
		newCorner.down = corner.back
		newCorner.front = corner.down
		newCorner.id = corner.id
		newCorner.position = cycle(positions["L'"], corner.position)

		return newCorner
	})

	return [ ...unaffected, ...affected ]
}

function front(cube) {
	let unaffected = cube.filter(cubit => !positions['F'].includes(cubit.position))

	let affected = cube.filter(cubit => positions['F'].includes(cubit.position))

	affected = affected.map(corner => {
		const newCorner = {}
		newCorner.front = corner.front
		newCorner.back = corner.back

		newCorner.up = corner.left
		newCorner.left = corner.down
		newCorner.down = corner.right
		newCorner.right = corner.up
		newCorner.id = corner.id
		newCorner.position = cycle(positions['F'], corner.position)

		return newCorner
	})

	return [ ...unaffected, ...affected ]
}

function frontPrim(cube) {
	let unaffected = cube.filter(cubit => !positions["F'"].includes(cubit.position))

	let affected = cube.filter(cubit => positions["F'"].includes(cubit.position))

	affected = affected.map(corner => {
		const newCorner = {}
		newCorner.front = corner.front
		newCorner.back = corner.back

		newCorner.up = corner.right
		newCorner.left = corner.up
		newCorner.down = corner.left
		newCorner.right = corner.down
		newCorner.id = corner.id
		newCorner.position = cycle(positions["F'"], corner.position)

		return newCorner
	})

	return [ ...unaffected, ...affected ]
}

function back(cube) {
	let unaffected = cube.filter(cubit => !positions["B"].includes(cubit.position))

	let affected = cube.filter(cubit => positions["B"].includes(cubit.position))

	affected = affected.map(corner => {
		const newCorner = {}
		newCorner.front = corner.front
		newCorner.back = corner.back

		newCorner.down = corner.left
		newCorner.up = corner.right
		newCorner.left = corner.up
		newCorner.right = corner.down
		newCorner.id = corner.id
		newCorner.position = cycle(positions["B"], corner.position)

		return newCorner
	})

	return [ ...unaffected, ...affected ]
}

function backPrim(cube) {
	let unaffected = cube.filter(cubit => !positions["B'"].includes(cubit.position))

	let affected = cube.filter(cubit => positions["B'"].includes(cubit.position))

	affected = affected.map(corner => {
		const newCorner = {}
		newCorner.front = corner.front
		newCorner.back = corner.back

		newCorner.down = corner.right
		newCorner.up = corner.left
		newCorner.left = corner.down
		newCorner.right = corner.up
		newCorner.id = corner.id
		newCorner.position = cycle(positions["B'"], corner.position)

		return newCorner
	})

	return [ ...unaffected, ...affected ]
}

function up(cube) {
	let unaffected = cube.filter(cubit => !positions["U"].includes(cubit.position))

	let affected = cube.filter(cubit => positions["U"].includes(cubit.position))

	affected = affected.map(corner => {
		const newCorner = {}
		newCorner.up = corner.up
		newCorner.down = corner.down

		newCorner.front = corner.right
		newCorner.right = corner.back
		newCorner.back = corner.left
		newCorner.left = corner.front
		newCorner.id = corner.id
		newCorner.position = cycle(positions["U"], corner.position)

		return newCorner
	})

	return [ ...unaffected, ...affected ]
}

function upPrim(cube) {
	let unaffected = cube.filter(cubit => !positions["U'"].includes(cubit.position))

	let affected = cube.filter(cubit => positions["U'"].includes(cubit.position))

	affected = affected.map(corner => {
		const newCorner = {}
		newCorner.up = corner.up
		newCorner.down = corner.down

		newCorner.front = corner.left
		newCorner.right = corner.front
		newCorner.back = corner.right
		newCorner.left = corner.back
		newCorner.id = corner.id
		newCorner.position = cycle(positions["U'"], corner.position)

		return newCorner
	})

	return [ ...unaffected, ...affected ]
}

function down(cube) {
	let unaffected = cube.filter(cubit => !positions["D"].includes(cubit.position))

	let affected = cube.filter(cubit => positions["D"].includes(cubit.position))

	affected = affected.map(corner => {
		const newCorner = {}
		newCorner.up = corner.up
		newCorner.down = corner.down

		newCorner.front = corner.left
		newCorner.left = corner.back
		newCorner.back = corner.right
		newCorner.right = corner.front

		newCorner.id = corner.id
		newCorner.position = cycle(positions["D"], corner.position)

		return newCorner
	})

	return [ ...unaffected, ...affected ]
}

function downPrim(cube) {
	let unaffected = cube.filter(cubit => !positions["D'"].includes(cubit.position))

	let affected = cube.filter(cubit => positions["D'"].includes(cubit.position))

	affected = affected.map(corner => {
		const newCorner = {}
		newCorner.up = corner.up
		newCorner.down = corner.down

		newCorner.front = corner.right
		newCorner.left = corner.front
		newCorner.back = corner.left
		newCorner.right = corner.back

		newCorner.id = corner.id
		newCorner.position = cycle(positions["D'"], corner.position)

		return newCorner
	})

	return [ ...unaffected, ...affected ]
}

const COLORS = [
	"EMPTY",
	"WHITE",
	"GREEN",
	"RED",
	"BLUE",
	"YELLOW",
	"ORANGE"
]

function defs(x) {
	return {
		up: null,
		front: null,
		back: null,
		left: null,
		right: null,
		down: null,
		id: null,
		position: null,
		...x,
	}
}

function cycle(arr, pos) {
	const idx = arr.findIndex(x => x === pos)
	return idx === arr.length-1 ? arr[0] : arr[idx+1]
}

function convert(x) {
	const paddedStr = leftPad("0000", x.toString(2))
	return paddedStr.split('').map(x => parseInt(x))
}

function rotationToOnehot(obj) {
	let first, second
	if (obj.up === "white" || obj.down === "yellow") {
		first = onehotStr(6)(0)
	}
	if (obj.front === "white" || obj.back === "yellow") {
		first = onehotStr(6)(1)
	}
	if (obj.left === "white" || obj.right === "yellow") {
		first = onehotStr(6)(2)
	}
	if (obj.down === "white" || obj.up === "yellow") {
		first = onehotStr(6)(3)
	}
	if (obj.back === "white" || obj.front === "yellow") {
		first = onehotStr(6)(4)
	}
	if (obj.right === "white" || obj.left === "yellow") {
		first = onehotStr(6)(5)
	}

	if (obj.up === "green" || obj.down === "blue") {
		second = onehotStr(6)(0)
	}
	if (obj.front === "green" || obj.back === "blue") {
		second = onehotStr(6)(1)
	}
	if (obj.left === "green" || obj.right === "blue") {
		second = onehotStr(6)(2)
	}
	if (obj.down === "green" || obj.up === "blue") {
		second = onehotStr(6)(3)
	}
	if (obj.back === "green" || obj.front === "blue") {
		second = onehotStr(6)(4)
	}
	if (obj.right === "green" || obj.left === "blue") {
		second = onehotStr(6)(5)
	}
	return [ first, second ].flatMap(x => x.split("")).map(x => parseInt(x))
}

function cornerToBinary(obj) {
	return [
		onehot(8)(obj.up && COLORS.findIndex(x => x === obj.up.toUpperCase()) || 0),
		onehot(8)(obj.down && COLORS.findIndex(x => x === obj.down.toUpperCase()) || 0),
		onehot(8)(obj.front && COLORS.findIndex(x => x === obj.front.toUpperCase()) || 0),
		onehot(8)(obj.back && COLORS.findIndex(x => x === obj.back.toUpperCase()) || 0),
		onehot(8)(obj.left && COLORS.findIndex(x => x === obj.left.toUpperCase()) || 0),
		onehot(8)(obj.right && COLORS.findIndex(x => x === obj.right.toUpperCase()) || 0),
		rotationToOnehot(obj)
	].flatMap(x=>x)
}

// Define size with max and let id be zero indexed
// onehotStr(8)(0) === "00000001"
// onehotStr(8)(4) === "00010000"
// onehotStr(8)(7) === "10000000"
function onehotStr(max) {
	return id => {
		return new Array(max).fill().map((x, i) => {
			return i === id ? "1" : "0"
		}).reverse().join("")
	}
}

function onehot(max) {
	return id => onehotStr(max)(id).split("").map(x => parseInt(x))
}

function leftPad(template, str) {
	const full = template.concat(str)
	return full.substr(str.length)
}

function sorter(a, b) {
	return a.id > b.id ? 1 : -1
}

function sorterPosition(a, b) {
	return a.position > b.position ? 1 : -1
}

function orderly({ up, front, back, left, right, down, id, position }) {
	return {
		up: up,
		front: front,
		back: back,
		left: left,
		right: right,
		down: down,
		id: id,
		position: position,
	}
}

function scrambleCube(scramble) {
	let cube = createCube()
	scramble.forEach(move => {
		cube = moveFuncs[move](cube)
	})
	return cube
}

function isSame(cubeA, cubeB) {
	return binaryStr(cubeA) === binaryStr(cubeB)
}

function binaryStr(cube) {
	return cube.map(x=>x).sort(sorterPosition).flatMap(cornerToBinary).join("")
}

function binary(cube) {
	return cube.map(x=>x).sort(sorterPosition).flatMap(cornerToBinary)
}

function invertMove(move) {
	return ({
		"F'": "F",
		"F": "F'",
		"B'": "B",
		"B": "B'",
		"L'": "L",
		"L": "L'",
		"R'": "R",
		"R": "R'",
		"U'": "U",
		"U": "U'",
		"D'": "D",
		"D": "D'",
	})[move]
}

function invertSequence(seq) {
	return seq.map(invertMove).reverse()
}

function randomAgent() {
	return moves[Math.floor(Math.random() * 12)]
}

function randomDistAgent() {
	return {
		"U": Math.random(),
		"U'": Math.random(),
		"D": Math.random(),
		"D'": Math.random(),
		"L": Math.random(),
		"L'": Math.random(),
		"R": Math.random(),
		"R'": Math.random(),
		"F": Math.random(),
		"F'": Math.random(),
		"B": Math.random(),
		"B'": Math.random()
	}
}


function compare(cube) {
	return binaryStr(cube) === binaryStr(createCube())
}

if (typeof module !== "undefined" && module.exports) {
	module.exports = {
		createCube,
		right,
		rightPrim,
		left,
		leftPrim,
		up,
		upPrim,
		down,
		downPrim,
		front,
		frontPrim,
		back,
		backPrim,
		binary,
		binaryStr,
		scrambleCube,
		moveFuncs,
		invertMove,
		invertSequence,
		randomAgent,
		randomDistAgent,
		moves,
		isSame,
		positions,
		solveCube
	}
}
