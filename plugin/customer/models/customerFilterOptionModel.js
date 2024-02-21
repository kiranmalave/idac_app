define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var customerFilterOptionModel = Backbone.Model.extend({
    idAttribute: "customer_id",
    defaults: {
      status:'active',
      textSearch: '',
      textval: null,
      orderBy: 't.created_date',
      order: "DESC",
      stages: null,
    }
  });
  return customerFilterOptionModel;
});

