var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const colors = {
    yellow: new THREE.Color(1,1,0), //0xffff00,
    green: new THREE.Color(0,1,0), //0x00ff00,
    red: new THREE.Color(1,0,0), //0xff0000,
    blue: new THREE.Color(0,0,1), //0x0000ff,
    orange: new THREE.Color(1,0.5,0), //0xff7700,
    white: new THREE.Color(0.8,0.8,0.8), //0xffffff,
}

const size = 0.5

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
]

var pivot = new THREE.Object3D();
scene.add(pivot);

rubiks.forEach((data, idx) => {
    const geometry = new THREE.BoxGeometry(size, size, size);
    
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
    cube.position.x = data.x * size
    cube.position.y = data.y * size
    cube.position.z = data.z * size

    pivot.add(cube);
})

camera.position.z = 5;

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
})

window.addEventListener('keyup', (e) => {
    if (e.keyCode === 37 || e.keyCode === 39) {
        rotate[1] = 0
    }
    if (e.keyCode === 38 || e.keyCode === 40) {
        rotate[0] = 0
    }
})

function animate() {
	requestAnimationFrame( animate );

    if (rotate[0]) {
        pivot.rotation.x += rotate[0];
    }
    if (rotate[1]) {
        pivot.rotation.y += rotate[1];
    }

	renderer.render( scene, camera );
}
animate();