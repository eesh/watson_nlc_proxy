const fs = require('fs');
const twitter = require('twitter');
const dotenv = require('dotenv')
dotenv.config();

var Twitter = require('twitter');

var client = new Twitter({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token_key: process.env.ACCESS_TOKEN,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET
  });

function call(req, res){
    console.log(req.body);
    var uri = req.body.uri;
    if(req.body.user){
        var user = req.body.user;
        client.get(uri, {screen_name:user, count:1}, 
                function(err, tweet, response){
                    if(err){console.log(err)}
                    output = res.json(tweet[0].text);
                    console.log(tweet[0].text);
                    return output;
            });
    } else{
        var q = req.body.category;
        var result_type = req.body.hashtag;
        client.get(uri, {q: q, result_type: result_type, count:1}, 
                function(err, tweet, response){
                    if(err){console.log(err)}
                    output = res.json(tweet.statuses[0].text);
                    console.log(tweet.statuses[0].text);
                    return output;
            });
    }
}

module.exports.call = call;