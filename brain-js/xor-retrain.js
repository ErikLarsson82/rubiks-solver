const brain = require('../brain-browser.min.js')

const net = new brain.NeuralNetwork()

const config = {
  //iterations: 100,
}

const data = [
  { input: [0], output: { "A": 1 } },
  { input: [0], output: { "A": 0 } },
  { input: [1], output: { "B": 1 } }
]

const result = net.train(data, config)

console.log('\nFirst training')
console.log(net.run([0]))
console.log(net.run([1]))
console.log(`0 - ${brain.likely([0], net)}`)
console.log(`1 - ${brain.likely([1], net)}`)

console.log(result)

/*console.log(net.train([
  { input: [1], output: { "A": 1 } },
  //{ input: [0], output: { "B": 1 } }
]))

console.log('\nSecond training')
console.log(net.run([0]))
console.log(net.run([1]))
console.log(brain.likely([0], net))
console.log(brain.likely([1], net))*/


function agentIndexToBinary(idx) {
	const floatme = x => x === "1" ? 1.0 : 0.0
	return leftPad("0000", idx.toString(2)).split('').map(floatme)
}

function leftPad(template, str) {
	const full = template.concat(str)
	return full.substr(str.length)
}
