
define([
  'jquery',
  'underscore',
  'backbone',
  'datepickerBT',
  'select2',
  'moment',
  '../views/taxInvoiceSingleView',
  '../views/quotationToInvoiceView',
  '../collections/taxInvoiceCollection',
  '../models/taxInvoiceFilterOptionModel',
  '../../core/views/columnArrangeModalView',
  '../../core/views/configureColumnsView',
  '../../core/views/appSettings',
  '../../dynamicForm/collections/dynamicFormDataCollection',
  '../../menu/models/singleMenuModel',
  '../../dynamicForm/collections/dynamicStdFieldsCollection',
  '../../category/collections/slugCollection',
  'text!../templates/taxInvoiceRow.html',
  'text!../templates/taxInvoice_temp.html',
  'text!../../customModule/templates/customFilterOption_temp.html',
  'text!../../dynamicForm/templates/linkedDropdown.html',
  '../../core/views/mailView',

], function ($, _, Backbone, datepickerBT, select2, moment, taxInvoiceSingleView,quotationToInvoiceView, taxInvoiceCollection, taxInvoiceFilterOptionModel, columnArrangeModalView, configureColumnsView, appSettings, dynamicFormData, singleMenuModel, dynamicStdFieldsCol, slugCollection, taxInvoiceRowTemp, taxInvoice_temp, customFilterTemp, linkedDropdown,mailView) {

  var taxInvoiceView = Backbone.View.extend({
    module_desc: '',
    plural_label: '',
    menuName: '',
    form_label: '',
    categoryList1 : new slugCollection(),
    initialize: function (options) {
      this.startX = 0;
      this.startWidth = 0;
      this.$handle = null;
      this.$table = null;
      this.pressed = false;
      this.toClose = "taxInvoiceFilterView";
      var selfobj = this;
      $(".customMail").hide();
      $(".customMailMinimize").hide();
      $(".opercityBg").hide();
      $(".loder").show();
      $('.customMail').remove('maxActive');
      $(".maxActive").hide();
      selfobj.arrangedColumnList = [];
      this.filteredFields = [];
      selfobj.filteredData = [];
      $(".profile-loader").show();
      var mname = Backbone.history.getFragment();
      this.menuName = mname;
      permission = ROLE[mname];
      // console.log(ROLE);
      var getmenu = permission.menuID;
      this.menuId = getmenu;
      
      this.appSettings = new appSettings();
      this.dynamicFormDatas = new dynamicFormData();
      this.menuList = new singleMenuModel();
      this.dynamicStdFieldsList = new dynamicStdFieldsCol();
      // Pass a callback to handle the result of getMenuList
      this.appSettings.getMenuList(this.menuId, function (plural_label, module_desc, form_label, result) {
        // console.log(plural_label);
        selfobj.plural_label = plural_label;
        selfobj.module_desc = module_desc;
        selfobj.form_label = form_label;
        readyState = true;
        selfobj.getColumnData();
        // selfobj.getMenuList();
        if (result.data[0] != undefined) {
          selfobj.tableName = result.data[0].table_name;
        }
        if (selfobj.dynamicStdFieldsList && selfobj.dynamicStdFieldsList != undefined) {
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
      });
      
      filterOption = new taxInvoiceFilterOptionModel();
      if (this.menuName == "receipt") {
        filterOption.set({ record_type: "receipt" });
        this.record_type = 'receipt';
      } else if (this.menuName == "delivery") {
        filterOption.set({ record_type: "delivery" });
        this.record_type = 'receipt';
      } else if (this.menuName == "quotation") {
        filterOption.set({ record_type: "quotation" });
        this.record_type = 'quotation';
      } else if (this.menuName == "invoice") {
        filterOption.set({ record_type: "invoice" });
        this.record_type = 'invoice';
      } else if (this.menuName == "proforma") {
        filterOption.set({ record_type: "proforma" });
        this.record_type = 'proforma';
      }
      filterOption.set({ company_id: $.cookie('company_id') });
      this.categoryList1.fetch({headers:{
        'contentType':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
        },error: selfobj.onErrorHandler,type:'post', data:{status:'active',getAll:'Y'}}).done(function(res){
        if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
        $(".popupLoader").hide();
        $('.loder').hide();
        selfobj.render();
      });
      filterOption.set({ "menuId": this.menuId });
      filterOption.set({ "getAll": 'Y' });
      this.collection = new taxInvoiceCollection();
      this.collection.on('add', this.addOne, this);
      this.collection.on('reset', this.addAll, this);
      this.render();
   
    },

    getMenuList: function (e) {
      var selfobj = this;
      selfobj.menuList.set({ "menuID": this.menuId });
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
        if (result.data[0] != undefined) {
          selfobj.tableName = result.data[0].table_name;
        }
        if (selfobj.dynamicStdFieldsList && selfobj.dynamicStdFieldsList != undefined) {
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
            if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
            $(".popupLoader").hide();
          });
        }
      });
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
        if (selfobj.metadata) {
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

        //   if (res.metadata && res.c_metadata) {
        //     for (const rowKey in selfobj.metadata) {
        //       const row = selfobj.metadata[rowKey];
        //       for (const colKey in row) {
        //         const column = row[colKey];
        //         if (column.fieldID) {
        //           const cMetadataItem = selfobj.c_metadata.find(item => item.fieldID == column.fieldID);
        //           if (cMetadataItem) {
        //             Object.assign(cMetadataItem, column);
        //           }
        //         }
        //       }
        //     }

        //     selfobj.c_metadata = selfobj.c_metadata.filter(item => {
        //       return Object.values(selfobj.metadata).some(row => {
        //         return Object.values(row).some(col => col.fieldID == item.fieldID);
        //       });
        //     });
        //     selfobj.arrangedColumnList = selfobj.c_metadata;
        // }
        selfobj.render();
        selfobj.getModuleData();
      });
    },

    getModuleData: function () {
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
      selfobj.render();
    },

    events:
    {
      "blur #textval": "setFreeText",
      "change .range": "setRange",
      "change #textSearch": "settextSearch",
      "click .multiOptionSel": "multioption",
      "change #filterCName": "updateOtherDetails",
      "click #filterSearch": "filterSearch",
      "click #filterOption": "filterRender",
      "click .resetval": "resetSearch",
      "click .loadview": "loadSubView",
      "click .loadMedia": "loadMedia",

      "change .txtchange": "updateOtherDetails",
      "click .showpage": "loadData",
      "click .cancelInvoice": "cancelInvoice",
      "click .arrangeColumns": "openColumnArrangeModal",
      "click .invoiceStatus": "invoiceStatusChange",
      "click .deleteAll": "deleteInvoices",
      "change .dropval": "singleFilterOptions",
      "click .sortColumns": "sortColumn",
      "click .paymentStatus": "paymentStatus",
      "click .savePayment": "savePayment",
      'mousedown .table-resizable .resize-bar': 'onMouseDown',
      'mousemove .table-resizable th, .table-resizable td': 'onMouseMove',
      'mouseup .table-resizable th, .table-resizable td': 'onMouseUp',
      'dblclick .table-resizable thead': 'resetColumnWidth',
      "click .close": "mailHide",
      "click .minimize": "minimize",
      "click .openFull": "maximize",
      "click .showMax": "showmax",
    },
    loadMedia: function (e) {
      $('.upload').show();
      $('.dotborder').hide();
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
    singleFilterOptions: function (e) {
      e.stopPropagation();
      var selfobj = this;

      var toID = $(e.currentTarget).attr("id");
      var valuetxt = $(e.currentTarget).val().join(",");
      var newdetails = [];
      newdetails["" + toID] = valuetxt;
      filterOption.set(newdetails);
    },
    paymentStatus:function(e){      
      e.stopPropagation();
      var selfobj = this;
      $("#paymentModal").modal('show');
      var action = $(e.currentTarget).attr('data-action');
      var inID = $(e.currentTarget).attr('data-id');
      $('.ws-select').selectpicker();

      selfobj.getPaymentLogs(inID);
      $('#payment_date_'+inID).datepickerBT({
          format: "dd-mm-yyyy",
          todayBtn: "linked",
          clearBtn: true,
          todayHighlight: true,
          StartDate: new Date(),
          numberOfMonths: 1,
          autoclose: true,
          filterCName: true
        }).on('changeDate', function (ev) {
          $('#payment_date_'+inID).change();
          p_date = $('#payment_date_'+inID).val();
          console.log(p_date);
        });
      $('#payment_date').datepickerBT({
        format: "dd-mm-yyyy",
        todayBtn: "linked",
        clearBtn: true,
        todayHighlight: true,
        StartDate: new Date(),
        numberOfMonths: 1,
        autoclose: true,
        filterCName: true
      }).on('changeDate', function (ev) {
        $('#payment_date').change();
      });
      this.uploadFileEl = $("#attachement").RealTimeUpload({
        text: 'Drag and Drop or Select a File to Upload.',
        maxFiles: 0,
        maxFileSize: 4194304,
        uploadButton: false,
        notification: true,
        autoUpload: false,
        extension: ['png', 'jpg', 'jpeg', 'gif', 'pdf','docx', 'doc', 'xls', 'xlsx'],
        thumbnails: true,
        action: APIPATH + 'logsUpload/',
        element: 'attachement',
       
        onSucess: function () {
          // selfobj.model.attributes.mediaArr.push(this.elements.uploadList[0].name);
          console.log(this.elements.uploadList[0].name);
          $('.modal-backdrop').hide();
        }
      });
      $(".cancelBtn").click(function(e){
        selfobj.filterSearch();
        $('#saveChangesBtn').unbind();
        $("#paymentModal").modal('hide'); 
        $(".modal-backdrop").hide();
      });
      
      $("#saveChangesBtn").click(function(e){
        // e.stopPropagation();
        var invoiceID = inID; 
        var action = $(e.currentTarget).attr('data-action');
        var paymentDate = $('#payment_date').val();
        var record_type = selfobj.menuName;
        var paymentAmt = $('#pending_amount').val();  
        var transaction_id = $('#transaction_id').val();
        var mode_of_payment = $('#mode_of_payment').val();
        var payment_note = $('#payment_note').val();
        $.ajax({
          url:APIPATH+'taxInvoice/partialPayment',
          method:'POST',
          data:{payment_note:payment_note,record_type:record_type,invoiceID:invoiceID,action:action,paymentDate:paymentDate,paymentAmt:paymentAmt,transaction_id:transaction_id,mode_of_payment:mode_of_payment},
          datatype:'JSON',
          beforeSend: function(request) {
            //$(e.currentTarget).html("<span>Updating..</span>");
            request.setRequestHeader("token",$.cookie('_bb_key'));
            request.setRequestHeader("SadminID",$.cookie('authid'));
            request.setRequestHeader("contentType",'application/x-www-form-urlencoded');
            request.setRequestHeader("Accept",'application/json');
          },
          success:function(res){
            if (res.lastlogID != undefined) {
              selfobj.logID = res.lastlogID;
            }
            if(res.flag == "F")
              alert(res.msg);
            if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
            if(res.flag == "S"){
              
                let url = APIPATH + 'logsUpload/' + selfobj.logID +'/'+invoiceID;
                selfobj.uploadFileEl.elements.parameters.action = url;
                selfobj.uploadFileEl.prepareUploads(selfobj.uploadFileEl.elements);

                $('#payment_date').val('');
                $('#pending_amount').val('');    
              
                selfobj.filterSearch();
              $('#saveChangesBtn').unbind();
              $("#paymentModal").modal('hide');
              $(".modal-backdrop").hide();
            }
          }
        });
    });
  },
  getPaymentLogs:function(invoiceID){
    $('#paylogs').empty();
    console.log(invoiceID);
    $.ajax({
      url:APIPATH+'paymentLogsList/'+invoiceID,
      method:'POST',
      data:{},
      datatype:'JSON',
      beforeSend: function(request) {
        //$(e.currentTarget).html("<span>Updating..</span>");
        request.setRequestHeader("token",$.cookie('_bb_key'));
        request.setRequestHeader("SadminID",$.cookie('authid'));
        request.setRequestHeader("contentType",'application/x-www-form-urlencoded');
        request.setRequestHeader("Accept",'application/json');
      },
      success:function(res){
        if(res.flag == "F")
          console.log(res.msg);
        if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
        if(res.flag == "S"){
         console.log("payment Logs",res.data);
          if(res.data.length > 0){

           var tbl = '<thead id="thead"><tr class="headings"><th class="column-title">Receipt no</th><th class="column-title">Amount</th><th class="column-title">Transaction Id</th><th class="column-title">Payment Date</th><th class="column-title">Mode of Payment</th><th class="column-title">Payment Notes</th><th class="column-title">Attachment</th><th>Download</th></tr></thead><tbody id="paymentLogList"></tbody>'
           $('#paylogs').append(tbl); 
           var row = '';
            $.each(res.data, function(key, value) {
              var att = '<a href="'+UPLOADS+'/invoiceLog/'+value.invoice_id+'/'+value.receipt_id+'/'+value.attachement+'" target="_blank"data-toggle="tooltip" data-placement="top" title="View Attachment" style="color: #5f6368;"><span class="material-symbols-outlined">visibility</span></a>';
              if(value.attachement== '')
              {
                row = '<tr><td>'+value.receipt_number+'</td><td>'+value.amount+'</td><td>'+value.transaction_id+'</td><td>'+formatDate(value.payment_log_date)+'</td><td>'+value.paymentMode+'</td><td>'+value.notes+'</td><td></td><td class="text-center"><a href="'+APIPATH+'printReceipt/'+value.receipt_id+'" target="_blank" data-toggle="tooltip" data-placement="top" title="Download" style="color: #5f6368;"><span class="material-symbols-outlined">download</span></a></td></tr>'
              }else
              {
                row = '<tr><td>'+value.receipt_number+'</td><td>'+value.amount+'</td><td>'+value.transaction_id+'</td><td>'+formatDate(value.payment_log_date)+'</td><td>'+value.paymentMode+'</td><td>'+value.notes+'</td><td class="text-center">'+att+'</td><td class="text-center"><a href="'+APIPATH+'printReceipt/'+value.receipt_id+'" target="_blank" data-toggle="tooltip" data-placement="top" title="Download" style="color: #5f6368;"><span class="material-symbols-outlined">download</span></a></td></tr>'
              }
              $('#paymentLogList').append(row);
            });
          }
        }
      }
    });
  },
  
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
    updateOtherDetails: function(e){
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

    invoiceStatusChange:function(e){

      var selfobj = this;
      var removeIds = [];
      var status = $(e.currentTarget).attr("data-action");
      var action = "changeStatus";
      removeIds.push($(e.currentTarget).attr("data-id"));
      $(".action-icons-div").hide();
      var idsToRemove = removeIds.toString();

      $.ajax({
        url: APIPATH + 'taxInvoice/status',
        method: 'POST',
        data: { list: idsToRemove, action: action, status: status , record_type : this.record_type},
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
    deleteInvoices: function (e) {
      var selfobj = this;
      var removeIds = [];

      var action = "delete";
      $('.invoice-table input:checkbox').each(function () {
        if ($(this).is(":checked") && $(this).attr('data-status') == 'draft') {
          removeIds.push($(this).attr("data-id"));
          console.log($(this).attr("data-id"));
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

      console.log(removeIds);
      var idsToRemove = removeIds.toString();
      if (idsToRemove == '') {
        alert("Please select at least one record.");
        $('.checkall').prop('checked', false)
        return false;
      }
      $.ajax({
        url: APIPATH + 'deleteTaxInvoices',
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
            selfobj.filterSearch();
            $('.checkall').prop('checked', false);
            $('.deleteAll').hide();
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
      console.log(selfobj.form_label);
      var show = $(e.currentTarget).attr("data-view");
      switch (show) {
        case "singletaxInvoiceData": {
          var invoiceID = $(e.currentTarget).attr("data-invoiceID");
          var taxInvoicesingleview = new taxInvoiceSingleView({ invoiceID: invoiceID, searchtaxInvoice: this, menuId: selfobj.menuId, form_label: selfobj.form_label, menuName: this.menuName });
          break;
        }
        case "convertInvoice": {
          var invoiceID = $(e.currentTarget).attr("data-invoiceID");
          var taxInvoicesingleview = new quotationToInvoiceView({ invoiceID: invoiceID, searchtaxInvoice: this, menuId: selfobj.menuId, form_label: selfobj.form_label, menuName: this.menuName  });
          break;
        }
        case "mail": {
          selfobj.getPdf(e);
        
         
          break;
        }
      }
    },
    getPdf : function(e)
    {
      var selfobj = this;
      var invoiceID = $(e.currentTarget).attr('data-invoiceID');
      selfobj.invoicePdfName = '' ;
      $.ajax({
        url: APIPATH + 'getPdf/' + invoiceID,
        method: 'GET',
        datatype: 'JSON',
        beforeSend: function (request) {
          request.setRequestHeader("token", $.cookie('_bb_key'));
          request.setRequestHeader("SadminID", $.cookie('authid'));
          request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
          request.setRequestHeader("Accept", 'application/json');
        },
        success: function (res) {
          if (res.flag == "S") {
            if (res.data != '') {
              selfobj.invoicePdfName = res.data;
              console.log('invoicePdfName' , selfobj.invoicePdfName);

              $(".customMail").show();
              $('.customMail').remove('maxActive');
              var customer_id = $(e.currentTarget).attr("data-customer_id");
              var cust_name = $(e.currentTarget).attr("data-first_name");
              var cust_mail = $(e.currentTarget).attr("data-custMail");
              new mailView({ customer_id: customer_id, customerName: cust_name, customer_mail: cust_mail , invoicePDf : selfobj.invoicePdfName });
              $('body').find(".loder");

            }
          }else
          {
            alert(res.msg);
          }
        }
      });
    },
    showmax: function () {
      $(".customMail").show();
      $(".customMailMinimize").hide();
      var ele = document.querySelector(".openFull");
      ele.classList.remove("maxActive");
      $('.openFull').remove('maxActiveRemove');
      $(".maxActive").hide();
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
      $('#textSearch option[value=invoiceID]').attr('selected', 'selected');
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
      selfobj.totalRec = selfobj.collection.length;
      console.log('selfobj.totalRec = ',selfobj.totalRec);
      if (selfobj.totalRec == 0) {
        $(".noCustAdded").show();
        $(".invoiceRight").hide();
      } else {
          $(".noCustAdded").hide();
          $(".invoiceRight").show();
      }

      var template = _.template(taxInvoiceRowTemp);
      if (selfobj.arrangedColumnList) {
        selfobj.arrangedColumnList.forEach((column) => {
          if (column.fieldType == 'Datepicker') {
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
      
      $("#taxInvoiceList").append(template({ categoryList : selfobj.categoryList1.models,taxInvoiceDetails: objectModel, arrangedColumnList: this.arrangedColumnList,menuName:this.menuName  }));
    },
    addAll: function () {
      $("#taxInvoiceList").empty();
      this.collection.forEach(this.addOne, this);
    },
    filterRender: function (e) {
      var isexits = checkisoverlay(this.toClose);
      var selfobj = this;
      if (!isexits) {
        var source = customFilterTemp;
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
        const filteredFields = extractedFields.filter(item => item != "");
        selfobj.filteredFields = filteredFields;

        selfobj.filteredFields.forEach(function (column) {
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
          //     if (res.data[0]) {
          //       for (var i = 0; i < res.data[0].sublist.length; i++) {
          //         matcchedID.push(res.data[0].sublist[i].categoryName);
          //       }
          //       column.fieldOptions = matcchedID.join(',');
          //     }
          //   });
          // } else {
            column.fieldOptions = column.fieldOptions;
          // }
        });

        const resDataFieldNames = selfobj.filteredFields.map(item => item.column_name);
        var filteredDatas = selfobj.dynamicStdFieldsList.filter(fieldName => !resDataFieldNames.includes(fieldName.attributes.Field));
        var Numeric = ["TINYINT", "SMALLINT", "MEDIUMINT", "INT", "BIGINT", "DECIMAL", "FLOAT", "DOUBLE", "REAL", "BIT", "BOOLEAN", "SERIAL"];
        var Text = ["CHAR", "VARCHAR", "TEXT", "TINYTEXT", "MEDIUMTEXT", "LONGTEXT", "BINARY", "VARBINARY", "BLOB", "TINYBLOB", "MEDIUMBLOB", "LONGBLOB"];
        var Datepicker = ["DATE", "DATETIME", "TIMESTAMP", "YEAR"];
        Numeric = Numeric.map(function (element) {
          return element.toLowerCase();
        });
        Text = Text.map(function (element) {
          return element.toLowerCase();
        });
        Datepicker = Datepicker.map(function (element) {
          return element.toLowerCase();
        });

        filteredDatas.forEach(function (data) {
          if (!selfobj.filteredFields.some(field => field.column_name === data.attributes.Field)) {
            const fieldType = data.attributes.Type;
            const startIndex = fieldType.indexOf("(");
            if (startIndex !== -1 && fieldType.startsWith("enum")) {
              const endIndex = fieldType.indexOf(")");
              const extractedValues = fieldType.substring(startIndex + 1, endIndex);
              var enumValues = extractedValues.split(',').map(value => value.trim()).join(',');
              var fieldOptions = enumValues.replace(/'/g, '');
            }
            const extractedType = startIndex !== -1 ? fieldType.substring(0, startIndex) : fieldType;
            if (extractedType == 'varchar' || Text.includes(data.attributes.Type)) {
              data.attributes.Type = 'Text';
            } else if (extractedType == 'enum' || data.attributes.Type == 'set') {
              data.attributes.Type = 'Dropdown';
            } else if (extractedType == 'int' || extractedType == 'int unsigned' || Numeric.includes(data.attributes.Type)) {
              data.attributes.Type = 'Numeric';
            } else if (Datepicker.includes(data.attributes.Type)) {
              data.attributes.Type = 'Datepicker';
            } else {
              data.attributes.Type = data.attributes.Type;
            }
            const newField = {
              fieldType: data.attributes.Type,
              fieldLabel: formatFieldLabel(data.attributes.Field),
              column_name: data.attributes.Field,
              fieldOptions: fieldOptions,
            };

            function formatFieldLabel(label) {
              return label.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
            }
            selfobj.filteredFields.push(newField);
          }
        });

        selfobj.filteredFields = selfobj.filteredFields.filter(item => item.column_name !== 'created_by' && item.column_name !== 'modified_by');
        // setTimeout(function () {

          var templateData = {
            filteredFields: selfobj.filteredFields || [],
          };
          cont.html(template(templateData));
          cont.attr('id', this.toClose);
          $(".overlay-main-container").removeClass("open");
          $(".ws_filterOptions").append(cont);
          $(".ws_filterOptions").addClass("open");
          $(".ws-select").selectpicker();
          $(e.currentTarget).addClass("active");
          selfobj.setValues();

        //   selfobj.setupFilter();
        // },1500);
      } else {
        var isOpen = $(".ws_filterOptions").hasClass("open");
        if (isOpen) {
          $(".ws_filterOptions").removeClass("open");
          $(e.currentTarget).removeClass("active");
          return;
        } else {
          $(e.currentTarget).addClass("active");
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
    filterSearch: function (isClose = false) {
      if (isClose && typeof isClose != 'object') {
        $('.' + this.toClose).remove();
        rearrageOverlays();
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
      var index = $element.attr("data-index");
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
    cancelInvoice: function (e) {
      var selfobj = this;
      e.preventDefault();
      var invoiceID = $(e.currentTarget).attr("data-invoiceID");
      $.ajax({
        url: APIPATH + 'cancelInvoice/' + invoiceID,
        method: 'GET',
        datatype: 'JSON',
        beforeSend: function (request) {
          request.setRequestHeader("token", $.cookie('_bb_key'));
          request.setRequestHeader("SadminID", $.cookie('authid'));
          request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
          request.setRequestHeader("Accept", 'application/json');
        },
        success: function (res) {
          if (res.flag == "S") {
            selfobj.filterSearch();
          } else {
            alert(res.msg);
          }
        }
      });
    },

    openColumnArrangeModal: function (e) {
      let selfobj = this;
      var show = $(e.currentTarget).attr("data-action");
      // var stdColumn = ['invoiceNumber', 'customerName', 'invoiceTotal', 'grossAmount', 'created_date'];
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
            // new columnArrangeModalView({menuId: this.menuId,ViewObj: selfobj,stdColumn:stdColumn});
            new configureColumnsView({ menuId: this.menuId, ViewObj: selfobj, stdColumn: stdColumn });
            $(e.currentTarget).addClass("BG-Color");
          }
          break;
        }
      }
    },

    setupFilter: function () {
      var selfobj = this;
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

          var linkedClassElement = $("body").find('.dropLinked_' + column.fieldID);
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
                  var dropdownClass = (selection == 'yes') ? 'multiSelectField' : 'selectField';
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

          $('.multiSelectField.selected').each(function () {
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

      }
    },

    render: function () {
      var selfobj = this;
      var template = _.template(taxInvoice_temp);
      this.$el.html(template({ closeItem: this.toClose, "pluralLable": selfobj.plural_label, "moduleDesc": selfobj.module_desc, "arrangedColumnList": selfobj.arrangedColumnList}));
      var numColumns = selfobj.arrangedColumnList ? selfobj.arrangedColumnList.length : 0;
      var defaultWidth = numColumns <= 5 ? '100%' : (numColumns * 20) + '%';
      $("#clist").css("width", defaultWidth);
      $(".ws-select").selectpicker();
      $(".main_container").append(this.$el);
      return this;
    }
  });

  return taxInvoiceView;

});
