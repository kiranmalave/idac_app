define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var infoSettingsModel = Backbone.Model.extend({
    idAttribute: "infoID",
     defaults: {
        infoID:null,
        companyName:null,
        fromEmail:null,
        ccEmail:null,
        fromName:null,
        sacCode:null,
        facebook:null,
        twitter:null,
        instagram:null,
        youtube:null,
        linkedIn:null,
        whatsapp:null,
        website:null,
        ourTarget:null,
        termsConditions:null,
        contractLetter:null,
        created_by:null,
        modified_by:null,
        created_date:null,
        modified_date:null,
    },
  	urlRoot:function(){
      return APIPATH+'infoSettingsList'
    },
    parse : function(response) {
        return response.data[0];
      }
  });
  return infoSettingsModel;
});
