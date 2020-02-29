const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 )
camera.position.z = 6

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize( window.innerWidth, window.innerHeight )
document.body.appendChild( renderer.domElement )

let cubeContainer, rotater, cube, cubits, isAnimating

const rotate = [0,0]
const speed = 0.08
const protrusion = 0.1
const sideSize = 0.85

const colorRef = {
	EMPTY: new THREE.Color(0,0,0),
	WHITE: new THREE.Color(1,1,1),
	GREEN: new THREE.Color(0,1,0),
	RED: new THREE.Color(1,0,0),
	BLUE: new THREE.Color(0,0,1),
	YELLOW: new THREE.Color(1,1,0),
	ORANGE: new THREE.Color(0.5,1,0),
}

const visualBlueprint = [
	{ x: 0, y: 1, z: 0, color: new THREE.Color(1,1,0) },
	{ x: 1, y: 1, z: 0, color: new THREE.Color(0,1,0) },
	{ x: 0, y: 1, z: 1, color: new THREE.Color(1,0,0) },
	{ x: 1, y: 1, z: 1, color: new THREE.Color(0,0,1) },
	{ x: 0, y: 0, z: 0, color: new THREE.Color(1,0.5,0) },
	{ x: 1, y: 0, z: 0, color: new THREE.Color(1,1,1) },
	{ x: 0, y: 0, z: 1, color: new THREE.Color(0.5,0.5,0) },
	{ x: 1, y: 0, z: 1, color: new THREE.Color(0.5,0.5,0.5) }
]

function init() {
	isAnimating = false

	cube = createCube()

	cubeContainer = new THREE.Object3D()
	scene.add(cubeContainer)

	cubeContainer.rotation.x = 0.51
	cubeContainer.rotation.y = -0.63

	renderCube()
	animate()
}

function renderCube() {
	removeChildren(cubeContainer)

	rotater = new THREE.Object3D()
	rotater.position.x = 0.5
	rotater.position.y = 0.5
	rotater.position.z = 0.5
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

function createCubit({ position, up, down, front, back, right, left }, i) {
	const { color, x, y, z } = visualBlueprint[position]
	const container = new THREE.Object3D()

	const geometry = new THREE.BoxGeometry(0.97, 0.97, 0.97)
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

	sides.map(side => createFace(side, x, y, z)).forEach(face => container.add(face))

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

function animateRotation() {
	if (isAnimating) return

	cubits.forEach(cubit => rotater.attach(cubit))

	isAnimating = true
	const rotation = { value: 0 }
	const tween = new TWEEN.Tween(rotation)
		.to({ value: Math.PI / 2 * -1 }, 2000) //Math.PI / 2 * (reversed ? -1 : 1)
		.onUpdate(() => {
			rotater.rotation.x = rotation.value
        })
        .onComplete(() => {
            isAnimating = false

            setTimeout(() => {
            	cube = right(cube)
            	renderCube(cube)
            	isAnimating = false
            }, 100)
        })
        .start()
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
    if (e.keyCode === 13) {
    	animateRotation()
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

	if (rotate[0]) {
        cubeContainer.rotation.x += rotate[0];
    }
    if (rotate[1]) {
        cubeContainer.rotation.y += rotate[1];
    }    
    renderer.render( scene, camera )
}

init()