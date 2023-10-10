define([
  'underscore',
  'backbone',
], function (_, Backbone) {
  var taskFilterOptionModel = Backbone.Model.extend({
    idAttribute: "task_id",
    defaults: {
      textSearch: 'subject',
      textval: null,
      fromDate: null,
      toDate: null,
      fromDate2: null,
      toDate2: null,
      task_priority: null,
      task_status: null,
      customer_id: null,
      assignee: null,
      status: 'Active',
      orderBy: 'due_date',
      order: 'ASC',
    }
  });
  return taskFilterOptionModel;
});

