const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const queue = []
let isAnimating = false

const colors = {
    yellow: new THREE.Color(1,1,0), //0xffff00,
    green: new THREE.Color(0,1,0), //0x00ff00,
    red: new THREE.Color(1,0,0), //0xff0000,
    blue: new THREE.Color(0,0,1), //0x0000ff,
    orange: new THREE.Color(1,0.5,0), //0xff7700,
    white: new THREE.Color(1,1,1), //0xffffff,
}

/*
    Faces:
    A: 0, 1: Höger sida
    B: 2, 3: Vänster sida
    C: 4, 5: Top
    D: 6, 7: Botten
    E: 8, 9: Front
    F: 10, 11: Back
*/

/*  
    x: right is more, left is less, origo middle of cube
    y: up is more, down is less, origo middle of cube
    z: towards you is more, away from you is less, origo middle of cube
*/

const cubeContainer = new THREE.Object3D();
scene.add(cubeContainer);
cubeContainer.rotation.x = 0.51
cubeContainer.rotation.y = -0.63

const rotater = new THREE.Object3D();
cubeContainer.add(rotater);

const rubiks = [
    //Yellow side
    { x: 0, y: 1, z: 0, top: 'yellow' }, //Center
    { x: 1, y: 1, z: 0, top: 'yellow', right: 'orange' },
    { x: -1, y: 1, z: 0, top: 'yellow', left: 'red' },
    { x: 0, y: 1, z: -1, top: 'yellow', back: 'blue' },
    { x: 0, y: 1, z: 1, top: 'yellow', front: 'green' },
    //Corners
    { x: -1, y: 1, z: 1, top: 'yellow', front: 'green', left: 'red' },
    { x: 1, y: 1, z: 1, top: 'yellow', front: 'green', right: 'orange' },
    { x: -1, y: 1, z: -1, top: 'yellow', left: 'red', back: 'blue' },
    { x: 1, y: 1, z: -1, top: 'yellow', right: 'orange', back: 'blue' },

    //Middle layer
    { x: 0, y: 0, z: 1, front: 'green' }, //Center
    { x: 0, y: 0, z: -1, back: 'blue' }, //Center
    { x: -1, y: 0, z: 0, left: 'red' }, //Center
    { x: 1, y: 0, z: 0, right: 'orange' }, //Center
    { x: -1, y: 0, z: 1, front: 'green', left: 'red' },
    { x: 1, y: 0, z: 1, front: 'green', right: 'orange' },
    { x: -1, y: 0, z: -1, back: 'blue', left: 'red' },
    { x: 1, y: 0, z: -1, back: 'blue', right: 'orange' },

    //White side
    { x: 0, y: -1, z: 0, bottom: 'white' }, //Center
    { x: 1, y: -1, z: 0, bottom: 'white', right: 'orange' },
    { x: -1, y: -1, z: 0, bottom: 'white', left: 'red' },
    { x: 0, y: -1, z: -1, bottom: 'white', back: 'blue' },
    { x: 0, y: -1, z: 1, bottom: 'white', front: 'green' },

    //Corners
    { x: -1, y: -1, z: 1, bottom: 'white', front: 'green', left: 'red' },
    { x: 1, y: -1, z: 1, bottom: 'white', front: 'green', right: 'orange' },
    { x: -1, y: -1, z: -1, bottom: 'white', left: 'red', back: 'blue' },
    { x: 1, y: -1, z: -1, bottom: 'white', right: 'orange', back: 'blue' },
].map((data, idx) => {
    const geometry = new THREE.BoxGeometry(0.97, 0.97, 0.97);
    
    const insides = new THREE.Color(0.3, 0.3, 0.3)

    new Array(12).fill().forEach((_, i) => geometry.faces[i].color = insides)

    if (data.right !== undefined) {
        geometry.faces[0].color = colors[data.right]
        geometry.faces[1].color = colors[data.right]
    }

    if (data.left !== undefined) {
        geometry.faces[2].color = colors[data.left]
        geometry.faces[3].color = colors[data.left]
    }

    if (data.top !== undefined) {
        geometry.faces[4].color = colors[data.top]
        geometry.faces[5].color = colors[data.top]
    }

    if (data.bottom !== undefined) {
        geometry.faces[6].color = colors[data.bottom]
        geometry.faces[7].color = colors[data.bottom]
    }

    if (data.front !== undefined) {
        geometry.faces[8].color = colors[data.front]
        geometry.faces[9].color = colors[data.front]
    }

    if (data.back !== undefined) {
        geometry.faces[10].color = colors[data.back]
        geometry.faces[11].color = colors[data.back]
    }
    const material = new THREE.MeshBasicMaterial( { vertexColors: THREE.FaceColors } );
    cube = new THREE.Mesh( geometry, material );
    cube.position.x = data.x
    cube.position.y = data.y
    cube.position.z = data.z

    cubeContainer.add(cube)
    
    return {...data, cube}
})

