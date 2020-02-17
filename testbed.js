const brain = require('./brain-browser.min.js')

// Trainingdata with full string as output
/*
const trainingData = [
	{
		input: [0, 0, 0, 0],
		output: { "": 1 }
	},
	{
		input: [1, 1, 0, 0],
		output: { "AB": 1 }
	},
	{
		input: [0, 0, 1, 1],
		output: { "AAAB": 1 }
	},
	{
		input: [1, 0, 1, 0],
		output: { "BAB": 1 }
	},
	{
		input: [0, 1, 0, 1],
		output: { "BAAAB": 1 }
	}
]
*/

// Trainingdata array output
const trainingData = [
	{
		input: [0, 0, 0, 0],
		output: ["-", "-", "-", "-"]
	},
	{
		input: [1, 1, 0, 0],
		output: ["A", "B", "-", "-"]
	},
	{
		input: [0, 0, 1, 1],
		output: ["A", "A", "A", "B"]
	},
	{
		input: [1, 0, 1, 0],
		output: ["A", "A", "B", "-"]
	},
	{
		input: [0, 1, 0, 1],
		output: ["B", "-", "-", "-"]
	}
].map(convertOutputKey(convertToFloat))

const testingData = trainingData.concat({
	input: [1, 1, 1, 1],
	output: ["B", "A", "A", "B"].map(convertToFloat)
})

function convertOutputKey(func) {
	return obj => {
		return {
			...obj,
			output: obj.output.map(func)
		}
	}
}

function convertToFloat(input) {
	if (input === "-") return 0
	if (input === "A") return 0.5
	if (input === "B") return 1
}

function approximate(fl) {
	if (fl < 0.1) return "-"
	if (fl > 0.1 && fl < 0.85) return "A"
	if (fl > 0.85) return "B"

	console.error("Should not be able to happen")
}

console.log('Training data:')
console.log(trainingData)

function pickHighest(data) {
    let bestScore = 0
    let bestRotation = ''
    for (rotation in data) {
        if (data[rotation] > bestScore) {
            bestScore = data[rotation]
            bestRotation = rotation
        }
    }
    return bestRotation
}

function testNetAgainstEntry(net) {
	return (entry, idx) => {
		const result = net.run(entry.input)
		const approximated = Array.prototype.slice.call(result).map(approximate)
		const isCorrect = JSON.stringify(approximated) === JSON.stringify(entry.output.map(approximate))

		console.log(`Testing [${idx}]:`, `${entry.input} -> ${entry.output}`)
		console.log('Answer:', approximated, `[${Array.prototype.slice.call(result).map(x => x.toFixed(5)).join(", ")}]`, `(${isCorrect ? 'correct' : 'incorrect'})`)
		console.log("\n")
		return isCorrect
	}
}

function rand(to) {
	return Math.round(Math.random() * to)
}

let iteration = 0
let bestTotal = 0
let totalScore = 0
let bestNet
let totalIterations = 50000

while (iteration++ < totalIterations) {

	const config = {
		hiddenLayers: new Array(rand(5)).fill().map(() => rand(20)),
	}

	const net = new brain.NeuralNetwork(config)

	console.log(`Training result for iteration ${iteration} [${config.hiddenLayers}]:`, net.train(trainingData))

	const successes = testingData.map(testNetAgainstEntry(net)).filter(x => x === true).length

	console.log(`Result net iteration ${iteration}:`, `${successes}/${testingData.length} ${(successes / testingData.length * 100).toFixed(2)}%`)

	if (successes > bestTotal) {
		bestTotal = successes
		bestNet = net
	}

	totalScore += successes

	console.log(`\n\n`)
	console.log(`Current best: ${bestTotal} ${iteration}/${totalIterations}`)
}

console.log(`\n\n\n\n\n\n\n`)
console.log(`Average`, `${(totalScore / totalIterations).toFixed(2)}%`)
console.log(`Best net:`, `${bestTotal}/${testingData.length} ${(bestTotal / testingData.length * 100).toFixed(2)}%`)
