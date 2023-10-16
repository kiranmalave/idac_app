define([
    'underscore',
    'backbone',
  ], function(_, Backbone) {
  
    var proposalModel = Backbone.Model.extend({
      idAttribute: "proposal_id"
    });
    return proposalModel;
  });

  