define([
  'jquery',
  'underscore',
  'backbone',
  'validate',
  'inputmask',
  'datepickerBT',
  '../collections/dynamicFormCollection',
  '../collections/linkedFormCollection',
  '../models/singleDynamicFormModel',
  'text!../templates/dynamicFormSingle_temp.html',
], function ($, _, Backbone, validate, inputmask, datepickerBT, dynamicFormCollection, linkedFormCollection, singleDynamicFormModel, dynamicFormtemp) {

  var dynamicFormSingleView = Backbone.View.extend({
    model: singleDynamicFormModel,
    initialize: function (options) {

      var selfobj = this;
      $(".modelbox").hide();
      scanDetails = options.searchdynamicForm;
      $(".popupLoader").show();

      this.dynamicFormList = new dynamicFormCollection();
      this.model = new singleDynamicFormModel();
      this.linkedFormList = new linkedFormCollection();
      this.linkedFormList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        //console.log(res);
        selfobj.render();
      });
      this.model.set({ menuId: options.menuId });
      this.filterSearch();
      selfobj.render();
    },
    events:
    {
      "click #savedynamicFormDetails": "savedynamicFormDetails",
      "click #canceldynamicFormDetails": "canceldynamicFormDetails",
      "click .item-container li": "setValues",
      "blur .txtchange": "updateOtherDetails",
      "change .multiSel": "setValues",
      "change .drop-fieldType": "updateFieldVisibility",
      "change .drop-fieldTypeDef": "visibleUserDef",
      "change .bDate": "updateOtherDetails",
      "change .dropval": "updateOtherDetails",
      "click .iconSelection": "setIconValues",
      "click .getFieldDetails": "getFieldDetails",
      "click .changeStatus": "changeStatusListElement",
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
      //console.log(this.model)
    },
    setValues: function (e) {

      setvalues = ["status", "allowMultiSelect", "isRequired"];
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
      }, 3000);
      this.updateFieldVisibility();
    },
    savedynamicFormDetails: function (e) {
      e.preventDefault();
      var mid = this.model.get("fieldID");

      /*if(permission.edit != "yes"){
        alert("You dont have permission to edit");
        return false;
      }*/
      if (mid == "" || mid == null) {
        var methodt = "PUT";
      } else {
        var methodt = "POST";
      }
      if ($("#dynamicFormDetails").valid()) {
        var selfobj = this;
        $(e.currentTarget).html("<span>Saving..</span>");
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
            selfobj.filterSearch();
            $(e.currentTarget).html("<span>Saved</span>");

          }

          setTimeout(function () {
            $(e.currentTarget).html("<span>Save</span>");
            $(e.currentTarget).removeAttr("disabled");
          }, 3000);

        });
      }
    },
    updateFieldVisibility: function () {
      var selectedValue = $("#fieldType").val();
      $(".other-fields").addClass("hidden");
      $(".fields-type-" + selectedValue).removeClass("hidden");

    },
    visibleUserDef: function () {
      var selectedValue = $("#valDefault").val();
      //$(".other-fields").addClass("hidden");
      if (selectedValue == "USER_DEFINED")
        $(".fields-type-Def").removeClass("hidden");
      else
        $(".fields-type-Def").addClass("hidden");
    },
    canceldynamicFormDetails: function (e) {
      var selfobj = this;
      var menuId = this.model.get("menuId");
      this.model.clear({ silent: true });
      this.model.set({ menuId: menuId });
      selfobj.render();
      selfobj.setValues();
    },
    changeStatusListElement: function (e) {
      var selfobj = this;
      var removeIds = [];
      var status = $(e.currentTarget).attr("data-action");
      var action = "changeStatus";
      $('#dynamicFormListData input:checkbox').each(function () {
        if ($(this).is(":checked")) {
          removeIds.push($(this).attr("data-fieldID"));
        }
      });

      $(".action-icons-div").hide();
      $(".listcheckbox").click(function () {
        if ($(this).is(":checked")) {
          $(".action-icons-div").show(300);
        } else {
          $(".action-icons-div").hide(200);
        }
      });

      var idsToRemove = removeIds.toString();
      if (idsToRemove == '') {
        alert("Please select at least one record.");
        return false;
      }

      /*var action1 = "DELETE";
      $.ajax({
        url: APIPATH + 'dynamicformfield',
        method: 'POST',
        data: { list: idsToRemove, action: action1, status: status },
        datatype: 'JSON',
        beforeSend: function (request) {
          $(e.currentTarget).html("<span>Updating..</span>");
          request.setRequestHeader("token", $.cookie('_bb_key'));
          request.setRequestHeader("SadminID", $.cookie('authid'));
          request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
          request.setRequestHeader("Accept", 'application/json');
        },
        success: function (res) {
          // if (res.flag == "F")
          //   alert(res.msg);

          // if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          // if (res.flag == "S") {
          //   selfobj.filterSearch();
          // }
          setTimeout(function () {
            $(e.currentTarget).html(status);
          }, 500);
        }
      });*/

      $.ajax({
        url: APIPATH + 'dynamicformfield/status',
        method: 'POST',
        data: { list: idsToRemove, action: action, status: status },
        datatype: 'JSON',
        beforeSend: function (request) {
          $(e.currentTarget).html("<span>Updating..</span>");
          request.setRequestHeader("token", $.cookie('_bb_key'));
          request.setRequestHeader("SadminID", $.cookie('authid'));
          request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
          request.setRequestHeader("Accept", 'application/json');
        },
        success: function (res) {
          if (res.flag == "F")
            alert(res.msg);

          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          if (res.flag == "S") {
            selfobj.filterSearch();
          }
          setTimeout(function () {
            $(e.currentTarget).html(status);
          }, 500);
        }
      });

    },
    initializeValidate: function () {
      var selfobj = this;
      $("#dynamicFormDetails").validate({
        rules: {
          fieldLabel: {
            required: true,
          },
          fieldType: {
            required: true,
          },
          status: {
            required: true,
          }
        },
        messages: {
          fieldLabel: "Please enter Field Label",
          fieldType: "Please select Field Type",
          status: "Please enter Status"
        }
      });
    },
    getFieldDetails: function (e) {
      var selfobj = this;
      readyState = true;
      var fieldID = $(e.currentTarget).attr("data-fieldID");

      this.model.set({ fieldID: fieldID });
      this.model.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        selfobj.render();
        selfobj.setValues();
      });

    },
    filterSearch: function () {
      var selfobj = this;
      readyState = true;
      this.dynamicFormList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y', menuId: this.model.get("menuId") }
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        selfobj.render();
        $(".popupLoader").hide();
        $(".profile-loader").hide();
      });
    },
    render: function () {
      var selfobj = this;
      var source = dynamicFormtemp;
      var template = _.template(source);
      // console.log("this.linkedFormList");
      // console.log(this.linkedFormList);
      this.$el.html(template({ "model": this.model.attributes, "dynamicFormList": this.dynamicFormList.models, "formList": this.linkedFormList.models }));
      $("#startDate").datepickerBT({
        todayBtn: 1,
        autoclose: true,
        dateFormat: "yy-mm-dd",
        onSelect: function (dateText) {
          selfobj.model.set({ startDate: this.value });
          var minDate = new Date(this.value);
        }
      });

      $("#endDate").datepickerBT({
        dateFormat: "yy-mm-dd", autoclose: true,
        onSelect: function (dateText) {
          selfobj.model.set({ endDate: this.value });
        }
      });
      $('.timepicker').timepicker({
        timeFormat: 'h:mm p',
        interval: 1,
        //minTime: '0',
        //maxTime: '12:00pm',
        defaultTime: '11',
        startTime: '00:00',
        dynamic: false,
        dropdown: true,
        scrollbar: true,
        change: function (time) {
          var selectedFieldID = $(this).attr("id");
          selfobj.model.set({ selectedFieldID: $(this).val() });
        }
      });
      this.initializeValidate();
      this.setValues();
      $(".popupLoader").hide();
      $(".app_playground").append(this.$el);
      return this;

    }, onDelete: function () {
      this.remove();
    }
  });

  return dynamicFormSingleView;

});
