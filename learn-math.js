const brain = require('./brain-browser.min.js')

const LSTM = brain.recurrent.LSTM;
const net = new LSTM();

const trainingData = [
  "1100=A",
  "0011=A",
  "1010=A",
  "0000=A",
  "0101=B"
]
  
const config = {
  log: true,
  logPeriod: 400,
  errorThresh: 0.01,
  iterations: 1000,
  binaryThreshold: 0.5,
  hiddenLayers: [100, 100, 100]
}

net.train(trainingData, config);

trainingData.push("1111=B")

let errors = 0;
for (let i = 0; i < trainingData.length; i++) {
  const input = trainingData[i].split('=')[0] + '=';
  const output = net.run(input);
  const predictedMathProblem = input + output;
  const error = trainingData.indexOf(predictedMathProblem) <= -1 ? 1 : 0;
  errors += error;
  console.log(input + output + (error ? " - error" : ""));
}
console.log("Errors: " + errors / trainingData.length);
