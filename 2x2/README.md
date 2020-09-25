# 2x2 Rubiks cube trainer, solver and 3d-demo
### Trainer and solver is written in Node.js and accessed through terminal and the 3d-demo is written in react and hosted by an express webserver in this repo

Master has the latest results and progress now

The brain 2x2/brains/2020-08-06-00-10-10-impressive.json is hardwired as the selected brain and is the most competent yet.
Moves   RateX	RateY
1       65%		100%
2       47%		96%
3       35%		94%
6       12%		75%
8       10%		67%
12      3%		45%

# $ npm run host
Starts a express webserver that serves all assets to demo the net. Served at http://localhost:5000/2x2/3d-cube.html

# $ npm run build
With the introduction of react, now first run npm run build to bundle react and the source code before running npm run host

## Run the following commands:

### $ node scramble-generator.js

### $ node data-collector.js

### $ node trainer.js

# OR

## $ npm run train
