var jjv = require('jjv');
var env = jjv();

env.addSchema('projects', {
    "title": "projects",
    "isCollection": true,
    "hasNamedInstances": false,
    "type": "object",
    "properties": {
        "name": {
            "type": "string"
        },
        "label": {
            "type": "string"
        },
        "description": {
            "type": "string"
        }
    },
    "required": [
        "name",
        "label",
        "description"
    ]
});

module.exports = env;