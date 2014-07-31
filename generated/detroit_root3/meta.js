var meta = {};
meta['root'] = {'childResources' : [ 'attendees','topics', ]};
meta['attendees'] = {'childResources' : ['topics'], 'parentResources' : ['topics']};
meta['topics'] = {'childResources' : ['attendees'], 'parentResources' : ['attendees']};
meta['validRoutes'] = ['attendees','attendeestopics','topics','topicsattendees'];
module.exports = meta;