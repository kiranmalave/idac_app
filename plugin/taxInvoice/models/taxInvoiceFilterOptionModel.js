define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var taxInvoiceFilterOptionModel = Backbone.Model.extend({
  	idAttribute: "invoiceID",
  	 defaults:{
        textSearch: '',
        textval: null,
        status: null,
        customer_id: null,
        orderBy: 'invoiceNumber',
        status:'active',
        order: 'DESC',
        record_type: 'invoice',
    }
  });
  return taxInvoiceFilterOptionModel;
});

