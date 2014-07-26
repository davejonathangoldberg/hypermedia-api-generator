var meta = {};

meta['attendees'] = {'childResources' : ['topics'], 'parentResources' : []};
meta['topics'] = {'childResources' : [], 'parentResources' : ['attendees']};

module.exports = meta;