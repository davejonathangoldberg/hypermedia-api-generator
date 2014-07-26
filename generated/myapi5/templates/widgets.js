var jjv = require('jjv');
var env = jjv();

env.addSchema('widgets', {
    "title": "widgets",
    "type": "object",
    "properties": {
        "color": {
            "type": "string"
        },
        "speed": {
            "type": "string"
        },
        "size": {
            "type": "string"
        }
    },
    "required": [
        "color",
        "speed",
        "size"
    ]
});

module.exports = env;