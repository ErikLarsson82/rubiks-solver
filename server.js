console.log('\n\n\x1b[4m\x1b[35mserver.js\x1b[0m')

require('dotenv').config()
const ProgressBar = require('progress')
const WS_PORT = (process.env.WS_PORT && parseInt(process.env.WS_PORT)) || 8080;
const PORT = (process.env.PORT && parseInt(process.env.PORT)) || 5000;

const express = require('express')
const path = require('path')
const WebSocket = require('ws')
 
const wss = new WebSocket.Server({ port: WS_PORT })
const app = express()

let pinger = (req, res) => {
  return res.send('No connections yet')
}

function wrapper(req, res) {
  pinger(req, res)
} 

wss.on('connection', ws => {
  console.log('Listening to Websocket on port', WS_PORT)
  ws.on('message', message => {
    console.log(`Received message => ${message}`)
  })
  ws.send('Hello! Message From Server!!')

  pinger = (req, res) => {
    console.log('Ping API called - notifying all websocket connections')
    ws.send('Ping')
    return res.send('Received a POST HTTP method');
  }
})

app.get('/', function (req, res) {
  res.redirect('./2x2/3d-cube.html')
})

app.use(express.static('./'))
app.use('/2x2', express.static(path.join(__dirname, '2x2')))
app.use('/2x2/brains', express.static(path.join(__dirname, '2x2/brains')))

app.get('/ping', wrapper);

function callback() {
  console.log(`Rubiks 2x2 server solution`)
  console.log(`Websocket port  : ${WS_PORT}`)
  console.log(`HTTP port       : ${PORT}`)

  if (process.argv[3] === 'run-trainer') {
    runTrainer()
  } else {
    console.log('No option to run training suite found - you need to run it manually')
  }
}

app.listen(PORT, callback)

function runTrainer() {
  console.log('Running training suite')

  // dirty hack to prevent progress bar rendering bug
  var tty = require('tty').WriteStream.prototype;
  Object.getOwnPropertyNames(tty).forEach(function (key) {
    process.stderr[key] = tty[key];
  })
  process.stderr.columns = 80; // almost all terminals have at least 80 columns

  // Start the suite
  require('./2x2/suite.js')  
}