// REQUIRED LIBRARIES
var fs = require('fs');
var childProcess = require('child_process')
var async = require('async');
var jjv = require('jjv');
var _handlebars = require('handlebars');

// FIXED STRUCTURES
var resourcesArray = [];
var completeResources = [];
var modelsObject = {};
var lineageArrays = {
  "lineageArray" : [],
  "titleLineageArray" : [],
  "altTitleLineageArray" : [],
  "nameArray" : [],
  "stubArray" : [],
  "resources" : [],
  "resourcesStubs" : []
};

function mapResources(resourcesArray, parentResource, modelsObject, callback) {
  var counter = 0;
  async.whilst(
      function() {
          return counter < resourcesArray.length;
      },
      function(cb) {
        var resource = resourcesArray[counter++];
        resource.titleName = resource.name.charAt(0).toUpperCase() + resource.name.slice(1);
        resource.altTitleName = (parentResource.lineage == '') ? resource.name : resource.titleName;
        resource.lineage = parentResource.lineage + resource.name;
        resource.titleLineage = parentResource.titleLineage + resource.titleName;
        resource.altTitleLineage = parentResource.altTitleLineage + resource.altTitleName;
        if (resource.isCollection) {
          lineageArrays.resources.push({"titleLineage" : resource.titleLineage, "lineage" : resource.lineage, "altTitleLineage" : resource.altTitleLineage, "name" : resource.name, "templateName" : resource.name});
          lineageArrays.titleLineageArray.push(resource.titleLineage);
          lineageArrays.lineageArray.push(resource.lineage);
          lineageArrays.altTitleLineageArray.push(resource.altTitleLineage);
          lineageArrays.nameArray.push(resource.name);
        }
        if (!resource.isCollection) {
          lineageArrays.stubArray.push({"titleLineage" : resource.titleLineage, "lineage" : resource.lineage, "altTitleLineage" : resource.altTitleLineage, "name" : resource.name, "templateName" : parentResource.name + resource.name});
        }
        if(resource.resources){
          mapResources(resource.resources, resource, cb);
        } else {
          cb();
        }
      },
      function(err) {
          callback(err); // loop over, come out
      }
  );
}

function mapModels(modelsArray, callback) {
  var counter = 0;
  async.whilst(
      function() {
          return counter < modelsArray.length;
      },
      function(cb) {
        var model = modelsArray[counter++];
        console.log('model: ' + JSON.stringify(model));
        modelsObject[model.title] = {};
        modelsObject[model.title]['modelObject'] = model;
        modelsObject[model.title]['modelString'] = JSON.stringify(model, null, 4);
        console.log('modelString: ' + JSON.stringify(model));
        cb();
      },
      function(err) {
          callback(err); // loop over, come out
      }
  );
}

function executeTerminalCommands(commands, callback){
  var counter = 0;
  async.whilst(
    function() {
      return counter < commands.length;
    },
    function(cb) {
      var terminalCommand;
      var command = commands[counter++];
      terminalCommand = childProcess.exec(command, function (error, stdout, stderr) {
        if (error) {
          console.log(error.stack);
          console.log('Error code: '+error.code);
          console.log('Signal received: '+error.signal);
        }
        console.log('Child Process STDOUT: '+stdout);
        console.log('Child Process STDERR: '+stderr);
      });
      terminalCommand.on('exit', function (code) {
        console.log('Child process exited with exit code ' + code);
        cb();
      });
    },
    function(err) {
      callback(err);
    }
  );
}

function writeEntryTemplates(entryFiles, callback){
  var counter = 0;
  async.whilst(
    function() {
      return counter < entryFiles.length;
    },
    function(cb) {
      var terminalCommand;
      var entryFile = entryFiles[counter++];
      fs.readFile('./templates/' + entryFile.name + '.handlebars', 'utf8', function (err,fileData) {
        if (err) {
          console.log(err);
          callback(err);
        }
        var template = _handlebars.compile(fileData);
        console.log('nameArray: ' + JSON.stringify(lineageArrays.nameArray) + '\n' );
        var completeTemplate = template(lineageArrays);
        var outputFile = fs.createWriteStream(entryFile.location + entryFile.filename + '.' + entryFile.extension);
        outputFile.on('finish', function () {
          console.log('file has been written');
          cb();
        });
        outputFile.write(completeTemplate);
        outputFile.end();
      });
    },
    function(err) {
      callback(err);
    }
  );
}

