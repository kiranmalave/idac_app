define([
  'underscore',
  'backbone',
], function (_, Backbone) {
  var commentModel = Backbone.Model.extend({
    idAttribute: "comment_id",
    defaults: {
      comment_id: null,
      task_id: null,
      user_id: null,
      comment_text: null,
      customer_id: null,
      created_date: null,
      status: 'active',
    },
    urlRoot: function () {
      return APIPATH + 'taskComment/'
    },
    parse: function (response) {
      return response.data[0];
    }
  });
  return commentModel;
});

