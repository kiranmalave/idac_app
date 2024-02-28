define([
    'jquery',
    'underscore',
    'backbone',
    'validate',
    'inputmask',
    'datepickerBT',
    'moment',
    '../../core/views/multiselectOptions',
    '../../dynamicForm/views/dynamicFieldRender',
    '../models/customSingleModel',
    '../../readFiles/views/readFilesView',
    'text!../templates/customModuleSingle_temp.html',
  ], function ($, _, Backbone, validate, inputmask, datepickerBT,moment,multiselectOptions, dynamicFieldRender,customSingleModel,readFilesView, customModuleSingletemp) {
  
    var customModuleSingleView = Backbone.View.extend({
      model: customSingleModel,
      menuId:'',
      makeRender:true,
      form_label:'',
      initialize: function (options) {
        var selfobj = this;
        this.toClose = "customModuleSingleView";
        this.pluginName = Backbone.history.getFragment();
        if(options.menuId != undefined){
          this.menuId = options.menuId;
        }
        this.form_label = options.form_label;
        this.model = new customSingleModel();
        this.scanDetails = options.searchCustomColumns;
        this.multiselectOptions = new multiselectOptions();
        $(".modelbox").hide();
          this.model.set({ id: options.customModule_id });
          this.model.fetch({
            headers: {
              'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
            },data:{menuId:this.menuId}, error: selfobj.onErrorHandler
          }).done(function (res) {
            if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
            if (options.menuId != "") {
              selfobj.model.set({ menuId: options.menuId });
              selfobj.dynamicFieldRenderobj = new dynamicFieldRender({ ViewObj: selfobj, formJson: {} });
            }
          });     
      },

      events:
      {
        "click .saveCustomModuleDetails": "saveCustomModuleDetails",
        "blur .txtchange": "updateOtherDetails",
        "blur .multiselectOpt": "updatemultiSelDetails",
        "click .singleSelectOpt": "selectOnlyThis",
        "click .multiSel": "setValues",
        "change .dropval": "updateOtherDetails",
      },
  
      attachEvents: function () {
        this.$el.off('click', '.saveCustomModuleDetails', this.saveCustomModuleDetails);
        this.$el.on('click', '.saveCustomModuleDetails', this.saveCustomModuleDetails.bind(this));
        this.$el.off('click', '.multiSel', this.setValues);
        this.$el.on('click', '.multiSel', this.setValues.bind(this));
        this.$el.off('change', '.dropval', this.updateOtherDetails);
        this.$el.on('change', '.dropval', this.updateOtherDetails.bind(this));
        this.$el.off('blur', '.txtchange', this.updateOtherDetails);
        this.$el.on('blur', '.txtchange', this.updateOtherDetails.bind(this));
        this.$el.off('blur', '.multiselectOpt', this.updatemultiSelDetails);
        this.$el.on('blur', '.multiselectOpt', this.updatemultiSelDetails.bind(this));
        this.$el.off('click', '.singleSelectOpt', this.selectOnlyThis);
        this.$el.on('click', '.singleSelectOpt', this.selectOnlyThis.bind(this));
      },
  
      onErrorHandler: function (collection, response, options) {
        alert("Something was wrong ! Try to refresh the page or contact administer. :(");
        $(".profile-loader").hide();
      },

      updateOtherDetails: function (e) {
        var valuetxt = $(e.currentTarget).val();
        var toName = $(e.currentTarget).attr("id");
        var newdetails = [];
        newdetails["" + toName] = valuetxt;
        this.model.set(newdetails);
        if (this.model.get(toName) && Array.isArray(this.model.get(toName))) {
          this.model.set(toName, this.model.get(toName).join(","));
        }
      },

      updatemultiSelDetails: function (e) {
        var valuetxt = $(e.currentTarget).val();
        var toName = $(e.currentTarget).attr("id");
        var existingValues = this.model.get(toName);
        if (typeof existingValues !== 'string') {
            existingValues = '';
        }
    
        if ($(e.currentTarget).prop('checked')) {
            if (existingValues.indexOf(valuetxt) === -1) {
                existingValues += (existingValues.length > 0 ? ',' : '') + valuetxt;
            }
        } else {
            existingValues = existingValues.split(',').filter(value => value !== valuetxt).join(',');
        }
        this.model.set({ [toName]: existingValues });
    },

    selectOnlyThis: function(e) {
      var clickedCheckbox = e.currentTarget;
      var valueTxt = $(clickedCheckbox).val();
      var toName = $(clickedCheckbox).attr("id");
      this.$('input[name="' + toName + '"]').not(clickedCheckbox).prop('checked', false);
      var existingData = this.model.get(toName);
      this.model.set(toName, ($(clickedCheckbox).prop('checked')) ? valueTxt : null);
    },
  
      setOldValues: function () {
        var selfobj = this;
        setvalues = ["type"];
        selfobj.multiselectOptions.setValues(setvalues, selfobj);
      },
  
      setValues: function (e) {
        var selfobj = this;
        var da = selfobj.multiselectOptions.setCheckedValue(e);
        selfobj.model.set(da);
      },
  
      initializeValidate: function () {
        var selfobj = this;
        var dynamicRules = selfobj.dynamicFieldRenderobj.getValidationRule();
        if (!_.isEmpty(dynamicRules)) {
          var feildsrules = $.extend({}, dynamicRules);
        }
      },

      saveCustomModuleDetails: function (e) {
        e.preventDefault();
        let selfobj = this;
        var mid = this.model.get("id");
        let isNew = $(e.currentTarget).attr("data-action");
        if (mid == "" || mid == null) {
          var methodt = "PUT";
        } else {
          var methodt = "POST";
        }
        if ($("#customModuleDetails").valid()) {
          $(e.currentTarget).html("<span>Saving..</span>");
          $(e.currentTarget).attr("disabled", "disabled");
          this.model.save({}, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
            }, error: selfobj.onErrorHandler, type: methodt,menuID: selfobj.menuId,
          }).done(function (res) {
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
                selfobj.model.set({ menuId: selfobj.menuId});
                selfobj.makeRender = false;
                // selfobj.dynamicFieldRenderobj.prepareForm();
                selfobj.dynamicFieldRenderobj.initialize({ ViewObj: selfobj, formJson: {} });
                // selfobj.makeRender = true;
                handelClose("categorySingleView");
              } else {
                handelClose(selfobj.toClose);
                handelClose("categorySingleView");
              }
            }
          });
        }
      },

      render: function () {
        var selfobj = this;
        var source = customModuleSingletemp;
        var template = _.template(source);
        $("#" + this.toClose).remove();
        this.$el.html(template({ "model": this.model.attributes,dynamicFieldRenderobj : selfobj.dynamicFieldRenderobj }));
        this.$el.addClass("tab-pane in active panel_overflow");
        this.$el.attr('id', this.toClose);
        this.$el.addClass(this.toClose);
        this.$el.data("role", "tabpanel");
        this.$el.data("current", "yes");
        $(".tab-content").append(this.$el);
        $('#' + this.toClose).show();
        $("#dynamicFormFields").empty().append(selfobj.dynamicFieldRenderobj.getform());
        this.initializeValidate();
        this.setOldValues();
        // this.attachEvents();
        rearrageOverlays(selfobj.form_label, this.toClose);
        return this;
      },
      
      onDelete: function () {
        this.remove();
      }
    });
  
    return customModuleSingleView;
  
  });