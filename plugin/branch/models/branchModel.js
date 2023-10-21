define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var branchModel = Backbone.Model.extend({
    idAttribute: "branchID"
  });
  return branchModel;
});

