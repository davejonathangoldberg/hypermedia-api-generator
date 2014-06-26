var jjv = require('jjv');
var env = jjv();

env.addSchema('submarines', {
    "title": "submarines",
    "type": "object",
    "properties": {
        "length": {
            "type": "string"
        },
        "width": {
            "type": "string"
        },
        "height": {
            "type": "string"
        }
    },
    "required": [
        "length",
        "width",
        "height"
    ]
});

module.exports = env;