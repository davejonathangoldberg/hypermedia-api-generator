var jjv = require('jjv');
var env = jjv();

env.addSchema('personal_information', {
    "title": "personal_information",
    "isCollection": false,
    "hasNamedInstances": false,
    "type": "object",
    "properties": {
        "first-name": {
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
        "first-name",
        "lastName",
        "emailAddress",
        "phoneNumber"
    ]
});

module.exports = env;