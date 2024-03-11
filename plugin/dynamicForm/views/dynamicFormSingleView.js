
define([
  'jquery',
  'underscore',
  'backbone',
  'validate',
  'inputmask',
  'datepickerBT',
  '../../core/views/multiselectOptions',
  '../collections/linkedFormCollection',
  '../models/singleDynamicFormModel',
  '../collections/dynamicStdFieldsCollection',
  '../../menu/models/singleMenuModel',
  '../../category/collections/categoryCollection',
  'text!../templates/dynamicFormSingle_temp.html',
  
], function ($, _, Backbone, validate, inputmask, datepickerBT,multiselectOptions, linkedFormCollection, singleDynamicFormModel,dynamicStdFieldsCol,singleMenuModel,categoryCollection,dynamicFormtemp) {

  var dynamicFormSingleView = Backbone.View.extend({
    model: singleDynamicFormModel,
    parentObj:null,
    fieldList:[],
    formList:[],
    linkedMenuName : '',
    initialize: function (options) {
      var selfobj = this;
      this.parentCategory = false;
      this.toClose = "dynamicFormSingleView";
      this.multiselectOptions = new multiselectOptions();
      $(".modelbox").hide();
      this.parentObj = options.searchFields;
      this.model = new singleDynamicFormModel();
      this.menuList = new singleMenuModel();
      this.dynamicStdFieldsList = new dynamicStdFieldsCol();
     
      this.linkedFormList = new linkedFormCollection();
      this.linkedFormList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        selfobj.render();
      });
      this.menuId = options.menuId;
      this.model.set({ menuId: options.menuId });
      this.model.set({ fieldID: options.fieldID });
      this.model.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        selfobj.getMenuList();
        selfobj.setValues();
      });

      this.categoryList = new categoryCollection();
      this.categoryList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y', is_parent: 'yes', isSub: 'N' }
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        selfobj.render();
      });
    },

    getMenuList: function () {
      var selfobj = this;
      let menuID = selfobj.model.get("linkedWith");
      if (menuID != null && menuID != ""){
        selfobj.menuList.set({"menuID":menuID});
        this.menuList.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded',
            'SadminID': $.cookie('authid'),
            'token': $.cookie('_bb_key'),
            'Accept': 'application/json'
          },
          error: selfobj.onErrorHandler
        }).done(function (result) {
          if (result.statusCode == 994) {
            app_router.navigate("logout", { trigger: true });
          }
          $(".popupLoader").hide();
          selfobj.tableName = result.data[0].table_name;
          try{
            if(selfobj.dynamicStdFieldsList && selfobj.dynamicStdFieldsList != undefined){
              selfobj.dynamicStdFieldsList.fetch({
                headers: {
                  'contentType': 'application/x-www-form-urlencoded',
                  'SadminID': $.cookie('authid'),
                  'token': $.cookie('_bb_key'),
                  'Accept': 'application/json'
                },
                error: selfobj.onErrorHandler,
                type: 'post',
                data: { "table": "ab_" + selfobj.tableName }
              }).done(function (res) {
                if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
                $(".popupLoader").hide();
                selfobj.render();
              });
            }
          }catch(error){
            console.log("errorrr",error);
          }
          selfobj.render();
        });
      }else{
        selfobj.render();
      }
    },

    events:
    {
      "click #savedynamicFormDetails": "savedynamicFormDetails",
      "click #canceldynamicFormDetails": "canceldynamicFormDetails",
      "click .item-container li": "setValues",
      "blur .txtchange": "updateOtherDetails",
      "change .multiSel": "setValues",
      "change .drop-fieldType": "updateFieldVisibility",
      "change .drop-fieldTypeDef": "visibleUserDef",
      "change .dropval": "updateOtherDetails",
      "blur .multiSelect": "updateOtherDetails",
    },

    attachEvents: function () {
      this.$el.off("click", "#savedynamicFormDetails", this.savedynamicFormDetails);
      this.$el.on("click", "#savedynamicFormDetails", this.savedynamicFormDetails.bind(this));

      this.$el.off("click", "#canceldynamicFormDetails", this.canceldynamicFormDetails);
      this.$el.on("click", "#canceldynamicFormDetails", this.canceldynamicFormDetails.bind(this));

      this.$el.off("click", ".item-container li", this.setValues);
      this.$el.on("click", ".item-container li", this.setValues.bind(this));

      this.$el.off("blur", ".txtchange", this.updateOtherDetails);
      this.$el.on("blur", ".txtchange", this.updateOtherDetails.bind(this));

      this.$el.off("change", ".multiSel", this.setValues);
      this.$el.on("change", ".multiSel", this.setValues.bind(this));

      this.$el.off("change", ".drop-fieldType", this.updateFieldVisibility);
      this.$el.on("change", ".drop-fieldType", this.updateFieldVisibility.bind(this));

      this.$el.off("change", ".drop-fieldTypeDef", this.visibleUserDef);
      this.$el.on("change", ".drop-fieldTypeDef", this.visibleUserDef.bind(this));

      this.$el.off("change", ".dropval", this.updateOtherDetails);
      this.$el.on("change", ".dropval", this.updateOtherDetails.bind(this));

      this.$el.off("blur", ".multiSelect", this.updateOtherDetails);
      this.$el.on("blur", ".multiSelect", this.updateOtherDetails.bind(this));

    },

    onErrorHandler: function (collection, response, options) {
      alert("Something was wrong ! Try to refresh the page or contact administer. :(");
      $(".profile-loader").hide();
    },

    updateOtherDetails: function (e) {
      var selfobj = this;
      var valuetxt = $(e.currentTarget).val();
      var toID = $(e.currentTarget).attr("id");
      if(toID == 'fieldType'){
        selfobj.model.set("linkedWith",'');
        selfobj.model.set("fieldOptions",'');
        selfobj.model.set("parentCategory",'');
      }else{
        selfobj.model.set("linkedWith",selfobj.model.get("linkedWith"));
        selfobj.model.set("fieldOptions",selfobj.model.get("fieldOptions"));
        selfobj.model.set("parentCategory",selfobj.model.get("parentCategory"));
      }
      var newdetails = [];
      newdetails["" + toID] = valuetxt;

      selfobj.model.set(newdetails);
      if (
        selfobj.model.get("fieldOptions") &&
        Array.isArray(selfobj.model.get("fieldOptions"))
      ) {
        selfobj.model.set(
          "fieldOptions",
          selfobj.model.get("fieldOptions").join(",")
        );
      }
      selfobj.getMenuList();
    },
  
    setValues: function (e) {
      setvalues = ["status", "allowMultiSelect", "isRequired","itemAlign","textareaType","date_selection_criteria","isNull"];
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
          if(selfobj.model.get("isNull") == 'TRUE'){
            selfobj.model.set("isRequired",'yes');
          }else{
            selfobj.model.set("isRequired",selfobj.model.get("isRequired"));
          }
          if(selfobj.model.get("isRequired") == 'no'){
            selfobj.model.set("isNull",'FALSE');
          }else{
            selfobj.model.set("isNull",selfobj.model.get("isNull"));
          }
          selfobj.render();
        }
      }, 1000);
      this.updateFieldVisibility();
      
    },

    savedynamicFormDetails: function (e) {
      e.preventDefault();
      var selfobj = this;
      let isNew = $(e.currentTarget).attr("data-action");
      var mid = this.model.get("fieldID");
      if (mid == "" || mid == null) {
        var methodt = "PUT";
      } else {
        var methodt = "POST";
      }
      if(this.model.get("linkedWith") != '' && this.model.get("linkedWith") != undefined && this.model.get("linkedWith") != null && selfobj.linkedMenuName && selfobj.linkedMenuName == 'Category'){
        // if((this.model.get("fieldType") == 'Radiobutton' || this.model.get("fieldType") == 'Checkbox' || (this.model.get("fieldType") == 'Dropdown'))){
          this.model.set("fieldOptions",'categoryName');
        // }else{
          // this.model.set("fieldOptions",this.model.get("fieldOptions"));
        // }
      }else{
        this.model.set("fieldOptions",this.model.get("fieldOptions"));
      }
      if ($("#dynamicFormDetails").valid()) {
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
           if (res.flag == "F") {
            alert(res.msg);
          } else if (res.flag == "S") {
            if (isNew == "new") {
              selfobj.model.clear().set(selfobj.model.defaults);
              selfobj.model.set({ menuId: selfobj.menuId});
              selfobj.parentObj.initialize({menuId:selfobj.menuId});
              // selfobj.parentObj.callsaveForm(e);
              setTimeout(function () {
                selfobj.parentObj.saveForm(e);
              }, 1000);
              selfobj.render();
            } else {
              handelClose(selfobj.toClose);
              selfobj.parentObj.initialize({menuId:selfobj.model.get("menuId")});
              // selfobj.parentObj.callsaveForm(e);
              setTimeout(function () {
                selfobj.parentObj.saveForm(e);
              }, 1000);
            }
          }
        });
      }
    },

    updateFieldVisibility: function () {
      var selectedValue = $("#fieldType").val();
      $(".other-fields").addClass("hidden");
      $(".fields-type-" + selectedValue).removeClass("hidden");
    },

    visibleUserDef: function () {
      var selectedValue = $("#valDefault").val();
      if (selectedValue == "USER_DEFINED"){
        $(".fields-type-Def").removeClass("hidden");
      }else{
        $(".fields-type-Def").addClass("hidden");
      }
    },

    canceldynamicFormDetails: function (e) {
      var selfobj = this;
      var menuId = this.model.get("menuId");
      this.model.clear({ silent: true });
      this.model.set({ menuId: menuId });
      selfobj.render();
      selfobj.setValues();
    },

    initializeValidate: function () {
      var selfobj = this;
      $("#dynamicFormDetails").validate({
        rules: {
          fieldLabel: {
            required: true,
            alpha:true,
          },
          fieldType: {
            required: true,
          },
          fieldOptions: {
            required: true,
          },
          status: {
            required: true,
          },
          parentCategory: {
            required: true,
          }
        },
        messages: {
          fieldLabel:{required:"Please enter Field Label"},
          fieldType: "Please select Field Type",
          status: "Please enter Status",
          parentCategory: "Please select Category",
        }
        
      });
    },
    setOldValues: function () {
      var selfobj = this;
      setvalues = ["event_type", "appointment_schedule"];
      selfobj.multiselectOptions.setValues(setvalues, selfobj);
    },
    render: function () {
      var selfobj = this;
      var source = dynamicFormtemp;
      var template = _.template(source);
      $("#" + this.toClose).remove();
      
      const fieldType = selfobj.model.get("fieldType");
      const linked = selfobj.model.get("linkedWith");
      if(linked != null && linked != '' && linked != undefined){
        var matchLink = selfobj.linkedFormList.models.filter(item => item.attributes.menuID == linked);
        if (matchLink.length > 0) {
          selfobj.linkedMenuName = matchLink[0].attributes.menuName;
        } 
      }
      if (fieldType != null && fieldType != '' && fieldType != undefined){
        if(fieldType == "Radiobutton" || fieldType == "Checkbox") {
          selfobj.formList = selfobj.linkedFormList.models.filter(item => item.attributes.menuName == 'Category' && item.attributes.linked == 'y' && (item.attributes.menuID !== selfobj.model.get("menuId")));
          if(selfobj.linkedMenuName == 'Category'){
            selfobj.parentCategory = true;
          }else{
            selfobj.parentCategory = false;
          }
        }else if(fieldType === "Dropdown"){
          selfobj.formList = selfobj.linkedFormList.models.filter(item =>
            item.attributes.linked === 'y' && item.attributes.is_custom == 'n' && (item.attributes.menuID !== selfobj.model.get("menuId"))
          );
          if(selfobj.linkedMenuName == 'Category'){
            selfobj.parentCategory = true;
          }else{
            selfobj.parentCategory = false;
          }
        }
        else{
          selfobj.formList = selfobj.linkedFormList.models.filter(item => item.attributes.linked == 'y' && item.attributes.is_custom == 'n' && (item.attributes.menuID !== selfobj.model.get("menuId")));
          selfobj.parentCategory = false;
        }
      } 
      
      if(this.dynamicStdFieldsList != []){
        const textFields = this.dynamicStdFieldsList.models.filter(field => {
        const fieldType = field.attributes.Type;
        const startIndex = fieldType.indexOf("(");
        const extractedType = startIndex !== -1 ? fieldType.substring(0, startIndex) : fieldType;
          return extractedType === 'varchar' || extractedType === 'text' || extractedType === 'Text';
        });
        const textFieldNames = textFields.map(field => field.attributes.Field);
        selfobj.fieldList = textFieldNames;
      }
    
      this.$el.html(template({ "model": this.model.attributes, "formList": selfobj.formList, "fieldList":selfobj.fieldList,"parentCategory":selfobj.parentCategory,"categoryList":selfobj.categoryList.models,"linkedMenuName":selfobj.linkedMenuName}));
      this.$el.addClass("tab-pane in active panel_overflow");
      this.$el.attr('id', this.toClose);
      this.$el.addClass(this.toClose);
      this.$el.data("role", "tabpanel");
      this.$el.data("current", "yes");
      $(".ws-tab").append(this.$el);
      $('#' + this.toClose).show();
      // Do call this function from dynamic module it self.
      this.setOldValues();
      this.attachEvents();
      $('.ws-select').selectpicker();
      rearrageOverlays("Custom Fields", this.toClose);
      selfobj.initializeValidate();
      selfobj.setValues();
      if (selfobj.model.get("valDefault") == "USER_DEFINED"){
        $(".fields-type-Def").removeClass("hidden");
      }else{
        $(".fields-type-Def").addClass("hidden");
      }
      return this;

    }, 
    onDelete: function () {
      this.remove();
    },

  });

  return dynamicFormSingleView;

});