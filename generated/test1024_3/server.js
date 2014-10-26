// server.js: composition root
var App = require('./App.js');
var Database = require('./Database.js');
var dbConfig = require('./dbconfig.json');
var Composer = require('./shared/composer.js');
var SpeakersRoutes = require('./routes/speakers');
var SpeakersTopicsRoutes = require('./routes/speakerstopics');
var SpeakersEmail_addressesRoutes = require('./routes/speakersemail_addresses');
var TopicsRoutes = require('./routes/topics');
var TopicsSpeakersRoutes = require('./routes/topicsspeakers');
var DetailsRoutes = require('./routes/details');


var app = new App();
var database = new Database(dbConfig);
var composer = new Composer();
//var routes = new Routes(app, database);

app.all('*', function(req, res, next){
  if (!req.accepts('json')) { // COULD BE MADE A DYNAMIC ATTRIBUTE SET BY USER IN THE FUTURE
    res.set('Content-Type', app.mediaType);
    res.statusCode = 406;
    return res.json({errorCode : res.statusCode, 'errorMessage' : 'Please re-submit request with an Accept header value of "application/json"'});
  } else {
    return next();
  }
});

app.put('*', function(req, res, next){
  if (!req.is('json')) {
    res.set('Content-Type', app.mediaType);
    res.statusCode = 415;
    return res.json({errorCode : res.statusCode, 'errorMessage' : 'Please re-submit request with a Content-Type header value of "application/json"'});
  }
  return next();
});

app.post('*', function(req, res, next){
  if (!req.is('json')) {
    res.set('Content-Type', app.mediaType);
    res.statusCode = 415;
    return res.json({errorCode : res.statusCode, 'errorMessage' : 'Please re-submit request with a Content-Type header value of "application/json"'});
  }
  return next();
});

app.get('/', function(req, res, next){      
  return composer.retrieveRoot(req, res);
});

var speakersRoutes = new SpeakersRoutes(app);
var speakersTopicsRoutes = new SpeakersTopicsRoutes(app);
var speakersEmail_addressesRoutes = new SpeakersEmail_addressesRoutes(app);
var topicsRoutes = new TopicsRoutes(app);
var topicsSpeakersRoutes = new TopicsSpeakersRoutes(app);
var detailsRoutes = new DetailsRoutes(app);


app.all('*', function(req, res){
  var errorMessage = "Invalid or Unsupported Request. Please check your input and try again.";
  var errorTemplate = { "requestRoute" : req.path, "message" : errorMessage };
  res.set('Content-Type', app.mediaType);
  res.statusCode = 400;
  res.json(400, errorTemplate);
}); // RETURN ERROR FOR ANYTHING THAT OTHERWISE HASN'T BEEN CAUGHT