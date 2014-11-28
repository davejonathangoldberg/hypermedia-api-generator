module.exports = function Routes(app) {
  
  // REQUIRED LIBRARIES
  var jjv = require('jjv');
  var async = require('async');
  var http = require('http');
  var https = require('https');
  var url = require('url');
  
  // RELATIVE REFERENCES 
  var Validation = require('../lib/validation.js');
  var Transform = require('../lib/transform.js')
  var WriteProject = require('../lib/write_project_new.js');
  var LaunchProject = require('../lib/launch_project.js');
  var LaunchClient = require('../lib/launch_client.js');
  var Composer = require('../lib/composer.js');
  var validation = new Validation();
  var transform = new Transform();
  var writeProject = new WriteProject(app);
  var launchProject = new LaunchProject();
  var launchClient = new LaunchClient();
  var composer = new Composer();
  
  // GLOBAL
  var baseUrl = process.env['BASE_URL'] || '';
  
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
  
  app.get('/', function(req, res, next){
    return res.status(200).send('successXX');  
  });
  
  app.post('/apis', function(req, res, next){      
    
    /*
     *
     * RECONSTRUCT REQ.BODY INTO DATA OBJECT FOR EASIER PROCESSING
     *
     */
    
    console.log('req.body: ' + JSON.stringify(req.body) + '\n\n');
    
    // INITIALIZE VARIABLES
    var apiObject = {};
    var data = {};
    data.apiOptions = {};
    data.apiResources = {};
    data.apiModels = [];
    
    // MAP API OPTIONS
    data.apiOptions.basepath = req.body.basepath ? req.body.basepath : '/';
    data.apiOptions.mediaType = req.body.mediaType ? req.body.mediaType : 'application/json';
    data.apiOptions.apiName = req.body.apiName;
    data.apiOptions.webhookUrl = req.body.webhookUrl ? req.body.webhookUrl : 'http://www.modelship.io/inbound_hooks';
    
    // MAP API RESOURCES
    data.apiResources = req.body.resources ? { "resources" : req.body.resources } : null;
    
    // MAP API MODELS
    data.apiModels = req.body.models ? req.body.models : [];
    
    // EXECUTE APPLICATION STEPS IN SERIES
    async.waterfall(
      [
        function(callback){ // VALIDATE ADDITIONAL FIELDS IN MODEL
          console.log('STEP 2: VALIDATE ADDTIONAL FIELDS IN MODEL');
          var err;
          var missingFields= [];
          var missingFieldError = false;
          if (data.apiModels.length < 1) {
            err = {
              "name" : "General",
              "code" : 400,
              "type" : "Validation",
              "value" : "General Validation Error"
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
            } else {
              if (typeof(data.apiModels[i].isCollection) !== 'boolean') {
                if (data.apiModels[i].isCollection.toLowerCase() === 'true') {
                  data.apiModels[i].isCollection = true;
                } else if (data.apiModels[i].isCollection.toLowerCase() === 'false') {
                  data.apiModels[i].isCollection = false;
                };
              };
              if (typeof(data.apiModels[i].hasNamedInstances) !== 'boolean') {
                if (data.apiModels[i].hasNamedInstances.toLowerCase() === 'true') {
                  data.apiModels[i].hasNamedInstances = true;
                } else if (data.apiModels[i].hasNamedInstances.toLowerCase() === 'false') {
                  data.apiModels[i].hasNamedInstances = false;
                };
              };
            };
          }
          if(missingFieldError) {
            err = {
              "name" : "Models",
              "code" : 400,
              "type" : "Validation",
              "value" : "Missing either 'isCollection' of 'hasNamedInstances' fields in the following models: " +  missingFields.join(', ')
            }; 
            callback(err, '');
          }
          else callback(null, 'success');
        },
        function(results, callback){ // VALIDATE INPUT
          validation.validateInputData(data, callback);
        },
        function(results, callback){ // ADDITIONAL VALIDATION
          // VALIDATE REQUIREMENTS BLOCK
          console.log('STEP 3: VALIDATE REQUIREMENTS BLOCK');
          validation.replaceRequiredProperties(data, callback);
        },
        function(results, callback){ // SAVE IN DB
          console.log("data to save: " + JSON.stringify(data))
          composer.saveApi(data, callback);
        },
        function(results, callback){ // TRANSFORM INPUT
          console.log('STEP 4: TRANSFORM');
          console.log('results: ' + JSON.stringify(results));
          data['apiId'] = results['id'];
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
                "name" : "Resource Model Mismatch",
                "code" : 400,
                "type" : "Validation",
                "value" : "You have specified a resource that does not have an associated model"
              }; 
              callback(err,'');
            }
          }
          writeProject.projectStructure(transformedData, callback);
          //callback(null, 'success');
        },
        function(transformedData, callback){ // LAUNCH TO HEROKU
          //callback();
          launchProject.herokuLaunch(transformedData, callback);
        },
        function(transformedData, callback){ // WRITE UPDATE TO DB
          var updateData = {};
          var transformed = {};
          transformed['resourcesArray'] = transformedData['resourcesArray'];
          transformed['lineageArrays'] = transformedData['lineageArrays'];
          transformed['modelsObject'] = transformedData['modelsObject'];
          updateData['queryKey'] = 'id';
          updateData['queryValue'] = transformedData['data']['apiId'];
          updateData['updateObject'] = { "transformed" : transformed, "modifiedDate" : new Date() };
          composer.updateApi(updateData, callback);
          //launchClient.constructSwagger(transformedData, callback);
          //callback();
        }
      ],
      function(err, results){
        if (err) {
          console.log('err: ' + JSON.stringify(err) + '\n');
          res.statusCode = (err.code == 400) ? 400 : 500;
          return res.json({ "name" : err.name, "error" : err.type, "value" : err.value }); // RETURNS 500 ERROR 
        } else {
          console.log('success: ' + JSON.stringify(results) + '\n');
          apiObject['apiId'] = results.instance.id;
          apiObject['apiName'] = results.instance.name;
          apiObject['status'] = results.instance.status;
          apiObject['createdDate'] = results.instance.createdDate;
          apiObject['modifiedDate'] = results.instance.modifiedDate;
          apiObject['selfUrl'] = baseUrl; //TBD
          apiObject['deployedApiUrl'] = 'TBD'; //NOT YET AVAILABLE
          apiObject['modelshipApiDescriptionUrl'] = baseUrl + '/apis/' + results.instance.id + '/api-sec'; //TBD
          apiObject['swaggerApiDescriptionUrl'] = baseUrl + '/apis/' + results.instance.id + '/swagger'; //TBD
          apiResponseObject(apiObject, function(err, responseObject){
            res.set('Location', responseObject._links.self.href);
            res.statusCode = 202;
            return res.json(responseObject);
          });
          //return res.json(results);
          //return res.json({ "status" : "pending" });
          
        }
      });  
    
    
  });
  
  app.post('/inbound_hooks/:apiId', function(req, res, next){
    /*
     * RECEIVES INBOUND HOOK
     * UPDATE STATUS IN DB TO ACTIVE
     * SEND OUTBOUND WEB HOOK TO REGISTERED WEB HOOK (REQUIRES DB LOOKUP OR PARAMS IN URL)
     * 
     */
    console.log('\nINBOUND_HOOKS req.params: ' + req.params['apiId']);
    console.log("\ninbound_hooks: " + JSON.stringify(req.body));
    var hookResponse;
    var apiObject = {};
    var updateData = {};
    var modifiedDate = new Date();
    console.log(typeof req.body['url']);
    if (typeof req.body['url'] == 'undefined' && typeof req.body['web_url'] == 'undefined') {
      return res.status(400).json({"error" : "Your input data does not contain valid URLs."});
    } else if (typeof req.body['url'] == 'undefined' && typeof req.body['web_url'] == 'string') {
      // SHOULD VALIDATE URLS HERE AS WELL
      console.log('req.body[url]: ' + req.body['url'] + ', req.body[web_url]: ' + req.body[web_url]:);
      req.body['url'] = req.body['web_url'];
    } else if (typeof req.body['url'] == 'string' && typeof req.body['web_url'] == 'undefined') {
      // SHOULD VALIDATE URLS HERE AS WELL
      console.log("Inbound Hook from Heroku");
    } else {
      console.log("Invalid Inbound Hook");
      return res.status(400).json({"error" : "Your input data does not contain valid URLs."});
    }
    /*
    var parsedWebhookUrl = url.parse(req.params['webhookUrl']);
    console.log('parsedWebhookUrl.hostname: ' + parsedWebhookUrl.hostname);
    console.log('\nparsedWebhookUrl.port: ' + parsedWebhookUrl.port);
    console.log('\nparsedWebhookUrl.path: ' + parsedWebhookUrl.path);
    */
    updateData['queryKey'] = 'id';
    updateData['queryValue'] = req.params['apiId'];
    updateData['updateObject'] = { "status" : "active", "modifiedDate" : modifiedDate };
    composer.updateApi(updateData, function(err, data){
      if(err){
        res.status(500).json(err);
      } else {
        //res.status(200).json(data);
        console.log('data from update API: ' + JSON.stringify(data));
        var parsedWebhookUrl = url.parse(data.instance.input.apiOptions.webhookUrl);
        console.log('parsedWebhookUrl.hostname: ' + parsedWebhookUrl.hostname);
        console.log('\nparsedWebhookUrl.port: ' + parsedWebhookUrl.port);
        console.log('\nparsedWebhookUrl.path: ' + parsedWebhookUrl.path);
        parsedWebhookUrl.port = parsedWebhookUrl.port || 80;
        console.log('\nparsedWebhookUrl.port: ' + parsedWebhookUrl.port);
        apiObject['apiId'] = req.params['apiId'];
        apiObject['apiName'] = data.instance.name;
        apiObject['status'] = data.instance.status;
        apiObject['createdDate'] = data.instance.createdDate;
        apiObject['modifiedDate'] = data.instance.modifiedDate;
        apiObject['selfUrl'] = baseUrl; //TBD
        apiObject['deployedApiUrl'] = req.body['url'];
        apiObject['modelshipApiDescriptionUrl'] = baseUrl + '/apis/' + req.params['apiId'] + '/api-sec'; //TBD
        apiObject['swaggerApiDescriptionUrl'] = baseUrl + '/apis/' + req.params['apiId'] + '/swagger'; //TBD
        apiResponseObject(apiObject, function(err, responseObject){
          console.log('responseObject: ' + JSON.stringify(responseObject) );
          parsedWebhookUrl.protocol = parsedWebhookUrl.protocol || 'http';
          var options = {
            hostname: parsedWebhookUrl.hostname,
            port: parsedWebhookUrl.port,
            path: parsedWebhookUrl.path,
            method: 'POST',
            headers: {
              "content-type": "application/json"
            }
          };
          
          var httpRequestType = parsedWebhookUrl.protocol == 'http:' ? http : https;
          var httpReq = httpRequestType.request(options, function(httpRes) {
            var responseString = '';
            console.log('STATUS: ' + httpRes.statusCode);
            console.log('HEADERS: ' + JSON.stringify(httpRes.headers));
            httpRes.setEncoding('utf8');
            httpRes.on('data', function (chunk) {
              console.log('BODY: ' + chunk);
              responseString += chunk;
            });
            httpRes.on('end', function() {
              hookResponse = responseString;
              console.log('Hook Response: ' + JSON.stringify(hookResponse));
              if((httpRes.statusCode === 200) || (httpRes.statusCode === 201) || (httpRes.statusCode === 202)){
                console.log('equal to 200, 201, 202');
                res.status(200).json(responseObject);
              } else {
                console.log('not equal to 200, 201, 202: ' + httpRes.statusCode);
                var err = {
                  "name" : "Webhook Error",
                  "code" : 500,
                  "type" : "Webhook",
                  "value" : "Webhook to Client failed."
                };
                res.status(500).send(JSON.stringify(err));
              }
            });
          });
          
          httpReq.on('error', function(e) {
            console.log('problem with request: ' + e.message);
            var err = {
              "name" : "Webhook Error",
              "code" : 500,
              "type" : "Webhook",
              "value" : "Webhook to Client failed."
            };
            res.status(500).send(JSON.stringify(err));
          });
          
          // write data to request body
          httpReq.write(JSON.stringify(responseObject));
          httpReq.end();    
        });  //END CALLBACK FROM COMPOSING THE RESPONSE OBJECT
      }
    }); // END CALLBACK FROM UPDATING RECORD IN DB
  }); // END APP.POST /INBOUND_HOOKS

  app.get('/apis/:apiId/swagger', function(req, res, next){
     /*
     *
     * LOOKS UP API RECORD IN MONGODB
     *   IF NOT EXIST RETURN 404
     *   IF EXIST
     *    CHECK IF SWAGGER IS EMPTY
     *      IF IT IS EMPTY RETURN 404
     *      IF NOT,
     *        PULL SWAGGER DESCRIPTION
     *        RETURN 200
     * 
     */
    var productionHost;
    var data = {};
    var inputData = { "data" : {}, "resourcesArray" : {} };
    data.queryKey = 'id';
    data.queryValue = req.params['apiId'];
    composer.retrieveApi(data, function(err, record){
      if(err){
        if(err.code == 404){
          return res.send(404, '');
        } else {
          return res.send(500, 'Blast!');
        }
      } else {
        if(typeof(record.instance) == 'undefined' || record.instance == ''){
          return res.send(404, '');
        } else if(typeof(record.instance.input) == 'undefined' || record.instance.input == ''){
          return res.send(404, '');
        } else {
          console.log('value of record.instance.input: ' + JSON.stringify(record.instance.input));
          inputData.data = record.instance.input;
          inputData.resourcesArray = record.instance.transformed.resourcesArray;
          productionHost = typeof(record.instance.productionUrl == 'string') ? url.parse(record.instance.productionUrl).host : 'TBD';
          inputData.swaggerHost = productionHost;
          launchClient.constructSwagger(inputData, function(err, swaggerObj){
            if(err){
              return res.status(500).json(err);
            } else {
              return res.status(200).json(swaggerObj);
            }
          });
        }
        console.log('typeOf record.instance.swagger: ' + typeof(record.instance.swagger));
        console.log('value of record.instance.swagger: ' + JSON.stringify(record.instance.swagger));
      }
    });
     
  });
  
  app.get('/apis/:apiId/api-spec', function(req, res, next){
     /*
     *
     * LOOKS UP API RECORD IN MONGODB
     *   IF NOT EXIST RETURN 404
     *   IF EXIST
     *    CHECK IF SWAGGER IS EMPTY
     *      IF IT IS EMPTY RETURN 404
     *      IF NOT,
     *        PULL SWAGGER DESCRIPTION
     *        RETURN 200
     * 
     */
    var data = {};
    data.queryKey = 'id';
    data.queryValue = req.params['apiId'];
    composer.retrieveApi(data, function(err, record){
      if(err){
        if(err.code == 404){
          return res.send(404, '');
        } else {
          return res.send(500, 'Blast!');
        }
      } else {
        console.log('typeOf record.instance.input: ' + typeof(record.instance.input));
        if(typeof(record.instance.input) == 'undefined' || record.instance.input == ''){
          return res.send(404, '');
        } else {
          return res.status(200).json(record.instance.input); 
        }
      }
    });
     
  });
  
  app.get('/apis/:apiId', function(req, res, next){
     /*
     *
     * LOOKS UP API RECORD IN MONGODB
     *   IF NOT EXIST RETURN 404
     *   IF EXIST
     *    CHECK IF SWAGGER IS EMPTY
     *      IF IT IS EMPTY RETURN 404
     *      IF NOT,
     *        PULL SWAGGER DESCRIPTION
     *        RETURN 200
     * 
     */
    var data = {};
    var apiObject = {};
    data.queryKey = 'id';
    data.queryValue = req.params['apiId'];
    composer.retrieveApi(data, function(err, record){
      if(err){
        if(err.code == 404){
          return res.send(404, '');
        } else {
          return res.send(500, 'Blast!');
        }
      } else {
        console.log('typeOf record.instance.input: ' + typeof(record.instance.input));
        if(typeof(record.instance) == 'undefined' || record.instance == ''){
          return res.send(404, '');
        } else {
          apiObject['apiId'] = record.instance.id;
          apiObject['apiName'] = record.instance.name;
          apiObject['status'] = record.instance.status;
          apiObject['createdDate'] = record.instance.createdDate;
          apiObject['modifiedDate'] = record.instance.modifiedDate;
          apiObject['selfUrl'] = baseUrl; //TBD
          apiObject['deployedApiUrl'] = record.instance.productionUrl || '';
          apiObject['modelshipApiDescriptionUrl'] = baseUrl + '/apis/' + record.instance.id + '/api-sec'; //TBD
          apiObject['swaggerApiDescriptionUrl'] = baseUrl + '/apis/' + record.instance.id + '/swagger'; //TBD
          apiResponseObject(apiObject, function(err, responseObject){
            return res.status(200).json(responseObject); 
          });
        }
      }
    });
     
  });


}
