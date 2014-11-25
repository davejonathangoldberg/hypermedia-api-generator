// REQUIRED LIBRARIES
var fs = require('fs');
var childProcess = require('child_process')
var async = require('async');
var jjv = require('jjv');
var _handlebars = require('handlebars');
var http = require('http');
var https = require('https');
var AWS = require('aws-sdk');
var retry = require('retry');
var url = require('url');

var Composer = require('./composer.js');
var composer = new Composer();
//AWS.config.update({region: 'US Standard'});

function apiResponseObject(data, callback){
  var responseObject;
  responseObject = {
    "_links": {
        "self": {
            "href": data.selfUrl + '/apis/' + data.apiId
        },
        "deployedApi" : {
            "href": data.deployedApiUrl
        },
        "modelshipApiDescription" : {
            "href" : data.modelshipApiDescriptionUrl
        },
        "swaggerApiDescription" : {
            "href" : data.swaggerApiDescriptionUrl
        }
    },
    "id" : data.apiId,
    "apiName" : data.apiName,
    "status" : data.status,
    "createdDate" : data.createdDate,
    "modifiedDate" : data.modifiedDate
  };
  callback(null, responseObject);
}

function pollAppTest(data, callback){
  console.log('\n\nPOLL APP TEST');
  var appResponse;
  var options = {
    hostname: 'api.heroku.com',
    path: '/apps/' + data.appId,
    method: 'GET',
    headers: {
      "Accept" : "application/vnd.heroku+json; version=3",
      "Authorization" : "OjZlZWIyZWIyLTQ4NjYtNDgyYy05ZDMzLTM0YzcyZTA3MmZkMgo="
    }
  };
  
  var req = https.request(options, function(res) {
    var responseString = '';
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      console.log('BODY: ' + chunk);
      responseString += chunk;
    });
    res.on('end', function() {
      appResponse = responseString;
      if((res.statusCode === 200) || (res.statusCode === 201) || (res.statusCode === 202)){
        console.log('\n\n POLL APP TEST - success - app response: ' + res.statusCode + ', ' + JSON.stringify(appResponse));
        callback(null, appResponse);
      } else {
        console.log('\n\n POLL APP TEST - failure - app response: ' + res.statusCode + ', ' + JSON.stringify(appResponse));
        var err = {
          "name" : "Heroku API Error",
          "code" : 500,
          "type" : "3rd Party",
          "value" : "Heroku API Call Failed."
        };
        callback(err);
      }
    });
  });
  
  req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
    var err = {
      "name" : "Heroku API Error",
      "code" : 500,
      "type" : "3rd Party",
      "value" : e.message
    };
    callback(err);
  });
  
  req.end();
}

function getApiInfo(data, callback){
  console.log('\n\nGET API INFO TEST');
  var queryData = {};
  var apiObject = {};
  queryData.queryKey = 'id';
  queryData.queryValue = data.apiId;
  composer.retrieveApi(queryData, function(err, record){
    if(err){
      if(err.code == 404){
        callback(err);
      } else {
        callback(err);
      }
    } else {
      console.log('\n\nGET API INFO TEST typeOf record.instance.input: ' + typeof(record.instance.input));
      if(typeof(record.instance) == 'undefined' || record.instance == ''){
        callback(err);
      } else {
        apiObject['apiId'] = record.instance.id;
        apiObject['apiName'] = record.instance.name;
        apiObject['status'] = record.instance.status;
        apiObject['createdDate'] = record.instance.createdDate;
        apiObject['modifiedDate'] = record.instance.modifiedDate;
        apiObject['selfUrl'] = process.env['BASE_URL']; //TBD
        apiObject['deployedApiUrl'] = record.instance.productionUrl || '';
        apiObject['modelshipApiDescriptionUrl'] = process.env['BASE_URL'] + '/apis/' + record.instance.id + '/api-sec'; //TBD
        apiObject['swaggerApiDescriptionUrl'] = process.env['BASE_URL'] + '/apis/' + record.instance.id + '/swagger'; //TBD
        apiResponseObject(apiObject, callback);
      }
    }
  });
}

