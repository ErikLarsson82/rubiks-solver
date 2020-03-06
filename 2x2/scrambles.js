const SCRAMBLE_SELECTION = 2

const scrambles0 = [
	['L', 'L', 'L'],
	['R', 'R', 'R']
]

const scrambles1 = [
	['F', 'F', 'F', 'L', 'L', 'L'],
]

const scrambles2 = [
	['L', 'L', 'L'],
	['L', 'L'],
	['R', 'R', 'R'],
	['R', 'R'],
	['F', 'F', 'F'],
	['F', 'F'],
	['F', 'F', 'F', 'L', 'L', 'L'],
	['B', 'B', 'B'],
	['U', 'U', 'U'],
	['D', 'D', 'D']
]

const selection = [
		scrambles0,
		scrambles1,
		scrambles2
	][SCRAMBLE_SELECTION]

if (typeof module !== "undefined" && module.exports) {
	module.exports = selection
} else {
	window.scrambles = selection
}
