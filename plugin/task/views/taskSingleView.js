define([
  "jquery",
  "underscore",
  "backbone",
  "validate",
  "inputmask",
  "datepickerBT",
  'typeahead',
  'moment',
  "../views/repeatTaskCustomView",
  '../views/commentSingleView',
  '../views/historySingleView',
  '../../customer/views/customerSingleView',
  '../../admin/views/addAdminView',
  "../../core/views/multiselectOptions",
  '../../category/views/categorySingleView',
  "../../dynamicForm/views/dynamicFieldRender",
  "../../customer/collections/customerCollection",
  "../../category/collections/slugCollection",
  "../../admin/collections/adminCollection",
  "../collections/taskCollection",
  "../collections/commentCollection",
  "../../readFiles/views/readFilesView",
  "../models/singleTaskModel",
  "../models/commentModel",
  "text!../templates/taskSingle_temp.html",
], function ($, _, Backbone, validate, inputmask, datepickerBT, typeahead, moment, repeatTaskCustomView, commentSingleView, historySingleView, customerSingleView, addAdminView, multiselectOptions, categorySingleView, dynamicFieldRender, customerCollection, slugCollection, adminCollection, taskCollection, commentCollection, readFilesView, singleTaskModel, commentModel, tasktemp) {
  var taskSingleView = Backbone.View.extend({
    model: singleTaskModel,
    enteredWatchersArray: [],
    attachedDocURLArray: [],
    // tagApi:null,
    tempRes: [],
    initialize: function (options) {
      this.dynamicData = null;
      this.toClose = "taskSingleView";
      this.tagID = null;
      var selfobj = this;
      this.pluginName = "taskList";
      this.loggedInID = $.cookie("authid");
      this.userRoll = $.cookie('roleOfUser');
      this.model = new singleTaskModel();
      this.model.set({ assignee: this.loggedInID });
      this.model1 = new commentModel();
      // use this valiable for dynamic fields to featch the data from server
      this.dynamicFieldRenderobj = new dynamicFieldRender({ ViewObj: selfobj, formJson: {}, });
      this.multiselectOptions = new multiselectOptions();
      scanDetails = options.searchtask;
      $(".popupLoader").show();
      if (options.task_id != "") {
        this.model.set({ task_id: options.task_id });

        this.model.fetch({
          headers: { 'contentType': "application/x-www-form-urlencoded", 'SadminID': $.cookie("authid"), token: $.cookie("_bb_key"), Accept: "application/json", },
          error: selfobj.onErrorHandler,
        }).done(function (res) {
          var startDate = selfobj.model.get("start_date");
          var due_date = selfobj.model.get("due_date");
          if (startDate != null && startDate != "0000-00-00" || due_date != null && due_date != "0000-00-00") {
            selfobj.model.set({ "due_date": moment(due_date).format("DD-MM-YYYY") });
            selfobj.model.set({ "start_date": moment(startDate).format("DD-MM-YYYY") });
          }
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          $(".popupLoader").hide();
          selfobj.render();
        });
      }
      this.customerList = new customerCollection();
      this.customerList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, data: { getAll: 'Y', status: "active" }
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        selfobj.render();
      });
      this.categoryList = new slugCollection();
      this.categoryList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y', slug: 'task_priority,task_type,task_status' }
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        selfobj.render();
      });

      this.adminList = new adminCollection();
      this.adminList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { status: "active" }
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".profile-loader").hide();
        selfobj.render();
      });
      this.getCommentList()
    },
    getCommentList: function () {
      let selfobj = this;
      this.commentList = new commentCollection();
      var task_id = this.model.get("task_id");
      // alert(task_id);
      if (task_id !== "") {
        this.model1.set({ task_id: task_id });
        this.commentList.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler, type: 'post', data: { status: "active", getAll: 'Y', task_id: task_id }
        }).done(function (res) {
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          $(".popupLoader").hide();
          selfobj.render();
        });
      }
    },
    events: {
      "click .saveTaskDetails": "saveTaskDetails",
      "blur .txtchange": "updateOtherDetails",
      "change .dropval": "updateOtherDetails",
      "click .comment-box": "showCommentBox",
      "click .loadCustom": "loadSubView",
      "click .loadMedia": "loadMedia",
      "change .watchersName": "addWatchers",
      "click .saveComment": "saveComment",
      "click .loadview": "loadSubView",
      "click .cancelPost": "cancelPost",
      "change .ql-editor": "showPostbtn",
      "click .deleteAttachment": "deleteAttachment",
    },
    attachEvents: function () {
      // Detach previous event bindings
      this.$el.off("click", ".saveTaskDetails", this.saveTaskDetails);
      // Reattach event bindings
      this.$el.on("click", ".saveTaskDetails", this.saveTaskDetails.bind(this));
      this.$el.off('click', '.saveComment', this.saveComment);
      this.$el.on('click', '.saveComment', this.saveComment.bind(this));
      this.$el.off('click', '.item-container li', this.setValues);
      this.$el.on('click', '.item-container li', this.setValues.bind(this));
      this.$el.off("change", ".dropval", this.updateOtherDetails);
      this.$el.on("change", ".dropval", this.updateOtherDetails.bind(this));
      this.$el.off("click", ".loadCustom", this.loadSubView);
      this.$el.on("click", ".loadCustom", this.loadSubView.bind(this));
      this.$el.off("blur", ".txtchange", this.updateOtherDetails);
      this.$el.on("blur", ".txtchange", this.updateOtherDetails.bind(this));
      this.$el.off("click", ".loadMedia", this.loadMedia);
      this.$el.on("click", ".loadMedia", this.loadMedia.bind(this));
      this.$el.off('change', '.watchersName', this.addWatchers);
      this.$el.on('change', '.watchersName', this.addWatchers.bind(this));
      this.$el.off('click', '.loadview', this.loadSubView);
      this.$el.on('click', '.loadview', this.loadSubView.bind(this));
      this.$el.off('click', '.comment-box', this.showCommentBox);
      this.$el.on('click', '.comment-box', this.showCommentBox.bind(this));
      this.$el.off('click', '.cancelPost', this.cancelPost);
      this.$el.on('click', '.cancelPost', this.cancelPost.bind(this));
      this.$el.off('change', '.ql-editor', this.showPostbtn);
      this.$el.on('change', '.ql-editor', this.showPostbtn.bind(this));
      this.$el.off('click', '.deleteAttachment', this.deleteAttachment);
      this.$el.on('click', '.deleteAttachment', this.deleteAttachment.bind(this));
    },
    showCommentBox: function (e) {
      let selfobj = this;
      $(e.currentTarget).hide();
      $(".commentEditor").show();
      $(".comment-editor").show();
      var __toolbarOptions = [
        ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
        [{ 'header': 1 }, { 'header': 2 }],               // custom button values
        [{ 'direction': 'rtl' }],                         // text direction
        [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
        [{ 'align': [] }],
        ['link'],
        ['clean']                                         // remove formatting button
      ];
      if (!$(".comment-editor").hasClass("ql-container")) {
        var editor = new Quill($("#comment").get(0), {
          modules: {
            toolbar: __toolbarOptions
          },
          theme: 'snow'  // or 'bubble'
        });

        //const delta = editor.clipboard.convert();
        //editor.setContents(delta, 'silent');
        editor.on('text-change', function (delta, oldDelta, source) {
          if (source == 'api') {
            console.log("An API call triggered this change.");
          } else if (source == 'user') {
            var delta = editor.getContents();
            var text = editor.getText();
            var justHtml = editor.root.innerHTML;
            selfobj.model1.set({ "comment_text": justHtml });
          }
        });
      }
    },
    deleteAttachment: function (e) {
      let file_id = $(e.currentTarget).attr("data-file_id");
      let task_id = this.model.get("task_id");
      let status = "delete";
      let div = document.getElementById('removeIMG');
      console.log("file id" +file_id);
      console.log("task id" +task_id);
      $.ajax({
        url: APIPATH + 'taskMaster/removeAttachment',
        method: 'POST',
        data: { fileID: file_id, status: status, taskID: task_id },
        datatype: 'JSON',
        beforeSend: function (request) {
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
            scanDetails.filterSearch();

          }
          div.remove();
        }
      });
    },
    cancelPost: function (e) {
      // Clear the content inside the Quill editor
      var quill = new Quill('#comment');
      quill.setText('');
      $(".comment-box").show();
      $(".commentEditor").hide();
    },
    showPostbtn: function () {
      alert("herer");
    },
    onErrorHandler: function (collection, response, options) {
      alert(
        "Something was wrong ! Try to refresh the page or contact administer. :("
      );
      $(".profile-loader").hide();
    },
    updateOtherDetails: function (e) {
      var valuetxt = $(e.currentTarget).val();
      if (valuetxt == "addCustomer") {
        new customerSingleView({ searchCustomer: this, loadfrom: "TaskSingleView" });
      } else if (valuetxt == "addAssignee") {
        new addAdminView({ searchadmin: this, loadfrom: "TaskSingleView" });
      } else if (valuetxt == "addStatus" || valuetxt == "addPriority" || valuetxt == "addType") {
        new categorySingleView({ searchCategory: this, loadfrom: "TaskSingleView" });
      }
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
      // console.log(this.model);
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
    getSelectedFile: function (url) {
      let docUrl = "";
      let furl = url.split("/");
      fName = furl[furl.length - 1];
      this.attachedDocURLArray.push({ url: fName });
      ftext = fName.split(".");
      if (ftext[2] == "xls" || ftext[2] == "xlsx") {
        fName = "excel.png";
      } else if (ftext[2] == "pdf") {
        fName = "pdf.png";
      }
      docUrl = "<div class='col-xl-2 col-lg-3 col-md-4 col-sm-12 m-b-20' data-show='singleFile' data-url='" + UPLOADS + "/" + fName + "'><div class='thumbnail'><div class='centered'><img class='img-fluid fileImage img-thumbnail' src='" + UPLOADS + "/" + fName + "' alt=''></div></div></div>";
      // $('.' + this.elm).val(url);
      // $('.' + this.elm).change();
      document.getElementById("attachedDoc").innerHTML += docUrl;
      $('#largeModal').modal('toggle');
      this.model.set({ "attachment_file": this.attachedDocURLArray });
    },
    loadMedia: function (e) {
      e.stopPropagation();
      $('#largeModal').modal('toggle');
      this.elm = "profile_pic";
      new readFilesView({ loadFrom: "addpage", loadController: this });
    },
    loadSubView: function (e) {
      var selfobj = this;
      var show = $(e.currentTarget).attr("data-view");
      console.log(e.currentTarget);
      switch (show) {
        case "taskData": {
          let task_id = $(e.currentTarget).attr("data-task_id");
          new taskSingleView({ task_id: task_id, scanDetails: this.scanDetails });
          break;
        }
        case "singleCommentData": {
          var task_id = $(e.currentTarget).attr("data-task_id");
          $(".showComment").show();
          new commentSingleView({ task_id: task_id });
          break;
        }
        case "singleHistoryData": {
          var task_id = $(e.currentTarget).attr("data-task_id");
          $(".showComment").hide();
          new historySingleView({ task_id: task_id });
          break;
        }
        case "singleScheduleData": {
          var task_id = $(e.currentTarget).attr("data-task_id");
          new historySingleView({ task_id: task_id });
          break;
        }
        case "repeatTask": {
          let task_id = $(e.currentTarget).attr("data-task_id");
          new repeatTaskCustomView({ task_id: task_id, scanDetails: this });
          break;
        }
      }
    },
    saveTaskDetails: function (e) {
      e.preventDefault();
      let selfobj = this;
      var task_id = this.model.get("task_id");
      let isNew = $(e.currentTarget).attr("data-action");
      if (permission.edit != "yes") {
        alert("You dont have permission to edit");
        return false;
      }
      if (task_id == "" || task_id == null) {
        var methodt = "PUT";
      } else {
        var methodt = "POST";
      }
      if ($("#taskDetails").valid()) {
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
              selfobj.dynamicFieldRenderobj.initialize({ ViewObj: selfobj, formJson: {}, });
              selfobj.render();
            } else {
              handelClose(selfobj.toClose);
            }
          }
        });
      }
    },
    refreshCust: function (e) {
      let selfobj = this;
      this.customerList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, data: { getAll: 'Y', status: "active" }
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        selfobj.render();
      });
    },
    refreshAdmin: function (e) {
      let selfobj = this;
      this.adminList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { status: "active" }
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".profile-loader").hide();
        selfobj.render();
      });
    },
    refreshCat: function () {
      let selfobj = this;
      this.categoryList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y', slug: 'task_priority,task_type,task_status' }
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        selfobj.render();
      });
    },
    saveComment: function (e) {
      e.preventDefault();
      let selfobj = this;
      let isNew = $(e.currentTarget).attr("data-action");
      console.log(selfobj.model);
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
          selfobj.model1.clear().set(selfobj.model1.defaults);
          selfobj.dynamicFieldRenderobj.initialize({ ViewObj: selfobj, formJson: {}, });
          selfobj.getCommentList();
        }
      });
    },
    addWatchers: function () {
      let selfobj = this;
      tagApi = $(".tm-input").tagsManager();
      $("#typehead").typeahead({
        name: 'tags',
        displayKey: 'name',
        minLength: 2,
        source: function (query, process) {
          var listName = $.ajax({
            url: APIPATH + 'getSystemUserNameList/',
            method: 'POST',
            data: { text: query },
            datatype: 'JSON',
            beforeSend: function (request) {
              $(".textLoader").show();
              request.setRequestHeader("token", $.cookie('_bb_key'));
              request.setRequestHeader("SadminID", $.cookie('authid'));
              request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
              request.setRequestHeader("Accept", 'application/json');
            },
            success: function (res) {
              $(".textLoader").hide();
              let result = [];
              if (res != "") {
                console.log(res.data);
                selfobj.tempRes = res.data;
                $.each(res.data, function (dd, value) {
                  str = value.adminID + " - " + value.name;
                  result.push(str);
                  selfobj.tagID = value.adminID;
                });
                //let result = res.data.filter((function (rr) {
                //return rr.email;
              }
              return process(result);

            }
          });
          console.log(JSON.stringify(listName));
          return listName;
        },
        afterSelect: function (item) {
          tagApi.tagsManager("pushTag", item);
          $("#typehead").val("");
          selfobj.enteredWatchersArray.push({ name: item, id: selfobj.tagID });
          selfobj.model.set({ "tasksWatchers": selfobj.enteredWatchersArray });
          console.log(selfobj.model);
        }
      });

      var watchersToAdd = this.model.get("tasksWatchers");
      var watcherID = this.model.get("tasks_watchersID");
      var watchersLength = selfobj.enteredWatchersArray.length;
      if (watchersToAdd && Array.isArray(watchersToAdd) && watcherID && Array.isArray(watcherID) && watchersToAdd.length === watcherID.length) {
        if (watchersLength == 0 || watchersToAdd.length > watchersLength) {
          for (let i = 0; i < watchersToAdd.length; i++) {
            var enteredName = watchersToAdd[i].trim();
            var id = watcherID[i];
            var item = { name: enteredName, tagidtoremove: id };
            tagApi.tagsManager("pushTag", item.name, item.tagidtoremove);

          }
        }
      }
      $(".tm-tag-remove").on("click", function (e) {
        // var id = $(e.currentTarget).attr("tagidtoremove");
        var name = $(this).siblings('span').text();
        var id = name.split("-");
        var status = "delete";
        var action = "changeStatus";
        var taskID = selfobj.model.get("task_id");
        $.ajax({
          url: APIPATH + 'taskMaster/removeWatchers',
          method: 'POST',
          data: { list: id[0], action: action, status: status, taskID: taskID },
          datatype: 'JSON',
          beforeSend: function (request) {
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
              scanDetails.filterSearch();

            }
            setTimeout(function () {
              $(e.currentTarget).html(status);
            }, 3000);

          }
        });

      });

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
        start_date: {
          required: true,
        },
        due_date: {
          required: true
        },
        task_priority: {
          required: true
        },
        task_type: {
          required: true
        },
        task_status: {
          required: true
        },
        task_repeat: {
          required: true
        },
        customer_id: {
          required: true
        },
        assignee: {
          required: true
        }
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
        start_date: " Please enter Start Date ",
        due_date: " Please enter End Date",
        task_priority: " Please Select Task Priority ",
        task_type: " Please Select Task Type ",
        task_status: " Please Select Task Status ",
        customer_id: "Please Select Customer Status",
        assignee: "Please Select Assignee "
      };
      $("#taskDetails").validate({
        rules: feildsrules,
        messages: messages,
      });

      startDate = $('#start_date').datepickerBT({
        format: "dd-mm-yyyy",
        todayBtn: "linked",
        clearBtn: true,
        todayHighlight: true,
        StartDate: new Date(),
        numberOfMonths: 1,
        autoclose: true,
      }).on('changeDate', function (ev) {
        $('#start_date').change();
        var valuetxt = $("#start_date").val();
        var temp = moment(valuetxt, 'DD-MM-YYYY').valueOf();
        filterOption.set({ trainingStartDate: valuetxt });
        var valuetxt = $("#due_date").val();
        var temp2 = moment(valuetxt, 'DD-MM-YYYY').valueOf();
        if (temp > temp2) {
          $("#due_date").val("");
        }
        selfobj.model.set({ "start_date": $('#start_date').val() });
      });
      endDate = $('#due_date').datepickerBT({
        format: "dd-mm-yyyy",
        todayBtn: "linked",
        clearBtn: true,
        todayHighlight: true,
        numberOfMonths: 1,
        autoclose: true,
      }).on('changeDate', function (ev) {
        $('#due_date').change();
        var valuetxt = $("#due_date").val();
        var temp = moment(valuetxt, 'DD-MM-YYYY').valueOf();
        filterOption.set({ trainingStartDate: valuetxt });
        var valuetxt = $("#start_date").val();
        var temp2 = moment(valuetxt, 'DD-MM-YYYY').valueOf();
        if (temp2 > temp) {
          $("#start_date").val("");
        }
        selfobj.model.set({ "due_date": $('#due_date').val() });
      });

    },
    render: function () {
      var selfobj = this;
      var source = tasktemp;
      var template = _.template(source);
      $("#" + this.toClose).remove();
      console.log(this.model);
      this.$el.html(template({ "model": this.model.attributes, "userRoll": this.userRoll, "categoryList": this.categoryList.models, "customerList": this.customerList.models, "adminList": this.adminList.models, "commentList": this.commentList.models, "loggedInID": this.loggedInID }))
      this.$el.addClass("tab-pane in active panel_overflow");
      this.$el.attr("id", this.toClose);
      this.$el.addClass(this.toClose);
      this.$el.data("role", "tabpanel");
      this.$el.data("current", "yes");
      $(".ws-tab").append(this.$el);
      $("#" + this.toClose).show();
      // this is used to append the dynamic form in the single view html
      $("#dynamicFormFields").empty().append(this.dynamicFieldRenderobj.getform());
      // Do call this function from dynamic module it self.
      $(".ws-select").selectpicker();
      this.initializeValidate();
      this.attachEvents();
      this.setOldValues();
      this.addWatchers();
      rearrageOverlays("Task", this.toClose);
      var __toolbarOptions = [
        ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
        [{ 'header': 1 }, { 'header': 2 }],               // custom button values
        [{ 'direction': 'rtl' }],                         // text direction
        [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
        [{ 'align': [] }],
        ['link'],
        ['clean']                                         // remove formatting button
      ];
      var editor = new Quill($("#description").get(0), {
        modules: {
          toolbar: __toolbarOptions
        },
        theme: 'snow'
      });
      //const delta = editor.clipboard.convert();
      //editor.setContents(delta, 'silent');
      editor.on('text-change', function (delta, oldDelta, source) {
        if (source == 'api') {
          console.log("An API call triggered this change.");
        } else if (source == 'user') {
          var delta = editor.getContents();
          var text = editor.getText();
          var justHtml = editor.root.innerHTML;
          selfobj.model.set({ "description": justHtml });
        }
      });
      let docUrl = "";
      const attachment_file = this.model.get("attachment_file");
      const file_id = this.model.get("attachment_id");
      if (Array.isArray(attachment_file) && Array.isArray(file_id) && attachment_file.length === file_id.length) {
        for (let i = 0; i < attachment_file.length; i++) {
          const fName = attachment_file[i];
          const ftext = fName.split(".");
          let modifiedFName = fName;
          if (ftext[2] === "xls" || ftext[2] === "xlsx") {
            modifiedFName = "excel.png";
          } else if (ftext[2] === "pdf") {
            modifiedFName = "pdf.png";
          } else {
            // Handle other cases if needed
          }
          const file_ids = file_id[i];
          docUrl += "<div class='col-xl-2 col-lg-3 col-md-4 col-sm-12 m-b-20' data-show='singleFile'><div class='thumbnail'><div class='centered removeAttach'><img id='removeIMG' class='img-fluid fileImage img-thumbnail' src='" + UPLOADS + "/" + modifiedFName + "' alt=''><span class='closeTab deleteAttachment' data-file_id='" + file_ids + "'><span class='material-icons'>delete</span></span></div></div></div>";
        }
        document.getElementById("attachedDoc").innerHTML += docUrl;
      }
      return this;
    },

  });
  return taskSingleView;
});


