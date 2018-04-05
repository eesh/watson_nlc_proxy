const watson_app = require('./watson_app')
const alexa_app = require('./alexa_app')
const config = require('./config')
const https = requite('https')
const socketManager = require('./socketManager')

let WATSON_HTTP_PORT = 5000
let ALEXA_HTTP_PORT = 6456

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
