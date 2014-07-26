var meta = {};

meta['attendees'] = {'childResources' : ['topics'], 'parentResources' : ['topics']};
meta['topics'] = {'childResources' : ['attendees'], 'parentResources' : ['attendees']};

module.exports = meta;