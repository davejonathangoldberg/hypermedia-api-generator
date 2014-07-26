var jjv = require('jjv');
var env = jjv();

env.addSchema('attendees', {
    "title": "attendees",
    "isCollection": true,
    "hasNamedInstances": true,
    "type": "object",
    "properties": {
        "name": {
            "type": "string"
        },
        "apiExperience": {
            "type": "string"
        },
        "employer": {
            "type": "string"
        }
    },
    "required": [
        "name",
        "apiExperience",
        "employer"
    ]
});

module.exports = env;