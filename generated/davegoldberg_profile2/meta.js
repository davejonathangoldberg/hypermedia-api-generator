var meta = {};
meta['root'] = {'childResources' : [ 'personal_information','employers','family_members','friends', ]};
meta['personal_information'] = {'childResources' : [], 'parentResources' : []};
meta['employers'] = {'childResources' : [], 'parentResources' : ['friends']};
meta['family_members'] = {'childResources' : [], 'parentResources' : []};
meta['friends'] = {'childResources' : ['employers'], 'parentResources' : []};
meta['validRoutes'] = ['personal_information','employers','family_members','friends','friendsemployers'];
module.exports = meta;