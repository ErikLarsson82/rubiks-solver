const SCRAMBLE_SELECTION = 5

const scrambles0 = [
	["L"],
	["R"],
	["R'"],
]

const scrambles1 = [
	["F", "L'"],
]

const scrambles2 = [
	["L'"],
	["L", "L"],
	["R"],
	["R", "R"],
	["F", "F", "F"],
	["F", "F"],
	["F", "F", "F", "L'"],
	["B", "B", "B"],
	["U", "U", "U"],
	["D", "D", "D"]
]

const scrambles3 = [
	["L'"],
	["L", "L"],
	["L"],
	["R"],
	["R", "R"],
	["R"],
	["F", "F", "F"],
	["F", "F"],
	["F"],
	["F", "F", "F", "L'"],
	["B", "B", "B"],
	["B", "B"],
	["B"],
	["U", "U", "U"],
	["U", "U"],
	["U"],
	["D", "D", "D"],
	["D", "D"],
	["D"],
	["F", "F", "F", "R", "L'","F", "F", "F"],
	["U", "U", "U", "R", "U", "U", "U", "R"]
]

const scrambles4 = [
	["L'"],
	["L", "L"],
	["L"],
	["R"],
	["R", "R"],
	["R"],
	["F", "F", "F"],
	["F", "F"],
	["F"],
	["F", "F", "F", "L'"],
	["B", "B", "B"],
	["B", "B"],
	["B"],
	["U", "U", "U"],
	["U", "U"],
	["U"],
	["D", "D", "D"],
	["D", "D"],
	["D"],
	["F", "F", "F", "R", "L'","F", "F", "F"],
	["B", "B", "B", "R", "U", "U", "U","R"],
	["F","F","F","B", "B", "B", "R", "U", "U", "U","R"],
	["B", "B", "B","F","F","F","R", "U", "U", "U","R"],
	["B", "B", "B","F","F","F","R", "U", "U", "U","F", "F", "F"],
	["B", "B", "B","F","F","F","L'", "B", "B", "B","F", "F", "F"],
]

const scrambles5 = [
	["L"],
	["L'"],
	["L", "L"],
	["R"],
	["R'"],
	["R", "R"],
	["F"],
	["F'"],
	["F", "F"],
	["F'", "L'"],
	["B"],
	["B'"],
	["B", "B"],
	["U"],
	["U'"],
	["U", "U"],
	["D"],
	["D'"],
	["D", "D"],
]

const selection = [
		scrambles0,
		scrambles1,
		scrambles2,
		scrambles3,
		scrambles4,
		scrambles5
	][SCRAMBLE_SELECTION]

if (typeof module !== "undefined" && module.exports) {
	module.exports = selection
} else {
	window.scrambles = selection
}
