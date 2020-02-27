const convnetjs = require("convnetjs");

net = new convnetjs.Net();

net.makeLayers([
    {type: 'input', out_sx: 1, out_sy: 1, out_depth: 2},
    {type: 'fc', num_neurons: 4, activation: 'tanh'},
    {type: 'softmax', num_classes: 4}]);

trainer = new convnetjs.Trainer(net);

var point = new convnetjs.Vol(1, 1, 4);

for (var iter = 0; iter < 2000; iter++) {
    
        point.w = [1.0, 1.0];
        trainer.train(point, 0);
        
        point.w = [1.0, 0.0];
        trainer.train(point, 1);
        
        point.w = [0.0, 1.0];
        trainer.train(point, 2);
        
        point.w = [0.0, 0.0];
        trainer.train(point, 3);
    
}

point.w = [1.0, 1.0];
var prediction = net.forward(point);
console.log(point.w, prediction.w.map(x=>x.toFixed(3)))

point.w = [1.0, 0.0];
var prediction = net.forward(point);
console.log(point.w, prediction.w.map(x=>x.toFixed(3)))

point.w = [0.0, 1.0];
var prediction = net.forward(point);
console.log(point.w, prediction.w.map(x=>x.toFixed(3)))

point.w = [0.0, 0.0];
var prediction = net.forward(point);
console.log(point.w, prediction.w.map(x=>x.toFixed(3)))