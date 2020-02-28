const brain = require('brain-browser-min.js')

const config = {
  binaryThresh: 0.5,
  //hiddenLayers: [3], // array of ints for the sizes of the hidden layers in the network
  activation: 'leaky-relu', // supported activation types: ['sigmoid', 'relu', 'leaky-relu', 'tanh'],
  leakyReluAlpha: 0.01, // supported for activation type 'leaky-relu'
}

// create a simple feed forward neural network with backpropagation
const net = new brain.NeuralNetwork(config)

net.train([
  { input: [-10, -10], output: { "A": 1 } },
  { input: [-10, 5], output: { "B": 1 } },
  { input: [5, -10], output: { "B": 1 } },
  { input: [5, 5], output: { "A": 1 } },
])

console.log(net.run([-10, -10]))
console.log(net.run([-10, 5]))
console.log(net.run([5, -10]))
console.log(net.run([5, 5]))