camera.position.z = 6;

const rotate = [0,0]
const speed = 0.03

window.addEventListener('keydown', (e) => {
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
    if (e.keyCode === 85 && !e.shiftKey) {
        addToQueue("U'")
    }
    if (e.keyCode === 85 && e.shiftKey) {
        addToQueue("U")
    }
    if (e.keyCode === 82 && !e.shiftKey) {
        addToQueue("R")
    }
    if (e.keyCode === 82 && e.shiftKey) {
        addToQueue("R'")
    }
    if (e.keyCode === 76 && !e.shiftKey) {
        addToQueue("L")
    }
    if (e.keyCode === 76 && e.shiftKey) {
        addToQueue("L'")
    }
    if (e.keyCode === 68 && !e.shiftKey) {
        addToQueue("D")
    }
    if (e.keyCode === 68 && e.shiftKey) {
        addToQueue("D'")
    }
    if (e.keyCode === 70 && !e.shiftKey) {
        addToQueue("F")
    }
    if (e.keyCode === 70 && e.shiftKey) {
        addToQueue("F'")
    }
    if (e.keyCode === 66 && !e.shiftKey) {
        addToQueue("B")
    }
    if (e.keyCode === 66 && e.shiftKey) {
        addToQueue("B'")
    }
    if (e.keyCode === 49) {
        addToQueue("F2")
    }
    if (e.keyCode === 50) {
        addToQueue("R2")
    }
    if (e.keyCode === 51) {
        addToQueue("U2")
    }
    if (e.keyCode === 52) {
        addToQueue("L2")
    }
    if (e.keyCode === 53) {
        addToQueue("B2")
    }
    if (e.keyCode === 54) {
        addToQueue("D2")
    }
})

