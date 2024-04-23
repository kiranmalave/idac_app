define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var taxInvoiceFilterOptionModel = Backbone.Model.extend({
  	idAttribute: "invoiceID",
  	 defaults:{
        // textSearch:'invoiceNumber',
        // textval: null,
        // status:null,
        // orderBy:'invoiceNumber',
        // order:'DESC',
        status:null,
        textSearch: '',
        textval: null,
        record_type: 'invoice',
        orderBy:null ,
        order:null ,
    }
  });
  return taxInvoiceFilterOptionModel;
});

