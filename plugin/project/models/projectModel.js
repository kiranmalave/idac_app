define([
    'underscore',
    'backbone',
  ], function(_, Backbone) {
  
    var projectModel = Backbone.Model.extend({
      idAttribute: "project_id"
    });
    return projectModel;
  });

  
  