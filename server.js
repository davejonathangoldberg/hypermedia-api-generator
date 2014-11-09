// server.js: composition root
var App = require("./App.js");
var Database = require("./Database.js");
var dbConfig = require("./dbconfig.json");

var app = new App();
var database = new Database(dbConfig);

app.get('*', function(req, res, next){
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT, PATCH, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, api_key, Authorization');
    next();
  });

// ESTABLISH ROUTE CLASSES & ROUTES
var Routes = require('./routes');
var routes = new Routes(app);

app.post('*', function(req, res, next){
  if (!req.is('json')) {
    res.set('Content-Type', app.mediaType);
    res.statusCode = 415;
    return res.json({errorCode : res.statusCode, 'errorMessage' : 'Please re-submit request with a Content-Type header value of "application/json"'});
  }
  return next();
});

app.all('*', function(req, res){
  var errorMessage = "Invalid or Unsupported Request. Please check your input and try again.";
  var errorTemplate = { "requestRoute" : req.path, "message" : errorMessage };
  res.set('Content-Type', app.mediaType);
  res.statusCode = 400;
  res.json(400, errorTemplate);
}); // RETURN ERROR FOR ANYTHING THAT OTHERWISE HASN'T BEEN CAUGHT