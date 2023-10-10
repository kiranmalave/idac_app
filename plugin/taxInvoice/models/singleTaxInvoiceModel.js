define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var taxInvoiceModel = Backbone.Model.extend({
    idAttribute: "invoiceID",
     defaults: {
        invoiceID:null,
        invoiceNumber:null,
        processingMonth:null,
        processingYear:null,
        reportMonth:null,
        reportYear:null,
        traineeCount:null,
        customer_id:null,
        invoiceDate:null,
        paymentTerms:null,
        invoiceTotal:null,
        stateGstPercent:null,
        interGstPercent:null,
        centralGstPercent:null,
        stateGstAmount:null,
        interGstAmount:null,
        centralGstAmount:null,
        roundOff:null,
        grossAmount:null,
        narrList:null,
        isEdit:'yes',
        invoiceLine:null,
        infoSGST:null,
        infoIGST:null,
        infoCGST:null
    },
  	urlRoot:function(){
      return APIPATH+'taxInvoice/'
    },
    parse : function(response) {
        return response.data[0];
      }
  });
  return taxInvoiceModel;
});
