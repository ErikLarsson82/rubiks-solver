/*  Schema for cubits ID
	Top layer viewed from top:
	01
	23

	Bottom layer viewed from top:
	45
	67

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
	'right': [3,1,5,7],
	'left': [0,2,6,4],
	'front': [2,3,7,6],
	'back': [1,0,4,5],
	'up': [0,1,3,2],
	'down': [4,6,7,5]
}

function right(cube) {
	let unaffected = cube.filter(cubit => !positions['right'].includes(cubit.position))

	let affected = cube.filter(cubit => positions['right'].includes(cubit.position))

	affected = affected.map(corner => {
		const newCorner = {}
		newCorner.right = corner.right
		newCorner.left = corner.left

		newCorner.up = corner.front
		newCorner.back = corner.up
		newCorner.down = corner.back
		newCorner.front = corner.down
		newCorner.id = corner.id
		newCorner.position = cycle(positions['right'], corner.position)

		return newCorner
	})

	return [ ...unaffected, ...affected ]
}

function left(cube) {
	let unaffected = cube.filter(cubit => !positions['left'].includes(cubit.position))

	let affected = cube.filter(cubit => positions['left'].includes(cubit.position))

	affected = affected.map(corner => {
		const newCorner = {}
		newCorner.right = corner.right
		newCorner.left = corner.left

		newCorner.up = corner.back
		newCorner.back = corner.down
		newCorner.down = corner.front
		newCorner.front = corner.up
		newCorner.id = corner.id
		newCorner.position = cycle(positions['left'], corner.position)

		return newCorner
	})

	return [ ...unaffected, ...affected ]
}

function front(cube) {
	let unaffected = cube.filter(cubit => !positions['front'].includes(cubit.position))

	let affected = cube.filter(cubit => positions['front'].includes(cubit.position))

	affected = affected.map(corner => {
		const newCorner = {}
		newCorner.front = corner.front
		newCorner.back = corner.back

		newCorner.up = corner.left
		newCorner.left = corner.down
		newCorner.down = corner.right
		newCorner.right = corner.up
		newCorner.id = corner.id
		newCorner.position = cycle(positions['front'], corner.position)

		return newCorner
	})

	return [ ...unaffected, ...affected ]
}

function back(cube) {
	let unaffected = cube.filter(cubit => !positions['back'].includes(cubit.position))

	let affected = cube.filter(cubit => positions['back'].includes(cubit.position))

	affected = affected.map(corner => {
		const newCorner = {}
		newCorner.front = corner.front
		newCorner.back = corner.back

		newCorner.down = corner.left
		newCorner.up = corner.right
		newCorner.left = corner.up
		newCorner.right = corner.down
		newCorner.id = corner.id
		newCorner.position = cycle(positions['back'], corner.position)

		return newCorner
	})

	return [ ...unaffected, ...affected ]
}

function up(cube) {
	let unaffected = cube.filter(cubit => !positions['up'].includes(cubit.position))

	let affected = cube.filter(cubit => positions['up'].includes(cubit.position))

	affected = affected.map(corner => {
		const newCorner = {}
		newCorner.up = corner.up
		newCorner.down = corner.down

		newCorner.front = corner.right
		newCorner.right = corner.back
		newCorner.back = corner.left
		newCorner.left = corner.front
		newCorner.id = corner.id
		newCorner.position = cycle(positions['up'], corner.position)

		return newCorner
	})

	return [ ...unaffected, ...affected ]
}

function down(cube) {
	let unaffected = cube.filter(cubit => !positions['down'].includes(cubit.position))

	let affected = cube.filter(cubit => positions['down'].includes(cubit.position))

	affected = affected.map(corner => {
		const newCorner = {}
		newCorner.up = corner.up
		newCorner.down = corner.down

		newCorner.front = corner.left
		newCorner.left = corner.back
		newCorner.back = corner.right
		newCorner.right = corner.front
		
		newCorner.id = corner.id
		newCorner.position = cycle(positions['down'], corner.position)

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

function cornerToBinary(obj) {
	return [
		obj.up && colors.findIndex(x => x === obj.up.toUpperCase()) || 0,
		obj.front && colors.findIndex(x => x === obj.front.toUpperCase()) || 0,
		obj.back && colors.findIndex(x => x === obj.back.toUpperCase()) || 0,
		obj.left && colors.findIndex(x => x === obj.left.toUpperCase()) || 0,
		obj.right && colors.findIndex(x => x === obj.right.toUpperCase()) || 0,
		obj.down && colors.findIndex(x => x === obj.down.toUpperCase()) || 0
	].flatMap(convert)
}

function leftPad(template, str) {
	const full = template.concat(str)
	return full.substr(str.length)
}

function sorter(a, b) {
	return a.id > b.id ? 1 : -1
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

function persist() {
	persistedBinaryStr = binaryStr()
	console.log('Persisting binary cube data', persistedBinaryStr)
}

function compare() {
	const currentCube = binaryStr()
	const equal = R.equals(persistedBinaryStr, currentCube)
	console.log(`Equal: ${equal}\nPersisted binary cube: ${persistedBinaryStr}\nCurrent binary cube: ${currentCube}`)
}

function binaryStr() {
	return cube.map(x=>x).sort(sorter).flatMap(cornerToBinary).join("")
}