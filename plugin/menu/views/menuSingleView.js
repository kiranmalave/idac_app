define([
  'jquery',
  'underscore',
  'backbone',
  'validate',
  'inputmask',
  'datepickerBT',
  '../../core/views/multiselectOptions',
  '../models/iconListModel',
  '../../dynamicForm/views/dynamicFieldRender',
  '../collections/menuCollection',
  '../models/singleMenuModel',
  'text!../templates/menuSingle_temp.html',
], function ($, _, Backbone, validate, inputmask, datepickerBT, multiselectOptions, iconData, dynamicFieldRender, menuCollection, singleMenuModel, menutemp) {

  var menuSingleView = Backbone.View.extend({
    model: singleMenuModel,
    initialize: function (options) {
      this.dynamicData = null;
      this.toClose = "menuSingleView";
      // use this valiable for dynamic fields to featch the data from server

      this.pluginName = "menuList";
      this.model = new singleMenuModel();
      var selfobj = this;
      selfobj.pluginId = options.menuID;
      // this function is called to render the dynamic view
      this.dynamicFieldRenderobj = new dynamicFieldRender({ ViewObj: selfobj, formJson: {} });
      this.multiselectOptions = new multiselectOptions();
      scanDetails = options.searchmenu;
      this.iconList = new iconData();
      $(".popupLoader").show();
      selfobj.render();
      this.menuList = new menuCollection();
      this.menuList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y' }
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        selfobj.model.set("menuList", res.data);
        selfobj.render();
      });

      if (options.menuID != "") {
        this.model.set({ menuID: options.menuID });
        this.model.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler
        }).done(function (res) {
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          $(".popupLoader").hide();
          selfobj.render();
        });
      }
      //this.listenTo(this.model, 'sync',this.render);
      //this.listenTo(this.menuList, 'sync', this.render);
    },
    events:
    {
      "click .saveMenuDetails": "saveMenuDetails",
      "blur .txtchange": "updateOtherDetails",
      "click .multiSel": "setValues",
      "change .bDate": "updateOtherDetails",
      "change .dropval": "updateOtherDetails",
      "click .iconSelection": "setIconValues",
    },
    attachEvents: function () {
      // Detach previous event bindings
      this.$el.off('click', '.saveMenuDetails', this.saveMenuDetails);
      // Reattach event bindings
      this.$el.on('click', '.saveMenuDetails', this.saveMenuDetails.bind(this));

      this.$el.off('click', '.multiSel', this.setValues);
      this.$el.on('click', '.multiSel', this.setValues.bind(this));
      this.$el.off('change', '.bDate', this.updateOtherDetails);
      this.$el.on('change', '.bDate', this.updateOtherDetails.bind(this));
      this.$el.off('change', '.dropval', this.updateOtherDetails);
      this.$el.on('change', '.dropval', this.updateOtherDetails.bind(this));
      this.$el.off('click', '.iconSelection', this.setIconValues);
      this.$el.on('click', '.iconSelection', this.setIconValues.bind(this));
      this.$el.off('blur', '.txtchange', this.updateOtherDetails);
      this.$el.on('blur', '.txtchange', this.updateOtherDetails.bind(this));
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
    },
    setOldValues: function () {
      var selfobj = this;
      setvalues = ["status", "isParent", "isClick", "linked", "is_custom", "custom_module"];
      selfobj.multiselectOptions.setValues(setvalues, selfobj);
    },
    setValues: function (e) {
      var selfobj = this;
      var da = selfobj.multiselectOptions.setCheckedValue(e);
      console.log(da);
      selfobj.model.set(da);
      let isRender = $(e.currentTarget).attr("data-render");
      if (isRender == "yes") {
        selfobj.render();
      }
    },
    setIconValues: function (e) {
      selfobj = this;
      var objectDetails = [];
      objectDetails["iconName"] = $(e.currentTarget).attr("data-value");
      selfobj.model.set(objectDetails);
      $(".iconList").removeClass("active");
      $(e.currentTarget).closest(".iconList").addClass("active");
    },
    saveMenuDetails: function (e) {
      e.preventDefault();
      let selfobj = this;
      var mid = this.model.get("menuID");
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
      if ($("#menuDetails").valid()) {
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
        menuName: {
          required: true,
        },
        menuLink: {
          required: true,
        },
        module_name: {
          required: true,
          onlyalpha: true,
        },

        status: {
          required: true,
        }
      };
      var feildsrules = feilds;
      var dynamicRules = selfobj.dynamicFieldRenderobj.getValidationRule();

      if (!_.isEmpty(dynamicRules)) {

        var feildsrules = $.extend({}, feilds, dynamicRules);
        // var feildsrules = {
        // ...feilds,
        // ...dynamicRules
        // };
      }
      var messages = {
        menuName: "Please enter Menu Name",
        menuLink: "Please enter Menu link",
        status: "Please enter Status",
      };
      $("#menuDetails").validate({
        rules: feildsrules,
        messages: messages
      });
    },
    render: function () {
      var source = menutemp;
      var template = _.template(source);
      $("#" + this.toClose).remove();
      this.$el.html(template({ "model": this.model.attributes, "iconList": this.iconList.attributes.icons }));
      this.$el.addClass("tab-pane in active panel_overflow");
      this.$el.attr('id', this.toClose);
      this.$el.addClass(this.toClose);
      this.$el.data("role", "tabpanel");
      this.$el.data("current", "yes");
      $(".ws-tab").append(this.$el);
      $('#' + this.toClose).show();
      // this is used to append the dynamic form in the single view html
      //$("#dynamicFormFields").empty().append(this.dynamicFieldRenderobj.getform());
      // Do call this function from dynamic module it self.
      this.initializeValidate();
      this.setOldValues();
      this.attachEvents();
      rearrageOverlays("Menu", this.toClose);
      return this;
    }, onDelete: function () {
      this.remove();
    }
  });
  return menuSingleView;

});
