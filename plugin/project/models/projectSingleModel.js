define([
    'underscore',
    'backbone',
  ], function (_, Backbone) {
  
    var projectSingleModel = Backbone.Model.extend({
      idAttribute: "project_id",
      defaults: {
        project_id: null,
        project_name: null,
        client_id: null,
        description: null,
        status: 'active',
      },
      urlRoot: function () {
        return APIPATH + 'project/'
      },
      parse: function (response) {
        return response.data[0];
      }
    });
    return projectSingleModel;
  });
  