let express = require('express')
let bodyParser = require('body-parser')
let app = express()
let cors = require('cors')
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

let SERVER_PORT = 5000

let NaturalLanguageClassifierV1 = require('watson-developer-cloud/natural-language-classifier/v1');


app.post('/classify', function (req, res) {
  if(req.body.auth_pass == null || req.body.auth_user == null) {
    res.json({ error: 'Auth info not supplied' })
    return
  }
  if(req.body.text == null) {
    res.json({ error : 'Text not supplied' })
    return
  }
  if(req.body.classifier_id == null) {
    res.json({ error : 'classifier_id not supplied' })
    return
  }
  var naturalLanguageClassifier = new NaturalLanguageClassifierV1({
    username: req.body.auth_user,
    password: req.body.auth_pass
  });
  naturalLanguageClassifier.classify(
  {
    text: req.body.text,
    classifier_id: req.body.classifier_id
  },
  function(err, response) {
    if(err) {
      console.log(err.message)
      res.json(err)
    } else {
      console.log(response)
      res.json(response)
    }
  });
})

app.listen(SERVER_PORT, function() {
  console.log(`Server running on port ${SERVER_PORT}`)
})
