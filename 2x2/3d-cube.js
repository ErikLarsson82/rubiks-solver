console.log('scrambles', scrambles)

const ANIMATIONS_ENABLED = true
const RENDER_SCENE = true
const AUTOPLAY_SOLVES = true
const ATTEMPT_THRESHOLD = 4

var loader = new THREE.GLTFLoader();

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 )
camera.position.z = 6

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize( window.innerWidth, window.innerHeight )
document.body.appendChild( renderer.domElement )

let cubeContainer, rotater, cube, cubits, isAnimating, queue, nextScrambleSequence, state, net, attempts, timer

const rotate = [0,0]
const speed = 0.04
const protrusion = 0.1
const baseSize = 0.97
const sideSize = 0.85

const colorRef = {
	EMPTY: new THREE.Color(0,0,0),
	WHITE: new THREE.Color(1,1,1),
	GREEN: new THREE.Color(0,1,0),
	RED: new THREE.Color(1,0,0),
	BLUE: new THREE.Color(0,0,1),
	YELLOW: new THREE.Color(1,1,0),
	ORANGE: new THREE.Color(1,0.5,0),
}

const visualBlueprint = [
	{ x: -0.5, y: 0.5, z: -0.5, color: new THREE.Color(1,1,0) },
	{ x: 0.5, y: 0.5, z: -0.5, color: new THREE.Color(0,1,0) },
	{ x: -0.5, y: 0.5, z: 0.5, color: new THREE.Color(1,0,0) },
	{ x: 0.5, y: 0.5, z: 0.5, color: new THREE.Color(0,0,1) },
	{ x: -0.5, y: -0.5, z: -0.5, color: new THREE.Color(1,0.5,0) },
	{ x: 0.5, y: -0.5, z: -0.5, color: new THREE.Color(1,1,1) },
	{ x: -0.5, y: -0.5, z: 0.5, color: new THREE.Color(0.5,0.5,0) },
	{ x: 0.5, y: -0.5, z: 0.5, color: new THREE.Color(0.5,0.5,0.5) }
]

function init() {
	queue = []

	isAnimating = false

	cube = createCube()
	originalCubeBinaryString = binaryStr(cube)

	cubeContainer = new THREE.Object3D()
	scene.add(cubeContainer)

	cubeContainer.rotation.x = 0.51
	cubeContainer.rotation.y = -0.63

	createScene()

	renderCube()

	if (AUTOPLAY_SOLVES) {
		timer = 0
		nextScrambleSequence = 0
		setState('SCRAMBLE')
		loadNet()
	} else {
		animate()
	}
}

function loadNet() {
	const dir = 'training-data'
	const trainingfile = `${dir}/training.json`
	d3.json(trainingfile).then(data => {
		net = new brain.NeuralNetwork(data['hyper-parameters']["BRAIN_CONFIG"]).fromJSON(data.net)
		animate()
	})

}

function createScene() {
	if (!RENDER_SCENE) return

	var light = new THREE.PointLight( 0xff0000, 1, 100 );
	light.position.set( 0, 10, 10 );
	scene.add( light );

	loader.load( 'blender/test.glb', function ( gltf ) {

		gltf.scene.position.x = 1

		gltf.scene.rotation.x = 0.51
		gltf.scene.rotation.y = -0.63

		scene.add( gltf.scene );

	}, undefined, function ( error ) {

		console.error( error );

	} );

}

function renderCube() {
	removeChildren(cubeContainer)

	rotater = new THREE.Object3D()
	cubeContainer.add(rotater)

	cubits = cube.map(createCubit)
	cubits.forEach(cubit => cubeContainer.add(cubit))
}

function removeChildren(container) {
	while (container.children.length)
	{
	    container.remove(container.children[0]);
	}
}

function createCubit({ id, position, up, down, front, back, right, left }) {
	const { color, x, y, z } = visualBlueprint[position]
	const container = new THREE.Object3D()
	container.customId = id

	const geometry = new THREE.BoxGeometry(baseSize, baseSize, baseSize)
	const material = new THREE.MeshBasicMaterial( { color: new THREE.Color(0.2, 0.2, 0.2) } );
	const cubitBase = new THREE.Mesh( geometry, material );
	cubitBase.position.x = x
	cubitBase.position.y = y
	cubitBase.position.z = z
	container.add(cubitBase)

	const sides = [
		{ dir: 'up', color: up },
		{ dir: 'down', color: down },
		{ dir: 'front', color: front },
		{ dir: 'back', color: back },
		{ dir: 'right', color: right },
		{ dir: 'left', color: left }
	]

	const faces = sides.map(side => createFace(side, x, y, z)).filter(x => x)
	faces.forEach(face => container.add(face))

	return container
}

function createFace({ dir, color }, x, y, z) {
	if (!color) return
	const geometry = new THREE.BoxGeometry(sideSize, sideSize, sideSize)
	const material = new THREE.MeshBasicMaterial( { color: colorRef[color.toUpperCase()] } )
	const face = new THREE.Mesh( geometry, material )
	face.position.x = x
	face.position.y = y
	face.position.z = z
	if (dir === 'up') {
		face.position.y = y + protrusion
	}
	if (dir === 'down') {
		face.position.y = y - protrusion
	}
	if (dir === 'left') {
		face.position.x = x - protrusion
	}
	if (dir === 'right') {
		face.position.x = x + protrusion
	}
	if (dir === 'front') {
		face.position.z = z + protrusion
	}
	if (dir === 'back') {
		face.position.z = z - protrusion
	}

	return face
}

