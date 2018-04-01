const controllers = require('./controllers/alexa')

function init(app) {
  app.post('/attributes/user', controllers.addUserAttribute)
  app.get('/attributes/user', controllers.getUserAttribute)
  app.post('/attributes/alexa', controllers.addAlexaAttribute)
  app.get('/attributes/alexa', controllers.getAlexaAttribute)

  app.post('/user/login', controllers.login)
  app.post('/user/register', controllers.register)

  app.post('/messages/user', controllers.addUserMessage)
  app.get('/messages/user', controllers.getUserMessage)

  app.post('/scratch/run', controllers.runScratchBlock)

  app.post('/alexa/login', controllers.alexaLogin)
}

module.exports = init
