import React, { useState, useEffect, useCallback, useRef } from "react";
import ReactDOM from "react-dom";
import { makeStyles, createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import purple from '@material-ui/core/colors/purple';
import green from '@material-ui/core/colors/green';
import { init as initCube, initKeypress, cleanupKeypress, randomShowcase as startAISolve, resetCube } from './cube';
import { binary, createCube, correctCubit } from '../common';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';


const useStyles = makeStyles((theme) => ({
  root: {
    '& button': {
      position: 'absolute',
      left: 'calc(50% - 100px)',
      width: '200px',
      top: '80%'
  }
  },
}));

const theme = createMuiTheme({
  palette: {
    primary: {
      main: purple[500],
    },
    secondary: {
      main: '#00ff00',
    },
  },
});






const DELAY = 200

const delay = f => () => setTimeout(f, DELAY)

const App = () => {

    const [view, setView] = useState("Welcome")
    const [solves, setSolves] = useState([])
    const [showJanne, setShowJanne] = useState(true)

    useEffect(() => initCube(), [])

    let content
    switch(view) {
        case "Welcome":
            content = <Welcome setView={setView} />
            break;
        case "ScrambleInstructions":
            content = <ScrambleInstructions setView={setView} showJanne={showJanne} setShowJanne={setShowJanne} />
            break;
        case "PrepareToSolve":
            content = <PrepareToSolve setView={setView} />
            break;
        case "Solving":
            content = <Solving setView={setView} addSolve={ item => setSolves(solves => solves.concat(item))} />
            break;
        case "Result":
            content = <Result setView={setView} solves={solves} />
            break;
    }

    return (
        <div>
            <ThemeProvider theme={theme}>
                { !showJanne && <SolveList solves={ solves } /> }
                { content }
                <Canvas />
            </ThemeProvider>
        </div>
    )
}








const Canvas = () => {
    const canvasRef = useRef()
    const canvasHiddenRef = useRef()
    const latestCube = useRef()

    const [open, setOpen] = useState(false)
    const [showCorrect, setShowCorrect] = useState(true)

    const renderCanvas = e => {
        if (e) {
            latestCube.current = e.detail.cube
        }
        if (!latestCube.current) return
        const cube = latestCube.current 
        const binaryCube = binary(cube)

        if (!canvasHiddenRef.current) return

        const contextHidden = canvasHiddenRef.current.getContext('2d')
        
        const myImageData = contextHidden.createImageData(6, 80)
        var data = myImageData.data;

        const colors = {
            'off-correct': [0, 115, 0, 255],
            'off-incorrect': [140, 12, 76, 255],
            'on-correct': [0, 255, 0, 255],
            'on-incorrect': [225, 22, 124, 255]
        }
        const cubitIndex = i => Math.floor(i / 60)
        const correctCubits = new Array(8).fill().map((x, i) => correctCubit(cube, i))  

        for (var i = 0; i < data.length; i += 4) {
            const cubeIndex = i / 4
            const correct = correctCubits[cubitIndex(cubeIndex)]
            const on = binaryCube[cubeIndex] === 0
            const color = colors[`${on ? 'on' : 'off'}-${correct && showCorrect ? 'correct' : 'incorrect'}`]
            data[i]     = color[0]
            data[i + 1] = color[1]
            data[i + 2] = color[2]
            data[i + 3] = color[3]
        }

        contextHidden.putImageData(myImageData, 0, 0)

        
        var imageObject=new Image();
        imageObject.onload=function(){
            
            if (!canvasRef.current) return
            const contextScaledVisible = canvasRef.current.getContext('2d')

            contextScaledVisible.imageSmoothingEnabled = false;
            
            contextScaledVisible.save()
            contextScaledVisible.clearRect(0,0,canvasRef.current.width,canvasRef.current.height);
            contextScaledVisible.scale(10,10);
            contextScaledVisible.drawImage(imageObject,0,0);
            contextScaledVisible.restore()
            
        }
        imageObject.src=canvasHiddenRef.current.toDataURL();
    }

    const callback = useCallback(renderCanvas)

    useEffect(() => {
        window.addEventListener('cube-object', callback)
        return () => window.removeEventListener('cube-object', callback)
    }, [callback])

    useEffect(() => renderCanvas(), [showCorrect])

    return (
        <div id="canvas-container">
            <div style={ { display: 'flex', justifyContent: 'space-between', width: '100%' } }>
                { open && showCorrect && <CheckBoxIcon onClick={() => setShowCorrect(false) } /> }
                { open && !showCorrect && <CheckBoxOutlineBlankIcon onClick={() => setShowCorrect(true) } /> }
                {
                    open
                        ? <ArrowDropUpIcon onClick={() => setOpen(false)} />
                        : <ArrowDropDownIcon onClick={() => setOpen(true)} />
                }
            </div>
            <canvas id="canvas" ref={canvasRef} width="60" height="800" style={ { display: open ? 'inherit' : 'none' } } />
            <canvas id="hidden-canvas" ref={canvasHiddenRef} width="6" height="80" style={ { display: 'none' }} />
        </div>
    )
}















const SolveList = ({ solves }) => {

    const SIZE = 10

    return (
        <div id="solve-list">
            <div>
                <span>Scramble</span>
                <span>Solve</span>
                <span>Success rate <Percent solves={solves} /></span>
            </div>
            { solves.length === 0 && (
                <div>
                    <span>-</span>
                    <span>-</span>
                    <span>-</span>
                </div>
            )}
            { 
                [...solves].reverse().slice(0,SIZE).map(({ scramble = [], solve = [], correct, key }) => (
                    <div key={key} className="fade-row">
                        <span alt={ scramble.join(', ')}>{ scramble.slice(0, 6).join(', ') } { scramble.length > 6 && `.. (${scramble.length})`}</span>
                        <span alt={ solve.join(', ')}>{ solve.slice(0, 6).join(', ') } { solve.length > 6 && `.. (${solve.length})` }</span>
                        <span>{ correct ? "✅" : "❌" }</span>
                    </div>
                ))
            }
            { solves.length > SIZE && <div style={{ width: '100%', textAlign: 'center' }}>...</div> }
        </div>
    )
}











const Percent = ({solves}) => {
    return solves.length > 0 && `${(100 * solves.filter(x => x.correct).length / solves.length).toFixed(1)}%`
}














const Welcome = ({ setView }) => {
    const classes = useStyles();

    const callback = useCallback(e => e.keyCode === 13 && setView('ScrambleInstructions'))

    useEffect(() => {
        window.addEventListener('keydown', callback)
        return () => window.removeEventListener('keydown', callback)
    }, [callback])

    return (
        <div className={classes.root}>
            <h1>🤔 Utmana Eriks AI 🤖</h1>
            <Button variant="contained" color="secondary" onClick={ delay(() => setView('ScrambleInstructions')) }>Enter</Button>
        </div>
    )
}












const ScrambleInstructions = ({ setView, showJanne, setShowJanne }) => {
    const classes = useStyles();

    const [showButton, setShowButton] = useState(false)
    
    useEffect(() => {
        initKeypress()
        
        return () => {
            cleanupKeypress()
        }
    }, [])

    const callback = () => {
        if (showJanne) {
            setShowJanne(false)
            setView('PrepareToSolve')
        } else {
            setView('Solving')
        }
    }

    const keyCallback = useCallback(e => {
        e.keyCode === 13 && callback()

        setShowButton(true)
    })

    useEffect(() => {
        window.addEventListener('keydown', keyCallback)
        return () => window.removeEventListener('keydown', keyCallback)
    }, [keyCallback])



    return (
        <div className={classes.root}>
            <h1>Blanda kuben 🍳</h1>
            <h2>F, B, U, D, L, R + Shift</h2>
            { showButton && <Button variant="contained" color="primary" onClick={ delay(callback) }>Blandning färdig</Button> }
        </div>
    )
}












const PrepareToSolve = ({ setView }) => {
    const classes = useStyles();

    const callback = useCallback(e => e.keyCode === 13 && setView('Solving'))

    useEffect(() => {
        window.addEventListener('keydown', callback)
        return () => window.removeEventListener('keydown', callback)
    }, [callback])

    return (
        <div className={classes.root}>
            <h1 style={ { fontSize: '65px' } }>Nu ska Janne Mk-XI lösa kuben 🧩</h1>
            <div id="network-info">
                <img src="https://robohash.org/24.218.243.24.png" width="100px" /><br/>
                Name: <span style={{color: '#E1167C', fontWeight: 'bold'}}>Janne Joffert Mark-XI</span><br />
                Training time: 12h<br />
                Experience bank: 120 000<br />
                Estimated solve percentage: 30%<br />
                Library used: brain.js <img id="brain-js" src="../logos/brain.png" /><br />
                <code>
                    Moves&nbsp;RateX&nbsp;RateY&nbsp;&nbsp;Random<br />
                    1&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;65%&nbsp;&nbsp;&nbsp;100%&nbsp;&nbsp;&nbsp;11%<br />
                    2&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;47%&nbsp;&nbsp;&nbsp;96%&nbsp;&nbsp;&nbsp;&nbsp;2%<br />
                    3&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;35%&nbsp;&nbsp;&nbsp;94%<br />
                    6&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;12%&nbsp;&nbsp;&nbsp;75%<br />
                    8&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;10%&nbsp;&nbsp;&nbsp;67%<br />
                    12&nbsp;&nbsp;&nbsp;&nbsp;3%&nbsp;&nbsp;&nbsp;&nbsp;45%
                </code><br />
                Network architecture:<br />
                <img id="feed" src="feed-smaller.png" /><br />
            </div>
            <Button variant="contained" color="primary" onClick={ delay(() => setView('Solving')) }>Starta</Button>
        </div>
    )
}











const Solving = ({ setView, addSolve }) => {

    startAISolve(data => {
        setView("Result")
        addSolve(data)
    })

    return (
        <h1>Löser kuben... 🕒</h1>
    )

}












const Result = ({ setView, solves }) => {

    const classes = useStyles();

    const restart = () => {
        setView('ScrambleInstructions')
        resetCube()
    }

    const callback = useCallback(event => {
        setView('ScrambleInstructions')
        resetCube()
    }, [])

    useEffect(() => {
        window.addEventListener('keydown', callback)

        return () => window.removeEventListener('keydown', callback)
    }, [callback])

    if (solves.length === 0) return null

    const { correct } = solves[solves.length-1]
    
    return (
        <div className={classes.root}>
            <h1>Resultat 📄</h1>
            <h2 style={ { color: correct ? 'green' : 'red' } }>{ correct ? 'LYCKAD' : 'MISSLYCKAD' }</h2>
            <Button variant="contained" color="secondary" onClick={ delay(restart) }>Starta om</Button>
            <Button style={ { display: 'none', marginTop: '40px' } } variant="contained" color="primary" onClick={ delay(() => setView('Solving')) }>Spela upp igen</Button>
        </div>
    )
}









ReactDOM.render(<App/>, document.getElementById("root"));