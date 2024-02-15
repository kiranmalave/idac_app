define([
  'jquery',
  'underscore',
  'backbone',
  'validate',
  'inputmask',
  'datepickerBT',
  'typeahead',
  'icheck',
  'select2',
  'moment',
  //'../../company/collections/companyCollection',
  '../../core/views/multiselectOptions',
  '../../customer/collections/customerCollection',
  '../models/singleTaxInvoiceModel',
  '../../dynamicForm/views/dynamicFieldRender',
  '../collections/invoiceItems',
  'text!../templates/taxInvoiceSingle_temp.html',
], function ($, _, Backbone, validate, inputmask, datepickerBT, typeahead, icheck, select2, moment, multiselectOptions, customerCollection, singleTaxInvoiceModel, dynamicFieldRender, invoiceItems, taxInvoice_temp) {

  var taxInvoiceSingleView = Backbone.View.extend({
    model: singleTaxInvoiceModel,
    initialize: function (options) {
      this.dynamicData = null;
      this.toClose = "taxinvoiceSingleView";
      this.customerID = options.customerID;
      var selfobj = this;
      $('#taxInvoiceData').remove();
      scanDetails = options.searchtaxInvoice;
      $(".popupLoader").show();
      $(".modal-dialog").addClass("modal-lg");
      // var companyList = new companyCollection();
      invoiceItemsDetails = new invoiceItems();
      this.getnarration();
      this.model = new singleTaxInvoiceModel();
      if (this.customerID != "") {
        this.model.set({ "customer_id": this.customerID });
      }
      this.dynamicFieldRenderobj = new dynamicFieldRender({ ViewObj: selfobj, formJson: {} });
      this.multiselectOptions = new multiselectOptions();
      customerList = new customerCollection();
      scanDetails = options.searchtaxInvoice;
      $(".popupLoader").show();
      this.model.set({ year: moment().year(), reportYear: moment().year() });

      customerList.fetch({
        headers:
        {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, data: { status: 'active', getAll: 'Y' }
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".profile-loader").hide();
        selfobj.model.set("customerList", res.data);
        selfobj.render();
      });
      console.log(this.model);
      // companyList.fetch({headers: {
      //     'contentType':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
      //   },error: selfobj.onErrorHandler,type:'POST',data:{getAll:'Y'}}).done(function(res){
      //     if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
      //     $(".popupLoader").hide();
      //     selfobj.model.set("companyList",res.data);
      //     selfobj.render();
      //   });

      if (options.invoiceID != "" && options.invoiceID != null) {
        this.model.set({ invoiceID: options.invoiceID });
        this.model.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler
        }).done(function (res) {
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          $(".popupLoader").hide();
          selfobj.render();
          selfobj.getinfoSetting();
          selfobj.setValues();
        });
      } else {
        console.log("called");
        selfobj.getinfoSetting();
        selfobj.render();
        $(".popupLoader").hide();
      }

    },
    events:
    {
      "click .saveTaxInvoiceDetails": "saveTaxInvoiceDetails",
      "click .item-container li": "setValues",
      "blur .txtchange": "updateOtherDetails",
      "change .dropval": "updateOtherDetails",
      "click .multiSel": "setValues",
      "blur .amtChange": "rowTotal",
      "click #addRow": "addemptyRow",
      "click .del-row": "delRow",
      "change .updateAmt": "rowTotal",
      "change .setnarr": "setnarration",
    },
    attachEvents: function () {
      // Detach previous event bindings
      this.$el.off('click', '.saveTaxInvoiceDetails', this.saveTaxInvoiceDetails);
      // Reattach event bindings
      this.$el.on('click', '.saveTaxInvoiceDetails', this.saveTaxInvoiceDetails.bind(this));
      this.$el.off('click', '.item-container li', this.setValues);
      this.$el.on('click', '.item-container li', this.setValues.bind(this));
      this.$el.off('click', '.multiSel', this.setValues);
      this.$el.on('click', '.multiSel', this.setValues.bind(this));
      this.$el.off('change', '.dropval', this.updateOtherDetails);
      this.$el.on('change', '.dropval', this.updateOtherDetails.bind(this));
      this.$el.off('blur', '.txtchange', this.updateOtherDetails);
      this.$el.on('blur', '.txtchange', this.updateOtherDetails.bind(this));
      this.$el.off('blur', '.amtChange', this.rowTotal);
      this.$el.on('blur', '.amtChange', this.rowTotal.bind(this));
      this.$el.off('click', '#addRow', this.addemptyRow);
      this.$el.on('click', '#addRow', this.addemptyRow.bind(this));
      this.$el.off('click', '.del-row', this.delRow);
      this.$el.on('click', '.del-row', this.delRow.bind(this));
      this.$el.off('change', '.updateAmt', this.rowTotal);
      this.$el.on('change', '.updateAmt', this.rowTotal.bind(this));
      this.$el.off('change', '.setnarr', this.setnarration);
      this.$el.on('change', '.setnarr', this.setnarration.bind(this));
    },
    onErrorHandler: function (collection, response, options) {
      alert("Something was wrong ! Try to refresh the page or contact administer. :(");
      $(".profile-loader").hide();
    },
    addemptyRow: function (e) {
      e.preventDefault();
      var lastID = $("tr.item-list-box:last").attr("id");
      var lasts = lastID.split("-");
      var lastDetails = parseInt(lasts[1]);
      var sel = '<select id="narr_' + (lastDetails + 1) + '" name="narr_' + (lastDetails + 1) + '" class="form-control dropval setnarr"><option value="">Type</option>';
      $.each(this.model.get("narrList"), function (key, val) {
        sel = sel + '<option value="' + val.invoiceChargeID + '">' + val.invoiceChargeName + '</option>';
      }); sel = sel + '</select>';
      var temprow = '<tr id="item-' + (lastDetails + 1) + '" class="item-list-box"><td class="sno">' + (lastDetails + 1) + '</td><td>' + sel + '</td><td><input type="text" name="itemName_' + (lastDetails + 1) + '" id="itemName_' + (lastDetails + 1) + '" class="form-control"></td><td><input type="text" name="itemQuantity_' + (lastDetails + 1) + '" id="itemQuantity_' + (lastDetails + 1) + '" class="form-control amtChange digits" value="0"></td><td><input type="text" name="itemUnit_' + (lastDetails + 1) + '" id="itemUnit_' + (lastDetails + 1) + '" class="form-control"></td><td class="text-right"><input type="text" name="itemRate_' + (lastDetails + 1) + '" id="itemRate_' + (lastDetails + 1) + '" class="form-control amtChange digits" value="0"></td><td class="text-right diginum" id="itemtotal_' + (lastDetails + 1) + '"></td><td class="text-right"><button id="itemdel_' + (lastDetails + 1) + '" class="del-row btn-small btn-default"><i class="fa fa-trash" aria-hidden="true"></i></button></td></tr>';
      $(".items-holder").append(temprow);
      setTimeout(function () {
        var di = "itemName_" + (lastDetails + 1);
        $("#" + di).focus();
      }, 200);
      $('.digits').inputmask('Regex', { regex: "^[0-9]{1,15}(\\.\\d{1,2})?$" });
      $('.percentage').inputmask('Regex', { regex: "^[0-9]{1,2}(\\.\\d{1,2})?$" });
      this.reArrangeIndex();
    },
    getnarration: function () {
      selfobj = this;
      $.ajax({
        url: APIPATH + 'getNarration',
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
            selfobj.model.set({ "narrList": res.data });
            selfobj.render();
          }
        }
      });
    },
    getinfoSetting: function () {
      selfobj = this;
      $.ajax({
        url: APIPATH + 'infoSettingsList/1',
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
            selfobj.model.set({ "stateGstPercent": res.data[0].stateGst });
            selfobj.model.set({ "centralGstPercent": res.data[0].centralGst });
            selfobj.model.set({ "interGstPercent": res.data[0].interGst });
            console.log(selfobj.model.attributes);
            selfobj.render();
          }
        }
      });
    },
    setnarration: function (e) {
      var id = $(e.currentTarget).val();
      var tid = $(e.currentTarget).attr("id").split("_");
      var nlist = selfobj.model.get("narrList");
      $.each(nlist, function (key, value) {

        if (id == value.invoiceChargeID) {
          $("#itemName_" + tid[1]).val(value.invoiceChargeNarr);
        }
      });
    },
    rowTotal: function (e) {

      var issgst = $('#issgst').is(":checked");
      var iscgst = $('#iscgst').is(":checked");
      var isigst = $('#isigst').is(":checked");
      var subtotal = 0;
      var sgst = 0;
      var cgst = 0;
      var igst = 0;
      var round = 0;
      var GrossTotal = 0;

      var infoSGST = this.model.get("stateGstPercent");
      var infoCGST = this.model.get("centralGstPercent");
      var infoIGST = this.model.get("interGstPercent");
      $("tr.item-list-box").each(function (key, value) {
        var lastID = $(this).attr("id");
        var lasts = lastID.split("-");
        var lastDetails = lasts[1];
        var rowtotal = (parseFloat($("#itemQuantity_" + lastDetails).val()) * parseFloat($("#itemRate_" + lastDetails).val()));
        $("#itemtotal_" + lastDetails).html(numberFormat(rowtotal, 2));
        subtotal = subtotal + rowtotal;
        if (issgst) {
          sgst = parseFloat(subtotal * infoSGST / 100);
        }
        if (iscgst) {
          cgst = parseFloat(subtotal * infoCGST / 100);
        }
        if (isigst) {
          igst = parseFloat(subtotal * infoIGST / 100);
        }
      });
      GrossTotal = subtotal + sgst + cgst + igst;
      $(".subTotal").html(numberFormat(subtotal, 2));
      $(".sgst").html(numberFormat(sgst, 2));
      $(".cgst").html(numberFormat(cgst, 2));
      $(".igst").html(numberFormat(igst, 2));
      $(".grossTotal").html(Math.round(numberFormat(GrossTotal, 2)));
      var rrd = Math.round(numberFormat(GrossTotal, 2)) - GrossTotal;
      $(".roundOff").html(numberFormat(rrd, 2));
      $(".diginum").digits();
    },
    delRow: function (e) {
      e.preventDefault();
      var lastID = $(e.currentTarget).attr("id");
      var lasts = lastID.split("_");
      var lastDetails = lasts[1];
      $("#item-" + lastDetails).remove();
      this.rowTotal(e);
      this.reArrangeIndex();
    },
    reArrangeIndex: function () {
      var i = 1;
      $("tr.item-list-box").each(function (key, value) {
        $(this).find(".sno").html(i);
        i++;
      });
    },
    updateOtherDetails: function (e) {

      var valuetxt = $(e.currentTarget).val();
      var toID = $(e.currentTarget).attr("id");
      var newdetails = [];
      newdetails["" + toID] = valuetxt;
      this.model.set(newdetails);

      console.log(this.model);
    },
    setOldValues: function () {
      var selfobj = this;
      setvalues = ["status"];
      selfobj.multiselectOptions.setValues(setvalues, selfobj);
    },
    setValues: function (e) {
      var selfobj = this;
      var da = selfobj.multiselectOptions.setCheckedValue(e);
      selfobj.model.set(da);
    },
    saveTaxInvoiceDetails: function (e) {
      e.preventDefault();
      invoiceItemsDetails.reset();
      var selfobj = this;
      var tmpinvoiceID = this.model.get("invoiceID");
      var invoiceID = selfobj.model.get("invoiceID");
      var customerID = selfobj.model.get("customer_id");
      var invoiceDate = $("#invoiceDate").val();
      var processingYear = $("#reportYear").val();
      var processingMonth = $("#reportMonth").val();
      var traineeCount = $("#traineeCount").val();
      var issgst = $('#issgst').is(":checked");
      var iscgst = $('#iscgst').is(":checked");
      var isigst = $('#isigst').is(":checked");
      var infoSGST = this.model.get("stateGstPercent");
      var infoCGST = this.model.get("centralGstPercent");
      var infoIGST = this.model.get("interGstPercent");

      if (issgst) {
        var isSgst = "yes";
      } else {
        var isSgst = "no";
      }
      if (iscgst) {
        var isCgst = "yes";
      } else {
        var isCgst = "no";
      }
      if (isigst) {
        var isIgst = "yes";
      } else {
        var isIgst = "no";
      }


      if (tmpinvoiceID != '' || tmpinvoiceID != 0) {
        var invoiceID = tmpinvoiceID;
      } else {
        var invoiceID = null;
      }
      var error = [];

      // Set header Information
      var InheaderInfo = { "invoiceID": invoiceID, "processingYear": processingYear, "processingMonth": processingMonth, "traineeCount": traineeCount, "customerID": customerID, "invoiceDate": invoiceDate, "sgst": isSgst, "cgst": isCgst, "igst": isIgst, "stateGstPercent": infoSGST, "centralGstPercent": infoCGST, "interGstPercent": infoIGST };
      invoiceItemsDetails.add(InheaderInfo);
      $("tr.item-list-box").each(function (key, value) {
        var lastID = $(this).attr("id");
        var row = $(this).find(".sno").html();
        var lasts = lastID.split("-");
        var lastDetails = lasts[1];
        var itemQuantity = parseFloat($("#itemQuantity_" + lastDetails).val());
        var itemRate = parseFloat($("#itemRate_" + lastDetails).val());
        var itemName = $("#itemName_" + lastDetails).val();
        var itemUnit = $("#itemUnit_" + lastDetails).val();
        var narre = $("#narr_" + lastDetails).val();

        if (narre == "") {
          error.push("Item type can not blank. Row No." + row);

        }
        if (itemQuantity == "" || itemQuantity == 0) {
          error.push("Item quantity can not blank. Row No." + row);

        }
        if (itemRate == "" || itemRate == 0) {
          error.push("Item rate can not blank. Row No." + row);

        }
        var nerow = { "invoiceID": invoiceID, "srno": lastDetails, "quantity": itemQuantity, "rate": itemRate, "unit": itemUnit, "description": itemName, "invoiceLineChrgID": narre };
        invoiceItemsDetails.add(nerow);
      });
      if (error.length > 0) {
        var er = "";
        $.each(error, function (key, val) {

          er = er + val + "\n";
        });
        // alert(er);
        return false;
      }

      if (invoiceID != null) {
        if (permission.edit == "yes") {
          method = "update";
        }
        else {
          alert("You don`t have permission to edit");
          return false;
        }
      } else {
        method = "create";
      }
      console.log(invoiceItemsDetails);
      invoiceItemsDetails.sync(method, invoiceItemsDetails, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler
      }).done(function (res) {

        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        if (res.flag == "F") {
          // alert(res.msg);
          $(e.currentTarget).html("<span>Error</span>");
        } else {
          $(e.currentTarget).html("<span>Saved</span>");
          handelClose(selfobj.toClose);
          scanDetails.filterSearch();
        }


        setTimeout(function () {
          $(e.currentTarget).html("<span>Save</span>");
        }, 3000);
      });
    },

    initializeValidate: function () {
      var selfobj = this;
      var feilds = {
          
        project_name: {
          required: true,
        },

        client_id:{
          required: true,
        }
        
      };
      var feildsrules = feilds;
      var dynamicRules = selfobj.dynamicFieldRenderobj.getValidationRule();

      if (!_.isEmpty(dynamicRules)) {
        var feildsrules = $.extend({}, feilds, dynamicRules);
        // var feildsrules = {
        //   ...feilds,
        //   ...dynamicRules
        //   };
      }
      var messages = {
        project_name: "Please enter Project Name",
        client_id: "Please select Client",
      };
      $("#projectDetails").validate({
        rules: feildsrules,
        messages: messages,
      });
      $('#invoiceDate').datepickerBT({
        format: "dd-mm-yyyy",
        todayBtn: "linked",
        clearBtn: true,
        todayHighlight: true,
        StartDate: new Date(),
        numberOfMonths: 1,
        autoclose: true,
        filterCName: true
      }).on('changeDate', function (ev) {
        $('#invoiceDate').change();
        var valuetxt = $("#invoiceDate").val();
        selfobj.model.set({ invoiceDate: valuetxt });
      });

      $('.digits').inputmask('Regex', { regex: "^[0-9]{1,15}(\\.\\d{1,2})?$" });
      $('.percentage').inputmask('Regex', { regex: "^[0-9]{1,2}(\\.\\d{1,2})?$" });

    },
    render: function () {
      var source = taxInvoice_temp;
      var template = _.template(source);
      $("#" + this.toClose).remove();
      this.$el.html(template({ model: this.model.attributes, customerID: this.customerID }));
      this.$el.addClass("tab-pane in active panel_overflow");
      this.$el.attr('id', this.toClose);
      this.$el.addClass(this.toClose);
      this.$el.data("role", "tabpanel");
      this.$el.data("current", "yes");
      $(".ws-tab").append(this.$el);
      $('#' + this.toClose).show();
      // this is used to append the dynamic form in the single view html
      $("#dynamicFormFields").empty().append(this.dynamicFieldRenderobj.getform());
      // Do call this function from dynamic module it self.
      this.initializeValidate();
      this.setOldValues();
      this.attachEvents();
      $('ws-select').selectpicker();
      rearrageOverlays("Tax Invoice", this.toClose);
      return this;

    }, onDelete: function () {
      this.remove();
    }
  });

  return taxInvoiceSingleView;

});
