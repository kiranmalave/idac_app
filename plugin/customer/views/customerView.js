
define([
  'jquery',
  'underscore',
  'backbone',
  'datepickerBT',
  'moment',
  'Swal',
  '../views/customerSingleView',
  '../views/customerNotesView',
  '../../core/views/mailView',
  '../views/customerActivityView',
  '../../task/views/taskSingleView',
  '../collections/customerCollection',
  '../collections/customerNotesCollection',
  '../collections/countryCollection',
  '../collections/stateCollection',
  '../collections/cityCollection',
  '../models/customerFilterOptionModel',
  '../models/customerSingleModel',
  '../models/customerNoteModel',
  '../../core/views/appSettings',
  '../../core/views/columnArrangeModalView',
  '../../core/views/configureColumnsView',
  '../../dynamicForm/collections/dynamicFormDataCollection',
  '../../menu/models/singleMenuModel',
  '../../category/collections/slugCollection',
  "../../emailMaster/collections/emailMasterCollection",
  '../../core/views/timeselectOptions',
  'text!../templates/customerRow.html',
  'text!../templates/leadGridRow.html',
  'text!../templates/customer_temp.html',
  'text!../templates/customerFilterOption_temp.html',
  'text!../../dynamicForm/templates/linkedDropdown.html',
  '../../core/views/notificationView',
  '../views/escalationView',
  "../../admin/collections/adminCollection",
  '../../core/views/moduleDefaultSettings',
  'text!../templates/leadModernView.html',
  'text!../templates/customerGridTemp.html',
], function ($, _, Backbone, datepickerBT, moment, Swal, customerSingleView, customerNotesView, mailView, customerActivityView, taskSingleView, customerCollection, customerNotesCollection, countryCollection, stateCollection, cityCollection, customerFilterOptionModel, customerModel, customerNoteModel, appSettings, columnArrangeModalView, configureColumnsView, dynamicFormData, singleMenuModel, slugCollection, emailMasterCollection, timeselectOptions, customerRowTemp, leadGridRow, customerTemp, customerFilterTemp, linkedDropdown, notificationView,escalationView,adminCollection,moduleDefaultSettings,leadModernView,customerGridTemp) {
  var customerView = Backbone.View.extend({
    plural_label: '',
    module_desc: '',
    form_label: '',
    mname: '',
    listDataGrid: [],
    paginginfo: [],
    View: '',
    module_name: 'customer',
    isdataupdated:false,
    customerModel: customerModel,
    filteredSearch : false,
    
    initialize: function (options) {
      this.startX = 0;
      this.startWidth = 0;  
      this.userSettings = {};
      this.$handle = null;
      this.$table = null;
      this.pressed = false;
      this.toClose = "customerFilterView";
      var selfobj = this;
      this.filteredData = [];
      this.arrangedColumnList = [];
      this.filteredFields = [];
      this.totalColumns = 0;
      this.tableStructure = {},
      $(".profile-loader").show();
      $(".customMail").hide();
      $(".customMailMinimize").hide();
      $(".opercityBg").hide();
      $(".loder").show();
      $('.customMail').remove('maxActive');
      $(".maxActive").hide();
      this.mname = Backbone.history.getFragment();
      permission = ROLE[this.mname];
      this.menuId = permission.menuID;
      this.paginginfo = [],
      this.appSettings = new appSettings();
      this.dynamicFormDatas = new dynamicFormData();
      this.timeselectOptions = new timeselectOptions();
      this.menuList = new singleMenuModel();
      this.moduleDefaultSettings = new moduleDefaultSettings();
      searchCustomer = new customerCollection();
      this.collection = new customerCollection();
      this.stateList = new stateCollection();
      this.cityList = new cityCollection();
      this.appSettings.getMenuList(this.menuId, function (plural_label, module_desc, form_label, result) {
        selfobj.plural_label = plural_label;
        selfobj.module_desc = module_desc;
        selfobj.form_label = form_label;
        readyState = true;
        selfobj.getColumnData();
        if (result.data[0] != undefined) {
          selfobj.tableName = result.data[0].table_name;
        }
      });
      this.totalRec = 0;
      filterOption = new customerFilterOptionModel();

      this.customerModel = new customerNoteModel();
      if (this.mname == "leads") {
        filterOption.set({ type: "lead" });
      } else if (this.mname == "customer") {
        filterOption.set({ type: "customer" });
      }
      this.categoryList = new slugCollection();
      this.categoryList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y', slug: 'lead_stages' }
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        $('body').find(".loder").hide();
        selfobj.setStageColor();
      });

      this.countryList = new countryCollection();
      this.countryList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { getAll: 'Y' }
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        $('body').find(".loder").hide();
        selfobj.render();
        // $(".profile-loader").hide();
      });

      selfobj.emailMasterList = new emailMasterCollection();
      selfobj.emailMasterList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, data: { getAll: 'Y', status: 'active' }
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        selfobj.render();
      });

      this.adminList = new adminCollection();
      this.adminList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y' }
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".profile-loader").hide();
      });

      filterOption.set({ "menuId": this.menuId });
      this.collection.on('add', this.addOne, this);
      this.collection.on('reset', this.addAll, this);
      selfobj.render();
    },

    getColumnData: function () {
      var selfobj = this;
      this.dynamicFormDatas.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { "pluginId": this.menuId }
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        if (res.metadata && res.metadata.trim() != '') {
          selfobj.metadata = JSON.parse(res.metadata);
        }
        if (res.c_metadata && res.c_metadata.trim() != '') {
          selfobj.c_metadata = JSON.parse(res.c_metadata);
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
        selfobj.getModuleData();
        selfobj.render();
      });
    },

    getModuleData: function () {
      var selfobj = this;
      var $element = $('#loadMember');
      this.collection.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: filterOption.attributes
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".profile-loader").hide();
        res.paginginfo.loadFrom = selfobj.toClose;
        setPagging(res.paginginfo, res.loadstate, res.msg);
      });

    },

    setStageColor: function(){   
      var selfobj = this;  
      var stageColor;
      this.categoryList.models.forEach(function(element) {
        element.attributes.sublist.forEach(function(list){
          stageColor = setColor(list.cat_color);
          list.font_color = selfobj.invertHex(list.cat_color);
          list.cat_color_light = stageColor;
        })
      });
    },
    
    invertHex: function(hex) {
      if (!hex || hex === "") {
        return '#000000'; // Return black for null or empty input
      }
      // Remove the '#' character if it exists
      hex = hex.replace('#', '');
      
      // Convert hex to RGB
      var r = parseInt(hex.substring(0, 2), 16);
      var g = parseInt(hex.substring(2, 4), 16);
      var b = parseInt(hex.substring(4, 6), 16);
      
      // Calculate brightness
      var brightness = (r * 0.299) + (g * 0.587) + (b * 0.114);
      
      // Determine which color to use based on brightness
      var invertedColor;
      if (brightness > 128) {
          invertedColor = '#000000'; 
      } else {
          invertedColor = '#FFFFFF';
      }
      
      return invertedColor;
  },
  
  // Example usage
  // var hexColor = "#ff0000"; // Red color
  // var invertedColor = invertHex(hexColor);

    events:
    {
      "blur #textval": "setFreeText",
      "change .range": "setRange",
      "change #textSearch": "settextSearch",
      "click .multiOptionSel": "multioption",
      "click .filterSearch": "filteredSearches",
      "click #filterOption": "filterRender",
      "click .resetval": "resetSearch",
      "click .loadview": "loadSubView",
      "change .txtchange": "updateOtherDetails",
      "click .changeStatus": "changeStatusListElement",
      "click .showpage": "loadData",
      "change .changeBox": "changeBox",
      "click .arrangeColumns": "openColumnArrangeModal",
      "click .markAsCust": "markCutomer",
      // "click .ccBtn": "openComposeMail",
      // "click .bccBtn": "displayList",
      "click .close": "mailHide",
      "click .minimize": "minimize",
      "click .openFull": "maximize",
      "click .showMax": "showmax",
      "click .changeStatusGrid": "changeStatusGrid",
      "click .sortColumns": "sortColumn",
      "change .dropval": "singleFilterOptions",
      "click .downloadReport": "downloadReport",
      'mousedown .table-resizable .resize-bar': 'onMouseDown',
      'mousemove .table-resizable th': 'onMouseMove',
      'mouseup .table-resizable th': 'onMouseUp',
      "change .countryChange": "setCountry",
      "change .selectState": "setState",
      "input .cityChange": "getCity",
      "click .selectCity": "setCity",
      "mouseover .customerRow" :"handleMouseHover",
      "mouseleave .customerRow" :"handleMouseLeave",
      "click .listViewBtn" : "showViewList",
      "click .setViewMode" : "setViewMode",
      "click .listSortColumns" : "showListSortColumns",
      "click .memberlistcheck" : "memberListCheck",
    },
   
    memberListCheck: function(e) {
      // console.log("memberlistcheck...", $(e.currentTarget).prop("checked"));
      var allChecked = true;
      $(".memberlistcheck").each(function() {
        if (!$(this).prop("checked")) {
          allChecked = false;
          return false;
        }
      });
      if (allChecked) {
        $(".checkall").prop("checked", true);
      } else {
        $(".checkall").prop("checked", false);
      }
    }, 

    setCountry: function (e) {
      e.stopPropagation();
      let selfobj = this;
      var country_id = $(e.currentTarget).val();
      filterOption.set({ country_id: country_id });
      if(country_id != "" && country_id != null){
        this.toClose = false;
        this.stateList.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler, type: 'post', data: { getAll: 'Y', country: country_id }
        }).done(function (res) {
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          $(".popupLoader").hide();
          selfobj.filterRender(e, true);
        });
      }
    },

    setState: function (e) {
      e.stopPropagation();
      let selfobj = this;
      var state_id = $(e.currentTarget).val();
      filterOption.set({ state_id: state_id });
      this.toClose = false;
      this.cityList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { getAll: 'Y', state: state_id }
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        selfobj.filterRender(e, true);
      });
    },

    showViewList: function (e) {
      $(".showListView").toggle();
    },

    showListSortColumns: function (e) {
      e.preventDefault();
      var $target = $(e.currentTarget);
      var $showSortOptions = $target.siblings('.showSortOptions');
      var $allSortOptions = $('.showSortOptions'); 
      var $allSortingBtns = $('.sortingBtn');
      if ($showSortOptions.is(':visible')) {
        $showSortOptions.hide();
        $target.closest('.sortingBtn').css("visibility", 'hidden');
      } else {
        $allSortOptions.hide();
        $allSortingBtns.css("visibility", 'hidden');
        $showSortOptions.show();
        $target.closest('.sortingBtn').css("visibility", 'visible');
      }
    },
    
    setViewMode: function(e){
      let selfobj = this;
      var View = $(e.currentTarget).val();
      var isOpen = $(".ws_ColumnConfigure").hasClass("open");
      if (isOpen) {
        $(".ws_ColumnConfigure").removeClass("open");
      }
      selfobj.moduleDefaultSettings.setModuleDefaultView(selfobj.menuId,View,selfobj.tableStructure);
      if(localStorage.getItem('user_setting') && localStorage.getItem('user_setting').length > 15){
        selfobj.userSettings = JSON.parse(localStorage.getItem('user_setting'));
      }else{
        selfobj.userSettings = {};
      }
      if(View != "grid"){
        selfobj.defaultViewSet();
      }else if (View == "grid") {
        $("#leadgridview").show();
        $("#leadlistview").hide();
        $("#modernlistview").hide();
        $(".list_mode").removeAttr("disabled")
        $(".grid_mode").attr('disabled', 'disabled');
        $(".modernlist_mode").removeAttr("disabled")
        $(".hide").hide();
        $(".showListView").toggle();
        selfobj.collection.reset();
        selfobj.View = "grid";
        selfobj.gridLazyLoad(listgridID = "", firstLoad = true);
        selfobj.setupDropable();
        selfobj.setupSortable();
        if(selfobj.mname == 'leads'){
          selfobj.leadCanbanSlider();
        }
      }
    },

    filteredSearches:function(e){
      // console.log("filteredSearches");
      var selfobj = this;
      selfobj.filteredSearch = true;
      selfobj.filterSearch();
    },
    
    onMouseDown: function (event) {
      var selfobj = this;
      let index = $(event.target).parent().index();
      this.$handle = this.$el.find('th').eq(index);
      this.pressed = true;
      this.startX = event.pageX;
      this.startWidth = this.$handle.width();
      this.$table = this.$handle.closest('.table-resizable').addClass('resizing');
    },

    onMouseMove: function (event) {
      var selfobj = this;
      if (this.pressed) {
        let index = this.$handle.index();
        let currentWidth = this.startWidth + (event.pageX - this.startX);
        currentWidth = Math.max(currentWidth, 100);
        this.$handle.width(currentWidth);
        this.widthChange = currentWidth - this.startWidth;
        let $currentColumn = this.$el.find('th').eq(index);
        let fieldLabel = $currentColumn.contents().filter(function() {
            return this.nodeType === 3;
        }).text().trim();
        let fieldLabelLength = fieldLabel.length;
        let minWidth = fieldLabelLength + 140;
        // console.log("currentColumn width...",$currentColumn.width());
        $currentColumn.css('min-width', minWidth + 'px');
        $currentColumn.css('max-width', '640px');
      }
    },
  
    onMouseUp: function (event) {
      if (this.pressed) {
        this.$table.removeClass('resizing');
        this.pressed = false;
      }
      var selfobj = this;
      let tableName = $(event.currentTarget).closest('table').attr('id');
   
      if (tableName) {
          var $table = $('#' + tableName);
          var currentTableWidth = $table.width();
          if(this.widthChange){
            var newTableWidth = currentTableWidth + (this.widthChange);
          }else{
            var newTableWidth = currentTableWidth;
          }
          $table.width(newTableWidth);
      } else {
          console.log("Table name not found.");
      }
     
      if(newTableWidth < 910){
        tableName.css('width', '910px');
      }
   
      $('#'+tableName + ' thead th').each(function() {
        var datacolumn = $(this).attr('data-column');
        var styleWidth = this.style.width;
        var styleMinWidth = this.style.minWidth;
        var width = parseFloat(styleWidth);
        var minWidth = parseFloat(styleMinWidth);
        if(width < minWidth){
          width = minWidth;
        }else{
          width = width;
        }
        let columnObj = {};
        if(datacolumn){
          columnObj['tableWidth'] = newTableWidth;
          columnObj[datacolumn] = width;
          if (!selfobj.tableStructure[tableName]) {
            selfobj.tableStructure[tableName] = columnObj;
          } else {
            Object.assign(selfobj.tableStructure[tableName], columnObj);
          }
        }
      });
      
      selfobj.moduleDefaultSettings.setModuleDefaultView(selfobj.menuId, selfobj.View, selfobj.tableStructure);
    },

    downloadReport: function (e) {
      e.preventDefault();
      let type = $(e.currentTarget).attr("data-type");
      var newdetails = [];
      newdetails["type"] = type;
      filterOption.set(newdetails);
      let form = $("#reports");
      form.attr({
        action: APIPATH + "customerReports",
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

    // downloadReport:function(e){
    //   e.preventDefault();
    //   let type = $(e.currentTarget).attr("data-type");
    //   var newdetails = [];
    //   newdetails["type"] = type;
    //   filterOption.set(newdetails);
    //   let from = $("#reports");
    //   let dataInput = $("<input>")
    //     .attr("type", "hidden")
    //     .attr("name", "data")
    //     .val(JSON.stringify(filterOption));
    //   from.attr({
    //     id: "receiptsData",
    //     action: APIPATH + "customerReports",
    //     method: "POST",
    //     target: "_blank",
    //   }).append(dataInput);
    //   filterOption.clear('type');
    //   from.submit();
    // },

    sortColumn: function (e) {
      e.stopPropagation();
      var order = $(e.currentTarget).attr("data-value");
      var selfobj = this;
      var newsetval = [];
      if(selfobj.View == 'traditionalList'){
        $("#clist").find(".listSortColumnUp").removeClass("selected");
        $("#clist").find(".listSortColumnDown").removeClass("selected");
        $("#clist").find(".up").removeClass("active");
        $("#clist").find(".down").removeClass("active");
      }else{
        $("#custModernList").find(".listSortColumnUp").removeClass("selected");
        $("#custModernList").find(".listSortColumnDown").removeClass("selected");
        $("#custModernList").find(".up").removeClass("active");
        $("#custModernList").find(".down").removeClass("active");
      }
      newsetval["order"] = $(e.currentTarget).attr("data-value");
      newsetval["orderBy"] = $(e.currentTarget).attr("data-field");
      if (order == "DESC") {
        $(e.currentTarget).closest('th').find(".clearSorting").removeAttr("disabled")
        $(e.currentTarget).closest('th').find(".sortarrow.down").addClass("active");
        $(e.currentTarget).closest('th').find(".listSortColumnDown").addClass("selected");
        newsetval["order"] = order;
        newsetval["orderBy"] = $(e.currentTarget).attr("data-field");
      } else if (order == "ASC") {
        $(e.currentTarget).closest('th').find(".clearSorting").removeAttr("disabled")
        $(e.currentTarget).closest('th').find(".sortarrow.up").addClass("active");
        $(e.currentTarget).closest('th').find(".listSortColumnUp").addClass("selected");
        newsetval["order"] = order;
        newsetval["orderBy"] = $(e.currentTarget).attr("data-field");
      } else{
        $(e.currentTarget).closest(".clearSorting").attr('disabled', 'disabled');
        newsetval["order"] = 'DESC';
        newsetval["orderBy"] = 't.created_date';
      }
      filterOption.set(newsetval);
      selfobj.filterSearch();
    },

    mailHide: function (e) {
      $(".customMail").hide();
      $(".customMailMinimize").hide();
      $(".opercityBg").hide();
      var ele = document.querySelector(".customMail");
      ele.classList.remove("maxActive");
      $('.openFull').remove('maxActive');
    },

    minimize: function () {
      $(".customMail").hide();
      $(".customMailMinimize").show();
      $(".opercityBg").hide();
      $('.openFull').addClass('maxActiveRemove');
      var ele = document.querySelector(".customMail");
      ele.classList.remove("maxActive");
      $(".maxActive").hide();
    },

    maximize: function () {
      $(".opercityBg").show();
      $(".customMail").show();
      $(".customMailMinimize").hide();
      $('.customMail').addClass('maxActive');
      $('.openFull').remove('maxActive');
      $(".closeFull").show();
      $('.openFull').remove('maxActiveRemove');
    },

    gridLazyLoad: function (listgridID) {
      let selfobj = this;
      if (listgridID == "") {
        if(selfobj.isdataupdated || selfobj.listDataGrid.length == 0){
          var isFilter = false;
          if(filterOption.get("stages") != null){
            isFilter = true;
          }
          $.each(this.categoryList.models, function (index, value) {
            $.each(value.attributes.sublist, function (index2, value2) {
              if(!isFilter){
                filterOption.set({stages:value2.category_id});
                  selfobj.listDataGrid[value2.category_id] = new customerCollection();
                  selfobj.listDataGrid[value2.category_id].fetch({
                    headers: {
                      'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
                    }, error: selfobj.onErrorHandler, type: 'post', data: filterOption.attributes
                  }).done(function (res) {
                    if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
                    $(".profile-loader").hide();
                    selfobj.paginginfo = res.paginginfo;
                    selfobj.setGridPagging(selfobj.paginginfo,value2.category_id);
                    selfobj.addAllGrid(value2.category_id);
                  });
                $("#leadlistview").hide();
                $("#modernlistview").hide();
              }else{
                if(filterOption.get("stages") == value2.category_id && filterOption.get("stages") !=0){
                  
                  selfobj.listDataGrid[value2.category_id] = new customerCollection();
                  selfobj.listDataGrid[value2.category_id].fetch({
                    headers: {
                      'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
                    }, error: selfobj.onErrorHandler, type: 'post', data: filterOption.attributes
                  }).done(function (res) {
                    if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
                    $(".profile-loader").hide();
                    selfobj.paginginfo = res.paginginfo;
                    selfobj.setGridPagging(selfobj.paginginfo);
                    selfobj.addAllGrid(value2.category_id,value2.category_id);
                  });
                  $("#leadlistview").hide();
                  $("#modernlistview").hide();
                }else{
                  selfobj.listDataGrid[value2.category_id] = new customerCollection();
                  selfobj.addAllGrid(value2.category_id);
                }
                
              }
            });
          });
          
          filterOption.set({ stages: "other" });
          selfobj.listDataGrid[0] = new customerCollection();
          selfobj.listDataGrid[0].fetch({
            headers: {
              'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
            }, error: selfobj.onErrorHandler, type: 'post', data: filterOption.attributes
          }).done(function (res) {
            if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
            $(".profile-loader").hide();
            selfobj.paginginfo = res.paginginfo;
            selfobj.addAllGrid(0);
            filterOption.set({ stages:null});
          });
          selfobj.isdataupdated = false;
        }
      } else {
        filterOption.set({ stages: listgridID });
        if(selfobj.listDataGrid[listgridID]){
          filterOption.set({curpage: selfobj.listDataGrid[listgridID].pageinfo.nextpage});
          if(selfobj.listDataGrid[listgridID].loadstate){
            selfobj.listDataGrid[listgridID].fetch({
              headers: {
                'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
              }, error: selfobj.onErrorHandler, type: 'post', data: filterOption.attributes
            }).done(function (res) {
              if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
              $(".profile-loader").hide();
              selfobj.paginginfo = res.paginginfo;
              selfobj.setGridPagging(selfobj.paginginfo, listgridID);
            });
            const isAddOneAdded = selfobj.listDataGrid[listgridID]._events && selfobj.listDataGrid[listgridID]._events.add && selfobj.listDataGrid[listgridID]._events.add.some(listener => listener.callback === this.addOne);
            if (isAddOneAdded) {
              // nothing to do.
            }else{
              selfobj.listDataGrid[listgridID].on('add', this.addOne, this);
              selfobj.listDataGrid[listgridID].on('reset', this.addAll, this);
            }
          }
        }
      }
    },

    setGridPagging: function(pagingInfo, stageID){
      $("#"+stageID).find('.gridPagging').empty();
      if(pagingInfo.end > pagingInfo.totalRecords){
        var paggingString = pagingInfo.totalRecords + " of " + pagingInfo.totalRecords;
      }else{
        var paggingString = pagingInfo.end + " of " + pagingInfo.totalRecords;
      }
      
      $("#"+stageID).find('.gridPagging').append(paggingString);

    },

    stageColumnUpdate: function (stage) {
      let selfobj = this;
      filterOption.set({ stages: stage });
      selfobj.listDataGrid[stage] = new customerCollection();
      selfobj.listDataGrid[stage].fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: filterOption.attributes
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".profile-loader").hide();
        selfobj.paginginfo = res.paginginfo;
        selfobj.addAllGrid(stage);
      });
      $('#' + stage).children().not(".totalCount").remove();
    },

    showmax: function () {
      $(".customMail").show();
      $(".customMailMinimize").hide();
      var ele = document.querySelector(".openFull");
      ele.classList.remove("maxActive");
      $('.openFull').remove('maxActiveRemove');
      $(".maxActive").hide();
    },

    updateOtherDetails: function (e) {
      var valuetxt = $(e.currentTarget).val();
      var toID = $(e.currentTarget).attr("id");
      var newdetails = [];
      newdetails["" + toID] = valuetxt;
      filterOption.set(newdetails);
    },

    openColumnArrangeModal: function (e) {
      let selfobj = this;
      var show = $(e.currentTarget).attr("data-action");
      // var stdColumn = ['customer_id','customer_name','company_name', 'name', 'email', 'mobile_no', 'record_type'];
      if(selfobj.mname == 'leads'){
        var stdColumn = ['customer_id','salutation','customer_image', 'latitude', 'longitude','customer_name'];
      }else{
        var stdColumn = ['customer_id','salutation','customer_image', 'latitude', 'longitude','customer_name','lead_source','stages'];
      }
     
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
            new configureColumnsView({ menuId: this.menuId, ViewObj: selfobj, stdColumn: stdColumn,menuName: selfobj.mname,viewMode: selfobj.View });
            $(e.currentTarget).addClass("BG-Color");
          }
          break;
        }
      }
    },

    changeBox: function (e) {
      var selVal = $(e.currentTarget).val();
      $(".hidetextval").hide();
      $(".filterClear").val("");
      filterOption.set({ textval: '' });
      if (selVal == "mobile_no") {
        $(".contacttxt").show();
      } else {
        $(".textval").show();
      }
    },

    settextSearch: function (e) {
      var usernametxt = $(e.currentTarget).val();
      filterOption.set({ textSearch: usernametxt });
    },

    markCutomer: function (e) {
      let selfobj = this;
      var id = $(e.currentTarget).attr("data-id");
      var status = "customer";
      Swal.fire({
        title: 'Are you sure you want to Mark as Customer?',
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: 'Confirm',
        denyButtonText: `Cancel`,
      }).then((result) => {
        if (result.isConfirmed) {
          if (id != "") {
            $.ajax({
              url: APIPATH + 'customerMaster/typeStatus',
              method: 'POST',
              data: { customerID: id, status: status },
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
                  selfobj.filterSearch();
                }
              }
            });
          }
        } else if (result.isDenied) {
          Swal.fire('Not Marked as Customer !!', '', 'info')
        }
      })

    },

    changeStatusListElement: function (e) {
      Swal.fire({
        title: 'Do you want to delete ?',
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: 'Make Inactive',
        denyButtonText: `Permanently Delete`,
      }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
          Swal.fire('Status changed to Inactive!!', '', 'success')

          var selfobj = this;
          var removeIds = [];
          var status = $(e.currentTarget).attr("data-action");
          var action = "changeStatus";
          if(selfobj.View == 'modernlist'){
            $('#modernList input:checkbox').each(function () {
              if ($(this).is(":checked")) {
                removeIds.push($(this).attr("data-customer_id"));
              }
            });
          }
          $('#customerList input:checkbox').each(function () {
            if ($(this).is(":checked")) {
              removeIds.push($(this).attr("data-customer_id"));
            }
          });
          $(".deleteAll").hide();
          $(".action-icons-div").hide();
          // $(".memberlistcheck").click(function () {
          //   if ($(this).is(":checked")) {
          //     $(".action-icons-div").show(300);
          //   } else {
          //     $(".action-icons-div").hide(200);
          //   }
          // });

          var idsToRemove = removeIds.toString();
          if (idsToRemove == '') {
            alert("Please select at least one record.");
            return false;
          }
          $.ajax({
            url: APIPATH + 'customerMaster/status',
            method: 'POST',
            data: { list: idsToRemove, action: action, status: status },
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

                selfobj.initialize(); 

              }
              selfobj.isdataupdated = true;

            }
          });
        } else if (result.isDenied) {
          var selfobj = this;
          var removeIds = [];
          var status = $(e.currentTarget).attr("data-action");
          var action = "changeStatus";
          if(selfobj.View == 'modernlist'){
            $('#modernList input:checkbox').each(function () {
              if ($(this).is(":checked")) {
                removeIds.push($(this).attr("data-customer_id"));
              }
            });
          }
          $('#customerList input:checkbox').each(function () {
            if ($(this).is(":checked")) {
              removeIds.push($(this).attr("data-customer_id"));
            }
          });
          var idsToRemove = removeIds.toString();
          if (idsToRemove == '') {
            alert("Please select at least one record.");
            return false;
          }
          var action = "changeStatus";
          $.ajax({
            url: APIPATH + 'customerMaster/delete',
            method: 'POST',
            data: { list: idsToRemove, action: action },
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

                selfobj.initialize(); 

              }
              selfobj.isdataupdated = true;

            }
          });
        }
      })
    },

    changeStatusGrid: function (e) {
      Swal.fire({
        title: 'Do you want to delete ?',
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: 'Yes',
        denyButtonText: `No`,
      }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
          Swal.fire('Deleted!', '', 'success')
          var custID = $(e.currentTarget).attr("data-customer_id");
          var selfobj = this;
          var removeIds = [];
          var status = $(e.currentTarget).attr("data-action");
          var action = "changeStatus";
          removeIds.push($(e.currentTarget).attr("data-customer_id"));
          $(".action-icons-div").hide();

          var idsToRemove = removeIds.toString();
          if (idsToRemove == '') {
            alert("Please select at least one record.");
            return false;
          }
          $.ajax({
            url: APIPATH + 'customerMaster/status',
            method: 'POST',
            data: { list: idsToRemove, action: action, status: status },
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
                $('#leadCard' + custID).remove();
              }
              setTimeout(function () {
                $(e.currentTarget).html(status);
              }, 3000);

            }
          });
        } else if (result.isDenied) {
          Swal.fire('Changes are not saved', '', 'info')
          $('#customerList input:checkbox').each(function () {
            if ($(this).is(":checked")) {
              $(this).prop('checked', false);
            }
          });
          $(".listCheckbox").find('.checkall').prop('checked', false);
          $(".deleteAll").hide();
        }
      })
    },

    onErrorHandler: function (collection, response, options) {
      alert("Something was wrong ! Try to refresh the page or contact administer. :(");
      $(".profile-loader").hide();
    },

    loadSubView: function (e) {
      var selfobj = this;
      var show = $(e.currentTarget).attr("data-view");
      $(".loder").show();
      $('#NoteModal').modal('hide');
      $('#activityModal').modal('hide');
      $(".customMail").hide();
      $(".overlay-main-container").removeClass("open");
      switch (show) {
        case "singleCustomerData": {
          var customer_id = $(e.currentTarget).attr("data-customer_id");
          new customerSingleView({ customer_id: customer_id, menuId: this.menuId, searchCustomer: this, menuName: this.mname, form_label: selfobj.form_label, loadfrom: "customer" });
          $('body').find(".loder");
          $(".profile-loader").hide();
          break;

        }
        case "notes": {
          $('#NoteModal').modal('toggle');
          var customer_id = $(e.currentTarget).attr("data-customer_id");
          var cust_name = $(e.currentTarget).attr("data-first_name");
          var stage_id = $(e.currentTarget).attr("data-stageid");
          new customerNotesView({ customer_id: customer_id, customerName: cust_name, stageID: stage_id, searchCustomer: this });
          $('body').find(".loder");
          break;
        }
        case "mail": {
          $(".customMail").show();
          $('.customMail').remove('maxActive');
          var customer_id = $(e.currentTarget).attr("data-customer_id");
          var cust_name = $(e.currentTarget).attr("data-first_name");
          var cust_mail = $(e.currentTarget).attr("data-custMail");
          new mailView({ customer_id: customer_id, customerName: cust_name, customer_mail: cust_mail });
          $('body').find(".loder");
          break;
        }
        case "history": {
          $('#activityModal').modal('toggle');
          var customer_id = $(e.currentTarget).attr("data-customer_id");
          var cust_name = $(e.currentTarget).attr("data-first_name");
          new customerActivityView({ customer_id: customer_id, customerName: cust_name });
          $('body').find(".loder");
          break;
        }
        case "task": {
          $('body').find(".loder");
          var customer_id = $(e.currentTarget).attr("data-customer_id");
          var cust_name = $(e.currentTarget).attr("data-first_name");
          new taskSingleView({ customer_id: customer_id, customerName: cust_name, loadFrom: "customer", searchtask: this, menuName:'task' });
          break;
        }
        
        case "notificationView": {
          var categoryList = [];
          new notificationView({ menuID: this.menuId, searchreceipt: this, module_name: this.module_name,categoryList:categoryList,filteredData : selfobj.filteredData });
          $('body').find(".loder");
          break;
        }
        case "escalationView": {
          var categoryList = [];
          new escalationView({ menuID: this.menuId, searchEscalation: this, module_name: this.module_name});
          $('body').find(".loder");
          break;
        }
      }


    },

    resetSearch: function () {
      let selfobj = this;
      filterOption.clear().set(filterOption.defaults);
      if (this.mname == "leads") {
        filterOption.set({ type: "lead" });
      } else if (this.mname == "customer") {
        filterOption.set({ type: "customer" });
      }
      $(".multiOptionSel").removeClass("active");
      $(".filterClear").val("");
      $("#textSearch").val("select");
      $(".valChange").val("");
      $(".ws-select").val('default');
      $(".ws-select").selectpicker("refresh");
      $(".form-line").removeClass("focused");
      $(".hidetextval").hide();
      $('#textSearch option[value=customer_id]').attr('selected', 'selected');
      this.filterSearch(false);
      filterOption.set({ "menuId": this.menuId });
      
      let filterOptionLi = document.getElementById('filterOption');
      let taskBadgeSpan = filterOptionLi.querySelector('span.taskBadge');
      if (taskBadgeSpan) {
        taskBadgeSpan.remove();
      }
      $(".down").removeClass("active");
      $(".up").removeClass("active");
      
    },

    loaduser: function () {
      var memberDetails = new singlememberDataModel();
    },

    addOne: function (objectModel) {
      var selfobj = this; 
      selfobj.totalRec = selfobj.collection.length;

      // console.log("selfobj.totalRec",selfobj.totalRec);

      if (selfobj.View == "traditionalList") {
        if (selfobj.totalRec == 0) {
          $("#leadlistview").hide();
          $(".noCustAdded").show();

        } else {
          $(".noCustAdded").hide();
          $("#leadlistview").show();
        }
      } else if (selfobj.View == "modernlist") {
        if (selfobj.totalRec == 0) {
          $(".noCustAdded").show();
          $("#modernlistview").hide();
        } else {
          $(".noCustAdded").hide();
          $("#modernlistview").show();
        }
      } else {
        $(".noCustAdded").hide();
        $("#leadlistview").hide();
        $("#modernlistview").hide();
      }
      selfobj.arrangedColumnList.forEach((column) => {
        if (column.fieldType == 'Datepicker' || column.fieldType == 'Date') {
          if (objectModel.attributes["" + column.column_name] != "0000-00-00" && objectModel.attributes["" + column.column_name] != null) {
            var dueDateMoment = moment(objectModel.attributes["" + column.column_name]);
            if (column.dateFormat != "" && column.dateFormat != null && column.dateFormat != "undefined") {
              objectModel.attributes["" + column.column_name] = dueDateMoment.format(column.dateFormat);
            } else {
              objectModel.attributes["" + column.column_name] = dueDateMoment.format("DD-MM-YYYY");
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
        if (column.column_name == 'created_by') {
          column.column_name = 'createdBy';
        } else if (column.column_name == 'modified_by') {
          column.column_name = 'modifiedBy';
        } else {
          column.column_name = column.column_name;
        }
        if(objectModel.attributes["" + column.column_name] == "" || objectModel.attributes["" + column.column_name] == null || objectModel.attributes["" + column.column_name] == undefined){
          objectModel.attributes["" + column.column_name] = "-";
        }
      });
      // alert(selfobj.View);
      if (selfobj.View == "traditionalList") {
        var template = _.template(customerRowTemp);
        objectModel.set({ "initial": selfobj.getInitials(objectModel.attributes.name) });
        objectModel.set({ "initialBgColor": selfobj.getColorByInitials(objectModel.attributes.initial) });
        objectModel.set({ "initialColor": selfobj.getFontColor(objectModel.attributes.initialBgColor) });
        $("#customerList").append(template({ customerDetails: objectModel, arrangedColumnList: this.arrangedColumnList, menuName: this.mname, menuID: this.menuId }));
      }else if (selfobj.View == "modernlist") {
        var template = _.template(leadModernView);
        objectModel.set({ "initial": selfobj.getInitials(objectModel.attributes.name) });
        objectModel.set({ "initialBgColor": selfobj.getColorByInitials(objectModel.attributes.initial) });
        objectModel.set({ "initialColor": selfobj.getFontColor(objectModel.attributes.initialBgColor) });
        $("#modernList").append(template({ customerDetails: objectModel, arrangedColumnList: this.arrangedColumnList, menuName: this.mname, menuID: this.menuId }));
       } else if(selfobj.View == "grid" && selfobj.mname == 'leads'){
        var template = _.template(leadGridRow);
        if (objectModel.attributes.stageID != 0 && objectModel.attributes.stageID != null && objectModel.attributes.stageID != "") {
          objectModel.set({ "lastActivityTime": selfobj.timeselectOptions.displayRelativeTime(objectModel.attributes.last_activity_date) });
          objectModel.set({ "initial": selfobj.getInitials(objectModel.attributes.name) });
          objectModel.set({ "assigneeInitial": selfobj.getInitials(objectModel.attributes.assignee) });
          objectModel.set({ "initialBgColor": selfobj.getColorByInitials(objectModel.attributes.initial) });
          objectModel.set({ "initialColor": selfobj.getFontColor(objectModel.attributes.initialBgColor) });
          $("#" + objectModel.attributes.stageID).append(template({ customerDetails: objectModel, customerLength: this.collection.length }));
        } else {
          objectModel.set({ "lastActivityTime": selfobj.timeselectOptions.displayRelativeTime(objectModel.attributes.last_activity_date) });
          objectModel.set({ "initial": selfobj.getInitials(objectModel.attributes.name) });
          objectModel.set({ "assigneeInitial": selfobj.getInitials(objectModel.attributes.assignee) });
          objectModel.set({ "initialBgColor": selfobj.getColorByInitials(objectModel.attributes.initial) });
          objectModel.set({ "initialColor": selfobj.getFontColor(objectModel.attributes.initialBgColor) });
          $("#otherStage").append(template({ customerDetails: objectModel, customerLength: this.collection.length }));
        }
        selfobj.setupDragable();
      }else if(selfobj.View == "grid" && selfobj.mname == 'customer'){
        var template = _.template(customerGridTemp);
        objectModel.set({ "lastActivityTime": selfobj.timeselectOptions.displayRelativeTime(objectModel.attributes.last_activity_date) });
        objectModel.set({ "initial": selfobj.getInitials(objectModel.attributes.name) });
        objectModel.set({ "initialBgColor": selfobj.getColorByInitials(objectModel.attributes.initial) });
        objectModel.set({ "initialColor": selfobj.getFontColor(objectModel.attributes.initialBgColor) });
        let sectionName = $("<div>",{
          class:"col-md-4 customerGridCard",
        });
        sectionName.append(template({ customerDetails: objectModel, customerLength: this.collection.length }));
        $("#customerGridRow1").append(sectionName);
      }
    },

    addAll: function () {
      let selfobj = this;
      $("#customerList").empty();
      $('#otherStage').children().not(".totalCount").remove();
      $("#modernList").empty();
      $("#customerGridRow1").empty();
      selfobj.collection.forEach(selfobj.addOne, selfobj);
    },

    addAllGrid: function (col_name) {
      $("#"+col_name).children().not('.totalCount').remove();
      let selfobj = this;
      selfobj.listDataGrid[col_name].models.forEach(element => {
        selfobj.addOne(element);
      });
    },
    
    filterRender: function (e, calledfrom) {
      
      var selfobj = this;
      $('.filterLoader').show();
      if (calledfrom){
        var isexits = false;
      }else{
        var isexits = checkisoverlay(this.toClose);
      }
      
      if (!isexits) {
        var source = customerFilterTemp;
        var template = _.template(source);
        var cont = $("<div>");
        const extractedFields = [];
        if (selfobj.metadata) {
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
        selfobj.categories = new slugCollection();
          selfobj.categories.fetch({
            headers: {
              'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
            }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y', slug: 'lead_stages,lead_source' }
          }).done(function (res) {
            if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
            $(".popupLoader").hide();
          });

        extractedFields.forEach(function (column) {
          // if (column.linkedWith != null && column.linkedWith != "" && column.linkedWith != 'undefined' && column.parentCategory != 'undefined' && column.parentCategory != "" && column.parentCategory != null) {
          //   selfobj.categoryList = new slugCollection();
          //   var matcchedID = [];
          //   selfobj.categoryList.fetch({
          //     headers: {
          //       'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          //     }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y', category_id: column.parentCategory }
          //   }).done(function (res) {
          //     if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          //     $(".popupLoader").hide();
          //     var child = [];
          //     if (res.data[0]) {
          //       for (var i = 0; i < res.data[0].sublist.length; i++) {
          //         child[0] = res.data[0].sublist[i].category_id;
          //         child[1] = res.data[0].sublist[i].categoryName;
          //         matcchedID.push(child.slice());
          //         // matcchedID.push(res.data[0].sublist[i].categoryName);
          //       }
          //       column.fieldOptions = matcchedID;
          //     }
          //   });
          // } else {
            column.fieldOptions = column.fieldOptions;
          // }
        });

        extractedFields.forEach(function (field) {
          selfobj.filteredFields.push(field);
        });
        setTimeout(function () {
          var templateData = {
            filteredFields: selfobj.filteredFields || [],
            "categoryList": selfobj.categories.models,
            "countryList": selfobj.countryList.models,
            "stateList": selfobj.stateList.models,
            "cityList":selfobj.cityList.models,
            "menuName": selfobj.mname,
            "adminList": selfobj.adminList.models || [],
            filterOptions: filterOption.attributes ,
          };
          cont.html(template(templateData));
          $(".ws-select").selectpicker();
          selfobj.setupFilter();
          $('.filterLoader').hide();
        }, 1000);

        cont.attr('id', this.toClose);
        /*  
          INFO
          this line use to hide if any other overlay is open first close it.
        */
        $(".overlay-main-container").removeClass("open");
        $(".ws_filterOptions").children().not(".filterLoader").empty();
        // append filter html here
        $(".ws_filterOptions").append(cont);
        /*  
          INFO
          open filter popup by adding class open here
        */
          setTimeout(function () {
            var country_id = filterOption.get("country_id");
            var state_id = filterOption.get("state_id");
            if( country_id != 0 && country_id != null && country_id != ""){
              $('#state_id').removeAttr("disabled");
              $('.stateChange').find('.btn.dropdown-toggle').removeClass("disabled");
            }
            if( state_id != 0 && state_id != null && state_id != ""){
              $('#city_id').removeAttr("disabled");
              $('.cityChange').find('.btn.dropdown-toggle').removeClass("disabled");
            }
          },2000);
        $(".ws_filterOptions").addClass("open");
        /* 
          INFO
          make current campaigns active
        */
        $(e.currentTarget).addClass("active");

      } else {
        // check here we alreay open it or not. if open toggle that popup here
        $('.filterLoader').hide();
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
      this.setupFilter();
      rearrageOverlays("Filter", this.toClose, "small");
    },

    setValues: function (e) {
      setvalues = ["status", "record_type", "order"];
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

    filterSearch: function (isClose = false, stage) {
      if (isClose && typeof isClose != 'object') {
        $('.' + this.toClose).remove();
        rearrageOverlays();
      }
      // if (this.View == "grid") {
      //   this.stageColumnUpdate(stage);
      //   return;
      // }
      this.collection.reset();
      var selfobj = this;
      readyState = true;
      filterOption.set({ curpage: 0 });
      filterOption.set({ menuId: this.menuId });
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
      if (this.View == "grid") {
        selfobj.isdataupdated = true;
        selfobj.gridLazyLoad("");
      }else{
        this.collection.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, add: true, remove: false, merge: false, error: selfobj.onErrorHandler, type: 'post', data: filterOption.attributes
        }).done(function (res) {
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          $(".profile-loader").hide();
          res.paginginfo.loadFrom = selfobj.toClose;
          setPagging(res.paginginfo, res.loadstate, res.msg);
          $element.attr("data-currPage", 1);
          $element.attr("data-index", res.paginginfo.nextpage);
          if (res.loadstate === false) {
            $(".profile-loader-msg").html(res.msg);
            $(".profile-loader-msg").show();
          } else {
            $(".profile-loader-msg").hide();
          }
          
          selfobj.totalRec = 0;
          selfobj.totalRec = res.paginginfo.totalRecords;
          // console.log("selfobj.totalRec",selfobj.totalRec);
          // console.log("selfobj.filteredSearch",selfobj.filteredSearch);

          if (selfobj.totalRec == 0 && selfobj.filteredSearch == true) {
            if (selfobj.View == "traditionalList") {
              $('#leadlistview').show();
              $('.noDataFound').show();
            }else if (selfobj.View == "modernlist") {
              $('#modernlistview').show();
              $('.noDataFound').show();
            }
          } else if (selfobj.totalRec == 0 && selfobj.filteredSearch == false) {
            $('.noCustAdded').show();
            if (selfobj.View == "traditionalList") {
              $('#leadlistview').hide();
            }else if (selfobj.View == "modernlist") {
              $('#modernlistview').hide();
            }
          } else if(selfobj.totalRec > 0){
            $('.noDataFound').hide();
            $(".noCustAdded").hide();
            if (selfobj.View == "traditionalList") {
              $('#leadlistview').show();
            }else if (selfobj.View == "modernlist") {
              $('#modernlistview').show();
            }
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
      }
    },

    loadData: function (e) {
      var selfobj = this;
      var $element = $('#loadMember');
      if ($(e.currentTarget).attr("data-loadfrom") != selfobj.toClose) {
        return;
      }
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
          res.paginginfo.loadFrom = selfobj.toClose;
          setPagging(res.paginginfo, res.loadstate, res.msg);
          $element.attr("data-currPage", index);
          $element.attr("data-index", res.paginginfo.nextpage);
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

    setupFilter: function () {
      var selfobj = this;
      startDate = $('#birthDateStart').datepickerBT({
        format: "dd-mm-yyyy",
        todayBtn: "linked",
        clearBtn: true,
        todayHighlight: true,
        StartDate: new Date(),
        numberOfMonths: 1,
        autoclose: true,
      }).on('changeDate', function (ev) {
        $('#birthDateStart').change();
        var valuetxt = $("#birthDateStart").val();
        var temp = moment(valuetxt, 'DD-MM-YYYY').valueOf();
        filterOption.set({ birthDateStart: valuetxt });
        var valuetxt = $("#birthDateEnd").val();
        var temp2 = moment(valuetxt, 'DD-MM-YYYY').valueOf();
        if (temp > temp2) {
          $("#birthDateEnd").val("");
        }
      });
      endDate = $('#birthDateEnd').datepickerBT({
        format: "dd-mm-yyyy",
        todayBtn: "linked",
        clearBtn: true,
        todayHighlight: true,
        numberOfMonths: 1,
        autoclose: true,
      }).on('changeDate', function (ev) {
        $('#birthDateEnd').change();
        var valuetxt = $("#birthDateEnd").val();
        var temp = moment(valuetxt, 'DD-MM-YYYY').valueOf();
        filterOption.set({ birthDateEnd: valuetxt });
        var valuetxt = $("#birthDateStart").val();
        var temp2 = moment(valuetxt, 'DD-MM-YYYY').valueOf();
        if (temp2 > temp) {
          $("#birthDateStart").val("");
        }
      });

      startDate = $('#createdDateStart').datepickerBT({
        format: "dd-mm-yyyy",
        todayBtn: "linked",
        clearBtn: true,
        todayHighlight: true,
        StartDate: new Date(),
        numberOfMonths: 1,
        autoclose: true,
      }).on('changeDate', function (ev) {
        $('#createdDateStart').change();
        var valuetxt = $("#createdDateStart").val();
        var temp = moment(valuetxt, 'DD-MM-YYYY').valueOf();
        filterOption.set({ createdDateStart: valuetxt });
        var valuetxt = $("#createdDateEnd").val();
        var temp2 = moment(valuetxt, 'DD-MM-YYYY').valueOf();
        if (temp > temp2) {
          $("#createdDateEnd").val("");
        }
      });
      endDate = $('#createdDateEnd').datepickerBT({
        format: "dd-mm-yyyy",
        todayBtn: "linked",
        clearBtn: true,
        todayHighlight: true,
        numberOfMonths: 1,
        autoclose: true,
      }).on('changeDate', function (ev) {
        $('#createdDateEnd').change();
        var valuetxt = $("#createdDateEnd").val();
        var temp = moment(valuetxt, 'DD-MM-YYYY').valueOf();
        filterOption.set({ createdDateEnd: valuetxt });
        var valuetxt = $("#createdDateStart").val();
        var temp2 = moment(valuetxt, 'DD-MM-YYYY').valueOf();
        if (temp2 > temp) {
          $("#createdDateStart").val("");
        }
      });

      startDate = $('#last_activityStart').datepickerBT({
        format: "dd-mm-yyyy",
        todayBtn: "linked",
        clearBtn: true,
        todayHighlight: true,
        StartDate: new Date(),
        numberOfMonths: 1,
        autoclose: true,
      }).on('changeDate', function (ev) {
        $('#last_activityStart').change();
        var valuetxt = $("#last_activityStart").val();
        var temp = moment(valuetxt, 'DD-MM-YYYY').valueOf();
        filterOption.set({ last_activityStart: valuetxt });
        var valuetxt = $("#last_activityEnd").val();
        var temp2 = moment(valuetxt, 'DD-MM-YYYY').valueOf();
        if (temp > temp2) {
          $("#last_activityEnd").val("");
        }
      });
      endDate = $('#last_activityEnd').datepickerBT({
        format: "dd-mm-yyyy",
        todayBtn: "linked",
        clearBtn: true,
        todayHighlight: true,
        numberOfMonths: 1,
        autoclose: true,
      }).on('changeDate', function (ev) {
        $('#last_activityEnd').change();
        var valuetxt = $("#last_activityEnd").val();
        var temp = moment(valuetxt, 'DD-MM-YYYY').valueOf();
        filterOption.set({ last_activityEnd: valuetxt });
        var valuetxt = $("#last_activityStart").val();
        var temp2 = moment(valuetxt, 'DD-MM-YYYY').valueOf();
        if (temp2 > temp) {
          $("#last_activityStart").val("");
        }
      });

      if (selfobj.filteredFields) {
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
            let temp = parseInt($('#' + column.column_name + '-startNo').val(), 10);
            let temp2 = parseInt($('#' + column.column_name + '-endNo').val(), 10);
            if (temp > temp2) {
              $('#' + column.column_name + '-endNo').val("");
            }
          });
          $('#' + column.column_name + '-endNo').on('change', function (e) {
            let temp = parseInt($('#' + column.column_name + '-startNo').val(), 10);
            let temp2 = parseInt($('#' + column.column_name + '-endNo').val(), 10);
            if (temp > temp2) {
              $('#' + column.column_name + '-startNo').val("");
            }
          });
          $('#' + column.column_name + '-startRange').on('change', function (e) {
            let temp = parseInt($('#' + column.column_name + '-startRange').val(), 10);
            let temp2 = parseInt($('#' + column.column_name + '-endRange').val(), 10);
            if (temp > temp2) {
              $('#' + column.column_name + '-endRange').val("");
            }
          });
          $('#' + column.column_name + '-endRange').on('change', function (e) {
            let temp = parseInt($('#' + column.column_name + '-startRange').val(), 10);
            let temp2 = parseInt($('#' + column.column_name + '-endRange').val(), 10);
            if (temp > temp2) {
              $('#' + column.column_name + '-startRange').val("");
            }
          });

          var linkedClassElement = $("body").find('.dropLinked_' + column.fieldID);
          if (column.fieldType == 'Dropdown' && column.linkedWith != null && column.linkedWith != "" && column.linkedWith != 'undefined') {
            if (column.fieldOptions != undefined) {
              var selectOptions = column.fieldOptions//.split(",");
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
          let fieldOpt = $(e.currentTarget).attr("data-fieldOpt");
          let selectedIDS = [];

          $.ajax({
            url: APIPATH + 'dynamicgetList/',
            method: 'POST',
            data: { text: name, pluginID: pluginID, wherec: fieldOpt, fieldID: fieldID },
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

    setupSortable: function () {
      var selfobj = this;
      $(".leadCustomer").sortable({
        connectWith: ".leadCustomer",
        placeholder: "ui-state-highlight",
        forcePlaceholderSize: true,
        tolerance: 'pointer',
        items: '>.leadDetailsCard',
        change: function (event, ui) {
        }
      });

      // $(".row.kanban-view").sortable({
      //   placeholder: "ui-state-highlight",
      //   forcePlaceholderSize: true,
      //   items: '>.leadIndex',
      //   cursor: 'grabbing',
      //   stop: function (event, ui) {
      //     setTimeout(function () { selfobj.savePositions(); }, 100);
      //   }
      // });

      $(".row.kanban-view").sortable({
        placeholder: "ui-state-highlight",
        forcePlaceholderSize: true,
        items: '.leadIndex',
        cursor: 'grabbing',
        connectWith: '.listgrid',
        stop: function(event, ui) {
          setTimeout(function () { selfobj.savePositions(); }, 100);
        }
      }).disableSelection();

    },

    setupDragable: function () {
      $(".leadCustomer").draggable({
        revert: "invalid",
        containment: "document",
        helper: "clone",
        cursor: "move",
        zIndex: 1000,
        start: function(event, ui) {
            $(this).css("opacity", "0.6");
        },
        stop: function(event, ui) {
            $(this).css("opacity", "1");
        }
      });
    },

    savePositions: function () {
      var selfobj = this;
      var action = "changePositions";
      var serializedData = $(".row.kanban-view .leadIndex").map(function () {
        return $(this).data("lead-id");
      }).get();
      $.ajax({
        url: APIPATH + 'leadColumnUpdatePositions',
        method: 'POST',
        data: { action: action, menuIDs: serializedData },
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
        }
      });
    },

    setupDropable: function () {
      let selfobj = this;
      $("body").find(".leadDrop").droppable({
        accept: ".leadCustomer",
        over: function (event, ui) {
          $(this).addClass("ui-state-highlight");
        },
        out: function (event, ui) {
          $(this).removeClass("ui-state-highlight");
        },
        drop: function (event, ui) {
          var leadStageID = $(this).parent().find('.listgrid').attr('id');
          var customerID = $(ui.draggable).attr('data-customer_id');
          $(this).append(ui.draggable);
          $(this).removeClass("ui-state-highlight");
          ui.draggable.removeClass("ui-draggable-dragging");
          setTimeout(function () {
            selfobj.updateLeadStage(leadStageID, customerID);
          }, 500);
        },
      });
    },

    updateLeadStage: function (leadStageID, customerID) {
      let selfobj = this;
      if (customerID != "" && leadStageID != "") {
        selfobj.isdataupdated = true;
        $.ajax({
          url: APIPATH + 'customerMaster/leadUpdate',
          method: 'POST',
          data: { customerID: customerID, lead: leadStageID },
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
              selfobj.gridLazyLoad(listgridID = "");
            }
          }
        });
      }
    },

    leadCanbanSlider: function () {
      this.categoryList.models.forEach((category) => {
        this.totalColumns = category ? category.attributes.sublist ? category.attributes.sublist.length : [] : 0;
      });
      var offset = [0, 0];
      // check how many colums we have
      const countAll = this.totalColumns + 1;
      // preview div bottom right
      var divOverlay = document.querySelector(".kanban-scroll-active");
      // inner view in preview scroll
      var scrollView = document.querySelector(".kanban-columns-thumbs");
      scrollView.innerHTML = "";
      // main colum view with data
      var kanban = document.querySelector(".kanban-view");

      for (var i = 0; i < countAll; i++) {
        const para = document.createElement("div");
        para.classList.add("leadCol");
        scrollView.appendChild(para);
      }

      var isDown = false;
      calViewPortScroll();
      window.addEventListener('resize', calViewPortScroll);

      function calViewPortScroll() {
        var viewPort = kanban ? parseInt(kanban.offsetWidth) * 100 / parseInt(kanban.scrollWidth) : '';
        divOverlay.style.width = viewPort + "%";
      }

      document.addEventListener('mouseup', function () {
        isDown = false;
      }, true);

      if (divOverlay) {
        divOverlay.addEventListener('mousedown', function (e) {
          isDown = true;
          offset = [
            divOverlay.offsetLeft - e.clientX,
            divOverlay.offsetTop - e.clientY
          ];
        }, true);
      }

      if (kanban) {
        kanban.addEventListener('scroll', function (e) {
          if (!isDown) {
            var wid = scrollView.offsetWidth - divOverlay.offsetWidth;
            var CalPositionPer = (kanban.scrollLeft * 100 / kanban.scrollWidth);
            var decideScroll = scrollView.offsetWidth * CalPositionPer / 100;
            divOverlay.style.left = decideScroll + 'px';
          }
        });
      }

      if (divOverlay) {
        divOverlay.addEventListener('mousemove', function (e) {
          e.preventDefault();
          var wid = scrollView.offsetWidth - divOverlay.offsetWidth;
          if (isDown) {

            if ((e.clientX + offset[0]) > 0 && (e.clientX + offset[0]) < wid) {
              var CalPositionPer = (scrollView.offsetWidth * (e.clientX + offset[0]) / 100);
              var decideScroll = kanban.scrollWidth * CalPositionPer / 100;
              divOverlay.style.left = (e.clientX + offset[0]) + 'px';
              kanban.scrollLeft = decideScroll;
            }
            if ((e.clientX + offset[0]) <= 0) {
              kanban.scrollLeft = 0;
            }
          }
        }, true);
      }
    },

    getCountry: function (e) {
      var name = $(e.currentTarget).val();
      var dropdownContainer = $("#countryDropdown");
      var table = "country";
      var where = "country_name";
      var list = "country_id, country_name";
      $.ajax({
        url: APIPATH + 'getList/',
        method: 'POST',
        data: { text: name, tableName: table, wherec: where, list: list },
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
            $.each(res.data, function (index, value) {
              dropdownContainer.append('<div class="dropdown-item selectCountry" style="background-color: #ffffff;" data-countryID=' + value.country_id + '>' + value.country_name + '</div>');
            });
            dropdownContainer.show();
          }
        }
      });
    },

    // setCountry: function (e) {
    //   let selfobj = this;
    //   var Name = $(e.currentTarget).text();
    //   var countryID = $(e.currentTarget).attr('data-countryID');
    //   $('.countryChange').val(Name);
    //   $("#countryDropdown").hide();
    //   let newdetails = [];
    //   newdetails["" + 'country_id'] = countryID;
    //   filterOption.set(newdetails);
    // },

    getState: function (e) {
      var name = $(e.currentTarget).val();
      var dropdownContainer = $("#stateDropdown");
      var table = "states";
      var where = "state_name";
      var list = "state_id, state_name";
      $.ajax({
        url: APIPATH + 'getList/',
        method: 'POST',
        data: { text: name, tableName: table, wherec: where, list: list },
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
            $.each(res.data, function (index, value) {
              dropdownContainer.append('<div class="dropdown-item selectState" style="background-color: #ffffff;" data-stateID=' + value.state_id + '>' + value.state_name + '</div>');
            });
            dropdownContainer.show();
          }
        }
      });
    },

    // setState: function (e) {
    //   let selfobj = this;
    //   var Name = $(e.currentTarget).text();
    //   var stateID = $(e.currentTarget).attr('data-stateID');
    //   $('.stateChange').val(Name);
    //   $("#stateDropdown").hide();
    //   let newdetails = [];
    //   newdetails["" + 'state_id'] = stateID;
    //   filterOption.set(newdetails);
    // },

    getCity: function (e) {
      var name = $(e.currentTarget).val();
      var dropdownContainer = $("#cityDropdown");
      var table = "cities";
      var where = "city_name";
      var list = "city_id, city_name";
      $.ajax({
        url: APIPATH + 'getList/',
        method: 'POST',
        data: { text: name, tableName: table, wherec: where, list: list },
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
            $.each(res.data, function (index, value) {
              dropdownContainer.append('<div class="dropdown-item selectCity" style="background-color: #ffffff;" data-cityID=' + value.city_id + '>' + value.city_name + '</div>');
            });
            dropdownContainer.show();
          }
        }
      });
    },

    setCity: function (e) {
      let selfobj = this;
      var Name = $(e.currentTarget).text();
      var cityID = $(e.currentTarget).attr('data-cityID');
      $('.cityChange').val(Name);
      $("#cityDropdown").hide();
      let newdetails = [];
      newdetails["" + 'city_id'] = cityID;
      filterOption.set(newdetails);
    },

    handleMouseHover: function(event) {
      const customerRow = $(event.currentTarget);
      const button = customerRow.find(".CustomerHoverButton");
      const checkboxTd = customerRow.find('td.a-center');
      const actionColumn = customerRow.find('td.actionColumn');
      if ($(event.target).closest(checkboxTd).length === 0 && $(event.target).closest(actionColumn).length === 0) {
        if (button.length > 0 && !button.is(":hover")) {
          const bottomPos = customerRow.offset().top + customerRow.outerHeight();
          button.css({
            display: "block",
            left: event.clientX + "px",
            top: (bottomPos - 2) + "px",
          });
        }
      }
    },
    
    handleMouseLeave: function(event) {
        const customerRow = $(event.currentTarget);
        const customerId = customerRow.data('customerid');
        const relatedTarget = $(event.relatedTarget);
        if (!relatedTarget.hasClass("customerRow")) {
            customerRow.find(".CustomerHoverButton").css("display", "none");
        }
    },

    getInitials: function(name) {
      if(name){
        const words = name.split(' ');
        let initials;
        if (words.length === 1) {
            initials = [words[0].charAt(0)];
        } else {
            initials = [words[0].charAt(0), words[words.length - 1].charAt(0)];
        }
        return initials.join('').toUpperCase();
      }
    },
  
    getColorByInitials:function(initials) {
      const colors = [
        "#fce7f6", 
        "#f8d6e7",
        "#d6f8e7",
        "#e7d7fd",
        "#f1f9dd",
        "#d6e6ff",
        "#d3f8fd",
        "#fce7f6", 
        "#f8d6e7",
        "#d6f8e7",
        "#e7d7fd",
        "#f1f9dd",
        "#d6e6ff",
        "#d3f8fd",
        "#fce7f6", 
        "#f8d6e7",
        "#d6f8e7",
        "#e7d7fd",
        "#f1f9dd",
        "#d6e6ff",
        "#d3f8fd",
        "#fce7f6", 
        "#f8d6e7",
        "#d6f8e7",
        "#e7d7fd",
        "#f1f9dd",
        "#d6e6ff",
        "#d3f8fd",
      ];
      
      let sum = 0;
      if(initials){
        for (let i = 0; i < initials.length; i++) {
          sum += initials.charCodeAt(i);
        }
        const index = sum % colors.length;
        return colors[index];
      }
    },

    getFontColor: function(bgColor) {
      if(bgColor){
        var selfobj = this;
        const rgb = selfobj.hexToRgb(bgColor);
        const darkerRgb = {
            r: Math.max(0, rgb.r - 130),
            g: Math.max(0, rgb.g - 130),
            b: Math.max(0, rgb.b - 130) 
        };
        const darkerHex = selfobj.rgbToHex(darkerRgb.r, darkerRgb.g, darkerRgb.b);
        return `rgba(${darkerRgb.r}, ${darkerRgb.g}, ${darkerRgb.b}, 1)`;
      }
    },

    rgbToHex: function(r, g, b) {
      return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    },

    hexToRgb :function(hex) {
      if(hex){
        hex = hex.replace(/^#/, '');
        const bigint = parseInt(hex, 16);
        return {
            r: (bigint >> 16) & 255,
            g: (bigint >> 8) & 255,
            b: bigint & 255
        };
      }
    },

    defaultViewSet:function(){
      var selfobj = this;
      if (selfobj.userSettings && selfobj.userSettings.hasOwnProperty(selfobj.menuId)) {
          for (const rowKey in selfobj.userSettings) {
            if(rowKey == selfobj.menuId){
              const displayView = selfobj.userSettings[rowKey].displayView;
              const tableStructure = selfobj.userSettings[rowKey].tableStructure;
              selfobj.tableStructure = tableStructure;
              if(displayView){
                if(displayView == 'traditionalList'){
                  $("#leadlistview").show();
                  $("#leadgridview").hide();
                  $("#modernlistview").hide();
                  $(".grid_mode").removeAttr("disabled")
                  $(".list_mode").attr('disabled', 'disabled');
                  $(".modernlist_mode").removeAttr("disabled")
                  $("#arrangeColumns").show();
                  $(".showListView").toggle();
                  selfobj.View = "traditionalList";
                  selfobj.resetSearch();
                }else if(displayView == 'modernlist'){
                  $("#leadlistview").hide();
                  $("#leadgridview").hide();
                  $("#modernlistview").show();
                  $(".grid_mode").removeAttr("disabled")
                  $(".modernlist_mode").attr('disabled', 'disabled');
                  $(".list_mode").removeAttr("disabled")
                  $("#arrangeColumns").show();
                  $(".showListView").toggle();
                  selfobj.View = "modernlist";
                  selfobj.resetSearch();
                }else{
                  $("#leadgridview").show();
                  $("#leadlistview").hide();
                  $("#modernlistview").hide();
                  $(".list_mode").removeAttr("disabled")
                  $(".grid_mode").attr('disabled', 'disabled');
                  $(".modernlist_mode").removeAttr("disabled")
                  $(".hide").hide();
                  $(".showListView").toggle();
                  selfobj.collection.reset();
                  selfobj.View = "grid";
                  selfobj.gridLazyLoad(listgridID = "");
                  selfobj.setupDropable();
                  selfobj.setupSortable();
                  if(selfobj.mname == 'leads'){
                    selfobj.leadCanbanSlider();
                  }
                }
              }
              if (tableStructure && tableStructure != {} && Object.entries(tableStructure).length > 0) {
                let missingColumns = [];
                let totalWidthReduction = 0;
                let tableElement;
                let elseCount = 0;
                let elseCountCalculated = false; 
                for (const property in tableStructure) {
                    if (tableStructure.hasOwnProperty(property)) {
                      let columns;
                      if(property == 0){
                        const entry = tableStructure[property];
                        if (displayView === 'traditionalList' && entry.hasOwnProperty('clist')) {
                            columns = entry['clist'];
                        } else if (displayView === 'modernlist' && entry.hasOwnProperty('custModernList')) {
                            columns = entry['custModernList'];
                        }
                      }else{
                        if (displayView === 'traditionalList') {
                          columns = tableStructure['clist'];
                        } else if (displayView === 'modernlist') {
                            columns = tableStructure['custModernList'];
                        }
                        //  columns = tableStructure[property];
                      }
                        if (columns) {
                          // Flag to track if elseCount has been calculated
                            for (const columnName in columns) {
                                if (columns.hasOwnProperty(columnName)) {
                                    if (columnName !== 'tableWidth' && !selfobj.arrangedColumnList.find(column => column.column_name === columnName)) {
                                      missingColumns.push({ [columnName]: columns[columnName] });
                                      totalWidthReduction += columns[columnName];
                                    }
                                    if (columnName == 'tableWidth') {
                                        const tableWidth = columns['tableWidth'];
                                        // var tableId = '#' + property;
                                        if(displayView == "traditionalList"){
                                          var tableId = '#clist';
                                        }else if(displayView == "modernlist"){
                                          var tableId = '#custModernList';
                                        }
                                        tableElement = document.querySelector(tableId);
                                        if (tableElement) {
                                            tableElement.style.width = tableWidth + 'px';
                                        }
                                    } else if (!elseCountCalculated) { // Calculate elseCount only once
                                        selfobj.arrangedColumnList.forEach((column) => {
                                            if (!columns.hasOwnProperty(column.column_name)) {
                                                elseCount++;
                                            }
                                        });
                                        elseCountCalculated = true; // Set the flag
                                    }
                                }
                            }
                            // Adjust column widths
                              selfobj.arrangedColumnList.forEach((column) => {
                                if (columns.hasOwnProperty(column.column_name)) {
                                    let value = columns[column.column_name];
                                    // console.log("value",value);
                                    if(value == null || value == "" || value == undefined){
                                      value = 150;
                                    }else{
                                       value = columns[column.column_name];
                                    }
                                    // console.log("value1",value);
                                    const thElement = document.querySelector(`th[data-column="${column.column_name}"]`);
                                    // console.log("thElement",thElement);
                                    if (thElement) {
                                        thElement.style.width = value + 'px';
                                    }
                                } else {
                                    const value = 150;
                                    const thElement = document.querySelector(`th[data-column="${column.column_name}"]`);
                                    if (thElement) {
                                        thElement.style.width = value + 'px';
                                    }
                                    else {
                                        elseCount++; // Increment elseCount here
                                    }
                                }
                            });
                            // Adjust table width based on elseCount
                            if (tableElement) {
                              tableElement.style.width = (parseInt(tableElement.style.width) + (elseCount * 80)) + 'px';
                            }
                        }else{
                          if(displayView != 'grid'){
                            if(displayView == "traditionalList"){
                              var tabldeID = 'clist';
                            }else if(displayView == "modernlist"){
                              var tabldeID = 'custModernList';
                            }
                            var totalWidth = 0;
                            var minWidth;
                            var width;
                            $('#'+tabldeID + ' ' + '.column-title').each(function(index) {
                              if (index !== $('.column-title').length - 1) {
                                var fieldLabel = $(this).contents().filter(function() {
                                  return this.nodeType === 3;
                                }).text().trim();
                                
                                if (fieldLabel !== 'Action') {
                                  var fieldLabelLength = fieldLabel.length;
                                  minWidth = fieldLabelLength + 100;
                                  width = 190 ;
                                } else {
                                  minWidth = 122;
                                  width = 200 ;
                                }
                                totalWidth += width;
                                $(this).css('min-width', minWidth + 'px');
                                $(this).css('width', width + 'px');
                                $(this).css('max-width', 640 + 'px');
                              }
                            });
                            const tableId = '#' + tabldeID;
                            const tableName = document.querySelector(tableId);
                            if (tableName) {
                                totalWidth += 60;
                                tableName.style.width = totalWidth + 'px';
                            }
                            if(totalWidth < 910){
                              if (tableName) {
                                tableName.style.width = 910 + 'px';
                              }
                            }
                          }
                        }
                    }
                }
                // if (totalWidthReduction > 0) {
                  if (tableElement) {
                      const currentWidth = parseInt(tableElement.style.width || tableElement.clientWidth);
                      const newWidth = currentWidth - totalWidthReduction;
                      tableElement.style.width = newWidth + 'px';
                      if(newWidth < 910){
                        tableElement.style.width = 910 + 'px';
                      }
                  }
                  $(tableId + ' .column-title').each(function(index) {
                      var fieldLabel = $(this).contents().filter(function() {
                        return this.nodeType === 3;
                      }).text().trim();
                      
                      if (fieldLabel == 'Action') {
                        let minWidth = 122;
                        let width = 200 ;
                        $(this).css('min-width', minWidth + 'px');
                        $(this).css('width', width + 'px');
                        $(this).css('max-width', 640 + 'px');
                        if (tableElement) {
                          const currentWidth = parseInt(tableElement.style.width || tableElement.clientWidth);
                          const newWidth = currentWidth + width;
                          tableElement.style.width = newWidth + 'px';
                          if(newWidth < 910){
                            tableElement.style.width = 910 + 'px';
                          }
                        }
                      } 
                  });
              // }
              }else{
                if(displayView != 'grid'){
                  if(displayView == "traditionalList"){
                    var tabldeID = 'clist';
                  }else if(displayView == "modernlist"){
                    var tabldeID = 'custModernList';
                  }
                  // var tabldeID = $('body').find("table").attr("id");
                  var totalWidth = 0;
                  var minWidth;
                  var width;
                  $('#'+tabldeID + ' ' + '.column-title').each(function(index) {
                    if (index !== $('.column-title').length - 1) {
                      var fieldLabel = $(this).contents().filter(function() {
                        return this.nodeType === 3;
                      }).text().trim();
                      
                      if (fieldLabel !== 'Action') {
                        var fieldLabelLength = fieldLabel.length;
                        minWidth = fieldLabelLength + 100;
                        width = 190 ;
                      } else {
                        minWidth = 122;
                        width = 200 ;
                      }
                      totalWidth += width;
                      $(this).css('min-width', minWidth + 'px');
                      $(this).css('width', width + 'px');
                      $(this).css('max-width', 640 + 'px');
                    }
                  });
                  const tableId = '#' + tabldeID;
                  const tableName = document.querySelector(tableId);
                  if (tableName) {
                      totalWidth += 60;
                      tableName.style.width = totalWidth + 'px';
                  }
                  if(totalWidth < 910){
                    if (tableName) {
                      tableName.style.width = 910 + 'px';
                    }
                  }
                }
              }
            }
          }
      } else {
            $("#leadlistview").show();
            $("#leadgridview").hide();
            $("#modernlistview").hide();
            $(".grid_mode").removeAttr("disabled")
            $(".list_mode").attr('disabled', 'disabled');
            $(".modernlist_mode").removeAttr("disabled")
            $("#arrangeColumns").show();
            $(".showListView").toggle();
            selfobj.View = "traditionalList";
            selfobj.resetSearch();
            // var tabldeID = $('body').find("table").attr("id");
            var tabldeID = 'clist';
            var totalWidth = 0;
            var minWidth;
            var width;
            $('#'+tabldeID + ' ' + '.column-title').each(function(index) {
              if (index !== $('.column-title').length - 1) {
                var fieldLabel = $(this).contents().filter(function() {
                  return this.nodeType === 3;
                }).text().trim();
                
                if (fieldLabel !== 'Action') {
                  var fieldLabelLength = fieldLabel.length;
                  minWidth = fieldLabelLength + 100;
                  width = 190 ;
                } else {
                  minWidth = 122;
                  width = 200 ;
                }
                totalWidth += width;
                $(this).css('min-width', minWidth + 'px');
                $(this).css('width', width + 'px');
                $(this).css('max-width', 640 + 'px');
              }
            });
            const tableId = '#' + tabldeID;
            const tableName = document.querySelector(tableId);
            if (tableName) {
                totalWidth += 60;
                tableName.style.width = totalWidth + 'px';
            }
            if(totalWidth < 910){
              if(tableName){
                tableName.style.width = 910 + 'px';
              }
            }
      }
    },
 
    render: function () {
      var selfobj = this;
      var template = _.template(customerTemp);

      selfobj.categoryList.models.forEach((cat) => {
        cat.attributes.sublist.sort((a, b) => {
          return parseInt(a.lead_index) - parseInt(b.lead_index);
        });
      });

      var colName = ['country_id', 'state_id', 'city_id'];
      var fieldName = ['Country Name', 'State Name', 'City Name'];

      selfobj.arrangedColumnList.forEach((column) => {
        var index = colName.indexOf(column.column_name);
        column.fieldLabel = index !== -1 ? fieldName[index] : column.fieldLabel;
      });

      this.$el.html(template({ totalRec: this.totalRec, menuName: this.mname, closeItem: this.toClose, pluralLable: this.plural_label, "moduleDesc": selfobj.module_desc, "arrangedColumnList": selfobj.arrangedColumnList, categoryList: selfobj.categoryList.models,displayView :selfobj.View }));
      $(".app_playground").append(this.$el);
      $(".loder").hide();
      $(".clearSorting").attr('disabled', 'disabled');
      setToolTip();

      $(".listgrid").scroll(function () {
        var element = $(this);
        var scrollHeight = element.prop('scrollHeight');
        var scrollTop = element.scrollTop();
        var innerHeight = element.innerHeight();
        var remainingScroll = scrollHeight - (scrollTop + innerHeight);
        let rounded = Math.round(remainingScroll);
        if (rounded <= 0) {
          var listgridID = element.attr("id");
          selfobj.gridLazyLoad(listgridID);
        }
      });
      // console.log("user_setting",localStorage.getItem('user_setting'));

      if(localStorage.getItem('user_setting') && localStorage.getItem('user_setting').length > 15){
        selfobj.userSettings = JSON.parse(localStorage.getItem('user_setting'));
      }else{
        selfobj.userSettings = {};
      }
      setTimeout(function () {
        if(selfobj.userSettings && selfobj.userSettings != {} && Object.entries(selfobj.userSettings).length > 0) {
          selfobj.defaultViewSet();
        }else{
          selfobj.moduleDefaultSettings.setModuleDefaultView(selfobj.menuId,"traditionalList",selfobj.tableStructure);
          if(localStorage.getItem('user_setting') && localStorage.getItem('user_setting').length > 15){
            selfobj.userSettings = JSON.parse(localStorage.getItem('user_setting'));
          }else{
            selfobj.userSettings = {};
          }
          selfobj.defaultViewSet();
        }
        $(".showListView").hide();
      }, 300);

      return this;
    }
  });

  return customerView;

});