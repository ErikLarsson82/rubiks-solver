const brain = require('../brain.js/src/index');

const xorTrainingData = [
  { input: [0, 1], output: [1] },
  { input: [0, 0], output: [0] },
  { input: [1, 1], output: [0] },
  { input: [1, 0], output: [1] }];

const net = new brain.NeuralNetworkGPU();

const status = net.train(xorTrainingData, { iterations: 5000, errorThresh: 0.01 });

console.log(status);

console.log(net.run([0,1]));
console.log(net.run([0,0]));
console.log(net.run([1,1]));
console.log(net.run([1,0]));