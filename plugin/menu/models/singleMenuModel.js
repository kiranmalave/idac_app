define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var singleMenuModel = Backbone.Model.extend({
    idAttribute: "menuID",
     defaults: {
        menuID:null,
        menuName:null,
        module_name:null,
        menuLink:null,
        mobile_screen:null,
        isParent:"no",
        isClick:"no",
        linked:"n",
        is_custom:"n",
        menuIndex:999,
        parentID:null,
        created_by:null,
        modified_by:null,
        created_date:null,
        modified_date:null,
        custom_module:'no',
        status:'active',
    },
    urlRoot: function () {
      return APIPATH + 'menuMaster/'
    },
    parse: function (response) {
      return response.data[0];
    }
  });
  return singleMenuModel;
});
