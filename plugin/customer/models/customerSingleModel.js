define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var customerSingleModel = Backbone.Model.extend({
    idAttribute: "customer_id",
    defaults: {
      customer_id: null,
      pan_number: null,
      company_name: null,
      person_name: null,
      billing_address: null,
      branch_id: null,
      GST_no: null,
      billing_name: null,
      mobile_no: null,
      adhar_number: null,
      email: null,
      website: null,
      address: null,
      country_code:null,
      customer_image: null,
      status: 'active',
    },
    urlRoot: function () {
      return APIPATH + 'customerMaster/'
    },
    parse: function (response) {
      return response.data[0];
    }
  });
  return customerSingleModel;
});
