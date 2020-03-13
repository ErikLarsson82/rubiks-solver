const SCRAMBLE_SELECTION = 1

const scrambles0 = [
	["L"],
	["R"],
	["R'"],
]

const scrambles1 = [
	["D'", "B"],
]

const scrambles2 = [
	["L'"],
	["L", "L"],
	["R"],
	["R", "R"],
	["F'"],
	["F", "F"],
	["F'", "L'"],
	["B'"],
	["U'"],
	["D'"]
]

const scrambles3 = [
	["L'"],
	["L", "L"],
	["L"],
	["R"],
	["R", "R"],
	["R"],
	["F"],
	["F'"],
	["F", "F"],
	["F'", "L'"],
	["B'"],
	["B", "B"],
	["B"],
	["U'"],
	["U", "U"],
	["U"],
	["D'"],
	["D", "D"],
	["D"],
	["L'","F'"],
	["L'","F"],
	["L'","B"],
	["L'","B'"],
	["L'","U"],
	["R'","U'"],
	["R'","F'"],
	["R'","F"],
	["R'","B"],
	["R'","B'"],
	["R'","U"],
	["R'","U'"],
	["U","F'"],
	["U","F"],
	["U","B"],
	["U","B'"],
	["U","U"],
	["U","U'"],
	["U'","F'"],
	["U'","F"],
	["U'","B"],
	["U'","B'"],
	["U","U"],
	["U'","U'"],
	["B", "U'","F'"],
	["B", "U'","F"],
	["B", "U'","B"],
	["B", "U'","B'"],
	["B", "U'","U"],
	["B", "U'","U'"],
	["F'", "U'","F'"],
	["F'", "U'","F"],
	["F'", "U'","B"],
	["F'", "U'","B'"],
	["F'", "U'","U"],
	["F'", "U'","U'"],
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

const scrambles6 = [["F","F"],["D'","B","R","L","L"],["B","B","R"],["L","D'","U'","U'"],["F'","B","D'","L","L"],["U'","F","D","F","L'","F'","B'","L'"],["R","U'","L'","D'"],["L"],["D'","U","R","F'","L'","F","F'","L'"],["U","L'","L","B'","B'","U'","F'","F","R'"],["R'","L","L'","L"],["U'","F'","F'","D'","L'","U'"],["R'","B","F'"],["L'","L'","L","R","R'","B","F","R","U","D'"],["L'","F'","B","B","F'"],["U","U'","L"],["D'","L'","L'","R"],["L'","L"],["U'","F","B'","D'"],["R","D'","D'","D'","B'","R'"],["U","L","L'","L","F'","U'"],["D","U","U","R'","U'","F","B","D","R","D'"],["L'","D","R","L","L","B'","U","L'"],["D"],["U'","U'"],["B","L'","B'","D'","R'","U","B","F'"],["D","R","F'"],["F","U","U","B","L'","R","R","L","R'","U"],["F'","B'","B","L'","F","L","B'","L'"],["R'","F","R'","U'"],["F'","R'","L","B","B","D'"],["D'","L'","B","F'","R","F","R"],["U'","F'"],["R","F'","R'","B","L","B'"],["B'","R'","R","L'"],["B","L'","D'"],["R","L'","D'","L'","F"],["D'","D'","L'","R","D'","F","R'"],["U","U","L","F'","B"],["R"]] //.slice(0, 2)

const scrambles7 = [["R'"],["D","U"],["R"],["L'","L'"],["F"],["L'"],["D"],["L"],["D","F"],["U","B"],["U'"],["L'","R"],["B'","U'"],["F"],["R'","U'"],["B"],["F"],["D'"],["F","U'"],["U'"],["D","B'"],["B","L"],["F'"],["D"],["L","F'"],["B'"],["B'","D"],["U"],["F","U"],["D'","U'"],["U'","L'"],["D'"],["B'"],["R","U"],["F'"],["R","U"],["B'","F'"],["B","B'"],["R"],["L'","F"],["L"],["U'","B'"],["U","B"],["R","L'"],["U'","L'"],["F"],["L'"],["L'","B'"],["F'"],["U'"],["B","B'"],["B","D'"],["F'","B"],["R'","L"],["L","U"],["U","D"],["D","R'"],["D"],["D'","U"],["L","R'"],["B"],["F'"],["F"],["U'"],["D'"],["R","F"],["F'","B"],["L"],["L"],["D'","F'"],["L"],["D"],["U","F'"],["B'"],["R'","R'"],["B'"],["U'"],["B","F'"],["B","U'"],["U'"]]

const selection = [
		scrambles0,
		scrambles1,
		scrambles2,
		scrambles3,
		scrambles4,
		scrambles5,
		scrambles6,
		scrambles7,
	][SCRAMBLE_SELECTION]

if (typeof module !== "undefined" && module.exports) {
	module.exports = selection
} else {
	window.scrambles = selection
}
