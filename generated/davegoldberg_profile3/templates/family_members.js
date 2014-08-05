var jjv = require('jjv');
var env = jjv();

env.addSchema('family_members', {
    "title": "family_members",
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
        "relationship": {
            "type": "string"
        },
        "age": {
            "type": "string"
        }
    },
    "required": [
        "firstName",
        "lastName",
        "relationship",
        "age"
    ]
});

module.exports = env;