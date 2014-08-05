var jjv = require('jjv');
var env = jjv();

env.addSchema('personal-information', {
    "title": "personal-information",
    "isCollection": false,
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
        },
        "phoneNumber": {
            "type": "string"
        }
    },
    "required": [
        "firstName",
        "lastName",
        "emailAddress",
        "phoneNumber"
    ]
});

module.exports = env;