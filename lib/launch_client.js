// REQUIRED LIBRARIES
var fs = require('fs');
var async = require('async');
var http = require('http');
var https = require('https');
var AWS = require('aws-sdk');
//AWS.config.update({region: 'US Standard'});

var Composer = require('./composer.js');
var composer = new Composer();

function swaggerPaths(arr, key, parentPath, outputObj, callback){
  console.log('array length: ' + arr.length);
  var counter = 0;
  async.whilst(
      function () {
        return counter < arr.length;
      },
      function (cb) {
          var item = arr[counter++];
          console.log('Item Name: ' + item['name']);
          console.log('Counter: ' + counter);
          //var rootPathCollection = parentPath + '/' + item['name'];
          //var rootPathInstance = rootPathCollection + '/{' + item['name'] + 'InstanceId}';
          var rootPathCollection = item['swaggerCollectionPath']
          var rootPathInstance = item['swaggerInstancePath'];
          
          if(item['isCollection'] && item['hasNamedInstances']){
            // ITEM COLLECTION PATH
            outputObj[rootPathCollection] = {};
            outputObj[rootPathCollection]['get'] = {};
            outputObj[rootPathCollection]['get']['tags'] = [ item['name'] ];
            if(item['lineageArray'].length > 1){
              outputObj[rootPathCollection]['get']['parameters'] = [];
              for(j=0; j<item['lineageArray'].length - 1; j++){
                var lineageItem = item['lineageArray'][j];
                var pathParameterObject = {};
                pathParameterObject['name'] = lineageItem + 'InstanceId';
                pathParameterObject['in'] = 'path';
                pathParameterObject['description'] = 'ID for an instance of ' + lineageItem;
                pathParameterObject['required'] = true;
                pathParameterObject['type'] = 'string';
                outputObj[rootPathCollection]['get']['parameters'].push(pathParameterObject);
              }
            }
            outputObj[rootPathCollection]['get']['summary'] = item['name'];
            outputObj[rootPathCollection]['get']['description'] = 'Retrieve collection of ' + item['name'];
            outputObj[rootPathCollection]['get']['responses'] = {};
            outputObj[rootPathCollection]['get']['responses']['200'] = {};
            outputObj[rootPathCollection]['get']['responses']['200']['description'] = 'An array of ' + item['name'];
            outputObj[rootPathCollection]['get']['responses']['200']['schema'] = {};
            outputObj[rootPathCollection]['get']['responses']['200']['schema']['type'] = 'array';
            outputObj[rootPathCollection]['get']['responses']['200']['schema']['items'] = {};
            outputObj[rootPathCollection]['get']['responses']['200']['schema']['items']['$ref'] = '#/definitions/' + item['name'];
            
            // ITEM INSTANCE PATH
            outputObj[rootPathInstance] = {};
            outputObj[rootPathInstance]['get'] = {};
            outputObj[rootPathInstance]['get']['tags'] = [ item['name'] ];
            outputObj[rootPathInstance]['get']['parameters'] = [];
            for(j=0; j<item['lineageArray'].length; j++){
              var lineageItem = item['lineageArray'][j];
              var pathParameterObject = {};
              pathParameterObject['name'] = lineageItem + 'InstanceId';
              pathParameterObject['in'] = 'path';
              pathParameterObject['description'] = 'ID for an instance of ' + lineageItem;
              pathParameterObject['required'] = true;
              pathParameterObject['type'] = 'string';
              outputObj[rootPathInstance]['get']['parameters'].push(pathParameterObject);
            }
            outputObj[rootPathInstance]['get']['summary'] = item['name'];
            outputObj[rootPathInstance]['get']['description'] = 'Retrieve individual instance of ' + item['name'];
            outputObj[rootPathInstance]['get']['responses'] = {};
            outputObj[rootPathInstance]['get']['responses']['200'] = {};
            outputObj[rootPathInstance]['get']['responses']['200']['description'] = 'A single instance of ' + item['name'];
            outputObj[rootPathInstance]['get']['responses']['200']['schema'] = {};
            outputObj[rootPathInstance]['get']['responses']['200']['schema']['$ref'] = '#/definitions/' + item['name'];
            
            outputObj[rootPathInstance]['put'] = {};
            outputObj[rootPathInstance]['put']['tags'] = [ item['name'] ];
            outputObj[rootPathInstance]['put']['parameters'] = [];
            
            // INSERT PATH PARAMETERS
            for(j=0; j<item['lineageArray'].length; j++){
              var lineageItem = item['lineageArray'][j];
              var pathParameterObject = {};
              pathParameterObject['name'] = lineageItem + 'InstanceId';
              pathParameterObject['in'] = 'path';
              pathParameterObject['description'] = 'ID for an instance of ' + lineageItem;
              pathParameterObject['required'] = true;
              pathParameterObject['type'] = 'string';
              outputObj[rootPathInstance]['put']['parameters'].push(pathParameterObject);
            }
            // INSERT BODY PARAMETERS
            var bodyParameterObject = {};
            bodyParameterObject['name'] = item['name'];
            bodyParameterObject['in'] = 'body';
            bodyParameterObject['description'] = item['name'] + ' to insert';
            bodyParameterObject['required'] = true;
            bodyParameterObject['schema'] = { "$ref" : '#/definitions/' + item['name']};
            outputObj[rootPathInstance]['put']['parameters'].push(bodyParameterObject);
            
            outputObj[rootPathInstance]['put']['summary'] = item['name'];
            outputObj[rootPathInstance]['put']['description'] = 'Update or create individual instance of ' + item['name'];
            outputObj[rootPathInstance]['put']['responses'] = {};
            outputObj[rootPathInstance]['put']['responses']['200'] = {};
            outputObj[rootPathInstance]['put']['responses']['200']['description'] = 'Updated a single instance of ' + item['name'];
            outputObj[rootPathInstance]['put']['responses']['200']['schema'] = {};
            outputObj[rootPathInstance]['put']['responses']['200']['schema']['$ref'] = '#/definitions/' + item['name'];
            outputObj[rootPathInstance]['put']['responses']['201'] = {};
            outputObj[rootPathInstance]['put']['responses']['201']['description'] = 'Created a single instance of ' + item['name'];
            outputObj[rootPathInstance]['put']['responses']['201']['schema'] = {};
            outputObj[rootPathInstance]['put']['responses']['201']['schema']['$ref'] = '#/definitions/' + item['name'];
            
            outputObj[rootPathInstance]['delete'] = {};
            outputObj[rootPathInstance]['delete']['tags'] = [ item['name'] ];
            outputObj[rootPathInstance]['delete']['parameters'] = [];
            for(j=0; j<item['lineageArray'].length; j++){
              var lineageItem = item['lineageArray'][j];
              var pathParameterObject = {};
              pathParameterObject['name'] = lineageItem + 'InstanceId';
              pathParameterObject['in'] = 'path';
              pathParameterObject['description'] = 'ID for an instance of ' + lineageItem;
              pathParameterObject['required'] = true;
              pathParameterObject['type'] = 'string';
              outputObj[rootPathInstance]['delete']['parameters'].push(pathParameterObject);
            }
            outputObj[rootPathInstance]['delete']['summary'] = item['name'];
            outputObj[rootPathInstance]['delete']['description'] = 'Retrieve individual instance of ' + item['name'];
            outputObj[rootPathInstance]['delete']['responses'] = {};
            outputObj[rootPathInstance]['delete']['responses']['204'] = {};
            outputObj[rootPathInstance]['delete']['responses']['204']['description'] = 'A single instance of ' + item['name'];
          }
          
          if(item['isCollection'] && !item['hasNamedInstances']){
            // ITEM COLLECTION PATH
            outputObj[rootPathCollection] = {};
            outputObj[rootPathCollection]['get'] = {};
            outputObj[rootPathCollection]['get']['tags'] = [ item['name'] ];
            if(item['lineageArray'].length > 1){
              outputObj[rootPathCollection]['get']['parameters'] = [];
              for(j=0; j<item['lineageArray'].length - 1; j++){
                var lineageItem = item['lineageArray'][j];
                var pathParameterObject = {};
                pathParameterObject['name'] = lineageItem + 'InstanceId';
                pathParameterObject['in'] = 'path';
                pathParameterObject['description'] = 'ID for an instance of ' + lineageItem;
                pathParameterObject['required'] = true;
                pathParameterObject['type'] = 'string';
                outputObj[rootPathCollection]['get']['parameters'].push(pathParameterObject);
              }
            }
            outputObj[rootPathCollection]['get']['summary'] = item['name'];
            outputObj[rootPathCollection]['get']['description'] = 'Retrieve collection of ' + item['name'];
            outputObj[rootPathCollection]['get']['responses'] = {};
            outputObj[rootPathCollection]['get']['responses']['200'] = {};
            outputObj[rootPathCollection]['get']['responses']['200']['description'] = 'An array of ' + item['name'];
            outputObj[rootPathCollection]['get']['responses']['200']['schema'] = {};
            outputObj[rootPathCollection]['get']['responses']['200']['schema']['type'] = 'array';
            outputObj[rootPathCollection]['get']['responses']['200']['schema']['items'] = {};
            outputObj[rootPathCollection]['get']['responses']['200']['schema']['items']['$ref'] = '#/definitions/' + item['name'];
            
            outputObj[rootPathCollection]['post'] = {};
            outputObj[rootPathCollection]['post']['tags'] = [ item['name'] ];
            outputObj[rootPathCollection]['post']['parameters'] = [];
            
            // INSERT PATH PARAMETERS
            if(item['lineageArray'].length > 1){
              for(j=0; j<item['lineageArray'].length - 1; j++){
                var lineageItem = item['lineageArray'][j];
                var pathParameterObject = {};
                pathParameterObject['name'] = lineageItem + 'InstanceId';
                pathParameterObject['in'] = 'path';
                pathParameterObject['description'] = 'ID for an instance of ' + lineageItem;
                pathParameterObject['required'] = true;
                pathParameterObject['type'] = 'string';
                outputObj[rootPathCollection]['post']['parameters'].push(pathParameterObject);
              }
            }
            
            // INSERT BODY PARAMETERS
            var bodyParameterObject = {};
            bodyParameterObject['name'] = item['name'];
            bodyParameterObject['in'] = 'body';
            bodyParameterObject['description'] = item['name'] + ' to create';
            bodyParameterObject['required'] = true;
            bodyParameterObject['schema'] = { "$ref" : '#/definitions/' + item['name']};
            outputObj[rootPathCollection]['post']['parameters'].push(bodyParameterObject);
            
            outputObj[rootPathCollection]['post']['summary'] = item['name'];
            outputObj[rootPathCollection]['post']['description'] = 'Create an individual instance of ' + item['name'];
            outputObj[rootPathCollection]['post']['responses'] = {};
            outputObj[rootPathCollection]['post']['responses']['201'] = {};
            outputObj[rootPathCollection]['post']['responses']['201']['description'] = 'An instance of ' + item['name'];
            outputObj[rootPathCollection]['post']['responses']['201']['schema'] = {};
            outputObj[rootPathCollection]['post']['responses']['201']['schema'] = {};
            outputObj[rootPathCollection]['post']['responses']['201']['schema']['$ref'] = '#/definitions/' + item['name'];
            
            // ITEM INSTANCE PATH
            outputObj[rootPathInstance] = {};
            outputObj[rootPathInstance]['get'] = {};
            outputObj[rootPathInstance]['get']['tags'] = [ item['name'] ];
            outputObj[rootPathInstance]['get']['parameters'] = [];
            for(j=0; j<item['lineageArray'].length; j++){
              var lineageItem = item['lineageArray'][j];
              var pathParameterObject = {};
              pathParameterObject['name'] = lineageItem + 'InstanceId';
              pathParameterObject['in'] = 'path';
              pathParameterObject['description'] = 'ID for an instance of ' + lineageItem;
              pathParameterObject['required'] = true;
              pathParameterObject['type'] = 'string';
              outputObj[rootPathInstance]['get']['parameters'].push(pathParameterObject);
            }
            outputObj[rootPathInstance]['get']['summary'] = item['name'];
            outputObj[rootPathInstance]['get']['description'] = 'Retrieve individual instance of ' + item['name'];
            outputObj[rootPathInstance]['get']['responses'] = {};
            outputObj[rootPathInstance]['get']['responses']['200'] = {};
            outputObj[rootPathInstance]['get']['responses']['200']['description'] = 'A single instance of ' + item['name'];
            outputObj[rootPathInstance]['get']['responses']['200']['schema'] = {};
            outputObj[rootPathInstance]['get']['responses']['200']['schema']['$ref'] = '#/definitions/' + item['name'];
            
            outputObj[rootPathInstance]['put'] = {};
            outputObj[rootPathInstance]['put']['tags'] = [ item['name'] ];
            outputObj[rootPathInstance]['put']['parameters'] = [];
            
            // INSERT PATH PARAMETERS
            for(j=0; j<item['lineageArray'].length; j++){
              var lineageItem = item['lineageArray'][j];
              var pathParameterObject = {};
              pathParameterObject['name'] = lineageItem + 'InstanceId';
              pathParameterObject['in'] = 'path';
              pathParameterObject['description'] = 'ID for an instance of ' + lineageItem;
              pathParameterObject['required'] = true;
              pathParameterObject['type'] = 'string';
              outputObj[rootPathInstance]['put']['parameters'].push(pathParameterObject);
            }
            
            // INSERT BODY PARAMETERS
            var bodyParameterObject = {};
            bodyParameterObject['name'] = item['name'];
            bodyParameterObject['in'] = 'body';
            bodyParameterObject['description'] = item['name'] + ' to insert';
            bodyParameterObject['required'] = true;
            bodyParameterObject['schema'] = { "$ref" : '#/definitions/' + item['name']};
            outputObj[rootPathInstance]['put']['parameters'].push(bodyParameterObject);
            
            outputObj[rootPathInstance]['put']['summary'] = item['name'];
            outputObj[rootPathInstance]['put']['description'] = 'Update individual instance of ' + item['name'];
            outputObj[rootPathInstance]['put']['responses'] = {};
            outputObj[rootPathInstance]['put']['responses']['200'] = {};
            outputObj[rootPathInstance]['put']['responses']['200']['description'] = 'Updated a single instance of ' + item['name'];
            outputObj[rootPathInstance]['put']['responses']['200']['schema'] = {};
            outputObj[rootPathInstance]['put']['responses']['200']['schema']['$ref'] = '#/definitions/' + item['name'];
            
            outputObj[rootPathInstance]['delete'] = {};
            outputObj[rootPathInstance]['delete']['tags'] = [ item['name'] ];
            outputObj[rootPathInstance]['delete']['parameters'] = [];
            for(j=0; j<item['lineageArray'].length; j++){
              var lineageItem = item['lineageArray'][j];
              var pathParameterObject = {};
              pathParameterObject['name'] = lineageItem + 'InstanceId';
              pathParameterObject['in'] = 'path';
              pathParameterObject['description'] = 'ID for an instance of ' + lineageItem;
              pathParameterObject['required'] = true;
              pathParameterObject['type'] = 'string';
              outputObj[rootPathInstance]['delete']['parameters'].push(pathParameterObject);
            }
            outputObj[rootPathInstance]['delete']['summary'] = item['name'];
            outputObj[rootPathInstance]['delete']['description'] = 'Retrieve individual instance of ' + item['name'];
            outputObj[rootPathInstance]['delete']['responses'] = {};
            outputObj[rootPathInstance]['delete']['responses']['204'] = {};
            outputObj[rootPathInstance]['delete']['responses']['204']['description'] = 'A single instance of ' + item['name'];
          }
          
          if(!item['isCollection']){
            
            // ITEM INSTANCE PATH
            outputObj[rootPathInstance] = {};
            outputObj[rootPathInstance]['get'] = {};
            outputObj[rootPathInstance]['get']['tags'] = [ item['name'] ];
            if(item['lineageArray'].length > 1){
              outputObj[rootPathInstance]['get']['parameters'] = [];
              for(j=0; j<item['lineageArray'].length - 1; j++){
                var lineageItem = item['lineageArray'][j];
                var pathParameterObject = {};
                pathParameterObject['name'] = lineageItem + 'InstanceId';
                pathParameterObject['in'] = 'path';
                pathParameterObject['description'] = 'ID for an instance of ' + lineageItem;
                pathParameterObject['required'] = true;
                pathParameterObject['type'] = 'string';
                outputObj[rootPathInstance]['get']['parameters'].push(pathParameterObject);
              }
            }
            outputObj[rootPathInstance]['get']['summary'] = item['name'];
            outputObj[rootPathInstance]['get']['description'] = 'Retrieve ' + item['name'];
            outputObj[rootPathInstance]['get']['responses'] = {};
            outputObj[rootPathInstance]['get']['responses']['200'] = {};
            outputObj[rootPathInstance]['get']['responses']['200']['description'] = ' ' + item['name'] + ' resource';
            outputObj[rootPathInstance]['get']['responses']['200']['schema'] = {};
            outputObj[rootPathInstance]['get']['responses']['200']['schema']['$ref'] = '#/definitions/' + item['name'];
            
            outputObj[rootPathInstance]['put'] = {};
            outputObj[rootPathInstance]['put']['tags'] = [ item['name'] ];
            outputObj[rootPathInstance]['put']['parameters'] = [];
            
            // INSERT PATH PARAMETERS
            if(item['lineageArray'].length > 1){
              for(j=0; j<item['lineageArray'].length - 1; j++){
                var lineageItem = item['lineageArray'][j];
                var pathParameterObject = {};
                pathParameterObject['name'] = lineageItem + 'InstanceId';
                pathParameterObject['in'] = 'path';
                pathParameterObject['description'] = 'ID for an instance of ' + lineageItem;
                pathParameterObject['required'] = true;
                pathParameterObject['type'] = 'string';
                outputObj[rootPathInstance]['put']['parameters'].push(pathParameterObject);
              }
            }
            
            // INSERT BODY PARAMETERS
            var bodyParameterObject = {};
            bodyParameterObject['name'] = item['name'];
            bodyParameterObject['in'] = 'body';
            bodyParameterObject['description'] = item['name'] + ' to update';
            bodyParameterObject['required'] = true;
            bodyParameterObject['schema'] = { "$ref" : '#/definitions/' + item['name']};
            outputObj[rootPathInstance]['put']['parameters'].push(bodyParameterObject);
            
            outputObj[rootPathInstance]['put']['summary'] = item['name'];
            outputObj[rootPathInstance]['put']['description'] = 'Update individual instance of ' + item['name'];
            outputObj[rootPathInstance]['put']['responses'] = {};
            outputObj[rootPathInstance]['put']['responses']['200'] = {};
            outputObj[rootPathInstance]['put']['responses']['200']['description'] = 'Update a ' + item['name'];
            outputObj[rootPathInstance]['put']['responses']['200']['schema'] = {};
            outputObj[rootPathInstance]['put']['responses']['200']['schema']['$ref'] = '#/definitions/' + item['name'];
            
            outputObj[rootPathInstance]['delete'] = {};
            outputObj[rootPathInstance]['delete']['tags'] = [ item['name'] ];
            if(item['lineageArray'].length > 1){
              outputObj[rootPathInstance]['delete']['parameters'] = [];
              for(j=0; j<item['lineageArray'].length - 1; j++){
                var lineageItem = item['lineageArray'][j];
                var pathParameterObject = {};
                pathParameterObject['name'] = lineageItem + 'InstanceId';
                pathParameterObject['in'] = 'path';
                pathParameterObject['description'] = 'ID for an instance of ' + lineageItem;
                pathParameterObject['required'] = true;
                pathParameterObject['type'] = 'string';
                outputObj[rootPathInstance]['delete']['parameters'].push(pathParameterObject);
              }
            }
            outputObj[rootPathInstance]['delete']['summary'] = item['name'];
            outputObj[rootPathInstance]['delete']['description'] = 'Retrieve ' + item['name'];
            outputObj[rootPathInstance]['delete']['responses'] = {};
            outputObj[rootPathInstance]['delete']['responses']['204'] = {};
            outputObj[rootPathInstance]['delete']['responses']['204']['description'] = item['name'];
          }
          
          if(item[key]){
            console.log('\nFOUND KEY: ' + key);
            newParentPath = parentPath + (item['isCollection'] ? rootPathInstance : rootPathCollection);
            swaggerPaths(item[key], key, newParentPath, outputObj, cb);
          } else {
            console.log('\nNO KEY');
            cb();
          }
      },
      function (err) {
          counter = 0;
          callback(err, outputObj);
      }
  );
}

