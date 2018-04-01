let express = require('express')
let bodyParser = require('body-parser')
let cors = require('cors')
let routes = require('./routes')

let app = express()
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

let SERVER_PORT = 3477

routes(app)

app.listen(SERVER_PORT, function() {
  console.log(`Server running on port ${SERVER_PORT}`)
})
