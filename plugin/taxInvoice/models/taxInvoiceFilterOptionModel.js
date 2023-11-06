define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var taxInvoiceFilterOptionModel = Backbone.Model.extend({
    idAttribute: "invoiceID",
    defaults: {
      textSearch: 'invoiceNumber',
      textval: null,
      status: null,
      customer_id: null,
      orderBy: 'invoiceNumber',
      status:'active',
      order: 'DESC',
    }
  });
  return taxInvoiceFilterOptionModel;
});

