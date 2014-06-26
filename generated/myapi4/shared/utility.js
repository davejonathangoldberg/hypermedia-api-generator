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
  
}