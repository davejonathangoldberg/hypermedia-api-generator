var meta = {};

meta['posts'] = {'childResources' : ['tags','submarines','blob'], 'parentResources' : []};
meta['tags'] = {'childResources' : [], 'parentResources' : ['posts']};
meta['submarines'] = {'childResources' : ['widgets'], 'parentResources' : ['posts']};
meta['widgets'] = {'childResources' : [], 'parentResources' : ['submarines']};
meta['blob'] = {'childResources' : [], 'parentResources' : ['posts']};

module.exports = meta;