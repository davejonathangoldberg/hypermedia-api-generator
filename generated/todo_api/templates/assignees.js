var jjv = require('jjv');
var env = jjv();

env.addSchema('assignees', {
    "title": "assignees",
    "isCollection": true,
    "hasNamedInstances": false,
    "type": "object",
    "properties": {
        "firstName": {
            "type": "string"
        },
        "lastName": {
            "type": "string"
        },
        "emailAddress": {
            "type": "string"
        }
    },
    "required": [
        "firstName",
        "lastName",
        "emailAddress"
    ]
});

module.exports = env;