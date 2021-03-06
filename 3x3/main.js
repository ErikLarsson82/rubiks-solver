const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.z = 6;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

let queue = []

const SPEED = 150

const rotate = [0,0]
const speed = 0.03

let rubiks, cubeContainer, rotater, net, comparee
let isAnimating = false
let isAISolving = false
let isLocked = false

const colors = {
    yellow: new THREE.Color(1,1,0), //0xffff00,
    green: new THREE.Color(0,1,0), //0x00ff00,
    red: new THREE.Color(1,0,0), //0xff0000,
    blue: new THREE.Color(0,0,1), //0x0000ff,
    orange: new THREE.Color(1,0.5,0), //0xff7700,
    white: new THREE.Color(1,1,1), //0xffffff,
}

const scrambles = [
    /*"B F U U",
    "F U U B",
    "B U U F",
    "U U B F",
    "U U",
    "F F",
    "U F U",
    "F U F",
    "U",
    "F"*/
    //"B F F L U L' B' R D' U U F' U U B B R R U' R' U L' F' R' U' D D R U U R' U",
    //"R D' L L B B R L L U' L' U' B B D' B B D' U' B D' B B D D B L' D D U U R R L D'",
    //"U' R R B' F' U' L' D F2 B B L R' B B L L U' F' L R R D F' D F B' L' B R R",
    //"R' D' U U L' B B R R F2 B R' U F2 U U F B B R F B' U D D L L F' U L L U U F",
    //"D D U R U' F' L F2 R R F' U' L L U L L R R D D L U' L L B B L D U' L B' F'",
    //"D U U F2 B' D R R F U R R U' F D' U U B' F' R' D' R R F' L B B D D U' F' R'",
    //"R' L D R R B' U U R L U' L L R R B L R' B' F2 L B B D' F U F' U' D D F2",
    //"B B R' B' R R U' B B U' R' L' B R' B' D U L D D B B D F2 R U R D' F2 U U",
    //"U' L D D R R D U' R U U B B L L F' R R U L B U' F U' F2 R' D' R' D F' L",
    //"U' L U R R D' U U F' U' B F U U D D L B' L B' D D F2 R' F' R' F2 R R D R'",
    //"U L B L' B B L' F' D U U L L D D U U R D' R B B D' F2 R R D' U' B U F' B",
    //"U L F' L' B L' B B F' R R D' R' U U B L' R F' L L R U U B' R R B L L U L",
    //"R R D D U' L B D D F2 U L L U U D F' D D U B B D R R U' F' R R F2 D' U' L' F2",
    //"L' B D D L L U L L B B L B D' L B' L' D' F2 R' B L U' B B F2 R R U U L' F'",
    //"R B B L' F B R R B' F2 D D L D R R D D F' D' F U U R R U D D L U R F2 D'",
].map(x => x.split(" "))

const moves = [
    "U",
    //"U'",
    "L",
    //"L'",
    "R",
    //"R'",
    "D",
    //"D'",
    "B",
    //"B'",
    "F",
    //"F'"
]

const setOfPermutations = perm(moves).slice(0, 10)

/*
    Faces:
    A: 0, 1: Höger sida
    B: 2, 3: Vänster sida
    C: 4, 5: up
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

function setupNet() {
    const json = localStorage.getItem("rubiks-network")
    if (json) {
        console.log('Loading saved network from disc')
        net = new brain.NeuralNetwork().fromJSON(JSON.parse(json));
    } else {
        createNewNet()
    }
}

function createNewNet() {
    console.log('Creating new network')
    net = new brain.NeuralNetwork({ hiddenLayers: [180, 180, 50, 20] }) //{ hiddenLayers: [200, 100, 200, 200, 200] }
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

        if (data.up !== undefined) {
            geometry.faces[4].color = colors[data.up]
            geometry.faces[5].color = colors[data.up]
        }

        if (data.down !== undefined) {
            geometry.faces[6].color = colors[data.down]
            geometry.faces[7].color = colors[data.down]
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

        const defaultData = { front: undefined, left: undefined, right: undefined, down: undefined, back: undefined }
        cube.customData = {...defaultData, ...data}

        cube.cubeIndex = idx

        cubeContainer.add(cube)
        
        return cube
    })
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
        //queue.push("F2")
        queue = scrambles[0].map(x => x)
    }
    if (e.keyCode === 50) {
        //queue.push("R2")
        queue = scrambles[1].map(x => x)
    }
    if (e.keyCode === 51) {
        //queue.push("U2")
    }
    if (e.keyCode === 52) {
        //queue.push("L2")
    }
    if (e.keyCode === 53) {
        //queue.push("B2")
    }
    if (e.keyCode === 54) {
        //queue.push("D2")
    }
    if (e.keyCode === 80) {
        console.log(printCube())
    }
    if (e.keyCode === 65) {
        if (!net) {
            console.log("No net trained yet")
            return
        }
        isAISolving = !isAISolving
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
    if (e.keyCode === 67) { // C
        console.log("Is cube identical to saved:", R.equals(printCube(),comparee))
    }
    if (e.keyCode === 83) {
        console.log("Saving current")
        comparee = printCube()
    }
    if (e.keyCode === 87) {
        console.log("Wiping current network")
        net = null
        localStorage.removeItem("rubiks-network");
        createNewNet()
    }
    if (e.keyCode === 75) {
        setOfPermutations[Math.floor(Math.random() * setOfPermutations.length)].forEach(move => queue.push(move))
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

const trace = msg => R.tap(x => console.log(msg, x))

function removeMiddles(x) {
    return Object.keys(colors).filter(y => x.join("").includes(y)).length > 1
}

function isMesh(x) {
    return x.type === 'Mesh'
}

function printCube() {
    return cubeContainer.children.map(x=>x)
        .sort((a, b) => a.cubeIndex > b.cubeIndex ? 1 : -1)
        .filter(isMesh)
        .map(meshData)
        .filter(removeMiddles)
        .flatMap(x => {
            return x.map(convertColor)
                .map(replaceMinusZero)   
                //.map(shift)
        })
}

function replaceUndefinedWithZero(x) {
    return x === undefined ? 0 : x
}

function shift(x) {
    return parseFloat(((x + 1) / 6).toFixed(2))
}

function unshift(x) {
    return Math.round((x * 6) - 1)
}

function meshData(d) {
    return [d.position.x, d.position.y, d.position.z, d.customData.front, d.customData.right, d.customData.up, d.customData.left, d.customData.back, d.customData.down].map(replaceUndefinedWithZero)
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

function replaceMinusZero(number) {
    return number === -0 ? 0 : number;
}

function inverse(move) {
    if (move.includes("2")) return move

    if (move.includes("'")) return move[0]

    return `${move}'`
}

/**
 * Shuffles array in place. ES6 version
 * @param {Array} a items An array containing the items.
 */
