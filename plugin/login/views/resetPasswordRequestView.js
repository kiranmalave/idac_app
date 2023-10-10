define([
  'jquery',
  'underscore',
  'backbone',
  'validate',
  'inputmask',
  '../models/resetPasswordRequestModel',
  '../views/otpView',
  'text!../templates/resetPasswordRequestTemp.html',
], function ($, _, Backbone, validate, inputmask, resetPasswordRequestModel, otpView, resetPasswordRequestTemp) {

  var resetPasswordRequestView = Backbone.View.extend({
    model: resetPasswordRequestModel,
    initialize: function (options) {
      var selfobj = this;
      $(".modelbox").hide();
      scanDetails = options.resetPassword;
      $('#userRoleData').remove();
      $(".popupLoader").show();

      this.model = new resetPasswordRequestModel();

      selfobj.render();
      $(".popupLoader").hide();
    },
    events:
    {
      "click #sendRequest": "sendRequest",
      "click .item-container li": "setValues",
      "blur .txtchange": "updateOtherDetails",
      "change .multiSel": "setValues",
      "change .bDate": "updateOtherDetails",
      "change .dropval": "updateOtherDetails",
    },
    onErrorHandler: function (collection, response, options) {
      alert("Something was wrong ! Try to refresh the page or contact administer. :(");
      $(".profile-loader").hide();
    },
    updateOtherDetails: function (e) {

      var valuetxt = $(e.currentTarget).val();
      var toID = $(e.currentTarget).attr("id");
      var newdetails = [];
      newdetails["" + toID] = valuetxt;
      this.model.set(newdetails);
    },
    setValues: function (e) {
      setvalues = ["status"];
      var selfobj = this;
      $.each(setvalues, function (key, value) {
        var modval = selfobj.model.get(value);
        if (modval != null) {
          var modeVal = modval.split(",");
        } else { var modeVal = {}; }

        $(".item-container li." + value).each(function () {
          var currentval = $(this).attr("data-value");
          var selecterobj = $(this);
          $.each(modeVal, function (key, dbvalue) {
            if (dbvalue.trim().toLowerCase() == currentval.toLowerCase()) {
              $(selecterobj).addClass("active");
            }
          });
        });

      });
      setTimeout(function () {
        if (e != undefined && e.type == "click") {
          var newsetval = [];
          var objectDetails = [];
          var classname = $(e.currentTarget).attr("class").split(" ");
          $(".item-container li." + classname[0]).each(function () {
            var isclass = $(this).hasClass("active");
            if (isclass) {
              var vv = $(this).attr("data-value");
              newsetval.push(vv);
            }
          });

          if (0 < newsetval.length) {
            var newsetvalue = newsetval.toString();
          }
          else { var newsetvalue = ""; }

          objectDetails["" + classname[0]] = newsetvalue;
          $("#valset__" + classname[0]).html(newsetvalue);
          selfobj.model.set(objectDetails);
        }
      }, 500);
    },
    sendRequest: function (e) {
      e.preventDefault();
      var methodt = "POST";
      if ($("#resetPasswordRequest").valid()) {
        var selfobj = this;
        $(e.currentTarget).html("<span>Sending..</span>");
        $(e.currentTarget).attr("disabled", "disabled");
        this.model.save({}, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler, type: methodt
        }).done(function (res) {
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          if (res.flag == "F") {
            alert(res.msg);
            $(e.currentTarget).html("<span>Error</span>");
          } else {
            $(e.currentTarget).html("<span>Sent</span>");
            alert(res.msg);
            $('.modal-backdrop').hide();
            var otp = new otpView({ adminID: res.data.userID });
          }
          setTimeout(function () {
            $(e.currentTarget).html("<span>Resend</span>");
            $(e.currentTarget).removeAttr("disabled");
          }, 3000);

        });
      }
    },
    initializeValidate: function () {
      var selfobj = this;
      $("#userRoleDetails").validate({
        rules: {
          roleName: {
            required: true,
          }
        },
        messages: {
          roleName: "Please enter User Role Name"
        }
      });
    },
    render: function () {
      var source = resetPasswordRequestTemp;
      var template = _.template(source);
      this.$el.html(template());
      $(".main_container").empty().append(this.$el);
      return this;

      // var source = resetPasswordRequestTemp;
      // var template = _.template(source);
      // this.$el.html(template(this.model.attributes));
      // $("#modalBody").append(this.$el);

      // var profile = this.model.get("userName");
      // $(".modal-title").html("Reset Passowrd");
      // $('#userRoleData').show();
      // this.initializeValidate();
      // this.setValues();
      // return this;
    }, onDelete: function () {
      this.remove();
    }
  });

  return resetPasswordRequestView;

});
