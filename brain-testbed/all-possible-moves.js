const brain = require('../brain-browser.min.js')

//const LSTM = brain.recurrent.LSTM;
//const net = new LSTM();
const net = new brain.NeuralNetwork()

// We could feed an action into the network together with the board state
// and have a single output value indicating the value of this action.

const trainingData = [
  {
    input: [1,1,0,0,0],
    output: { score: 1 }
  },
  {
    input: [1,1,0,0,1],
    output: { score: 0 }
  },
  {
    input: [0,0,1,1,0],
    output: { score: 1 }
  },
  {
    input: [0,0,1,1,1],
    output: { score: 0 }
  },
  {
    input: [1,0,1,0,0],
    output: { score: 1 }
  },
  {
    input: [1,0,1,0,1],
    output: { score: 0 }
  },
  {
    input: [0,1,0,1,0],
    output: { score: 0 }
  },
  {
    input: [0,1,0,1,1],
    output: { score: 1 }
  }
]
  
const config = {
  //log: true,
  //logPeriod: 400,
  //errorThresh: 0.01,
  //iterations: 1000,
  binaryThreshold: 0.5,
  //hiddenLayers: [100, 100, 100]
}

net.train(trainingData, config);

const testData = trainingData.concat({ input: [1,1,1,1,0] }).concat({ input: [1,1,1,1,1] })
testData.map(arr => {
  //const state = arr.input.map(x=>x).slice(0,4)
  //console.log('State', state)
  console.log(arr.input, net.run(arr.input).score)
  //const scoreB = net.run(state.concat(1))
  //console.log(scoreA.score.toFixed(3), scoreB.score.toFixed(3))
})

/*

let errors = 0;
for (let i = 0; i < trainingData.length; i++) {
  const input = trainingData[i].split('=')[0] + '=';
  const output = net.run(input);
  const predictedMathProblem = input + output;
  const error = trainingData.indexOf(predictedMathProblem) <= -1 ? 1 : 0;
  errors += error;
  console.log(input + output + (error ? " - error" : ""));
}
console.log("Errors: " + errors / trainingData.length);*/
