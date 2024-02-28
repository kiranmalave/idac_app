
define([
    'jquery',
    'underscore',
    'backbone',
    'validate',
    'inputmask',
    'datepickerBT',
    'Swal',
    'moment',
    '../views/customModuleSingleView',
    '../../core/views/columnArrangeModalView',
    '../../core/views/configureColumnsView',
    '../../core/views/appSettings',
    '../models/customFilterOptionModel',
    '../../dynamicForm/collections/dynamicFormDataCollection',
    '../../dynamicForm/collections/dynamicStdFieldsCollection',
    '../../menu/models/singleMenuModel',
    '../collections/customCollection',
    '../../category/collections/slugCollection',
    'text!../templates/customModuleTemp.html',
    'text!../templates/customRowTemp.html',
    'text!../templates/customFilterOption_temp.html',
    'text!../../dynamicForm/templates/linkedDropdown.html',
  ], function ($, _, Backbone, validate, inputmask, datepickerBT, Swal,moment, customModuleSingleView,columnArrangeModalView,configureColumnsView,appSettings,customFilterOptionModel,dynamicFormData,dynamicStdFieldsCol,singleMenuModel,customCollection,slugCollection,customModuleTemp,customRowTemp,customFilterTemp,linkedDropdown) {
  
    var customModuleView = Backbone.View.extend({
      module_desc:'',
      plural_label:'',
      mname:'',
      form_label:'',
      arrangedColumnList: [],
      dynamicStdFieldsList : [],
      initialize: function (options) {
        this.toClose = "customFilterView";
        this.menuId = options.menuId;
        var selfobj = this;
        this.filteredFields = [];
        this.filteredData = [];
        this.mname = Backbone.history.getFragment();
        var parts = this.mname.split('/');
        var mid = parts[parts.length - 1];
        permission = selfobj.getMenuDetails(mid);
        readyState = true;
        $(".modelbox").hide();
        $(".profile-loader").show();
        var getmenu = permission.menuID;
        this.menuId = getmenu;
        this.appSettings = new appSettings();
        this.dynamicFormDatas = new dynamicFormData();
        this.menuList = new singleMenuModel();
        this.totalRec = 0;
        this.appSettings.getMenuList(getmenu, function(plural_label,module_desc,form_label,result) {
          selfobj.plural_label = plural_label;
          selfobj.module_desc = module_desc;
          selfobj.form_label = form_label;
          readyState = true;
          selfobj.getColumnData();
          if(result.data[0] != undefined){
            selfobj.tableName = result.data[0].table_name;
          }
        });
        filterOption = new customFilterOptionModel();
        filterOption.set({ "menuId": this.menuId });
        searchData =  new customCollection();
        this.collection = new customCollection();
        this.collection.on('add', this.addOne, this);
        this.collection.on('reset', this.addAll, this);  
      },

      getMenuDetails: function(mid) {
        for (var key in ROLE) {
          if (ROLE.hasOwnProperty(key) && ROLE[key].menuID == mid) {
            return ROLE[key];
          }
        }
        return null; 
      },

      events:
      {
        "click .loadview": "loadSubView",
        "click .arrangeColumns": "openColumnArrangeModal",
        "click .showpage": "loadData",
        "click .filterSearch": "filterSearch",
        "click #filterOption": "filterRender",
        "click .resetval": "resetSearch",
        "blur #textval": "setFreeText",
        "change #textSearch": "settextSearch",
        "click .changeStatus": "changeStatusListElement",
        "change .changeBox": "changeBox",
        "click .sortColumns": "sortColumn",
        "change .txtchange": "updateOtherDetails",
        "change .dropval": "singleFilterOptions",
        "click .downloadReport": "downloadReport",
        
      },

      downloadReport: function (e) {
        e.preventDefault();
        let type = $(e.currentTarget).attr("data-type");
        var newdetails = [];
        newdetails["type"] = type;
        filterOption.set(newdetails);
        let form = $("#reports");
        form.attr({
            action: APIPATH + "reports",
            method: "POST",
            target: "_blank",
        });
        
        // Update or add hidden input for data
        let dataInput = form.find("input[name='data']");
        if (dataInput.length === 0) {
            dataInput = $("<input>")
                .attr("type", "hidden")
                .attr("name", "data")
                .appendTo(form);
        }
    
        // Update the value of the input field
        dataInput.val(JSON.stringify(filterOption));
       
        // Submit the form
        form.submit();
    
        // Reset form attributes after submission
        form.attr({
            action: "#",
            method: "POST",
            target: "",
        });
    
        // Clear filterOption
        filterOption.clear('type');
        console.log("filterOption", filterOption);
      }, 

      // downloadReport:function(e){
      //   e.preventDefault();
      //   let type = $(e.currentTarget).attr("data-type");
      //   var newdetails = [];
      //   newdetails["type"] = type;
      //   filterOption.set(newdetails);
      //   let form = $("#reports");
      //   let dataInput = $("<input>")
      //     .attr("type", "hidden")
      //     .attr("name", "data")
      //     .val(JSON.stringify(filterOption));
      //     form.attr({
      //     id: "receiptsData",
      //     action: APIPATH + 'reports',
      //     method: "POST",
      //     target: "_blank",
      //   }).append(dataInput);
      //   filterOption.clear('type');
      //   form.submit();
      // },
      
      getColumnData: function(){
        var selfobj = this;
        this.dynamicFormDatas.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler, type: 'post', data: { "pluginId": this.menuId }
        }).done(function (res) {
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
         
            if (res.metadata && res.metadata != undefined && res.metadata.trim() !== '') {
                selfobj.metadata  = JSON.parse(res.metadata);
            } 
            if (res.c_metadata && res.c_metadata != undefined && res.c_metadata.trim() !== '') {
                selfobj.c_metadata  = JSON.parse(res.c_metadata);
                selfobj.arrangedColumnList = selfobj.c_metadata;
            }
            var columnss = [];
            if(selfobj.metadata){
              for (const rowKey in selfobj.metadata) {
                const row = selfobj.metadata[rowKey];
                for (const colKey in row) {
                  const column = row[colKey];
                  if (column.column_name) {
                    columnss.push(column.column_name);
                  }
                }
              }
              const resDataFieldNames = res.data.map(item => item.column_name);
              selfobj.filteredData = resDataFieldNames.filter(fieldName => !columnss.includes(fieldName));
            }
          selfobj.render();
          selfobj.getMenuList();
          selfobj.getModuleData();
        });
      },

      getModuleData:function(){
        var $element = $('#loadMember');
        var selfobj = this;
        this.collection.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler, type: 'post', data: filterOption.attributes
        }).done(function (res) {
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          setPagging(res.paginginfo, res.loadstate, res.msg);
          $(".profile-loader").hide();
        });
      },

      getMenuList:function(){
        var selfobj = this;
        this.dynamicStdFieldsList = new dynamicStdFieldsCol();
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
            selfobj.dynamicStdFieldsList = selfobj.dynamicStdFieldsList.filter(model => {
              const field = model.attributes.Field;
              return !selfobj.filteredData.includes(field);
            });
          });
        }
      },

      addOne: function (objectModel) {
        var selfobj = this;
        var template = _.template(customRowTemp);
        var rr = objectModel.attributes;
        selfobj.arrangedColumnList.forEach((column) => {
          if(column.fieldType == 'Datepicker' || column.fieldType == 'Date'){
            if(objectModel.attributes[""+column.column_name] != "0000-00-00"){
              var dueDateMoment = moment(objectModel.attributes[""+column.column_name]);
              if(column.dateFormat != "" && column.dateFormat != null && column.dateFormat != "undefined"){
                objectModel.attributes[""+column.column_name] = dueDateMoment.format(column.dateFormat);
              }else{
                objectModel.attributes[""+column.column_name] = dueDateMoment.format("DD-MM-YYYY");
              }
            }
            else{
              objectModel.attributes[""+column.column_name] = "-"
             }
          }
          if (column.fieldType == 'Timepicker') {
            if (objectModel.attributes["" + column.column_name] != "00:00:00") {
              var timeFormat = column.displayFormat === '12-hours' ? 'hh:mm' : 'HH:mm';
              var timeMoment = moment(objectModel.attributes["" + column.column_name], 'HH:mm');
              objectModel.attributes["" + column.column_name] = timeMoment.format(timeFormat);
            } else {
              objectModel.attributes["" + column.column_name] = "-";
            }
          }   
          
          if(column.column_name == 'created_by'){
            column.column_name = 'createdBy';
          } else if (column.column_name == 'modified_by'){
            column.column_name = 'modifiedBy';
          }else{
            column.column_name = column.column_name;
          }

        });
        let tt =  template({ customDetails: objectModel.attributes,arrangedColumnList:selfobj.arrangedColumnList });
        $("body").find("tbody#customList").append(tt);
      },

      addAll: function () {
        $("body").find("tbody#customList").empty();
        this.collection.forEach(this.addOne, this);
      },

      loadSubView: function (e) {
        var selfobj = this;
        var show = $(e.currentTarget).attr("data-view");
        switch (show) {
          case "singleCustomFieldData": {
            var customModule_id = $(e.currentTarget).attr("data-custom_id");
            if(customModule_id != "" && customModule_id != null && customModule_id != undefined ){
              if (permission.edit != "yes") {
                alert("You dont have permission to edit");
                return false;
              }else{
                new customModuleSingleView({ customModule_id: customModule_id,searchCustomColumns: this,menuId: this.menuId,form_label:selfobj.form_label});
              }
            }else{
              if (permission.add != "yes") {
                alert("You dont have permission to add");
                return false;
              }else{
                new customModuleSingleView({ customModule_id: customModule_id,searchCustomColumns: this,menuId: this.menuId,form_label:selfobj.form_label});
              }
            }
            break;
          }
        }
      },

    filterRender: function (e) {
      var isexits = checkisoverlay(this.toClose);
      var selfobj = this;
      if (!isexits) {
        var source = customFilterTemp;
        var template = _.template(source);
        var cont = $("<div>");
        const extractedFields = [];
        if(selfobj.metadata){
          for (var rowKey in selfobj.metadata) {
            var row = selfobj.metadata[rowKey];
            for (var colKey in row) {
              var field = row[colKey];
              if (field.fieldID !== undefined) {
                extractedFields.push(field);
              }
            }
          }
        }
        extractedFields.forEach(function(column) {
          if(column.linkedWith != null && column.linkedWith != "" && column.linkedWith != 'undefined' && column.parentCategory != 'undefined' && column.parentCategory != "" && column.parentCategory != null){
            selfobj.categoryList = new slugCollection();
            var matcchedID = [];
            selfobj.categoryList.fetch({
              headers: {
                'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
              }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y', category_id: column.parentCategory}
            }).done(function (res) {
              if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
              var child =[];
              if(res.data[0]){
                for (var i = 0; i < res.data[0].sublist.length; i++) {
                  child[0] = res.data[0].sublist[i].category_id;
                  child[1] = res.data[0].sublist[i].categoryName;
                  matcchedID.push(child.slice());
                  // matcchedID.push(res.data[0].sublist[i].categoryName);
                }
                column.fieldOptions = matcchedID;
              }
            });
          }else{
             column.fieldOptions = column.fieldOptions; 
          }
        });
        const resDataFieldNames = extractedFields.map(item => item.column_name);
        var filteredDatas = selfobj.dynamicStdFieldsList.filter(fieldName => !resDataFieldNames.includes(fieldName.attributes.Field));
        var Numeric = ["TINYINT","SMALLINT","MEDIUMINT","INT","BIGINT","DECIMAL","FLOAT","DOUBLE","REAL","BIT","BOOLEAN","SERIAL"];
        var Text = ["CHAR","VARCHAR","TEXT","TINYTEXT","MEDIUMTEXT","LONGTEXT","BINARY","VARBINARY","BLOB","TINYBLOB","MEDIUMBLOB","LONGBLOB"];
        var Datepicker = ["DATE","DATETIME","TIMESTAMP","YEAR"];
        Numeric = Numeric.map(function (element) {
          return element.toLowerCase();
        });
        Text = Text.map(function (element) {
          return element.toLowerCase();
        });
        Datepicker = Datepicker.map(function (element) {
          return element.toLowerCase();
        });
        filteredDatas.forEach(function(data) {
          if (!extractedFields.some(field => field.column_name === data.attributes.Field)) {
            const fieldType = data.attributes.Type;
            const startIndex = fieldType.indexOf("(");
            if (startIndex !== -1 && fieldType.startsWith("enum")) {
              const endIndex = fieldType.indexOf(")");
              const extractedValues = fieldType.substring(startIndex + 1, endIndex);
              var enumValues = extractedValues.split(',').map(value => value.trim()).join(',');
              var fieldOptions = enumValues.replace(/'/g, '');
            } 
            const extractedType = startIndex !== -1 ? fieldType.substring(0, startIndex) : fieldType;
            if (extractedType == 'varchar' || Text.includes(data.attributes.Type)){
                data.attributes.Type = 'Text';
            }else if (extractedType == 'enum' || data.attributes.Type == 'set'){
                data.attributes.Type = 'Dropdown';
            }else if (extractedType == 'int' || extractedType == 'int unsigned' || Numeric.includes(data.attributes.Type)){
                data.attributes.Type = 'Numeric';
            }else if (Datepicker.includes(data.attributes.Type)){
                data.attributes.Type = 'Datepicker';
            }else{
                data.attributes.Type = data.attributes.Type;
            }
            const newField = {
              fieldType : data.attributes.Type, 
              fieldLabel: formatFieldLabel(data.attributes.Field),
              column_name: data.attributes.Field, 
              fieldOptions : fieldOptions, 
            };
            function formatFieldLabel(label) {
              return label.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
            }
            selfobj.filteredFields.push(newField);
          }
        });
        extractedFields.forEach(function(field) {
          selfobj.filteredFields.push(field); 
        });
        selfobj.filteredFields = selfobj.filteredFields.filter(item => item.column_name !== 'created_by' && item.column_name !== 'modified_by');
        setTimeout(function () { 
          var templateData = {
              filteredFields: selfobj.filteredFields || [],
            };
            cont.html(template(templateData));
            $(".ws-select").selectpicker();
            selfobj.setupFilter();
        }, 1000);
          cont.attr('id', this.toClose);
          $(".overlay-main-container").removeClass("open");
          $(".ws_filterOptions").append(cont);
          $(".ws_filterOptions").addClass("open");
          $("#filterOption").addClass("active");
      } else {
        var isOpen = $(".ws_filterOptions").hasClass("open");
        if (isOpen) {
          $(".ws_filterOptions").removeClass("open");
          $("#filterOption").removeClass("active");
          return;
        } else {
          $("#filterOption").addClass("active");
        }
      }
      this.setValues();
      rearrageOverlays("Filter", this.toClose, "small");
    },

    updateOtherDetails: function (e) {
      var valuetxt = $(e.currentTarget).val();
      var toID = $(e.currentTarget).attr("id");
      var newdetails = [];
      newdetails["" + toID] = valuetxt;
      filterOption.set(newdetails);
    },

    sortColumn: function (e) {
      var order = $(e.currentTarget).attr("data-value");
      var selfobj = this;
      var newsetval = [];
      $("#customTable").find(".up").removeClass("active");
      $("#customTable").find(".down").removeClass("active");
      newsetval["order"] = $(e.currentTarget).attr("data-value");
      newsetval["orderBy"] = $(e.currentTarget).attr("data-field");
      if (order == "" || order == "DESC") {
        order = "ASC";
        $(e.currentTarget).find(".down").removeClass("active");
        $(e.currentTarget).find(".up").addClass("active");
      } else {
        order = "DESC";
        $(e.currentTarget).find(".down").addClass("active");
        $(e.currentTarget).find(".up").removeClass("active");
      }
      $(e.currentTarget).attr("data-value", order);
      newsetval["order"] = order;
      newsetval["orderBy"] = $(e.currentTarget).attr("data-field");
      filterOption.set(newsetval);
      selfobj.filterSearch();
    },

    changeBox: function (e) {
      var selVal = $(e.currentTarget).val();
      $(".hidetextval").hide();
      $(".filterClear").val("");
      filterOption.set({ textval: '' });
    },

    settextSearch: function (e) {
      var fieldnametxt = $(e.currentTarget).val();
      filterOption.set({ textSearch: fieldnametxt });
    },

    resetSearch: function () {
      filterOption.clear().set(filterOption.defaults);
      $(".multiOptionSel").removeClass("active");
      $(".filterClear").val("");
      $(".valChange").val("");
      $(".form-line").removeClass("focused");
      $("#textSearch").val("select");
      $(".hidetextval").hide();
      $(".ws-select").val('default');
      $(".ws-select").selectpicker("refresh");
      $('#textSearch option[value=fieldID]').attr('selected', 'selected');
      this.filterSearch(false);
      let filterOptionLi = document.getElementById('filterOption');
      let taskBadgeSpan = filterOptionLi ? filterOptionLi.querySelector('span.taskBadge') : '';
      if (taskBadgeSpan) {
        taskBadgeSpan.remove();
      }
    },

      filterSearch: function (isClose = false) {
        if (isClose && typeof isClose != 'object') {
          $('.' + this.toClose).remove();
          rearrageOverlays();
        }
        this.collection.reset();
        var selfobj = this;
        readyState = true;
        filterOption.set({ curpage: 0 });
        filterOption.set({ menuId:this.menuId});
        var $element = $('#loadMember');
        $(".profile-loader").show();
        $element.attr("data-index", 1);
        $element.attr("data-currPage", 0);
        var specificFilters = [];
        selfobj.filteredFields.forEach(function (column) {
          if (column.fieldType == 'Datepicker') {
            specificFilters.push(column.column_name + '-startDate');
            specificFilters.push(column.column_name + '-endDate');
          } else if (column.fieldType == 'Timepicker') {
            specificFilters.push(column.column_name + '-startTime');
            specificFilters.push(column.column_name + '-endTime');
          } else if (column.fieldType == 'Numeric') {
            specificFilters.push(column.column_name + '-startNo');
            specificFilters.push(column.column_name + '-endNo');
          } else if (column.fieldType == 'Range') {
            specificFilters.push(column.column_name + '-startRange');
            specificFilters.push(column.column_name + '-endRange');
          } else {
            specificFilters.push(column.column_name);
          }
        });
        specificFilters = [...new Set(specificFilters)];
        specificFilters.push("textval");
        appliedFilterCount = 0;
        for (var i = 0; i < specificFilters.length; i++) {
          var filterKey = specificFilters[i];
          if (filterOption.attributes[filterKey] != null && filterOption.attributes[filterKey] != "" && filterOption.attributes[filterKey] != undefined) {
            appliedFilterCount++;
          }
        }
        this.collection.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, add: true, remove: false, merge: false, error: selfobj.onErrorHandler, type: 'post', data: filterOption.attributes
        }).done(function (res) {
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          $(".profile-loader").hide();
  
          setPagging(res.paginginfo, res.loadstate, res.msg);
          $element.attr("data-currPage", 1);
          $element.attr("data-index", res.paginginfo.nextpage);
          // $(".page-info").html(recset);
          if (res.loadstate === false) {
            $(".profile-loader-msg").html(res.msg);
            $(".profile-loader-msg").show();
          } else {
            $(".profile-loader-msg").hide();
          }

          selfobj.totalRec = res.paginginfo.totalRecords;
          if (selfobj.totalRec == 0 && selfobj.metadata ? Object.keys(selfobj.metadata).length > 0 : '') {
            $('#listView').hide();
            $('.noCustRec').show();
          } else {
            $('#listView').show();
            $('.noCustRec').hide();
          }
  
          selfobj.setValues();
          // selfobj.render();
        });

        if (appliedFilterCount > 0) {
          document.getElementById('filterOption') ? document.getElementById('filterOption').classList.add('active') : '';
        } else {
          document.getElementById('filterOption') ? document.getElementById('filterOption').classList.remove('active') : '';
        }
  
        let filterOptionLi = document.getElementById('filterOption');
        let taskBadgeSpan = filterOptionLi ? filterOptionLi.querySelector('span.taskBadge') : '';
        if (taskBadgeSpan) {
          taskBadgeSpan.remove();
        }
        if (appliedFilterCount != 0) {
          let url = "<span class='badge bg-pink taskBadge'>" + appliedFilterCount + "</span>"
          document.getElementById('filterOption').innerHTML += url;
        }
      },

      setValues: function (e) {
        setvalues = ["status", "type", "order"];
        var selfobj = this;
        $.each(setvalues, function (key, value) {
          var modval = filterOption.get(value);
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
            filterOption.model.set(objectDetails);
          }
        }, 3000);
      },
      
      onErrorHandler: function (collection, response, options) {
        alert("Something was wrong ! Try to refresh the page or contact administer. :(");
        $(".profile-loader").hide();
      },

      openColumnArrangeModal: function (e) {
        let selfobj = this;
        var show = $(e.currentTarget).attr("data-action");
        var stdColumn = ['id'];
        switch (show) {
          case "arrangeColumns": {
            var isOpen = $(".ws_ColumnConfigure").hasClass("open");
            if (isOpen) {
              $(".ws_ColumnConfigure").removeClass("open");
              $(e.currentTarget).removeClass("BG-Color");
              selfobj.getColumnData();
              selfobj.filterSearch();
              return;
            } else {
              // new columnArrangeModalView({menuId: this.menuId,ViewObj: selfobj,stdColumn:stdColumn});
              new configureColumnsView({menuId: this.menuId,ViewObj: selfobj,stdColumn:stdColumn});
              $(e.currentTarget).addClass("BG-Color");
            }
            break;
          }
        }
      },

      loadData: function (e) {
        var selfobj = this;
        var $element = $('#loadMember');
        var cid = $(e.currentTarget).attr("data-dt-idx");
        var isdiabled = $(e.currentTarget).hasClass("disabled");
        if (isdiabled) {
          //
        } else {
          $element.attr("data-index", cid);
          this.collection.reset();
          var index = $element.attr("data-index");
          var currPage = $element.attr("data-currPage");
  
          filterOption.set({ curpage: index });
          var requestData = filterOption.attributes;
  
          $(".profile-loader").show();
          this.collection.fetch({
            headers: {
              'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
            }, add: true, remove: false, merge: false, type: 'post', error: selfobj.onErrorHandler, data: requestData
          }).done(function (res) {
            if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
            setPagging(res.paginginfo, res.loadstate, res.msg);
            $element.attr("data-currPage", index);
            $element.attr("data-index", res.paginginfo.nextpage);
            $(".profile-loader").hide();
          });
        }
      },

      changeStatusListElement : function(e){
        if (permission.delete != "yes") {
          alert("You dont have permission to delete");
          return false;
        }else{
          let selfobj = this;
          var removeIds = [];
          var status = $(e.currentTarget).attr("data-action");
          var action = "changeStatus";
          $('#customList input:checkbox').each(function () {
            if ($(this).is(":checked")) {
                removeIds.push($(this).attr("data-custom_id"));
            }
          });
          var idsToRemove = removeIds.toString();
          if (idsToRemove == '') {
            alert("Please select at least one record.");
            $(".deleteAll").hide();
            $(".checkall").prop("checked", false);
            $(".checkall").closest("div").removeClass("active");
            return false;
          }
          Swal.fire({
            title: 'Are you Sure you want to delete the record?',
            text:"",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Delete',
            animation: "slide-from-top",
          }).then((result) => {
            if (result.isConfirmed) {
              $.ajax({
                url: APIPATH + 'deleteFields/status',
                method: 'POST',
                data: { list: idsToRemove, action: action, status: status,menuID:selfobj.menuId},
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
                }
              });
              $(".deleteAll").hide();
              Swal.fire('Deleted!', '', 'success');
              selfobj.resetSearch();
              $(".checkall").prop("checked", false);
              $(".checkall").closest("div").removeClass("active");
            } else if (result.isDismissed) return;
          })
        }
       
      },

      singleFilterOptions: function (e) {
        e.stopPropagation();
        var toID = $(e.currentTarget).attr("id");
        var valuetxt = $(e.currentTarget).val().join(",");
        var newdetails = [];
        newdetails["" + toID] = valuetxt;
        filterOption.set(newdetails);
      },

      setupFilter: function () {
        var selfobj = this;
        if(selfobj.filteredFields){
          selfobj.filteredFields.forEach(function (column) {
            $('#' + column.column_name + '-startDate').datepickerBT({
              format: "dd-mm-yyyy",
              todayBtn: "linked",
              clearBtn: true,
              todayHighlight: true,
              StartDate: new Date(),
              numberOfMonths: 1,
              autoclose: true,
            }).on('changeDate', function (ev) {
              $('#' + column.column_name + '-startDate').change();
              var valuetxt = $('#' + column.column_name + '-startDate').val();
              var temp = moment(valuetxt, 'DD-MM-YYYY').valueOf();
              var valuetxt = $('#' + column.column_name + '-endDate').val();
              var temp2 = moment(valuetxt, 'DD-MM-YYYY').valueOf();
              if (temp > temp2) {
                $('#' + column.column_name + '-endDate').val("");
              }
              var valuetxt = $(this).val();
              var toID = $(this).attr("id");
              var newdetails = [];
              newdetails["" + toID] = valuetxt;
              filterOption.set(newdetails);
            });
          
            $('#' + column.column_name + '-endDate').datepickerBT({
              format: "dd-mm-yyyy",
              todayBtn: "linked",
              clearBtn: true,
              todayHighlight: true,
              numberOfMonths: 1,
              autoclose: true,
            }).on('changeDate', function (ev) {
              $('#' + column.column_name + '-endDate').change();
              var valuetxt = $('#' + column.column_name + '-endDate').val();
              var temp = moment(valuetxt, 'DD-MM-YYYY').valueOf();
              var valuetxt = $('#' + column.column_name + '-startDate').val();
              var temp2 = moment(valuetxt, 'DD-MM-YYYY').valueOf();
              if (temp < temp2) {
                $('#' + column.column_name + '-startDate').val("");
              }
                var valuetxt = $(this).val();
                var toID = $(this).attr("id");
                var newdetails = [];
                newdetails["" + toID] = valuetxt;
                filterOption.set(newdetails);
            });

            $('#' + column.column_name + '-startTime').timepicker({
              timeFormat: 'h:mm p',
              interval: 15,
              startTime: '00:00',
              dynamic: false,
              dropdown: true,
              scrollbar: true,
              change: function (time) {
                $('#' + column.column_name + '-startTime').change();
                var valuetxt = $('#' + column.column_name + '-startTime').val();
                var temp = moment(valuetxt, 'h:mm p').valueOf();
                var valuetxt = $('#' + column.column_name + '-endTime').val();
                var temp2 = moment(valuetxt, 'h:mm p').valueOf();
                if (temp > temp2) {
                  $('#' + column.column_name + '-endTime').val("");
                }
                var valuetxt = $(this).val();
                var toID = $(this).attr("id");
                var newdetails = [];
                newdetails["" + toID] = valuetxt;
                filterOption.set(newdetails);
              }
            });
            $('#' + column.column_name + '-endTime').timepicker({
              timeFormat: 'h:mm p',
              interval: 15,
              startTime: '00:00',
              dynamic: false,
              dropdown: true,
              scrollbar: true,
              change: function (time) {
                $('#' + column.column_name + '-endTime').change();
                var valuetxt = $('#' + column.column_name + '-endTime').val();
                var temp = moment(valuetxt, 'h:mm p').valueOf();
                var valuetxt = $('#' + column.column_name + '-startTime').val();
                var temp2 = moment(valuetxt, 'h:mm p').valueOf();
                if (temp < temp2) {
                  $('#' + column.column_name + '-startTime').val("");
                }

                var valuetxt = $(this).val();
                var toID = $(this).attr("id");
                var newdetails = [];
                newdetails["" + toID] = valuetxt;
                filterOption.set(newdetails);
              }
            });

            $('#' + column.column_name + '-startNo').on('change', function (e) {
              var temp = parseInt($('#' + column.column_name + '-startNo').val(), 10);
              var temp2 = parseInt($('#' + column.column_name + '-endNo').val(), 10);
              if (temp > temp2) {
                $('#' + column.column_name + '-endNo').val("");
              }
            });
            $('#' + column.column_name + '-endNo').on('change', function (e) {
              var temp = parseInt($('#' + column.column_name + '-startNo').val(), 10);
              var temp2 = parseInt($('#' + column.column_name + '-endNo').val(), 10);
              if (temp > temp2) {
                $('#' + column.column_name + '-startNo').val("");
              }
            });
            $('#' + column.column_name + '-startRange').on('change', function (e) {
              var temp = parseInt($('#' + column.column_name + '-startRange').val(), 10);
              var temp2 = parseInt($('#' + column.column_name + '-endRange').val(), 10);
              if (temp > temp2) {
                $('#' + column.column_name + '-endRange').val("");
              }
            });
            $('#' + column.column_name + '-endRange').on('change', function (e) {
              var temp = parseInt($('#' + column.column_name + '-startRange').val(), 10);
              var temp2 = parseInt($('#' + column.column_name + '-endRange').val(), 10);
              if (temp > temp2) {
                $('#' + column.column_name + '-startRange').val("");
              }
            });

            var linkedClassElement = $("body").find('.dropLinked_' +column.fieldID);
            if (column.fieldType == 'Dropdown' && column.linkedWith != null && column.linkedWith != "" && column.linkedWith != 'undefined') {
                if (column.fieldOptions != undefined) {
                    var selectOptions = column.fieldOptions;//.split(",");
                    var template = _.template(linkedDropdown);
                    var existingElement = linkedClassElement.find('#field_' + column.fieldID);
                    if (existingElement.length == 0) {
                        linkedClassElement.append(template({ elementDetails: column, selectOptions: selectOptions, elementData: filterOption.attributes }));
                    }
                }
            }
          });

          $('body').off('input', '.valChange');
          $('body').off('click', '.selectField');
          $('body').off('click', '.multiSelectField');
    
          $('body').on('input', '.valChange', function (e) {
            let inputText = $(e.currentTarget).val();
            let lastCommaIndex = inputText.lastIndexOf('');
            let name = (lastCommaIndex !== -1) ? inputText.substring(lastCommaIndex + 1).trim() : inputText.trim();
            let pluginID = $(e.currentTarget).attr("data-plugIn");
            let where = $(e.currentTarget).attr("name");
            let fieldID = $(e.currentTarget).attr("data-fieldID");
            let selection = $(e.currentTarget).attr("data-selection");
            let dropdownContainer = $("#field_" + fieldID);
            let selectedIDS = [];
        
            $.ajax({
                url: APIPATH + 'dynamicgetList/',
                method: 'POST',
                data: { text: name, pluginID: pluginID, wherec: where, fieldID: fieldID },
                datatype: 'JSON',
                beforeSend: function (request) {
                    $(".textLoader").show();
                    request.setRequestHeader("token", $.cookie('_bb_key'));
                    request.setRequestHeader("SadminID", $.cookie('authid'));
                    request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
                    request.setRequestHeader("Accept", 'application/json');
                },
                success: function (res) {
                    $(".textLoader").hide();
                    dropdownContainer.empty();
                    if (res.msg === "sucess" && res.data.length > 0) {
                        let pk = res.lookup.pKey;
                        let selectedValues = $(e.currentTarget).val().split(',');
                        $.each(res.data, function (index, value) {
                            var toSearch = [];
                            $.each(value, function (value1) {
                                if (pk != value1) {
                                    toSearch.push(value["" + value1]);
                                }
                            });
                            // var dropdownClass = (selection == 'yes') ? 'multiSelectField' : 'selectField';
                            var dropdownClass = 'multiSelectField';
                            let isSelected = toSearch.some(searchValue => selectedValues.includes(searchValue));
                            if (isSelected) {
                                selectedIDS.push(value["" + pk]);
                            }
                            dropdownContainer.append('<div class="dropdown-item ' + dropdownClass + (isSelected ? ' selected' : '') + '" style="background-color: #ffffff;" data-fieldID="' + fieldID + '" data-cname="' + where + '" data-value="' + value["" + pk] + '">' + toSearch.join("  ") + '</div>');
                        });
                        dropdownContainer.show();
                    }
                   
                    let newdetails = {};
                    let selectedIDSString = selectedIDS.join(',');
                    newdetails[where] = selectedIDSString;
                    filterOption.set(newdetails);
                }
            });
          });
        
          $('body').on('click', '.selectField', function (e) {
            let Name = $(e.currentTarget).text();
            let cname = $(e.currentTarget).attr('data-cname');
            let value = $(e.currentTarget).attr('data-value');
            let fieldID = $(e.currentTarget).attr("data-fieldID");
            $(e.currentTarget).text(Name); 
            $("#field_" + fieldID).hide();
            $('.valChange[data-fieldID="' + fieldID + '"]').val(Name);
            let newdetails = [];
            newdetails["" + cname] = value;
            filterOption.set(newdetails);
          });
        
          $('body').on('click', '.multiSelectField', function (e) {
            let name = $(e.currentTarget).text();
            if($(e.currentTarget).hasClass("selected")){
              $(e.currentTarget).removeClass("selected");
            }else{
              $(e.currentTarget).addClass("selected");
            }
            let cname = $(e.currentTarget).attr('data-cname');
            let value = $(e.currentTarget).attr('data-value');
            let fieldID = $(e.currentTarget).attr("data-fieldID");
            let selectedOptions = [];
            let selectedIDS = [];
            $('.multiSelectField.selected[data-fieldID="' + fieldID + '"]').each(function () {
              selectedIDS.push($(this).attr('data-value'));
              selectedOptions.push($(this).text());
            });
    
            let selectedOptionsString = selectedOptions.join(',');
            let selectedIDSString = selectedIDS.join(',');
            $('.valChange[data-fieldID="' + fieldID + '"]').val(selectedOptionsString);
            let newdetails = {};
            newdetails[cname] = selectedIDSString;
            filterOption.set(newdetails);
          });
    
          $(window).click(function () {
            $('.dropdown-content').hide();
          });
        }
      },

      render: function () {
        var selfobj = this;
        var template = _.template(customModuleTemp);
        var templateData = {
          closeItem: this.toClose || '',
          pluralLable: this.plural_label || '',
          moduleDesc: selfobj.module_desc || '',
          formLabel: selfobj.form_label || '',
          arrangedColumnList: selfobj.arrangedColumnList || [],
          metadata: selfobj.metadata || {},
          menuId: selfobj.menuId || '',
        };
       
        this.$el.html(template(templateData));
        $(".app_playground").append(this.$el);

        var numColumns = selfobj.arrangedColumnList ? selfobj.arrangedColumnList.length : 0;
        var defaultWidth = numColumns <= 5 ? '100%' : (numColumns * 20) + '%';
        $("#customTable").css("width", defaultWidth);

        searchData.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler, type: 'post', data: filterOption.attributes
        }).done(function (res) {
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          setPagging(res.paginginfo, res.loadstate, res.msg);
          selfobj.totalRec = res.paginginfo.totalRecords;
          if (selfobj.totalRec == 0 && selfobj.metadata ? Object.keys(selfobj.metadata).length > 0 : '') {
            console.log("selfobj.totalRec true");
            $('#listView').hide();
            $('.noCustRec').show();
          } else {
            $('#listView').show();
            $('.noCustRec').hide();
          }
          $(".profile-loader").hide();
        });
        $(".ws-select").selectpicker("refresh");
        $(".ws-select").selectpicker();
        setToolTip();
        return this;
      },

      onDelete: function () {
        this.remove();
      },
  
    });
  
    return customModuleView;
  
  });