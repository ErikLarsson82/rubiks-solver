/*  Schema for cubits ID
	Top layer viewed from top:
	01
	23

	Bottom layer viewed from top:
	45
	67

	24 rotations per cubit - 8 cubits = 192
	00000 - 00000 - 00000 - 00000 - 00000 - 00000 - 00000 - 00000 - [000] */

function createCube() {
	return [
		defs({ id: 0, position: 3, up: 'white', front: 'green', right: 'red' }),
		defs({ id: 1, position: 1, up: 'white', back: 'blue', right: 'red' }),
		defs({ id: 2, position: 5, down: 'yellow', back: 'blue', right: 'red' }),
		defs({ id: 3, position: 7, down: 'yellow', front: 'green', right: 'red' }),
	]
}

function right(cube) {
	let newCube = []
	cube.forEach(corner => {
		const newCorner = {}
		newCorner.right = corner.right
		newCorner.up = corner.front
		newCorner.back = corner.up
		newCorner.down = corner.back
		newCorner.front = corner.down
		newCorner.id = corner.id
		newCorner.position = cycle([3,1,5,7], corner.position)

		newCube.push(newCorner)
	})

	return newCube
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
