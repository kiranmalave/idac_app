define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var ourTeamSingleModel = Backbone.Model.extend({
    idAttribute: "team_id",
    defaults: {
      team_id: null,
      name: null,
      position: null,
      description: null,
      member_image: null,
      modified_by: null,
      created_date: null,
      modified_date: null,
      status: 'active',
    },
    urlRoot: function () {
      return APIPATH + 'ourTeam/'
    },
    parse: function (response) {
      return response.data[0];
    }
  });
  return ourTeamSingleModel;
});
