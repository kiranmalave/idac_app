define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var themeModel = Backbone.Model.extend({
    defaults: {
      // totalCandidates: 1000,
      // totalMales: 400,
      // totalFemale: 600,
      // todayRegister: 10,
    },
    urlRoot: function () {
      // return APIPATH + 'themeDetails';
    },
    parse: function (response) {
      this.flag = response.flag;
      this.msg = response.msg;
      return response.data;
    }
  });
  return themeModel;
});

