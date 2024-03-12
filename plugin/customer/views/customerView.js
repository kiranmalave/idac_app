
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
  'text!../../dynamicForm/templates/linkedDropdown.html'
], function ($, _, Backbone, datepickerBT, moment, Swal, customerSingleView, customerNotesView, mailView, customerActivityView, taskSingleView, customerCollection, customerNotesCollection, customerFilterOptionModel, customerModel, customerNoteModel, appSettings, columnArrangeModalView, configureColumnsView, dynamicFormData, singleMenuModel, slugCollection, emailMasterCollection, timeselectOptions, customerRowTemp, leadGridRow, customerTemp, customerFilterTemp, linkedDropdown) {
  var customerView = Backbone.View.extend({
    plural_label: '',
    module_desc: '',
    form_label: '',
    mname: '',
    listDataGrid: [],
    paginginfo: [],
    totalRec: 0,
    View: 'list',
    module_name: 'leads',
    customerModel: customerModel,
    initialize: function (options) {
      this.toClose = "customerFilterView";
      var selfobj = this;
      selfobj.arrangedColumnList = [];
      this.filteredFields = [];
      this.totalColumns = 0;
      $(".profile-loader").show();
      $(".customMail").hide();
      $(".customMailMinimize").hide();
      $(".opercityBg").hide();
      $(".loder").show();
      $('.customMail').remove('maxActive');
      this.mname = Backbone.history.getFragment();
      permission = ROLE[this.mname];
      this.paginginfo = [],
      this.menuId = permission.menuID;
      this.appSettings = new appSettings();
      this.dynamicFormDatas = new dynamicFormData();
      this.timeselectOptions = new timeselectOptions();
      this.menuList = new singleMenuModel();
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
        selfobj.render();
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

      filterOption.set({ "menuId": this.menuId });
      searchCustomer = new customerCollection();
      this.collection = new customerCollection();
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
          // selfobj.c_metadata = JSON.parse(res.c_metadata);
          selfobj.arrangedColumnList = res.c_metadata;
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
      "change .changeBox": "changeBox",
      "click .arrangeColumns": "openColumnArrangeModal",
      "click .markCust": "markCutomer",
      "click .ccBtn": "openComposeMail",
      "click .bccBtn": "displayList",
      "click .close": "mailHide",
      "click .minimize": "minimize",
      "click .openFull": "maximize",
      "click .showMax": "showmax",
      "click .closeFull": "closeFull",
      "click .list_mode": "gridMode",
      "click .grid_mode": "gridMode",
      "click .changeStatusGrid": "changeStatusGrid",
      "click .sortColumns": "sortColumn",
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
      console.log("filterOption", filterOption);
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
      var order = $(e.currentTarget).attr("data-value");
      var selfobj = this;
      var newsetval = [];
      $("#clist").find(".up").removeClass("active");
      $("#clist").find(".down").removeClass("active");
      // var classname = $(e.currentTarget).attr("class").split(" ");
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

    openComposeMail: function (e) {
      $('.Cc').addClass('active');
      $(e.currentTarget).addClass('activeCc');
    },

    displayList: function (e) {
      $('.Bcc').addClass('active');
      $(e.currentTarget).addClass('activebcc');
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

    gridMode: function (e) {
      let selfobj = this;
      var View = $(e.currentTarget).val();
      if (View == "list") {
        $("#leadlistview").show();
        $("#leadgridview").hide();
        $(".grid_mode").removeAttr("disabled")
        $(".list_mode").attr('disabled', 'disabled');
        $("#arrangeColumns").show();
        selfobj.View = "list";
        selfobj.resetSearch();
      } else if (View == "grid") {
        $("#leadgridview").show();
        $("#leadlistview").hide();
        $(".list_mode").removeAttr("disabled")
        $(".grid_mode").attr('disabled', 'disabled');
        $(".hide").hide();
        selfobj.collection.reset();
        selfobj.View = "grid";
        selfobj.girdLazyLoad(listgridID = "", firstLoad = true);
        selfobj.setupDropable();
        selfobj.setupSortable();
        selfobj.leadCanbanSlider();
      }
    },

    girdLazyLoad: function (listgridID, firstLoad) {
      let selfobj = this;
      if (firstLoad) {
        var currPage = selfobj.paginginfo.nextpage;
      } else {
        var currPage = '';
      }
      if (currPage != undefined) {
        filterOption.set({ curpage: currPage });
      }
      if (listgridID == "") {
        $.each(this.categoryList.models, function (index, value) {
          $.each(value.attributes.sublist, function (index2, value2) {
            filterOption.set({ stages: value2.category_id });
            selfobj.listDataGrid[value2.category_id] = new customerCollection();
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
        });
      } else {
        filterOption.set({ stages: listgridID });
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
    },

    closeFull: function () {
      var ele = document.querySelector(".customMail");
      ele.classList.remove("maxActive");
      $(".closeFull").hide();
      $(".opercityBg").hide();
      var element = document.querySelector(".openFull");
      element.classList.remove("maxActive");
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
      var stdColumn = ['customer_id','company_name', 'name', 'email', 'mobile_no', 'record_type'];
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
            new configureColumnsView({ menuId: this.menuId, ViewObj: selfobj, stdColumn: stdColumn });
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
      var userID = ADMINID;
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
              data: { customerID: id, status: status, user: userID },
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
        confirmButtonText: 'Yes',
        denyButtonText: `No`,
      }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
          Swal.fire('Deleted!', '', 'success')

          var selfobj = this;
          var removeIds = [];
          var status = $(e.currentTarget).attr("data-action");
          var action = "changeStatus";
          $('#customerList input:checkbox').each(function () {
            if ($(this).is(":checked")) {
              removeIds.push($(this).attr("data-customer_id"));
            }
          });
          $(".deleteAll").hide();
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
                selfobj.filterSearch();
              }
              setTimeout(function () {
                $(e.currentTarget).html(status);
              }, 3000);

            }
          });
        } else if (result.isDenied) {
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
      switch (show) {
        case "singleCustomerData": {
          var customer_id = $(e.currentTarget).attr("data-customer_id");
          new customerSingleView({ customer_id: customer_id, menuId: this.menuId, searchCustomer: this, menuName: this.mname, form_label: selfobj.form_label });

          $('body').find(".loder");
          $(".profile-loader").hide();
          break;

        }
        case "notes": {
          $('#NoteModal').modal('toggle');
          var customer_id = $(e.currentTarget).attr("data-customer_id");
          var cust_name = $(e.currentTarget).attr("data-first_name");
          var stage_id = $(e.currentTarget).attr("data-stageid");
          new customerNotesView({ customer_id: customer_id, customerName: cust_name, stageID:stage_id, searchCustomer: this });
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
          new taskSingleView({ customer_id: customer_id, customerName: cust_name, loadFrom: "customer", searchtask: this });

          break;
        }
        case "appointment": {
          var customer_id = $(e.currentTarget).attr("data-customer_id");
          var cust_name = $(e.currentTarget).attr("data-first_name");
          var cust_mail = $(e.currentTarget).attr("data-email");
          new appointmentSingleView({ customer_id: customer_id, customerName: cust_name, cust_mail: cust_mail, loadFrom: "customer", searchappointment: this })
          $('body').find(".loder");
          break;
        }
        case "notificationView": {
          new notificationView({ menuID: this.menuId, searchreceipt: this, module_name: this.module_name });
          $('body').find(".loder");
          break;
        }
      }


    },

    resetSearch: function (stage) {
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
      if(selfobj.View == "list"){
        this.filterSearch(false);
      }else{
        filterOption.set({ "menuId": this.menuId });
        selfobj.stageColumnUpdate(stage);
      }
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
      if (selfobj.View == "list") {
        this.totalRec = this.collection.length;
        if (this.totalRec == 0) {
          $(".noCustRec").show();
          $("#leadlistview").hide();
        } else {
          if (selfobj.View == "list") {
            $(".noCustRec").hide();
            $("#leadlistview").show();
          }
        }
      } else {
        $(".noCustRec").hide();
        $("#leadlistview").hide();
      }
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
        if (column.column_name == 'created_by') {
          column.column_name = 'createdBy';
        } else if (column.column_name == 'modified_by') {
          column.column_name = 'modifiedBy';
        } else {
          column.column_name = column.column_name;
        }
      });
      if (selfobj.View == "list") {
        var template = _.template(customerRowTemp);
        $("#customerList").append(template({ customerDetails: objectModel, arrangedColumnList: this.arrangedColumnList, menuName: this.mname }));
      } else {
        var template = _.template(leadGridRow);
        objectModel.set({"lastActivityTime" : selfobj.timeselectOptions.displayRelativeTime(objectModel.attributes.last_activity_date)});
        if (objectModel.attributes.stages != 0) {
          $("#" + objectModel.attributes.stages).append(template({ customerDetails: objectModel, customerLength: this.collection.length }));
        } else {
          $("#otherStage").append(template({ customerDetails: objectModel, customerLength: this.collection.length }));
        }
        selfobj.setupDragable();
      }

      var mailTruncateElements = document.querySelectorAll('.mailtruncate');
      mailTruncateElements.forEach(function (element) {
        var textWidth = element.offsetWidth;
        var parentEle = element.parentElement;

        if (textWidth >= 100) {
          parentEle.querySelector('.tooltiptxt').style.display = 'block';
        }
        else {
          parentEle.querySelector('.tooltiptxt').style.display = 'none';
        }
      });
    },

    addAll: function () {
      $("#customerList").empty();
      this.collection.forEach(this.addOne, this);
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
    filterRender: function (e) {
      var selfobj = this;
      var isexits = checkisoverlay(this.toClose);
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

        extractedFields.forEach(function (column) {
          if (column.linkedWith != null && column.linkedWith != "" && column.linkedWith != 'undefined' && column.parentCategory != 'undefined' && column.parentCategory != "" && column.parentCategory != null) {
            selfobj.categoryList = new slugCollection();
            var matcchedID = [];
            selfobj.categoryList.fetch({
              headers: {
                'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
              }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y', category_id: column.parentCategory }
            }).done(function (res) {
              if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
              $(".popupLoader").hide();
              var child = [];
              if (res.data[0]) {
                for (var i = 0; i < res.data[0].sublist.length; i++) {
                  child[0] = res.data[0].sublist[i].category_id;
                  child[1] = res.data[0].sublist[i].categoryName;
                  matcchedID.push(child.slice());
                  // matcchedID.push(res.data[0].sublist[i].categoryName);
                }
                column.fieldOptions = matcchedID;
              }
            });
          } else {
            column.fieldOptions = column.fieldOptions;
          }
        });

        extractedFields.forEach(function (field) {
          selfobj.filteredFields.push(field);
        });

        setTimeout(function () {
          var templateData = {
            filteredFields: selfobj.filteredFields || [],
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
      if (this.View == "grid") {
        this.stageColumnUpdate(stage);
        return;
      }
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

        selfobj.totalRec = res.paginginfo.totalRecords;
        // if (selfobj.totalRec == 0) {
        //   $('#leadlistview').hide();
        //   $('.noCustRec').show();
        // } else {
        //   $('#leadlistview').show();
        //   $('.noCustRec').hide();
        // }
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

    setupDragable: function () {
      $(".leadCustomer").draggable({
        revert: "invalid",
        containment: "document",
        helper: "clone",
        cursor: "move",
        zIndex: 1000,
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
      if (customerID != "" && leadStageID != "") {
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

      console.log(typeof( selfobj.arrangedColumnList));
      this.$el.html(template({ totalRec: this.totalRec, menuName: this.mname, closeItem: this.toClose, pluralLable: this.plural_label, "moduleDesc": selfobj.module_desc, "arrangedColumnList": selfobj.arrangedColumnList, categoryList: selfobj.categoryList.models }));
      $(".app_playground").append(this.$el);
      $(".loder").hide();
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
          selfobj.girdLazyLoad(listgridID, firstLoad = false);
        }
      });
      return this;
    }
  });

  return customerView;

});