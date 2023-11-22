define([
    'underscore',
    'backbone',
  ], function (_, Backbone) {
  
    var proposalTemplateFilterOptionModel = Backbone.Model.extend({
      idAttribute: "proposalTemplate_id",
      defaults: {
        textSearch: 'temp_name',
        textval: null,
        fromDate: null,
        toDate: null,
        status: 'Active',
        orderBy: 'created_date',
        order: 'ASC',
      }
    });
    return proposalTemplateFilterOptionModel;
  });
  
  