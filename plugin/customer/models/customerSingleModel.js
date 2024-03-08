  define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var customerSingleModel = Backbone.Model.extend({
    idAttribute: "customer_id",
    defaults: {
      customer_id: null,
      salutation: "mr",
      name: null,
      mobile_no: null,
      birth_date: null,
      note: null,
      email: null,
      record_type: "company",
      address: null,
      customer_image: null,
      billing_name: null,
      billing_address: null,
      mobile_no: null,
      branch_id: null,
      gst_no: null,
      adhar_number: null,
      website: null,
      country_id: null,
      state_id: null,
      city_id:null,
      latitude: null,
      longitude: null,
      zipcode: null,
      office_land_line: null,
      stages: null,
      lead_source: null,
      type: 'lead',
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
