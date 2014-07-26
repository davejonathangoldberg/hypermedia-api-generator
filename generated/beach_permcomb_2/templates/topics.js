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
        "moderator": {
            "type": "string"
        }
    },
    "required": [
        "name",
        "moderator"
    ]
});

module.exports = env;