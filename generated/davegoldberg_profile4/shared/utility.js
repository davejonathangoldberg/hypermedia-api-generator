module.exports = function Utility(app) {
  
  // REQUIRED LIBRARIES
  var _handlebars = require('handlebars');
  var mongoose = require('mongoose');
  var fs = require('fs');
  var async = require('async');
  var jjv = require('jjv');
  
  // RELATIVE REFERENCES 
  var Models = require('../models');
  var Templates = require('../templates');
  
  var models = new Models();
  var templates = new Templates();
  var meta = require('../meta.js');
  
  // UTILITY FUNCTIONS
  
  this.concatenateIds = function(idArray){
    
  }
  
  this.getParentId = function(idString){
    
  }
  
  this.createInstanceId = function() {
    var token = Math.random().toString(36).slice(2);
    console.log('token = ' + token + '\n');
    return token;
  }
  
  this.returnServerError = function(res) {
    res.statusCode = 500;
    return res.json({"errorCode" : "500", "errorMessage" : "The server could not process the request. Please try again."});
  }
  
  this.returnNotFound = function(res) {
    res.statusCode = 404;
    return res.json({"errorCode" : "404", "errorMessage" : "The item you are looking for could not be located. Please check your input and try again."});
  }
  
  // RENDER TEMPLATE
  this.renderTemplate = function(res, resource, resourceName, statusCode, headerObject){
    /*
    if(!(resource instanceof Array)) {
      var resourceArray = [];
      resourceArray.push(resource);
      resource = resourceArray;
    }
    */
    fs.readFile('./views/' + resourceName + '_' + resource.mediaType + '.handlebars', 'utf8', function (err,data) {
        if (err) {
          console.log(err);
          return next();
        }
        var template = _handlebars.compile(data);
        var templateData = JSON.parse(template(resource));
        res.statusCode = statusCode;
        res.set(headerObject)
        return res.json(templateData);
    });
  }
  
  // VALIDATE INPUT
  this.validateInput = function(resourceName, inputBody, next){
    var validationErrors = templates[resourceName].validate(resourceName, inputBody); // VALIDATE INPUT BODY USING JSON SCHEMA
    if (!validationErrors) {
      return console.log('{VALIDATE INPUT} Resource has been validated.');
    } else {
      console.log("Resource is invalid. \n");
      console.log("Body = " + JSON.stringify(inputBody) + " \n");
      return next();  // IF THERE ARE VALIDATION ERRORS THEN SKIP TO THE GENERIC INPUT ERROR HANDLING FUNCTION
    }
  }
  
  // VALIDATE INPUT - ASYNC LIB
  this.validateInputData = function(data, callback){
    var validationErrors = templates[data.resourceName].validate(data.resourceName, data.body); // VALIDATE INPUT BODY USING JSON SCHEMA
    if (!validationErrors) {
      data.validated = true;
      callback(null, data);
    } else {
      console.log("Resource is invalid. \n");
      console.log("Body = " + JSON.stringify(data.body) + " \n");
      data.validated = false;
      callback(null, data);
    }
  }
  
  // STAGE HYPERMEDIA OBJECT FOR OUTPUT
  this.hypermediaStage = function(data, callback){
    var printResource = {};
    printResource.collection = data.resourceType == 'collection' ? true : false;
    if(printResource.collection){
      for(i=0; i<data.collection.length; i++){
        resource = data.collection[i];
        resource['children'] = [];
        resource.path = data.path;
        if (resource.path.substr(-1) != '/') resource.path += '/';
        for(j=0; j<meta[data.resourceName].childResources.length; j++){
          resource.children.push(meta[data.resourceName].childResources[j]);
        }
      }
    } else {
      printResource['children'] = [];
      for(j=0; j<meta[data.resourceName].childResources.length; j++){
        printResource.children.push(meta[data.resourceName].childResources[j]);
      }
    }
    if(data.req.accepts('applcation/hal+json')){
      printResource.mediaType = 'hal';  
    } else if (data.req.accepts('applcation/json')){
      printResource.mediaType = 'hal';
    } else {
      printResource.mediaType = 'hal';
    }
    printResource[data.resourceName] = printResource.collection ? data.collection : data.instance;
    if (data.resourceName !== 'root') printResource.parent = data.parent;
    if (data.resourceName !== 'root') printResource.path = data.path;
    printResource.statusCode = data.statusCode;
    printResource.headerObject = data.headerObject;
    printResource.resourceName = data.resourceName;
    console.log('data.parent: ' + JSON.stringify(data.parent) + '\n');
    console.log('printResource: ' + JSON.stringify(printResource) + '\n');
    callback(null, printResource);
  }
  
}