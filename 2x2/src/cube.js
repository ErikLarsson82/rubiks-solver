const {
    createCube,
    right,
    rightPrim,
    left,
    leftPrim,
    up,
    upPrim,
    down,
    downPrim,
    front,
    frontPrim,
    back,
    backPrim,
    persist,
    compare,
    binary,
    binaryStr,
    scrambleCube,
    moveFuncs,
    invertMove,
    invertSequence,
    randomAgent,
    moves,
    scrambles,
    isSame,
    positions,
    correctCubit
} = require('../common')

const { sort } = require('ramda')

const ANIMATIONS_ENABLED = true
const RENDER_SCENE = false
const ATTEMPT_THRESHOLD = 2000
const HIQ_COLORS = true
const ROTATION_ENABLED = false
const MOVES = 12

let AUTOPLAY_SOLVES = false
let SPEED_MODE = true

var loader = new THREE.GLTFLoader();

const scene = new THREE.Scene()
scene.background = new THREE.Color(27/255,25/255,25/255)
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 )
camera.position.z = 6

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize( window.innerWidth, window.innerHeight )
document.body.appendChild( renderer.domElement )

let cubeContainer, rotater, cube, cubits, isAnimating, queue, nextScrambleSequence, state, 
	net, attempts, timer, animationScrambles, selectedIndex, callback, scramble, solve, visitedSteps

const rotate = [0,0]
const speed = 0.04
const protrusion = 0.1
const baseSize = 0.97
const sideSize = 0.85

const colorRef = {
    EMPTY: new THREE.Color(0,0,0),
    WHITE: new THREE.Color(1,1,1),
    GREEN: new THREE.Color(0,1,0),
    RED: HIQ_COLORS ? new THREE.Color(225/255,22/255,124/255) : new THREE.Color(1,0,0),
    BLUE: HIQ_COLORS ? new THREE.Color(100/255,22/255,225/255) : new THREE.Color(0,0,1),
    YELLOW: HIQ_COLORS ? new THREE.Color(0,0,0) : new THREE.Color(1,1,0),
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

    createScene()

    cubeContainer = new THREE.Object3D()
    scene.add(cubeContainer)

    cubeContainer.rotation.x = 0.51
    cubeContainer.rotation.y = -0.63
    
    resetCube()

    if (AUTOPLAY_SOLVES) {
        startShowcase()
    } else {
        animate()
    }
    
}

function resetCube() {
    userQueue = []

    scramble = []
    solve = []

    queue = []
    animationScrambles = []

    selectedIndex = null

    isAnimating = false 

    cube = createCube()
    originalCubeBinaryString = binaryStr(cube)

    renderCube()
}

function startShowcase() {
    timer = 0
    nextScrambleSequence = 0
    return loadNet().then(() => {
        setState('SOLVING')
    })
}

