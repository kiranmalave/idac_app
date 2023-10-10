define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var pagesMenuMasterFilterOptionModel = Backbone.Model.extend({
  	idAttribute: "menuID",
  	 defaults:{
        textSearch:'',
        textval: null,
        getAll: "Y",
        status:'active',
        orderBy:'',
        order:'ASC',
    }
  });
  return pagesMenuMasterFilterOptionModel;
});

