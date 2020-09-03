
const percent = parseInt(process.argv[2])
const seconds = parseInt(process.argv[3])

const MULTIPLIER = 10000

const parts = (100 / percent)
const prognoseInHours = seconds * parts / 60 / 60
const score = percent / seconds * MULTIPLIER

console.log(`Novel data solved            : ${percent} %`)
console.log(`Training time                : ${seconds} seconds`)
console.log(`Prognose for full completion : ${prognoseInHours.toFixed(1)} hours`)
console.log(`Score                        : ${score.toFixed(0)} points`)