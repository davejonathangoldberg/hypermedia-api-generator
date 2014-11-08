// REQUIRED LIBRARIES
var fs = require('fs');
var childProcess = require('child_process')
var async = require('async');
var jjv = require('jjv');
var _handlebars = require('handlebars');

function mapResources(resourcesArray, parentResource, modelsObject, lineageArrays, resourceCount, callback) {
  var counter = 0;
  resourceCount++;
  async.whilst(
      function() {
        return counter < resourcesArray.length;
      },
      function(cb) {
        var resource = resourcesArray[counter++];
        console.log('modelsObject[' + resource.name + ']: ' + JSON.stringify(modelsObject[resource.name]));
        console.log('typeof(modelsObject[' + resource.name + ']): ' + JSON.stringify(typeof(modelsObject[resource.name])));
        if(typeof(modelsObject[resource.name]) == 'undefined') {
          console.log('undefined err ' + resource.name);
          var err = {
              "name" : "Resource Model Mismatch",
              "code" : 400,
              "type" : "Validation",
              "value" : "You have specified a resource ('" + resource.name + "') with no accompanying model."
          };
          callback(err, '');
        } else {
          console.log('modelsObject.isCollection; ' + modelsObject[resource.name]['modelObject'].isCollection + '\n');
          console.log('modelsObject.hasNamedInstances; ' + modelsObject[resource.name]['modelObject'].hasNamedInstances + '\n');
          resource.isCollection = modelsObject[resource.name]['modelObject'].isCollection;
          resource.hasNamedInstances = modelsObject[resource.name]['modelObject'].hasNamedInstances;
          resource.titleName = resource.name.charAt(0).toUpperCase() + resource.name.slice(1);
          resource.altTitleName = (parentResource.lineage == '') ? resource.name : resource.titleName;
          resource.lineage = parentResource.lineage + resource.name;
          resource.lineageArray = [];
          resource.pathHierarchy = (!parentResource.pathHierarchy) ? resource.name + " " + resource.isCollection : parentResource.pathHierarchy + ',' + resource.name + " " + resource.isCollection;
          resource.pathHierarchyArray = resource.pathHierarchy.split(',');
          resource.parentResource = parentResource.name;
          resource.resourcesLength = resourceCount;
          resource.titleLineage = parentResource.titleLineage + resource.titleName;
          resource.altTitleLineage = parentResource.altTitleLineage + resource.altTitleName;
          resource.collectionPath = '';
          resource.instancePath = '';
          resource.swaggerCollectionPath = '';
          resource.swaggerInstancePath = '';
          for(i=0; i<resource.pathHierarchyArray.length; i++){
            var pathSegmentArray = resource.pathHierarchyArray[i].split(' ');
            console.log('pathSegmentArray: ' + pathSegmentArray.join(',') + '\n'); 
            resource.lineageArray.push(pathSegmentArray[0]);
            if(pathSegmentArray[1] == 'false'){
              resource.collectionPath += '/' + pathSegmentArray[0];
              resource.instancePath += '/' + pathSegmentArray[0];
              resource.swaggerCollectionPath += '/' + pathSegmentArray[0];
              resource.swaggerInstancePath += '/' + pathSegmentArray[0];
            } else if((resource.pathHierarchyArray.length > 2) && (i < resource.pathHierarchyArray.length - 2)){
              resource.collectionPath += '/' + pathSegmentArray[0] + '/:resource' + i + 'InstanceId';
              resource.instancePath += '/' + pathSegmentArray[0] + '/:resource' + i + 'InstanceId';
              resource.swaggerCollectionPath += '/' + pathSegmentArray[0] + '/{' + pathSegmentArray[0] + 'InstanceId}';
              resource.swaggerInstancePath += '/' + pathSegmentArray[0] + '/{' + pathSegmentArray[0] + 'InstanceId}';
            } else if (i < resource.pathHierarchyArray.length - 1) {
              resource.collectionPath += '/' + pathSegmentArray[0] + '/:' + pathSegmentArray[0] + 'InstanceId}';
              resource.instancePath += '/' + pathSegmentArray[0]+ '/:' + pathSegmentArray[0] + 'InstanceId}';
              resource.swaggerCollectionPath += '/' + pathSegmentArray[0] + '/{' + pathSegmentArray[0] + 'InstanceId}';
              resource.swaggerInstancePath += '/' + pathSegmentArray[0] + '/{' + pathSegmentArray[0] + 'InstanceId}';
            } else {
              resource.collectionPath += '/' + pathSegmentArray[0];
              resource.instancePath += '/' + pathSegmentArray[0] + '/:' + pathSegmentArray[0] + 'InstanceId';
              resource.swaggerCollectionPath += '/' + pathSegmentArray[0];
              resource.swaggerInstancePath += '/' + pathSegmentArray[0] + '/{' + pathSegmentArray[0] + 'InstanceId}';
            }
          }
          lineageArrays.resources.push({"titleLineage" : resource.titleLineage, "lineage" : resource.lineage, "altTitleLineage" : resource.altTitleLineage, "name" : resource.name, "templateName" : resource.name});
          lineageArrays.titleLineageArray.push(resource.titleLineage);
          lineageArrays.lineageArray.push(resource.lineage);
          lineageArrays.altTitleLineageArray.push(resource.altTitleLineage);
          lineageArrays.nameArray.push(resource.name);
          lineageArrays.resourceObjects[resource.name] = {};
          if (!resource.isCollection) {
            lineageArrays.stubArray.push({"titleLineage" : resource.titleLineage, "lineage" : resource.lineage, "altTitleLineage" : resource.altTitleLineage, "name" : resource.name, "templateName" : parentResource.name + resource.name});
          }
          if(resource.resources){
            mapResources(resource.resources, resource, modelsObject, lineageArrays, resourceCount, cb);
          } else {
            cb();
          }
        }
      },
      function(err) {
        var transformedData = {};
        transformedData.resourcesArray = resourcesArray;
        transformedData.lineageArrays = lineageArrays;
        transformedData.modelsObject = modelsObject;
        callback(err, transformedData); // loop over, come out
      }
  );
}

