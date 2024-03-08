define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var infoSettingsModel = Backbone.Model.extend({
    idAttribute: "adminID",
     defaults: {
        adminID:null,
        name:null,
        userName:null,
        email:null,
        password:null,
        address:null,
        contactNo:null,
        whatsappNo:null,
        dateOfBirth:null,
        myTarget:null,
        photo:null,
        eyeIcon:"fa fa-eye-slash",
        inputType:"password",
        created_by:null,
        modified_by:null,
        created_date:null,
        modified_date:null,
    },
  	urlRoot:function(){

      return APIPATH+'addadmin/'
    },
    parse : function(response) {
        return response.data[0];
      }
  });
  return infoSettingsModel;
});
