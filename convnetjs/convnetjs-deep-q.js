const deepqlearn = require('./deepqlearn')

const opts = {
	"epsilon_min": 0.0,
	"temporal_window": 0,
	"hidden_layer_sizes": 1,
	"experience_size": 4,
	"start_learn_threshold": 4,
	//"epsilon_test_time": 0.0,
	/*"layer_defs": [
		{type: 'input', out_sx: 1, out_sy: 1, out_depth: 2},
    	{type: 'fc', num_neurons: 3, activation: 'tanh'},
    	//{type: 'softmax', num_classes: 2},
    	{type: 'regression', num_neurons: 2}
    ]*/
}

const brain = new deepqlearn.Brain(2, 2, opts)
/*
const trainingData = [
	{
		input: [0,0,0],
		output: 0.0
	},
	{
		input: [1,0,0],
		output: 1.0
	},
	{
		input: [0,1,0],
		output: 1.0
	},
	{
		input: [0,0,1],
		output: 1.0
	},
	{
		input: [0,1,1],
		output: 1.0
	},
	{
		input: [1,1,1],
		output: 0.0
	}
]
*/
const trainingData = [
	{
		input: [0,0],
		output: 0.0
	},
	{
		input: [1,0],
		output: 1.0
	},
	{
		input: [0,1],
		output: 1.0
	},
	{
		input: [1,1],
		output: 0.0
	}
]

for(var k=0;k<100000;k++) {
	trainingData.forEach(({ input, output }) => {
		const action = brain.forward(input)
		const reward = Math.round(action) === Math.round(output) ? 1.0 : 0.0
		brain.backward(reward)
	})
}
/*
for(var k=0;k<1000;k++) {
    var action = brain.forward(state); // returns index of chosen action
    var reward = action === 0 ? 1.0 : 0.0;
    brain.backward([reward]); // <-- learning magic happens here
    state[Math.floor(Math.random()*3)] += Math.random()*2-0.5;
}
*/
//brain.epsilon_test_time = 0.0; // don't make any more random choices
brain.learning = false;
// get an optimal action from the learned policy
//var action = brain.forward([0,0,0]);

//console.log(action)
//console.log('brain.forward([0,0,0]))

const testingData = [
	...trainingData,
	/*{
		input: [1,1,0],
		output: 1.0
	}*/
]

testingData.forEach(({ input, output }) => {
	console.log(brain.policy(input))
	//console.log(`${input}: ${brain.policy(input)} / ${output.toFixed(10)} - ${ same(brain.policy(input), output) ? 'correct' : 'incorrect'}`)
})

function same(a, b) {
	return Math.round(a) === Math.round(b)
}