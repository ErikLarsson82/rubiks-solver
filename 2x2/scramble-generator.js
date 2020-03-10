const fs = require('fs')

const random = () => ["L", "R", "F", "B", "U", "D", "L'", "R'", "F'", "B'", "U'", "D'"][Math.floor(Math.random()*12)]

const newScramble = () => new Array(1+Math.floor(Math.random() * 2)).fill().map(random)

fs.writeFileSync('test.json', JSON.stringify(new Array(80).fill().map(newScramble)))
