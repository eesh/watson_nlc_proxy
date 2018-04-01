var VisualRecognitionV3 = require('watson-developer-cloud/visual-recognition/v3');

function classifyImage(req, res) {
  let version_date = req.body.version_date
  let api_key = req.body.version_date
  let image_data = req.body.image_data
  let classifier_id = req.body.classifier_id
  let threshold = req.body.threshold
  if(threshold == null) {
    threshold = 0
  }
  if(version_date == null) {
    res.json({message: 'version_date not specified'})
    return
  }
  if(classifier_id == null) {
    res.json({message: 'classifier_id not specified'})
    return
  }
  if(image_data == null) {
    res.json({message: 'image_data not specified'})
    return
  }
  if(api_key == null) {
    res.json({message: 'api_key not specified'})
    return
  }

  let visual_recognition = new VisualRecognitionV3({
      version_date: version_date,
      api_key: api_key
  });

  let parameters = {
    classifier_ids: [classifier_id],
    threshold: threshold
  }

  let params = {
    images_file: image_data,
    parameters: parameters
  }

  visual_recognition.classify(params, function(err, response) {
    if (err) {
      console.log(err);
      res.json(err.message)
    }
    else {
      console.log(JSON.stringify(response, null, 2))
      res.json(response)
    }
  });
}


module.exports.classifyImage = classifyImage
