import React, { useState, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import { makeStyles, createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import purple from '@material-ui/core/colors/purple';
import green from '@material-ui/core/colors/green';
import { init as initCube, initKeypress, cleanupKeypress, randomShowcase as startAISolve, resetCube } from './cube';

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
            </ThemeProvider>
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
    
    initKeypress()

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

    useEffect(() => {
        return () => {
            cleanupKeypress()
        }
    }, [])

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
                Library used: brain.js <img id="brain-js" src="../logos/brain.PNG" /><br />
                Network architecture:<br />
                <img id="feed" src="feed-smaller.PNG" /><br />
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