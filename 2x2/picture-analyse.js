const Jimp = require('jimp')

Jimp.read("./2x2/images/3x3-double-sided.jpg", function (err, image) {
	
	const coords = [
		[101, 87],
		[130, 83],
		[128, 173]
	]

	coords.forEach((arr, i) => {
		const intColor = image.getPixelColor(arr[0], arr[1])    
    	const hexColor = Jimp.intToRGBA(intColor)

    	const color = classify(hexColor)

    	console.log(i, color)
	})
});

const diff = (a,b) => Math.abs(a - b)

function classify(hex) {
	const { r, g, b, a } = hex

	const tolerance = 20

	if (r > g && diff(r, g) > tolerance && r > b && diff(r, b) > tolerance) {
		return 'red'
	}

	if (g > r && g > b) {
		return 'green'
	}

	if (b > r && b > g) {
		return 'blue'
	}

	return 'white'
}