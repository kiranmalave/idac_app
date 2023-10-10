define([
  'jquery',
  'underscore',
  'backbone',
  'validate',
  'inputmask',
  'datepickerBT',
  '../collections/dynamicFormDataCollection',
  'text!../templates/textbox_temp.html',
  'text!../templates/formMaster.html',

], function ($, _, Backbone, validate, inputmask, datepickerBT, dynamicFormData, textbox_temp, formMaster_temp) {
  var dynamicFieldRender = Backbone.View.extend({
    initialize: function (parentObj) {
      var selfobj = this;
      this.rules = {};
      var template = _.template(formMaster_temp);
      this.$el.html(template());
      this.elCnt = 0;
      this.frmHTML = "";
      console.log(parentObj);
      selfobj.parentView = parentObj.ViewObj;
      selfobj.parentData = parentObj.formJson;
      searchdynamicForm = new dynamicFormData();
      searchdynamicForm.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { "pluginName": selfobj.parentView.pluginName, "pluginId": selfobj.parentView.pluginId }
      }).done(function (res) {
        //
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }

      });
      //console.log(searchdynamicForm);
      this.collection = searchdynamicForm;
      this.collection.on('add', this.addOne, this);
      this.collection.on('reset', this.addAll, this);
    },
    addOne: function (objectModel) {
      var selfobj = this;
      this.addValidationRule(objectModel.attributes);
      dynamicField = objectModel.attributes;
      requiredHtml = "";
      minLengthHtml = "";
      maxLengthHtml = "";
      this.elCnt = this.elCnt + 1;

      //console.log(this.elCnt);
      //console.log("SS  " + objectModel.attributes.fieldType);
      var t1 = parseInt(this.elCnt);
      var t = t1 % 3;
      fieldHtml = "";
      if (t1 == 1)
        fieldHtml += '<div class="row">';

      fieldHtml += '<div class="col-md-4">';
      fieldHtml += '<label for="field_' + dynamicField.fieldID + '">' + dynamicField.fieldLabel + '<span class="error"></span> :</label>';
      if (dynamicField.isRequired == "Yes")
        requiredHtml = "required";
      if (dynamicField.minLength > 0)
        minLengthHtml = "minlength='" + dynamicField.minLength + "'";
      if (dynamicField.maxLength > 0)
        maxLengthHtml = "maxLength='" + dynamicField.maxLength + "'";

      switch (objectModel.attributes.fieldType) {
        case "Textbox": {
          // var template = _.template(textbox_temp);
          // selfobj.$el.append(template({ elementDetails: objectModel.attributes }));
          fieldHtml += '<input id="' + dynamicField.fieldLabel + '" class="dynamicData form-control txtchange" name="' + dynamicField.fieldLabel + '" ' + requiredHtml + ' ' + minLengthHtml + ' ' + maxLengthHtml + ' type="text" value="" placeholder="' + dynamicField.placeholder + '">';
          break;
        }
        case "Textarea": {
          fieldHtml += '<textarea id="' + dynamicField.fieldLabel + '" class="dynamicData form-control txtchange" name="' + dynamicField.fieldLabel + '" ' + requiredHtml + ' ' + minLengthHtml + ' ' + maxLengthHtml + ' placeholder="' + dynamicField.placeholder + '"></textarea>';

          break;
        }
        case "Numeric": {
          fieldHtml += '<input id="' + dynamicField.fieldLabel + '" class="dynamicData form-control txtchange" name="' + dynamicField.fieldLabel + '" ' + requiredHtml + ' ' + minLengthHtml + ' ' + maxLengthHtml + ' type="number" value="" placeholder="' + dynamicField.placeholder + '">';

          break;
        }
        case "Password": {
          fieldHtml += '<input id="' + dynamicField.fieldLabel + '" class="dynamicData form-control txtchange" name="' + dynamicField.fieldLabel + '" ' + requiredHtml + ' ' + minLengthHtml + ' ' + maxLengthHtml + ' type="password" value="" placeholder="' + dynamicField.placeholder + '">';

          break;
        }
        case "Datepicker": {
          fieldHtml += '<input id="field_' + dynamicField.fieldLabel + '" class="dynamicData form-control datepickerBT txtchange" name="' + dynamicField.fieldLabel + '" ' + requiredHtml + ' type="text" value="" placeholder="' + dynamicField.placeholder + '">';
          break;
        }
        case "Timepicker": {
          fieldHtml += '<input id="' + dynamicField.fieldLabel + '" class="dynamicData form-control timepicker txtchange" name="' + dynamicField.fieldLabel + '" ' + requiredHtml + ' ' + minLengthHtml + ' ' + maxLengthHtml + ' type="text" value="" placeholder="' + dynamicField.placeholder + '">';
          break;
        }
        case "Dropdown": {
          var selectOptionHtml = "";
          var selectOptions = dynamicField.fieldOptions.split(",");
          $(selectOptions).each(function () {
            selectOptionHtml += "<option value='" + this + "'>" + this + "</option>";
          });

          fieldHtml += '<select id="' + dynamicField.fieldLabel + '" class="form-control dropval" name="' + dynamicField.fieldLabel + '" ' + requiredHtml + ' value="">' + selectOptionHtml + '</select>';
          break;
        }
        case "Radiobutton": {
          var radioOptionHtml = "";
          var radioOptions = dynamicField.fieldOptions.split(",");
          $(radioOptions).each(function (key) {
            radioOptionHtml += '<input id="' + dynamicField.fieldLabel + '_' + dynamicField.fieldID + '" class="form-control txtchange" name="' + dynamicField.fieldLabel + '" ' + requiredHtml + ' type="radio" value="' + this + '"><label for="radio_' + key + '_' + dynamicField.fieldID + '">' + this + '</label>';
          });
          fieldHtml += radioOptionHtml;
          break;
        }
        case "Checkbox": {
          var radioOptionHtml = "";
          var radioOptions = dynamicField.fieldOptions.split(",");
          $(radioOptions).each(function (key) {
            radioOptionHtml += '<input id="' + dynamicField.fieldLabel + '_' + dynamicField.fieldID + '" class="form-control multiSel" name="' + dynamicField.fieldLabel + '" ' + requiredHtml + ' type="checkbox" value="' + this + '"><label for="checkbox_' + key + '_' + dynamicField.fieldID + '">' + this + '</label>';
          });
          fieldHtml += radioOptionHtml;
          break;
        }
      }
      fieldHtml += '</div>';
      if (t == 0) {
        //console.log("ans    " + t);
        fieldHtml += '</div><div class="clearfix">&nbsp;</div><div class="row">';
        //console.log("fieldHtml " + fieldHtml);
      }

      this.frmHTML += fieldHtml;
      //console.log("thisHtml " + this.frmHTML);
    },
    addAll: function () {
      // $("#dynamicFormList").empty();
      this.collection.forEach(this.addOne, this);
      this.renderDone();
    },
    renderDone: function () {
      this.parentView.render();
      this.parentView.initializeValidate();
    },
    addValidationRule: function (dynamicField) {
      try {
        var fieldRule = {};
        var id = "field_" + dynamicField.fieldID;
        // extend the exiting module
        var objectDetails = [];
        objectDetails["" + id] = null;
        this.parentView.model.set(objectDetails);

        if (typeof this.rules[id] !== 'object' && this.rules[id] == null) {
          this.rules[id] = {};
        }
        if (dynamicField.maxLength != "0") {
          fieldRule.maxlength = dynamicField.maxLength;
        }
        if (dynamicField.minLength != "0") {
          fieldRule.minlength = dynamicField.minLength;
        }
        if (dynamicField.isRequired == "Yes") {
          fieldRule.required = true;
        }
        this.rules[id] = fieldRule;
      } catch (ex) {
        console.log(ex);
      }
    },
    getValidationRule: function () {
      return this.rules;
    },
    getform: function () {
      //console.log(this.frmHTML);
      return this.frmHTML; //this.$el;
    }
  })
  return dynamicFieldRender;
})