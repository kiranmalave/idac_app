define([
    'underscore',
    'backbone',
  ], function (_, Backbone) {
  
    var proposalTemplateSingleModel = Backbone.Model.extend({
      idAttribute: "temp_id",
      defaults: {
        temp_id: null,
        temp_name: null,
        description: null,
        status: 'active',
      },
      urlRoot: function () {
        return APIPATH + 'proposalTemplateSingle/'
      },
      parse: function (response) {
        return response.data[0];
      }
    });
    return proposalTemplateSingleModel;
  });
  