require('dotenv').config()
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
    ws.send('Ping')
    return res.send('Received a POST HTTP method');
  }
})


app.use(express.static('./'))
app.use('/2x2', express.static(path.join(__dirname, '2x2')))

app.get('/ping', wrapper);

app.listen(PORT, () => console.log(`Rubiks 2x2 server solution started at ${PORT}`))