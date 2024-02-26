define([
  'jquery',
  'underscore',
  'backbone',
  'validate',
  'inputmask',
  'datepickerBT',
  'Quill',
  '../../readFiles/views/readFilesView',
  '../models/infoSettingsModel',
  'text!../templates/infoSettings_Temp.html',
], function ($, _, Backbone, validate, inputmask, datepickerBT, Quill, readFilesView, infoSettingsModel, infotemp) {

  var infoSingleView = Backbone.View.extend({
    model: infoSettingsModel,
    initialize: function (options) {
      this.toClose = "infoFilterView";
      var selfobj = this;
      $(".modelbox").hide();
      $('#infoDetails').remove();
      $(".popupLoader").show();

      this.model = new infoSettingsModel();

      this.model.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        selfobj.render();

      });

    },
    events:
    {
      "click #saveAccessDetails": "saveAccessDetails",
      "click .item-container li": "setValues",
      "blur .txtchange": "updateOtherDetails",
      "change .multiSel": "setValues",
      "change .bDate": "updateOtherDetails",
      "change .dropval": "updateOtherDetails",
      "click .loadMedia": "loadMedia",
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
      console.log(this.model);
    },
    getSelectedFile: function (url) {
      $('.' + this.elm).val(url);
      $('.' + this.elm).change();
      console.log(url);
      $("#profile_pic_view").attr("src", url);
      $("#profile_pic_view").css({ "max-width": "100%" });
      $('#largeModal').modal('toggle');
      this.model.set({ "client_logo": url });
    },
    loadMedia: function (e) {
      e.stopPropagation();
      $('#largeModal').modal('toggle');
      this.elm = "profile_pic";
      new readFilesView({ loadFrom: "addpage", loadController: this });
    },
    setValues: function (e) {
      setvalues = ["infoID"];
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
          console.log(classname[0]);
          console.log(selfobj.model);
        }
      }, 500);
    },

    saveAccessDetails: function (e) {
      e.preventDefault();
      //  var termstxt = CKEDITOR.instances.termsConditions.getData();
      // this.model.set({'termsConditions':termstxt});
      var bid = this.model.get("infoID");
      if (bid != "0" || bid == "") {
        var methodt = "PUT";
      } else {
        var methodt = "POST";
      }

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
          $(e.currentTarget).html("<span>Saved</span>");
          //scanDetails.filterSearch();
        }

        setTimeout(function () {
          $(e.currentTarget).html("<span>Save</span>");
          $(e.currentTarget).removeAttr("disabled");
        }, 3000);

      });

    },

    initializeValidate: function () {
      var selfobj = this;
      $('#ourTarget').inputmask('Regex', { regex: "^[0-9](\\d{1,10})?$" });
      // $('#panNumber').inputmask('Regex',{regex: " ^([A-Z0-9]{1,10})$"});
      $("#userRoleDetails").validate({
        rules: {
          roleName: {
            required: true,
          }
        },
        messages: {
          roleName: "Please enter User Role Name"
        }
      });
    },


    render: function () {
      var source = infotemp;
      var template = _.template(source);
      this.$el.html(template(this.model.attributes));
      $(".main_container").append(this.$el);
      this.setValues();
      this.initializeValidate();

      var __toolbarOptions = [
        ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
        [{ 'header': 1 }, { 'header': 2 }],               // custom button values
        [{ 'direction': 'rtl' }],                         // text direction
        [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
        [{ 'align': [] }],
        ['link'],
        ['clean']                                         // remove formatting button
      ];
      var editor = new Quill($("#termsConditions").get(0), {
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
          selfobj.model.set({ "termsConditions": justHtml });
        }
      });
      return this;
    },
  });

  return infoSingleView;

});