function loadNet() {
    const dir = 'training-data'
    const trainingfile = `${dir}/training.json` //`${dir}/janne-joffert-mkvi.json`
    return d3.json(trainingfile).then(data => 
    	net = new brain.NeuralNetwork(data['hyper-parameters']["BRAIN_CONFIG"]).fromJSON(data.net)
    )

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

    window.dispatchEvent(new CustomEvent("cube-object", { detail: { cube: [...cube] }}))
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

function rotateSide(move, speed = 700) {    
    if (!ANIMATIONS_ENABLED) {
        cube = moveFuncs[move](cube)
    } else {
        if (isAnimating) return

        isAnimating = true

        const getPosition = cubit => cube.find(rawCubeData => rawCubeData.id === cubit.customId).position

        cubits.filter(cubit => positions[move].includes(getPosition(cubit)))
            .forEach(cubit => rotater.attach(cubit))

        const direction = ["F", "R", "U", "B'", "L'", "D'"].includes(move) ? -1 : 1
        const rotation = { value: 0 }
        const tween = new TWEEN.Tween(rotation)
            .to({ value: Math.PI / 2 * direction }, speed)
            .onUpdate(() => {
                if (["R", "R'", "L", "L'"].includes(move)) {
                    rotater.rotation.x = rotation.value
                }
                if (["F", "F'", "B", "B'"].includes(move)) {
                    rotater.rotation.z = rotation.value
                }
                if (["U", "U'", "D", "D'"].includes(move)) {
                    rotater.rotation.y = rotation.value
                }
            })
            .onComplete(() => {
                cube = moveFuncs[move](cube)
                renderCube()
                isAnimating = false                
            })
            .start()
    }
}

function keydown(e) {
	if (e.keyCode === 37 && !e.shiftKey) { //left
        rotate[1] = -speed
    }
    if (e.keyCode === 39 && !e.shiftKey) { //right
        rotate[1] = speed
    }
    if (e.keyCode === 38) {
        rotate[0] = -speed
    }
    if (e.keyCode === 40) {
        rotate[0] = speed
    }
    if (e.keyCode === 82 && !e.shiftKey) {
        userQueue.push("R")
    }
    if (e.keyCode === 82 && e.shiftKey) {
        userQueue.push("R'")
    }
    if (e.keyCode === 76 && !e.shiftKey) {
        userQueue.push("L")
    }
    if (e.keyCode === 76 && e.shiftKey) {
        userQueue.push("L'")
    }
    if (e.keyCode === 70 && !e.shiftKey) {
        userQueue.push("F")
    }
    if (e.keyCode === 70 && e.shiftKey) {
        userQueue.push("F'")
    }
    if (e.keyCode === 66 && !e.shiftKey) {
        userQueue.push("B")
    }
    if (e.keyCode === 66 && e.shiftKey) {
        userQueue.push("B'")
    }
    if (e.keyCode === 68 && !e.shiftKey) {
        userQueue.push("D")
    }
    if (e.keyCode === 68 && e.shiftKey) {
        userQueue.push("D'")
    }
    if (e.keyCode === 85 && !e.shiftKey) {
        userQueue.push("U")
    }
    if (e.keyCode === 85 && e.shiftKey) {
        userQueue.push("U'")
    }
    if (e.keyCode === 80) {
        console.log(persist(cube))
    }
    if (e.keyCode === 67) {
        console.log(compare(cube))
    }
    if (e.keyCode === 49) { // 1
        binaryStr(cube)
    }
    if (e.keyCode === 50) { // 2
        binary(cube)
    }
    if (e.keyCode === 37 && e.shiftKey) { // left
        if (selectedIndex < 0) {
            selectedIndex = scrambles.length
        } else if (selectedIndex === null) {
            selectedIndex = nextScrambleSequence--
        } else {
            selectedIndex--
        }   
        renderIcons()
    }
    if (e.keyCode === 39 && e.shiftKey) { // right
        if (selectedIndex > scrambles.length) {
            selectedIndex = 0
        } else if (selectedIndex === null) {
            selectedIndex = nextScrambleSequence++
        } else {
            selectedIndex++
        }
        renderIcons()
    }
    /*if (e.keyCode === 13) {
        nextScrambleSequence = selectedIndex
        selectedIndex = null
        setState('SCRAMBLE')
    }*/
}

function keyup(e) {
    if (e.keyCode === 37 || e.keyCode === 39) {
        rotate[1] = 0
    }
    if (e.keyCode === 38 || e.keyCode === 40) {
        rotate[0] = 0
    }
}

function initKeypress() {
	window.addEventListener('keydown', keydown)
    window.addEventListener('keyup', keyup) 
}

function cleanupKeypress() {
    window.removeEventListener('keydown', keydown)
    window.removeEventListener('keyup', keyup) 
}

function animate(time) {
    requestAnimationFrame( animate )
    TWEEN.update( time )

    autoPlay()

    if(userQueue.length > 0 && !isAnimating) {
        const popped = userQueue.shift()
        rotateSide(popped)
        scramble.push(popped)
    }

    if (ROTATION_ENABLED) cubeContainer.rotation.y += 0.001

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

    if (state === 'READY') {
        animateReady()
        return
    }
    if (state === 'SCRAMBLE') {
        animateScramble()
        return
    }
    if (state === 'SOLVING') {
        animateSolving()
        return
    }
    if (state === 'FINISHED' || state === 'FAILED') {
        animateEnd()
        return
    }
}

function renderIcons() {
    let str = ""
    
    for (var i = 0; i < animationScrambles.length; i++) {
        if (i === selectedIndex) {
            str += `<img src='images/selected.png' width='14' height='14'>`
        } else {
            str += `<img src='images/${ animationScrambles[i] }.png' width='14' height='14'>`
        }
    }

    document.getElementById('label-dots').innerHTML = str
}

function setState(s) {
    state = s
    if (s === 'SCRAMBLE') {
        cube = createCube()
        document.getElementById('help-text').innerHTML = "Scrambling"
        document.getElementById('help-text').className = "label-text scrambling"
        queue = new Array(MOVES).fill().map(randomAgent)
        document.getElementById('scramble-info-box').innerHTML += "<p>" + queue + "</p>"
        animationScrambles.push('empty') 
    }
    if (s === 'SOLVING') {
        attempts = 0
        document.getElementById('help-text').innerHTML = "Solving"
        document.getElementById('help-text').className = "label-text solving"
    }
    if (s === 'FINISHED') {
        timer = SPEED_MODE ? 1 : 120
        animationScrambles[animationScrambles.length-1] = 'check' 
        document.getElementById('help-text').innerHTML = `Solve ${animationScrambles.length-1} successful`
        document.getElementById('help-text').className = "label-text success"
    }
    if (s === 'FAILED') {
        timer = SPEED_MODE ? 1 : 120
        animationScrambles[animationScrambles.length-1] = 'cross' 
        document.getElementById('help-text').innerHTML = `Solve ${animationScrambles.length-1} failed...`
        document.getElementById('help-text').className = "label-text failed"
    }
    if (s === 'READY') {
        timer = SPEED_MODE ? 1 : 200 
        document.getElementById('help-text').innerHTML = `Ready to solve ${animationScrambles.length-1}`
        document.getElementById('help-text').className = "label-text ready"
    }
    renderIcons()
}

function animateSolving() {
    attempts++
    if (binaryStr(cube) === binaryStr(createCube())) {
        setState('FINISHED')
        callback({ scramble: scramble, solve: solve, correct: true, key: Math.random() })
        return
    } else if (attempts > ATTEMPT_THRESHOLD) {
        setState('FAILED')
        callback({ scramble: scramble, solve: solve, correct: false, key: Math.random() })
        return
    }
    
    let policy, hasSeen

	const policyDistribution = net.run(binary(cube))
	const sortedPolicyDistribution = sortedPairs(policyDistribution)

    do {
    	policy = sortedPolicyDistribution.shift().policy
    	
    	hasSeen = hasSeenIt(binaryStr(cube), policy)

    } while (hasSeen && policy !== undefined) 

    visitedSteps.push({
		cubeStr: binaryStr(cube),
		policy: policy
	})    	

    rotateSide(policy, SPEED_MODE ? 35 : 1000)
    solve.push(policy)
}

function hasSeenIt(cubeStr, policy) {
	return visitedSteps.find(x => x.cubeStr === cubeStr && x.policy === policy) !== undefined
}

function rankedPolicies(arr) {
  let copy = [...arr].sort()
  return arr.map(x => copy.findIndex(y => y === x))
}

function sortedPairs(arr) {
	return sort((a,b) => a.value > b.value ? -1 : 1, Object.values(arr).map((x, i) => ({ policy: Object.keys(arr)[i], value: x })))
} 


function animateScramble() {
    if (queue.length === 0) {
        setState('READY')
        return
    }

    const move = queue.shift()
    rotateSide(move, SPEED_MODE ? 1 : 70)
}

function animateEnd() {
    timer--

    if (timer < 0) {
        //setState('SCRAMBLE')
    }
}

function animateReady() {
    timer--

    if (timer < 0) {
        setState('SOLVING')
    }
}

function randomShowcase(_callback) {
	visitedSteps = []
    AUTOPLAY_SOLVES = true;
    callback = _callback
    
    startShowcase().then(() => {
        hideAll();
        document.getElementById('popup1').style.visibility = "visible";
    })
}

function abortShowcase() {
    AUTOPLAY_SOLVES = false;
    hideAll();
    document.getElementById('popup2').style.visibility = "visible";
}

function hideAll() {
    document.getElementById('popup1').style.visibility = "hidden";  
    document.getElementById('popup2').style.visibility = "hidden";  
}

module.exports = {
    init,
    initKeypress,
    cleanupKeypress,
    randomShowcase,
    resetCube
}