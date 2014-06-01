var express = require('express');
var router = express.Router();
var fs = require('fs');
var crypto = require('crypto');
var Flake = require('flake-idgen');
var config = require('../config');

/* GET home page. */
router.get('/', function (req, res) {
    console.log(req.query.url);
    res.render('test', { url: req.query.url});
});

router.post('/image', function (request, response) {
    console.log(request.body);
    var http = require('http');
    var request = http.get(request.body.url, function (res) {
        var imagedata = '';
        res.setEncoding('binary');
        res.on('data', function (chunk) {
            imagedata += chunk
        });
        res.on('end', function () {
            var hash = crypto.createHash('md5');
            hash.setEncoding('utf-8');
            hash.update(imagedata);
            var id = hash.digest('hex');
            var name = hash.read();
            fs.writeFile('./public/images/' + id, imagedata, 'binary', function (err) {
                if (err) {
                    response.json({err: err});
                }
                var genUrl = 'http://' + config.serverHostName + ':' + config.serverPortNumber + '/images/' + id;
                console.log('genUrl:' + genUrl);
                response.json({url: genUrl});
            });
        });
        request.on('error', function(err){
            response.json({error: ""});
        });
    })

});

router.post('/upload/image', function (request, response) {
    console.log(request.host);
    var imagedataString = request.body.url.replace(/.+base64,/, "");
    var hash = crypto.createHash('md5');
    hash.setEncoding('utf-8');
    hash.update(imagedataString);
    var hashHex = hash.digest('hex');
    var imageDataBuffer = new Buffer(imagedataString, 'base64');
    fs.writeFile('./public/images/' + hashHex + '.png', imageDataBuffer, 'binary', function (err) {
        if (err) {
            response.json({err: err})
        }
        var resUrl = "http://" + config.serverHostName + ':' + config.serverPortNumber + "/images/" + hashHex + '.png';
        console.log(resUrl);
        response.json({url: resUrl});
    });
});

process.on('uncaughtException', function (err) {
    console.log(err);
});
module.exports = router;
