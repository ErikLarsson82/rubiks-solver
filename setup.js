const originalCube = [
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