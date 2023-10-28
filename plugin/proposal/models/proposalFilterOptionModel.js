define([
    'underscore',
    'backbone',
  ], function (_, Backbone) {
  
    var proposalFilterOptionModel = Backbone.Model.extend({
      idAttribute: "proposal_id",
      defaults: {
        textSearch: 'name',
        textval: null,
        fromDate: null,
        toDate: null,
        status: 'Active',
        orderBy: 'created_date',
        order: 'ASC',
      }
    });
    return proposalFilterOptionModel;
  });
  
  