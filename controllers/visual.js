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

function getImageType(data) {
  if(data.indexOf("jpeg") !== -1 || data.indexOf("jpg") !== -1 ) return 'jpg'
  else if(data.indexOf("png") !== -1) return 'png'
  return null
}

function updateClassifier(req, res) {
  let version_date = req.body.version_date
  let api_key = req.body.api_key
  let api_url = req.body.api_url

  let classifier_id = req.body.classifier_id
  let label = req.body.label

  if(req.body.positive_example == undefined && req.body.negative_example == undefined) {
    res.json({message: 'Required files not specified'})
    return
  }

  let positive_example = null
  let negative_example = null
  let negative_example_path = null
  let positive_example_path = null

  if(api_url == null) { // Set default api url
    api_url = 'https://gateway-a.watsonplatform.net/visual-recognition/api'
  }
  if(version_date == null) {
    res.json({message: 'version_date not specified'})
    return
  }
  if(classifier_id == null) {
    res.json({message: 'classifier_id not specified'})
    return
  }
  if(label == null && req.body.negative_example == undefined) {
    res.json({message: 'label not specified'})
    return
  }
  if(api_key == null) {
    res.json({message: 'api_key not specified'})
    return
  }

  let parameters = {
    classifier_id: classifier_id
  }

  let positive_examples_attribute = `${label}_positive_examples`
  let visual_recognition = new VisualRecognitionV3({
      'url': api_url,
      'version_date': version_date,
      'api_key': api_key
  });

  let zipFile = null

  function saveToZip(fileName, filePath) {
    nodeJsZip.zip([filePath],{
      name: fileName,
      dir: __dirname,
      filter: false
    });
  }

  function onFileWritten(err) {
    if(err) {
      res.json({ error: err.message })
      return
    }

    let randomNumber = `${parseInt(random(10000, 99999))}`
    zipFile = path.join(__dirname, randomNumber + '.zip')

    if(positive_example != null) {
      saveToZip(randomNumber, positive_example)
      parameters[positive_examples_attribute] = fs.createReadStream(zipFile)
    } else if (negative_example != null) {
      saveToZip(randomNumber, negative_example)
      parameters[positive_examples_attribute] = fs.createReadStream(zipFile)
    } else {
      res.json({ error: 'Missing examples' })
      return
    }

    update()
  }

  function update() {
    visual_recognition.updateClassifier(parameters, function(err, response) {
      if(zipFile != null) {
        fs.unlink(zipFile, (err) => {
          console.log(err);
        })
      }
      if(positive_example != null) {
        fs.unlink(positive_example, (err) => {
          console.log(err);
        })
      }
      if(negative_example != null) {
        fs.unlink(negative_example, (err) => {
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

  if(req.body.positive_example) {
    let imageType = getImageType(req.body.positive_example.substr(20))
    if(imageType == null) {
      res.json({ error: 'Unsupported image format '})
      return
    }
    let base64Data = null
    if(imageType == 'jpg') {
      base64Data = req.body.positive_example.replace(/^data:image\/jpeg;base64,/,"")
    } else {
      base64Data = req.body.positive_example.replace(/^data:image\/png;base64,/,"")
    }
    console.log(base64Data)
    let binaryData = new Buffer(base64Data, 'base64').toString('binary');
    let randomNumber = `${parseInt(random(10000, 99999))}`
    positive_example = path.join(__dirname, randomNumber + '.' + imageType)
    fs.writeFile(positive_example, binaryData, "binary", onFileWritten);
  } else {
    let imageType = getImageType(req.body.negative_example.substr(20))
    if(imageType == null) {
      res.json({ error: 'Unsupported image format '})
      return
    }
    let base64Data = null
    if(imageType == 'jpg') {
      base64Data = req.body.negative_example.replace(/^data:image\/jpeg;base64,/,"")
    } else {
      base64Data = req.body.negative_example.replace(/^data:image\/png;base64,/,"")
    }
    let binaryData = new Buffer(base64Data, 'base64').toString('binary');
    let randomNumber = `${parseInt(random(10000, 99999))}`
    negative_example = path.join(__dirname, randomNumber + '.' + imageType)
    fs.writeFile(negative_example, binaryData, "binary", onFileWritten);
  }
}


module.exports.classifyImage = classifyImage
module.exports.updateClassifier = updateClassifier
