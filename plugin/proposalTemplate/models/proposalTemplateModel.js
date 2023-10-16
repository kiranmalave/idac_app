define([
    'underscore',
    'backbone',
  ], function(_, Backbone) {
  
    var proposalTemplateModel = Backbone.Model.extend({
      idAttribute: "proposalTemplate_id"
    });
    return proposalTemplateModel;
  });

  
  