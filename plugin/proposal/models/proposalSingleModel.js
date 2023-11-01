define([
    'underscore',
    'backbone',
  ], function (_, Backbone) {
  
    var proposalSingleModel = Backbone.Model.extend({
      idAttribute: "proposal_id",
      defaults: {
        proposal_id: null,
        name: null,
        project_id:null,
        client_id:null,
        description: null,
        proposal_number:null,
        copy: "no",
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
  