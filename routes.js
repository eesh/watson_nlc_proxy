let nlc = require('./controllers/nlc')
let visual = require('./controllers/visual')
let twitter = require('./controllers/twitter')

function init(app) {
  app.post('/nlc/classify', nlc.classifyPhrase)
  app.post('/visual/classify', visual.classifyImage)
  app.post('/twitter/call', twitter.call)
}

module.exports = init
