define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var customerFilterOptionModel = Backbone.Model.extend({
    idAttribute: "customer_id",
    defaults: {
      textSearch: 'company_name',
      textval: null,
      company:null,
      status: 'Active',
      orderBy: 'created_date',
      order: 'ASC',
    }
  });
  return customerFilterOptionModel;
});

