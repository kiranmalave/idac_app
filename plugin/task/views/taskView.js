
define([
  'jquery',
  'underscore',
  'backbone',
  'datepickerBT',
  'moment',
  'Swal',
  '../views/taskSingleView',
  '../views/repeatTaskCustomView',
  '../views/historySingleView',
  '../collections/taskCollection',
  '../models/taskFilterOptionModel',
  "../../admin/collections/adminCollection",
  "../../customer/collections/customerCollection",
  '../../core/views/configureColumnsView',
  '../../core/views/appSettings',
  '../../dynamicForm/collections/dynamicFormDataCollection',
  '../../menu/models/singleMenuModel',
  '../../category/collections/slugCollection',
  'text!../templates/taskRow.html',
  'text!../templates/taskGridRow.html',
  'text!../templates/taskModernRow.html',
  'text!../templates/task_temp.html',
  'text!../templates/taskFilterOption_temp.html',
  'text!../../dynamicForm/templates/linkedDropdown.html',
], function ($, _, Backbone, datepickerBT, moment, Swal , taskSingleView, repeatTaskCustomView, historySingleView, taskCollection, taskFilterOptionModel, adminCollection, customerCollection,configureColumnsView,appSettings,dynamicFormData,singleMenuModel,slugCollection, taskRowTemp, taskGridRow, taskModernRow, taskTemp, taskFilterTemp,linkedDropdown) {

  var taskView = Backbone.View.extend({
    module_desc:'',
    plural_label:'',
    form_label:'',
    loadfrom: null,
    totalRec: 0,
    View:'list',
    listDataGrid: [],
    initialize: function (options) {
      this.startX = 0;
      this.startWidth = 0;
      this.$handle = null;
      this.$table = null;
      this.pressed = false;

      this.toClose = "taskFilterView";
      var selfobj = this;
      selfobj.arrangedColumnList = [];
      this.filteredFields = [];
      this.filterCount = null;
      
      if (options.loadfrom != undefined) {
        selfobj.loadfrom = options.loadfrom;
        permission = ROLE['task'];
        this.mname = 'task';
      } else {
        this.mname = Backbone.history.getFragment();
      }
      this.totalRec = 0;
      this.taskID = options.action;
      this.appSettings = new appSettings();
      $(".profile-loader").show();
      $(".loder").hide();

      
      
      const match = this.mname.match(/^task(?:\/(\d+))?$/);
      if (match) {
        // If the pattern is matched, set this.mname to "task"
        this.mname = match[1] ? "task" : this.mname;
        this.mname = "task"
        // Continue with the rest of the code
        permission = ROLE[this.mname];
        this.menuId = permission.menuID;
        this.dynamicFormDatas = new dynamicFormData();
        if(options.loadfrom != 'dashboard' && options.loadfrom != 'taskMenu'){
          this.openSingleTemp(this.taskID);
        }
      }
      
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
      // alert("menuName: "+this.mname+" loadform: "+options.loadfrom);
      this.adminList = new adminCollection();
      this.adminList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: {status: 'active', getAll: 'Y' }
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".profile-loader").hide();
        
        // selfobj.render();
      });

      this.categoryList = new slugCollection();
      this.categoryList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y', slug: 'task_priority,task_type,task_status' }
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".profile-loader").hide();
        selfobj.setStageColor();
      });

      this.customerList = new customerCollection();
      this.customerList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, data: { getAll: 'Y', status: "active", type:"customer" }
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".profile-loader").hide();
        selfobj.render();
      });

      this.filterCount = null;
      filterOption = new taskFilterOptionModel();

       filterOption.set({ "menuId": this.menuId });

      if (this.mname == "task") {
        filterOption.set({ record_type: "task" });
      } else if (this.mname == "ticket") {
        filterOption.set({ record_type: "ticket" });
      }
      this.collection = new taskCollection();
      this.collection.on('add', this.addOne, this);
      this.collection.on('reset', this.addAll, this);
      // this.render();
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
        selfobj.totalRec = res.paginginfo.totalRecords;
        $(".profile-loader").hide();
      });
      selfobj.render();
    },

    setStageColor: function(){   
      var selfobj = this;  
      var stageColor;
      this.categoryList.models.forEach(function(element) {
        element.attributes.sublist.forEach(function(list){
          stageColor = setColor(list.cat_color);
          list.cat_color_light = stageColor;
        })
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
      "click .sortColumns": "sortColumn",
      "change .txtchange": "updateOtherDetails",
      "click .changeStatus": "changeStatusListElement",
      "click .showpage": "loadData",
      "change .changeBox": "changeBox",
      "change .sortbydate": "sortByDate",
      "change .dropval": "singleFilterOptions",
      "click .arrangeColumns": "openColumnArrangeModal",
      "click .downloadReport": "downloadReport",
      'mousedown .table-resizable .resize-bar': 'onMouseDown',
      'mousemove .table-resizable th, .table-resizable td': 'onMouseMove',
      'mouseup .table-resizable th, .table-resizable td': 'onMouseUp',
      'dblclick .table-resizable thead': 'resetColumnWidth',
      "click .list_mode": "gridMode",
      "click .grid_mode": "gridMode",
      "click .modernlist_mode": "gridMode",
      "click .listView": "showList",
      "change .setTaskStatus": "setTaskStatus",
    },

    gridMode: function (e) {
      let selfobj = this;
      var View = $(e.currentTarget).val();

      selfobj.viewListType = View;
      console.log("View", View);
      if (View == "traditionalList") {
        $("#taskListView").show();
        $("#taskGridView").hide();
        $("#taskmodernlistview").hide()
        $(".grid_mode").removeAttr("disabled")
        selfobj.View = "list";
        selfobj.resetSearch();
        $(".showListView").toggle();
      } else if (View == "modernlist") {
        $("#taskmodernlistview").show()
        $("#taskListView").hide();
        $("#taskGridView").hide();
        $(".grid_mode").removeAttr("disabled")
        selfobj.View = "list";
        selfobj.resetSearch();
        $(".showListView").toggle();
      } else if (View == "grid") {
        $("#taskGridView").show();
        $("#taskListView").hide();
        $("#taskmodernlistview").hide()
        $(".list_mode").removeAttr("disabled")
        $(".grid_mode").attr('disabled', 'disabled');
        selfobj.collection.reset();
        selfobj.View = "grid";
        selfobj.girdLazyLoad(listgridID = "", firstLoad = true);
        selfobj.setupDropable();
        selfobj.setupSortable();
        selfobj.leadCanbanSlider();
        $(".showListView").toggle();
      }
    },

    addAllGrid: function (col_name) {
      $("#customerList").empty();
      let selfobj = this;
      // $('#' + col_name).children().not(".totalCount").empty();
      // $('#otherStage').children().not(".totalCount").empty();
      selfobj.listDataGrid[col_name].models.forEach(element => {
        selfobj.addOne(element);
      });
    },

    girdLazyLoad: function (listgridID, firstLoad) {
      let selfobj = this;
      if (firstLoad) {
        var currPage = '';//selfobj.paginginfo.nextpage;
      } else {
        var currPage = '';
      }
      if (currPage != undefined) {
        filterOption.set({ curpage: currPage });
      }
      if (listgridID == "") {
        $.each(this.categoryList.models, function (index, value) {
          if(value.attributes.slug == "task_status"){
            $.each(value.attributes.sublist, function (index2, value2) {
              filterOption.set({ task_status: value2.category_id });
              selfobj.listDataGrid[value2.category_id] = new taskCollection();
              selfobj.listDataGrid[value2.category_id].fetch({
                headers: {
                  'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
                }, error: selfobj.onErrorHandler, type: 'post', data: filterOption.attributes
              }).done(function (res) {
                if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
                $(".profile-loader").hide();
                selfobj.paginginfo = res.paginginfo;
                selfobj.addAllGrid(value2.category_id);
              });

              $("#leadlistview").hide();
            });
          }
        });
        filterOption.set({ task_status: "other" });
        selfobj.listDataGrid[0] = new taskCollection();
        selfobj.listDataGrid[0].fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler, type: 'post', data: filterOption.attributes
        }).done(function (res) {
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          $(".profile-loader").hide();
          selfobj.paginginfo = res.paginginfo;
          selfobj.addAllGrid(0);
        });
      } else {
        filterOption.set({ task_status: listgridID });
        selfobj.listDataGrid[listgridID].fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler, type: 'post', data: filterOption.attributes
        }).done(function (res) {
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          $(".profile-loader").hide();
          selfobj.paginginfo = res.paginginfo;
        });
        selfobj.listDataGrid[listgridID].on('add', this.addOne, this);
        selfobj.listDataGrid[listgridID].on('reset', this.addAll, this);
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

      $(".row.kanban-view").sortable({
        placeholder: "ui-state-highlight",
        forcePlaceholderSize: true,
        items: '>.leadIndex',
        cursor: 'grabbing',
        stop: function (event, ui) {
          setTimeout(function () { selfobj.savePositions(); }, 100);
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
        url: APIPATH + 'taskColumnUpdatePositions',
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

    setupDragable: function () {
      $(".leadCustomer").draggable({
        revert: "invalid",
        containment: "document",
        helper: "clone",
        cursor: "move",
        zIndex: 1000,
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
          var taskStatusID = $(this).parent().find('.listgrid').attr('id');
          var task_id = $(ui.draggable).attr('data-task_id');
          $(this).append(ui.draggable);
          $(this).removeClass("ui-state-highlight");
          ui.draggable.removeClass("ui-draggable-dragging");
          setTimeout(function () {
            selfobj.updateTaskStatus(taskStatusID, task_id);
          }, 500);
        },
      });
    },

    updateTaskStatus: function (taskStatusID, task_id) {
      let selfobj = this;
      if (task_id != "" && task_id != "") {
        $.ajax({
          url: APIPATH + 'taskMaster/taskStatusUpdate',
          method: 'POST',
          data: { taskID: task_id, taskStatus: taskStatusID },
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
              selfobj.stageColumnUpdate(taskStatusID);
            }
          }
        });
      }
    },

    showList: function (e) {
      $(".showListView").toggle();

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
    
    openSingleTemp: function(taskID){
      let selfobj = this;
      if(taskID != ""){
        new taskSingleView({ task_id: taskID, searchtask: selfobj,menuId:selfobj.menuId,form_label:"Task", menuName: selfobj.mname});
      }
    },
    

    downloadReport: function (e) {
      e.preventDefault();
      let type = $(e.currentTarget).attr("data-type");
      var newdetails = [];
      newdetails["type"] = type;
      filterOption.set(newdetails);
      let form = $("#reports");
      form.attr({
          action: APIPATH + "taskReports",
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
    //   form.attr({
    //     id: "receiptsData",
    //     action: APIPATH + "taskReports",
    //     method: "POST",
    //     target: "_blank",
    //   }).append(dataInput);
    //   filterOption.clear('type');
    //   form.submit();
    // },

    updateOtherDetails: function (e) {
      e.stopPropagation();
      var toID = $(e.currentTarget).attr("id");
      var valuetxt = $(e.currentTarget).val()
      var newdetails = [];
      newdetails["" + toID] = valuetxt;
      filterOption.set(newdetails);
    },

    singleFilterOptions: function (e) {
      e.stopPropagation();
      var toID = $(e.currentTarget).attr("id");
      var valuetxt = $(e.currentTarget).val().join(",");
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
      Swal.fire({
        title: "Delete Task ",
        text: "Do you want to delete task !!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Delete',
        animation: "slide-from-top",
      }).then((result) => {
        if (result.isConfirmed) {
          $('#clist input:checkbox').each(function () {
            if ($(this).is(":checked")) {
              removeIds.push($(this).attr("data-task_id"));
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
            $('.checkall').prop('checked', false)
            Swal.fire('Failed', '', 'Please select at least one record.');
            return false;
          }
          $.ajax({
            url: APIPATH + 'taskMaster/status',
            method: 'POST',
            data: { list: idsToRemove, action: "changeStatus", status: status },
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
                Swal.fire('Failed', '', ''+res.msg);
    
    
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
              $(".deleteAll").hide();
              $('.checkall').prop('checked', false);
              $('.memberlistcheck').prop('checked', false);
            }
          });
        }else{
          $('.changeStatus').hide();
          $('.checkall').prop('checked', false);
          $('.memberlistcheck').prop('checked', false);
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
      $(".loder").show();
      setTimeout(function(){
      switch (show) {
        case "singletaskData": {
         
          var task_id = $(e.currentTarget).attr("data-task_id");
          if (task_id != undefined) {
            new historySingleView({ task_id: task_id });
            $(".loder").hide();
          } else {
            handelClose("historySingleView");
          }
          new taskSingleView({ task_id: task_id, searchtask: selfobj,menuId:selfobj.menuId,form_label:selfobj.form_label, menuName: selfobj.mname});
          break;
        }
      }
    }, 50);

    },
    sortColumn: function (e) {
      var order = $(e.currentTarget).attr("data-value");
      var selfobj = this;
      var newsetval = [];
      $("#clist").find(".up").removeClass("active");
      $("#clist").find(".down").removeClass("active");
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

    sortByDate: function (e) {
      e.stopPropagation();
      var order = $(e.currentTarget).val();
      let selfobj = this;
      let newsetval = [];
      var date;
      $('.taskfilbtn').removeClass('active');
      // $(e.currentTarget).addClass('active');
      if (order === "today") {
        date = moment().format('YYYY-MM-DD');
        newsetval["due_date"] = date;
      } else if (order === "tomorrow") {
        date = moment().add(1, 'days').format('YYYY-MM-DD');
        newsetval["due_date"] = date;
      } else if (order === "yesterday") {
        date = moment().subtract(1, 'days').format('YYYY-MM-DD');
        newsetval["due_date"] = date;
      }
      filterOption.set(newsetval);
      selfobj.filterSearch();
    },
    
    resetSearch: function () {
      filterOption.clear().set(filterOption.defaults);
      let selfobj = this;
      if (this.mname == "task") {
        filterOption.set({ record_type: "task" });
      } else if (this.mname == "ticket") {
        filterOption.set({ record_type: "ticket" });
      }
      $(".valChange").val("");
      $(".multiOptionSel").removeClass("active");
      $("#textval").val("");
      $(".txtchange").val("");
      $(".ws-select").val('default');
      $(".ws-select").selectpicker("refresh");
      $(".form-line").removeClass("focused");
      $("#textSearch").val("select");
      this.filterCount = null;
      if(selfobj.View == "list"){
        this.filterSearch(false);
      }else{
        filterOption.set({ "menuId": this.menuId });
        selfobj.stageColumnUpdate(stage);
      }
      $('.taskfilbtn').removeClass('active');
      $("#clist").find(".up").removeClass("active");
      $("#clist").find(".down").removeClass("active");
      $(".down").removeClass("active");
      $(".up").removeClass("active");
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
      var dueDateMoment = moment(objectModel.attributes.due_date);
      objectModel.attributes.newDate = objectModel.attributes.due_date;

      if (objectModel.attributes.due_date != "0000-00-00" && objectModel.attributes.due_date != null) {
        objectModel.attributes.due_date = dueDateMoment.format("DD-MMM-YYYY");
        var today = moment();
        if (dueDateMoment.isSame(today, 'day')) {
          objectModel.attributes.due_date = "Today";
        } else if (dueDateMoment.isSame(today.clone().subtract(1, 'day'), 'day')) {
          objectModel.attributes.due_date = "Yesterday";
        } else if (dueDateMoment.isSame(today.clone().add(1, 'day'), 'day')) {
          objectModel.attributes.due_date = "Tomorrow";
        } else {
          objectModel.attributes.date_status = dueDateMoment.format("MMMM Do, YYYY");
        }
      } else {
        objectModel.attributes.due_date = ""
      }

      if (selfobj.arrangedColumnList) {
        selfobj.arrangedColumnList.forEach((column) => {
          if (column.fieldType == 'Datepicker' || column.fieldType == 'Date') {
            if (objectModel.attributes["" + column.column_name] != "0000-00-00") {
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

        });
      }


      if (selfobj.View == "list") {
        var template = _.template(taskRowTemp);
        $("#taskList").append(template({ taskDetails: objectModel, arrangedColumnList: this.arrangedColumnList}));
        var template2 = _.template(taskModernRow);
        $("#taskModernList").append(template2({ taskDetails: objectModel, arrangedColumnList: this.arrangedColumnList }));
      }else{
        var template = _.template(taskGridRow);
        if(objectModel.attributes.assignee){
          var initial = selfobj.getInitials(objectModel.attributes.assignee);
        }
        if (objectModel.attributes.task_statusID != 0) {
          $("#" + objectModel.attributes.task_statusID).append(template({ taskDetails: objectModel, taskLength: this.collection.length , assigneeInitial: initial ? initial : '',}));
        } else {
          $("#otherStatus").append(template({ taskDetails: objectModel, taskLength: this.collection.length, assigneeInitial: initial ? initial : '', }));
        }
        selfobj.setupDragable();
      }
    

    },

    getInitials:function (name) {
      if(name){
        const words = name.split(' ');
        const initials = words.map(word => word.charAt(0));
        return initials.join('').toUpperCase();
      }
    },

    addAll: function () {
      $("#taskList").empty();
      this.collection.forEach(this.addOne, this);
    },

    setTaskStatus :function(e){
      var selfobj = this;
      var selectedStatusId = '';
      var task_id = $(e.currentTarget).attr('data-task_id');
      if($(e.currentTarget).is(':checked')){
         selfobj.categoryList.models.forEach(function(element) {
          if(element.attributes.categoryName == 'Task Status') {
            element.attributes.sublist.forEach(function(list){
              if(list.categoryName == 'Completed'){
                selectedStatusId = list.category_id;
              }
            })
          }
        });
        selfobj.updateTaskStatus(selectedStatusId, task_id);
        $(e.currentTarget).closest(".leadCustomer").remove();
      }else{
        var inputOptionsPromise = new Promise(function (resolve) {
            setTimeout(function () {
                let inputOptions = {};
                selfobj.categoryList.models.forEach(function(element) {
                  if(element.attributes.categoryName == 'Task Status') {
                    element.attributes.sublist.forEach(function(list, index){
                      inputOptions[list.category_id] = list.categoryName;
                    })
                  }
                });
                resolve(inputOptions);
            }, 100);
        });
        const { value: Status } = Swal.fire({
          title: "Change Status",
          text: "Please select the Task Status:",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Change',
          animation: "slide-from-top",
          inputPlaceholder: "Select Status",
          input: 'select',
          inputOptions: inputOptionsPromise,
          inputValidator: (value) => {
            selectedStatusId = value;
            if (!value) {
              return 'Please select the Status!'
            }
          }
        }).then((result) => {
          if (result.isConfirmed) {
            if (Status) {}
            selfobj.updateTaskStatus(selectedStatusId, task_id);
            $(e.currentTarget).closest(".leadCustomer").remove();
          } else{
            $(e.currentTarget).prop('checked', true);
          }
        })
      }
    },

    filterRender: function (e) {
      var selfobj = this;
      var isexits = checkisoverlay(this.toClose);
      if (!isexits) {
        var source = taskFilterTemp;
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
            selfobj.categoryLists = new slugCollection();
            var matcchedID = [];
            selfobj.categoryLists.fetch({
              headers: {
                'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
              }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y', category_id: column.parentCategory}
            }).done(function (res) {
              if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
              $(".popupLoader").hide();
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
        const filteredFields = extractedFields.filter(item => item.fieldID != "" && item.fieldID != null && item.fieldID != undefined);
        selfobj.filteredFields = filteredFields;
        
        setTimeout(function () { 
          var templateData = {
            filteredFields: selfobj.filteredFields || [],
            "adminList": selfobj.adminList.models || [],
            "categoryList": selfobj.categoryList.models || [],
            "customerList": selfobj.customerList.models || [],
            };
            cont.html(template(templateData));
            $(".ws-select").selectpicker();
            selfobj.setupFilter();
        }, 1000);
        
        cont.attr('id', this.toClose);
        /*  
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
        /* 
          INFO
          make current campaigns active
        */
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
      this.setupFilter();
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

    stageColumnUpdate: function (stage) {
      let selfobj = this;
      filterOption.set({ task_status: stage });
      selfobj.listDataGrid[stage] = new taskCollection();
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

    filterSearch: function (isClose = false, status) {
      if (isClose && typeof isClose != 'object') {
        $('.' + this.toClose).remove();
        rearrageOverlays();
      }

      if (this.View == "grid") {
        this.stageColumnUpdate(status);
        return;
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

      var specifFilters = ["textval", "fromDate", "toDate", "fromDate2", "toDate2", "due_date", "task_priority", "task_status", "customer_id", "assignee", "created_by"];
      var specificFilters= [];
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
      // alert(specificFilters);
      // Initialize a count variable
      var appliedFilterCount = 0;
      // Reset the count to zero
      appliedFilterCount = 0;
      specifFilters = [...new Set(specifFilters)];
      for (var i = 0; i < specifFilters.length; i++) {
        var filterKey = specifFilters[i];
        if (filterOption.attributes[filterKey] !== null && filterOption.attributes[filterKey] !== "") {
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
        selfobj.totalRec = res.paginginfo.totalRecords;
        if (selfobj.totalRec == 0) {
          $(".noCustRec").show();
          $("#tasklistview").hide();
        }else{
          $(".noCustRec").hide();
          $("#tasklistview").show();
        }
        setPagging(res.paginginfo, res.loadstate, res.msg);
        $element.attr("data-currPage", 1);
        $element.attr("data-index", res.paginginfo.nextpage);
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

    setupFilter: function () {
      var selfobj = this;
      startDate = $('#fromDate').datepickerBT({
        format: "dd-mm-yyyy",
        todayBtn: "linked",
        clearBtn: true,
        todayHighlight: true,
        StartDate: new Date(),
        numberOfMonths: 1,
        autoclose: true,
      }).on('changeDate', function (ev) {
        $('#fromDate').change();
        var valuetxt = $("#fromDate").val();
        var temp = moment(valuetxt, 'DD-MM-YYYY').valueOf();
        var valuetxt = $("#toDate").val();
        var temp2 = moment(valuetxt, 'DD-MM-YYYY').valueOf();
        if (temp > temp2) {
          $("#toDate").val("");
        }

      });
      endDate = $('#toDate').datepickerBT({
        format: "dd-mm-yyyy",
        todayBtn: "linked",
        clearBtn: true,
        todayHighlight: true,
        numberOfMonths: 1,
        autoclose: true,
      }).on('changeDate', function (ev) {
        $('#toDate').change();
        var valuetxt = $("#toDate").val();
        var temp = moment(valuetxt, 'DD-MM-YYYY').valueOf();
        var valuetxt = $("#fromDate").val();
        var temp2 = moment(valuetxt, 'DD-MM-YYYY').valueOf();
        if (temp2 > temp) {
          $("#fromDate").val("");
        }
      });

      startDate = $('#fromDate2').datepickerBT({
        format: "dd-mm-yyyy",
        todayBtn: "linked",
        clearBtn: true,
        todayHighlight: true,
        StartDate: new Date(),
        numberOfMonths: 1,
        autoclose: true,
      }).on('changeDate', function (ev) {
        $('#fromDate2').change();
        var valuetxt = $("#fromDate2").val();
        var temp = moment(valuetxt, 'DD-MM-YYYY').valueOf();
        var valuetxt = $("#toDate2").val();
        var temp2 = moment(valuetxt, 'DD-MM-YYYY').valueOf();
        if (temp > temp2) {
          $("#toDate2").val("");
        }
      });
      endDate = $('#toDate2').datepickerBT({
        format: "dd-mm-yyyy",
        todayBtn: "linked",
        clearBtn: true,
        todayHighlight: true,
        numberOfMonths: 1,
        autoclose: true,
      }).on('changeDate', function (ev) {
        $('#toDate2').change();
        var valuetxt = $("#toDate2").val();
        var temp = moment(valuetxt, 'DD-MM-YYYY').valueOf();
        var valuetxt = $("#fromDate2").val();
        var temp2 = moment(valuetxt, 'DD-MM-YYYY').valueOf();
        if (temp2 > temp) {
          $("#fromDate2").val("");
        }
      });

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

    openColumnArrangeModal: function (e) {
      let selfobj = this;
      var show = $(e.currentTarget).attr("data-action");
      var stdColumn = ['task_id','subject','assignee','task_type','task_status','task_priority','due_date','category_id'];
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

    render: function () {
      let selfobj = this;
      var template = _.template(taskTemp);
      var colName = ['category_id', 'customer_id'];
      var fieldName = ['Category Name', 'Customer Name'];
      selfobj.categoryList.models.forEach((cat) => {
        cat.attributes.sublist.sort((a, b) => {
          return parseInt(a.lead_index) - parseInt(b.lead_index);
        });
      });
      
      selfobj.arrangedColumnList.forEach((column) => {
          var index = colName.indexOf(column.column_name);
          column.fieldLabel = index !== -1 ? fieldName[index] : column.fieldLabel;
      });
      this.$el.html(template({ closeItem: this.toClose,"pluralLable":selfobj.plural_label,"moduleDesc":selfobj.module_desc,"arrangedColumnList": selfobj.arrangedColumnList, menuName: this.mname, totalRec: this.totalRec, categoryList: this.categoryList.models}));
      var numColumns = selfobj.arrangedColumnList ? selfobj.arrangedColumnList.length : 0;
      var defaultWidth = numColumns == 0 ? '100%' : 100 + (numColumns * 16) + '%';
      $("#clist").css("width", defaultWidth);
      if (this.loadfrom == 'dashboard') {
        $("body").find("#dasboradTaskHolder").append(this.$el);
      } else {
        $(".app_playground").append(this.$el);
        setToolTip();
      }
      $(".ws-select").selectpicker();
      return this;
    }
  });
  return taskView;
});
