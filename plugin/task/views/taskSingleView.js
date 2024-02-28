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
  'RealTimeUpload',
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
  '../../menu/models/singleMenuModel',
  "text!../templates/taskSingle_temp.html",
], function ($, _, Backbone, validate, inputmask, datepickerBT, typeahead, moment, Swal, RealTimeUpload, repeatTaskCustomView, commentSingleView, historySingleView, customerSingleView, addAdminView, multiselectOptions, categorySingleView, dynamicFieldRender, customerCollection, slugCollection, adminCollection, taskCollection, commentCollection, readFilesView, singleTaskModel, commentModel, singleMenuModel, tasktemp) {
  var taskSingleView = Backbone.View.extend({
    model: singleTaskModel,
    enteredWatchersArray: [],
    attachedDocURLArray: [],
    // tagApi:null,
    tempRes: [],
    label: '',
    taskID: '',
    atValues: [],
    scanDetails: null,
    form_label: '',
    initialize: function (options) {
      var selfobj = this;
      selfobj.menuId = options.menuId;
      this.toClose = "taskSingleView";
      this.tagID = null;
      var selfobj = this;
      this.menuName = options.menuName;
      if(this.menuName == undefined){
        this.menuName = "task"
      };
      this.form_label = options.form_label;
      this.scanDetails = options.searchtask;
      this.menuList = new singleMenuModel();
      this.enteredWatchersArray = [];
      $(".popuploader").show();
      this.pluginId = options.pluginId;
      this.customerID = options.customer_id;
      this.customerName = options.customerName;
      this.loadFrom = options.loadFrom;
      this.loggedInID = $.cookie("authid");
      this.userRoll = $.cookie('roleOfUser');
      this.model = new singleTaskModel();
      this.model1 = new commentModel();
      this.multiselectOptions = new multiselectOptions();
      this.commentSingleView = new commentSingleView({ task_id: options.task_id, searchComment: this });
      selfobj.model.set({ menuId: options.menuId });
      selfobj.dynamicFieldRenderobj = new dynamicFieldRender({ ViewObj: selfobj, formJson: {} });
      this.taskID = options.task_id;
      if (options.task_id != "") {
        this.model.set({ task_id: options.task_id });
        this.model.fetch({
          headers: { 'contentType': "application/x-www-form-urlencoded", 'SadminID': $.cookie("authid"), token: $.cookie("_bb_key"), Accept: "application/json", },
          data:{menuId:selfobj.model.get("menuId")},error: selfobj.onErrorHandler,
        }).done(function (res) {
          var startDate = selfobj.model.get("start_date");
          var due_date = selfobj.model.get("due_date");
          if (startDate != null && startDate != "0000-00-00" || due_date != null && due_date != "0000-00-00") {
            selfobj.model.set({ "due_date": moment(due_date).format("DD-MM-YYYY") });
            selfobj.model.set({ "start_date": moment(startDate).format("DD-MM-YYYY") });
          }
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          $(".popupLoader").hide();
          // selfobj.dynamicFieldRenderobj.prepareForm();
          selfobj.dynamicFieldRenderobj = new dynamicFieldRender({ ViewObj: selfobj, formJson: {} });
          selfobj.render();
        });
      }

      if (options.task_id != "") {
        let temp = [];
        temp.push(ADMINNAME);
        let tempID = [];
        tempID.push(ADMINID);

        this.model.set({tasksWatchers : temp});
        this.model.set({tasks_watchersAdminID : tempID});
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

      atValues = [];

      $(".popuploader").show();

      this.categoryList = new slugCollection();
      this.categoryList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y', slug: 'task_priority,task_type,task_status,ticket_priority,ticket_type,ticket_status' }
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        $('body').find(".loder").hide();
        selfobj.render();
      });

      // selfobj.getCommentList();
      $(".popuploader").show();
      this.adminList = new adminCollection();
      this.adminList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { status: "active", getAll: 'Y' }
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popuploader").hide();
        selfobj.render();
      });
      if (this.loadFrom == 'customer') {
        selfobj.setCustomer();
        selfobj.render();
      }
      

    },

    getCommentList: function () {
      this.commentSingleView = new commentSingleView({ task_id: this.taskID, searchComment: this });
      this.render();
    },

    events: {
      "click .saveTaskDetails": "saveTaskDetails",
      "blur .txtchange": "updateOtherDetails",
      "change .dropval": "updateOtherDetails",
      "click .comment-box": "showCommentBox",
      "click .loadCustom": "loadSubView",
      "click .loadMedia": "loadMedia",
      "click .savetaskComment": "saveComment",
      "click .loadview": "loadSubView",
      "click .cancelPost": "cancelPost",
      "click .deleteAttachment": "deleteAttachment",
      "click .scroll": "scroll",
      "change .watcherdetails": "getWatcherList",
      "click .selectWatchers": "setWatchers",
      "click .removeWatcher": "removeWatcher",
      "input .custChange": "getcustomers",
      "click .selectCustomer": "setCustomer",
      "change .assignChange": "getassignee",
      "input .selectAssignee": "setAssignee",
      "blur .multiselectOpt": "updatemultiSelDetails",
      "click .singleSelectOpt": "selectOnlyThis",
      "click .hideUpload": "hideUpload",
      "click .watchers": "showWatcher",
    },

    attachEvents: function () {
      // Detach previous event bindings
      this.$el.off("click", ".saveTaskDetails", this.saveTaskDetails);
      // Reattach event bindings
      this.$el.on("click", ".saveTaskDetails", this.saveTaskDetails.bind(this));
      this.$el.off('click', '.savetaskComment', this.saveComment);
      this.$el.on('click', '.savetaskComment', this.saveComment.bind(this));
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
      this.$el.off('click', '.loadview', this.loadSubView);
      this.$el.on('click', '.loadview', this.loadSubView.bind(this));
      this.$el.off('click', '.comment-box', this.showCommentBox);
      this.$el.on('click', '.comment-box', this.showCommentBox.bind(this));
      this.$el.off('click', '.cancelPost', this.cancelPost);
      this.$el.on('click', '.cancelPost', this.cancelPost.bind(this));
      this.$el.off('click', '.hideUpload', this.hideUpload);
      this.$el.on('click', '.hideUpload', this.hideUpload.bind(this));
      this.$el.off('click', '.deleteAttachment', this.deleteAttachment);
      this.$el.on('click', '.deleteAttachment', this.deleteAttachment.bind(this));
      this.$el.off('click', '.scroll', this.scroll);
      this.$el.on('click', '.scroll', this.scroll.bind(this));
      this.$el.off('input', '.watcherdetails', this.getWatcherList);
      this.$el.on('input', '.watcherdetails', this.getWatcherList.bind(this));
      this.$el.off('click', '.addNewRecord', this.addNew);
      this.$el.on('click', '.addNewRecord', this.addNew.bind(this));
      this.$el.off('click', '.selectWatchers', this.setWatchers);
      this.$el.on('click', '.selectWatchers', this.setWatchers.bind(this));
      this.$el.off('click', '.removeWatcher', this.removeWatcher);
      this.$el.on('click', '.removeWatcher', this.removeWatcher.bind(this));
      this.$el.off('input', '.custChange', this.getcustomers);
      this.$el.on('input', '.custChange', this.getcustomers.bind(this));
      this.$el.off('click', '.selectCustomer', this.setCustomer);
      this.$el.on('click', '.selectCustomer', this.setCustomer.bind(this));
      this.$el.off('input', '.assignChange', this.getassignee);
      this.$el.on('input', '.assignChange', this.getassignee.bind(this));
      this.$el.off('click', '.selectAssignee', this.setAssignee);
      this.$el.on('click', '.selectAssignee', this.setAssignee.bind(this));
      this.$el.off('click', '.multiselectOpt', this.updatemultiSelDetails);
      this.$el.on('click', '.multiselectOpt', this.updatemultiSelDetails.bind(this));
      this.$el.off('click', '.singleSelectOpt', this.selectOnlyThis);
      this.$el.on('click', '.singleSelectOpt', this.selectOnlyThis.bind(this));
      this.$el.off('click', '.watchers', this.showWatcher);
      this.$el.on('click', '.watchers', this.showWatcher.bind(this));
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
      // const atValues = [
      //   { id: 1, value: "Fredrik Sundqvist" },
      //   { id: 2, value: "Patrik Sjölin" }
      // ];

      if (!$(".comment-editor").hasClass("ql-container")) {

        var editor = new Quill($("#comment").get(0), {
          modules: {
            toolbar: __toolbarOptions,
            mention: {
              allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
              mentionDenotationChars: ["@", "#"],
              source: function (searchTerm, renderList, mentionChar) {
                let values;
                if (mentionChar === "@") {

                  values = selfobj.atValues;

                } else {
                  values = selfobj.atValues;
                }

                if (searchTerm.length === 0) {
                  renderList(values, searchTerm);
                } else {
                  const matches = [];
                  for (let i = 0; i < values.length; i++)
                    if (
                      ~values[i].value.toLowerCase().indexOf(searchTerm.toLowerCase())
                    )
                      matches.push(values[i]);
                  renderList(matches, searchTerm);
                }
              }
            }
          },

          theme: 'snow'  // or 'bubble'
        });

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


      let element = document.querySelector(".buttonHide");
      element.classList.add('showButton');
    },

    saveComment: function (e) {
      e.preventDefault();
      let selfobj = this;
      let isNew = $(e.currentTarget).attr("data-action");
      var dataSele = [];
      let taskID = selfobj.model.get("task_id");

      var spanElements = $('#comment .ql-editor p span');
      spanElements.each(function () {
        if ($(this).attr('data-id') != undefined) {
          dataSele.push($(this).attr('data-id'));
        }
      });
      selfobj.model1.set({ "mentions": dataSele });

      selfobj.model1.set({ "task_id": taskID });
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
          selfobj.getCommentList();
        }
      });
    },

    showWatcher: function(e){
      e.stopPropagation();
      $(".showWatch").toggle();
      console.log( $(".showWatch"));
    },

    deleteAttachment: function (e) {
      let file_id = $(e.currentTarget).attr("data-file_id");
      let task_id = this.model.get("task_id");
      let div = document.getElementById('removeIMG');
      let status = "delete";
      let selfobj = this;
      Swal.fire({
        title: "Delete Task ",
        text: "Do you want to delete Attachment ?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Delete',
        animation: "slide-from-top",
      }).then((result) => {
        if (result.isConfirmed) {
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
                  $('#' + file_id + 'removeDiv').remove();
                  selfobj.model.set({ "attachment_file": "" });
                }
    
              }
            });
          } else {
            div.remove();
            selfobj.model.set({ "attachment_file": "" });
          }
        }else{

        }
      });

      
    },
    scroll: function (e) {
      let selfobj = this;
      $('.taskSingleView').animate({
        scrollTop: $('.task-nav-tab').offset().top
      }, 500);
      var scrollto = $(e.currentTarget).attr('data-scroll');
      if(scrollto == "comment"){
        $('#navScrollComment').addClass('active');
        $('#navScrollHistory').removeClass('active');
        this.commentSingleView = new commentSingleView({ task_id: selfobj.taskID, searchComment: this });
        $('.showHistory').hide();
        $('.showComment').show();
      }else if(scrollto == "history"){
        $('#navScrollHistory').addClass('active');
        $('#navScrollComment').removeClass('active');
        new historySingleView({ task_id: selfobj.taskID });
        $('.showHistory').show();
        $('.showComment').hide();
      }
    },

    cancelPost: function (e) {
      var quill = new Quill('#comment');
      quill.setText('');
      $(".comment-box").show();
      $(".commentEditor").hide();

      let element = document.querySelector(".buttonHide");
      element.classList.remove('showButton');

    },

    hideUpload: function (e) {
      $(".upload").hide();
      $('.dotborder').show();
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
      if (this.model.get(toID) && Array.isArray(this.model.get(toID))) {
        this.model.set(toID, this.model.get(toID).join(","));
      }
    
    },

    addNew : function(e)
    {
       var view = $(e.currentTarget).attr('data-view');
       switch (view) {
        case 'customer':
            new customerSingleView({ searchCustomer: this, loadfrom: "TaskSingleView",form_label:'Add Customer' });
          break;
        case 'asignee':
            new addAdminView({ searchadmin: this, loadfrom: "TaskSingleView",form_label:'Add Assignee' });
          break;
        case 'watcher':
            new addAdminView({ searchadmin: this, loadfrom: "TaskSingleView",form_label:'Add Watchers' });
          break;
       
        default:
          break;
       }
    },

    updatemultiSelDetails: function (e) {
      var valuetxt = $(e.currentTarget).val();
      var toName = $(e.currentTarget).attr("name");
      var existingValues = this.model.get(toName);
      if (typeof existingValues !== 'string') {
        existingValues = '';
      }

      if ($(e.currentTarget).prop('checked')) {
        if (existingValues.indexOf(valuetxt) === -1) {
          existingValues += (existingValues.length > 0 ? ',' : '') + valuetxt;
        }
      } else {
        existingValues = existingValues
          .split(',')
          .filter(value => value !== valuetxt)
          .join(',');
      }
      this.model.set({ [toName]: existingValues });
    },

    selectOnlyThis: function (e) {
      var clickedCheckbox = e.currentTarget;
      var valueTxt = $(clickedCheckbox).val();
      var toName = $(clickedCheckbox).attr("name");
      this.$('input[name="' + toName + '"]').not(clickedCheckbox).prop('checked', false);
      var existingData = this.model.get(toName);
      this.model.set(toName, ($(clickedCheckbox).prop('checked')) ? valueTxt : null);
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

    loadMedia: function (e) {
      $('.upload').show();
      $('.dotborder').hide();
    },
    
    loadSubView: function (e) {
      var selfobj = this;
      var show = $(e.currentTarget).attr("data-view");
      switch (show) {
        case "taskData": {
          let task_id = $(e.currentTarget).attr("data-task_id");
          new taskSingleView({ task_id: task_id, scanDetails: this.scanDetails });
          break;
        }
        case "singleCommentData": {
          var task_id = $(e.currentTarget).attr("data-task_id");
          $('.showHistory').hide();
          $(".showComment").show();
          this.commentSingleView = new commentSingleView({ task_id: task_id, searchComment: this });
          break;
        }
        case "singleHistoryData": {
          var task_id = $(e.currentTarget).attr("data-task_id");
          $(".showComment").hide();
          $('.showHistory').show();
          new historySingleView({ task_id: task_id });
          break;
        }
        case "repeatTask": {
          let task_id = $(e.currentTarget).attr("data-task_id");
          new repeatTaskCustomView({ task_id: task_id, scanDetails: this, model:selfobj.model });
          break;
        }
      }
    },

    saveTaskDetails: function (e) {
      e.preventDefault();
      let selfobj = this;
      var task_id = this.model.get("task_id");
      var inputStr = $('#subject').val();
      let capitalizedString = inputStr.charAt(0).toUpperCase() + inputStr.slice(1);
      this.model.set({"subject": capitalizedString});
      if (this.menuName == "ticket") {
        this.model.set({ "record_type": "ticket" });
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
      console.log(this.model);
      if ($("#taskDetails").valid()) {
        $(e.currentTarget).html("<span>Saving..</span>");
        $(e.currentTarget).attr("disabled", "disabled");
        this.model.save({}, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler, type: methodt
        }).done(function (res) {
          if (res.lastID != undefined) {
            selfobj.taskID = res.lastID;
          }
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          if (isNew == "new") {
            showResponse(e, res, "Save & New");
          } else {
            showResponse(e, res, "Save");
          }
          selfobj.scanDetails.filterSearch();
          if (res.flag == "S") {
            if (isNew == "new") {
              selfobj.model.clear().set(selfobj.model.defaults);
              selfobj.model.set({ menuId: selfobj.menuId });
              selfobj.dynamicFieldRenderobj.initialize({ ViewObj: selfobj, formJson: {} });
              handelClose("categorySingleView");
              selfobj.render();
            } else {
              let url = APIPATH + 'taskUpload/' + selfobj.taskID;
              selfobj.uploadFileEl.elements.parameters.action = url;
              selfobj.uploadFileEl.prepareUploads(selfobj.uploadFileEl.elements);
              handelClose(selfobj.toClose);
              handelClose("categorySingleView");
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
        selfobj.render();
      });
    },

    getWatcherList: function (e) {
      let selfobj = this;
      var name = $(e.currentTarget).val();
      var dropdownContainer = $("#watcherDropdown");
      if (name != "") {
        $.ajax({
          url: APIPATH + 'getSystemUserNameList/',
          method: 'POST',
          data: { text: name },
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
            dropdownContainer.empty();
            if (res.msg === "sucess" ){
              if(res.data.length > 0) {
              $.each(res.data, function (index, value) {
                if(value.photo==""){
                  var initial = selfobj.getInitials(value.name);
                  dropdownContainer.append('<div class="dropdown-item selectWatchers" style="background-color: #ffffff;" data-initial=' + initial + ' data-adminID=' + value.adminID + '>' + '<span class="watcherInitial">' + initial + '</span>' + value.name + '</div>');
                }else{
                  dropdownContainer.append('<div class="dropdown-item selectWatchers" style="background-color: #ffffff;" data-adminID=' + value.adminID + ' data-photo=' + value.photo + '> <img src=' + PROFILEPHOTOUPLOAD + value.adminID + '/profilePic/'+ value.photo +' alt="User" /> ' + value.name + '</div>');
                }
              });
              dropdownContainer.show();
            } 
          }else {
              dropdownContainer.append('<div class="dropdown-item addNewRecord" data-view = "watcher" style="background-color: #5D60A6; color:#ffffff;" > Add New Watcher </div>');
              dropdownContainer.show();
            }
        }
        });
      } else {
        $("#watcherDropdown").hide();
      }
    },

    setWatchers: function (e) {
      let selfobj = this;
      var Name = $(e.currentTarget).text();
      var adminID = $(e.currentTarget).attr('data-adminid');
      var photo = $(e.currentTarget).attr('data-photo');
      var createdBy = this.model.get("created_by");
      var initial = $(e.currentTarget).attr('data-initial');

       if (!selfobj.isWatcherAlreadyAdded(Name, adminID)) {
        if(photo != "" && photo != undefined){
          var htmlToAppend = '<span class="tm-tag"><span><img src=' + PROFILEPHOTOUPLOAD + adminID + '/profilePic/'+ photo +' alt="User" /> ' + Name + '</span><a class="removeWatcher" data-adminID=' + adminID + '><i class="material-icons">close</i></a></span>';
          
        }else{
          var htmlToAppend = '<span class="tm-tag"><span><span class="watcherInitial">' + initial + '</span>' + Name + '</span><a class="removeWatcher" data-adminID=' + adminID + '><i class="material-icons">close</i></a></span>';
        }
        $(".tm-input").append(htmlToAppend);
        $("#watchers").val('');
        $("#watcherDropdown").hide();
        selfobj.enteredWatchersArray.push({ name: Name, id: adminID });
        
        selfobj.model.set({ "tasksWatchersArray": selfobj.enteredWatchersArray });
        console.log(selfobj.enteredWatchersArray);

        let watcherEye = document.getElementById('watcherEye');
        let taskBadgeSpan = watcherEye.querySelector('span.taskBadge');
        if (taskBadgeSpan) {
          taskBadgeSpan.remove();
        }

        let length = selfobj.enteredWatchersArray.length;
        if(length != 0){
          $('.noWatchers').hide();
          $('.showWatchers').show();
          let url = "<span class='badge bg-pink taskBadge watchBadge'>" + length + "</span>"
          document.getElementById('watcherEye').innerHTML += url;
        }

      } else {
        console.log("Watcher is already added");
        
      }

      // if (!selfobj.isWatcherAlreadyAdded(Name, adminID)) {
      //   if(createdBy == null){
      //     if(ADMINID != adminID){
           
      //       $(".tm-input").append(htmlToAppend);
      //       $("#watchers").val('');
      //       $("#watcherDropdown").hide();
      //       selfobj.enteredWatchersArray.push({ name: Name, id: adminID });
    
      //       selfobj.model.set({ "tasksWatchersArray": selfobj.enteredWatchersArray });
      //       console.log(selfobj.enteredWatchersArray);
      //     }else{
      //       console.log("Watcher is already added");
      //     }
      //   }else{
      //     if(createdBy != adminID){
      //       if(photo != "" && photo != undefined){
      //         var htmlToAppend = '<span class="tm-tag"><span><img src=' + PROFILEPHOTOUPLOAD + adminID + '/profilePic/'+ photo +' alt="User" /> ' + Name + '</span><a class="removeWatcher" data-adminID=' + adminID + '>x</a></span>';
              
      //       }else{
      //         var htmlToAppend = '<span class="tm-tag"><span><img src=' + IMAGES + '/avatar-default.png alt="User" /> ' + Name + '</span><a class="removeWatcher" data-adminID=' + adminID + '>x</a></span>';
      //       }
      //       $(".tm-input").append(htmlToAppend);
      //       $("#watchers").val('');
      //       $("#watcherDropdown").hide();
      //       selfobj.enteredWatchersArray.push({ name: Name, id: adminID });
    
      //       selfobj.model.set({ "tasksWatchersArray": selfobj.enteredWatchersArray });
      //       console.log(selfobj.enteredWatchersArray);
      //     }else{
      //       console.log("Watcher is already added");
      //     }
      //   }
        
      // } else {
      //   // Watcher is already added, do nothing or show a message
      //   console.log("Watcher is already added");
      // }
    },

    // Function to check if the watcher is already added
    isWatcherAlreadyAdded: function (name, id) {
      let selfobj = this;
      console.log(selfobj.enteredWatchersArray);
      
      return selfobj.enteredWatchersArray.some(watcher => watcher.name === name && watcher.id === id);
    },

    removeWatcher: function (e) {
      let selfobj = this;
      var taskID = this.model.get("task_id");
      var watcherAdminID = $(e.currentTarget).attr('data-watcherAdminID');
      var adminID = $(e.currentTarget).attr('data-adminid');
      var action = "changeStatus";
      if (watcherAdminID != undefined) {
        $.ajax({
          url: APIPATH + 'taskMaster/removeWatchers',
          method: 'POST',
          data: { list: watcherAdminID, action: action, taskID: taskID },
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
              $(e.currentTarget).closest('.tm-tag').remove();
              selfobj.enteredWatchersArray = selfobj.enteredWatchersArray.filter(watcher => watcher.id !== watcherAdminID);
              selfobj.model.set({ "tasksWatchersArray": selfobj.enteredWatchersArray });
              let length = selfobj.enteredWatchersArray.length;
              let watcherEye = document.getElementById('watcherEye');
              let taskBadgeSpan = watcherEye.querySelector('span.taskBadge');
              if (taskBadgeSpan) {
                taskBadgeSpan.remove();
              }

              
              if(length == 0){
                $('.noWatchers').show();
                $('.showWatchers').hide();
              }else{
                $('.noWatchers').hide();
                $('.showWatchers').show();
                let url = "<span class='badge bg-pink taskBadge watchBadge'>" + length + "</span>"
               document.getElementById('watcherEye').innerHTML += url;
              }

            }
          }
        });
      } else {
        $(e.currentTarget).closest('.tm-tag').remove();
        selfobj.enteredWatchersArray = selfobj.enteredWatchersArray.filter(watcher => watcher.id !== adminID);
        console.log(selfobj.enteredWatchersArray);
        let length = selfobj.enteredWatchersArray.length;
        let watcherEye = document.getElementById('watcherEye');
        let taskBadgeSpan = watcherEye.querySelector('span.taskBadge');
        if (taskBadgeSpan) {
          taskBadgeSpan.remove();
        }

        
        if(length == 0){
          $('.noWatchers').show();
          $('.showWatchers').hide();
        }else{
          $('.noWatchers').hide();
          $('.showWatchers').show();
          let url = "<span class='badge bg-pink taskBadge watchBadge' >" + length + "</span>"
          document.getElementById('watcherEye').innerHTML += url;
        }
      }
    },

    getInitials:function (name) {
      const words = name.split(' ');
      const initials = words.map(word => word.charAt(0));
      console.log("nameDetails", initials)
      return initials.join('').toUpperCase();
    },

    getcustomers: function (e) {
      var name = $(e.currentTarget).val();
      var dropdownContainer = $("#customerDropdown");
      var table = "customer";
      var where = "name";
      var list = "customer_id, name, type, record_type";
      if (name != "") {
        $.ajax({
          url: APIPATH + 'getCustomerList/',
          method: 'POST',
          data: { text: name, tableName: table, wherec: where, list: list },
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
            dropdownContainer.empty();
            if (res.msg === "sucess") { 
              
              if(res.data.length > 0) {
              $.each(res.data, function (index, value) {
                
                var firstLetterOfType = value.type.charAt(0);
                dropdownContainer.append('<div class="dropdown-item selectCustomer" style="background-color: #ffffff;" data-customerID=' + value.customer_id + '>' + value.name + '(' + firstLetterOfType + ') </div>');
              });
              dropdownContainer.show();
            }
          }else {
              dropdownContainer.append('<div class="dropdown-item addNewRecord" data-view = "customer" style="background-color: #5D60A6; color:#ffffff;" > Add New Customer </div>');
              dropdownContainer.show();
            }
          }
        });
      } else {
        dropdownContainer.hide();
      }
      if (!$(e.currentTarget).is(':focus')) {
        dropdownContainer.hide();
      }
    },

    setCustomer: function (e) {
      e.preventDefault();
      let selfobj = this;
      if (selfobj.loadFrom == 'customer') {
        var Name = selfobj.customerName;
        var customerID = selfobj.customerID;
        selfobj.model.set({ "customerName": Name });
        selfobj.model.set({ "customer_id": customerID });
      } else {
        var Name = $(e.currentTarget).text();
        var customerID = $(e.currentTarget).attr('data-customerID');
        selfobj.model.set({ "customer_id": customerID });
        $("#customerDropdown").hide();
      }
      $('#customer_id').val(Name);
    },

    getassignee: function (e) {
      var name = $(e.currentTarget).val();
      var dropdownContainer = $("#assigneeDropdown");
      var table = "admin";
      var where = "name";
      var list = "adminID, name";
      $.ajax({
        url: APIPATH + 'getAssigneeList/',
        method: 'POST',
        data: { text: name, tableName: table, wherec: where, list: list },
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
          dropdownContainer.empty();
          if (res.msg === "sucess" && res.data.length > 0) {
            $.each(res.data, function (index, value) {
              dropdownContainer.append('<div class="dropdown-item selectAssignee" style="background-color: #ffffff;" data-assigneeID=' + value.adminID + '>' + value.name + '</div>');
            });
            dropdownContainer.show();
          }else{
              dropdownContainer.append('<div class="dropdown-item addNewRecord" data-view = "asignee" style="background-color: #5D60A6; color:#ffffff;" > Add New Assignee </div>');
              dropdownContainer.show();
          }
        }
      });
    },

    setAssignee: function (e) {
      let selfobj = this;
      var Name = $(e.currentTarget).text();
      var assigneeID = $(e.currentTarget).attr('data-assigneeID');
      $('.assignChange').val(Name);
      $("#assigneeDropdown").hide();
      selfobj.model.set({ "assignee": assigneeID });
      console.log("selfobj.model",selfobj.model);
    },

    initializeValidate: function () {
      var selfobj = this;
      var feilds = {
        subject: {
          required: true,
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
      $("#subject").inputmask("Regex", { regex: '^[^"]*$' });
      
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
        var valuetxt2 = $("#due_date").val();
        var temp2 = moment(valuetxt2, 'DD-MM-YYYY').valueOf();
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
        var valuetxt2 = $("#start_date").val();
        var temp2 = moment(valuetxt2, 'DD-MM-YYYY').valueOf();
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
      this.$el.html(template({ "model": this.model.attributes, "userRoll": this.userRoll, "categoryList": this.categoryList.models, "customerList": this.customerList.models, "loggedInID": this.loggedInID, menuName: this.menuName }))
      this.$el.addClass("tab-pane in active panel_overflow");
      this.$el.attr("id", this.toClose);
      this.$el.addClass(this.toClose);
      this.$el.data("role", "tabpanel");
      this.$el.data("current", "yes");
      // $(".showWatch").hide();
     
    
      $(".ws-tab").append(this.$el);
      $("#" + this.toClose).show();
      // this is used to append the dynamic form in the single view html
      
      $("#dynamicFormFields").empty().append(selfobj.dynamicFieldRenderobj.getform());
      
      // Do call this function from dynamic module it self.
      $(".ws-select").selectpicker();
      this.initializeValidate();
      this.attachEvents();
      this.setOldValues();
      rearrageOverlays(selfobj.form_label, this.toClose);
      this.commentSingleView.render();
      this.uploadFileEl = $("#taskUpload").RealTimeUpload({
        text: 'Drag and Drop or Select a File to Upload.',
        maxFiles: 0,
        maxFileSize: 4194304,
        uploadButton: false,
        notification: true,
        autoUpload: false,
        extension: ['png', 'jpg', 'jpeg', 'gif', 'pdf','docx', 'doc', 'xls', 'xlsx'],
        thumbnails: true,
        action: APIPATH + 'taskUpload/',
        element: 'taskUpload',
        onSucess: function () {
          selfobj.model.attributes.mediaArr.push(this.elements.uploadList[0].name);
          $('.modal-backdrop').hide();
        }
      });

      selfobj.atValues = [];
      _.each(selfobj.adminList.models, function (admin) {
        selfobj.atValues.push({
          'id': admin.attributes.adminID,
          'value': admin.attributes.name,
        });
      });

      var __toolbarOptions = [
        ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
        [{ 'header': 1 }, { 'header': 2 }],               // custom button values
        [{ 'direction': 'rtl' }],                         // text direction
        [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
        [{ 'align': [] }],
        ['link'],
        ['clean'],
        // ['image']                              // remove formatting button
      ];
      var editor = new Quill($("#task_description").get(0), {
        modules: {
          imageResize: {
            displaySize: true
          },
          toolbar: {
            container: __toolbarOptions,
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
        if (value) {
          this.quill.insertEmbed(range.index, 'image', value, Quill.sources.USER);
        }
      }
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
          const file_ids = file_id[i];
          if (ftext[1] === "xls" || ftext[1] === "xlsx") {
            modifiedFName = "excel.png";
            docUrl += "<div id='"+ file_ids +"removeDiv' class='attachedPic' data-show='singleFile'><div class='thumbnail'><div class='centered removeAttach'><img id='removeIMG' class='img-fluid fileImage img-thumbnail' src='" + UPLOADS + '/' + modifiedFName + "' alt=''><div class='buttonShow visableAttach'><span class='attachView'><a href='" + UPLOADS + "/task/" + selfobj.taskID + '/' + modifiedFName + "' target='_blank'><span class='material-icons'>visibility</span></a></span><span class='deleteAttach deleteAttachment' data-file_id='" + file_ids + "'><span class='material-icons'>delete</span></span></div></div></div></div>";
          } else if (ftext[1] === "pdf") {
            modifiedFName = "pdf.png";
            docUrl += "<div id='"+ file_ids +"removeDiv' class='attachedPic' data-show='singleFile'><div class='thumbnail'><div class='centered removeAttach'><img id='removeIMG' class='img-fluid fileImage img-thumbnail' src='" + UPLOADS + '/' + modifiedFName + "' alt=''/><div class='buttonShow visableAttach'> <span class='attachView'><a href='" + UPLOADS + "/task/" + selfobj.taskID + '/' + modifiedFName + "' target='_blank'><span class='material-icons'>visibility</span></a></span><span class=' deleteAttach deleteAttachment' data-file_id='" + file_ids + "'><span class='material-icons'>delete</span></span></div></div></div></div>";
          } else {
            docUrl += "<div id='"+ file_ids +"removeDiv' class='attachedPic' data-show='singleFile'><div class='thumbnail'><div class='centered removeAttach'><img id='removeIMG' class='img-fluid fileImage img-thumbnail' src='" + UPLOADS + "/task/" + selfobj.taskID + '/' + modifiedFName + "' alt=''/><div class='buttonShow visableAttach'> <span class='attachView'><a href='" + UPLOADS + "/task/" + selfobj.taskID + '/' + modifiedFName + "' target='_blank'><span class='material-icons'>visibility</span></a></span><span class=' deleteAttach deleteAttachment' data-file_id='" + file_ids + "'><span class='material-icons'>delete</span></span></div></div></div></div>";
          }
        }
        document.getElementById("attachedDoc").innerHTML += docUrl;

      }
      $('#taskCom li:first-child a').tab('show');

      this.enteredWatchersArray = [];

      var watchersToAdd = this.model.get("tasksWatchers");
      var watcherAdminID = this.model.get("tasks_watchersAdminID");
      if (watchersToAdd != null && watcherAdminID != null) {
        for (let i = 0; i < watchersToAdd.length; i++) {
          var enteredName = watchersToAdd[i];
          var id = watcherAdminID[i];
          var initial = selfobj.getInitials(enteredName);
          var htmlToAppend = '<span class="tm-tag"> <div class="watcherInitialDetails"><span class="watcherInitial">' + initial + '</span><span>' + enteredName + '</span></div> <a class="removeWatcher"data-watcherAdminID=' + id + '><i class="material-icons">close</i> </a></span>';
          $(".tm-input").append(htmlToAppend);
          selfobj.enteredWatchersArray.push({ name: enteredName, id: id });
        }
      }
      let length = selfobj.enteredWatchersArray.length
      if(length == 0){
        $('.noWatchers').show();
        $('.showWatchers').hide();
      }else{
        $('.noWatchers').hide();
        $('.showWatchers').show();
        let url = "<span class='badge bg-pink taskBadge watchBadge'>" + length + "</span>"
        document.getElementById('watcherEye').innerHTML += url;
      }
      
      // $('.showWatch').click(function(e) {
      //   e.stopPropagation();
      // });
      
      
      selfobj.model.set({ "tasksWatchersArray": selfobj.enteredWatchersArray });
      $(window).click(function (e) {
        if($(e.target).hasClass("showWatchers") || $(e.target).hasClass("tm-tag") || $(e.target).hasClass("taskDate")|| $(e.target).hasClass("watcherdetails") ){
        }else{
          $('.dropdown-content').hide();
          $(".showWatch").hide();
        }
        
      });

      // $(".showWatch").show();
      // $(window).click(function(e) {
      //   console.log("currentTarget", e.currentTarget)
      //   // e.currentTarget()
      //   // if(e.currentTarget="")
      //   // $(".showWatch").hide();
      //   // console.log("currentTarget class ", e.currentTarget.class)
      //   if(e.currentTarget.class =="showWatch"){
      //       $(".showWatch").show();
      //   }else{
      //     $(".showWatch").hide();
      //   }
      // });
      return this;
    },

  });
  return taskSingleView;
});