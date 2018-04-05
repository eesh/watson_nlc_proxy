const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const mongoose = require('mongoose')
const fs = require('fs')
const config = require('./config')

var options = {
  ca: fs.readFileSync(config.sslCA),
  key: fs.readFileSync(config.sslKeyPath),
  cert: fs.readFileSync(config.sslCertPath)
}

// WATSON SERVER
let watson_routes = require('./watson_routes')
let WATSON_SERVER_PORT = 3477
let watson_app = express()
watson_app.use(cors())
watson_app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }))
watson_app.use(bodyParser.json())

watson_routes(watson_app)

let watson_server = require('https').createServer(options, watson_app);

watson_server.listen(WATSON_SERVER_PORT, function() {
  console.log(`Watson server running on port ${WATSON_SERVER_PORT}`)
})

// Uncomment below to enable HTTPS
// let watson_server = require('https').createServer(options, watson_app);
// watson_server.listen(WATSON_SERVER_PORT, () => {
//   console.log(`Watson server running on port ${WATSON_SERVER_PORT}`)
// })


// ALEXA SERVER
const socketManager = require('./socketManager')
let ALEXA_HTTP_PORT = 6456
let alexa_routes = require('./alexa_routes')
let alexa_app = express()
alexa_app.use(cors());
alexa_app.use(bodyParser.urlencoded({ extended : false }))
alexa_app.use(bodyParser.json())

alexa_routes(alexa_app)

mongoose.connect('mongodb://localhost:27017/alexaPC')
var alexa_server = require('https').createServer(options, alexa_app);
socketManager.initialize(alexa_server)
alexa_server.listen(ALEXA_HTTP_PORT, () => {
  console.log(`Alexa server running on port ${ALEXA_HTTP_PORT}`)
})
