define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var categoryFilterOptionModel = Backbone.Model.extend({
    idAttribute: "category_id",
    defaults: {
      textSearch: 'categoryName',
      textval: null,
      status: 'Active',
      orderBy: 'created_date',
      order: 'DESC',
    }
  });
  return categoryFilterOptionModel;
});

