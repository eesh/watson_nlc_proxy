const fs = require('fs')
const watson_app = require('./watson_app')
const alexa_app = require('./alexa_app')
const twitter_app = require('./twitter_app')
const https = require('https')
const socketManager = require('./socketManager')
const args = require('minimist')(process.argv.slice(2))

let WATSON_HTTP_PORT = 3477
let ALEXA_HTTP_PORT = 6456
let TWITTER_HTTP_PORT = 3276


if(args.http == true) {

  watson_app.listen(WATSON_HTTP_PORT, function() {
    console.log(`Watson server running on port ${WATSON_HTTP_PORT}`)
  })

  alexa_app.listen(ALEXA_HTTP_PORT, () => {
    console.log(`Alexa server running on port ${ALEXA_HTTP_PORT}`)
  })


  twitter_app.listen(TWITTER_HTTP_PORT, () => {
    console.log(`Twitter server running on port ${TWITTER_HTTP_PORT}`)
  })
} else {


  const config = require('./config')

  var options = {
    ca: fs.readFileSync(config.sslCA),
    key: fs.readFileSync(config.sslKeyPath),
    cert: fs.readFileSync(config.sslCertPath)
  }

  var watson_server = https.createServer(options, watson_app)
  watson_server.listen(WATSON_HTTP_PORT, function() {
    console.log(`Watson server running on port ${WATSON_HTTP_PORT}`)
  })

  var alexa_server = require('https').createServer(options, alexa_app);
  socketManager.initialize(alexa_server)
  alexa_server.listen(ALEXA_HTTP_PORT, () => {
    console.log(`Alexa server running on port ${ALEXA_HTTP_PORT}`)
  })

  var twitter_server = require('https').createServer(options, twitter_app);
  twitter_server.listen(TWITTER_HTTP_PORT, () => {
    console.log(`Twitter server running on port ${TWITTER_HTTP_PORT}`)
  })
}
