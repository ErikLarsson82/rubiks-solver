const originalCube = [
    //Yellow side
    { x: 0, y: 1, z: 0, up: 'yellow' }, //Center
    { x: 1, y: 1, z: 0, up: 'yellow', right: 'orange' },
    { x: -1, y: 1, z: 0, up: 'yellow', left: 'red' },
    { x: 0, y: 1, z: -1, up: 'yellow', back: 'blue' },
    { x: 0, y: 1, z: 1, up: 'yellow', front: 'green' },
    //Corners
    { x: -1, y: 1, z: 1, up: 'yellow', front: 'green', left: 'red' },
    { x: 1, y: 1, z: 1, up: 'yellow', front: 'green', right: 'orange' },
    { x: -1, y: 1, z: -1, up: 'yellow', left: 'red', back: 'blue' },
    { x: 1, y: 1, z: -1, up: 'yellow', right: 'orange', back: 'blue' },

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
    { x: 0, y: -1, z: 0, down: 'white' }, //Center
    { x: 1, y: -1, z: 0, down: 'white', right: 'orange' },
    { x: -1, y: -1, z: 0, down: 'white', left: 'red' },
    { x: 0, y: -1, z: -1, down: 'white', back: 'blue' },
    { x: 0, y: -1, z: 1, down: 'white', front: 'green' },

    //Corners
    { x: -1, y: -1, z: 1, down: 'white', front: 'green', left: 'red' },
    { x: 1, y: -1, z: 1, down: 'white', front: 'green', right: 'orange' },
    { x: -1, y: -1, z: -1, down: 'white', left: 'red', back: 'blue' },
    { x: 1, y: -1, z: -1, down: 'white', right: 'orange', back: 'blue' },
]