function addToQueue(move) {
    switch (move) {
        case "U":
            queue.push({ filter: d => d.cube.position.y === 1, axis: 'y' })
            break;
        case "U'":
            queue.push({ filter: d => d.cube.position.y === 1, axis: 'y', reversed: true })
            break;
        case "F":
            queue.push({ filter: d => d.cube.position.z === 1, axis: 'z', reversed: true }) 
            break;
        case "F'":
            queue.push({ filter: d => d.cube.position.z === 1, axis: 'z' })
            break;
        case "L":
            queue.push({ filter: d => d.cube.position.x === -1, axis: 'x' })
            break;
        case "L'":
            queue.push({ filter: d => d.cube.position.x === -1, axis: 'x', reversed: true })
            break;
        case "R":
            queue.push({ filter: d => d.cube.position.x === 1, axis: 'x', reversed: true })
            break;
        case "R'":
            queue.push({ filter: d => d.cube.position.x === 1, axis: 'x' })
            break;
        case "U":
            queue.push({ filter: d => d.cube.position.x === 1, axis: 'x', reversed: true })
            break;
        case "U'":
            queue.push({ filter: d => d.cube.position.x === 1, axis: 'x' })
            break;
        case "B":
            queue.push({ filter: d => d.cube.position.z === -1, axis: 'z' })
            break;
        case "B'":
            queue.push({ filter: d => d.cube.position.z === -1, axis: 'z', reversed: true })
            break;
        case "D":
            queue.push({ filter: d => d.cube.position.y === -1, axis: 'y' })
            break;
        case "D'":
            queue.push({ filter: d => d.cube.position.y === -1, axis: 'y', reversed: true })
            break;
        case "F2":
            queue.push({ filter: d => d.cube.position.z === 1, axis: 'z', reversed: true }) 
            queue.push({ filter: d => d.cube.position.z === 1, axis: 'z', reversed: true }) 
            break;
        case "R2":
            queue.push({ filter: d => d.cube.position.x === 1, axis: 'x', reversed: true })
            queue.push({ filter: d => d.cube.position.x === 1, axis: 'x', reversed: true })
            break;
        case "U2":
            queue.push({ filter: d => d.cube.position.y === 1, axis: 'y' })
            queue.push({ filter: d => d.cube.position.y === 1, axis: 'y' })
            break;
        case "L2":
            queue.push({ filter: d => d.cube.position.x === -1, axis: 'x' })
            queue.push({ filter: d => d.cube.position.x === -1, axis: 'x' })
            break;
        case "B2":
            queue.push({ filter: d => d.cube.position.z === -1, axis: 'z' })
            queue.push({ filter: d => d.cube.position.z === -1, axis: 'z' })
            break;
        case "D2":
            queue.push({ filter: d => d.cube.position.y === -1, axis: 'y' })
            queue.push({ filter: d => d.cube.position.y === -1, axis: 'y' })
            break;

    }
}

function resetRotater() {
    rotater.rotation.x = 0
    rotater.rotation.y = 0
    rotater.rotation.z = 0
}

function rotateSide({ filter, axis, reversed }) {
    isAnimating = true
    const cubes = rubiks.filter(filter)
    cubes.forEach(obj => rotater.attach(obj.cube))

    const rotation = { value: 0 }
    const tween = new TWEEN.Tween(rotation)
        .to({ value: Math.PI / 2 * (reversed ? -1 : 1) }, 1000)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onUpdate(() => {
            rotater.rotation[axis] = rotation.value
        })
        .onComplete(() => {
            cubes.forEach(obj => {
                cubeContainer.attach( obj.cube );
                obj.cube.position.x = Math.round(obj.cube.position.x)
                obj.cube.position.y = Math.round(obj.cube.position.y)
                obj.cube.position.z = Math.round(obj.cube.position.z)
            })
            resetRotater()
            isAnimating = false
        })
        .start();
}

window.addEventListener('keyup', (e) => {
    if (e.keyCode === 37 || e.keyCode === 39) {
        rotate[1] = 0
    }
    if (e.keyCode === 38 || e.keyCode === 40) {
        rotate[0] = 0
    }
})

function cycle(input) {
    // corners
    if (input[0] === 1 && input[1] === -1) return [1,1]
    if (input[0] === 1 && input[1] === 1) return [-1,1]
    if (input[0] === -1 && input[1] === 1) return [-1,-1]
    if (input[0] === -1 && input[1] === -1) return [1,-1]

    // middles
    if (input[0] === 1 && input[1] === 0) return [0,1]
    if (input[0] === 0 && input[1] === 1) return [-1,0]
    if (input[0] === -1 && input[1] === 0) return [0,-1]
    if (input[0] === 0 && input[1] === -1) return [1, 0]
}

function animate(time) {
	requestAnimationFrame( animate );

    if (!isAnimating && queue.length > 0) {
        rotateSide(queue.shift())
    }

    TWEEN.update(time);

    if (rotate[0]) {
        cubeContainer.rotation.x += rotate[0];
    }
    if (rotate[1]) {
        cubeContainer.rotation.y += rotate[1];
    }

	renderer.render( scene, camera );
}
animate();