module.exports = function clientOutput() {  

  // VALIDATE INPUT - ASYNC LIB
  this.constructSwagger = function(inputData, callback){
    var outputObj = {};
    var consumesProducesArray = [];
    var host = inputData.data
    if ((inputData.data.apiOptions.mediaType == 'application/json') || (typeof(inputData.data.apiOptions.mediaType) == 'undefined') || (inputData.data.apiOptions.mediaType == '')) {
      consumesProducesArray[0] = 'application/json';
    } else {
      //consumesProducesArray[0] = 'application/json';
      consumesProducesArray[1] = inputData.data.apiOptions.mediaType;
    }
    outputObj = {
      "swagger" : "2.0",
      "info" : {
        "version" : "1.0.0",
        "title": inputData.data.apiOptions.apiName
      },
      "host" : inputData.swaggerHost,
      "schemes": [ "http" ],
      "consumes": [
        'application/json+hal'
      ],
      "produces": [
        'application/json+hal'
      ],
      "paths" : {},
      "definitions" : {}
    };
    
    // DEFINE ROOT PATH
    outputObj['paths'] = {
      "/" : {
        "get": {
          "tags": [
                      "/"
                  ],
          "summary": "API Root Collection",
          "description": "Retrieve collection of API Resources",
          "responses": {
            "200": {
              "description": "Links to API sub-resources",
            }
          }
        }
      }
    };
    
    swaggerPaths(inputData.resourcesArray, 'resources', '', outputObj['paths'], function(err, data){
      if(err){
        callback(err);
      } else {
        console.log('\noutputObj["paths"]: ' + JSON.stringify(data));
        var apiModelsArray = inputData.data.apiModels;
        for(i=0; i<apiModelsArray.length; i++){
          outputObj['definitions'][apiModelsArray[i]['title']] = { "properties" : apiModelsArray[i]['properties'], "type" : apiModelsArray[i]['type'] };
          outputObj['definitions'][apiModelsArray[i]['title'] + 'Create'] = { "properties" : apiModelsArray[i]['properties'], "type" : apiModelsArray[i]['type'] };
          delete outputObj['definitions'][apiModelsArray[i]['title'] + 'Create']['properties']['id'];
        }
        /*
        var updateData = {};
        var transformed = {};
        transformed['resourcesArray'] = inputData['resourcesArray'];
        transformed['lineageArrays'] = inputData['lineageArrays'];
        transformed['modelsObject'] = inputData['modelsObject'];
        updateData['queryKey'] = 'id';
        updateData['queryValue'] = inputData['data']['apiId'];
        updateData['updateObject'] = { "transformed" : transformed, "modifiedDate" : new Date() };
        updateData['swagger'] = outputObj;
        composer.updateApi(updateData, callback);
        */
        callback(null, outputObj);
      }
    });
  }
  
}