define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var branchSingleModel = Backbone.Model.extend({
    idAttribute: "branchID",
    defaults: {
      branchID : null,
      branchName: null,
      status: 'active',
    },
    urlRoot: function () {
      return APIPATH + 'branch/'
    },
    parse: function (response) {
      return response.data[0];
    }
  });
  return branchSingleModel;
});
