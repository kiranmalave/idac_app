define([
  'jquery',
  'underscore',
  'backbone',
  'validate',
  'inputmask',
  '../../core/views/multiselectOptions',
  '../../dynamicForm/views/dynamicFieldRender',
  '../collections/categoryCollection',
  '../models/categorySingleModel',
  '../../readFiles/views/readFilesView',
  'text!../templates/categorySingle_temp.html',
], function ($, _, Backbone, validate, inputmask, multiselectOptions, dynamicFieldRender, categoryCollection, categorySingleModel, readFilesView, categorytemp) {

  var categorySingleView = Backbone.View.extend({
    model: categorySingleModel,
    initialize: function (options) {
      this.dynamicData = null;
      this.multiselectOptions = new multiselectOptions();
      this.toClose = "categorySingleView";
      // use this valiable for dynamic fields to featch the data from server
      this.pluginName = "categoryList";
      this.model = new categorySingleModel();
      var selfobj = this;
      this.loadFrom = options.loadfrom;
      // this function is called to render the dynamic view
      // this.dynamicFieldRenderobj = new dynamicFieldRender({ ViewObj: selfobj, formJson: {} });

      $(".modelbox").hide();
      scanDetails = options.searchCategory;
      $(".popupLoader").show();

      var categoryList = new categoryCollection();

      categoryList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y', is_parent: 'yes', isSub: 'N' }
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        selfobj.model.set("categoryList", res.data);
        selfobj.render();
      });

      if (options.category_id != "") {
        this.model.set({ category_id: options.category_id });
        this.model.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler
        }).done(function (res) {
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          $(".popupLoader").hide();
          selfobj.render();
          selfobj.dynamicData = res.data.dynamicFields;

        });
      } else {
        selfobj.render();
        $(".popupLoader").hide();
      }
    },
    events:
    {
      "click .savecategoryDetails": "savecategoryDetails",
      "click .item-container li": "setValues",
      "blur .txtchange": "updateOtherDetails",
      "change .multiSel": "setValues",
      "change .dropval": "updateOtherDetails",
      "change .logoAdded": "updateImageLogo",
      "click .loadMedia": "loadMedia",
      "keyup .titleChange": "updateURL",
    },
    attachEvents: function () {
      // Detach previous event bindings
      this.$el.off('click', '.savecategoryDetails', this.savecategoryDetails);
      // Reattach event bindings
      this.$el.on('click', '.savecategoryDetails', this.savecategoryDetails.bind(this));

      this.$el.off('click', '.multiSel', this.setValues);
      this.$el.on('click', '.multiSel', this.setValues.bind(this));
      this.$el.off('click', '.item-container li', this.setValues);
      this.$el.on('click', '.item-container li', this.setValues.bind(this));
      this.$el.off('change', '.dropval', this.updateOtherDetails);
      this.$el.on('change', '.dropval', this.updateOtherDetails.bind(this));
      this.$el.off('blur', '.txtchange', this.updateOtherDetails);
      this.$el.on('blur', '.txtchange', this.updateOtherDetails.bind(this));
      //this.$el.off('change','.logoAdded', this.updateImageLogo);
      //this.$el.on('change','.logoAdded', this.updateImageLogo.bind(this));
      this.$el.off("click", ".loadMedia", this.loadMedia);
      this.$el.on("click", ".loadMedia", this.loadMedia.bind(this));
      this.$el.off('keyup', '.titleChange', this.updateURL);
      this.$el.on('keyup', '.titleChange', this.updateURL.bind(this));
    },
    onErrorHandler: function (collection, response, options) {
      alert("Something was wrong ! Try to refresh the page or contact administer. :(");
      $(".profile-loader").hide();
    },
    updateURL: function (e) {
      var url = $(e.currentTarget).val().trim().toLowerCase().replace(/[^A-Z0-9]+/ig, "_");
      //var url = $(e.currentTarget).val().toLowerCase().trim().replace(/[^A-Z0-9]+/ig, "-");
      $("#slug").val(url);
      this.model.set({ "slug": url });
    },
    updateOtherDetails: function (e) {
      var valuetxt = $(e.currentTarget).val();
      var toID = $(e.currentTarget).attr("id");
      var newdetails = [];
      newdetails["" + toID] = valuetxt;
      this.model.set(newdetails);
      console.log(this.model);
    },

    setOldValues: function () {
      var selfobj = this;
      setvalues = ["status", "is_parent"];
      selfobj.multiselectOptions.setValues(setvalues, selfobj);
    },
    getSelectedFile: function (url) {
      $('.' + this.elm).val(url);
      $('.' + this.elm).change();
      $("#profile_pic_view").attr("src", url);
      $("#profile_pic_view").css({ "max-width": "100%" });
      $('#largeModal').modal('toggle');
      this.model.set({ "cover_image": url });
      this.render();
      // console.log(this.model);
    },
    loadMedia: function (e) {
      e.stopPropagation();
      $('#largeModal').modal('toggle');
      this.elm = "profile_pic";
      var menusingleview = new readFilesView({ loadFrom: "addpage", loadController: this });
    },

    setValues: function (e) {
      var selfobj = this;
      var da = selfobj.multiselectOptions.setCheckedValue(e);
      selfobj.model.set(da);
      let isRender = $(e.currentTarget).attr("data-render");
      if (isRender == "yes") {
        $("#parent_id").val("");
        selfobj.model.set({ "parent_id": "" });
        selfobj.render();
      }
    },
    savecategoryDetails: function (e) {
      e.preventDefault();
      let selfobj = this;
      var mid = this.model.get("category_id");
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
      if ($("#categoryDetails").valid()) {
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
          if (selfobj.loadFrom == "TaskSingleView") {
            scanDetails.refreshCat();
          } else {
            scanDetails.filterSearch();
          }
          if (res.flag == "S") {
            if (isNew == "new") {
              selfobj.model.clear().set(selfobj.model.defaults);
              // selfobj.dynamicFieldRenderobj.initialize({ ViewObj: selfobj, formJson: {} });
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
        categoryName: {
          required: true,
        },
        categorySlug: {
          required: true,
        },
        is_parent: {
          required: true,
        },
        profile_pic_view: {
          required: true,
        },
        parent_id: {
          required: true,
        },
        status: {
          required: true,
        }
      };
      var feildsrules = feilds;
      // var dynamicRules = selfobj.dynamicFieldRenderobj.getValidationRule();

      // if (!_.isEmpty(dynamicRules)) {
      //   var feildsrules = $.extend({}, feilds, dynamicRules);
      //   // var feildsrules = {
      //   // ...feilds,
      //   // ...dynamicRules
      //   // };
      // }

      var messages = {
        categoryName: "Please enter Category Name",
        categorySlug: "Please enter Category Slug",
        is_parent: "Please  select  is parent ",
        // description: "Please  enter Description",
        profile_pic_view: " please select profile picture",
        status: "Please enter Status",
      };

      $("#categoryDetails").validate({
        rules: feildsrules,
        messages: messages
      });
    },
    render: function () {
      var selfobj = this;
      //var isexits = checkisoverlay(this.toClose);
      //if(!isexits){
      var source = categorytemp;
      var template = _.template(source);
      $("#" + this.toClose).remove();
      this.$el.html(template({ "model": this.model.attributes }));
      this.$el.addClass("tab-pane in active panel_overflow");
      this.$el.attr('id', this.toClose);
      this.$el.addClass(this.toClose);
      this.$el.data("role", "tabpanel");
      this.$el.data("current", "yes");
      $(".tab-content").append(this.$el);
      $('#' + this.toClose).show();
      // this is used to append the dynamic form in the single view html
      // $("#dynamicFormFields").empty().append(this.dynamicFieldRenderobj.getform());
      // Do call this function from dynamic module it self.
      this.initializeValidate();
      this.setOldValues();
      this.attachEvents();
      console.log(this.model);
      //}
      rearrageOverlays("Category", this.toClose);

      var __toolbarOptions = [
        ["bold", "italic", "underline", "strike"], // toggled buttons
        [{ header: 1 }, { header: 2 }], // custom button values
        [{ direction: "rtl" }], // text direction
        [{ size: ["small", false, "large", "huge"] }], // custom dropdown
        [{ align: [] }],
        ["link"],
        ["clean"], // remove formatting button
      ];
      var editor = new Quill($("#description").get(0), {
        modules: {
          toolbar: __toolbarOptions,
        },
        theme: "snow", // or 'bubble'
      });

      //const delta = editor.clipboard.convert();
      //editor.setContents(delta, 'silent');
      editor.on("text-change", function (delta, oldDelta, source) {
        if (source == "api") {
          console.log("An API call triggered this change.");
        } else if (source == "user") {
          var delta = editor.getContents();
          var text = editor.getText();
          var justHtml = editor.root.innerHTML;
          selfobj.model.set({ description: justHtml });
        }
      });

      return this;
    }, onDelete: function () {
      this.remove();
    }
  });

  return categorySingleView;

});
