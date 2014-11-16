var meta = {};
meta['root'] = {'childResources' : [ 'speakers','topics','email_addresses','details', ]};
meta['speakers'] = {'childResources' : ['topics','email_addresses'], 'parentResources' : ['topics']};
meta['topics'] = {'childResources' : ['speakers'], 'parentResources' : ['speakers']};
meta['email_addresses'] = {'childResources' : [], 'parentResources' : ['speakers']};
meta['details'] = {'childResources' : [], 'parentResources' : []};
meta['validRoutes'] = ['speakers','speakerstopics','speakersemail_addresses','topics','topicsspeakers','details'];
module.exports = meta;