function rotateSide(move, speed = 2000) {
	if (!ANIMATIONS_ENABLED) {
		cube = moveFuncs[move](cube)
	} else {
		if (isAnimating) return

		isAnimating = true

		const getPosition = cubit => cube.find(rawCubeData => rawCubeData.id === cubit.customId).position

		cubits.filter(cubit => positions[move].includes(getPosition(cubit)))
			.forEach(cubit => rotater.attach(cubit))

		const direction = ['F', 'R', 'U'].includes(move) ? -1 : 1
		const rotation = { value: 0 }
		const tween = new TWEEN.Tween(rotation)
			.to({ value: Math.PI / 2 * direction }, speed)
			.onUpdate(() => {
				if (['R', 'L'].includes(move)) {
					rotater.rotation.x = rotation.value
				}
				if (['F', 'B'].includes(move)) {
					rotater.rotation.z = rotation.value
				}
				if (['U', 'D'].includes(move)) {
					rotater.rotation.y = rotation.value
				}
	        })
	        .onComplete(() => {
	            cube = moveFuncs[move](cube)
	        	renderCube(cube)
	        	isAnimating = false
	        })
	        .start()
	}
}

function keydown(e) {
	if (e.keyCode === 37) {
        rotate[1] = -speed
    }
    if (e.keyCode === 39) {
        rotate[1] = speed
    }
    if (e.keyCode === 38) {
        rotate[0] = -speed
    }
    if (e.keyCode === 40) {
        rotate[0] = speed
    }
    if (e.keyCode === 82) {
    	rotateSide('R')
    }
    if (e.keyCode === 76) {
    	rotateSide('L')
    }
    if (e.keyCode === 70) {
    	rotateSide('F')
    }
    if (e.keyCode === 66) {
    	rotateSide('B')
    }
    if (e.keyCode === 68) {
    	rotateSide('D')
    }
    if (e.keyCode === 85) {
    	rotateSide('U')
    }
    if (e.keyCode === 80) {
    	persist(cube)
    }
    if (e.keyCode === 67) {
    	compare(cube)
    }
    if (e.keyCode === 49) { // 1
    	binaryStr(cube)
    }
    if (e.keyCode === 50) { // 2
    	binary(cube)
    }
}

function keyup(e) {
    if (e.keyCode === 37 || e.keyCode === 39) {
        rotate[1] = 0
    }
    if (e.keyCode === 38 || e.keyCode === 40) {
        rotate[0] = 0
    }
}

window.addEventListener('keydown', keydown)
window.addEventListener('keyup', keyup)

function animate(time) {
    requestAnimationFrame( animate )
    TWEEN.update( time )

    autoPlay()

	if (rotate[0]) {
        cubeContainer.rotation.x += rotate[0];
    }
    if (rotate[1]) {
        cubeContainer.rotation.y += rotate[1];
    }
    renderer.render( scene, camera )
}

function autoPlay() {
	if (!AUTOPLAY_SOLVES || isAnimating) return

	if (state === 'SCRAMBLE') {
		animateScramble()
		return
	} else if (state === 'SOLVING') {
		animateSolving()
		return
	}
	if (state === 'FINISHED' || state === 'FAILED') {
		animateEnd()
		return
	}
}

function setState(s) {
	state = s
	if (s === 'SCRAMBLE') {
		cube = createCube()
		document.getElementById('help-text').innerHTML = "Scrambling"
    	document.getElementById('help-text').className = "label scrambling"
    	queue = [...scrambles[nextScrambleSequence]]
    	nextScrambleSequence++
		if (nextScrambleSequence >= scrambles.length) nextScrambleSequence = 0
	}
	if (s === 'SOLVING') {
		attempts = 0
		document.getElementById('help-text').innerHTML = "Solving"
    	document.getElementById('help-text').className = "label solving"
	}
	if (s === 'FINISHED') {
		timer = 120
		document.getElementById('help-text').innerHTML = `Solve ${nextScrambleSequence} successful`
    	document.getElementById('help-text').className = "label success"
	}
	if (s === 'FAILED') {
		timer = 120
		document.getElementById('help-text').innerHTML = `Solve ${nextScrambleSequence} failed...`
    	document.getElementById('help-text').className = "label failed"
	}
}

function animateSolving() {
	attempts++
	if (binaryStr(cube) === binaryStr(createCube())) {
		setState('FINISHED')
		return
	} else if (attempts > ATTEMPT_THRESHOLD) {
		setState('FAILED')
		return
	}
	const policy = brain.likely(binary(cube), net)
	rotateSide(policy, 1000)
}

function animateScramble() {
	if (queue.length === 0) {
		setState('SOLVING')
		return
	}

	const move = queue.shift()
	rotateSide(move, 300)
}

function animateEnd() {
	timer--

	if (timer < 0) {
		setState('SCRAMBLE')
	}
}

init()
