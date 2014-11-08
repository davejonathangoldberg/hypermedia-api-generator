// server.js: composition root
var App = require('./App.js');
var Database = require('./Database.js');
var dbConfig = require('./dbconfig.json');
var Composer = require('./shared/composer.js');
var ItemsRoutes = require('./routes/items');
var ItemsAssigneesRoutes = require('./routes/itemsassignees');
var ProjectsRoutes = require('./routes/projects');
var ProjectsItemsRoutes = require('./routes/projectsitems');


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

app.options('*', function(req, res, next){
  res.statusCode(200);
  return res.send('');
});

app.get('/', function(req, res, next){      
  return composer.retrieveRoot(req, res);
});

var itemsRoutes = new ItemsRoutes(app);
var itemsAssigneesRoutes = new ItemsAssigneesRoutes(app);
var projectsRoutes = new ProjectsRoutes(app);
var projectsItemsRoutes = new ProjectsItemsRoutes(app);


app.all('*', function(req, res){
  var errorMessage = "Invalid or Unsupported Request. Please check your input and try again.";
  var errorTemplate = { "requestRoute" : req.path, "message" : errorMessage };
  res.set('Content-Type', app.mediaType);
  res.statusCode = 400;
  res.json(400, errorTemplate);
}); // RETURN ERROR FOR ANYTHING THAT OTHERWISE HASN'T BEEN CAUGHT