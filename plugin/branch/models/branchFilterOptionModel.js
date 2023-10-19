define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var branchFilterOptionModel = Backbone.Model.extend({
    idAttribute: "branchID",
    defaults: {
      textSearch: 'branchName',
      textval: null,
      company:null,
      status: 'Active',
      orderBy: 'createdDate',
      order: 'ASC',
    }
  });
  return branchFilterOptionModel;
});

