var jjv = require('jjv');
var env = jjv();

env.addSchema('speakers', {
    "title": "speakers",
    "isCollection": true,
    "hasNamedInstances": false,
    "type": "object",
    "properties": {
        "name": {
            "type": "string"
        },
        "employer": {
            "type": "string"
        }
    },
    "required": [
        "name",
        "employer"
    ]
});

module.exports = env;