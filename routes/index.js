module.exports = function Routes(app) {
  
  // REQUIRED LIBRARIES
  var jjv = require('jjv');
  var ZSchema = require('z-schema');
  var async = require('async');
  
  // RELATIVE REFERENCES 
  var Validation = require('../lib/validation.js');
  var Transform = require('../lib/transform.js')
  var WriteProject = require('../lib/write_project_new.js');
  var LaunchProject = require('../lib/launch_project.js');
  var validation = new Validation();
  var transform = new Transform();
  var writeProject = new WriteProject(app);
  var launchProject = new LaunchProject();
  
  app.post('/', function(req, res, next){      
    
    /*
     *
     * RECONSTRUCT REQ.BODY INTO DATA OBJECT FOR EASIER PROCESSING
     *
     */
    
    // INITIALIZE VARIABLES
    var data = {};
    data.apiOptions = {};
    data.apiResources = {};
    data.apiModels = [];
    
    // MAP API OPTIONS
    data.apiOptions.basepath = req.body.basepath ? req.body.basepath : '/';
    data.apiOptions.mediaType = req.body.mediaType ? req.body.mediaType : 'application/json';
    data.apiOptions.apiName = req.body.apiName;
    
    // MAP API RESOURCES
    data.apiResources = req.body.resources ? { "resources" : req.body.resources } : null;
    
    // MAP API MODELS
    data.apiModels = req.body.models ? req.body.models : [];
    
    // EXECUTE APPLICATION STEPS IN SERIES
    async.waterfall(
      [
        function(callback){ // VALIDATE INPUT
          validation.validateInputData(data, callback);
        },
        function(results, callback){ // VALIDATE ADDITIONAL FIELDS IN MODEL
          console.log('STEP 2: VALIDATE ADDTIONAL FIELDS IN MODEL');
          var err;
          var missingFields= [];
          var missingFieldError = false;
          if (data.apiModels.length < 1) {
            err = {
              "type" : "validation",
              "value" : "At least one model is required to create an API."
            }; 
            callback(err, '');
          }
          for (i=0; i<data.apiModels.length; i++){
            // CHECK IF THE REQUIRED 'ISCOLLECTION' AND 'HASNAMEDINSTANCES' ATTRIBUTES ARE THERE
            if((typeof(data.apiModels[i].isCollection) == 'undefined') || (typeof(data.apiModels[i].hasNamedInstances) == 'undefined')) {
              console.log('typeOf(data.apiModels[i].isCollection): ' + typeof(data.apiModels[i].isCollection));
              console.log('!(data.apiModels[i].hasNamedInstances): ' + !(data.apiModels[i].hasNamedInstances));
              missingFields.push(data.apiModels[i].title);
              missingFieldError = true;
            };
          }
          if(missingFieldError) {
            err = {
              "type" : "validation",
              "value" : "Missing either 'isCollection' of 'hasNamedInstances' fields in the following models: " +  missingFields.join(', ')
            }; 
            callback(err, '');
          }
          else callback(null, 'success');
        },
        function(results, callback){
          // VALIDATE REQUIREMENTS BLOCK
          console.log('STEP 3: VALIDATE REQUIREMENTS BLOCK');
          validation.replaceRequiredProperties(data, callback);
        },
        function(results, callback){ // TRANSFORM INPUT
          console.log('STEP 4: TRANSFORM');
          transform.transformInput(data, callback);
          //callback(null, 'success');
        },
        function(transformedData, callback){ // WRITE PROJECT STRUCTURE AND COPY STATIC FILES
          console.log('results after transform: ' + JSON.stringify(transformedData) + '\n');
          var modelsArray = [];
          for(model in transformedData.modelsObject){
            modelsArray.push(model);
          }
          for(i=0; i<transformedData.lineageArrays.nameArray; i++){
            if(modelsArray.indexOf(transformedData.lineageArray.nameArray[i]) < 0){
              err = {
              "type" : "validation mismatch",
              "value" : "You have specified a resource that does not have an associated model"
            }; 
              callback(err,'');
            }
          }
          writeProject.projectStructure(transformedData, callback);
          //callback(null, 'success');
        },
        /*
        function(transformedData, callback){ // LAUNCH APP LOCALLY
          //callback();
          launchProject.localLaunch(transformedData, callback);
        },
        */
        function(transformedData, callback){ // LAUNCH TO HEROKU
          //callback();
          launchProject.herokuLaunch(transformedData, callback);
        }
      ],
      function(err, results){
        if (err) {
          console.log('err: ' + JSON.stringify(err) + '\n');
          return res.json({ "error" : err.type, "value" : err.value }); // RETURNS 500 ERROR 
        } else {
          //console.log('success: ' + JSON.stringify(data) + '\n');
          return res.json(data);
        }
      });  
    
    
  });

}
