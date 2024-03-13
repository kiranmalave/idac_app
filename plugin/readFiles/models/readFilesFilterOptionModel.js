define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var pagesMenuMasterFilterOptionModel = Backbone.Model.extend({
  	idAttribute: "menuID",
  	 defaults:{
        textSearch:'',
        textval: null,
        status:'active,inactive',
        orderBy:'',
        folderID:"",
        folderName:"",
        fPath:UPLOADS,
        order:'ASC',
        cmp_type:null,
    }
  });
  return pagesMenuMasterFilterOptionModel;
});

