const convnetjs = require("convnetjs");

net = new convnetjs.Net();

net.makeLayers([
    {type: 'input', out_sx: 1, out_sy: 1, out_depth: 3},
    {type: 'fc', num_neurons: 3, activation: 'tanh'},
    {type: 'softmax', num_classes: 2}]);

const options = {
    learning_rate:0.0,
    l2_decay:0.001
}

trainer = new convnetjs.Trainer(net, options);

var point = new convnetjs.Vol(1, 1, 2);

for (var iter = 0; iter < 1; iter++) {
    
        point.w = [1.0, 1.0, 1.0];
        trainer.train(point, 0.0);
        
        point.w = [1.0, 0.0, 0.0];
        trainer.train(point, 1.0);
        
        point.w = [0.0, 1.0, 0.0];
        trainer.train(point, 1.0);
        
        point.w = [0.0, 0.0, 0.0];
        trainer.train(point, 0.0);
    
}

point.w = [1.0, 1.0, 1.0];
var prediction = net.forward(point);
console.log(point.w, prediction.w)

point.w = [1.0, 0.0, 0.0];
var prediction = net.forward(point);
console.log(point.w, prediction.w)

point.w = [0.0, 1.0, 0.0];
var prediction = net.forward(point);
console.log(point.w, prediction.w)

point.w = [0.0, 0.0, 0.0];
var prediction = net.forward(point);
console.log(point.w, prediction.w)