function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function perm(xs) {
  let ret = [];

  for (let i = 0; i < xs.length; i = i + 1) {
    let rest = perm(xs.slice(0, i).concat(xs.slice(i + 1)));

    if(!rest.length) {
      ret.push([xs[i]])
    } else {
      for(let j = 0; j < rest.length; j = j + 1) {
        ret.push([xs[i]].concat(rest[j]))
      }
    }
  }
  return ret;
}

function rotationObject(move) {
    switch (move) {
        case "U":
            return { filter: d => d.position.y === 1, axis: 'y' }
            break;
        case "U'":
            return { filter: d => d.position.y === 1, axis: 'y', reversed: true }
            break;
        case "F":
            return { filter: d => d.position.z === 1, axis: 'z', reversed: true }
            break;
        case "F'":
            return { filter: d => d.position.z === 1, axis: 'z' }
            break;
        case "L":
            return { filter: d => d.position.x === -1, axis: 'x' }
            break;
        case "L'":
            return { filter: d => d.position.x === -1, axis: 'x', reversed: true }
            break;
        case "R":
            return { filter: d => d.position.x === 1, axis: 'x', reversed: true }
            break;
        case "R'":
            return { filter: d => d.position.x === 1, axis: 'x' }
            break;
        case "U":
            return { filter: d => d.position.x === 1, axis: 'x', reversed: true }
            break;
        case "U'":
            return { filter: d => d.position.x === 1, axis: 'x' }
            break;
        case "B":
            return { filter: d => d.position.z === -1, axis: 'z' }
            break;
        case "B'":
            return { filter: d => d.position.z === -1, axis: 'z', reversed: true }
            break;
        case "D":
            return { filter: d => d.position.y === -1, axis: 'y' }
            break;
        case "D'":
            return { filter: d => d.position.y === -1, axis: 'y', reversed: true }
            break;
        case "F2":
            return { filter: d => d.position.z === 1, axis: 'z', reversed: true }
            return { filter: d => d.position.z === 1, axis: 'z', reversed: true }
            break;
        case "R2":
            return { filter: d => d.position.x === 1, axis: 'x', reversed: true }
            return { filter: d => d.position.x === 1, axis: 'x', reversed: true }
            break;
        case "U2":
            return { filter: d => d.position.y === 1, axis: 'y' }
            return { filter: d => d.position.y === 1, axis: 'y' }
            break;
        case "L2":
            return { filter: d => d.position.x === -1, axis: 'x' }
            return { filter: d => d.position.x === -1, axis: 'x' }
            break;
        case "B2":
            return { filter: d => d.position.z === -1, axis: 'z' }
            return { filter: d => d.position.z === -1, axis: 'z' }
            break;
        case "D2":
            return { filter: d => d.position.y === -1, axis: 'y' }
            return { filter: d => d.position.y === -1, axis: 'y' }
            break;

    }
}

function resetRotater() {
    rotater.rotation.x = 0
    rotater.rotation.y = 0
    rotater.rotation.z = 0
}

