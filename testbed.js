const brain = require('./brain-browser.min.js')

const trainingData = [
	{
		input: [0, 1, 0, 1],
		output: { B: 1 }
	},
	{
		input: [1, 1, 0, 0],
		output: { A: 1 }
	},
	{
		input: [0, 0, 1, 1],
		output: { A: 1 }
	},
	{
		input: [1, 0, 1, 0],
		output: { A: 1 }
	},
	/*{
		input: [1, 1, 1, 1],
		output: { B: 1 }
	}*/
]

const testingData = trainingData.concat({
	input: [1, 1, 1, 1]
})

console.log('Training data:')
console.log(trainingData)

function invert(x) {
	return x === 0 ? 1 : 0
}

function move(type, data) {
	if (type === "A") {
		return [data[2], data[0], data[3], data[1]]
	}
	if (type === "B") {
		return [data[0], invert(data[1]), data[2], invert(data[3])]
	}
}

function testNetAgainstEntry(net) {
	return (entry, idx) => {

		console.log(`Testing starting position ${idx} - ${entry.input}`)

		let done = false
		let puzzle = entry.input.map(x => x)

		new Array(4).fill().forEach(() => {
			if (done) return
			console.log(`Puzzle is at ${ puzzle }`)
			const answer = brain.likely(puzzle, net)
			puzzle = move(answer, puzzle)
			console.log(`Net answer: ${ answer }`)
			console.log(net.run(puzzle))

			if (JSON.stringify(puzzle) === JSON.stringify([0,0,0,0])) {
				if (done === false) {
					console.log('Solution found')
				}
				done = true
			}
		})

		console.log(`\n\n`)

		return done

		/*
		const result = net.run(entry.input)
		const approximated = Array.prototype.slice.call(result).map(approximate)
		const isCorrect = JSON.stringify(approximated) === JSON.stringify(entry.output.map(approximate))

		console.log(`Testing [${idx}]:`, `${entry.input} -> ${entry.output}`)
		console.log('Answer:', approximated, `[${Array.prototype.slice.call(result).map(x => x.toFixed(5)).join(", ")}]`, `(${isCorrect ? 'correct' : 'incorrect'})`)
		console.log("\n")
		return isCorrect
		*/
	}
}

function rand(to) {
	return Math.round(Math.random() * to)
}

let iteration = 0
let bestTotal = 0
let totalScore = 0
let bestNet
let totalIterations = 1

while (iteration++ < totalIterations) {

	const config = {
		//hiddenLayers: new Array(rand(5)).fill().map(() => rand(20)),
		binaryThresh: 0.5,
	  //hiddenLayers: [3], // array of ints for the sizes of the hidden layers in the network
	  activation: 'relu', // supported activation types: ['sigmoid', 'relu', 'leaky-relu', 'tanh'],
	  //leakyReluAlpha: 0.01, // supported for activation type 'leaky-relu'
	  //learningRate: 0.01,
	  //decayRate: 0.99,
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
	console.log(`Current best: ${bestTotal}/${testingData.length}`)
	console.log(`Iteration: ${iteration}/${totalIterations}`)
}

console.log(`\n\n\n\n`)
//console.log(`Average`, `${(totalScore / totalIterations).toFixed(2)}%`)
console.log(`Best net:`, `${bestTotal}/${testingData.length} ${(bestTotal / testingData.length * 100).toFixed(2)}%`)
