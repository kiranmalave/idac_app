define([
    'underscore',
    'backbone',
  ], function (_, Backbone) {
  
    var proposalSingleModel = Backbone.Model.extend({
      idAttribute: "proposal_id",
      defaults: {
        proposal_id: null,
        salutation: "mr",
        proposal_name: null,
        status: 'active',
      },
      urlRoot: function () {
        return APIPATH + 'proposalMaster/'
      },
      parse: function (response) {
        return response.data[0];
      }
    });
    return proposalSingleModel;
  });
  