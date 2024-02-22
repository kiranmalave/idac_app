
define([
  'jquery',
  'underscore',
  'backbone',
  'validate',
  'inputmask',
  'datepickerBT',
  'Swal',
  '../collections/dynamicFormCollection',
  '../collections/linkedFormCollection',
  '../collections/dynamicStdFieldsCollection',
  '../models/singleDynamicFormModel',
  '../views/dynamicFormSingleView',
  '../../menu/models/singleMenuModel',
  'text!../templates/dynamicFromTemp.html',
  'text!../templates/dynamicFormFieldSection.html',
], function ($, _, Backbone, validate, inputmask, datepickerBT, Swal,dynamicFormCollection, linkedFormCollection,dynamicStdFieldsCol, singleDynamicFormModel,dynamicFormSingleView,singleMenuModel, dynamicFormtemp,dynamicFormFieldSection) {

  var dynamicFormView = Backbone.View.extend({
    model: singleDynamicFormModel,
    __rows:0,
    rowHtml:'',
    tableName:'',
    metadata:'',
    menuName:'',
    dynamicFormList:[],
    c_metadata : [],
    __columnsSize:{"col-1":{"type":"col-1","size":"12"},"col-2":{"type":"col-2","size":"6,6"},"col-3":{"type":"col-3","size":"8,4"},"col-4":{"type":"col-4","size":"4,4,4"},"col-6":{"type":"col-6","size":"3,3,3,3"},"col-5":{"type":"col-5","size":"4,8"},"col-6":{"type":"col-6","size":"3,9"},"col-7":{"type":"col-7","size":"3,6,3"},"col-8":{"type":"col-8","size":"9,3"},"col-9":{"type":"col-9","size":"2,2,2,2,2,2"},"col-10":{"type":"col-10","size":"2,8,2"},"col-11":{"type":"col-11","size":"2,2,2,6"},"col-12":{"type":"col-12","size":"3,2,2,2,3"}},

    initialize: function (options) {
      var selfobj = this;
      $(".modelbox").hide();
      if(options != undefined && options.searchdynamicForm != undefined){
        scanDetails = options.searchdynamicForm;
      }
      this.mname = Backbone.history.getFragment();
      var parts = this.mname.split('/');
      var mid = parts[parts.length - 1];
      permission = selfobj.getMenuDetails(mid);
      readyState = true;

      readyState = true;
      $(".popupLoader").show();
      this.dynamicFormListt = new dynamicFormCollection();
      this.model = new singleDynamicFormModel();
      this.linkedFormList = new linkedFormCollection();
      this.dynamicStdFieldsList = new dynamicStdFieldsCol();
      this.menuList = new singleMenuModel();
      this.model.set({ menuId: options.menuId });
      this.linkedFormList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        selfobj.render();
        selfobj.getMenuList();
      });
     
      selfobj.filterSearch();
      // selfobj.render();
    },

    getMenuDetails: function(mid) {
      for (var key in ROLE) {
        if (ROLE.hasOwnProperty(key) && ROLE[key].menuID == mid) {
          return ROLE[key];
        }
      }
      return null; 
    },
    
    getMenuList: function (e) {
      var selfobj = this;
      selfobj.menuList.set({"menuID":selfobj.model.get("menuId")});
      this.menuList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded',
          'SadminID': $.cookie('authid'),
          'token': $.cookie('_bb_key'),
          'Accept': 'application/json'
        },
        error: selfobj.onErrorHandler
      }).done(function (result) {
        try{
        if (result.statusCode == 994) {
          app_router.navigate("logout", { trigger: true });
        }
        $(".popupLoader").hide();
        if(result.data[0] != undefined){
          selfobj.tableName = result.data[0].table_name;
          selfobj.metadata = result.data[0].metadata;
          selfobj.menuName = result.data[0].menuName;
          if (result.data[0].c_metadata != undefined && result.data[0].c_metadata.trim() !== '') {
            selfobj.c_metadata  = JSON.parse(result.data[0].c_metadata);
          }
        }
        if (selfobj.metadata != undefined && selfobj.metadata.trim() !== '') {
          var metaData = JSON.parse(selfobj.metadata);
          selfobj.dynamicFormListt.forEach((item) => {
            if (item && item.attributes) {
              selfobj.updateFieldDetails(metaData, item.attributes.fieldID, item);
            }
          },this);
          
          selfobj.rowHtml = selfobj.generateMetadataHTML(metaData);
        }
        
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
    },

    updateFieldDetails: function(metadata, fieldID, updatedField) {
      for (const rowKey in metadata) {
        const row = metadata[rowKey];
        for (const colKey in row) {
          const col = row[colKey];
          if (col.fieldID == fieldID) {
            metadata[rowKey][colKey].fieldID = updatedField.attributes.fieldID;
            metadata[rowKey][colKey].fieldLabel = updatedField.attributes.fieldLabel;
            metadata[rowKey][colKey].fieldType = updatedField.attributes.fieldType;
            metadata[rowKey][colKey].column_name = updatedField.attributes.column_name;
            metadata[rowKey][colKey].linkedWith = updatedField.attributes.linkedWith;
            metadata[rowKey][colKey].fieldOptions = updatedField.attributes.fieldOptions;
            metadata[rowKey][colKey].dateFormat = updatedField.attributes.dateFormat;
            metadata[rowKey][colKey].displayFormat = updatedField.attributes.displayFormat;
            metadata[rowKey][colKey].parentCategory = updatedField.attributes.parentCategory;
            break;
          }
        }
      }
    },
    
    generateMetadataHTML: function (metadata) {
      var selfobj = this;
      let html = '' ;
      if(metadata){
        Object.keys(metadata).forEach((rowKey, rowIndex) => {
          var sectionHeader = metadata[rowKey]['sectionHeader'] || '';
            html += '<div class="rowData pb-10" data-count="1" data-type="row">';
            html += '<div class="rowHeaders"><ul class="act-headers"><li class="col-type move-row"><span class="material-icons">open_with</span></li><li class="col-type column-selected"><span class="moreoption"><ul>';
            for (let i = 1; i <= 5; i++) {
              html += `<li data-column="col-${i}" class="col-type col-type-select col-type-${i}"></li>`;
            }
          
            html += '</ul></span></li></ul><div class="row-action-header">';
            html += '<span data-action="minimize" title="Minimize Section" data-state="minimize" class="row-action material-icons">expand_more</span>';
            html += '<span data-action="delete" title="Delete Section" class="row-action material-icons">close</span>';
            html += '</div>';
            html += `<div class="sectionHeader"><input type="text" id="sec_name" name="sec_name" placeholder="Add section name :" value="${sectionHeader}"></div>`;
            html += '</div>';
        
            html += `<div id="ws-row-data-${new Date().valueOf()}" class="ws-element-wrapper ws-dropable-items">`;
        
            Object.keys(metadata[rowKey]).forEach((colKey, colIndex) => {
              if (colKey !== 'sectionHeader') {
              var fieldID = metadata[rowKey][colKey].fieldID || 'undefined';
              var fieldLabel = metadata[rowKey][colKey].fieldLabel || 'undefined';
              var fieldType = metadata[rowKey][colKey].fieldType || 'undefined';
              var column_name = metadata[rowKey][colKey].column_name || 'undefined';
              var linkedWith = metadata[rowKey][colKey].linkedWith || 'undefined';
              var fieldOptions = metadata[rowKey][colKey].fieldOptions || 'undefined';
              var dateFormat = metadata[rowKey][colKey].dateFormat || 'undefined';
              var displayFormat = metadata[rowKey][colKey].displayFormat || 'undefined';
              var parentCategory = metadata[rowKey][colKey].parentCategory || 'undefined';
              var colSize = metadata[rowKey][colKey].colSize || '4';
            
              html += `<div id="ws-${new Date().valueOf()}_${colIndex + 1}" class="ws-row-col ws-col-size-${colSize}" data-colsize="${colSize}">`;
              html += `<div class="ws-data-element">`;
        
              if (fieldID !== 'undefined') {
                html += `<div class="field_list field_drag" data-fieldid="${fieldID}" data-fieldLabel="${fieldLabel}" data-fieldType="${fieldType}" data-column_name="${column_name}" data-linkedWith="${linkedWith}" data-fieldOptions="${fieldOptions}" data-dateFormat="${dateFormat}" data-displayFormat="${displayFormat}" data-parentCategory="${parentCategory}">`;
                html += `<div>`;
                html += `<div class="fieldsDragDrop"></div>`;
                html += `</div>`;
                // html += `<div class="hover-text-tooltip">`;
                html += `<div class="fieldLabel hover-text-tooltip" data-toggle="tooltip" data-placement="top" title="${fieldLabel}">`;
                html += `${fieldLabel}`;
                html += `<div class="fieldType">${fieldType}</div>`;
                html += `<span class="tooltip-text">${fieldLabel}</span>`;
                html += `</div>`;
                // html += `</div>`;
                html += `<div class="fieldActionBtns">`;
                html += `<button type="button" class="ws-btn-default loadview" data-view="singleFieldData" data-fieldid="${fieldID}">`;
                html += `<i class="material-icons">mode_edit</i>`;
                html += `</button>`;
                html += `<span type="button" class="changeStatus deleteAll ws-btn-default" data-action="delete" data-fieldid="${fieldID}">`;
                html += `<i class="material-icons" style="padding: 2px 5px;">delete</i>`;
                html += `</span>`;
                html += `</div>`;
                html += '</div>';
              }
              html += '</div>';
              html += '</div>';
              }
            });
            html += '</div>';
            html += '</div>';
        });
      }
      setTimeout(function () {
        selfobj.setupDropable();
      }, 1000);
      return html;
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
      "change .bDate": "updateOtherDetails",
      "change .dropval": "updateOtherDetails",
      "click .iconSelection": "setIconValues",
      "click .getFieldDetails": "getFieldDetails",
      "click .changeStatus": "changeStatusListElement",
      "click .addRow": "addRow",
      "click .loadview": "loadSubView",
      "change .sectionHeader": "saveForm",
    },

    onErrorHandler: function (collection, response, options) {
      alert("Something was wrong ! Try to refresh the page or contact administer. :(");
      $(".profile-loader").hide();
    },

    loadSubView: function (e) {
      var selfobj = this;
      var show = $(e.currentTarget).attr("data-view");
      switch (show) {
        // case "singleFieldData": {
        //   var fieldID = $(e.currentTarget).attr("data-fieldID");
        //   new dynamicFormSingleView({ fieldID: fieldID,menuId:this.model.get("menuId"), searchFields: this,tableName:selfobj.tableName});
        //   break;
        // }
        case "singleFieldData": {
          var fieldID = $(e.currentTarget).attr("data-fieldID");
          if(fieldID != "" && fieldID != null && fieldID != undefined ){
            if (permission && permission.edit == "yes") {
              new dynamicFormSingleView({ fieldID: fieldID,menuId:this.model.get("menuId"), searchFields: this,tableName:selfobj.tableName});
            }else{
              alert("You dont have permission to edit");
              return false;
            }
          }else{
            if (permission && permission.add == "yes") {
              new dynamicFormSingleView({ fieldID: fieldID,menuId:this.model.get("menuId"), searchFields: this,tableName:selfobj.tableName});
            }else{
              alert("You dont have permission to add");
              return false;
            }
          }
          break;
        }
      }
    },
    
    updateOtherDetails: function (e) {
      var valuetxt = $(e.currentTarget).val();
      var toID = $(e.currentTarget).attr("id");
      var newdetails = [];
      newdetails["" + toID] = valuetxt;
      this.model.set(newdetails);
    },

    setValues: function (e) {

      setvalues = ["status", "allowMultiSelect", "isRequired","itemAlign","textareaType","date_selection_criteria"];
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
        }
      }, 3000);
      this.updateFieldVisibility();
    },

    savedynamicFormDetails: function (e) {
      e.preventDefault();
      var mid = this.model.get("fieldID");
      if (mid == "" || mid == null) {
        var methodt = "PUT";
      } else {
        var methodt = "POST";
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
          if (res.flag == "F") {
            alert(res.msg);
          } else {
            selfobj.filterSearch();
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
      if (selectedValue == "USER_DEFINED")
        $(".fields-type-Def").removeClass("hidden");
      else
        $(".fields-type-Def").addClass("hidden");
    },

    canceldynamicFormDetails: function (e) {
      var selfobj = this;
      var menuId = this.model.get("menuId");
      this.model.clear({ silent: true });
      this.model.set({ menuId: menuId });
      selfobj.render();
      selfobj.setValues();
    },

    changeStatusListElement: function (e) {
      if (permission && permission.delete == "yes") {
          var selfobj = this;
          var removeIds = [];
          var status = $(e.currentTarget).attr("data-action");
          var action = "changeStatus";
          var fieldID = $(e.currentTarget).attr("data-fieldid");
          removeIds.push($(e.currentTarget).attr("data-fieldid"));
          $(".action-icons-div").hide();
          var idsToRemove = removeIds.toString();
          if (idsToRemove == '') {
            alert("Please select at least one record.");
            return false;
          }
          Swal.fire({
            title: 'Are you Sure you want to delete?',
            text:"After you delete this field, all associated data will be permanently removed from our system and cannot be restored. Please ensure that you have backed up any crucial data and double-check your decision before proceeding with the deletion.",
            showDenyButton: true,
            showCancelButton: false,
            confirmButtonText: 'Delete',
            denyButtonText: `Cancel`,
            icon: "question",
          }).then((result) => {
            if (result.isConfirmed) {
              $.ajax({
                url: APIPATH + 'dynamicformfield/status',
                method: 'POST',
                data: { list: idsToRemove, action: action, status: status },
                datatype: 'JSON',
                beforeSend: function (request) {
                  $(e.currentTarget).html("<span>Deleting..</span>");
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
                    $(e.currentTarget).closest(".field_list").remove();
                    // selfobj.callsaveForm(e);
                    setTimeout(function() {
                      selfobj.saveForm(e);
                      selfobj.getMenuList();
                      selfobj.filterSearch();
                    }, 2000);
                  }
                  setTimeout(function () {
                    $(e.currentTarget).html(status);
                  }, 500);
                }
              });
            }
          });
      }else{
        alert("You dont have permission to delete");
        return false;
      }
    },

    initializeValidate: function () {
      var selfobj = this;
      $("#metadataContainer").append(selfobj.rowHtml);
      $("#dynamicFormDetails").validate({
        rules: {
          fieldLabel: {
            required: true,
          },
          fieldType: {
            required: true,
          },
          status: {
            required: true,
          }
        },
        messages: {
          fieldLabel: "Please enter Field Label",
          fieldType: "Please select Field Type",
          status: "Please enter Status"
        }
      });
    },

    getFieldDetails: function (e) {
      var selfobj = this;
      readyState = true;
      var fieldID = $(e.currentTarget).attr("data-fieldID");

      this.model.set({ fieldID: fieldID });
      this.model.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        selfobj.render();
        var source = dynamicFormtemp;
        var template = _.template(source);
        $('#dynamicFormDetails').html(template({ "model": selfobj.model.attributes, "dynamicFormList": selfobj.dynamicFormList.models, "formList": selfobj.linkedFormList.models }));
        selfobj.setValues();
      });
    },

    filterSearch: function () {
      var selfobj = this;
      readyState = true;
      this.dynamicFormListt.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y', menuId: this.model.get("menuId") }
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        selfobj.render();
        $(".popupLoader").hide();
        $(".profile-loader").hide();
      });
    },

    deleteRow: function (e) {
      var selfobj = this;
      e.stopImmediatePropagation();
      let section = $(e.currentTarget).closest(".rowData");
      let records = section.find('.field_drag');
      let fieldIdArray = [];
      records.each(function () {
        let fieldID = $(this).data('fieldid');
        fieldIdArray.push(parseInt(fieldID));
      });
      fieldIdArray.forEach((fieldID) => {
        var idToFind = parseInt(fieldID);
        this.dynamicFormListt.forEach((item) => {
          if (item.attributes.fieldID == idToFind) {
            this.dynamicFormList.push(item);
            selfobj.appendList(item);
          }
        });
      });
      section.remove();
      // selfobj.callsaveForm(e);
      setTimeout(function() {
         selfobj.saveForm(e);
      }, 1000);
      
    },

    appendList:function(item,e){
      var selfobj = this;
      let html = '' ;
      // html += '<div class="ws-field-element">';
      html += '<div class="field_list field_drag ui-draggable ui-draggable-handle" data-fieldid="'+item.attributes.fieldID+'" data-fieldLabel="'+item.attributes.fieldLabel+'" data-fieldtype="'+item.attributes.fieldType+'" data-column_name="'+item.attributes.column_name+'" data-linkedWith="'+item.attributes.linkedWith+'" data-fieldOptions="'+item.attributes.fieldOptions+'" data-dateFormat="'+item.attributes.dateFormat+'" data-displayFormat="'+item.attributes.displayFormat+'" data-parentCategory="'+item.attributes.parentCategory+'">';
      html += '<div class="fieldsDragDrop"></div>';
      html += '<div class="hover-text-tooltip">';
      html += '<div class="fieldLabel">';
      html += ''+item.attributes.fieldLabel+'';
      html += '<div class="fieldType">'+item.attributes.fieldType+'</div>';
      html += '</div>';
      html += '<span class="tooltip-text">'+item.attributes.fieldLabel+'</span>';
      html +='</div>';
      html +='<div class="fieldActionBtns">';
      html +='<button type="button" class="ws-btn-default loadview" data-view="singleFieldData" data-fieldid="'+item.attributes.fieldID+'">';
      html +='<i class="material-icons">mode_edit</i>';
      html +='</button>';              
      html +='<span type="button" class="changeStatus deleteAll ws-btn-default" data-action="delete" data-fieldid="'+item.attributes.fieldID+'">';
      html +='<i class="material-icons" style="padding: 2px 5px;">delete</i>';
      html +='</span>';   
      html +='</div>';
      html +='</div>';
      // html +='</div>';
      $('#dynamicFormListData').append(html);
      selfobj.setupDropable(); 
      selfobj.setupDragable(); 
    },
  
    minimize:function(e){
      var state = $(e.currentTarget).attr("data-state");
      if(state == "minimize"){
          $(e.currentTarget).html("expand_less");
          $(e.currentTarget).closest('.rowData').find('.ws-element-wrapper').addClass("hide");
          $(e.currentTarget).attr("data-state","maximize");
      }else{
          $(e.currentTarget).html("expand_more");
          $(e.currentTarget).attr("data-state","minimize");
          $(e.currentTarget).closest('.rowData').find('.ws-element-wrapper').removeClass("hide");    
      }
    },

    addRow:function(e){
      var selfobj = this;
      e.stopImmediatePropagation();
      $(".ws-playground").append(selfobj.setItemPreview("row"));
      selfobj.setupDropable();
    },

    setItemPreview:function(type,noRow=true){
      var selfobj = this;
      var ediDetails = '<div class="row-action-header"><span data-action="minimize" title="Minimize Row" data-state="minimize" class="row-action material-icons">expand_more</span><span data-action="delete" title="Delete Row" class="row-action material-icons">close</span></div>';
      var secName = '<div class="sectionHeader"><input type="text" id="sec_name" name="sec_name" placeholder="Add section name :" value=""></div>';
      var ediDetailsSection = '<div class="row-action-header"><span data-action="minimize" title="Minimize Section" data-state="minimize" class="row-action material-icons">expand_more</span><span data-action="delete" title="Delete Section" class="row-action material-icons">close</span></div>';
      var __rows =0;
      switch(type){
          case 'row':
              if(__rows !=0){
                  __rows = __rows + 1;
              }else if(parseInt($(".rowData").length) <=0){
                  __rows = __rows + 1;
              }else{
                  __rows = parseInt($(".rowData").length);
              }
              var rowName = "ws-row-data-"+new Date().valueOf();
              var _col = selfobj.createColumnSection();
              $(".defaultView").remove();
              let rowl =  $("<div>",{
                  class:'rowData pb-10',
                  "data-count":__rows,
                  "data-type":'row',
              });
              let rnl = $("<div>",{
                  id:rowName,
                  class:"ws-element-wrapper ws-dropable-items"
              })
              let rowel =  $("<div>",{class:'rowHeaders',}).append($("<ul>",{class:'act-headers'}).append("<li class='col-type move-row'><span class='material-icons'>open_with</span></li><li class='col-type column-selected'>"+_col+"</li>"));
              if(noRow){
                  rowel.append(secName);
                  rowel.append(ediDetails);
                  rowl.append(rowel);
                  rowl.append(rnl);
                  selfobj.performColumnsArrgements(rnl,"col-1");
                  return rowl;
              
              }else{
                rowel.append(ediDetailsSection);
                rowl.append(rowel);
                rowl.append(rnl);
                return rowl;
              }
              break;
      }
    },
  
    createColumnSection :function(){
        var col = "<span class='moreoption'><ul>";
        for (let index = 1; index <=5; index++) {
            col = col + "<li data-column='col-"+index+"' class='col-type col-type-select col-type-"+index+"'></li>";
        }
        col = col + "</ul></span>";
        return col;
    },

    performColumnsArrgements:function(element,type){
      var selfobj = this;
      var tempDiv = $("<div/>",{id:"tempTxt"});
      element.find(".ws-row-col").each(function() {
          $(this).find(".ws-data-element").remove();
          $(this).find(".col-action").remove();
          if($(this).is(':empty')){
          }else{
              var ht = $(this).html();
              tempDiv.append(ht);
          }
      });
      $(element).html("");
      var sizes = this.__columnsSize[type].size;
      var tcol = sizes.split(",");
      let inel = $('');
      jQuery.each(tcol,function(index,value){
          var rm = Math.floor(Math.random()* 100);
          var id = "ws-"+new Date().valueOf()+"_"+rm;
          var cls = 'ws-row-col ws-col-size-'+value;
          var colSize = value;
          var edit = $("<div/>",{
              class:"ws-data-element"
          });
          $(".ws-data-element").removeClass("ui-state-highlight");

          edit.html('');
          if(index == 0 ){
              if (tempDiv.is(':empty')){
                  $('<div />', {
                      id:id,
                      class: cls,
                      'data-colsize': colSize,
                  }).append(edit).append(inel.clone()).appendTo(element);
              }else{
                  $('<div />', {
                      id:id,
                      class: cls,
                      'data-colsize': colSize,
                  }).append(edit).append(tempDiv.html()).appendTo(element);
              }
          }else{
              $('<div />', {
                  id:id,
                  class: cls,
                  'data-colsize': colSize,
              }).append(edit).append(inel.clone()).appendTo(element); 
          }
      });
      selfobj.setupDropable();
    },

    saveForm: function (e) {
      var selfobj = this;
      e.preventDefault();
      var jsonForm = {};
      $("body").find('.rowData').each(function (index, row) {
        var rowId = 'row' + (index + 1);
        var rowHasContent = false;
        jsonForm[rowId] = {};
        var sectionHeaderInput = $(row).find('.sectionHeader input');
        var sectionHeaderValue = sectionHeaderInput.val();
        jsonForm[rowId]['sectionHeader'] = sectionHeaderValue;
        $(row).find('.ws-row-col').each(function (colIndex, col) {
          let colId = 'col' + (colIndex + 1);
          let fieldElement = $(col).find('.field_drag');
          let fieldID = fieldElement.data('fieldid');
         
          let fieldLabel = fieldElement.data('fieldlabel');
          let fieldType = fieldElement.data('fieldtype');
          let column_name = fieldElement.data('column_name');
          let linkedWith = fieldElement.data('linkedwith');
          let fieldOptions = fieldElement.data('fieldoptions');
          let dateFormat = fieldElement.data('dateformat');
          let displayFormat = fieldElement.data('displayformat');
          let parentCategory = fieldElement.data('parentcategory');
         
          let colSize = $(col).data('colsize');
          let isFieldIdPresent = selfobj.dynamicFormListt.some(function (item) {
            return item.attributes.fieldID == fieldID;
          });
          if (isFieldIdPresent) {
              jsonForm[rowId][colId] = { fieldID: fieldID, fieldLabel: fieldLabel, colSize: colSize, fieldType: fieldType,"column_name":column_name,linkedWith:linkedWith,fieldOptions:fieldOptions,dateFormat:dateFormat,displayFormat:displayFormat,parentCategory:parentCategory };
              rowHasContent = true;
          } else {
            jsonForm[rowId][colId] = { colSize: colSize };
          }
        });

        if (rowHasContent) {
          jsonForm[rowId] = jsonForm[rowId];
        } else {
          delete jsonForm[rowId];
        }
      });
      var jsonString = JSON.stringify(jsonForm);
      if (jsonString && jsonString.trim() !== '') {
        var metaData = JSON.parse(jsonString);
      }
  
      $.ajax({
        type: 'POST',
        url: APIPATH+'/metadata',
        data: {menuId:selfobj.model.get("menuId"),htmlContent: jsonString},
        beforeSend: function (request) {
          request.setRequestHeader("token",$.cookie('_bb_key'));
          request.setRequestHeader("SadminID",$.cookie('authid'));
          request.setRequestHeader("contentType",'application/x-www-form-urlencoded');
          request.setRequestHeader("Accept",'application/json');
        },
        success: function (res) {
          if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
          if(res.flag == "F"){
            alert(res.msg);
          }else{
            
          }
          if ($("#dynamicFormListData").length > 0) {
            var wsFieldElements = $("#dynamicFormListData").find(".field_drag");
            if (wsFieldElements.length > 0) {
              $("#dynamicFormListData").find(".textCls").remove();
            } else {
              $("#dynamicFormListData").empty().append('<span class="textCls">No Fields Available</span>');
            }
          } else {
            console.log("dynamicFormListData element not found.");
          }
          selfobj.updateCmetadata(metaData);
        },
        error: function (error) {
          console.error('Error saving HTML structure:', error);
        }
      });
    },

    updateCmetadata: function (metaData) {
      var selfobj = this;
      var fieldIds = [];
      if (Object.keys(metaData).length > 0 && metaData !== undefined) {
          for (var rowKey in metaData) {
              var row = metaData[rowKey];
              for (var colKey in row) {
                  var field = row[colKey];
                  if (field.fieldID !== undefined) {
                      fieldIds.push(String(field.fieldID));
                  }
              }
          }
      }

      if (metaData && selfobj.c_metadata) {
        selfobj.c_metadata.forEach(item => {
            Object.values(metaData).forEach(row => {
                Object.values(row).forEach(col => {
                  if(item.fieldID){
                    if (col.fieldID == item.fieldID) {
                      item.fieldID = col.fieldID;
                      item.fieldLabel = col.fieldLabel;
                      item.fieldType = col.fieldType;
                      item.column_name = col.column_name;
                      item.linkedWith = col.linkedWith;
                      item.fieldOptions = col.fieldOptions;
                      item.dateFormat = col.dateFormat;
                      item.displayFormat = col.displayFormat;
                      item.parentCategory = col.parentCategory;
                    }
                  }
                });
            });
        });
      }

      selfobj.c_metadata = selfobj.c_metadata.filter(item => {
        return !item.fieldID || fieldIds.includes(String(item.fieldID));
      });    
  
      var jsonData = JSON.stringify(selfobj.c_metadata);
      let method = "POST";
  
      $.ajax({
          type: 'POST',
          url: APIPATH + 'c_metadata',
          data: {
              menuId: selfobj.model.get("menuId"),
              htmlContent: jsonData,
              method: method
          },
          beforeSend: function (request) {
              request.setRequestHeader("token", $.cookie('_bb_key'));
              request.setRequestHeader("SadminID", $.cookie('authid'));
              request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
              request.setRequestHeader("Accept", 'application/json');
          },
          success: function (res) {
              if (res.statusCode == 994) {
                  app_router.navigate("logout", {
                      trigger: true
                  });
              }
              if (res.flag == "F") {
                  alert(res.msg);
              } else {
                  console.log("else");
              }
          },
          error: function (error) {
              console.error('Error saving HTML structure:', error);
          }
      });
    },
     
    setupDragable: function(){
      $(".field_drag").draggable({
        revert: "invalid",
        containment: "document",
        helper: "clone",
        cursor: "move",
      });
    },

    setupDropable: function(){
      var selfobj = this; 
      $("body").find(".ws-playground").sortable({
        placeholder: "ui-state-highlight",
        forcePlaceholderSize: true,
        items: '>.rowData',
        change: function(event, ui) {
          // selfobj.callsaveForm(event);
          setTimeout(function() {
             selfobj.saveForm(event);
          }, 1000);
        }
      });
      
      $("body").find(".ws-data-element").droppable({
        accept: ".field_drag, .ws-data-element .field_drag",
        over: function(event, ui) {
            if ($(this).find(".field_drag").length === 0) {
                $(this).addClass("ui-state-highlight");
            }
        },
        out: function(event, ui) {
            $(this).removeClass("ui-state-highlight");
        },
        drop: function(event, ui) {
            if ($(this).find(".field_drag").length === 0) {
                $(this).append(ui.draggable);
                $(this).removeClass("ui-state-highlight");
                ui.draggable.removeClass("ui-draggable-dragging");
                // selfobj.callsaveForm(event);
                setTimeout(function() {
                  selfobj.saveForm(event);
                }, 1000);
            }
        },
      });
      
      $("body").find("#dynamicFormListData").droppable({
        over: function(event, ui) {
            $(this).addClass("ui-state-highlight");
        },
        out: function(event, ui) {
            $(this).removeClass("ui-state-highlight");
        },
        drop: function(event, ui) {
            $(this).append(ui.draggable);
            $(this).removeClass("ui-state-highlight");
            ui.draggable.removeClass("ui-draggable-dragging");
            // selfobj.callsaveForm(event);
            setTimeout(function() {
              selfobj.saveForm(event);
            }, 1000);
        },
      });
    },

    // callsaveForm:function(event){
    //   var selfobj = this;
    //   selfobj.saveForm(event);
    // },
    
    render: function () {
      var selfobj = this;
      var dynamicFormFields = this.dynamicFormListt.map(item => {
        var formattedField = item.attributes.fieldLabel.replace(/ /g, '_').toLowerCase();
        return formattedField;
      });
      
      var dynamicStdFieldsLst = this.dynamicStdFieldsList.filter(item => !dynamicFormFields.includes(item.attributes.Field));
      this.dynamicStdFieldsList.models = dynamicStdFieldsLst;
      
     
      var fieldIds = [];

      if(Object.keys(selfobj.metadata).length > 0 && selfobj.metadata != undefined){
        if (selfobj.metadata != undefined && selfobj.metadata.trim() !== '') {
          var metadataObject = JSON.parse(selfobj.metadata);
          for (var rowKey in metadataObject) {
            var row = metadataObject[rowKey];
            for (var colKey in row) {
              var field = row[colKey];
              if (field.fieldID !== undefined) {
                fieldIds.push(field.fieldID);
              }
            }
          }
        }
       
      }
      var filteredDynamicFormList = this.dynamicFormListt.filter((item) => !fieldIds.includes(parseInt(item.attributes.fieldID)));
      this.dynamicFormList = filteredDynamicFormList;

      var dynamicFormtemps = _.template(dynamicFormtemp);
      this.$el.html(dynamicFormtemps({ "model": this.model.attributes, "dynamicFormList": this.dynamicFormList, "formList": this.linkedFormList.models,"dynamicStdFieldsList": this.dynamicStdFieldsList.models}));
      var dynamicSection = _.template(dynamicFormFieldSection);
      this.$el.append(dynamicSection({ "model": this.model.attributes, "dynamicFormList": this.dynamicFormList, "formList": this.linkedFormList.models,"dynamicStdFieldsList": this.dynamicStdFieldsList.models,"dynamicFormListt": this.dynamicFormListt.models,"menuName": this.menuName}));
    
      selfobj.initializeValidate();
      selfobj.setValues();
      selfobj.setupDragable();
     
      $(".popupLoader").hide();
      $(".profile-loader").hide();
      $(".app_playground").append(this.$el);

      $("#startDate").datepickerBT({
        todayBtn: 1,
        autoclose: true,
        dateFormat: "yy-mm-dd",
        onSelect: function (dateText) {
          selfobj.model.set({ startDate: this.value });
          var minDate = new Date(this.value);
        }
      });

      $("#endDate").datepickerBT({
        dateFormat: "yy-mm-dd", autoclose: true,
        onSelect: function (dateText) {
          selfobj.model.set({ endDate: this.value });
        }
      });

      $('.timepicker').timepicker({
        timeFormat: 'h:mm p',
        interval: 1,
        //minTime: '0',
        //maxTime: '12:00pm',
        defaultTime: '11',
        startTime: '00:00',
        dynamic: false,
        dropdown: true,
        scrollbar: true,
        change: function (time) {
          var selectedFieldID = $(this).attr("id");
          selfobj.model.set({ selectedFieldID: $(this).val() });
        }
      });
      $("body").on("click",".row-action",function(e){
        e.stopImmediatePropagation();
        var act = $(this).attr("data-action");
        switch (act) {
            case "delete":{
              selfobj.deleteRow(e);
                break;
            }
            case "minimize":{
              selfobj.minimize(e);
                break;
            }
            default:
                break;
        }
      });

      $("body").on("click",".col-type-select",function(e){
        e.stopImmediatePropagation(); 
        var rowData = $(this).closest(".rowData");
        var fieldDragElement = rowData.find(".field_drag");
        if (fieldDragElement.length > 0) {
          let fieldIdArray = [];
          fieldDragElement.each(function () {
            let fieldID = $(this).data('fieldid');
            fieldIdArray.push(parseInt(fieldID));
          });
          fieldIdArray.forEach((fieldID) => {
            var idToFind = parseInt(fieldID);
            selfobj.dynamicFormListt.forEach((item) => {
              if (item.attributes.fieldID == idToFind) {
                selfobj.dynamicFormList.push(item);
                selfobj.appendList(item);
              }
            });
          });
        } else {
            console.log("No field_drag element found in this row.");
        }

        var columntype = $(this).data("column");
        if(typeof(columntype) != "undefined"){
            var rowSection = $(this).closest(".rowData");
            var rowNo = rowSection.attr("data-count");
            var innerwrapper = rowSection.find(".ws-element-wrapper");
            selfobj.performColumnsArrgements(innerwrapper,columntype);
            // selfobj.callsaveForm(e);
            setTimeout(function() {
              selfobj.saveForm(e);
            }, 1000);
        }
      });

      var dynamicFormListData = document.getElementById("dynamicFormListData");
      if (dynamicFormListData) {
        var wsFieldElements = dynamicFormListData.getElementsByClassName("field_drag");

        if (wsFieldElements.length > 0) {
          var textClsElements = dynamicFormListData.getElementsByClassName("textCls");
          for (var i = 0; i < textClsElements.length; i++) {
            dynamicFormListData.removeChild(textClsElements[i]);
          }
        } else {
          var html = '<span class="textCls">No Fields Available</span>';
          dynamicFormListData.insertAdjacentHTML('beforeend', html);
        }
      } else {
        console.log("dynamicFormListData element not found.");
      }
      return this;
    }, 

    onDelete: function () {
      this.remove();
    },

  });

  return dynamicFormView;

});
