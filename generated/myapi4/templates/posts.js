var jjv = require('jjv');
var env = jjv();

env.addSchema('posts', {
    "title": "posts",
    "type": "object",
    "properties": {
        "title": {
            "type": "string"
        },
        "content": {
            "type": "string"
        },
        "author": {
            "type": "string"
        }
    },
    "required": [
        "title",
        "content",
        "author"
    ]
});

module.exports = env;