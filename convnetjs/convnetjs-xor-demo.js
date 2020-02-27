const convnetjs = require("convnetjs");

net = new convnetjs.Net();

net.makeLayers([
    {type: 'input', out_sx: 1, out_sy: 1, out_depth: 2},
    {type: 'fc', num_neurons: 3, activation: 'tanh'},
    {type: 'softmax', num_classes: 2}]);

trainer = new convnetjs.Trainer(net);

var point = new convnetjs.Vol(1, 1, 2);

for (var iter = 0; iter < 2000; iter++) {
    
        point.w = [1.0, 1.0];
        trainer.train(point, 0.0);
        
        point.w = [1.0, 0.0];
        trainer.train(point, 1.0);
        
        point.w = [0.0, 1.0];
        trainer.train(point, 1.0);
        
        point.w = [0.0, 0.0];
        trainer.train(point, 0.0);
    
}

point.w = [1.0, 1.0];
var prediction = net.forward(point);
console.log(point.w, prediction.w[1])

point.w = [1.0, 0.0];
var prediction = net.forward(point);
console.log(point.w, prediction.w[1])

point.w = [0.0, 1.0];
var prediction = net.forward(point);
console.log(point.w, prediction.w[1])

point.w = [0.0, 0.0];
var prediction = net.forward(point);
console.log(point.w, prediction.w[1])