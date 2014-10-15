// REQUIRED LIBRARIES
var fs = require('fs');
var childProcess = require('child_process')
var async = require('async');
var jjv = require('jjv');
var _handlebars = require('handlebars');
var https = require('https');
var AWS = require('aws-sdk');
//AWS.config.update({region: 'US Standard'});


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

  // VALIDATE INPUT - ASYNC LIB
  this.localLaunch = function(transformedData, callback){
    async.series(
      [
        function(callback){ // EXECUTE TERMINAL COMMANDS
          var rootDir = '~/Dropbox/development/modelships/api-output/';
          var targetDir = rootDir + transformedData.data.apiOptions.apiName;
          var makeDirectoryCommand = 'mkdir '+ targetDir;
          executeSingleCommand(makeDirectoryCommand, callback);
          //callback(null, makeDirectoryCommand);
        },
        function(callback){ // EXECUTE TERMINAL COMMANDS
          var rootDir = '~/Dropbox/development/modelships/api-output/';
          var targetDir = rootDir + transformedData.data.apiOptions.apiName;
          var copyFilesCommand = 'cp -r generated/' + transformedData.data.apiOptions.apiName + '/* ' + targetDir ;
          executeSingleCommand(copyFilesCommand, callback);
          //callback(null, copyFilesCommand);
        },
        function(callback){ // WRITE BASH SCRIPT
          var rootDir = '~/Dropbox/development/modelships/api-output/';
          var targetDir = rootDir + transformedData.data.apiOptions.apiName;
          var directoryDetails = { "extension" : "sh", "location" : targetDir + '/', "sourceFilename" : "model_template", "filename" : transformedData.data.apiOptions.apiName, "launchTarget" : "local" };
          writeBash(directoryDetails, callback);
        },
        function(callback){ // EXECUTE TERMINAL COMMANDS
          var rootDir = '~/Dropbox/development/modelships/api-output/';
          var targetDir = rootDir + transformedData.data.apiOptions.apiName;
          var changeDirectoryCommand = 'cd ' + targetDir;
          executeSingleCommand(changeDirectoryCommand, callback);
          //callback(null, changeDirectoryCommand);
        },
        function(callback){ // EDIT BASH SCRIPT PERMISSIONS
          var bashFilename = 'bash_launcher.sh';
          var rootDir = '~/Dropbox/development/modelships/api-output/';
          var targetDir = rootDir + transformedData.data.apiOptions.apiName;
          var changePermissionsCommand = 'chmod 700 ' + targetDir + '/' + bashFilename;
          executeSingleCommand(changePermissionsCommand, callback);
        },
        function(callback){ // EXECUTE BASH SCRIPT
          var bashFilename = 'bash_launcher.sh';
          var rootDir = '~/Dropbox/development/modelships/api-output/';
          var targetDir = rootDir + transformedData.data.apiOptions.apiName;
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
          var rootDir = '~/Dropbox/development/modelships/api-output/';
          var targetDir = rootDir + transformedData.data.apiOptions.apiName;
          var makeDirectoryCommand = 'mkdir '+ targetDir;
          executeSingleCommand(makeDirectoryCommand, callback);
          //callback(null, makeDirectoryCommand);
        },
        function(callback){ // COPY FILES FROM GENERATED TO API-OUTPUT
          var rootDir = '~/Dropbox/development/modelships/api-output/';
          var targetDir = rootDir + transformedData.data.apiOptions.apiName;
          var copyFilesCommand = 'cp -r generated/' + transformedData.data.apiOptions.apiName + '/* ' + targetDir ;
          executeSingleCommand(copyFilesCommand, callback);
          //callback(null, copyFilesCommand);
        },
        function(callback){ // WRITE BASH SCRIPT
          var rootDir = '/Users/davegoldberg/Dropbox/development/modelships/api-output/';
          var targetDir = rootDir + transformedData.data.apiOptions.apiName;
          var directoryDetails = { "extension" : "sh", "location" : targetDir + '/', "sourceFilename" : "model_template", "filename" : transformedData.data.apiOptions.apiName, "launchTarget" : "Heroku" };
          writeBash(directoryDetails, callback);
        },
        function(callback){ // EXECUTE TERMINAL COMMANDS
          var rootDir = '~/Dropbox/development/modelships/api-output/';
          var targetDir = rootDir + transformedData.data.apiOptions.apiName;
          var changeDirectoryCommand = 'cd ' + targetDir;
          executeSingleCommand(changeDirectoryCommand, callback);
          //callback(null, changeDirectoryCommand);
        },
        function(callback){ // EDIT BASH SCRIPT PERMISSIONS
          var bashFilename = 'bash_launcher.sh';
          var rootDir = '~/Dropbox/development/modelships/api-output/';
          var targetDir = rootDir + transformedData.data.apiOptions.apiName;
          var changePermissionsCommand = 'chmod 700 ' + targetDir + '/' + bashFilename;
          executeSingleCommand(changePermissionsCommand, callback);
        },
        function(callback){ // EXECUTE BASH SCRIPT
          var bashFilename = 'bash_launcher.sh';
          var rootDir = '~/Dropbox/development/modelships/api-output/';
          var targetDir = rootDir + transformedData.data.apiOptions.apiName;
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
            console.log('Child process (Execute BASH) exited with exit code ' + code);
            callback(null, runBashCommand);
          });
        },
        function(callback){ // DEPLOY TARBALL OF GIT REPO TO AMAZON AWS
          var s3 = new AWS.S3();
          var tarballDir = '/Users/davegoldberg/Dropbox/development/modelships/api-output/tarballs/';
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
              if (err)
                console.log(err)
              else
                console.log('s3 data: ' + JSON.stringify(data));
                console.log('Successfully uploaded data to ' + bucketName + '/' + keyName);
                callback(null, { "success" : true });
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
                  innerCallback(null, newAppDetailsResponse);
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
            function(newAppDetailsResponse, innerCallback){ // ADD ADDONS TO HEROKU APP
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
                  innerCallback(null, res.statusCode);
                });
              });
              
              req.on('error', function(e) {
                console.log('problem with request: ' + e.message);
                innerCallback(e);
              });
              
              // write data to request body
              req.write(JSON.stringify(appAddons));
              req.end();
            },
            function(addonResponse, innerCallback){ // CREATE HEROKU BUILD
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
                console.log('STATUS: ' + res.statusCode);
                console.log('HEADERS: ' + JSON.stringify(res.headers));
                res.setEncoding('utf8');
                res.on('data', function (chunk) {
                  console.log('BODY: ' + chunk);
                  responseString += chunk;
                });
                res.on('end', function() {
                  buildResponse = JSON.parse(responseString);
                  console.log('\nbuild: ' + JSON.stringify(buildResponse) + '\n');
                  innerCallback(null, res.statusCode);
                });
              });
              
              req.on('error', function(e) {
                console.log('problem with request: ' + e.message);
                innerCallback(e);
              });
              
              // write data to request body
              req.write(JSON.stringify(sourceBlobObject));
              req.end();
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
}