const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const mongoose = require('mongoose')
const fs = require('fs')

// ALEXA SERVER
let alexa_routes = require('./alexa_routes')
let alexa_app = express()
alexa_app.use(cors());
alexa_app.use(bodyParser.urlencoded({ extended : false }))
alexa_app.use(bodyParser.json())

alexa_routes(alexa_app)

mongoose.connect('mongodb://localhost:27017/alexaPC')
module.exports = alexa_app
