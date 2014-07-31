var jjv = require('jjv');
var env = jjv();

env.addSchema('employers', {
    "title": "employers",
    "isCollection": true,
    "hasNamedInstances": true,
    "type": "object",
    "properties": {
        "employerName": {
            "type": "string"
        },
        "location": {
            "type": "string"
        },
        "title": {
            "type": "string"
        },
        "startYear": {
            "type": "string"
        },
        "endYear": {
            "type": "string"
        }
    },
    "required": [
        "employerName",
        "location",
        "title",
        "startYear",
        "endYear"
    ]
});

module.exports = env;