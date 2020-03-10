const brain = require('../brain-browser.js')

let net = new brain.NeuralNetwork()

const data = [
  { input: [0], output: { "A": 1 } },
  { input: [1], output: { "B": 1 } }
]

const result = net.train(data)

console.log('\nFirst training')
console.log(net.run([0]))
console.log(net.run([1]))

console.log(result)

// { retrain: false/true } seems not to have effect (its only for FeedForward), but creating new net resets it
//net = new brain.NeuralNetwork()

const data2 = [
  { input: [0], output: { "A": 0 } },
  { input: [1], output: { "B": 0 } }
]
const res2 = net.train(data2 /*, { reinforce: false }*/)


console.log('\nSecond training - notice big difference between A and B - without retraining that doesnt happen')
console.log(net.run([0]))
console.log(net.run([1]))

console.log(res2)
