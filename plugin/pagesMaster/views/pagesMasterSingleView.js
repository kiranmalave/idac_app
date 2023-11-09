define([
  'jquery',
  'underscore',
  'backbone',
  'validate',
  'inputmask',
  'Quill',
  '../../core/views/multiselectOptions',
  '../models/pagesMasterSingleModel',
  '../../dynamicForm/views/dynamicFieldRender',
  '../../readFiles/views/readFilesView',
  'text!../templates/pagesMasterSingleTemp.html',
], function ($, _, Backbone, validate, inputmask, Quill, multiselectOptions, pagesMasterSingleModel, dynamicFieldRender, readFilesView, pagesMasterTemp) {

  var pagesMasterSingleView = Backbone.View.extend({
    initialize: function (options) {
      this.dynamicData = null;
      this.toClose = "pageMasterSingleView";

      var selfobj = this;
      // use this valiable for dynamic fields to featch the data from server
      this.pluginName = "pages";
      this.dynamicFieldRenderobj = new dynamicFieldRender({ ViewObj: selfobj, formJson: {} });
      this.multiselectOptions = new multiselectOptions();
      this.parentCont = options.parentCont;

      $(".modelbox").hide();
      $('#pageMasterData').remove();
      $(".popupLoader").show();
      var pageID = options.pageID;
      this.model = new pagesMasterSingleModel();
      if (pageID != 0) {
        this.model.set({ pageID: pageID });
        this.model.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler
        }).done(function (res) {
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          $(".popupLoader").hide();
          selfobj.render();
          selfobj.setOldValues();
        });
      } else {
        selfobj.render();
        $(".popupLoader").hide();
      }
    },
    events:
    {
      "click .saveDetails": "saveDetails",
      "click .item-container li": "setValues",
      "blur .txtchange": "updateOtherDetails",
      "change .multiSel": "setValues",
      "click .checkVal": "updateOtherDetailsCheck",
      "change .dropval": "updateOtherDetails",
      "keyup .titleChange": "updateURL",
    },
    attachEvents: function () {
      // Detach previous event bindings
      this.$el.off('click', '.saveDetails', this.saveDetails);
      // Reattach event bindings
      this.$el.on('click', '.saveDetails', this.saveDetails.bind(this));

      this.$el.off('click', '.item-container li', this.setValues);
      this.$el.on('click', '.item-container li', this.setValues.bind(this));
      this.$el.off('change', '.dropval', this.updateOtherDetails);
      this.$el.on('change', '.dropval', this.updateOtherDetails.bind(this));
      this.$el.off('blur', '.txtchange', this.updateOtherDetails);
      this.$el.on('blur', '.txtchange', this.updateOtherDetails.bind(this));
      this.$el.off('click', '.checkVal', this.updateOtherDetails);
      this.$el.on('click', '.checkVal', this.updateOtherDetails.bind(this));

      this.$el.off('keyup', '.titleChange', this.updateURL);
      this.$el.on('keyup', '.titleChange', this.updateURL.bind(this));

    },
    onErrorHandler: function (collection, response, options) {
      alert("Something was wrong ! Try to refresh the page or contact administer. :(");
      $(".profile-loader").hide();
    },
    updateURL: function (e) {
      var url = $(e.currentTarget).val().trim().replace(/[^A-Z0-9]+/ig, "_");
      $("#pageLink").val(url);
      this.model.set({ "pageLink": url });
    },
    updateOtherDetails: function (e) {
      var valuetxt = $(e.currentTarget).val();
      var toID = $(e.currentTarget).attr("id");
      var newdetails = [];
      newdetails["" + toID] = valuetxt;
      this.model.set(newdetails);
      // console.log(this.model)
    },
    updateOtherDetailsCheck: function (e) {
      var valuetxt = $(e.currentTarget).val();
      var toID = $(e.currentTarget).attr("id");
      var newdetails = [];
      var ische = $(e.currentTarget).is(":checked");
      if (ische) {
        newdetails["" + toID] = "yes";
      } else {
        newdetails["" + toID] = "no";
      }

      this.model.set(newdetails);
      // console.log(this.model)
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
    saveDetails: function (e) {
      e.preventDefault();
      let isNew = $(e.currentTarget).attr("data-action");
      var pageID = this.model.get("pageID");

      if (pageID == "" || pageID == null) {
        var methodt = "PUT";
      } else {
        var methodt = "POST";
      }

      if ($("#pagesDetails").valid()) {
        var selfobj = this;
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
          selfobj.parentCont.filterSearch();
          if (res.flag == "S") {
            if (isNew == "new") {
              selfobj.model.clear().set(selfobj.model.defaults);
              selfobj.dynamicFieldRenderobj.initialize({ ViewObj: selfobj, formJson: {} });
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
      $("#pageDetails").validate({
        rules: {
          pageTitle: {
            required: true,
          },
          pageLink: {
            required: true,
          },
          keywords: {
            required: true,
          },
          metaDesc: {
            required: true,
          },
          status: {
            required: true,
          },
          description: {
            required: true,
          },
        },
        messages: {
          pageTitle: "Please enter page Title",
          pageLink: "Please enter page link",
          keywords: "Please enter keyword",
          metaDesc: "Please enter metaDesc",
          status: "Please select status",
          description: "Please enter description",
        }
      });
    },
    render: function () {
      var selfobj = this;
      var source = pagesMasterTemp;
      var template = _.template(source);
      $("#" + this.toClose).remove();
      this.$el.html(template({ "model": this.model.attributes }));
      this.$el.addClass("tab-pane in active panel_overflow");
      this.$el.attr('id', this.toClose);
      this.$el.addClass(this.toClose);
      this.$el.data("role", "tabpanel");
      this.$el.data("current", "yes");
      $(".ws-tab").append(this.$el);
      $('#' + this.toClose).show();
      // this is used to append the dynamic form in the single view html
      $("#dynamicFormFields").empty().append(this.dynamicFieldRenderobj.getform());
      // Do call this function from dynamic module it self.
      this.initializeValidate();
      // 
      this.setOldValues();
      // CKEDITOR.replace('description',{
      //   language: 'en',
      // });
      //this.attachEvents();
      rearrageOverlays("PageMaster", this.toClose);
      $('ws-select').selectpicker();

      /*   ck editor */

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
          selfobj.model.set({ "description": justHtml });
        }
      });


      return this;
    }
  });

  return pagesMasterSingleView;

});