function notifySuccess(webhookUrlDomain, appInfo, apiInfo, callback){
  console.log('\n\nNOTIFY SUCCESS TEST - XXX');
  var notifyHookResponse;
  var webhookHost = url.parse(webhookUrlDomain).hostname;
  var webhookPort = url.parse(webhookUrlDomain).port;
  var webhookPath = url.parse(webhookUrlDomain).path;
  var options = {
    hostname: webhookHost,
    port: webhookPort,
    path: webhookPath + '/' + apiInfo.apiId,
    method: 'POST',
    headers: {
      "Content-Type" : "application/json"
    }
  };
  console.log('\n\nNOTIFY SUCCESS HOST: ' + webhookHost);
  console.log('\n\nNOTIFY SUCCESS PORT: ' + webhookPort);
  console.log('\n\nNOTIFY SUCCESS PATH: ' + webhookPath);
  console.log('\n\nNOTIFY SUCCESS OPTIONS PATH: ' + options.path);
  
  var req = http.request(options, function(res) {
    var responseString = '';
    console.log('STATUS: ' + res.statusCode);
    console.log('HEADERS: ' + JSON.stringify(res.headers));
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      console.log('BODY: ' + chunk);
      responseString += chunk;
    });
    res.on('end', function() {
      notifyHookResponse = JSON.parse(responseString);
      if((res.statusCode === 200) || (res.statusCode === 201) || (res.statusCode === 202)){
        console.log('\n\n NOTIFY HOOK TEST - success - app response: ' + res.statusCode + ', ' + JSON.stringify(notifyHookResponse));
        callback(null, notifyHookResponse);
      } else {
        console.log('\n\n NOTIFY HOOK TEST - failure - app response: ' + res.statusCode + ', ' + JSON.stringify(notifyHookResponse));
        var err = {
          "name" : "ModelShip API Error",
          "code" : 500,
          "type" : "ModelShip",
          "value" : "ModelShip API Call Failed."
        };
        callback(err);
      }
    });
  });
  
  req.on('error', function(e) {
    console.log('\n\n NOTIFY HOOK TEST - ERROR - app response: ' + JSON.stringify(e));
    var err = {
      "name" : "ModelShip API Error",
      "code" : 500,
      "type" : "ModelShip",
      "value" : "ModelShip API Call Failed."
    };
    callback(err);
  });
  
  req.write(appInfo);
  req.end();
}

function executeSingleCommand(command, callback){
  var terminalCommand;
  terminalCommand = childProcess.exec(command, function (error, stdout, stderr) {
    if (error) {
      console.log(error.stack);
      console.log('Error code: '+ error.code);
      console.log('Signal received: '+ error.signal);
    } else {
    console.log('command: '+ command);
    //console.log('Child Process STDOUT: '+stdout);
    //console.log('Child Process STDERR: '+stderr);
    }
  });
  terminalCommand.on('exit', function (code) {
    console.log('Child process (executeSingleCommand: ' + command + ') exited with exit code ' + code);
    callback(null, true);
  });
}

function writeBash(directoryDetails, callback){
  var counter = 0;
  var sourceFile = directoryDetails.launchTarget == "local" ? './templates/bash_launcher.handlebars' : './templates/bash_heroku_launcher.handlebars';
  console.log('sourceFile = ' + sourceFile);
  fs.readFile(sourceFile, 'utf8', function (err,fileData) {
    console.log('reading sourceFile');
    if (err) {
      console.log(err);
      callback(err);
    }
    var template = _handlebars.compile(fileData);
    var completeTemplate = template(directoryDetails);
    var filename = 'bash_launcher';
    console.log('completeTemplate: ' + completeTemplate + '\n');
    var outputFile = fs.createWriteStream(directoryDetails.location + filename + '.sh');
    outputFile.on('finish', function () {
      console.log('Bash file has been written');
    });
    outputFile.write(completeTemplate);
    outputFile.end();
    callback(null, '');
  });
}

