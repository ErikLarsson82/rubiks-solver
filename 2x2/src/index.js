import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

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

const App = () => {

    const [view, setView] = useState("Welcome")
    const [solves, setSolves] = useState([])

    let content
    switch(view) {
        case "Welcome":
            content = <Welcome setView={setView} />
            break;
        case "ScrambleInstructions":
            content = <ScrambleInstructions setView={setView} />
            break;
        case "PrepareToSolve":
            content = <PrepareToSolve setView={setView} />
            break;
        case "Solving":
            content = <Solving setView={setView} setSolves={setSolves} />
            break;
    }

    return (
        <div>
            <SolveList solves={ solves } />
            { content }
        </div>
    )
}

const SolveList = ({ solves }) => (
    <div id="solve-list">
        { solves.map(({ scramble, solve, correct }) => <span>Scramble: { scramble.join(', ') } - Solve: { solve.join(', ') } { correct ? "✅" : "❌" }</span>)}
    </div>
)

const Welcome = ({ setView }) => {
    const classes = useStyles();
    return (
        <div className={classes.root}>
            <h1>🤔 Utmana Eriks AI 🤖</h1>
            <Button variant="contained" color="primary" onClick={ () => setView('ScrambleInstructions') }>Börja</Button>
        </div>
    )
}

const ScrambleInstructions = ({ setView }) => {
    const classes = useStyles();
    return (
        <div className={classes.root}>
            <h1>Blanda kuben 🍳</h1>
            <h2>F, B, U, D, L, R + Shift</h2>
            <Button variant="contained" color="primary" onClick={ () => setView('PrepareToSolve') }>Klar</Button>
        </div>
    )
}

const PrepareToSolve = ({ setView }) => {
    const classes = useStyles();
    return (
        <div className={classes.root}>
            <h1 style={ { 'font-size': '65px' } }>Nu ska Janne Mk-XI lösa kuben 🧩</h1>
            <div id="network-info">
                <img src="https://robohash.org/24.218.243.24.png" width="100px" /><br />
                Name: Janne Joffert Mark-XI<br />
                Network architecture: 400 inputs, 200 fully connected hidden layer, 12 outputs<br />
                Training time: 12h<br />
                Experience bank: 120 000<br />
                Estimated solve percentage: 30%<br />
                Library used: brain.js<br />
                <img src="../logos/brain.PNG" width="50px" /><br />
            </div>
            <Button variant="contained" color="primary" onClick={ () => setView('Solving') }>Starta</Button>
        </div>
    )
}

const Solving = ({ setView, addSolve }) => {

    const [show, setShow] = useState(false)

    useEffect(() => {
        setTimeout(() => {
            if (show === false) {
                setShow(true)
                addSolve({ scramble: []})
            }
        }, 3000)
    }, [show])

    return (
        <div>
            <h1 onClick={ () => setView("Welcome") }>Löser kuben...</h1>
            {
                show && (
                    <React.Fragment>
                        <Button variant="contained" color="primary" onClick={ () => setView('Welcome') }>Starta om</Button>
                        <Button variant="contained" color="primary" onClick={ () => setShow(false) }>Spela upp igen</Button>
                    </React.Fragment>
                )
            }
        </div>
    )
}

ReactDOM.render(<App/>, document.getElementById("root"));