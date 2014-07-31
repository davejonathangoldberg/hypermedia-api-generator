var jjv = require('jjv');
var env = jjv();

env.addSchema('friends', {
    "title": "friends",
    "isCollection": true,
    "hasNamedInstances": false,
    "type": "object",
    "properties": {
        "firstName": {
            "type": "string"
        },
        "lastName": {
            "type": "string"
        }
    },
    "required": [
        "firstName",
        "lastName"
    ]
});

module.exports = env;