define([
  'jquery',
  'underscore',
  'backbone',
  'validate',
  "datepickerBT",
  'moment',
  '../../core/views/multiselectOptions',
  '../models/adminSingleModel',
  '../../dynamicForm/views/dynamicFieldRender',
  'text!../templates/addAdmin_temp.html',
  '../../userRole/collections/userRoleCollection',
], function ($, _, Backbone, validate, datepickerBT, moment, multiselectOptions, adminModel, dynamicFieldRender, addAdminTemp, userRoleCollection) {

  var addAdminView = Backbone.View.extend({
    initialize: function (options) {
      this.toClose = "addAdminView";
      var selfobj = this;
      this.loadFrom = options.loadfrom;
      // this.dynamicFieldRenderobj = new dynamicFieldRender({ ViewObj: selfobj, formJson: {} });
      this.multiselectOptions = new multiselectOptions();
      scanDetails = options.searchadmin;
      $(".popupLoader").show();
      this.model = new adminModel();
      this.userRoleList = new userRoleCollection();
      this.userRoleList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, data: { getAll: 'Y', status: "active" }
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        selfobj.model.set("userRoleList", res.data);
        selfobj.render();
      });

      if (options.adminID != "") {
        this.model.set({ adminID: options.adminID });
        this.model.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler
        }).done(function (res) {
          var dob = selfobj.model.get("dateOfBirth");
          if (dob != null && dob != "0000-00-00") {
            selfobj.model.set({ "dateOfBirth": moment(dob).format("DD-MM-YYYY") });
          }
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          $(".popupLoader").hide();
          selfobj.render();
          selfobj.setOldValues();
          $('#email').removeClass("updateUserName");
        });
      }

    },
    events:
    {
      "click .saveEduDetails": "saveEduDetails",
      "blur .txtchange": "updateOtherDetails",
      "click .multiSel": "setValues",
      "blur .updateUserName": "updateUserName",
      "change .dropval": "updateOtherDetails",
      "change .roleChange": "changeRole",
    },
    attachEvents: function () {
      // Detach previous event bindings
      this.$el.off('click', '.saveEduDetails', this.saveEduDetails);
      // Reattach event bindings
      this.$el.on('click', '.saveEduDetails', this.saveEduDetails.bind(this));

      this.$el.off('click', '.multiSel', this.setValues);
      this.$el.on('click', '.multiSel', this.setValues.bind(this));
      this.$el.off('change', '.dropval', this.updateOtherDetails);
      this.$el.on('change', '.dropval', this.updateOtherDetails.bind(this));
      this.$el.off('blur', '.updateUserName', this.updateUserName);
      this.$el.on('blur', '.updateUserName', this.updateUserName.bind(this));
      this.$el.off('blur', '.txtchange', this.updateOtherDetails);
      this.$el.on('blur', '.txtchange', this.updateOtherDetails.bind(this));
      this.$el.off('change', '.roleChange', this.changeRole);
      this.$el.on('change', '.roleChange', this.changeRole.bind(this));
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
    updateUserName: function (e) {
      var selfobj = this;
      var valuetxt = $(e.currentTarget).val();
      var emailarray = valuetxt.split("@");
      // console.log(emailarray);
      this.model.set({ userName: emailarray[0] });
      selfobj.render();
    },
    changeRole: function (e) {
      let selfobj = this;
      var adminID = this.model.get("adminID");
      var oldValue = this.model.get("roleID");
      var newValue = $(e.currentTarget).val();
      if (adminID != undefined) {
        if (oldValue == 1) {
          if (newValue != 1) {
            alert("You Cannot Change Admin Role");
            $(e.currentTarget).val(oldValue);
          }
        } else {
          selfobj.model.set({ roleID: newValue });
        }
      } else {
        selfobj.model.set({ roleID: newValue });
      }
    },
    setOldValues: function () {
      var selfobj = this;
      setvalues = ["status"];
      selfobj.multiselectOptions.setValues(setvalues, selfobj);
    },
    setValues: function (e) {
      var selfobj = this;
      var da = selfobj.multiselectOptions.setCheckedValue(e);
      selfobj.model.set(da);
    },
    saveEduDetails: function (e) {
      e.preventDefault();
      let selfobj = this;
      var aid = this.model.get("adminID");
      let isNew = $(e.currentTarget).attr("data-action");
      if (permission.edit != "yes") {
        alert("You dont have permission to edit");
        return false;
      }
      if (aid == "" || aid == null) {
        var methodt = "PUT";
      } else {
        var methodt = "POST";
      }
      // console.log(this.model);
      if ($("#adminDetails").valid()) {
        $(e.currentTarget).html("<span>Saving..</span>");
        $(e.currentTarget).attr("disabled", "disabled");
        this.model.save({}, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler, type: methodt
        }).done(function (res) {
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          if (isNew == "new") {
            showResponse(e, res, "Save & New");
          } else {
            showResponse(e, res, "Save");
          }
          if (selfobj.loadFrom == "TaskSingleView") {
            scanDetails.refreshAdmin();
          } else {
            scanDetails.filterSearch();
          }
          if (res.flag == "S") {
            if (isNew == "new") {
              selfobj.model.clear().set(selfobj.model.defaults);
              // selfobj.dynamicFieldRenderobj.initialize({ ViewObj: selfobj, formJson: {} });
              selfobj.render();
            } else {
              handelClose(selfobj.toClose);
            }
          }
        });
      }
    },
    initializeValidate: function () {
      var selfobj = this;
      var feilds = {
        name: {
          required: true,
        },
        userName: {
          required: true,
        },
        email: {
          required: true,
          email: true,
        },
        password: {
          required: true,
        },
        roleID: {
          required: true,
        },
        whatsappNo: {
          minlength: 10,
          maxlength: 10
        },
        contactNo: {
          required: true,
          minlength: 10,
          maxlength: 10
        }
      };
      var feildsrules = feilds;
      // var dynamicRules = selfobj.dynamicFieldRenderobj.getValidationRule();

      // if (!_.isEmpty(dynamicRules)) {

      //   var feildsrules = $.extend({}, feilds, dynamicRules);
      //   // var feildsrules = {
      //   // ...feilds,
      //   // ...dynamicRules
      //   // };
      // }
      var messages = {
        name: "Please enter Name",
        userName: "Please enter Username",
        email: "Please enter Valid Email-ID ",
        password: "Please enter Password",
        roleID: "Please select User Role",
        whatsappNo: "Please enter valid Number",
        contactNo: "Please enter valid Number"
      };
      $('#contactNo,#whatsappNo,#myTarget').inputmask('Regex', { regex: "^[0-9](\\d{1,9})?$" });
      $("#adminDetails").validate({
        rules: feildsrules,
        messages: messages
      });
      startDate = $('#dateOfBirth').datepickerBT({
        format: "dd-mm-yyyy",
        todayBtn: "linked",
        clearBtn: true,
        todayHighlight: true,
        endDate: new Date(),
        numberOfMonths: 1,
        autoclose: true,
      }).on('changeDate', function (ev) {
        var valuetxt = $("#dateOfBirth").val();
        selfobj.model.set({ "dateOfBirth": valuetxt });
        console.log(selfobj.model);
      });
    },
    render: function () {
      var source = addAdminTemp;
      var template = _.template(source);
      $("#" + this.toClose).remove();
      this.$el.html(template({ "model": this.model.attributes, "userRoleList": this.userRoleList.models }));
      this.$el.addClass("tab-pane in active panel_overlay");
      this.$el.attr('id', this.toClose);
      this.$el.addClass(this.toClose);
      this.$el.data("role", "tabpanel");
      this.$el.data("current", "yes");
      //this.$el.html(res);
      $(".ws-tab").append(this.$el);
      $('#' + this.toClose).show();
      // $("#dynamicFormFields").empty().append(this.dynamicFieldRenderobj.getform());

      this.initializeValidate();
      this.setOldValues();
      this.attachEvents();
      rearrageOverlays("Add Admin", this.toClose);
      return this;

    }, onDelete: function () {
      this.remove();
    }
  });

  return addAdminView;

});
