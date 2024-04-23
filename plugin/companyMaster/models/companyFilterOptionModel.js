define([
    'underscore',
    'backbone',
  ], function(_, Backbone) {
  
    var companyFilterOptionModel = Backbone.Model.extend({
        idAttribute: "infoID",
         defaults:{
          status:'Active',
          textSearch: '',
          textval: null,
          orderBy:null ,
          order:null ,
      }
    });
    return companyFilterOptionModel;
  });
  
  