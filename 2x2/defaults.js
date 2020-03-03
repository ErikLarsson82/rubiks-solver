// Not sure this is defaults

"TRAINING_OPTIONS": {
		//iterations: 1000, // the maximum times to iterate the training data --> number greater than 0
	    //errorThresh: 0.005, // the acceptable error percentage from training data --> number between 0 and 1
	    //log: true, // true to use console.log, when a function is supplied it is used --> Either true or a function
	    //logPeriod: 10, // iterations between logging out --> number greater than 0
	    //learningRate: 0.9, // scales with delta to effect training rate --> number between 0 and 1
	    //momentum: 0.1, // scales with next layer's change value --> number between 0 and 1
	    //callback: null, // a periodic call back that can be triggered while training --> null or function
	    //callbackPeriod: 10, // the number of iterations through the training data between callback calls --> number greater than 0
	    //timeout: 60000, // the max number of milliseconds to train for --> number greater than 0
	},
	"BRAIN_CONFIG": {
		//inputSize: 20,
		//inputRange: 20,
		//hiddenLayers: [500, 200],
		//outputSize: 20,
		//learningRate: 0.95,
		//decayRate: 0.999,
		//reinforce: true, // not used since not FeedForward
		//binaryThresh: 0.5,
  		//hiddenLayers: [10, 4], // array of ints for the sizes of the hidden layers in the network
  		//activation: 'leaky-relu', // supported activation types: ['sigmoid', 'relu', 'leaky-relu', 'tanh'],
  		//leakyReluAlpha: 0.01, // supported for activation type 'leaky-relu'
	}