define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var adminModel = Backbone.Model.extend({
    idAttribute: "adminID",
    defaults: {
        adminID:null,
        name:null,
        userName:null,
        email:null,
        password:"",
        roleID:null,
        address:null,
        contactNo:null,
        whatsappNo:null,
        myTarget:null,
        address:null,
        dateOfBirth:null,
        created_date:null,
        lastLogin:null,
        status:'Active'
	},
	urlRoot:function(){
      return APIPATH+'addadmin/'
    },
    parse : function(response) {
        return response.data[0];
      }
  });
  return adminModel;
});

