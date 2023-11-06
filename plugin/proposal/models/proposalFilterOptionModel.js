define([
    'underscore',
    'backbone',
  ], function (_, Backbone) {
  
    var proposalFilterOptionModel = Backbone.Model.extend({
      idAttribute: "proposal_id",
      defaults: {
        textSearch: 'name',
        project_id: null,
        textval: null,
        company: null,
        fromDate: null,
        toDate: null,
        status: 'Active',
        orderBy: 'created_date',
        order: 'ASC',
      }
    });
    return proposalFilterOptionModel;
  });
  
  