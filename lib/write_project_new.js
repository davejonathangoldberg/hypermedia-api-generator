// REQUIRED LIBRARIES
var fs = require('fs');
var childProcess = require('child_process')
var async = require('async');
var jjv = require('jjv');
var _handlebars = require('handlebars');

_handlebars.registerHelper('CapitalizeFirstLetter', function(string){
  return string.charAt(0).toUpperCase() + string.slice(1);
});

function executeTerminalCommands(commands, callback){
  var counter = 0;
  async.whilst(
    function() {
      return counter < commands.length;
    },
    function(cb) {
      var terminalCommand;
      var command = commands[counter++];
      console.log('\NCOMMAND: ' + command);
      terminalCommand = childProcess.exec(command, function (error, stdout, stderr) {
        if (error) {
          console.log(error.stack);
          console.log('Error code: '+error.code);
          console.log('Signal received: '+error.signal);
        }
        //console.log('Child Process STDOUT: '+stdout);
        //console.log('Child Process STDERR: '+stderr);
      });
      terminalCommand.on('exit', function (code) {
        console.log('Child process exited with exit code ' + code);
        cb();
      });
    },
    function(err) {
      callback(err, true);
    }
  );
}

function writeEntryTemplates(transformedData, callback){
  var counter = 0;
  async.whilst(
    function() {
      return counter < transformedData.entryFiles.length;
    },
    function(cb) {
      var terminalCommand;
      var entryFile = transformedData.entryFiles[counter++];
      fs.readFile('./templates/' + entryFile.name + '.handlebars', 'utf8', function (err,fileData) {
        if (err) {
          console.log(err);
          callback(err);
        }
        var template = _handlebars.compile(fileData);
        var completeTemplate = template(transformedData.lineageArrays);
        var outputFile = fs.createWriteStream(entryFile.location + entryFile.filename + '.' + entryFile.extension);
        outputFile.on('finish', function () {
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

function writeTemplateFilesForResources(transformedData, templateDetails, resourceType, callback){
  var counter = 0;
  async.whilst(
    function() {
      return counter < transformedData.lineageArrays.resources.length;
    },
    function(cb) {
      var resource = transformedData.lineageArrays.resources[counter++];
      fs.readFile('./templates/resource_template.handlebars', 'utf8', function (err,fileData) {
        if (err) {
          console.log(err);
          callback(err);
        }
        var template = _handlebars.compile(fileData);
        resource.model = transformedData.modelsObject[resource.name];
        var completeTemplate = template(resource);
        if (resourceType == 'collection'){
          var filename = resource.name;
        } else {
          var filename = resource.templateName;
        }
        var outputFile = fs.createWriteStream(templateDetails.location + filename + '.' + templateDetails.extension);
        outputFile.on('finish', function () {
          //console.log('Template file has been written');
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
/*
function writeModels(transformedData, templateDetails, callback){
  var counter = 0;
  async.whilst(
    function() {
      return counter < transformedData.lineageArrays.resources.length;
    },
    function(cb) {
      var resource = transformedData.lineageArrays.resources[counter++];
      fs.readFile('./templates/' + templateDetails.sourceFilename + '.handlebars', 'utf8', function (err,fileData) {
        if (err) {
          console.log(err);
          callback(err);
        }
        var template = _handlebars.compile(fileData);
        var completeTemplate = template(transformedData.lineageArrays.resourceObjects[resource.name]);
        var filename = resource.name;
        var outputFile = fs.createWriteStream(templateDetails.location + filename + '.' + templateDetails.extension);
        outputFile.on('finish', function () {
          //console.log('Template file has been written');
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
*/
function recurseWriteViewsOutput(resourceObject, outputFile, propertyKeyParent, resourceName, instance, callback){
  console.log('resourceObject: ' + JSON.stringify(resourceObject) + '\n');
  if(!propertyKeyParent && !instance){
    var templateString = 
      ['\t\t\t\t{',
       '\t\t\t\t\t"_links" : {',
       '\t\t\t\t\t\t"self": { "href": "{{path}}{{id}}" }',
       '\t\t\t\t\t},\n'].join('\n');
    outputFile.write(templateString);
  }
  var fieldArray = Object.keys(resourceObject);
  var counter = 0;
  async.whilst(
    function() {
      return counter < fieldArray.length;
    },
    function(cb) {
      var field = fieldArray[counter++];
      if(resourceObject[field].type === 'object'){
        outputFile.write('"' + field + '" : ');
        propKeyParent = propertyKeyParent ? propertyKeyParent + '.' + field : field;
        recurseWriteViewsOutput(resourceObject[field].properties, outputFile, propKeyParent, resourceName, instance, cb);
      } else {
        var propKeyParent = propertyKeyParent ? propertyKeyParent + '.' + field : field;
        if(instance){
          if (counter == fieldArray.length){
            outputFile.write('"' + field + '" : "{{' + resourceName + '.' + propKeyParent + '}}"\n');
          } else {
            outputFile.write('"' + field + '" : "{{' + resourceName + '.' + propKeyParent + '}}",\n');
          }
        } else {
          if (counter == fieldArray.length){
            outputFile.write('"' + field + '" : "{{' + propKeyParent + '}}"\n');
          } else {
            outputFile.write('"' + field + '" : "{{' + propKeyParent + '}}",\n');
          }
        }
        cb();
      }
    },
    function(err) {
      if( err ) {
        callback(err);
      } else {
        var suffixWrite = propertyKeyParent ? '},\n' : '\t\t\t\t}';
        if(!instance){
          outputFile.write(suffixWrite);
        } 
        callback();
      }
    }
  );
}

function writeViews(transformedData, templateDetails, callback){
  var counter = 0;
  async.whilst(
    function() {
      return counter < transformedData.lineageArrays.resources.length;
    },
    function(cb) {
      var resource = transformedData.lineageArrays.resources[counter++];
      var filename = resource.name;
      var resourceModel = transformedData.lineageArrays.resourceObjects[resource.name].model.properties;
      var outputFile = fs.createWriteStream(templateDetails.location + filename + '_hal.' + templateDetails.extension);
      outputFile.on('finish', function () {
        cb();
      });
      // INSERT ASYNC.SERIES FOR EACH OUTPUT FILE OPERATION
      async.series(
        [
          function(callback_inner){
            var templateString = 
              ['{',
               '\t"_links": {',
               '\t\t"self": { "href": "{{ path }}" },',
               '\t\t{{#if parent}}"parent" : { "href" : "{{parent}}" },{{/if}}',
               '\t\t{{#if children}}',
               '\t\t\t{{#each children}}',
               '\t\t\t\t"{{this}}" : { "href" : "{{../path}}/{{this}}" },',
               '\t\t\t{{/each}}',
               '\t\t{{/if}}',
               '\t\t"curies": [{ "name": "' + resource.name + '", "href": "http://example.com/docs/rels/' + resource.name + '", "templated": false }]',
               '\t},',
               '\t{{#if collection}}',
               '\t"_embedded" : {',
               '\t\t"' + resource.name + '" : [',
               '\t\t\t{{#each ' + resource.name + '}}\n'].join('\n');
            outputFile.write(templateString);
            callback_inner(null,{"templateString" : true});
          },
          function(callback_inner){
            recurseWriteViewsOutput(resourceModel, outputFile, null, resource.name, false, callback_inner);
          },
          function(callback_inner){
            //console.log('after 1\n');
            var templateString = 
              ['{{#unless @last}},{{/unless}}',
               '\t\t\t{{/each}}',
               '\t\t]',
               '\t}',
               '\t{{else}}\n'].join('\n');
            outputFile.write(templateString);
            callback_inner(null,{"templateString" : true});
          },
          function(callback_inner){
            recurseWriteViewsOutput(resourceModel, outputFile, null, resource.name, true, callback_inner);
          },
          function(callback_inner){
            console.log('after 2\n');
            var templateString = 
              ['\t{{/if}}',
               '}'].join('\n');
            outputFile.write(templateString);
            callback_inner(null,{"templateString" : true});
          },
          function(callback_inner){
            outputFile.end();
          }
        ],
        function(err, results){
          if (err) {
            console.log('err: ' + err + '\n');
          } 
        });
    },
    function(err) {
      callback(err);
    }
  );
}

function writeRootView(transformedData, templateDetails, callback){
  var filename = 'root';
  var outputFile = fs.createWriteStream(templateDetails.location + filename + '_hal.' + templateDetails.extension);
  outputFile.on('finish', function () {
    callback();
  });
  // INSERT ASYNC.SERIES FOR EACH OUTPUT FILE OPERATION
  async.series(
    [
      function(callback_inner){
        var templateString = 
          ['{',
           '\t"_links": {',
           '\t\t"self": { "href": "/" },',
           '\t\t{{#if parent}}"parent" : { "href" : "{{parent}}" },{{/if}}',
           '\t\t{{#if children}}',
           '\t\t\t{{#each children}}',
           '\t\t\t\t"{{this}}" : { "href" : "{{../path}}/{{this}}" },',
           '\t\t\t{{/each}}',
           '\t\t{{/if}}',
           '\t\t"curies": [{{#each children}}{ "name": "{{this}}", "href": "http://example.com/docs/rels/{{this}}", "templated": false }{{#unless @last}},{{/unless}}{{/each}}]',
           '\t}',
           '}\n'].join('\n');
        outputFile.write(templateString);
        callback_inner(null,{"templateString" : true});
      },
      function(callback_inner){
        outputFile.end();
      }
    ],
    function(err, results){
      if (err) {
        console.log('err: ' + err + '\n');
        callback(err)
      } else {
        callback(null, 'success');
      }
    });
}

function recurseWriteModelsOutput(resourceObject, outputFile, pType, callback){
  var fieldArray = Object.keys(resourceObject);
  var counter = 0;
  async.whilst(
    function() {
      return counter < fieldArray.length;
    },
    function(cb) {
      var field = fieldArray[counter++];
      if (field !== 'id'){
        switch(resourceObject[field].type){
          case 'object':
            outputFile.write('"' + field + '" : {\n\t\t');
            recurseWriteModelsOutput(resourceObject[field].properties, outputFile, 'object', cb);
            break;
          case 'string':
            if (counter == fieldArray.length && pType !== 'top'){
              outputFile.write('"' + field + '" : { type: String, required: true }\n\t\t');
            } else {
              outputFile.write('"' + field + '" : { type: String, required: true },\n\t\t');
            }
            cb();
            break;
          case 'null':
            if (counter == fieldArray.length && pType !== 'top'){
              outputFile.write('"' + field + '" : { type: String, required: true }\n\t\t');
            } else {
              outputFile.write('"' + field + '" : { type: String, required: true },\n\t\t');
            }
            cb();
            break;
          case 'boolean':
            if (counter == fieldArray.length && pType !== 'top'){
              outputFile.write('"' + field + '" : { type: Boolean, required: true }\n\t\t');
            } else {
              outputFile.write('"' + field + '" : { type: Boolean, required: true },\n\t\t');
            }
            cb();
            break;
          case 'integer':
            if (counter == fieldArray.length && pType !== 'top'){
              outputFile.write('"' + field + '" : { type: Number, required: true }\n\t\t');
            } else {
              outputFile.write('"' + field + '" : { type: Number, required: true },\n\t\t');
            }
            cb();
            break;
          case 'number':
            if (counter == fieldArray.length && pType !== 'top'){
              outputFile.write('"' + field + '" : { type: Number, required: true }\n\t\t');
            } else {
              outputFile.write('"' + field + '" : { type: Number, required: true },\n\t\t');
            }
            cb();
            break;
          case 'array':
            outputFile.write(field + '[');
            recurseWriteModelsOutput(resourceObject[field].properties, outputFile, 'array', cb);
            cb();
            break;
        }
      } else cb();
    },
    function(err) {
      if( err ) {
        callback(err);
      } else {
        if (pType == 'top' && fieldArray.length > 0 ){
          outputFile.write('\n');
          callback();
        } else if(pType == 'top') {
          callback();
        } else if(pType == 'array') {
          outputFile.write('],');
          callback();
        } else {
          outputFile.write('},');  
          callback();
        }
      }
    }
  );
}

function writeModels(transformedData, templateDetails, callback){
  console.log('In writeModels\n');
  var counter = 0;
  var uniqueResourcesArray = Object.keys(transformedData.lineageArrays.resourceObjects);
  //console.log('uniqueResourcesArray.length: ' + uniqueResourcesArray.length + '\n');
  async.whilst(
    function() {
      return counter < uniqueResourcesArray.length;
    },
    function(cb) {
      var resource = uniqueResourcesArray[counter++];
      var filename = resource;
      //console.log('resource: ' + resource + '\n');
      var resourceModel = transformedData.lineageArrays.resourceObjects[resource].model.properties;
      var parentResources = transformedData.lineageArrays.resourceObjects[resource].parentResources;
      var childResources = transformedData.lineageArrays.resourceObjects[resource].childResources;
      //console.log('parentResources: ' + parentResources + '\n');
      var resourceCap = resource.charAt(0).toUpperCase() + resource.slice(1);
      var outputFile = fs.createWriteStream(templateDetails.location + filename + '.' + templateDetails.extension);
      outputFile.on('finish', function () {
        cb();
      });
      // INSERT ASYNC.SERIES FOR EACH OUTPUT FILE OPERATION
      async.series(
        [
          function(callback_inner){
            outputFile.write('var mongoose = require(\'mongoose\');\nvar Schema = mongoose.Schema,\nObjectId = Schema.ObjectId;\n\n');
            callback_inner(null,{"line1" : true});
          },
          function(callback_inner){
            outputFile.write('var ' + resource + 'Schema = new Schema({\n');
            callback_inner(null,{"line2" : true});
          },
          function(callback_inner){
            outputFile.write('\t"id" : { type: String, unique: true, required: true },\n');
            callback_inner(null,{"line3" : true});
          },
          function(callback_inner){
            outputFile.write('\t');
            recurseWriteModelsOutput(resourceModel, outputFile, 'top', callback_inner);
            //callback_inner(null,{"line3" : true});
          },
          function(callback_inner){
            outputFile.write('\t"' + resource + '_" : [{ type: String, unique: true, required: true }],\n');
            callback_inner(null,{"line3" : true});
          },
          function(callback_inner){
            async.each(parentResources, function(parentResource, callback) {
              outputFile.write('\t"' + parentResource + '_" : [{ type: String, unique: true, required: true }],\n');
              callback();
            }, function(err){
                if( err ) {
                  console.log('Something went wrong processing a parentResource while writing the ' + resource + 'model.');
                } else {
                  console.log('All parentResources have been processed into the ' + resource + 'model.');
                  callback_inner(null,"each");
                }
            });
          },
          function(callback_inner){
            outputFile.write('\t"createdDate" : { type: Date, required: true },\n');
            callback_inner(null,{"line6" : true});
          },
          function(callback_inner){
            outputFile.write('\t"modifiedDate" : { type: Date, required: true }\n');
            callback_inner(null,{"line6" : true});
          },
          function(callback_inner){
            outputFile.write('}, { collection: \'' + resource + '\'});\n\n');
            callback_inner(null,{"line2" : true});
          },
          function(callback_inner){
            outputFile.write(resourceCap + ' = mongoose.model(\'' + resourceCap + '\', ' + resource + 'Schema);\n\n');
            callback_inner(null,{"line9" : true});
          },
          function(callback_inner){
            outputFile.write('module.exports = ' + resourceCap + ';');
            callback_inner(null,{"line10" : true});
          },
          function(callback_inner){
            outputFile.end();
            callback_inner(null,{"line11" : true});
          }
        ],
        function(err, results){
          if (err) {
            console.log('err: ' + err + '\n');
          } 
        });
    },
    function(err) {
      callback(err);
    }
  );
}

function writeMeta(transformedData, templateDetails, callback){
  var counter = 0;
  fs.readFile('./templates/meta.handlebars', 'utf8', function (err,fileData) {
    if (err) {
      console.log(err);
      callback(err);
    }
    var template = _handlebars.compile(fileData);
    var completeTemplate = template(transformedData.lineageArrays);
    var outputFile = fs.createWriteStream(templateDetails.location + 'meta.js');
    outputFile.on('finish', function () {
      if (err) {
        console.log(err);
        callback(err);
      } else callback();
    });
    outputFile.write(completeTemplate);
    outputFile.end();
  });
}

function writeRoutes(resourcesArray, templateDetails, callback) {
  var inputFilename;
  var counter = 0;
  async.whilst(
      function() {
        return counter < resourcesArray.length;
      },
      function(cb) {
        var resource = resourcesArray[counter++];
        if(!resource.isCollection) {
          inputFilename = 'routes_s_template';
        } else if (resource.hasNamedInstances) {
          inputFilename = 'routes_cn_template';
        } else {
          inputFilename = 'routes_ca_template';
        }
        fs.readFile('./templates/' + inputFilename + '.handlebars', 'utf8', function (err,fileData) {
          if (err) {
            console.log(err);
            callback(err);
          }
          var template = _handlebars.compile(fileData);
          var completeTemplate = template(resource);
          var dirname = resource.lineage;
          var outputFile = fs.createWriteStream(templateDetails.location + dirname + '/index.' + templateDetails.extension);
          outputFile.on('finish', function () {
            if(resource.resources){
              writeRoutes(resource.resources, templateDetails, cb);
            } else {
              cb();
            }
          });
          outputFile.write(completeTemplate);
          outputFile.end();
        });
      },
      function(err) {
        callback(err, true); // loop over, come out
      }
  );
}

module.exports = function WriteProject(app) {  

  // VALIDATE INPUT - ASYNC LIB
  this.projectStructure = function(transformedData, callback){
    async.series(
      [
        function(callback){ // EXECUTE TERMINAL COMMANDS
          var commands = [];
          console.log('\nJOINED LINEAGE ARRAY: ' + transformedData.lineageArrays.lineageArray.join());
          //var makeDirectoryCommand = 'mkdir -p generated/' + transformedData.data.apiOptions.apiName + '/{models,shared,templates,views,routes/{' + transformedData.lineageArrays.lineageArray.join() + '}}';
          var makeDirectoryCommand = 'mkdir -p generated/' + transformedData.data.apiOptions.apiName + '/{models,shared,templates,views,routes}/';
          var makeSubDirectoryCommand = 'mkdir -p generated/' + transformedData.data.apiOptions.apiName + '/routes/{' + transformedData.lineageArrays.lineageArray.join() + '}/';
          console.log('\nMAKE DIRECTORY COMMAND: ' + makeDirectoryCommand);
          var copyFilesCommand = 'cp -r staticSource/* generated/' + transformedData.data.apiOptions.apiName + '/';
          commands.push(makeDirectoryCommand, makeSubDirectoryCommand, copyFilesCommand);
          executeTerminalCommands(commands, callback);
        },
        function(callback){ // WRITE RESOURCE ENTRIES INTO ENTRY FILES
          transformedData.entryFiles = [];
          var modelsObject = { "filename" : "index", "extension" : "js", "name" : "models", "location" : "./generated/" + transformedData.data.apiOptions.apiName + "/models/" };
          var templatesObject = { "filename" : "index", "extension" : "js", "name" : "templates", "location" : "./generated/" + transformedData.data.apiOptions.apiName + "/templates/" };
          var serverObject = { "filename" : "server", "extension" : "js", "name" : "server", "location" : "./generated/" + transformedData.data.apiOptions.apiName + "/" };
          transformedData.entryFiles.push(modelsObject, templatesObject, serverObject);
          writeEntryTemplates(transformedData, callback);
        },
        function(callback){ // WRITE META FILE
          var templateDetails = { "extension" : "js", "location" : "./generated/" + transformedData.data.apiOptions.apiName + "/" };
          writeMeta(transformedData, templateDetails, callback);
        },
        function(callback){ // CREATE TEMPLATE FILE FOR EACH RESOURCE
          var templateDetails = { "extension" : "js", "location" : "./generated/" + transformedData.data.apiOptions.apiName + "/templates/" };
          writeTemplateFilesForResources(transformedData, templateDetails, 'collection', callback);
        },
        function(callback){ // CREATE TEMPLATE FILE FOR EACH RESOURCE STUB
          var templateDetails = { "extension" : "js", "location" : "./generated/" + transformedData.data.apiOptions.apiName + "/templates/" };
          writeTemplateFilesForResources(transformedData, templateDetails, 'stub', callback);
        },
        function(callback){ // CREATE MODEL FILE FOR EACH RESOURCE 
          var templateDetails = { "extension" : "js", "location" : "./generated/" + transformedData.data.apiOptions.apiName + "/models/", "sourceFilename" : "model_template" };
          writeModels(transformedData, templateDetails, callback);
        },
        function(callback){ // CREATE VIEW FILE FOR EACH RESOURCE 
          var templateDetails = { "extension" : "handlebars", "location" : "./generated/" + transformedData.data.apiOptions.apiName + "/views/", "sourceFilename" : "views_template" };
          writeViews(transformedData, templateDetails, callback);
          //callback(null, true);
        },
        function(callback){ // CREATE VIEW FILE FOR EACH RESOURCE 
          var templateDetails = { "extension" : "handlebars", "location" : "./generated/" + transformedData.data.apiOptions.apiName + "/views/", "sourceFilename" : "views_template" };
          writeRootView(transformedData, templateDetails, callback);
          //callback(null, true);
        },
        function(callback){ // CREATE VIEW FILE FOR EACH RESOURCE 
          var templateDetails = { "extension" : "js", "location" : "./generated/" + transformedData.data.apiOptions.apiName + "/routes/" };
          writeRoutes(transformedData.resourcesArray, templateDetails, callback);
        }
      ],
      function(err, results){
        if (err) {
          console.log('err: ' + err + '\n');
          callback(err, '');  
        } else {
          //console.log('W results: ' + results + '\n');
          callback(null, transformedData);
        }
      });  
  }
}