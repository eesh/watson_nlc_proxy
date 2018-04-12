const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const fs = require('fs')
const bb = require('express-busboy')

// WATSON SERVER
let watson_routes = require('./watson_routes')
let WATSON_SERVER_PORT = 3477
let watson_app = express()
watson_app.use(cors())
watson_app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }))
watson_app.use(bodyParser.json())

bb.extend(watson_app, {
  upload: true
})

watson_routes(watson_app)

module.exports = watson_app
