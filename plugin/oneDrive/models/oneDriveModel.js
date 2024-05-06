define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var oneDriveModel = Backbone.Model.extend({
    idAttribute: "customer_id",
    defaults: {
      token:null,
    },
    urlRoot: function () {
      return APIPATH + 'saveOnedriveToken/'
    },
    parse: function (response) {
      return response.data[0];
    }
  });
  return oneDriveModel;
});

