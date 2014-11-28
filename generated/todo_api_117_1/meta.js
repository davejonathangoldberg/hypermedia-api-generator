var meta = {};
meta['root'] = {'childResources' : [ 'items','assignees','projects', ]};
meta['items'] = {'childResources' : ['assignees'], 'parentResources' : ['projects']};
meta['assignees'] = {'childResources' : [], 'parentResources' : ['items']};
meta['projects'] = {'childResources' : ['items'], 'parentResources' : []};
meta['validRoutes'] = ['items','itemsassignees','projects','projectsitems'];
module.exports = meta;