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
  "../../core/views/multiselectOptions",
  "../collections/commentCollection",
  "../models/commentModel",
  "text!../templates/commentSingle_temp.html",
  "text!../templates/commentRow_temp.html",
], function ($, _, Backbone, validate, inputmask, datepickerBT, typeahead, moment, Swal, multiselectOptions, commentCollection, commentModel, commentTemp, commentRow) {
  var commentSingleView = Backbone.View.extend({
    model: commentModel,
    nextPage: '',
    task_id: '',
    remaining: '',
    totalrec: '',
    pageLimit: '',
    initialize: function (options) {
      this.dynamicData = null;
      this.toClose = "commentSingleView";
      var selfobj = this;
      // this.pluginName = "taskList";
      this.model1 = new commentModel();
      this.multiselectOptions = new multiselectOptions();
      scanDetails = options.searchComment;
      this.task_id = options.task_id;
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
          selfobj.totalrec = res.paginginfo.totalRecords;
          selfobj.nextPage = res.paginginfo.nextpage;
          selfobj.render();
        });

      }

    },

    events: {
      "click .saveComment": "saveComment",
      "click .item-container li": "setValues",
      "blur .txtchange": "updateOtherDetails",
      "change .bDate": "updateOtherDetails",
      "change .dropval": "updateOtherDetails",
      "click .showPage": "loadData",
      "click .editBtn": "editComment",
      "click .deleteBtn": "deleteComment",
      "click #readMoreBtn": "readMoreComments",
      "click .cancel": "cancelPost",
    },
    attachEvents: function () {
      this.$el.off('click', '.saveComment', this.saveComment);
      this.$el.on('click', '.saveComment', this.saveComment.bind(this));
      this.$el.off("change", ".bDate", this.updateOtherDetails);
      this.$el.on("change", ".bDate", this.updateOtherDetails.bind(this));
      this.$el.off('click', '.item-container li', this.setValues);
      this.$el.on('click', '.item-container li', this.setValues.bind(this));
      this.$el.off("change", ".dropval", this.updateOtherDetails);
      this.$el.off('click', '.editBtn', this.editComment);
      this.$el.on('click', '.editBtn', this.editComment.bind(this));
      this.$el.off('click', '.deleteBtn', this.deleteComment);
      this.$el.on('click', '.deleteBtn', this.deleteComment.bind(this));
      this.$el.off('click', '.showPage', this.loadData);
      this.$el.on('click', '.showPage', this.loadData.bind(this));
      this.$el.off('click', '#readMoreBtn', this.readMoreComments);
      this.$el.on('click', '#readMoreBtn', this.readMoreComments.bind(this));
      this.$el.off('click', '.cancel', this.cancelPost);
      this.$el.on('click', '.cancel', this.cancelPost.bind(this));
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

    cancelPost: function (e) {
      this.getCommentList();
    },


    editComment: function (e) {
      let selfobj = this;
      var $parentContainer = $(e.target).closest('.inbox-widget');
      var commentID = $(e.currentTarget).attr("data-commentID");
      $parentContainer.find('.inbox-message').hide();
      $("#editCmt_" + commentID).show();
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

        editor.on('text-change', function (delta, oldDelta, source) {
          if (source == 'api') {
            console.log("An API call triggered this change.");
          } else if (source == 'user') {
            var delta = editor.getContents();
            var text = editor.getText();
            var justHtml = editor.root.innerHTML;
            selfobj.model1.set({ "comment_text": justHtml });
            console.log(selfobj.model1);
          }
        });
      }
    },
    deleteComment: function (e) {
      let selfobj = this;
      let status = "delete";
      let action = "changeStatus";
      let id = $(e.currentTarget).attr("data-commentID");
      Swal.fire({
        title: "Delete Comment ",
        text: "Do you want to delete this Comment ?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Delete',
        animation: "slide-from-top",
      }).then((result) => {
        if (result.isConfirmed) {
          $.ajax({
            url: APIPATH + 'commentDelete',
            method: 'POST',
            data: { list: id, status: status, action: action },
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
                selfobj.totalrec--;
                $("#commentRow_"+id).remove();
                $('#totalComments').empty().text($('#totalComments').text() + 'All Comments ('+selfobj.totalrec+')');
                if(selfobj.totalrec == 0){
                  $("#totalComments").hide();
                }
              }
            }
          });
        }else{

        }
      });
      
    },

    readMoreComments: function(e){
      var readMoreBtn = document.getElementById('readMoreBtn');
      var hiddenComments = document.querySelectorAll('.newComments');

      if (readMoreBtn) {
          readMoreBtn.addEventListener('click', function() {
              hiddenComments.forEach(function(comment) {
                  comment.style.display = 'block';
              });
              readMoreBtn.style.display = 'none';
          });
      }
    },

    saveComment: function (e) {
      e.preventDefault();
      let selfobj = this;
      var taskID = this.task_id;
      var commentID = $(e.currentTarget).attr("data-commentID");
      var commentText = selfobj.model1.get("comment_text");
      $(e.currentTarget).attr("disabled", "disabled");
      $.ajax({
        url: APIPATH + 'taskComment/' + commentID,
        method: 'POST',
        data: { comment_text: commentText, task_id: taskID, status: "active" },
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
            $(e.currentTarget).removeAttr('disabled');
          }
        }
      });
    },
    getCommentList: function () {
      let selfobj = this;
      $(".popuploader").show();
      this.commentList = new commentCollection();
      var task_id = this.task_id
      if (task_id !== "") {
        this.commentList.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler, type: 'post', data: { status: "active", getAll: 'Y', task_id: task_id }
        }).done(function (res) {
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          selfobj.render();
          selfobj.attachEvents();
        });
      }
    },

    loadData: function (e) {
      e.stopPropagation();
      var selfobj = this;
      var index = $(e.currentTarget).attr("data-index");
      $element = $('#read_more');
      this.commentList.reset();
      this.commentList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { getAll: 'Y', status: "active", curpage: index, task_id: this.task_id }
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        var totalreco = res.paginginfo.totalRecords;
        var pagelimit = res.paginginfo.pageLimit;
        var remaining = totalreco - pagelimit;
        $element.attr("data-index", res.paginginfo.nextpage);
        if (res.loadstate) {
        } else {
          $(e.currentTarget).hide();
        }
        var template = _.template(commentRow);
        res.data.forEach(function (objectModel) {
          console.log(objectModel);
          $("#commentRow").append(template({ commentList: objectModel }));
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
      $("#commentDetails").validate({
        rules: feildsrules,
        messages: messages,
      });
    },
    render: function () {
      $(".showPages").empty();
      var selfobj = this;
      var source = commentTemp;
      var template = _.template(source);
      this.$el.html(template({ "commentList": this.commentList.models, "total": this.totalrec }))
      $(".showPages").append(this.$el);
      this.attachEvents();
      $('.ws-select').selectpicker();
      return this;
    },

  });
  return commentSingleView;
});


