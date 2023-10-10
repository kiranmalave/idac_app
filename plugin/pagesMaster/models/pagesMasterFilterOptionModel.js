define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var pagesMasterFilterOptionModel = Backbone.Model.extend({
    idAttribute: "pageID",
    defaults: {
      textSearch: 'pageTitle',
      textval: null,
      status: 'active,inactive',
      orderBy: 'pageTitle',
      order: 'ASC',
    }
  });
  return pagesMasterFilterOptionModel;
});

