const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.z = 6;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

let queue = []
//const data = ["R","U","R'","U'","R","U","R'","U'","R","U","R'","U'","R","U","R'","U'","R","U","R'","U'","R","U","R'","U'"]
//data.forEach(rotationObject)

const SPEED = 2000

const rotate = [0,0]
const speed = 0.03

let rubiks, cubeContainer, rotater, net, comparee
let isAnimating = false
let isAISolving = false

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

function resetCube() {
    removeCube()
    createCube()
}

function removeCube() {
    scene.remove(cubeContainer)
    rubiks = null
}

function createCube() {
    
    if (rubiks) {
        console.log('Cannot create, remove first')
        return
    }
    cubeContainer = new THREE.Object3D();
    scene.add(cubeContainer);
    cubeContainer.rotation.x = 0.51
    cubeContainer.rotation.y = -0.63

    rotater = new THREE.Object3D();
    cubeContainer.add(rotater);

    rubiks = originalCube.map((data, idx) => {
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

        cube.customData = data

        cubeContainer.add(cube)
        
        return {...data, cube}
    })

    //rotateSide("F", false)
    //rotateSide("F", false)
    //rotateSide("F", false)
    //rotateSide("F", false)
    
    //comparee = printCube()
    //console.log(R.equals(printCube(),comparee))
}

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
    if (e.keyCode === 73) {
        rotateSide("U", false)
    }
    if (e.keyCode === 85 && !e.shiftKey) {
        queue.push("U")
    }
    if (e.keyCode === 85 && e.shiftKey) {
        queue.push("U'")
    }
    if (e.keyCode === 82 && !e.shiftKey) {
        queue.push("R")
    }
    if (e.keyCode === 82 && e.shiftKey) {
        queue.push("R'")
    }
    if (e.keyCode === 76 && !e.shiftKey) {
        queue.push("L")
    }
    if (e.keyCode === 76 && e.shiftKey) {
        queue.push("L'")
    }
    if (e.keyCode === 68 && !e.shiftKey) {
        queue.push("D")
    }
    if (e.keyCode === 68 && e.shiftKey) {
        queue.push("D'")
    }
    if (e.keyCode === 70 && !e.shiftKey) {
        queue.push("F")
    }
    if (e.keyCode === 70 && e.shiftKey) {
        queue.push("F'")
    }
    if (e.keyCode === 66 && !e.shiftKey) {
        queue.push("B")
    }
    if (e.keyCode === 66 && e.shiftKey) {
        queue.push("B'")
    }
    if (e.keyCode === 49) {
        queue.push("F2")
    }
    if (e.keyCode === 50) {
        queue.push("R2")
    }
    if (e.keyCode === 51) {
        queue.push("U2")
    }
    if (e.keyCode === 52) {
        queue.push("L2")
    }
    if (e.keyCode === 53) {
        queue.push("B2")
    }
    if (e.keyCode === 54) {
        queue.push("D2")
    }
    if (e.keyCode === 80) {
        console.log(printCube())
    }
    if (e.keyCode === 65) {
        if (!net) {
            console.log("No net trained yet")
            return
        }
        isAISolving = true
    }
    if (e.keyCode === 27) {
        removeCube()
    }
    if (e.keyCode === 13) {
        createCube()
    }
    if (e.keyCode === 84) {
        trainNetwork()
    }
    if (e.keyCode === 67) {
        console.log(R.equals(printCube(),comparee))
    }
    if (e.keyCode === 83) {
        console.log("Saving current")
        comparee = printCube()
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

function printCube() {
    return cubeContainer.children.filter(x=>x.type === 'Mesh').map(coordsAndRotation).flatMap(x => x.map(convertColor))
}

function replaceUndefinedWithZero(x) {
    return x === undefined ? 0 : x
}

function coordsAndRotation(d) {
    return [d.position.x, d.position.y, d.position.z, d.rotation.x, d.rotation.y, d.rotation.z, d.customData.front, d.customData.right, d.customData.up, d.customData.left, d.customData.bottom, d.customData.down].map(replaceUndefinedWithZero)
}

function convertColor(color) {
  if (typeof color !== "string") return color
  return [
    'yellow',
    'green',
    'red',
    'blue',
    'orange',
    'white'
  ].findIndex(x => x === color)
}

function inverse(move) {
    if (move.includes("2")) return move

    if (move.includes("'")) return move[0]

    return `${move}'`
}

function rotationObject(move) {
    switch (move) {
        case "U":
            return { filter: d => d.cube.position.y === 1, axis: 'y' }
            break;
        case "U'":
            return { filter: d => d.cube.position.y === 1, axis: 'y', reversed: true }
            break;
        case "F":
            return { filter: d => d.cube.position.z === 1, axis: 'z', reversed: true }
            break;
        case "F'":
            return { filter: d => d.cube.position.z === 1, axis: 'z' }
            break;
        case "L":
            return { filter: d => d.cube.position.x === -1, axis: 'x' }
            break;
        case "L'":
            return { filter: d => d.cube.position.x === -1, axis: 'x', reversed: true }
            break;
        case "R":
            return { filter: d => d.cube.position.x === 1, axis: 'x', reversed: true }
            break;
        case "R'":
            return { filter: d => d.cube.position.x === 1, axis: 'x' }
            break;
        case "U":
            return { filter: d => d.cube.position.x === 1, axis: 'x', reversed: true }
            break;
        case "U'":
            return { filter: d => d.cube.position.x === 1, axis: 'x' }
            break;
        case "B":
            return { filter: d => d.cube.position.z === -1, axis: 'z' }
            break;
        case "B'":
            return { filter: d => d.cube.position.z === -1, axis: 'z', reversed: true }
            break;
        case "D":
            return { filter: d => d.cube.position.y === -1, axis: 'y' }
            break;
        case "D'":
            return { filter: d => d.cube.position.y === -1, axis: 'y', reversed: true }
            break;
        case "F2":
            return { filter: d => d.cube.position.z === 1, axis: 'z', reversed: true }
            return { filter: d => d.cube.position.z === 1, axis: 'z', reversed: true }
            break;
        case "R2":
            return { filter: d => d.cube.position.x === 1, axis: 'x', reversed: true }
            return { filter: d => d.cube.position.x === 1, axis: 'x', reversed: true }
            break;
        case "U2":
            return { filter: d => d.cube.position.y === 1, axis: 'y' }
            return { filter: d => d.cube.position.y === 1, axis: 'y' }
            break;
        case "L2":
            return { filter: d => d.cube.position.x === -1, axis: 'x' }
            return { filter: d => d.cube.position.x === -1, axis: 'x' }
            break;
        case "B2":
            return { filter: d => d.cube.position.z === -1, axis: 'z' }
            return { filter: d => d.cube.position.z === -1, axis: 'z' }
            break;
        case "D2":
            return { filter: d => d.cube.position.y === -1, axis: 'y' }
            return { filter: d => d.cube.position.y === -1, axis: 'y' }
            break;

    }
}

function resetRotater() {
    rotater.rotation.x = 0
    rotater.rotation.y = 0
    rotater.rotation.z = 0
}

function rotateSide(move, animation) {
    const { filter, axis, reversed } = rotationObject(move)
    const cubes = rubiks.filter(filter)
    cubes.forEach(obj => rotater.attach(obj.cube))

    if (animation !== false) {
        isAnimating = true
        const rotation = { value: 0 }
        const tween = new TWEEN.Tween(rotation)
            .to({ value: Math.PI / 2 * (reversed ? -1 : 1) }, SPEED)
            .easing(TWEEN.Easing.Quadratic.Out)
            .onUpdate(() => {
                rotater.rotation[axis] = rotation.value
            })
            .onComplete(() => {
                cubes.forEach(obj => {
                    console.log(obj.cube.rotation.x)//, Math.round(obj.cube.rotation.y * 10))
                    //scene.attach( obj.cube );
                    //obj.cube.position.x = Math.round(obj.cube.position.x)
                    //obj.cube.position.y = Math.round(obj.cube.position.y)
                    //obj.cube.position.z = Math.round(obj.cube.position.z)
                    //obj.cube.rotation.x = Math.round(obj.cube.rotation.x)
                    //obj.cube.rotation.y = Math.round(obj.cube.rotation.y)
                    //obj.cube.rotation.z = Math.round(obj.cube.rotation.z)
                    cubeContainer.attach( obj.cube )
                })
                resetRotater()
                isAnimating = false
            })
            .start();
    } else {
        rotater.rotation[axis] = Math.PI / 2 * (reversed ? -1 : 1)
        cubes.forEach(obj => {
            cubeContainer.attach( obj.cube );
            obj.cube.position.x = Math.round(obj.cube.position.x)
            obj.cube.position.y = Math.round(obj.cube.position.y)
            obj.cube.position.z = Math.round(obj.cube.position.z)
            obj.cube.rotation.x = Math.round(obj.cube.rotation.x)
            obj.cube.rotation.y = Math.round(obj.cube.rotation.y)
            obj.cube.rotation.z = Math.round(obj.cube.rotation.z)
        })
        resetRotater()
    }
}

function trainNetwork() {
    const trainingData = []

    net = new brain.NeuralNetwork({ hiddenLayers: [4] });

    resetCube()

    const moves = [
        "F",
        "F'",
        "U",
        "U'",
        "R",
        "R'",
    ]

    for (var i = 0; i < 1; i++) {
        const rand = Math.floor(Math.random() * moves.length)
        const move = moves[rand]
        const inverseMove = inverse(move)
        console.log('running', rand, move, inverseMove)
        rotateSide(move, false)
        trainingData.push({
            input: printCube(),
            output: { [inverseMove]: 1 }
        })
    } 

    window.trainingData = trainingData

    const result = net.train(trainingData)

    console.log('Training result', result)
}

function pickHighest(data) {
    console.log('picking highest from', data)
    let bestScore = 0
    let bestRotation = ''
    for (rotation in data) {
        if (data[rotation] > bestScore) {
            bestScore = data[rotation]
            bestRotation = rotation
        }
    }
    return bestRotation
}


function animate(time) {
    //console.log(isAISolving, R.equals(printCube(),comparee))
    if (isAISolving && R.equals(printCube(),comparee)) {
        isAISolving = false
        isAnimating = false
        queue = []
        return
    } else {
        requestAnimationFrame( animate );
    }

    renderer.render( scene, camera );

    if (isAnimating) {
        TWEEN.update(time);

        if (rotate[0]) {
            cubeContainer.rotation.x += rotate[0];
        }
        if (rotate[1]) {
            cubeContainer.rotation.y += rotate[1];
        }

        return
    }

    

    if (isAISolving && queue.length === 0) {
        const cube = printCube()
        const result = net.run(cube)
        const best = pickHighest(result)
        console.log('best is', best)
        if (!best) {
            isAISolving = false
            console.log('AI gave up')
            return
        }
        queue.push(best)
    } else if (queue.length > 0) {
        rotateSide(queue.shift())
    }

    
}
createCube();
animate();

