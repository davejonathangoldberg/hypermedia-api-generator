var jjv = require('jjv');
var env = jjv();

env.addSchema('topics', {
    "title": "topics",
    "isCollection": true,
    "hasNamedInstances": false,
    "type": "object",
    "properties": {
        "name": {
            "type": "string"
        },
        "description": {
            "type": "string"
        }
    },
    "required": [
        "name",
        "description"
    ]
});

module.exports = env;