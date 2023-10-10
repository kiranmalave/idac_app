define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var customerSingleModel = Backbone.Model.extend({
    idAttribute: "customer_id",
    defaults: {
      customer_id: null,
      salutation: "mr",
      first_name: null,
      middle_name: null,
      last_name: null,
      mobile_no: null,
      birth_date: null,
      email: null,
      type: null,
      address: null,
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
