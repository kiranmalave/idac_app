define([
    'underscore',
    'backbone',
  ], function (_, Backbone) {
  
    var projectFilterOptionModel = Backbone.Model.extend({
      idAttribute: "project_id",
      defaults: {
        textSearch: 'project_number',
        textval: null,
        client_id: null,
        company: null,
        fromDate: null,
        toDate: null,
        status: 'Active',
        orderBy: 'created_date',
        order: 'ASC',
      }
    });
    return projectFilterOptionModel;
  });
  
  