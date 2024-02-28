define([
  'underscore',
  'backbone',
], function (_, Backbone) {
  var taskFilterOptionModel = Backbone.Model.extend({
    idAttribute: "task_id",
    defaults: {
      textSearch: '',
      record_type: null,
      textval: null,
      fromDate: null,
      toDate: null,
      fromDate2: null,
      toDate2: null,
      due_date:null,
      task_priority: null,
      task_status: null,
      customer_id: null,
      assignee: null,
      created_by: null,
      status: 'Active',
      orderBy: null,
      order: null,
    }
  });
  return taskFilterOptionModel;
});

