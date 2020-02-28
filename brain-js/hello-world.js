const brain = require('../brain-browser.min.js')

const config = {
  binaryThresh: 0.5,
  //hiddenLayers: [3], // array of ints for the sizes of the hidden layers in the network
  activation: 'leaky-relu', // supported activation types: ['sigmoid', 'relu', 'leaky-relu', 'tanh'],
  leakyReluAlpha: 0.01, // supported for activation type 'leaky-relu'
}

// create a simple feed forward neural network with backpropagation
const net = new brain.NeuralNetwork()

// This works
net.train([
  { input: [0,0], output: { "A": 1 } },
  { input: [0,1], output: { "B": 1 } },
  { input: [1,0], output: { "C": 1 } },
  { input: [1,1], output: { "D": 1 } },
])

console.log(net.run([0,0]))
console.log(net.run([0,1]))
console.log(net.run([1,0]))
console.log(net.run([1,1]))

// This does not work
/*
net.train([
  { input: 0, output: { "A": 1 } },
  { input: 1, output: { "B": 1 } },
  { input: 2, output: { "C": 1 } },
  { input: 3, output: { "D": 1 } },
])

console.log(net.run(0))
console.log(net.run(1))
console.log(net.run(2))
console.log(net.run(3))
*/

// Attempt - this works
/*
net.train([
  { input: agentIndexToBinary(0), output: { "A": 1 } },
  { input: agentIndexToBinary(1), output: { "B": 1 } },
  { input: agentIndexToBinary(2), output: { "C": 1 } },
  { input: agentIndexToBinary(3), output: { "D": 1 } },
])

console.log(net.run(agentIndexToBinary(0)))
console.log(net.run(agentIndexToBinary(1)))
console.log(net.run(agentIndexToBinary(2)))
console.log(net.run(agentIndexToBinary(3)))
*/

function agentIndexToBinary(idx) {
	const floatme = x => x === "1" ? 1.0 : 0.0
	return leftPad("0000", idx.toString(2)).split('').map(floatme)
}

function leftPad(template, str) {
	const full = template.concat(str)
	return full.substr(str.length)
}
