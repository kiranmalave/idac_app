define([
  'jquery',
  'underscore',
  'backbone',
  '../models/resetPasswordModel',
  'text!../templates/resetPasswordTemp.html',

], function ($, _, Backbone, resetPasswordModel, resetPasswordTemp) {

  var resetPasswordView = Backbone.View.extend({
    model: resetPasswordModel,
    initialize: function (options) {
      var selfobj = this;
      this.model = new resetPasswordModel();
      this.model.set({ adminID: options.adminID })
      this.render();
    },
    events:
    {
      "blur .txtchange": "updateOtherDetails",
      "click #updatePassword": "updatePassword",
    },
    updatePassword: function (e) {
      e.preventDefault();
      var methodt = "POST";
      if (this.model.get("password") != this.model.get("confirmPassword")) {
        alert("Confirm Password Not Match");
        return false;
      }
      if ($("#updatePasswordForm").valid()) {
        var selfobj = this;
        $(e.currentTarget).html("<span>Updating...</span>");
        $(e.currentTarget).attr("disabled", "disabled");
        this.model.save({}, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler, type: methodt
        }).done(function (res) {
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          // alert(res.flag);
          if (res.flag == "F") {
            alert(res.msg);
            $(e.currentTarget).html("<span>Error</span>");
          } else {
            alert(res.msg);
            app_router.navigate("login", { trigger: true })

          }

          setTimeout(function () {
            $(e.currentTarget).html("<span>Update</span>");
            $(e.currentTarget).removeAttr("disabled");
          }, 3000);

        });
      }
    },
    render: function () {
      alert("sdfsdf");
      var logintemp = resetPasswordTemp;
      var template = _.template(logintemp);
      this.$el.html(template());
      $(".main_container").empty().append(this.$el);
      this.initializeValidate();
      return this;
    },
    updateOtherDetails: function (e) {

      var valuetxt = $(e.currentTarget).val();
      var toID = $(e.currentTarget).attr("id");
      var newdetails = [];
      newdetails["" + toID] = valuetxt;
      this.model.set(newdetails);
    },
    initializeValidate: function () {
      var selfobj = this;
      // alert("hello");
      $("#updatePasswordForm").validate({
        rules: {
          password: {
            required: true,
          },
          confirmPassword: {
            equalTo: "#password"
          }
        },
        messages: {
          password: "Enter Password",
          confirmPassword: "Enter confirm password same as password"
        },
      });
    },

    onErrorHandler: function (collection, response, options) {
      alert("Something was wrong ! Try to refresh the page or contact administer. :(");
      $(".profile-loader").hide();
    },

  });
  return resetPasswordView;

});
