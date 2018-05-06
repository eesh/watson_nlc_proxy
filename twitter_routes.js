let twitterController = require('./controllers/twitter')

function init(app) {
  app.post('/twitter/call', twitterController.call)
}

module.exports = init
