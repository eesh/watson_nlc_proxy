let express = require('express')
let bodyParser = require('body-parser')
let cors = require('cors')
let routes = require('./twitter_routes')

let app = express()
app.use(cors())
app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }))
app.use(bodyParser.json())

let SERVER_PORT = 4794

routes(app)

module.exports = app
