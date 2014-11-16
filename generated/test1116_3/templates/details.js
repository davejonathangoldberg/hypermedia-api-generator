var jjv = require('jjv');
var env = jjv();

env.addSchema('details', {
    "title": "details",
    "isCollection": false,
    "hasNamedInstances": false,
    "type": "object",
    "properties": {
        "location": {
            "type": "string"
        },
        "time": {
            "type": "number"
        }
    },
    "required": [
        "location",
        "time"
    ]
});

module.exports = env;