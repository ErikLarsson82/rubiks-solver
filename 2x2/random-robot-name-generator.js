// Generate random robot names from the lists below

/*
Example outputs:
Athrawes v.23-DR
Decepticon Dorfl
Delta Chip Anthony
Mr. Nimue v.1000
Clas Ohlson BB-V
Kjell & Company G-1339
Athrawes MK-III
Hanson Robotics HCR-1337
Boilerplate Kit Nimue
ASUS GIGA-Sophia
Tesla T-1339
Cochran MK-1001-beta4
Clunk MK-III
Hanson Robotics Alban
Sophia Alban PRIME
Johan & Nystöm Athrawes
Autobot Roboto
Caliban Giskard Merlin
Tesla G-1338
micro-Otis MK-1001-beta4
Hanson Robotics G-1000
Clas Ohlson Manders
Epsilon v.23-DR
Kjell & Company Roderick
Johan & Nystöm T-1001-beta4
*/

const companies = [
	'Hanson Robotics',
	'Boston Dynamics',
	'Tesla',
	'Microsoft',
	'HiQ',
	'Niantic',
	'ASUS',
	'Johan & Nystöm',
	'Clas Ohlson',
	'Kjell & Company',
	'Autobot',
	'Decepticon',
]

const prefix = [
	'GIGA-',
	'GIGANTAMAX-',
	'micro-',
	'mili-',
	'Mr. ',
	'Ms. ',
	'Mrs. '
]

const postfix = [
	'bot',
	'robot',
	'droid',
	'machine',
	'box'
]

const names = [
	'Jan',
	'Janne',
	'Kurt',
	'Kletus',
	'PRIME',
	'Aibo',
	'Cargo',
	'Sophia',
	'Kuri',
	'Jenkins',
	'Bors',
	'Diktor',
	'Otis',
	'Roboto',
	'R.O.T.O.R',
	'Kit',
	'Chip',
	'Roderick',
	'Giskard',
	'Reventlov',
	'Elio',
	'Manders',
	'Solo',
	'Conal',
	'Cochran',
	'Sheen',
	'Anthony',
	'Spofforth',
	'Yod',
	'Caliban',
	'Jay-Dub',
	'Dorfl',
	'Cassandra',
	'Kresnov',
	'Clunk',
	'Moravecs',
	'Nimue',
	'Alban',
	'Merlin',
	'Athrawes',
	'Otis',
	'Freya',
	'Boilerplate',
	'Alpha',
	'Beta',
	'Charlie',
	'Delta',
	'Epsilon'
]

const abbrev = [
	'T-',
	'G-',
	'P-',
	'HCR-',
	'BB-',
]

const numberPrefix = [
	'MK-',
	'v.'
]

const numbers = [
	'1000',
	'1337',
	'1338',
	'1339',
	'800',
	'1A',
	'27B',
	'V',
	'III',
	'I',
	'VII',
	'0.01',
	'156-b2',
	'23-DR',
	'1001-beta4'
]

function randomInArray(arr) {
	const idx = Math.floor(Math.random() * arr.length)
	return arr[idx]
}

function likely(percent, arr) {
	if (Math.random()*100 < percent) {
		return randomInArray(arr)
	}
	return ''
}

function generate() {
	const r = [Math.random(), Math.random(), Math.random(), Math.random()]

	let s = ''

	if (r[0] < 0.20) {
		return `${ randomInArray(companies) } ${ likely(20, prefix) }${ randomInArray(names) }`
	}

	if (r[0] < 0.40) {
		return `${ randomInArray(companies) } ${randomInArray(abbrev)}${randomInArray(numbers)}`
	}

	if (r[0] < 0.60) {
		return `${ randomInArray(names) } ${randomInArray(names)} ${randomInArray(names)}`
	}

	return `${ likely(5, prefix) }${randomInArray(names)} ${randomInArray(numberPrefix)}${randomInArray(numbers)}`
}

// Export
{
	// Run from terminal
	if (typeof require !== 'undefined' && require.main === module) {
		const args = parseInt(process.argv[2])
		if (isNaN(args)) {
	    	console.log(generate())
	    } else {
	    	for (var i = 0; i < args; i++) {
				console.log(generate())
			}
	    }
	}

	// Require in node or browser bundle
	if (typeof module !== 'undefined') {
		module.exports = generate
	}

	// Use as a basic script tag
	if (typeof window !== 'undefined' && typeof window.generateRandomRobotName === 'undefined') {
		window.generateRandomRobotName = generate
	}
}