// App.js
module.exports = function App() {
  var express = require('express');
  var fs = require('fs');
  var app = express();
  var localPort = 5000;
  var port = process.env.PORT || localPort;
  
  app.version = "1.0";
  app.port = (port == localPort) ? (":" + port) : ("");
  app.host = "";
  app.basepath = '/';
  app.mediaType = 'application/json';
  
  app.set('views', __dirname + '/views');
  
  app.use(express.static(__dirname + '/public/'));
  app.use(express.bodyParser());
  app.use(function(err, req, res, next){
    if(err.status === 400 ){
      var errorMessage = "Invalid or Unsupported Request. Please check your input and try again.";
      var errorTemplate = { "requestRoute" : req.path, "message" : errorMessage };
      res.set('Content-Type', app.mediaType);
      res.statusCode = 400;
      res.json(400, errorTemplate);
    } else {
      var errorMessage = "Internal Server Error.";
      var errorTemplate = { "requestRoute" : req.path, "message" : errorMessage };
      res.set('Content-Type', app.mediaType);
      res.statusCode = 500;
      res.json(500, errorTemplate);
    }
  });
  
  app.listen(localPort);
  console.log('Listening on port ' + localPort + ' at ' + new Date());
  return app;
};