function writeTemplateFilesForResources(resourcesArray, templateDetails, resourceType, callback){
  var counter = 0;
  async.whilst(
    function() {
      return counter < resourcesArray.length;
    },
    function(cb) {
      var resource = resourcesArray[counter++];
      fs.readFile('./templates/resource_template.handlebars', 'utf8', function (err,fileData) {
        if (err) {
          console.log(err);
          callback(err);
        }
        var template = _handlebars.compile(fileData);
        resource.model = modelsObject[resource.name];
        var completeTemplate = template(resource);
        if (resourceType == 'collection'){
          var filename = resource.name;
        } else {
          var filename = resource.templateName;
        }
        var outputFile = fs.createWriteStream(templateDetails.location + filename + '.' + templateDetails.extension);
        outputFile.on('finish', function () {
          console.log('Template file has been written');
          cb();
        });
        outputFile.write(completeTemplate);
        outputFile.end();
      });
    },
    function(err) {
      callback(err);
    }
  );
}

function writeCompleteResources(completeResources, parentResource, modelsObject, callback) {
  async.map(completeResources, function(resource, cb) {
        resource.model = modelsObject[resource.name]['modelObject'];
        console.log('resource: ' + JSON.stringify(resource) + '\n');
        if(resource.resources){
          writeCompleteResources(resource.resources, resource, modelsObject, cb);
        } else {
          cb(null, resource);
        }
      },
      function(err, results) {
          console.log('map results: ' + JSON.stringify(results) + '\n');
          console.log('completeResources: ' + JSON.stringify(completeResources) + '\n');
          console.log('models: ' + JSON.stringify(modelsObject) + '\n');
          callback(err, results); 
      }
  );
}

module.exports = function WriteProject(app) {  

  // VALIDATE INPUT - ASYNC LIB
  this.projectStructure = function(data, callback){
    completeResources = data.apiResources.resources;
    async.series(
      [
        function(callback){ // MAP DATA TO INCLUDE LINEAGE
          var parentResourceName = '';
          resourcesArray = data.apiResources.resources;
          mapResources(resourcesArray, {"name" : "", "lineage" : "", "titleLineage" : "", "altTitleLineage" : ""}, callback);
        },
        function(callback){ // MAP MODELS FROM ARRAY INTO OBJECT
          modelsArray = data.apiModels;
          mapModels(modelsArray, callback);
        },
        function(callback){ // EXECUTE TERMINAL COMMANDS
          var commands = [];
          var makeDirectoryCommand = 'mkdir -p generated/' + data.apiOptions.apiName + '/{models,routes/{' + lineageArrays.lineageArray.join() + '},shared,templates,views}';
          var copyFilesCommand = 'cp -r staticSource/* generated/' + data.apiOptions.apiName + '/';
          commands.push(makeDirectoryCommand, copyFilesCommand);
          executeTerminalCommands(commands, callback);
        },
        function(callback){ // WRITE RESOURCE ENTRIES INTO ENTRY FILES
          var entryFiles = [];
          var modelsObject = { "filename" : "index", "extension" : "js", "name" : "models", "location" : "./generated/" + data.apiOptions.apiName + "/models/" };
          var templatesObject = { "filename" : "index", "extension" : "js", "name" : "templates", "location" : "./generated/" + data.apiOptions.apiName + "/templates/" };
          var serverObject = { "filename" : "server", "extension" : "js", "name" : "server", "location" : "./generated/" + data.apiOptions.apiName + "/" };
          entryFiles.push(modelsObject, templatesObject, serverObject);
          writeEntryTemplates(entryFiles, callback);
        },
        function(callback){ // CREATE TEMPLATE FILE FOR EACH RESOURCE
          var templateDetails = { "extension" : "js", "location" : "./generated/" + data.apiOptions.apiName + "/templates/" };
          writeTemplateFilesForResources(lineageArrays.resources, templateDetails, 'collection', callback);
        },
        function(callback){ // CREATE TEMPLATE FILE FOR EACH RESOURCE STUB
          var templateDetails = { "extension" : "js", "location" : "./generated/" + data.apiOptions.apiName + "/templates/" };
          console.log('stubArray: ' + JSON.stringify(lineageArrays.stubArray) +  '\n');
          writeTemplateFilesForResources(lineageArrays.stubArray, templateDetails, 'stub', callback);
        },
        function(callback){ // WRITE MODELS
          writeCompleteResources(completeResources, {"name" : "", "lineage" : "", "titleLineage" : "", "altTitleLineage" : ""}, modelsObject, callback);  
        }
      ],
      function(err, results){
        if (err) {
          console.log('err: ' + err + '\n');
          callback(err, '');  
        } else {
          console.log('WATERFALL Child process exited with exit code ' + JSON.stringify(results) + '\n');
          callback(null, true);
        }
      });  
  }
}