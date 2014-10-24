var jjv = require('jjv');
var env = jjv();

env.addSchema('email_addresses', {
    "title": "email_addresses",
    "isCollection": true,
    "hasNamedInstances": false,
    "type": "object",
    "properties": {
        "emailAddress": {
            "type": "string"
        }
    },
    "required": [
        "emailAddress"
    ]
});

module.exports = env;