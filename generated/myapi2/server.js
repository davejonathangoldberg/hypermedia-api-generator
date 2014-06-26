// server.js: composition root
var App = require('./App.js');
var Database = require('./Database.js');
var dbConfig = require('./dbconfig.json');
var PostsRoutes = require('./routes/posts');
var PostsTagsRoutes = require('./routes/poststags');
var PostsSubmarinesRoutes = require('./routes/postssubmarines');
var PostsSubmarinesWidgetsRoutes = require('./routes/postssubmarineswidgets');
var PostsBlobRoutes = require('./routes/postsblob');
var TagsRoutes = require('./routes/tags');


var app = new App();
var database = new Database(dbConfig);
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

var postsRoutes = new PostsRoutes(app);var postsTagsRoutes = new PostsTagsRoutes(app);var postsSubmarinesRoutes = new PostsSubmarinesRoutes(app);var postsSubmarinesWidgetsRoutes = new PostsSubmarinesWidgetsRoutes(app);var postsBlobRoutes = new PostsBlobRoutes(app);var tagsRoutes = new TagsRoutes(app);

app.all('*', function(req, res){
  var errorMessage = "Invalid or Unsupported Request. Please check your input and try again.";
  var errorTemplate = { "requestRoute" : req.path, "message" : errorMessage };
  res.set('Content-Type', app.mediaType);
  res.statusCode = 400;
  res.json(400, errorTemplate);
}); // RETURN ERROR FOR ANYTHING THAT OTHERWISE HASN'T BEEN CAUGHT