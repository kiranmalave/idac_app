
define([
    'jquery',
    'underscore',
    'backbone',
    'moment',
    '../views/companySingleView',
    '../collections/companyCollection',
    '../models/companyFilterOptionModel',
    '../../core/views/configureColumnsView',
    '../../core/views/appSettings',
    '../../dynamicForm/collections/dynamicFormDataCollection',
    '../../menu/models/singleMenuModel',
    '../../category/collections/slugCollection',
    'text!../templates/companyRow.html',
    'text!../templates/company_temp.html',
    'text!../templates/companyFilterOption_temp.html',
    'text!../../dynamicForm/templates/linkedDropdown.html',
  ], function ($, _, Backbone,moment,companySingleView, companyCollection, companyFilterOptionModel,configureColumnsView,appSettings,dynamicFormData,singleMenuModel,slugCollection,companyRow, company_temp, companyFilterOption_temp,linkedDropdown) {
  
    var companyView = Backbone.View.extend({
      module_desc:'',
      plural_label:'',
      form_label:'',
      initialize: function (options) {
        this.startX = 0;
        this.startWidth = 0;
        this.$handle = null;
        this.$table = null;
        this.pressed = false;
        this.toClose = "companyFilterView";
        var selfobj = this;
        selfobj.arrangedColumnList = [];
        this.filteredFields = [];
        $(".profile-loader").show();
        var mname = Backbone.history.getFragment();
        permission = ROLE[mname];
        this.menuId = permission.menuID;
        this.appSettings = new appSettings();
        this.dynamicFormDatas = new dynamicFormData();
        this.menuList = new singleMenuModel();
        this.appSettings.getMenuList(this.menuId, function(plural_label,module_desc,form_label,result) {
          selfobj.plural_label = plural_label;
          selfobj.module_desc = module_desc;
          selfobj.form_label = form_label;
          readyState = true;
          selfobj.getColumnData();
          if(result.data[0] != undefined){
            selfobj.tableName = result.data[0].table_name;
          }
        });
      
        filterOption = new companyFilterOptionModel();
        filterOption.set({ "menuId": this.menuId });
        this.collection = new companyCollection();
        this.collection.on('add', this.addOne, this);
        this.collection.on('reset', this.addAll, this);
        selfobj.render();
      },
  
      getColumnData: function(){
        var selfobj = this;
        this.dynamicFormDatas.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler, type: 'post', data: { "pluginId": this.menuId }
        }).done(function (res) {
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
            if (res.metadata && res.metadata.trim() != '') {
                selfobj.metadata  = JSON.parse(res.metadata);
            } 
            if (res.c_metadata && res.c_metadata.trim() != '') {
                selfobj.c_metadata  = JSON.parse(res.c_metadata);
                selfobj.arrangedColumnList = selfobj.c_metadata;
            }
          selfobj.getModuleData();
          selfobj.render();
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
  
      events:
      {
        "blur #textval": "setFreeText",
        "change .range": "setRange",
        "change #textSearch": "settextSearch",
        "click .multiOptionSel": "multioption",
        "click .filterSearch": "filterSearch",
        "click #filterOption": "filterRender",
        "click .resetval": "resetSearch",
        "click .loadview": "loadSubView",
        "change .txtchange": "updateOtherDetails",
        "click .changeStatus": "changeStatusListElement",
        "click .showpage": "loadData",
        "change .dropval": "singleFilterOptions",
        "click .arrangeColumns": "openColumnArrangeModal",
        "click .downloadReport": "downloadReport",
        'mousedown .table-resizable .resize-bar': 'onMouseDown',
        'mousemove .table-resizable th, .table-resizable td': 'onMouseMove',
        'mouseup .table-resizable th, .table-resizable td': 'onMouseUp',
        'dblclick .table-resizable thead': 'resetColumnWidth'
      },
      onMouseDown: function (event) {
        let index = $(event.target).parent().index();
        this.$handle = this.$el.find('th').eq(index);
        this.pressed = true;
        this.startX = event.pageX;
        this.startWidth = this.$handle.width();
        this.$table = this.$handle.closest('.table-resizable').addClass('resizing');
      },
      onMouseMove: function (event) {
        if (this.pressed) {
          this.$handle.width(this.startWidth + (event.pageX - this.startX));
        }
      },
      onMouseUp: function () {
        if (this.pressed) {
          this.$table.removeClass('resizing');
          this.pressed = false;
        }
      },
      resetColumnWidth: function () {
        // Reset column sizes on double click
        this.$el.find('th').css('width', '');
      },
  
  
      downloadReport: function (e) {
        e.preventDefault();
        let type = $(e.currentTarget).attr("data-type");
        var newdetails = [];
        newdetails["type"] = type;
        filterOption.set(newdetails);
        let form = $("#reports");
        form.attr({
            action: APIPATH + "companyReports",
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
      }, 
      
      updateOtherDetails: function (e) {
        var valuetxt = $(e.currentTarget).val();
        var toID = $(e.currentTarget).attr("id");
        var newdetails = [];
        newdetails["" + toID] = valuetxt;
        filterOption.set(newdetails);
      },
  
      settextSearch: function (e) {
        var usernametxt = $(e.currentTarget).val();
        filterOption.set({ textSearch: usernametxt });
      },
      
      changeStatusListElement: function (e) {
        var selfobj = this;
        var removeIds = [];
        var status = $(e.currentTarget).attr("data-action");
        var action = "changeStatus";
        $('#companyList input:checkbox').each(function () {
          if ($(this).is(":checked")) {
            removeIds.push($(this).attr("data-infoID"));
          }
        });
  
        $(".action-icons-div").hide();
        $(".memberlistcheck").click(function () {
          if ($(this).is(":checked")) {
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
          url: APIPATH + 'companyMaster/status',
          method: 'POST',
          data: { list: idsToRemove, action: action, status: status },
          datatype: 'JSON',
          beforeSend: function (request) {
            //$(e.currentTarget).html("<span>Updating..</span>");
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
              selfobj.filterSearch();
            }
            setTimeout(function () {
              $(e.currentTarget).html(status);
            }, 3000);
  
          }
        });
      },
  
      onErrorHandler: function (collection, response, options) {
        alert("Something was wrong ! Try to refresh the page or contact administer. :(");
        $(".profile-loader").hide();
      },
  
      loadSubView: function (e) {
        var selfobj = this;
        var show = $(e.currentTarget).attr("data-view");
        switch (show) {
          case "singleCompanyData": {
            var infoID = $(e.currentTarget).attr("data-infoID");
            new companySingleView({ infoID: infoID, searchCompany: this,menuId:this.menuId,form_label:selfobj.form_label});
            break;
          }
        }
      },
      resetSearch: function () {
        filterOption.clear().set(filterOption.defaults);
        $(".multiOptionSel").removeClass("active");
        $("#textval").val("");
        $("#textSearch").val("select");
        $(".filterClear").val("");
        $(".valChange").val("");
        $(".ws-select").val('default');
        $(".ws-select").selectpicker("refresh");
        $(".form-line").removeClass("focused");
        $('#textSearch option[value=infoID]').attr('selected', 'selected');
        this.filterSearch(false);
        let filterOptionLi = document.getElementById('filterOption');
        let taskBadgeSpan = filterOptionLi.querySelector('span.taskBadge');
        if (taskBadgeSpan) {
          taskBadgeSpan.remove();
        }
      },
      loaduser: function () {
        var memberDetails = new singlememberDataModel();
      },
      addOne: function (objectModel) {
        var selfobj = this;
        var template = _.template(companyRow);
        if(selfobj.arrangedColumnList){
          selfobj.arrangedColumnList.forEach((column) => {
            if (column.fieldType == 'Datepicker' || column.fieldType == 'Date') {
              if (objectModel.attributes["" + column.column_name] != "0000-00-00") {
                var dueDateMoment = moment(objectModel.attributes["" + column.column_name]);
                if(column.dateFormat != "" && column.dateFormat != null && column.dateFormat != "undefined"){
                  objectModel.attributes[""+column.column_name] = dueDateMoment.format(column.dateFormat);
                }else{
                  objectModel.attributes[""+column.column_name] = dueDateMoment.format("DD-MM-YYYY");
                }
              }
              else {
                objectModel.attributes["" + column.column_name] = "-"
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
        }
        $("#companyList").append(template({ companyDetails: objectModel,arrangedColumnList:this.arrangedColumnList }));
      },
      addAll: function () {
        $("#companyList").empty();
        this.collection.forEach(this.addOne, this);
      },
      filterRender: function (e) {
        var selfobj = this;
        var isexits = checkisoverlay(this.toClose);
        if (!isexits) {
          var source = companyFilterOption_temp;
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
                $(".popupLoader").hide();
                if(res.data[0]){
                  for (var i = 0; i < res.data[0].sublist.length; i++) {
                    matcchedID.push(res.data[0].sublist[i].categoryName);
                  }
                  column.fieldOptions = matcchedID.join(',');
                }
              });
            }else{
               column.fieldOptions = column.fieldOptions; 
            }
          });
          const filteredFields = extractedFields.filter(item => item.fieldID != "" && item.fieldID != null && item.fieldID != undefined);
          selfobj.filteredFields = filteredFields;
  
          setTimeout(function () { 
            var templateData = {
                filteredFields: selfobj.filteredFields || [],
              };
              cont.html(template(templateData));
              $(".ws-select").selectpicker();
              selfobj.setupFilter();
          }, 1000);
  
          cont.attr('id', this.toClose);
          /*  l
            INFO
            this line use to hide if any other overlay is open first close it.
          */
          $(".overlay-main-container").removeClass("open");
          // append filter html here
          $(".ws_filterOptions").append(cont);
          /*  
            INFO
            open filter popup by adding class open here
          */
          $(".ws_filterOptions").addClass("open");
          $(".ws-select").selectpicker();
          $(e.currentTarget).addClass("active");
  
        } else {
          // check here we alreay open it or not. if open toggle that popup here
          var isOpen = $(".ws_filterOptions").hasClass("open");
          if (isOpen) {
            $(".ws_filterOptions").removeClass("open");
            $(e.currentTarget).removeClass("active");
            return;
          } else {
            $(e.currentTarget).addClass("active");
            // this function will handel other exiting open popus
          }
        }
        this.setValues();
        // this.setupFilter();
        rearrageOverlays("Filter", this.toClose, "small");
      },
      setValues: function (e) {
        setvalues = ["status", "orderBy", "order"];
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
      multioption: function (e) {
        var selfobj = this;
        var issinglecheck = $(e.currentTarget).attr("data-single");
        if (issinglecheck == undefined) { var issingle = "N" } else { var issingle = "Y" }
        if (issingle == "Y") {
          var newsetval = [];
          var classname = $(e.currentTarget).attr("class").split(" ");
          newsetval["" + classname[0]] = $(e.currentTarget).attr("data-value");
          filterOption.set(newsetval);
  
        }
        if (issingle == "N") {
          setTimeout(function () {
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
            filterOption.set(objectDetails);
          }, 500);
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
  
          //$(".page-info").html(recset);
          if (res.loadstate === false) {
            $(".profile-loader-msg").html(res.msg);
            $(".profile-loader-msg").show();
          } else {
            $(".profile-loader-msg").hide();
          }
  
          selfobj.setValues();
        });
  
        if (appliedFilterCount > 0) {
          document.getElementById('filterOption').classList.add('active');
        } else {
          document.getElementById('filterOption').classList.remove('active');
        }
  
        let filterOptionLi = document.getElementById('filterOption');
        let taskBadgeSpan = filterOptionLi.querySelector('span.taskBadge');
        if (taskBadgeSpan) {
          taskBadgeSpan.remove();
        }
        if (appliedFilterCount != 0) {
          let url = "<span class='badge bg-pink taskBadge'>" + appliedFilterCount + "</span>"
          document.getElementById('filterOption').innerHTML += url;
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
  
            $(".profile-loader").hide();
            if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
  
            setPagging(res.paginginfo, res.loadstate, res.msg);
            $element.attr("data-currPage", index);
            $element.attr("data-index", res.paginginfo.nextpage);
          });
        }
      },
  
      openColumnArrangeModal: function (e) {
        let selfobj = this;
        var show = $(e.currentTarget).attr("data-action");
        var stdColumn = [];
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
                new configureColumnsView({menuId: this.menuId,ViewObj: selfobj,stdColumn:stdColumn});
                $(e.currentTarget).addClass("BG-Color");
              }
            break;
          }
        }
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
                    var selectOptions = column.fieldOptions.split(",");
                    var template = _.template(linkedDropdown);
                    var existingElement = linkedClassElement.find('#field_' + column.fieldID);
                    if (existingElement.length == 0) {
                        linkedClassElement.append(template({ elementDetails: column, selectOptions: selectOptions, elementData: filterOption.attributes }));
                    }
                }
            }
          });
  
          $('.valChange').unbind();
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
            if ($(e.currentTarget).hasClass("selected")) {
              $(e.currentTarget).removeClass("selected");
            } else {
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
  
      singleFilterOptions: function (e) {
        e.stopPropagation();
        var toID = $(e.currentTarget).attr("id");
        var valuetxt = $(e.currentTarget).val().join(",");
        var newdetails = [];
        newdetails["" + toID] = valuetxt;
        filterOption.set(newdetails);
      },
  
      render: function () {
        var selfobj = this;
        var template = _.template(company_temp);
        this.$el.html(template({ closeItem: this.toClose,"pluralLable":selfobj.plural_label,"moduleDesc":selfobj.module_desc,"arrangedColumnList": selfobj.arrangedColumnList, formLabel: selfobj.form_label || '',}));
        var numColumns = selfobj.arrangedColumnList ? selfobj.arrangedColumnList.length : 0;
        var defaultWidth = numColumns <= 5 ? '100%' : (numColumns * 25) + '%';
        $("#clist").css("width", defaultWidth);
        $(".app_playground").append(this.$el);
        setToolTip();
        $(".profile-loader").hide();
        $(".ws-select").selectpicker();
        return this;
      }
    });
  
    return companyView;
  
  });
  