define([
    'underscore',
    'backbone',
  ], function (_, Backbone) {
  
    var proposalTemplateSingleModel = Backbone.Model.extend({
      idAttribute: "proposalTemplate_id",
      defaults: {
        proposalTemplate_id: null,
        proposalTemplate_name: null,
        client_name: null,
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
    return proposalTemplateSingleModel;
  });
  