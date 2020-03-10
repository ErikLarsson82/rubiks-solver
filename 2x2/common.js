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


let persistedBinaryStr
let originalCubeBinaryString

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

const positions = {
	"R": [3,1,5,7],
	"R'": [3,1,5,7].reverse(),
	"L": [0,2,6,4],
	"F": [2,3,7,6],
	"F'": [2,3,7,6].reverse(),
	"B": [1,0,4,5],
	"B'": [1,0,4,5].reverse(),
	"U": [0,1,3,2],
	"D": [4,6,7,5]
}

const moveFuncs = {
	"U": up,
	"D": down,
	"L": left,
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
	let unaffected = cube.filter(cubit => !positions['L'].includes(cubit.position))

	let affected = cube.filter(cubit => positions['L'].includes(cubit.position))

	affected = affected.map(corner => {
		const newCorner = {}
		newCorner.right = corner.right
		newCorner.left = corner.left

		newCorner.up = corner.back
		newCorner.back = corner.down
		newCorner.down = corner.front
		newCorner.front = corner.up
		newCorner.id = corner.id
		newCorner.position = cycle(positions['L'], corner.position)

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
	let unaffected = cube.filter(cubit => !positions['B'].includes(cubit.position))

	let affected = cube.filter(cubit => positions['B'].includes(cubit.position))

	affected = affected.map(corner => {
		const newCorner = {}
		newCorner.front = corner.front
		newCorner.back = corner.back

		newCorner.down = corner.left
		newCorner.up = corner.right
		newCorner.left = corner.up
		newCorner.right = corner.down
		newCorner.id = corner.id
		newCorner.position = cycle(positions['B'], corner.position)

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
	let unaffected = cube.filter(cubit => !positions['U'].includes(cubit.position))

	let affected = cube.filter(cubit => positions['U'].includes(cubit.position))

	affected = affected.map(corner => {
		const newCorner = {}
		newCorner.up = corner.up
		newCorner.down = corner.down

		newCorner.front = corner.right
		newCorner.right = corner.back
		newCorner.back = corner.left
		newCorner.left = corner.front
		newCorner.id = corner.id
		newCorner.position = cycle(positions['U'], corner.position)

		return newCorner
	})

	return [ ...unaffected, ...affected ]
}

function down(cube) {
	let unaffected = cube.filter(cubit => !positions['D'].includes(cubit.position))

	let affected = cube.filter(cubit => positions['D'].includes(cubit.position))

	affected = affected.map(corner => {
		const newCorner = {}
		newCorner.up = corner.up
		newCorner.down = corner.down

		newCorner.front = corner.left
		newCorner.left = corner.back
		newCorner.back = corner.right
		newCorner.right = corner.front

		newCorner.id = corner.id
		newCorner.position = cycle(positions['D'], corner.position)

		return newCorner
	})

	return [ ...unaffected, ...affected ]
}

const colors = [
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
		onehot(8)(obj.up && colors.findIndex(x => x === obj.up.toUpperCase()) || 0),
		onehot(8)(obj.down && colors.findIndex(x => x === obj.down.toUpperCase()) || 0),
		onehot(8)(obj.front && colors.findIndex(x => x === obj.front.toUpperCase()) || 0),
		onehot(8)(obj.back && colors.findIndex(x => x === obj.back.toUpperCase()) || 0),
		onehot(8)(obj.left && colors.findIndex(x => x === obj.left.toUpperCase()) || 0),
		onehot(8)(obj.right && colors.findIndex(x => x === obj.right.toUpperCase()) || 0),
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

function scrambleCube(cube, scramble) {
	scramble.forEach(move => {
		cube = moveFuncs[move](cube)
	})
	return cube
}

function persist(cube) {
	persistedBinaryStr = binaryStr(cube)
	return "Current cube configuration persisted"
}

function compare(cube) {
	const currentCube = binaryStr(cube)
	return persistedBinaryStr === currentCube
}

function binaryStr(cube) {
	return cube.map(x=>x).sort(sorterPosition).flatMap(cornerToBinary).join("")
}

function binary(cube) {
	return cube.map(x=>x).sort(sorterPosition).flatMap(cornerToBinary)
}

if (typeof module !== "undefined" && module.exports) {
	module.exports = {
		createCube,
		right,
		rightPrim,
		left,
		up,
		down,
		front,
		frontPrim,
		back,
		backPrim,
		persist,
		compare,
		binary,
		scrambleCube,
		moveFuncs
	}
}
