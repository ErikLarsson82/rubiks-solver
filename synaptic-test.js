var synaptic = require('synaptic');

var perceptron = new synaptic.Architect.Perceptron(2,3,1);

var trainer = new synaptic.Trainer(perceptron)

console.log(perceptron, trainer)

const result = trainer.XOR({ 
			iterations: 100000,
			error: .0001,
			rate: 1
		}); 

console.log(result)

console.log(perceptron.activate([0,0]))
console.log(perceptron.activate([0,1]))
console.log(perceptron.activate([1,0]))
console.log(perceptron.activate([1,1]))
