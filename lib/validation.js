// REQUIRED LIBRARIES
var async = require('async');
var jjv = require('jjv');

// RELATIVE REFERENCES 
var templates = require('../templates');
  
function validate(scheme, data, callback) {
  var validationErrors = templates.validate(scheme, data); // VALIDATE INPUT BODY USING JSON SCHEMA
  if (!validationErrors) {
    //console.log('VALIDATION SUCCESS >> ' + scheme + ': ' + JSON.stringify(validationErrors) + '\n');
    callback(null, data);
    return;
  } else {
    console.log('VALIDATION ERROR >> ' + scheme + ': ' + JSON.stringify(validationErrors) + '\n');
    err = {
      "type" : "validation",
      "value" : "At least one model is required to create an API."
    };
    callback(err, null);
    return;
  }
}

module.exports = function Validation() {  

  // VALIDATE INPUT - ASYNC LIB
  this.validateInputData = function(data, callback){
    async.parallel(
      [
        function(callback){ // VALIDATE API OPTIONS
            console.log('data.apiOptions: ' + JSON.stringify(data.apiOptions));
            return validate('options', data.apiOptions, callback);
        },
        function(callback){ // VALIDATE API RESOURCES
          console.log('data.apiResources: ' + JSON.stringify(data.apiResources));
          var resourcesValidation = templates.validate('resources', data.apiResources); // VALIDATE INPUT BODY USING JSON SCHEMA
          if (!resourcesValidation) {
            //console.log('VALIDATION >> resourcesValidation success: ' + JSON.stringify(resourcesValidation) + '\n');
            callback(null, resourcesValidation);
          } else {
            console.log('VALIDATION ERROR >> resourcesValidation: ' + JSON.stringify(resourcesValidation) + '\n');
            err = {
              "type" : "validation",
              "value" : "Invalid Resources."
            };
            callback(err, null);
          }
        },
        function(callback){ // VALIDATE BASIC API MODEL
          console.log('data.apiModels: ' + JSON.stringify(data.apiModels));
          var resourcesValidation = templates.validate('basicModels', data.apiModels); // VALIDATE INPUT BODY USING JSON SCHEMA
          if (!resourcesValidation) {
            //console.log('VALIDATION >> resourcesValidation success: ' + JSON.stringify(resourcesValidation) + '\n');
            callback(null, resourcesValidation);
          } else {
            console.log('VALIDATION ERROR >> resourcesValidation: ' + JSON.stringify(resourcesValidation) + '\n');
            err = {
              "type" : "validation",
              "value" : "At least one model is invalid."
            };
            callback(err, null);
          }
        },
        function(callback){ // VALIDATE API MODELS
          async.each(data.apiModels, function(model, callback) {
              // Perform operation on file here.
              //console.log('VALIDATION >> Processing model: ' + JSON.stringify(model) + '\n');
              var modelValidation = templates.validate('models', model); // VALIDATE INPUT BODY USING JSON SCHEMA
              if (!modelValidation) {
                //console.log('VALIDATION >> modelValidation success: ' + JSON.stringify(modelValidation) + '\n');
                callback(null, modelValidation);
              } else {
                console.log('VALIDATION ERROR >> modelValidation: ' + JSON.stringify(modelValidation) +' \n');
                callback(model, null);
              }
            }, function(err){
                if( err ) {
                  console.log("VALIDATION ERROR >> " + JSON.stringify(err) + '\n');
                  callback(err, '');
                } else {
                  console.log('VALIDATION >> All models have been processed successfully\n');
                  callback(null, data.apiModels);
                }
          });
        }
      ],
      function(err, results){
        if (err) {
          console.log('err: ' + err + '\n');
          callback(err, '');  
        } else {
          callback(null, true);
        }
      });  
  }
}