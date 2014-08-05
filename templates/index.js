var jjv = require('jjv');
var env = jjv();
var optionsSchema = {
    "type": "object",
    "required": ["basepath", "mediaType", "apiName"],
    "properties": {
        "basepath": { "type": "string" },
        "mediaType": { "type": "string" },
        "apiName": {
            "type": "string",
            "pattern": "^[a-zA-Z0-9_]{1,32}$"
        }
    }
}
var resourcesSchema = {
    "type": "object",
    "required": ["resources"],
    "properties": {
        "resources" : {
            "type" : "array",
            "minItems" : 1,
            "items" : {
                "type" : "object",
                "$ref" : "#/definitions/resource"
            }
        }
    },
    "definitions" : {
        "resource" : {
            "required"   : ["name", "model"],
            "properties" : {
                "name"              : { "type" : "string" },
                "model"             : { "type" : "string" },
                "resources"         : {
                    "type" : "array",
                    "minItems" : 1,
                    "items" : {
                        "type" : "object",
                        "$ref" : "#/definitions/resource"
                    }
                }
            }
        }
    }
}
var modelsBasicSchema = {
    "type": "array",
    "minItems" : 1,
    "items" : {
      "type" : "object",
      "required" : ["title", "hasNamedInstances", "isCollection"],
      "properties" : {
        "title": {
            "type": "string"
        },
        "hasNamedInstances" : {
          "type" : "boolean"
        },
        "isCollection" : {
          "type" : "boolean"
        }
      }
    }
}
var modelsSchema = {
    "id": "http://json-schema.org/draft-04/schema#",
    "$schema": "http://json-schema.org/draft-04/schema#",
    "description": "Core schema meta-schema",
    "definitions": {
        "schemaArray": {
            "type": "array",
            "minItems": 1,
            "items": { "$ref": "#" }
        },
        "positiveInteger": {
            "type": "integer",
            "minimum": 0
        },
        "positiveIntegerDefault0": {
            "allOf": [ { "$ref": "#/definitions/positiveInteger" }, { "default": 0 } ]
        },
        "simpleTypes": {
            "enum": [ "array", "boolean", "integer", "null", "number", "object", "string" ]
        },
        "stringArray": {
            "type": "array",
            "items": { "type": "string" },
            "minItems": 1,
            "uniqueItems": true
        }
    },
    "type": "object",
    "properties": {
        "id": {
            "type": "string",
            "format": "uri"
        },
        "$schema": {
            "type": "string",
            "format": "uri"
        },
        "title": {
            "type": "string"
        },
        "description": {
            "type": "string"
        },
        "default": {},
        "multipleOf": {
            "type": "number",
            "minimum": 0,
            "exclusiveMinimum": true
        },
        "maximum": {
            "type": "number"
        },
        "exclusiveMaximum": {
            "type": "boolean",
            "default": false
        },
        "minimum": {
            "type": "number"
        },
        "exclusiveMinimum": {
            "type": "boolean",
            "default": false
        },
        "maxLength": { "$ref": "#/definitions/positiveInteger" },
        "minLength": { "$ref": "#/definitions/positiveIntegerDefault0" },
        "pattern": {
            "type": "string",
            "format": "regex"
        },
        "additionalItems": {
            "anyOf": [
                { "type": "boolean" },
                { "$ref": "#" }
            ],
            "default": {}
        },
        "items": {
            "anyOf": [
                { "$ref": "#" },
                { "$ref": "#/definitions/schemaArray" }
            ],
            "default": {}
        },
        "maxItems": { "$ref": "#/definitions/positiveInteger" },
        "minItems": { "$ref": "#/definitions/positiveIntegerDefault0" },
        "uniqueItems": {
            "type": "boolean",
            "default": false
        },
        "maxProperties": { "$ref": "#/definitions/positiveInteger" },
        "minProperties": { "$ref": "#/definitions/positiveIntegerDefault0" },
        "required": { "$ref": "#/definitions/stringArray" },
        "additionalProperties": {
            "anyOf": [
                { "type": "boolean" },
                { "$ref": "#" }
            ],
            "default": {}
        },
        "definitions": {
            "type": "object",
            "additionalProperties": { "$ref": "#" },
            "default": {}
        },
        "properties": {
            "type": "object",
            "additionalProperties": { "$ref": "#" },
            "default": {}
        },
        "patternProperties": {
            "type": "object",
            "additionalProperties": { "$ref": "#" },
            "default": {}
        },
        "dependencies": {
            "type": "object",
            "additionalProperties": {
                "anyOf": [
                    { "$ref": "#" },
                    { "$ref": "#/definitions/stringArray" }
                ]
            }
        },
        "enum": {
            "type": "array",
            "minItems": 1,
            "uniqueItems": true
        },
        "type": {
            "anyOf": [
                { "$ref": "#/definitions/simpleTypes" },
                {
                    "type": "array",
                    "items": { "$ref": "#/definitions/simpleTypes" },
                    "minItems": 1,
                    "uniqueItems": true
                }
            ]
        },
        "allOf": { "$ref": "#/definitions/schemaArray" },
        "anyOf": { "$ref": "#/definitions/schemaArray" },
        "oneOf": { "$ref": "#/definitions/schemaArray" },
        "not": { "$ref": "#" }
    },
    "dependencies": {
        "exclusiveMaximum": [ "maximum" ],
        "exclusiveMinimum": [ "minimum" ]
    },
    "default": {}
};


env.addSchema('resources', resourcesSchema);
env.addSchema('options', optionsSchema);
env.addSchema('models', modelsSchema);
env.addSchema('basicModels', modelsBasicSchema);

module.exports = env;