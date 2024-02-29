
define([
  'jquery',
  'underscore',
  'backbone',
  'Swal',
  'moment',
  'timepicker',
  "../../core/views/timeselectOptions",
  '../collections/customerNotesCollection',
  '../models/customerNoteSingleModel',
  'text!../templates/customerNotesRow_temp.html',
  'text!../templates/customerNotes_temp.html',
], function ($, _, Backbone, Swal, moment, timepicker, timeselectOptions, customerNotesCollection, customerNoteSingleModel, customerNotesRow_temp, customerNotesTemp) {

  var customerView = Backbone.View.extend({
    editor:null,
    initialize: function (options) {
      var selfobj = this;
      $(".profile-loader").show();
      this.custName = options.customerName;
      scanDetails = options.searchCustomer;
      this.render();
      this.model = new customerNoteSingleModel();
      this.customer_id = options.customer_id;
      this.stage_id = options.stageID;
      this.timeselectOptions = new timeselectOptions();
      this.collection = new customerNotesCollection();
      this.collection.on('add', this.addOne, this);
      this.collection.on('reset', this.addAll, this);
      selfobj.getNotesDetails();
    },

    getNotesDetails: function () {
      var selfobj = this;
      var data = { customer_id: this.customer_id };
      this.collection.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: data
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".profile-loader").hide();
        $('body').find(".loder").hide();
      });
    },
    events:
    {
      "click .changeStatus": "changeStatusListElement",
      "click .saveNote": "saveNoteDetails",
      "click .editNote": "editNote",
      "click .deleteNote": "deleteNote",
      "change .txtchange": "updateOtherDetails",
      "click .closeModal": "closeModal",
      "click .newNote":"newNote",
    },

    updateOtherDetails: function (e) {
      var valuetxt = $(e.currentTarget).val();
      var toID = $(e.currentTarget).attr("id");
      var newdetails = [];
      newdetails["" + toID] = valuetxt;
      this.model.set(newdetails);
    },

    closeModal: function(){
      $('#NoteModal').modal('toggle');
      scanDetails.resetSearch(this.stage_id);
    },

    newNote: function(e){
      let selfobj = this;
      $("#saveNotes").html("Save");
      $("#title").val("");
      selfobj.editor.root.innerHTML = "";
      selfobj.model.clear().set(selfobj.model.defaults);
      $('.pointer').removeClass('active');
      $(e.currentTarget).addClass('activeNew');
    },

    addOne: function (objectModel) {
      let selfobj = this;
      objectModel.set({ "timeString": selfobj.timeselectOptions.displayRelativeTime(objectModel.attributes.created_date) });
      var template = _.template(customerNotesRow_temp);
      $("#notesRow").append(template({ notesDetails: objectModel }));
    },
    addAll: function () {
      $("#notesRow").empty();
      this.collection.forEach(this.addOne, this);
    },
    editNote: function (e) {
      let selfobj = this;
      var id = $(e.currentTarget).attr("data-id");
      $('.pointer').removeClass('active');
      $(e.currentTarget).addClass('active');
      $('.newNote').removeClass('activeNew');
      this.model.set({ "note_id": id });
      var reminderDate = $(e.currentTarget).attr('data-time');
      var dateTimeArray = reminderDate.split(' ');
      var datePart = moment(dateTimeArray[0]).format("DD-MM-YYYY");
      var timePart = moment(reminderDate).format("h:mm a");
      selfobj.model.set({"reminder_date":dateTimeArray[0]});
      selfobj.model.set({"reminder_time":dateTimeArray[1]});
      $('#reminder_date').val(datePart);
      $('#reminder_time').val(timePart);
      var desc = $.trim($(e.currentTarget).find('.editNoteDesc').html());
      var title = $.trim($(e.currentTarget).find('.editnotestHeading').text());
      $("#title").val(title);
      this.editor.root.innerHTML = desc;
      $("#saveNotes").html("Update");
    },

    deleteNote: function (e) {
      e.stopPropagation();
      Swal.fire({
        title: 'Do you want to delete ?',
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: 'Yes',
        denyButtonText: `No`,
      }).then((result) => {
        if (result.isConfirmed) {
        Swal.fire('Deleted!', '', 'success')
        let selfobj = this;
        var action = "delete";
        var id = $(e.currentTarget).attr("data-id");
        if (id != "" && id != null) {
          $.ajax({
            url: APIPATH + 'customerNote/delete',
            method: 'POST',
            data: { id: id, action: action },
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
                selfobj.model.clear().set(selfobj.model.defaults);
                $("#title").val("");
                $("#reminder_date").val("");
                $("#reminder_time").val("");
                selfobj.editor.root.innerHTML = "";
                selfobj.collection.reset();
                selfobj.getNotesDetails();
              }
            }
          });
        }
      } else if (result.isDenied) {
        Swal.fire('Changes are not saved', '', 'info')
      }
      })
    },



    changeStatusListElement: function (e) {
      Swal.fire({
        title: 'Do you want to delete ?',
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: 'Yes',
        denyButtonText: `No`,
      }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
         if (result.isConfirmed) {
         Swal.fire('Deleted!', '', 'success')
        var selfobj = this;
        var removeIds = [];
        var status = $(e.currentTarget).attr("data-action");
        var action = "changeStatus";

      $('#clist input:checkbox').each(function () {
        if ($(this).is(":checked")) {
          removeIds.push($(this).attr("data-form_id"));
        }
      });
      $(".deleteAll").hide();
      
      $(".action-icons-div").hide();
      $(".listCheckbox").click(function() {
          if($(this).is(":checked")) {
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
      $.ajax({
        url: APIPATH + 'dynamicForms/status',
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
            selfobj.collection.fetch({
              headers: {
                'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
              }, error: selfobj.onErrorHandler
            }).done(function (res) {
              if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
              $(".profile-loader").hide();
              selfobj.filterSearch();
            });
          }
          setTimeout(function () {
            $(e.currentTarget).html(status);
          }, 3000);

        }
      });
    } else if (result.isDenied) {
      Swal.fire('Changes are not saved', '', 'info')
      $('#clist input:checkbox').each(function () {
        if ($(this).is(":checked")) {
          $(this).prop('checked', false);
        }
      });
      $(".listCheckbox").find('.checkall').prop('checked', false);
      $(".deleteAll").hide();
    }
    })
    },

    saveNoteDetails: function (e) {
      let selfobj = this;
      var id = this.model.get("note_id");

      var title = $("#title").val();
      var description = $("#notes_description1").text();
      if (!title.trim() && !description.trim()) {
        console.log("Title and description cannot be empty");
        return; 
      }
    
      if (id == "" || id == null) {
        var methodt = "PUT";
      } else {
        var methodt = "POST";
      }
    
      if ($("#customerNotes").valid()) {
        $(e.currentTarget).html("Saving..");
        this.model.set({ "customer_id": selfobj.customer_id, "title": title, "description": description });
    
        this.model.save({}, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'SadminID': $.cookie('authid'),
            'token': $.cookie('_bb_key'),
            'Accept': 'application/json'
          },
          error: selfobj.onErrorHandler,
          type: methodt
        }).done(function (res) {
          if (methodt == "PUT") {
            selfobj.model.set({ note_id: res.lastID });
          }
          $('.notesRow').empty();
          selfobj.collection.reset();
          selfobj.getNotesDetails();
          $(e.currentTarget).html("Update");
        });
      }
      $('.newNote').removeClass('activeNew');
    },
    
    render: function () {
      var selfobj = this;
      var template = _.template(customerNotesTemp);
      this.$el.html(template({ customerNotes: selfobj.collection, name: this.custName}));
      $('#noteMedia').empty();
      $("#noteMedia").append(this.$el);
      setToolTip();
      // this.initializeValidate();
      $(".profile-loader").hide();

      $("#reminder_date").datepickerBT({
        format: "dd-mm-yyyy",
        todayBtn: "linked",
        clearBtn: true,
        todayHighlight: true,
        startDate: new Date(),
        numberOfMonths: 1,
        autoclose: true,
      }).on('changeDate', function (selected) {
        $('#reminder_date').change();
        var valuetxt = $("#reminder_date").val();
        selfobj.model.set({ reminder_date: valuetxt });
      });

      $('#reminder_time').timepicker({
        timeFormat: 'hh:mm a',
        interval: 15,
        startTime: '00:00',
        dynamic: false,
        dropdown: true,
        scrollbar: true,
        change: function (e) {
          var st = $("#reminder_time").val();
          var tempsTime = moment(st, "hh:mm a").format("HH:mm:ss");
          selfobj.model.set({ reminder_time: tempsTime });
          console.log(tempsTime);
        },
      });

      var __toolbarOptions = [
        ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
        [{ 'header': 1 }, { 'header': 2 }],               // custom button values
        [{ 'direction': 'rtl' }],                         // text direction
        [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
        [{ 'align': [] }],
        // ['link'],
        // ['clean'],
        // ['image']                              // remove formatting button
      ];
      this.editor = new Quill($("#notes_description1").get(0), {
        placeholder: 'Type your notes here...',
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
      this.editor.on('text-change', function (delta, oldDelta, source) {
        if (source == 'api') {
          console.log("An API call triggered this change.");
        } else if (source == 'user') {
          var justHtml = selfobj.editor.root.innerHTML;
          selfobj.model.set({ "note_desc": justHtml });
        }
      });

      return this;
    }
  });

  return customerView;

});
