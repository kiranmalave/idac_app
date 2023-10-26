define([
  "jquery",
  "underscore",
  "backbone",
  "validate",
  "inputmask",
  "datepickerBT",
  'typeahead',
  'moment',
  "../../core/views/multiselectOptions",
  "../../dynamicForm/views/dynamicFieldRender",
  "../collections/commentCollection",
  "../models/commentModel",
  "text!../templates/commentSingle_temp.html",
], function ($, _, Backbone, validate, inputmask, datepickerBT, typeahead, moment, multiselectOptions, dynamicFieldRender, commentCollection, commentModel, commentTemp) {
  var commentSingleView = Backbone.View.extend({
    model: commentModel,
    initialize: function (options) {
      this.dynamicData = null;
      this.toClose = "commentSingleView";
      var selfobj = this;
      this.pluginName = "taskList";
      this.model1 = new commentModel();
      // use this valiable for dynamic fields to featch the data from server
      this.dynamicFieldRenderobj = new dynamicFieldRender({ ViewObj: selfobj, formJson: {}, });
      this.multiselectOptions = new multiselectOptions();
      scanDetails = options.searchcomment;
      // this.collection.on('add',this.addOne,this);
      // this.collection.on('reset',this.addAll,this);
      $(".popupLoader").show();

      this.commentList = new commentCollection();
      if (options.task_id !== "") {
        this.commentList.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler, type: 'post', data: { getAll: 'Y', status: "active", task_id: options.task_id }
        }).done(function (res) {
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          $(".popupLoader").hide();
          selfobj.render();
          setPagging(res.paginginfo, res.loadstate, res.msg);
        });

      }
      // console.log(this.commentList);


    },

    events: {
      "click .savecommentDetails": "savecommentDetails",
      "click .item-container li": "setValues",
      "blur .txtchange": "updateOtherDetails",
      "change .bDate": "updateOtherDetails",
      "change .dropval": "updateOtherDetails",

    },
    attachEvents: function () {
      // Detach previous event bindings
      this.$el.off("click", ".savecommentDetails", this.savecommentDetails);
      // Reattach event bindings
      this.$el.on('click', '.savecommentDetails', this.savecommentDetails.bind(this));
      this.$el.off("change", ".bDate", this.updateOtherDetails);
      this.$el.on("change", ".bDate", this.updateOtherDetails.bind(this));
      this.$el.off('click', '.item-container li', this.setValues);
      this.$el.on('click', '.item-container li', this.setValues.bind(this));
      this.$el.off("change", ".dropval", this.updateOtherDetails);
      // this.$el.on("change", ".dropval", this.updateOtherDetails.bind(this));
      // this.$el.off("blur", ".txtchange", this.updateOtherDetails);
      // this.$el.on("blur", ".txtchange", this.updateOtherDetails.bind(this));   

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
    updateComment: function (e) {
      var comment = $(e.currentTarget).val();
      $("#comment").val(comment);
      this.model1.set({ "comment_text": comment });
    },
    saveComment: function (e) {
      e.preventDefault();
      let selfobj = this;
      let isNew = $(e.currentTarget).attr("data-action");
      //this.model1.set({ "user_id": comment });
      let mid = "";
      isNew = "new";
      if (mid == "" || mid == null) {
        var methodt = "PUT";
      } else {
        var methodt = "POST";
      }
      this.model1.save({}, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: methodt
      }).done(function (res) {
        if (res.flag == "S") {
          // selfobj.model1.clear().set(selfobj.model1.defaults);
          // selfobj.dynamicFieldRenderobj.initialize({ViewObj: selfobj,formJson: {},});
          // selfobj.render();
        }

      });

    },
    saveCommentDetails: function (e) {
      e.preventDefault();
      let selfobj = this;
      var mid = this.model.get("lesson_id");
      this.model.set({ "comment_id": this.comment_id });
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
      if ($("#commentDetails").valid()) {
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
          scanDetails.filterSearch();
          if (res.flag == "S") {
            if (isNew == "new") {
              selfobj.model.clear().set(selfobj.model.defaults);
              selfobj.dynamicFieldRenderobj.initialize({ ViewObj: selfobj, formJson: {} });
              alert("herer");
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
      var dynamicRules = selfobj.dynamicFieldRenderobj.getValidationRule();

      if (!_.isEmpty(dynamicRules)) {
        var feildsrules = $.extend({}, feilds, dynamicRules);
        //var feildsrules = {...feilds,...dynamicRules};
      }
      var messages = {
        subject: "Please enter Subject",
        description: "Please enter Deccription",

      };
      $("#commentDetails").validate({
        rules: feildsrules,
        messages: messages,
      });
    },
    render: function () {
      $(".showPages").empty();
      $(".showHistory").empty();
      var selfobj = this;
      var source = commentTemp;
      var template = _.template(source);
      $("#" + this.toClose).remove();
      this.$el.html(template({ "commentList": this.commentList.models }))
      // this.$el.addClass("tab-pane in active panel_overflow");
      this.$el.attr("id", this.toClose);
      this.$el.addClass(this.toClose);
      this.$el.data("role", "tabpanel");
      this.$el.data("current", "yes");
      $(".showPages").append(this.$el);
      $("#" + this.toClose).show();
      // this is used to append the dynamic form in the single view html
      $("#dynamicFormFields").empty().append(this.dynamicFieldRenderobj.getform());
      // Do call this function from dynamic module it self.
      $('.ws-select').selectpicker();
      this.initializeValidate();
      // rearrageOverlays("Comments", this.toClose);
      return this;
    },

  });
  return commentSingleView;
});


