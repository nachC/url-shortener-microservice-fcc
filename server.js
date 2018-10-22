'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var Schema = mongoose.Schema;

var cors = require('cors');

var UrlSchema = new Schema({
  "original_url": {
    type: String,
    required: true
  },
  "short_url": {
    type: String,
    required: true
  }
});

var Url = mongoose.model('Url', UrlSchema);

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
mongoose.connect(process.env.MONGOLAB_URI);

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

app.post('/api/shorturl/:new', (req, res) => {
  let original_url = req.body.url;
  Url.find({}, (err, urls) => {
    if(err) return res.status(500).json({error: err});
    let short_url = urls.length + 1;
    let newUrl = {
      original_url,
      short_url
    };
    Url.create(newUrl, (err, url) => {
      if(err) return res.status(500).json({error: err});
      return res.status(200).json(newUrl);
    });
  });
});

app.get('/api/shorturl/:url', (req, res) => {
  let short_url = req.params.url;
  Url.findOne({short_url}, (err, url) => {
    if(!url) return res.status(404).json({"error": "url not found"});
    if(err) return res.status(500).json({error: err});
    let redirectTo = url.original_url;
    return res.redirect(redirectTo);
  });
});

app.listen(port, function () {
  console.log('Node.js listening ...');
});