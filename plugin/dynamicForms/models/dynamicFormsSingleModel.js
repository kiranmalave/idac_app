define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var dynamicFormsSingleModel = Backbone.Model.extend({
    idAttribute: "form_id",
    defaults: {
      form_id: null,
      form_name: null,
      question_type:'choice',
      modified_by: null,
      created_date: null,
      modified_date: null,
      status: 'active',
    },
    urlRoot: function () {
      return APIPATH + 'dynamicForms/'
    },
    parse: function (response) {
      return response.data[0];
    }
  });
  return dynamicFormsSingleModel;
});
