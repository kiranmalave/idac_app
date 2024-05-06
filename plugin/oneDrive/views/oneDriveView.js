
define([
  'jquery',
  'underscore',
  'backbone',
  'minicolors',
  '../models/oneDriveModel',
], function ($, _, Backbone, minicolors, oneDriveModel) {

  var oneDriveView = Backbone.View.extend({
    initialize: function (options) {
      var selfobj = this;
      let acc = $.cookie('oneauthResponse');
      var methodt = "POST";
      this.model = new oneDriveModel();
      let elID = "token";
      let newdetails =[];
      newdetails["" + elID] = acc;
      this.model.set(newdetails);
      this.model.save({}, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: methodt
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        if (res.flag == "F") {
          alert(res.msg);
        }
      });
    },
  });

  return oneDriveView;

});
