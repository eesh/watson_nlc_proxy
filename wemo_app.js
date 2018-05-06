var express = require('express')
var app = express();
var cors = require('cors');
var routes = require('./wemo_routes')


app.use(cors())
routes(app)

module.exports = app
