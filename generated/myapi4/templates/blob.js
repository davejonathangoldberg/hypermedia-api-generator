var jjv = require('jjv');
var env = jjv();

env.addSchema('blob', {
    "title": "blob",
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
        },
        "cake": {
            "type": "object",
            "properties": {
                "name": {
                    "type": "string"
                },
                "recipe": {
                    "type": "string"
                }
            },
            "required": [
                "name",
                "recipe"
            ]
        }
    },
    "required": [
        "length",
        "width",
        "height",
        "cake"
    ]
});

module.exports = env;