function rotateColors(rotation, data) {
    const sides = {}

    if (rotation === "U") {
        sides.up = data.up
        sides.down = data.down

        sides.front = data.left
        sides.right = data.front
        sides.back = data.right
        sides.left = data.back
    }

    if (rotation === "U'") {
        sides.up = data.up
        sides.down = data.down

        sides.left = data.front
        sides.front = data.right
        sides.right = data.back
        sides.back = data.left
    }

    if (rotation === "L") {
        sides.right = data.right
        sides.left = data.left

        sides.up = data.back
        sides.front = data.up
        sides.back = data.down
        sides.down = data.front
    }

    if (rotation === "L'") {
        sides.right = data.right
        sides.left = data.left

        sides.up = data.front
        sides.front = data.down
        sides.back = data.up
        sides.down = data.back
    }

    if (rotation === "R") {
        sides.right = data.right
        sides.left = data.left

        sides.back = data.up
        sides.down = data.back
        sides.front = data.down
        sides.up = data.front
    }

    if (rotation === "R'") {
        sides.left = data.left
        sides.right = data.right

        sides.up = data.back
        sides.front = data.up
        sides.down = data.front
        sides.back = data.down
    }

    if (rotation === "D") {
        sides.up = data.up
        sides.down = data.down

        sides.front = data.left
        sides.right = data.front
        sides.back = data.right
        sides.left = data.back
    }

    if (rotation === "D'") {
        sides.up = data.up
        sides.down = data.down

        sides.front = data.right
        sides.left = data.front
        sides.back = data.left
        sides.right = data.back
    }

    if (rotation === "B") {
        sides.front = data.front
        sides.back = data.back

        sides.up = data.right
        sides.left = data.up
        sides.down = data.left
        sides.right = data.down
    }

    if (rotation === "B'") {
        sides.front = data.front
        sides.back = data.back
        
        sides.up = data.left
        sides.right = data.up
        sides.down = data.right
        sides.left = data.down
    }

    return {
        ...sides,
        x: data.x,
        y: data.y,
        z: data.z
    }
}

function rotateSide(move, animation) {
    const { filter, axis, reversed } = rotationObject(move)
    const cubes = rubiks.filter(filter)
    cubes.forEach(cube => rotater.attach(cube))

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
                cubes.forEach(cube => {
                    cubeContainer.attach( cube )
                    const transformation = rotateColors(move, cube.customData)
                    for (value in transformation) {
                        cube.customData[value] = transformation[value]
                    }
                    cube.position.x = Math.round(cube.position.x)
                    cube.position.y = Math.round(cube.position.y)
                    cube.position.z = Math.round(cube.position.z)
                })
                resetRotater()
                isAnimating = false
            })
            .start();
    } else {
        rotater.rotation[axis] = Math.PI / 2 * (reversed ? -1 : 1)
        cubes.forEach(cube => {
            cubeContainer.attach( cube );
            const transformation = rotateColors(move, cube.customData)
            for (value in transformation) {
                cube.customData[value] = transformation[value]
            }
            cube.position.x = Math.round(cube.position.x)
            cube.position.y = Math.round(cube.position.y)
            cube.position.z = Math.round(cube.position.z)
        })
        resetRotater()
    }
}

function trainNetwork() {
    const trainingData = []

    console.log('Creating test data')
    
    function addMove(move) {
        const inverseMove = inverse(move)
        rotateSide(move, false)
        const currentCube = printCube()

        const duplicates = trainingData.filter(x => R.equals(x, currentCube))

        if (duplicates.length === 0) {
            trainingData.push({
                input: currentCube,
                output: { [inverseMove]: 1 }
            })
        } else {
            console.log('Ive seen this before, skipping', currentCube)
        }
    }

    // Full sequences
    //for (var i = 0; i < 200; i++) {
        
    //    resetCube()
        
    //    const shuff = shuffle(moves)

    //    shuff.map(addMove)

        /*let sequence = []
        let lastMove = ""

        // Moves in each sequence
        for (var j = 0; j < 10; j++) {
            let rand, move
            do {
                rand = Math.floor(Math.random() * moves.length)
                move = moves[rand]
            } while(lastMove === inverse(move))

            sequence.push(move)
            lastMove = move

            addMove(move)
        }*/
    //}

    setOfPermutations.forEach(sequence => {
        resetCube()

        sequence.forEach(addMove)
    })

    scrambles.forEach(sequence => {
        resetCube()

        sequence.forEach(addMove)

    })

    window.trainingData = trainingData

    console.log('Begin training...')

    const config = {
        log: true,
        logPeriod: 10,
        errorThresh: 0.0001,
        //errorThresh: 0.005,
        learningRate: 0.9999,
        //binaryThresh: 0.5,
        //activation: 'leaky-relu',
        //leakyReluAlpha: 0.01,
    }
    const result = net.train(trainingData, config)

    try {
        localStorage.setItem("rubiks-network", JSON.stringify(net.toJSON()));
        console.log('Saving network to disc...')
    } catch(e) {
        console.log('Unable to save network', e)
    }

    console.log('Training result complete:', result)
}

function pickHighest(data) {
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
    requestAnimationFrame( animate );

    if (isAISolving && R.equals(printCube(),comparee)) {
        console.log("Solved")
        resetCube()
        isAISolving = false
        isAnimating = false
        queue = []
        return
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
setupNet()
createCube();
comparee = printCube()
animate();

