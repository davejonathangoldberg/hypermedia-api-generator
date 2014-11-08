var jjv = require('jjv');
var env = jjv();

env.addSchema('items', {
    "title": "items",
    "isCollection": true,
    "hasNamedInstances": true,
    "type": "object",
    "properties": {
        "description": {
            "type": "string"
        },
        "priority": {
            "type": "string"
        },
        "dueDate": {
            "type": "string"
        }
    },
    "required": [
        "description",
        "priority",
        "dueDate"
    ]
});

module.exports = env;