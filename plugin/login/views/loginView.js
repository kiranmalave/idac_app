define([
  'jquery',
  'underscore',
  'backbone',
  '../models/loginModel',
  '../views/resetPasswordRequestView',
  'text!../templates/login_temp.html',

], function ($, _, Backbone, loginModel, resetPasswordRequestView, temploginTemplate) {

  var loginView = Backbone.View.extend({
    model: loginModel,
    initialize: function () {
      var selfobj = this;
      this.model = new loginModel();
      this.render();
    },
    events:
    {
      "click #user-login": "checkLogin",
      "blur #txt_username": "setUsername",
      "blur #txt_password": "setPassword",
      "click .loadSubView": "loadSubView",
      "click .showHidePassword": "showHidePassword"
    },
    render: function () {
      var logintemp = temploginTemplate;
      var template = _.template(logintemp);
      this.$el.html(template());
      $(".main_container").empty().append(this.$el);
      return this;
    },
    showHidePassword: function (e) {
      var currentval = $("#txt_password").attr("type");
      if (currentval == "password") {
        $("#txt_password").attr("type", "text");
        $('#eyeIcon').addClass('fa-eye').removeClass('fa-eye-slash');
      }
      if (currentval == "text") {
        $("#txt_password").attr("type", "password");
        $('#eyeIcon').addClass('fa-eye-slash').removeClass('fa-eye');
      }
    },
    setUsername: function (e) {
      this.model.set({ username: $(e.currentTarget).val() });
    },
    setPassword: function (e) {
      this.model.set({ password: $(e.currentTarget).val() });
    },
    onErrorHandler: function (collection, response, options) {
      alert("Something was wrong ! Try to refresh the page or contact administer. :(");
      $(".profile-loader").hide();
    },
    loadSubView: function (e) {
      var show = $(e.currentTarget).attr("data-show");
      switch (show) {
        case "forgotPassword": {
          var resetPasswordRequestview = new resetPasswordRequestView({ resetPassword: this });
          break;
        }
      }
    },
    checkLogin: function (e) {
      e.preventDefault();
      var selfobj = this;
      var pass = $("#txt_password").val();
      $.ajax({
        url: APIPATH + 'salt',
        method: 'GET',
        data: {},
        datatype: 'JSON',
        beforeSend: function (request) {
          request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
          request.setRequestHeader("Accept", 'application/json');
        },
        success: function (res) {
          var code = res.data.salt;
          var md5val = md5(pass);
          var res = md5val.substring(0, 30);
          var combine = res + code;
          var shaval = sha1(combine);
          var shaval_ss = shaval.substring(0, 30);
          selfobj.model.set({ password: shaval_ss });
          var self = selfobj;
          $(e.currentTarget).html("<span>Validating...</span>");
          var userDetails = ({ username: selfobj.model.get("username"), password: selfobj.model.get("password") });
          selfobj.model.fetch({
            headers: {
              'contentType': 'application/x-www-form-urlencoded', 'Accept': 'application/json'
            }, type: 'POST', error: self.onErrorHandler, data: userDetails
          }).done(function (res) {

            if (res.flag == "F") {
              showResponse(e,res,"Sign In");
              return false;
            } else {
              var expDate = new Date();
              expDate.setTime(expDate.getTime() + (120 * 60 * 12000)); // add 15 minutes
              $.cookie('bbauth', 'valid', { path: COKI, expires: expDate });
              $.cookie('_bb_key', res.loginkey, { path: COKI, expires: expDate });
              $.cookie('name', res.data.name, { path: COKI, expires: expDate });
              $.cookie('uname', res.data.userName, { path: COKI, expires: expDate });
              $.cookie('authid', res.data.adminID, { path: COKI, expires: expDate });
              $.cookie('roleOfUser', res.data.roleOfUser, { path: COKI, expires: expDate });
              $.cookie('roleID', res.data.roleID, { path: COKI, expires: expDate });
              var bbauth = $.cookie('bbauth');
              ADMINNAME = $.cookie('name');
              ADMINID = $.cookie('authid');
              ROLEID = $.cookie('roleID');
              getLocalData();
              $(e.currentTarget).html("<span>Sign In</span>");
              app_router.navigate("dashboard", { trigger: true });


            }
          });
        }
      });
    }
  });
  return loginView;

});
