const brain = require('brain.js');

const start = new Date()

console.log(brain)

const net = new brain.NeuralNetwork({ hiddenLayers: [10] }); 
const xorTrainingData = [
  {input: [0, 0], output: [0]},
  {input: [0, 1], output: [1]},
  {input: [1, 0], output: [1]},
  {input: [1, 1], output: [0]}];

console.log(net.train(xorTrainingData, {
  log: true,
  logPeriod: 100,
  iterations: 20000
}));

console.log( net.run([0,0]), Math.round( net.run([0,0]) ));
console.log( net.run([0,1]), Math.round( net.run([0,1]) ));
console.log( net.run([1,0]), Math.round( net.run([1,0]) ));
console.log( net.run([1,1]), Math.round( net.run([1,1]) ));

const after = new Date()

console.log((after.getTime() - start.getTime()) / 1000)