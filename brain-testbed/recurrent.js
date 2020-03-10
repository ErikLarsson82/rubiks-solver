const brain = require('../brain-browser.js');

// provide optional config object, defaults shown.
const config = {
  inputSize: 2,
  hiddenLayers: [8],
  outputSize: 2,
  //learningRate: 0.51,
  //decayRate: 0.999
}

// create a simple recurrent neural network
const net = new brain.recurrent.RNN(config)

const cfg = {
  log: true,
  logPeriod: 1000
}

net.train([
  { input: [0, 0], output: [0] },
  { input: [0, 1], output: [1] },
  { input: [1, 0], output: [1] },
  { input: [1, 1], output: [0] },
], cfg)

console.log(net.run([0, 0])) // [0]
console.log(net.run([0, 1])) // [1]
console.log(net.run([1, 0])) // [1]
console.log(net.run([1, 1])) // [0]