module.exports = function LaunchProject() {  
  // ENV VARIABLE SET
  var rootDir = process.env['ROOT_DIR'] || '/Users/davegoldberg/Dropbox/development/modelships';
  var webhookUrlDomain = process.env['WEBHOOK_URL_DOMAIN'] || 'http://localhost:3000';
  console.log('\nROOT_DIR: ' + rootDir);
  console.log('\WEBHOOK_URL_DOMAIN: ' + webhookUrlDomain);
  // VALIDATE INPUT - ASYNC LIB
  this.localLaunch = function(transformedData, callback){
    async.series(
      [
        function(callback){ // EXECUTE TERMINAL COMMANDS
          //var rootDir = '~/Dropbox/development/modelships/api-output/';
          var targetDir = rootDir + '/api-output/' + transformedData.data.apiOptions.apiName;
          var makeDirectoryCommand = 'mkdir '+ targetDir;
          executeSingleCommand(makeDirectoryCommand, callback);
          //callback(null, makeDirectoryCommand);
        },
        function(callback){ // EXECUTE TERMINAL COMMANDS
          //var rootDir = '~/Dropbox/development/modelships/api-output/';
          var targetDir = rootDir + '/api-output/' + transformedData.data.apiOptions.apiName;
          var copyFilesCommand = 'cp -r generated/' + transformedData.data.apiOptions.apiName + '/* ' + targetDir ;
          executeSingleCommand(copyFilesCommand, callback);
          //callback(null, copyFilesCommand);
        },
        function(callback){ // WRITE BASH SCRIPT
          //var rootDir = '~/Dropbox/development/modelships/api-output/';
          var targetDir = rootDir + '/api-output/' + transformedData.data.apiOptions.apiName;
          var directoryDetails = { "extension" : "sh", "location" : targetDir + '/', "sourceFilename" : "model_template", "filename" : transformedData.data.apiOptions.apiId, "launchTarget" : "local" };
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
              console.log('Error code: '+ error.code);
              console.log('Signal received: '+ error.signal);
            } else {
            console.log('command: '+ runBashCommand);
            //console.log('Child Process STDOUT: '+stdout);
            //console.log('Child Process STDERR: '+stderr);
            }
          });
          terminalCommand.on('exit', function (code) {
            console.log('Child process exited with exit code ' + code);
          });
          callback(null, runBashCommand);
        }
      ],
      function(err, results){
        if (err) {
          console.log('err: ' + err + '\n');
          callback(err, '');  
        } else {
          //console.log('L results: ' + results + '\n');
          callback(null, true);
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
          var directoryDetails = { "extension" : "sh", "location" : targetDir + '/', "sourceFilename" : "model_template", "filename" : transformedData.data.apiId, "launchTarget" : "Heroku" };
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
          var keyName = transformedData.data.apiId + '.tar.gz';
          
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
                    var tarballUrl = 'https://s3.amazonaws.com/ms-tarballs/' + transformedData.data.apiId + '.tar.gz';
                    var tarballVersion = transformedData.data.apiId;
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
                  function(innerParallelCallback){ // ADD WEB HOOK ADD-ON TO HEROKU APP (THIS APP)
                    var addonResponse;
                    var appId = newAppDetailsResponse.id;
                    var appAddons = { "plan": "deployhooks:http", "config" : { "url" : webhookUrlDomain + '/' + transformedData.data.apiId } };
                    console.log('appAddons: ' + appId);
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
                          var err = {
                            "name" : "Heroku API Error",
                            "code" : 500,
                            "type" : "3rd Party",
                            "value" : "Heroku API Call Failed."
                          };
                          innerParallelCallback(err);
                        }
                      });
                    });
                    
                    req.on('error', function(e) {
                      console.log('problem with request: ' + e.message);
                      var err = {
                        "name" : "Heroku API Error",
                        "code" : 500,
                        "type" : "3rd Party",
                        "value" : e.message
                      };
                      innerParallelCallback(err);
                    });
                    
                    // write data to request body
                    req.write(JSON.stringify(appAddons));
                    req.end();
                  },
                  function(innerParallelCallback){ // POLL FOR SUCCESS IN CASE OF WEB HOOK FAIL
                    /*
                     * START INTERVAL - EVERY 30 SECONDS
                     * IF COUNTER < 30
                     *  GET API INFO
                     *    IF STATUS IS PENDING
                     *      GET HEROKU APP INFO
                     *        IF WEB URL EXISTS
                     *          NOTIFY SUCCESS WEBHOOK
                     *        ELSE
                     *          INCREMENT COUNTER
                     *    ELSE IF STATUS IS ACTIVE
                     *      CANCEL INTERVAL
                     * ELSE
                     *   NOTIFY FAIL WEBHOOK
                     */
                    var delay = 30000;
                    var intervalCounter = 0;
                    var apiInput = { "apiId" : transformedData.data.apiId, "appId" : newAppDetailsResponse.id, "webhookUrl" : encodeURIComponent(transformedData.data.apiOptions.webhookUrl) };
                    var intervalObject = setInterval(function(){
                      console.log('\n\nInterval Count: ' + intervalCounter);
                      if(intervalCounter < 30) {
                        getApiInfo(apiInput, function(err, apiInfo){
                          if(err){
                            console.log('\n\nInterval Error, getApiInfo, IntervalCount: ' + intervalCounter);
                            clearInterval(intervalObject);
                            console.error(err);
                          } else {
                            if(apiInfo.status == 'pending'){
                              pollAppTest(apiInput, function(err, appInfo){
                                console.log("\n\nappInfo: " + appInfo);
                                console.log("webhookUrl: " + JSON.stringify(encodeURIComponent(transformedData.data.apiOptions.webhookUrl)));
                                if(err){
                                  intervalCounter++;
                                  console.error(err);
                                } else {
                                  console.log("\n\nappInfo: " + appInfo);
                                  notifySuccess(webhookUrlDomain, appInfo, apiInput, function(){
                                    console.log("NOTIFY SUCCESS CALLBACK CALLED. XXX");
                                  });
                                }
                              });                              
                            } else if(apiInfo.status == 'active'){
                              clearInterval(intervalObject);
                              console.log("Interval Event: apiInfo.status == active, interval was cleared.");
                            } else {
                              console.log('\n\nInterval Error, STATUS OF API IN DB IS NOT ACTIVE OR PENDING, IntervalCount: ' + intervalCounter);
                              clearInterval(intervalObject);
                            }
                          }
                        });
                      } else {
                        clearInterval(intervalObject);
                        console.log('Interval timeout, counter at ' + intervalCounter);
                      }
                    }, delay);
                    innerParallelCallback(null, 'Interval Poll Webhook');
                  }
                ],
                function(err, results){ 
                  console.log('\nPARALLEL ACTION HEROKU RESULTS: ' + JSON.stringify(results));
                  var updateSwagger = {};
                  var host = '';
                  host = newAppDetailsResponse['web_url'].split("://")[1];
                  if(host.substr(-1) == '/') {
                    host = host.substr(0, host.length - 1);
                  }
                  updateSwagger['queryKey'] = 'id';
                  updateSwagger['queryValue'] = transformedData['data']['apiId'];
                  updateSwagger['updateObject'] = { "swagger.host" : host };
                  console.log("\n\n\n\nUPDATE SWAGGER: " + JSON.stringify(updateSwagger));
                  composer.updateFunctionApi(updateSwagger, function(){console.log('updated')});
                  innerCallback(null, newAppDetailsResponse);
                }
              );
            }
          ],
          function(err, newAppDetailsResponse){ // STORE DATA IN DB
            if(err){
              callback(err);
            } else {
              var updateData = {};
              updateData['queryKey'] = 'id';
              updateData['queryValue'] = transformedData['data']['apiId'];
              updateData['updateObject'] = { "productionUrl" : newAppDetailsResponse['web_url'], "herokuAppName" : newAppDetailsResponse['name'] };
              console.log("\n\n\n\n\nSTORE DATA IN DB DATA: " + JSON.stringify(updateData));
              composer.updateApi(updateData, callback);
              //callback(null, newAppDetailsResponse);
            }
          });
        }
      ],
      function(err, results){
        if (err) {
          console.log('err: ' + err + '\n');
          callback(err, '');  
        } else {
          console.log('\n--------------\nSUCCESSFUL DEPLOY!\n--------------\n' + JSON.stringify(results) + '\n');
        }
      });
    callback(null, transformedData);
  }
}