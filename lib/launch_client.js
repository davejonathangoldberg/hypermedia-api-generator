// REQUIRED LIBRARIES
var fs = require('fs');
var async = require('async');
var http = require('http');
var https = require('https');
var AWS = require('aws-sdk');
//AWS.config.update({region: 'US Standard'});

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
  this.constructSwagger = function(inputData, host, callback){
    var outputObj = {
      "swagger" : "2.0",
      "info" : {
        "version" : "1.0.0",
        "title": inputData.data.apiOptions.apiName
      },
      "host" : host,
      "basePath" : "/",
      "schemes": [ "http" ],
      "consumes": [
        "application/json",
        inputData.data.apiOptions.mediaType
      ],
      "produces": [
        "application/json",
        inputData.data.apiOptions.mediaType
      ],
      "paths" : {},
      "definitions" : {}
    };
    
    swaggerPaths(inputData.resourcesArray, 'resources', '', outputObj['paths'], function(err, data){
      if(err){
        callback(err);
      } else {
        console.log('\noutputObj["paths"]: ' + JSON.stringify(data));
        var apiModelsArray = inputData.data.apiModels;
        for(i=0; i<apiModelsArray.length; i++){
          outputObj['definitions'][apiModelsArray[i]['title']] = { "properties" : apiModelsArray[i]['properties'], "type" : apiModelsArray[i]['type'] };
        }
        callback(null, outputObj);  
      }
    });
  }
  
  this.herokuLaunch = function(transformedData, callback){
    async.series(
      [
        function(callback){ // EXECUTE TERMINAL COMMANDS: MAKE FINAL DIRECTORY WITHIHN API-OUTPUT DIRECTORY
          //var rootDir = '~/Dropbox/development/modelships/api-output/';
          var targetDir = rootDir + '/api-output/' + transformedData.data.apiOptions.apiName;
          var makeDirectoryCommand = 'mkdir '+ targetDir;
          executeSingleCommand(makeDirectoryCommand, callback);
          //callback(null, makeDirectoryCommand);
        },
        function(callback){ // COPY FILES FROM GENERATED TO API-OUTPUT
          //var rootDir = '~/Dropbox/development/modelships/api-output/';
          var targetDir = rootDir + '/api-output/' + transformedData.data.apiOptions.apiName;
          var copyFilesCommand = 'cp -r generated/' + transformedData.data.apiOptions.apiName + '/* ' + targetDir ;
          executeSingleCommand(copyFilesCommand, callback);
          //callback(null, copyFilesCommand);
        },
        function(callback){ // WRITE BASH SCRIPT
          //var rootDir = '/Users/davegoldberg/Dropbox/development/modelships/api-output/';
          var targetDir = rootDir + '/api-output/' + transformedData.data.apiOptions.apiName;
          var directoryDetails = { "extension" : "sh", "location" : targetDir + '/', "sourceFilename" : "model_template", "filename" : transformedData.data.apiOptions.apiName, "launchTarget" : "Heroku" };
          writeBash(directoryDetails, callback);
        },
        function(callback){ // EXECUTE TERMINAL COMMANDS
          //var rootDir = '~/Dropbox/development/modelships/api-output/';
          var targetDir = rootDir + '/api-output/' + transformedData.data.apiOptions.apiName;
          var changeDirectoryCommand = 'cd ' + targetDir;
          executeSingleCommand(changeDirectoryCommand, callback);
          //callback(null, changeDirectoryCommand);
        },
        function(callback){ // EDIT BASH SCRIPT PERMISSIONS
          var bashFilename = 'bash_launcher.sh';
          //var rootDir = '~/Dropbox/development/modelships/api-output/';
          var targetDir = rootDir + '/api-output/' + transformedData.data.apiOptions.apiName;
          var changePermissionsCommand = 'chmod 700 ' + targetDir + '/' + bashFilename;
          executeSingleCommand(changePermissionsCommand, callback);
        },
        function(callback){ // EXECUTE BASH SCRIPT
          var bashFilename = 'bash_launcher.sh';
          //var rootDir = '~/Dropbox/development/modelships/api-output/';
          var targetDir = rootDir + '/api-output/' + transformedData.data.apiOptions.apiName;
          var runBashCommand =  targetDir + '/' + bashFilename;
          //executeSingleCommand(runBashCommand, callback);
          var terminalCommand;
          terminalCommand = childProcess.exec(runBashCommand, function (error, stdout, stderr) {
            if (error) {
              console.log(error.stack);
              console.log('\nEXECUTE BASH SCRIPT Error code: '+ error.code);
              console.log('\nEXECUTE BASH SCRIPT Signal received: '+ error.signal);
            } else {
            console.log('command: '+ runBashCommand);
            //console.log('Child Process STDOUT: '+stdout);
            //console.log('Child Process STDERR: '+stderr);
            }
          });
          terminalCommand.on('exit', function (code) {
            console.log('Child process (Execute BASH) exited with exit code ' + code);
            callback(null, runBashCommand);
          });
        },
        function(callback){ // DEPLOY TARBALL OF GIT REPO TO AMAZON AWS
          var s3 = new AWS.S3();
          var tarballDir = rootDir + '/api-output/tarballs/';
          var bucketName = 'ms-tarballs';
          var keyName = transformedData.data.apiOptions.apiName + '.tar.gz';
          
          fs.readFile(tarballDir + keyName, function (err, data) {
            if (err) { throw err; }
          
            var params = {
              Bucket: bucketName,
              Key: keyName,
              Body: data,
              ACL: 'public-read'
            };
            
            s3.putObject(params, function(err, data) {
              if (err) {
                console.log(err);
                callback(err);
              } else {
                console.log('s3 data: ' + JSON.stringify(data));
                console.log('Successfully uploaded data to ' + bucketName + '/' + keyName);
                callback(null, { "success" : true });
              }
            });
          });
        },
        function(callback){ // HEROKU ACTIONS WATERFALL
          async.waterfall(
          [
            function(innerCallback){ // CREATE HEROKU APP
              var newAppDetailsResponse;
                
              var options = {
                hostname: 'api.heroku.com',
                path: '/apps',
                method: 'POST',
                headers: {
                  "Accept" : "application/vnd.heroku+json; version=3",
                  "Authorization" : "OjZlZWIyZWIyLTQ4NjYtNDgyYy05ZDMzLTM0YzcyZTA3MmZkMgo=",
                  "Content-Type" : "application/json"
                }
              };
              
              var req = https.request(options, function(res) {
                var responseString = '';
                console.log('STATUS: ' + res.statusCode);
                console.log('HEADERS: ' + JSON.stringify(res.headers));
                res.setEncoding('utf8');
                res.on('data', function (chunk) {
                  console.log('BODY: ' + chunk);
                  responseString += chunk;
                });
                res.on('end', function() {
                  newAppDetailsResponse = JSON.parse(responseString);
                  console.log('newAppDetailsResponse: ' + JSON.stringify(newAppDetailsResponse));
                  if((res.statusCode === 200) || (res.statusCode === 201) || (res.statusCode === 202)){
                    console.log('equal to 200, 201, 202');
                    innerCallback(null, newAppDetailsResponse);
                  } else {
                    console.log('not equal to 200, 201, 202');
                    innerCallback(res.statusCode);
                  }
                });
              });
              
              req.on('error', function(e) {
                console.log('problem with request: ' + e.message);
                innerCallback(e);
              });
              
              // write data to request body
              //req.write(JSON.stringify(appDetails));
              req.end();
            },
            function(newAppDetailsResponse, innerCallback){ // COMPLETE APP DETAILS (BUILD, DB, DEPLOY HOOKS)
              async.parallel(
                [
                  function(innerParallelCallback){ // CREATE HEROKU BUILD
                    var buildResponse;
                    var appId = newAppDetailsResponse.id;
                    var tarballUrl = 'https://s3.amazonaws.com/ms-tarballs/' + transformedData.data.apiOptions.apiName + '.tar.gz';
                    var tarballVersion = transformedData.data.apiOptions.apiName;
                    var sourceBlobObject = { "source_blob" : { "url" : tarballUrl, "version" : tarballVersion }};
                    var options = {
                      hostname: 'api.heroku.com',
                      path: '/apps/' + appId + '/builds',
                      method: 'POST',
                      headers: {
                        "Accept" : "application/vnd.heroku+json; version=3",
                        "Authorization" : "OjZlZWIyZWIyLTQ4NjYtNDgyYy05ZDMzLTM0YzcyZTA3MmZkMgo=",
                        "Content-Type" : "application/json"
                      }
                    };
                    
                    var req = https.request(options, function(res) {
                      var responseString = '';
                      console.log('\nCREATE BUILD STATUS: ' + res.statusCode);
                      //console.log('HEADERS: ' + JSON.stringify(res.headers));
                      res.setEncoding('utf8');
                      res.on('data', function (chunk) {
                        //console.log('BODY: ' + chunk);
                        responseString += chunk;
                      });
                      res.on('end', function() {
                        buildResponse = JSON.parse(responseString);
                        console.log('\nCREATE BUILD RESPONSE: ' + JSON.stringify(buildResponse) + '\n');
                        if((res.statusCode === 200) || (res.statusCode === 201) || (res.statusCode === 202)){
                          console.log('\nCREATE BUILD RESPONSE status equal to 200, 201, 202');
                          innerParallelCallback(null, buildResponse.id);
                        } else {
                          console.log('not equal to 200, 201, 202');
                          innerParallelCallback(res.statusCode);
                        }
                      });
                    });
                    
                    req.on('error', function(e) {
                      console.log('problem with request: ' + e.message);
                      innerParallelCallback(e);
                    });
                    
                    // write data to request body
                    req.write(JSON.stringify(sourceBlobObject));
                    req.end();
                  },
                  function(innerParallelCallback){ // ADD MONGOLAB ADD-ON TO HEROKU APP
                    var addonResponse;
                    var appId = newAppDetailsResponse.id;
                    var appAddons = { "plan": "8e6163ec-a935-4738-a0f4-60867f4f86cb" };
                    console.log('appId: ' + appId);
                    console.log('newAppDetailsResponse: ' + JSON.stringify(newAppDetailsResponse));
                    var options = {
                      hostname: 'api.heroku.com',
                      path: '/apps/' + appId + '/addons',
                      method: 'POST',
                      headers: {
                        "Accept" : "application/vnd.heroku+json; version=3",
                        "Authorization" : "OjZlZWIyZWIyLTQ4NjYtNDgyYy05ZDMzLTM0YzcyZTA3MmZkMgo=",
                        "Content-Type" : "application/json"
                      }
                    };
                    
                    var req = https.request(options, function(res) {
                      var responseString = '';
                      console.log('\nMONGOLAB ADD-ON STATUS: ' + res.statusCode);
                      //console.log('HEADERS: ' + JSON.stringify(res.headers));
                      res.setEncoding('utf8');
                      res.on('data', function (chunk) {
                        //console.log('BODY: ' + chunk);
                        responseString += chunk;
                      });
                      res.on('end', function() {
                        addonResponse = JSON.parse(responseString);
                        console.log('\nMONGOLAB addonResponse: ' + JSON.stringify(addonResponse));
                        if((res.statusCode === 200) || (res.statusCode === 201) || (res.statusCode === 202)){
                          console.log('\nequal to 200, 201, 202');
                          innerParallelCallback(null, newAppDetailsResponse);
                        } else {
                          console.log('not equal to 200, 201, 202');
                          innerParallelCallback(res.statusCode);
                        }
                      });
                    });
                    
                    req.on('error', function(e) {
                      console.log('problem with request: ' + e.message);
                      innerParallelCallback(e);
                    });
                    
                    // write data to request body
                    req.write(JSON.stringify(appAddons));
                    req.end();
                  },
                  function(innerParallelCallback){ // ADD DEPLOY HOOK EMAIL ADD-ON TO HEROKU APP
                    var addonResponse;
                    var appId = newAppDetailsResponse.id;
                    var appAddons = { "plan": "deployhooks:email", "config" : { "recipient" : "davejonathangoldberg@gmail.com", "subject" : "heroku deploy", "body" : "{{user}} deployed app - {{app}} to {{url}}" }};
                    console.log('appId: ' + appId);
                    console.log('newAppDetailsResponse: ' + JSON.stringify(newAppDetailsResponse));
                    var options = {
                      hostname: 'api.heroku.com',
                      path: '/apps/' + appId + '/addons',
                      method: 'POST',
                      headers: {
                        "Accept" : "application/vnd.heroku+json; version=3",
                        "Authorization" : "OjZlZWIyZWIyLTQ4NjYtNDgyYy05ZDMzLTM0YzcyZTA3MmZkMgo=",
                        "Content-Type" : "application/json"
                      }
                    };
                    
                    var req = https.request(options, function(res) {
                      var responseString = '';
                      console.log('STATUS: ' + res.statusCode);
                      console.log('HEADERS: ' + JSON.stringify(res.headers));
                      res.setEncoding('utf8');
                      res.on('data', function (chunk) {
                        console.log('BODY: ' + chunk);
                        responseString += chunk;
                      });
                      res.on('end', function() {
                        addonResponse = JSON.parse(responseString);
                        console.log('addonResponse: ' + JSON.stringify(addonResponse));
                        if((res.statusCode === 200) || (res.statusCode === 201) || (res.statusCode === 202)){
                          console.log('equal to 200, 201, 202');
                          innerParallelCallback(null, newAppDetailsResponse);
                        } else {
                          console.log('not equal to 200, 201, 202');
                          innerParallelCallback(res.statusCode);
                        }
                      });
                    });
                    
                    req.on('error', function(e) {
                      console.log('problem with request: ' + e.message);
                      innerParallelCallback(e);
                    });
                    
                    // write data to request body
                    req.write(JSON.stringify(appAddons));
                    req.end();
                  },
                  function(innerParallelCallback){ // ADD WEB HOOK EMAIL ADD-ON TO HEROKU APP
                    var addonResponse;
                    var appId = newAppDetailsResponse.id;
                    var appAddons = { "plan": "deployhooks:http", "config" : { "url" : "http://gp1b5lanrks0.runscope.net"}};
                    console.log('appId: ' + appId);
                    console.log('newAppDetailsResponse: ' + JSON.stringify(newAppDetailsResponse));
                    var options = {
                      hostname: 'api.heroku.com',
                      path: '/apps/' + appId + '/addons',
                      method: 'POST',
                      headers: {
                        "Accept" : "application/vnd.heroku+json; version=3",
                        "Authorization" : "OjZlZWIyZWIyLTQ4NjYtNDgyYy05ZDMzLTM0YzcyZTA3MmZkMgo=",
                        "Content-Type" : "application/json"
                      }
                    };
                    
                    var req = https.request(options, function(res) {
                      var responseString = '';
                      console.log('STATUS: ' + res.statusCode);
                      console.log('HEADERS: ' + JSON.stringify(res.headers));
                      res.setEncoding('utf8');
                      res.on('data', function (chunk) {
                        console.log('BODY: ' + chunk);
                        responseString += chunk;
                      });
                      res.on('end', function() {
                        addonResponse = JSON.parse(responseString);
                        console.log('addonResponse: ' + JSON.stringify(addonResponse));
                        if((res.statusCode === 200) || (res.statusCode === 201) || (res.statusCode === 202)){
                          console.log('equal to 200, 201, 202');
                          innerParallelCallback(null, newAppDetailsResponse);
                        } else {
                          console.log('not equal to 200, 201, 202');
                          innerParallelCallback(res.statusCode);
                        }
                      });
                    });
                    
                    req.on('error', function(e) {
                      console.log('problem with request: ' + e.message);
                      innerParallelCallback(e);
                    });
                    
                    // write data to request body
                    req.write(JSON.stringify(appAddons));
                    req.end();
                  }
                ],
                function(err, results){ 
                  console.log('\nPARALLEL ACTION HEROKU RESULTS: ' + JSON.stringify(results));
                  innerCallback(null, newAppDetailsResponse);
                }
              );
            }
            /* DON'T NEED TO POLL THIS BECAUSE HEROKU OFFERS WEBHOOK. 
            function(newAppDetailsResponse, buildId, innerCallback){ // POLL BUILD SUCCESS
              var buildResponse;
              var appId = newAppDetailsResponse.id;
              var retryAttempts = 1;
              
              var options = {
                hostname: 'api.heroku.com',
                path: '/apps/' + appId + '/builds/' + buildId,
                method: 'GET',
                headers: {
                  "Accept" : "application/vnd.heroku+json; version=3",
                  "Authorization" : "OjZlZWIyZWIyLTQ4NjYtNDgyYy05ZDMzLTM0YzcyZTA3MmZkMgo="
                }
              };
              
              var retryFunction = function(){
                var operation = retry.operation({
                  retries: retryAttempts,
                  factor: 2,
                  minTimeout: 1 * 1000,
                  maxTimeout: 30 * 1000,
                  randomize: false,
                });
                
                operation.attempt(function(currentAttempt) {
                  console.log('\nCURRENT ATTEMPT: ' + currentAttempt);
                  var req = https.request(options, function(res) {
                    var responseString = '';
                    console.log('\N POLL BUILD STATUS: ' + res.statusCode);
                    //console.log('HEADERS: ' + JSON.stringify(res.headers));
                    res.setEncoding('utf8');
                    res.on('data', function (chunk) {
                      //console.log('\N POLL BUILD BODY: ' + chunk);
                      responseString += chunk;
                    });
                    res.on('end', function() {
                      buildResponse = JSON.parse(responseString);
                      console.log('\nPOLL BUILD RESPONSE: ' + JSON.stringify(buildResponse) + '\n');
                      if (buildResponse.status == 'failed') {
                        console.log('\nPROBLEM WITH REQUEST: ' + (buildResponse.status));
                        innerCallback(buildResponse.status);
                      } else if (operation.retry(buildResponse.status !== 'succeeded')) {
                        console.log('\nPROBLEM WITH REQUEST: ' + (buildResponse.status));
                        return;
                      } else {
                        if (buildResponse.status !== 'succeeded'){
                          innerCallback('retriesMaxedOut', newAppDetailsResponse);
                        } else {
                          console.log('\nBUILD SUCCEEDED');
                          innerCallback(null, newAppDetailsResponse);
                        }
                      }
                    });
                  });
                  req.on('error', function(e) {
                    if (operation.retry(e)) {
                      console.log('error problem with request: ' + e.message);
                      return;
                    }
                  });   
                  req.end();                
                });
              }
              retryFunction();
            }
            */
          ],
          function(err, newAppDetailsResponse){ // AFTER SUCCESSFUL BUILD, SEND DATA TO WEBHOOK
            if(err){
              callback(err);
            } else {
              callback(null, newAppDetailsResponse);
            }
          });
        }
      ],
      function(err, results){
        if (err) {
          console.log('err: ' + err + '\n');
          callback(err, '');  
        } else {
          console.log('\n--------------\nSUCCESSFUL DEPLOY!\n--------------\n' + results + '\n');
          callback(null, transformedData, results[results.length-1]);
        }
      });
  }
}