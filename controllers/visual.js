var VisualRecognitionV3 = require('watson-developer-cloud/visual-recognition/v3');
const fs = require('fs')
const path = require('path');
const os = require('os');
const uuid = require('uuid');

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


module.exports.classifyImage = classifyImage