function mapReducedResources(resourcesArray, parentResource, modelsObject, lineageArrays, callback) {
  var counter = 0;
  async.whilst(
      function() {
        return counter < resourcesArray.length;
      },
      function(cb) {
        var resource = resourcesArray[counter++];
        lineageArrays.resourceObjects[resource.name].model = modelsObject[resource.name]['modelObject'];
        lineageArrays.resourceObjects[resource.name].model.properties.id = { "type" : "string" };
        lineageArrays.resourceObjects[resource.name].parentResources = lineageArrays.resourceObjects[resource.name].parentResources || [];
        lineageArrays.resourceObjects[resource.name].childResources = lineageArrays.resourceObjects[resource.name].childResources || [];
        if(parentResource.name != ''){
          lineageArrays.resourceObjects[resource.name].parentResources.push(parentResource.name);
          lineageArrays.resourceObjects[parentResource.name].childResources.push(resource.name);
        };
        lineageArrays.resourceObjects[resource.name].titleName = resource.titleName;
        if(resource.resources){
          mapReducedResources(resource.resources, resource, modelsObject, lineageArrays, cb);
        } else {
          cb();
        }
      },
      function(err) {
        var transformedData = {};
        transformedData.resourcesArray = resourcesArray;
        transformedData.lineageArrays = lineageArrays;
        transformedData.modelsObject = modelsObject;
        callback(err, transformedData); // loop over, come out
      }
  );
}

function mapModels(modelsArray, callback) {
  var counter = 0;
  var modelsObject = {};
  async.whilst(
      function() {
          return counter < modelsArray.length;
      },
      function(cb) {
        var model = modelsArray[counter++];
        console.log('model: ' + JSON.stringify(model) + '\n');
        modelsObject[model.title] = {};
        modelsObject[model.title]['modelObject'] = model;
        modelsObject[model.title]['modelString'] = JSON.stringify(model, null, 4);
        cb();
      },
      function(err) {
          callback(err, modelsObject); // loop over, come out
      }
  );
}


module.exports = function Transform(app) {  

  // VALIDATE INPUT - ASYNC LIB
  this.transformInput = function(data, callback){
    completeResources = data.apiResources.resources;
    async.waterfall(
      [
        function(callback){ // MAP MODELS FROM ARRAY INTO OBJECT
          modelsArray = data.apiModels;
          mapModels(modelsArray, callback);
        },
        function(modelsObject, callback){ // MAP DATA TO INCLUDE LINEAGEx
          var parentResourceName = '';
          var lineageArrays = {
            "lineageArray" : [],
            "titleLineageArray" : [],
            "altTitleLineageArray" : [],
            "nameArray" : [],
            "stubArray" : [],
            "resources" : [],
            "resourceObjects" : {},
            "resourcesStubs" : []
          };
          mapResources(data.apiResources.resources, {"name" : "", "lineage" : "", "titleLineage" : "", "altTitleLineage" : "", "pathHierarchyArray" : [] }, modelsObject, lineageArrays, 0, callback);
        },
        function(transformedData, callback){
          mapReducedResources(transformedData.resourcesArray, {"name" : "", "lineage" : "", "titleLineage" : "", "altTitleLineage" : ""}, transformedData.modelsObject, transformedData.lineageArrays, callback);
        }
      ],
      function(err, transformedData){
        if (err) {
          console.log('err: ' + err + '\n');
          callback(err, '');  
        } else {
          transformedData.data = data;
          callback(null, transformedData);
        }
      });  
  }
}