// REQUIRED LIBRARIES
var fs = require('fs');
var childProcess = require('child_process')
var async = require('async');
var jjv = require('jjv');
var _handlebars = require('handlebars');

// RELATIVE REFERENCES
var Templates = require('../templates');
var templates = new Templates();

// FIXED STRUCTURES
var folders = ['models','routes','shared','templates','views'];
var resourcesArray = [];
var lineageArrays = {
  "lineageArray" : [],
  "titleLineageArray" : [],
  "altTitleLineageArray" : [],
  "nameArray" : []
};

module.exports = function WriteResources(app) {  

  // VALIDATE INPUT - ASYNC LIB
  this.entries = function(data, callback){
    if(!(resource instanceof Array)) {
      var resourceArray = [];
      resourceArray.push(resource);
      resource = resourceArray;
    }
    resourceWrap = {};
    resourceWrap[resourceName] = resource;
    console.log('resourceWrap: '+ JSON.stringify(resourceWrap) + '\n');
    fs.readFile("./views/" + resourceName + ".handlebars", 'utf8', function (err,data) {
      if (err) {
        console.log(err);
        return next();
      }
      var template = _handlebars.compile(data);
      var templateData = JSON.parse(template(resourceWrap));
      res.statusCode = statusCode;
      res.set(headerObject)
      return res.json(templateData);
    }); 
  }
}