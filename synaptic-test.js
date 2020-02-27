var synaptic = require('synaptic');

var perceptron = new synaptic.Architect.Perceptron(2,2,1);

var trainer = new synaptic.Trainer(perceptron)

var trainingSet = [
  {
    input: [0,0],
    output: [0]
  },
  /*{
    input: [0,1],
    output: [1]
  },
  {
    input: [1,0],
    output: [1]
  },
  {
    input: [1,1],
    output: [0]
  },*/
]

trainer.train(trainingSet);
console.log(perceptron.activate([0,0]))
console.log(perceptron.activate([0,1]))
console.log(perceptron.activate([1,0]))
console.log(perceptron.activate([1,1]))

var more = [
  {
    input: [0,1],
    output: [1]
  },
  {
    input: [1,0],
    output: [1]
  },
  {
    input: [1,1],
    output: [0]
  },
]
trainer.train(more);
console.log(perceptron.activate([0,0]))
console.log(perceptron.activate([0,1]))
console.log(perceptron.activate([1,0]))
console.log(perceptron.activate([1,1]))