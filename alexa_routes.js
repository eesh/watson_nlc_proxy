const controllers = require('./controllers/alexa')

function init(app) {
  app.post('/alexa/attributes/user', controllers.addUserAttribute)
  app.get('/alexa/attributes/user', controllers.getUserAttribute)
  app.post('/alexa/attributes/alexa', controllers.addAlexaAttribute)
  app.get('/alexa/attributes/alexa', controllers.getAlexaAttribute)

  app.post('/alexa/user/login', controllers.login)
  app.post('/alexa/user/register', controllers.register)

  app.post('/alexa/messages/user', controllers.addUserMessage)
  app.get('/alexa/messages/user', controllers.getUserMessage)

  app.post('/alexa/scratch/run', controllers.runScratchBlock)

  app.post('/alexa/alexa/login', controllers.alexaLogin)
}

module.exports = init
