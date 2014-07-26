var meta = {};

meta['attendees'] = {'childResources' : ['topics'], 'parentResources' : ['topics']};
meta['topics'] = {'childResources' : ['attendees'], 'parentResources' : ['attendees']};
meta['validRoutes'] = ['attendees','attendeestopics','topics','topicsattendees']];
module.exports = meta;