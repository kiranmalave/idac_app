define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var customerFilterOptionModel = Backbone.Model.extend({
    idAttribute: "customer_id",
    defaults: {
      textSearch: 'first_name',
      textval: null,
      fromDate: null,
      toDate: null,
      status: 'Active',
      orderBy: 'created_date',
      order: 'ASC',
    }
  });
  return customerFilterOptionModel;
});

