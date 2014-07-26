var jjv = require('jjv');
var env = jjv();

env.addSchema('tags', {
    "title": "tags",
    "type": "object",
    "properties": {}
});

module.exports = env;