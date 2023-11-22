define([
  "jquery",
  "underscore",
  "backbone",
  "validate",
  "inputmask",
  "datepickerBT",
  'typeahead',
  'moment',
  'Swal',
  "../views/repeatTaskCustomView",
  '../views/commentSingleView',
  '../views/historySingleView',
  '../../customer/views/customerSingleView',
  '../../admin/views/addAdminView',
  "../../core/views/multiselectOptions",
  '../../category/views/categorySingleView',
  "../../dynamicForm/views/dynamicFieldRender",
  "../../customer/collections/customerCollection",
  "../../project/collections/projectCollection",
  "../../category/collections/slugCollection",
  "../../admin/collections/adminCollection",
  "../collections/taskCollection",
  "../collections/commentCollection",
  "../../readFiles/views/readFilesView",
  "../models/singleTaskModel",
  "../models/commentModel",
  "text!../templates/taskSingle_temp.html",
], function ($, _, Backbone, validate, inputmask, datepickerBT, typeahead, moment, Swal, repeatTaskCustomView, commentSingleView, historySingleView, customerSingleView, addAdminView, multiselectOptions, categorySingleView, dynamicFieldRender, customerCollection, projectCollection, slugCollection, adminCollection, taskCollection, commentCollection, readFilesView, singleTaskModel, commentModel, tasktemp) {
  var taskSingleView = Backbone.View.extend({
    model: singleTaskModel,
    enteredWatchersArray: [],
    attachedDocURLArray: [],
    // tagApi:null,
    tempRes: [],
    initialize: function (options) {
      this.dynamicData = null;
      this.toClose = "taskSingleView";
      if (permission == undefined) {
        permission = ROLE['task'];
      }
      this.loadFrom = options.loadfrom;
      this.customer_id = options.customerID;
      let customer_id = this.customer_id
      this.tagID = null;
      var selfobj = this;
      $(".popuploader").show();
      this.pluginName = "taskList";
      this.loggedInID = $.cookie("authid");
      this.userRoll = $.cookie('roleOfUser');
      this.model = new singleTaskModel();

      this.model1 = new commentModel();
      // use this valiable for dynamic fields to featch the data from server
      this.dynamicFieldRenderobj = new dynamicFieldRender({ ViewObj: selfobj, formJson: {}, });
      this.multiselectOptions = new multiselectOptions();
      scanDetails = options.searchtask;
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
      $(".popuploader").show();
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

      $(".popuploader").show();
      this.projectList = new projectCollection();
      this.projectList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, data: { getAll: 'Y', status: "active", company: customer_id }
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        selfobj.render();
      });
      console.log(this.projectList);
      $(".popuploader").show();
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
      $(".popuploader").show();
      this.adminList = new adminCollection();
      this.adminList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { status: "active" }
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popuploader").hide();
        selfobj.render();
      });
      this.getCommentList()
      console.log(this.model);
    },
    getCommentList: function () {
      let selfobj = this;
      this.commentList = new commentCollection();
      var task_id = this.model.get("task_id");
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
      "click .deleteAttachment": "deleteAttachment",
      "click .scroll": "scroll",
      "click .editBtn": "editComment",
      "click .deleteBtn": "deleteComment",
      "change .changeClient": "selectClient",
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
      this.$el.off('click', '.deleteAttachment', this.deleteAttachment);
      this.$el.on('click', '.deleteAttachment', this.deleteAttachment.bind(this));
      this.$el.off('click', '.scroll', this.scroll);
      this.$el.on('click', '.scroll', this.scroll.bind(this));
      this.$el.off('click', '.editBtn', this.editComment);
      this.$el.on('click', '.editBtn', this.editComment.bind(this));
      this.$el.off('click', '.deleteBtn', this.deleteComment);
      this.$el.on('click', '.deleteBtn', this.deleteComment.bind(this));
      this.$el.off('change', '.changeClient', this.selectClient);
      this.$el.on('change', '.changeClient', this.selectClient.bind(this));
    },
    selectClient: function (e) {
      let selfobj = this;
      e.stopPropagation();
      var client_id = $(e.currentTarget).val();
      if (client_id != null) {
        this.projectList.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler, data: { getAll: 'Y', status: "active", company: client_id }
        }).done(function (res) {
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          $(".popupLoader").hide();
          selfobj.render();
        });
        console.log(this.projectList);
      }
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
    deleteComment: function (e) {
      let selfobj = this;
      let status = "delete"
      let id = $(e.currentTarget).attr("data-commentID");
      $.ajax({
        url: APIPATH + 'commentDelete',
        method: 'POST',
        data: { list: id, status: status },
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
            selfobj.getCommentList();
          }
        }
      });
    },
    editComment: function (e) {
      let selfobj = this;
      var $parentContainer = $(e.target).closest('.inbox-widget');
      var commentID = $(e.currentTarget).attr("data-commentID");
      $parentContainer.find('.inbox-message').hide();
      $(e.currentTarget).hide();
      $('.deleteBtn').hide();
      $("#editCmt_" + commentID).show();
      // $(".edit_comment_" + commentID).show();
      $(".editCmtBtn_" + commentID).show();
      var __toolbarOptions = [
        ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
        [{ 'header': 1 }, { 'header': 2 }],               // custom button values
        [{ 'direction': 'rtl' }],                         // text direction
        [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
        [{ 'align': [] }],
        ['link'],
        ['clean']                                         // remove formatting button
      ];
      var myid = "editCmt_" + commentID;
      if (!$("#" + myid).hasClass("ql-container")) {
        var editor = new Quill($("#" + myid).get(0), {
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
    saveComment: function (e) {
      e.preventDefault();
      let selfobj = this;
      let isNew = $(e.currentTarget).attr("data-action");
      let commentID = $(e.currentTarget).attr("data-commentID");
      selfobj.model1.set({ "comment_id": commentID });
      if (isNew == "cpost") {
        var methodt = "POST";
      } else {
        var methodt = "PUT";
      }
      this.model1.save({}, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: methodt,
      }).done(function (res) {
        if (res.flag == "S") {
          selfobj.model1.clear().set(selfobj.model1.defaults);
          selfobj.dynamicFieldRenderobj.initialize({ ViewObj: selfobj, formJson: {}, });
          selfobj.getCommentList();
        }
      });

    },
    deleteAttachment: function (e) {
      let file_id = $(e.currentTarget).attr("data-file_id");
      let task_id = this.model.get("task_id");
      let div = document.getElementById('removeIMG');
      let status = "delete";
      let selfobj = this;
      // console.log("file id" + file_id);
      // console.log("task id" + task_id);

      if (file_id != null) {
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
            selfobj.model.set({ "attachment_file": "" });
            console.log(selfobj.model);
          }
        });
      } else {
        div.remove();
        selfobj.model.set({ "attachment_file": "" });
        console.log(selfobj.model);
      }
    },
    scroll: function (e) {
      $('.taskSingleView').animate({
        scrollTop: $('.task-nav-tab').offset().top
      }, 500); //
    },
    cancelPost: function (e) {
      // Clear the content inside the Quill editor
      var quill = new Quill('#comment');
      quill.setText('');
      $(".comment-box").show();
      $(".commentEditor").hide();
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
      console.log(this.model);
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
      // console.log(furl);
      if (ftext[1] == "xls" || ftext[1] == "xlsx") {
        fName = "excel.png";
      } else if (ftext[1] == "pdf") {
        fName = "pdf.png";
      }
      docUrl = "<div class='col-xl-2 col-lg-3 col-md-4 col-sm-12 m-b-20' data-show='singleFile'><div class='thumbnail'><div class='centered removeAttach'><a href='" + url + "' target='_blank'><img id='removeIMG' class='img-fluid fileImage img-thumbnail' src='" + UPLOADS + "/" + fName + "' alt=''></a><span class='closeTab deleteAttachment'><span class='material-icons'>delete</span></span></div></div></div>";
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
      // console.log(e.currentTarget);
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
      if (this.customer_id != null) {
        this.model.set({ customer_id: this.customer_id });
      }
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
          if (selfobj.loadFrom == "dashboard") {
            handelClose(selfobj.toClose);
            scanDetails.initialize();
          } else {
            scanDetails.filterSearch();
          }
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
        // $(".popupLoader").hide();
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
        // $(".popupLoader").hide();
        selfobj.render();
      });
    },
    addWatchers: function () {
      let selfobj = this;
      // tagApi = $(".tm-input").tagsManager();
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
                // console.log(res.data);
                selfobj.tempRes = res.data;
                $.each(res.data, function (dd, value) {
                  str = value.adminID + " - " + value.name;
                  result.push(str);
                  selfobj.tagID = value.adminID;
                });
              }
              return process(result);

            }
          });
          // console.log(JSON.stringify(listName));
          return listName;
        },
        afterSelect: function (item) {
          tagApi.tagsManager("pushTag", item);
          $("#typehead").val("");
          selfobj.enteredWatchersArray.push({ name: item, id: selfobj.tagID });
          selfobj.model.set({ "tasksWatchers": selfobj.enteredWatchersArray });
          // console.log(selfobj.model);
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
          required: true,
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
      var template = _.template(tasktemp);
      $("#" + this.toClose).remove();
      // console.log(this.model);
      this.$el.html(template({ "model": this.model.attributes, "userRoll": this.userRoll, "categoryList": this.categoryList.models, "customerList": this.customerList.models, "projectList": this.projectList.models, "adminList": this.adminList.models, "commentList": this.commentList.models, "loggedInID": this.loggedInID, "customerID": this.customer_id }))
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
        ['clean'] 
        ['image']                                        // remove formatting button
      ];
      var editor = new Quill($("#task_description").get(0), {
        modules: {
          imageResize: {
            displaySize: true
          },
          toolbar:{ container:__toolbarOptions,
            handlers: {
              image: imageHandler
          }
          },
        },
        theme: 'snow'
      });
      function imageHandler() {
        var range = this.quill.getSelection();
        var value = prompt('please copy paste the image url here.');
        if(value){
            this.quill.insertEmbed(range.index, 'image', value, Quill.sources.USER);
        }
      }
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
          if (ftext[1] === "xls" || ftext[1] === "xlsx") {
            modifiedFName = "excel.png";
          } else if (ftext[1] === "pdf") {
            modifiedFName = "pdf.png";
          } else {
            // Handle other cases if needed
          }
          const file_ids = file_id[i];
          docUrl += "<div class='col-xl-2 col-lg-3 col-md-4 col-sm-12 m-b-20' data-show='singleFile'><div class='thumbnail'><div class='centered removeAttach'><a href='" + UPLOADS + "/" + attachment_file + "' target='_blank'><img id='removeIMG' class='img-fluid fileImage img-thumbnail' src='" + UPLOADS + "/" + modifiedFName + "' alt=''></a><span class='closeTab deleteAttachment' data-file_id='" + file_ids + "'><span class='material-icons'>delete</span></span></div></div></div>";
        }
        document.getElementById("attachedDoc").innerHTML += docUrl;

      }
      $('#taskCom li:first-child a').tab('show');
      return this;
    },

  });
  return taskSingleView;
});


