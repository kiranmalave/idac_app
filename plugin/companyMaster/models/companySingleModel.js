define([
    'underscore',
    'backbone',
  ], function(_, Backbone) {
  
    var companySingleModel = Backbone.Model.extend({
      idAttribute: "infoID",
      defaults: {
        infoID:null,
        companyName:null,
        fromEmail:null,
        ccEmail:null,
        fromName:null,
        sacCode:null,
        ourTarget:null,
        created_by:null,
        modified_by:null,
        created_date:null,
        modified_date:null,
    },
        urlRoot:function(){
        return APIPATH+'companyMaster/'
      },
      parse : function(response) {
          return response.data[0];
        }
    });
    return companySingleModel;
  });
  