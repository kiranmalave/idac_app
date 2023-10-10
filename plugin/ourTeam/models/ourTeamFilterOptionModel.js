define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var ourTeamFilterOptionModel = Backbone.Model.extend({
    idAttribute: "team_id",
    defaults: {
      textSearch: 'name',
      textval: null,
      status: 'active',
      orderBy: 'name',
      order: 'ASC',
    }
  });
  return ourTeamFilterOptionModel;
});

