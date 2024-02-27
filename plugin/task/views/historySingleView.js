define([
  "jquery",
  "underscore",
  "backbone",
  "validate",
  "inputmask",
  "datepickerBT",
  "../../core/views/multiselectOptions",
  "../../core/views/timeselectOptions",
  "../collections/historyCollection",
  "text!../templates/historySingle_temp.html",
  "text!../templates/historyRow_temp.html"
], function ($, _, Backbone, validate, inputmask, datepickerBT, multiselectOptions, timeselectOptions, historyCollection, historyTemp, historyRow) {
  var historySingleView = Backbone.View.extend({
    task_id: '',
    loadState: '',
    initialize: function (options) {
      this.dynamicData = null;
      this.toClose = "historySingleView";
      var selfobj = this;
      // this.pluginName = "taskList";
      this.multiselectOptions = new multiselectOptions();
      this.timeselectOptions = new timeselectOptions();
      scanDetails = options.searchhistory;
      $(".popupLoader").show();
      this.task_id = options.task_id;
      this.historyList = new historyCollection();
      if (options.task_id !== "") {
        this.historyList.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler, type: 'post', data: { getAll: 'Y', status: "active", task_id: options.task_id }
        }).done(function (res) {
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          $(".popupLoader").hide();
          selfobj.preparetime();
          selfobj.loadState = res.loadstate;
          selfobj.render();
        });
      }
    },
    events: {
      "click .savehistoryDetails": "savehistoryDetails",
      "click .item-container li": "setValues",
      "blur .txtchange": "updateOtherDetails",
      "change .bDate": "updateOtherDetails",
      "change .dropval": "updateOtherDetails",
      "click .getHistory": "loadData",
    },
    attachEvents: function () {
      // Detach previous event bindings
      this.$el.off("click", ".savehistoryDetails", this.savehistoryDetails);
      // Reattach event bindings
      this.$el.on('click', '.savehistoryDetails', this.savehistoryDetails.bind(this));
      this.$el.off("change", ".bDate", this.updateOtherDetails);
      this.$el.on("change", ".bDate", this.updateOtherDetails.bind(this));
      this.$el.off('click', '.item-container li', this.setValues);
      this.$el.on('click', '.item-container li', this.setValues.bind(this));
      this.$el.off('click', '.getHistory', this.loadData);
      this.$el.on('click', '.getHistory', this.loadData.bind(this));
    },
    preparetime: function () {
      let selfobj = this;
      var models = this.historyList.models;
      for (var i = 0; i < models.length; i++) {
        var model = models[i];
        var timestamp = model.get('timestamp');
        selfobj.timeselectOptions.displayRelativeTime(timestamp);
        model.set({ "timeString": selfobj.timeselectOptions.displayRelativeTime(timestamp) });
      }
      this.render();
    },
    onErrorHandler: function (collection, response, options) {
      alert(
        "Something was wrong ! Try to refresh the page or contact administer. :("
      );
      $(".profile-loader").hide();
    },
    updateOtherDetails: function (e) {
      var valuetxt = $(e.currentTarget).val();
      var toID = $(e.currentTarget).attr("id");
      var newdetails = [];
      newdetails["" + toID] = valuetxt;
      this.model.set(newdetails);
      if (toID == "does_repeat") {
        if (valuetxt == "custom") {
          $(".ws-repeatTask").show();
        } else {
          $(".ws-repeatTask").hide();
        }
      }
      console.log(this.model);
    },
    getTimeData: function () {
      var selfobj = this;
      var model = selfobj.historyList.models
    },
    setOldValues: function () {
      var selfobj = this;
      setvalues = ["is_custom", "category", "admin"];
      selfobj.multiselectOptions.setValues(setvalues, selfobj);
    },
    setValues: function (e) {
      var selfobj = this;
      var da = selfobj.multiselectOptions.setCheckedValue(e);
      selfobj.model.set(da);
    },

    loadData: function (e) {
      var selfobj = this;
      var index = $(e.currentTarget).attr("data-index");
      $element = $('#historyNext');
      this.historyList.reset();
      this.historyList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { getAll: 'Y', status: "active", curpage: index, task_id: this.task_id }
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        $element.attr("data-index", res.paginginfo.nextpage);
        if (res.loadstate) {
        } else {
          $(e.currentTarget).hide();
        }
        var template = _.template(historyRow);
        res.data.forEach(function (objectModel) {
          objectModel.timeString = selfobj.timeselectOptions.displayRelativeTime(objectModel.timestamp);
          $("#historyRow").append(template({ historyList: objectModel }));
        });
      });
    },

    savehistoryDetails: function (e) {
      e.preventDefault();
      let selfobj = this;
      var mid = this.model.get("lesson_id");
      this.model.set({ "history_id": this.history_id });
      console.log(this.model);
      let isNew = $(e.currentTarget).attr("data-action");
      if (permission.edit != "yes") {
        alert("You dont have permission to edit");
        return false;
      }
      if (mid == "" || mid == null) {
        var methodt = "PUT";
      } else {
        var methodt = "POST";
      }
      if ($("#historyDetails").valid()) {
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
          if (res.flag == "S") {
            if (isNew == "new") {
              selfobj.model.clear().set(selfobj.model.defaults);
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
        subject: {
          required: true
        },
        description: {
          required: true
        },

      };
      var feildsrules = feilds;
      var dynamicRules = '';

      if (!_.isEmpty(dynamicRules)) {
        var feildsrules = $.extend({}, feilds, dynamicRules);
        //var feildsrules = {...feilds,...dynamicRules};
      }
      var messages = {
        subject: "Please enter Subject",
        description: "Please enter Deccription",

      };
      $("#historyDetails").validate({
        rules: feildsrules,
        messages: messages,
      });


    },
    render: function () {
      $(".showHistory").empty();
      var selfobj = this;
      var source = historyTemp;
      var template = _.template(source);
      $("#" + this.toClose).remove();
      this.$el.html(template({ "historyList": this.historyList.models, "loadState": selfobj.loadState }))
      this.$el.addClass("tab-pane in active panel_overflow");
      this.$el.attr("id", this.toClose);
      this.$el.addClass(this.toClose);
      this.$el.data("role", "tabpanel");
      this.$el.data("current", "yes");
      this.getTimeData();
      $(".showHistory").append(this.$el);
      $("#" + this.toClose).show();
      // this is used to append the dynamic form in the single view html
      // Do call this function from dynamic module it self.
      this.initializeValidate();
      this.attachEvents();
      // rearrageOverlays("History", this.toClose);
      return this;
    },

  });
  return historySingleView;
});


