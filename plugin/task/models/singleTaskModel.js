define([
  'underscore',
  'backbone',
], function (_, Backbone) {
  var singleTaskModel = Backbone.Model.extend({
    idAttribute: "task_id",
    defaults: {
      task_id: null,
      subject: null,
      description: null,
      customer_id: null,
      category_id: null,
      assignee: null,
      task_status: null,
      task_type: null,
      task_priority: null,
      task_repeat: "does_not_repeat",
      start_date: null,
      end_date: null,
      completed_date: null,
      created_by: null,
      modified_by: null,
      created_date: null,
      modified_date: null,
      tasksWatchers: null,
      tasks_watchersID: null,
      week_numb: null,
      repeat_on: null,
      monthly: null,
      days: null,
      ends: null,
      end_on_date: null,
      end_after_date: null,
      attachment_file: null,
      status: 'active',
    },
    urlRoot: function () {
      return APIPATH + 'taskMaster/'
    },
    parse: function (response) {
      return response.data[0];
    }
  });
  return singleTaskModel;
});
