var VisualRecognitionV3 = require('watson-developer-cloud/visual-recognition/v3');
const fs = require('fs')
const path = require('path');
const os = require('os');
const uuid = require('uuid');
let nodeJsZip = require("nodeJs-zip");

/**
 * Parse a base 64 image and return the extension and buffer
 * @param  {String} imageString The image data as base65 string
 * @return {Object}             { type: String, data: Buffer }
 */
function parseBase64Image(imageString) {
  var matches = imageString.match(/^data:image\/([A-Za-z-+/]+);base64,(.+)$/);
  var resource = {};

  if (matches.length !== 3) {
    return null;
  }

  resource.type = matches[1] === 'jpeg' ? 'jpg' : matches[1];
  resource.data = new Buffer(matches[2], 'base64');
  return resource;
}

function classifyImage(req, res) {
  let version_date = req.body.version_date
  let api_key = req.body.api_key
  let image_data = req.body.image_data
  let image_url = req.body.image_url
  let classifier_id = req.body.classifier_id
  let threshold = req.body.threshold
  let api_url = req.body.api_url

  if(threshold == null) { // Set default threshold value
    threshold = 0
  } else {
    threshold = parseFloat(threshold)
  }
  if(api_url == null) { // Set default api url
    api_url = 'https://gateway-a.watsonplatform.net/visual-recognition/api/v3/classify'
  }
  if(version_date == null) {
    res.json({message: 'version_date not specified'})
    return
  }
  if(classifier_id == null) {
    res.json({message: 'classifier_id not specified'})
    return
  }
  if(image_data == null && image_url == null) {
    res.json({message: 'Neither image_data nor image_url were specified'})
    return
  }
  if(api_key == null) {
    res.json({message: 'api_key not specified'})
    return
  }

  let visual_recognition = new VisualRecognitionV3({
      'url': api_url,
      'version_date': version_date,
      'api_key': api_key
  });

  let parameters = {
    classifier_ids: classifier_id,
    threshold: threshold
  }

  if(image_url != null) {
    parameters.url = image_url
  } else {
    let resource = parseBase64Image(image_data);
    let temp = path.join(os.tmpdir(), uuid.v1() + '.' + resource.type);
    fs.writeFileSync(temp, resource.data);
    parameters.images_file = fs.createReadStream(temp);
  }

  visual_recognition.classify(parameters, function(err, response) {
    if (err) {
      console.log(err);
      res.json(err)
    }
    else {
      res.json(response)
    }
  });
}


function random (low, high) {
    return Math.random() * (high - low) + low;
}


function updateClassifier(req, res) {
  let version_date = req.body.version_date
  let api_key = req.body.api_key
  let api_url = req.body.api_url

  let classifier_id = req.body.classifier_id
  let label = req.body.label

  if(req.files.positive_examples == undefined && req.files.negative_examples == undefined) {
    res.json({message: 'Required files not specified'})
    return
  }

  let positive_examples = null
  let negative_examples = null
  let negative_examples_path = null
  let positive_examples_path = null

  if(api_url == null) { // Set default api url
    api_url = 'https://gateway-a.watsonplatform.net/visual-recognition/api/v3/classify'
  }
  if(version_date == null) {
    res.json({message: 'version_date not specified'})
    return
  }
  if(classifier_id == null) {
    res.json({message: 'classifier_id not specified'})
    return
  }
  if(label == null || negative_examples == undefined) {
    res.json({message: 'label not specified'})
    return
  }
  if(api_key == null) {
    res.json({message: 'api_key not specified'})
    return
  }

  console.log(positive_examples);
  console.log(negative_examples);

  let positive_examples_attribute = `${label}_positive_examples`

  let visual_recognition = new VisualRecognitionV3({
      'url': api_url,
      'version_date': version_date,
      'api_key': api_key
  });

  let parameters = {
    classifier_ids: classifier_id
  }

  if(req.files.positive_examples != undefined) {
    positive_examples = req.files.positive_examples.file
    let randomNumber = `${parseInt(random(10000, 99999))}`
    positive_examples_path = path.join(__dirname, randomNumber, '.zip')
    nodeJsZip.zip([positive_examples],{
      name: randomNumber,
      dir: __dirname,
      filter: false
    });
    parameters[positive_examples_attribute] = fs.createReadStream(positive_examples_path)
  }

  if(req.files.negative_examples != undefined) {
    negative_examples = req.files.negative_examples.file
    let randomNumber = `${parseInt(random(10000, 99999))}`
    negative_examples_path = path.join(__dirname, randomNumber, '.zip')
    nodeJsZip.zip([negative_examples],{
      name: randomNumber,
      dir: __dirname,
      filter: false
    });
    parameters["negative_examples"] = fs.createReadStream(negative_examples_path)
  }

  visual_recognition.updateClassifier(parameters, function(err, response) {
    if(positive_examples_path != null) {
      fs.unlink(positive_examples_path, (err) => {
        console.log(err);
      })
    }
    if(negative_examples_path != null) {
      fs.unlink(negative_examples_path, (err) => {
        console.log(err);
      })
    }
    if (err) {
      console.log(err);
      res.json(err)
    }
    else {
      res.json(response)
    }
  });
}


module.exports.classifyImage = classifyImage
module.exports.updateClassifier = updateClassifier
