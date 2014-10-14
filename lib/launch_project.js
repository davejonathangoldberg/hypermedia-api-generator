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
                console.log("Successfully uploaded data to " + bucketName + "/" + keyName);
                callback(null, { "success" : true });
            });
          });
        },
        function(callback){ // CREATE NEW HEROKU APP
          var resultObject;
          var appDetails = {
            "name": transformedData.data.apiOptions.apiName + "-ms"
            };
            
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
              resultObject = JSON.parse(responseString);
              console.log(JSON.stringify("resultObject: " + resultObject));
              callback(null, resultObject);
            });
          });
          
          req.on('error', function(e) {
            console.log('problem with request: ' + e.message);
          });
          
          // write data to request body
          req.write(JSON.stringify(appDetails));
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
}