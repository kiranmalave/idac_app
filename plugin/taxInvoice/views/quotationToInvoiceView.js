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
  'Quill',
  '../../core/views/multiselectOptions',
  '../../customer/collections/customerCollection',
  '../models/singleTaxInvoiceModel',
  '../../dynamicForm/views/dynamicFieldRender',
  '../collections/invoiceItems',
  '../../customer/views/customerSingleView',
  '../../category/collections/slugCollection',
  '../../readFiles/views/readFilesView',
  '../views/shippingModalView',
  '../../companyMaster/models/companySingleModel',
  '../../menu/collections/menuCollection',
  'text!../templates/quotationToInvoice_temp.html',
  'text!../templates/additionalCharges_temp.html',
  '../../category/views/categorySingleView',

], function ($, _, Backbone, validate, inputmask, datepickerBT, typeahead, icheck, select2, moment, Quill,multiselectOptions, customerCollection, singleTaxInvoiceModel, dynamicFieldRender, invoiceItems,customerSingleView,slugCollection,readFilesView,shippingModalView,companySingleModel,menuCollection,taxInvoice_temp,additionalCharges_temp,categorySingleView) {

  var taxInvoiceSingleView = Backbone.View.extend({
    model: singleTaxInvoiceModel,
    form_label:'',
    s_state : 'false',
    menuName : '' ,
    customerList : new customerCollection() ,
    categoryList : new slugCollection(),
    initialize: function (options) {
      this.dynamicData = null;
      this.toClose = "taxinvoiceSingleView";
      this.form_label = options.form_label;
      $('#taxInvoiceData').remove();
      this.menuId = options.menuId;
      this.menuName = options.menuName;
      var selfobj = this;
      scanDetails = options.searchtaxInvoice;
      $(".popupLoader").show();
      $(".modal-dialog").addClass("modal-lg");
      this.companySingleModel = new companySingleModel();
      this.menuList = new menuCollection();
      this.menuList.fetch({
          headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y' }
      }).done(function (res) {
          res.data.forEach(function (menu) {
              if(menu.menuLink == 'companyMaster'){
                selfobj.companyMenuID = menu.menuID;
                if (DEFAULTCOMPANY == 0 || DEFAULTCOMPANY == '') {
                  alert('Please Select Company First..!');return;
                }
                selfobj.companySingleModel.set({'infoID' : DEFAULTCOMPANY}); 
                if(selfobj.companySingleModel.get('infoID') != ''){
                  selfobj.companySingleModel.fetch({
                    headers: {
                      'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
                    },data:{menuId:selfobj.companyMenuID}, error: selfobj.onErrorHandler
                  }).done(function (res) {
                    selfobj.companyDetails = res.data;
                    if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
                    selfobj.render();
                  });
                }
              }
            });
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          $(".popupLoader").hide();
          $(".profile-loader").hide();
      });

      invoiceItemsDetails = new invoiceItems();
      this.getnarration();
      this.model = new singleTaxInvoiceModel();
      this.dynamicFieldRenderobj = new dynamicFieldRender({ ViewObj: selfobj, formJson: {} });
      this.multiselectOptions = new multiselectOptions();
      // this.customerList = new customerCollection();
      this.categoryList.fetch({headers:{
        'contentType':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
        },error: selfobj.onErrorHandler,type:'post', data:{status:'active',getAll:'Y'}}).done(function(res){
        if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
        $(".popupLoader").hide();
        $('.loder').hide();
        selfobj.render();
      });
      scanDetails = options.searchtaxInvoice;
      $(".popupLoader").show();
      this.model.set({ year: moment().year(), reportYear: moment().year() });
      this.refreshCust();
      if (options.invoiceID != "" && options.invoiceID != null) {
        this.model.set({ invoiceID: options.invoiceID });
        this.model.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler
        }).done(function (res) {
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          $(".popupLoader").hide();
          selfobj.model.set({ menuId: selfobj.menuId});
          selfobj.render();
          selfobj.getinfoSetting();
          selfobj.setOldValues();
        });
      } else {
        selfobj.getinfoSetting();
        selfobj.render();
        $(".popupLoader").hide();
        $(".custShippingAddress").hide();
      }

    },
    refreshCat: function () {
      let selfobj = this;
      this.categoryList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y', slug: 'unit' }
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        selfobj.render();
      });
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
      "click .del-all-row": "delAllRows",
      "change .updateAmt": "rowTotal",
      "change .setnarr": "setnarration",
      "click .selectProduct": "setProduct",
      "blur .multiselectOpt": "updatemultiSelDetails",
      "click .singleSelectOpt": "selectOnlyThis",
      "click .loadMedia": "loadMedia",
      "click #convert_invoice": "convert_invoice",
      "click .accordionHeader": "accordionToggle",
      "click .addCharges": "addAdditionalCharges",
      "click .uploadInvoiceLogo": "uploadInvoiceLogo",
      "blur .companyDetailsChange": "updateCompanyDetails",
      "click .custDetails": "customerDetails",
      "click .shipTocheck": "shipTocheck",
      "click .removeFields": "removeFields",
      "click .editShippingDetails": "editShippingDetails",
      "click .editCustomerDetails": "editCustomerDetails",
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
      this.$el.off('click', '.del-all-row', this.delAllRows);
      this.$el.on('click', '.del-all-row', this.delAllRows.bind(this));
      this.$el.off('change', '.updateAmt', this.rowTotal);
      this.$el.on('change', '.updateAmt', this.rowTotal.bind(this));
      this.$el.off('change', '.setnarr', this.setnarration);
      this.$el.on('change', '.setnarr', this.setnarration.bind(this));
      this.$el.off('click', '.multiselectOpt', this.updatemultiSelDetails);
      this.$el.on('click', '.multiselectOpt', this.updatemultiSelDetails.bind(this));
      this.$el.off('click', '.singleSelectOpt', this.selectOnlyThis);
      this.$el.on('click', '.singleSelectOpt', this.selectOnlyThis.bind(this));
      this.$el.off('input', '.pdChange', this.getProducts);
      this.$el.on('input', '.pdChange', this.getProducts.bind(this));
      this.$el.off('click', '.selectProduct', this.setProduct);
      this.$el.on('click', '.selectProduct', this.setProduct.bind(this));
      this.$el.off('click', '.loadMedia', this.loadMedia);
      this.$el.on('click', '.loadMedia', this.loadMedia.bind(this));
      this.$el.off('click', '#convert_invoice', this.convert_invoice);
      this.$el.on('click', '#convert_invoice', this.convert_invoice.bind(this));
      this.$el.off('click', '.accordionHeader', this.accordionToggle);
      this.$el.on('click', '.accordionHeader', this.accordionToggle.bind(this));
      this.$el.off('click', '.addCharges', this.addAdditionalCharges);
      this.$el.on('click', '.addCharges', this.addAdditionalCharges.bind(this));
      this.$el.off('click', '.uploadInvoiceLogo', this.uploadInvoiceLogo);
      this.$el.on('click', '.uploadInvoiceLogo', this.uploadInvoiceLogo.bind(this));
      this.$el.off('blur', '.companyDetailsChange', this.updateCompanyDetails);
      this.$el.on('blur', '.companyDetailsChange', this.updateCompanyDetails.bind(this));
      this.$el.off('click', '.custDetails', this.customerDetails);
      this.$el.on('click', '.custDetails', this.customerDetails.bind(this));
      this.$el.off('click', '.shipTocheck', this.shipTocheck);
      this.$el.on('click', '.shipTocheck', this.shipTocheck.bind(this));
      this.$el.off('click', '.removeFields', this.removeFields);
      this.$el.on('click', '.removeFields', this.removeFields.bind(this));
      this.$el.off('click', '.editShippingDetails', this.editShippingDetails);
      this.$el.on('click', '.editShippingDetails', this.editShippingDetails.bind(this));
      this.$el.off('click', '.editCustomerDetails', this.editCustomerDetails);
      this.$el.on('click', '.editCustomerDetails', this.editCustomerDetails.bind(this));
    },

    loadMedia: function (e) {
      $('.upload').show();
      $('.dotborder').hide();
    },
    customerDetails: function (e) {
      $('.custDetails').hide();
      $('.customerDetailsDrop').show();
      $('.custShippingAddress').show();    
      $('.customerAddDetails').hide();
    },
    editCustomerDetails: function (e) {
      $('.customerAddDetails').hide();
      $('.customerDetailsDrop').show();
    },
    editShippingDetails: function (e) {
      var selfobj = this;
      $('#shippingModal').modal('toggle');
      new shippingModalView({ taxInvoice: this });
      $('body').find(".loder");
    },
    shipTocheck: function (e) {
      var selfobj = this;
      if ($(e.currentTarget).is(":checked")) { 
        selfobj.model.set({"ship_to" : 'yes'});
        $('.shippingDetails').hide();
        $('.shipTocheckCls').show();
        $('.shipTouncheckCls').hide();
        let cust = selfobj.customerList.models.find((item) => {
          return item && item.attributes && item.attributes.customer_id == selfobj.model.attributes.customer_id;
        });
        if(cust){
          $('.shipTocheckCls .custName').empty().append(cust.attributes.name); 
          $('.shipTocheckCls .custAddress').empty().append(cust.attributes.address); 
          $('.shipTocheckCls .custZipcode').empty().append('Zip Code: ' + (cust.attributes.zipcode ? cust.attributes.zipcode : '-')); 
          $('.shipTocheckCls .custMobileNo').empty().append('Phone No.:' + (cust.attributes.mobile_no ? cust.attributes.mobile_no : '-')); 
          $('.shipTocheckCls .custGstCls').empty().append('GST: ' + (cust.attributes.gst_no ? cust.attributes.gst_no : '-')); 
        }
      } else {
        selfobj.model.set({"ship_to" : 'no'});
        selfobj.model.set({ shipping_address: ''});
          $('.shippingDetails').show();
          $('.shipTocheckCls').hide();
          $('.shipTouncheckCls').hide();
        // }
      }
    },
    accordionToggle: function (e) {
      const accordionHeader = e.target.closest(".accordionHeader");
      if (accordionHeader) {
          const accordionContent = accordionHeader.nextElementSibling;
          if (accordionContent) {
              accordionContent.classList.toggle("is-open");
              if (accordionContent.classList.contains("is-open")) {
                  accordionContent.style.height = (accordionContent.scrollHeight + 15) + "px";
                  const materialIcons = accordionHeader.querySelector(".material-icons");
                  if (materialIcons) {
                    materialIcons.textContent = 'expand_more';
                  }
              } else {
                  accordionContent.style.height = "0px";
                  const materialIcons = accordionHeader.querySelector(".material-icons");
                  if (materialIcons) {
                    materialIcons.textContent = 'expand_less';
                  }
              }
              console.log("Updated class on accordionHeader", accordionHeader.querySelector("i").classList);
          } else {
              console.error("No accordion content found.");
          }
      } else {
          console.error("No accordion header found.");
      }
    },  
    addAdditionalCharges:function(e){
      var selfobj = this;
      var lastChildId = $('.addAdditionalFields .fieldsSelection:last').attr('id');
      if(lastChildId){
        var numericPart = lastChildId.match(/\d+/);
        this.rowCounter = numericPart[0];
      }else{
        this.rowCounter = 0;
      }
      this.rowCounter++;
      var template = _.template(additionalCharges_temp);
      $(".addAdditionalFields").append(template({rowCounter : this.rowCounter}));
      $('input[name="field_gst"]').val(this.model.get('largestGst'));
      if($('.addAdditionalFields .fieldsSelection').length == 3){
        $('.addCharges').attr('disabled','disabled');
        $('.addCharges').css('color', '#838689');
      }else{
        $('.addCharges').removeAttr('disabled');
        $('.addCharges').css('color', '#0B78F9');
      }
    },
    ShowAdditionalCharges:function(){
      var selfobj = this;
      if (this.model.get('additional_char') != undefined) {
        var charges = JSON.parse(this.model.get('additional_char'));
        var template = _.template(additionalCharges_temp);
        this.rowCounter = 1;
        Object.values(charges).forEach(item => {
          $(".addAdditionalFields").append(template({rowCounter : this.rowCounter}));
          $('#field_title_'+this.rowCounter).val(item.title);
          $('#field_rate_'+this.rowCounter).val(item.rate);
          $('#field_gst_'+this.rowCounter).val(item.gst);
          this.rowCounter++;
        });
      }
    },
    ShowPaymentLogs:function(){
      this.logsAmt = 0 ;
      this.receiptStr = '' ;
      var logs = this.model.get('paymentLogs');
      if (logs != undefined && logs != '') {
        logs.forEach((log)=>{
          this.logsAmt = this.logsAmt + parseInt(log.amount);
          if (this.receiptStr == '') 
            this.receiptStr = this.receiptStr + '#'+log.receipt_number;
          else
            this.receiptStr = this.receiptStr + ', #'+log.receipt_number;
        });
        $('.LogsPayment').show();
        $('.logsAmt').html('-'+this.logsAmt);
        $('.receiptStr').html(this.receiptStr);
      }
    },
    removeFields: function (e) {
      e.preventDefault();
      var container = $(e.currentTarget).closest(".addAdditionalFields");
      var rowCount = container.find(".fieldsSelection").length;
      $(e.currentTarget).closest(".fieldsSelection").remove();
      if (rowCount < 4) {
        $('.addCharges').removeAttr('disabled');
        $('.addCharges').css('color', '#0B78F9');
      }else{
        $('.addCharges').attr('disabled','disabled');
        $('.addCharges').css('color', '#838689');
      }
    },
    addemptyRow: function (e) {
      e.preventDefault();
      var lastID = $("tr.item-list-box:last").attr("id");
      var lasts = lastID.split("-");
      var lastDetails = parseInt(lasts[1]);
      var slug_id ='' ;
       $.each(this.categoryList.models,function (key, val) {
        if(val.attributes.slug == 'unit') {    
          slug_id = val.attributes.category_id; 
        }
      })
      var sel2 = '<select id="itemUnit_' + (lastDetails + 1) + '" name="itemUnit_' + (lastDetails + 1) + '" class="form-control ws-select dropval setnarr" title="Unit Type" data-slug="'+slug_id+'"> > ';
      sel2 = sel2 + ' <option class="" value="">Select Units</option><option class = "addNew" value="addCategory">Add Units Type</option>';
      $.each(this.categoryList.models, function (key, val) {
        if(val.attributes.slug == 'unit') {       
          $.each(val.attributes.sublist, function (key, modcat) {          
            sel2 = sel2 + '<option value="' + modcat.category_id + '">' + modcat.categoryName + '</option>';
          });
        }
      }); 
      sel2 = sel2 + '</select>';
      var sel = '<div class="col-md-12 productDropdown nopadding"><div class="form-group form-float"><div class="form-line taskDate"><input id="narr_'+(lastDetails + 1)+'" type="text" class="form-control pdChange ddcnt taskDate" name="narr_'+(lastDetails + 1)+'" value="" placeholder="Type" /></div></div><div class="product-input"></div><div id="productDropdown_'+(lastDetails + 1)+'" class="dropdown-content custDrop" style="display: none;"></div></div>';
      var temprow = '<tr id="item-' + (lastDetails + 1) + '" class="item-list-box">' +
                    '<td class="sno">' + (lastDetails + 1) + '</td>' +
                    '<td class="custom-dropdown">' + sel + '</td>' +
                    '<td class="quantityUnit">' +
                    '<input type="text" name="itemQuantity_' + (lastDetails + 1) + '" id="itemQuantity_' + (lastDetails + 1) + '" class="form-control amtChange digits input-p" value="0">' +
                    '<div class="form-group form-float">' +
                    '<div class="form-line focused">' 
                    + sel2 +
                    '</div>' +
                    '</div>' +
                    '</td>' +
                    '<td class="text-right">' +
                    '<input type="text" name="itemRate_' + (lastDetails + 1) + '" id="itemRate_' + (lastDetails + 1) + '" class="form-control amtChange digits" value="0">' +
                    '<div class="apply-taxes">'+
                        '<input type="checkbox" name="itemAmtWithGST_' + (lastDetails + 1) + '" id="itemAmtWithGST_' + (lastDetails + 1) + '" class="itemAmtWithGST-check updateAmt" >'+
                        '<span class="itemAmtWithGST">With Gst</span>'+
                    '</div>'+
                    '<span class="itemWithGSTAmt_' + (lastDetails + 1) + '"></span>'+
                    '</td>' +
                    '<td class="discount_types">' +
                    '<input type="text" name="itemDiscount_' + (lastDetails + 1) + '" id="itemDiscount_' + (lastDetails + 1) + '" class="form-control amtChange input-p">' +
                    '<div class="form-group form-float">'+
                    '<div class="form-line" >'+ 
                    '<select for="itemDiscountType_' + (lastDetails + 1) + '" id="itemDiscountType_' + (lastDetails + 1) + '" name="itemDiscountType_' + (lastDetails + 1) + '" title="Type" class="form-control amtChange ws-select dropval show-tick repeatChange nopadding">'+
                    '<option value="amt">Amt</option>'+
                    '<option value="per">Per</option>'+
                    '</select>'+
                    '</div>'+
                    '</div>'+
                    '</td>' +
                    '<td>' +
                    '<input type="text" name="itemGST_' + (lastDetails + 1) + '" id="itemGST_' + (lastDetails + 1) + '" class="form-control amtChange input-p"><span class="itemGstAmt_'+(lastDetails + 1)+'"></span>' +
                    '</td>' +
                    '<td class="text-center total-td" id="itemtotal_' + (lastDetails + 1) + '"></td>' +
                    '<td class="text-right">' +
                    '<button id="itemdel_' + (lastDetails + 1) + '" class="del-row btn-small btn-default"><img class="invoiceDeleteImg" src="images/deleteImg.png"></button>' +
                    '</td>' +
                    '</tr>';

      $(".items-holder").append(temprow);
      setTimeout(function () {
        var di = "itemName_" + (lastDetails + 1);
        $("#" + di).focus();
      }, 200);
      $('.digits').inputmask('Regex', { regex: "^[0-9]{1,15}(\\.\\d{1,2})?$" });
      $('.percentage').inputmask('Regex', { regex: "^[0-9]{1,2}(\\.\\d{1,2})?$" });
      
      this.reArrangeIndex();
      this.updateTaxBox();
      $('.ws-select').selectpicker();
    },
    addRow: function (e) {
      e.preventDefault();
      var lastDetails = 0;
      var slug_id ='' ;
      $.each(this.categoryList.models, function (key, val) {
        if(val.attributes.slug == 'unit') {    
          slug_id = val.attributes.category_id; 
        }
     })
     var sel2 = '<select id="itemUnit_' + (lastDetails + 1) + '" name="itemUnit_' + (lastDetails + 1) + '" class="form-control ws-select dropval setnarr" title="Unit Type" data-slug="'+slug_id+'"> > ';
      sel2 = sel2 + ' <option class="" value="">Select Units</option><option class = "addNew" value="addCategory">Add Units Type</option>';
      $.each(this.categoryList.models, function (key, val) {
        if(val.attributes.slug == 'unit') {       
          $.each(val.attributes.sublist, function (key, modcat) {          
            sel2 = sel2 + '<option value="' + modcat.category_id + '">' + modcat.categoryName + '</option>';
          });
        }
      }); 
      sel2 = sel2 + '</select>';
      var sel = '<div class="col-md-12 productDropdown nopadding"><div class="form-group form-float"><div class="form-line taskDate"><input id="narr_'+(lastDetails + 1)+'" type="text" class="form-control pdChange ddcnt taskDate" name="narr_'+(lastDetails + 1)+'" value="" placeholder="Type" /></div></div><div class="product-input"></div><div id="productDropdown_'+lastDetails+'" class="dropdown-content custDrop" style="display: none;"></div></div>';
      var temprow = '<tr id="item-' + (lastDetails + 1) + '" class="item-list-box">' +
      '<td class="sno">' + (lastDetails + 1) + '</td>' +
      '<td class="custom-dropdown">' + sel + '</td>' +
      '<td class="quantityUnit">' +
      '<input type="text" name="itemQuantity_' + (lastDetails + 1) + '" id="itemQuantity_' + (lastDetails + 1) + '" class="form-control amtChange digits input-p" value="0">' +
      '<div class="form-group form-float">' +
      '<div class="form-line focused">' +
      +sel2+
      '</div>' +
      '</div>' +
      '</td>' +
      '<td class="text-right">' +
      '<input type="text" name="itemRate_' + (lastDetails + 1) + '" id="itemRate_' + (lastDetails + 1) + '" class="form-control amtChange digits" value="0">' +
      '<div class="apply-taxes">'+
          '<input type="checkbox" name="itemAmtWithGST_' + (lastDetails + 1) + '" id="itemAmtWithGST_' + (lastDetails + 1) + '" class="itemAmtWithGST-check updateAmt" >'+
          '<span class="itemAmtWithGST">With Gst</span>'+
      '</div>'+
      '<span class="itemWithGSTAmt_' + (lastDetails + 1) + '"></span>'+
      '</td>' +
      '<td class="discount_types">' +
      '<input type="text" name="itemDiscount_' + (lastDetails + 1) + '" id="itemDiscount_' + (lastDetails + 1) + '" class="form-control amtChange input-p">' +
      '<div class="form-group form-float">'+
      '<div class="form-line" >'+ 
      '<select for="itemDiscountType_' + (lastDetails + 1) + '" id="itemDiscountType_' + (lastDetails + 1) + '" name="itemDiscountType_' + (lastDetails + 1) + '" title="Type" class="form-control ws-select dropval show-tick repeatChange nopadding">'+
      '<option value="amt">Amt</option>'+
      '<option value="per">Per</option>'+
      '</select>'+
      '</div>'+
      '</div>'+
      '</td>' +
      '<td>' +
      '<input type="text" name="itemGST_' + (lastDetails + 1) + '" id="itemGST_' + (lastDetails + 1) + '" class="form-control amtChange input-p"><span class="itemGstAmt_'+(lastDetails + 1)+'"></span>' +
      '</td>' +
      '<td class="text-center total-td" id="itemtotal_' + (lastDetails + 1) + '"></td>' +
      '<td class="text-right">' +
      '<button id="itemdel_' + (lastDetails + 1) + '" class="del-row btn-small btn-default"><img class="invoiceDeleteImg" src="images/deleteImg.png"></button>' +
      '</td>' +
      '</tr>';
      // var temprow = '<tr id="item-' + (lastDetails + 1) + '" class="item-list-box"><td class="sno">' + (lastDetails + 1) + '</td><td class="custom-dropdown" >' + sel + '</td><td><input type="text" name="itemName_' + (lastDetails + 1) + '" id="itemName_' + (lastDetails + 1) + '" class="form-control"> </td><td><input type="text" name="itemQuantity_' + (lastDetails + 1) + '" id="itemQuantity_' + (lastDetails + 1) + '" class="form-control amtChange digits" value="0"></td><td class= "tax-lable"><input type="text" name="itemUnit_' + (lastDetails + 1) + '" id="itemUnit_' + (lastDetails + 1) + '" class="form-control"> <label style="display: none;" class="item_cgst">Cgst</label>   <label style="display: none;" class="item_sgst">Sgst</label> <label style="display: none;" class="item_igst">Igst</label> </td><td class="text-right"><input type="text" name="itemRate_' + (lastDetails + 1) + '" id="itemRate_' + (lastDetails + 1) + '" class="form-control amtChange digits" value="0"> <input type="text" name="centralGstPercent_' + (lastDetails + 1) + '" id="centralGstPercent_' + (lastDetails + 1) + '" class="form-control item_cgst amtChange" style="display: none;" value="'+this.model.get('centralGstPercent')+'">  <input type="text" name="stateGstPercent_' + (lastDetails + 1) + '" id="stateGstPercent_' + (lastDetails + 1) + '" class="form-control item_sgst amtChange" style="display: none;" value="'+this.model.get('stateGstPercent')+'"> <input type="text" name="stateGstPercent_' + (lastDetails + 1) + '"" id="interGstPercent_' + (lastDetails + 1) + '" class="form-control item_igst amtChange" style="display: none;" value="'+this.model.get('interGstPercent')+'"> </td><td class="text-right total-td" id="itemtotal_' + (lastDetails + 1) + '"></td><td class="text-right"><button id="itemdel_' + (lastDetails + 1) + '" class="del-row btn-small btn-default"><img src="images/deleteImg.png"/></button></td></tr>';
      //  var temprow = '<tr id="item-' + (lastDetails + 1) + '" class="item-list-box"><td class="sno">' + (lastDetails + 1) + '</td><td class="custom-dropdown" >' + sel + '</td><td><input type="text" name="itemName_' + (lastDetails + 1) + '" id="itemName_' + (lastDetails + 1) + '" class="form-control"> <div class="accessories" > <input type="checkbox" name="usb_mouse_' + (lastDetails + 1) + '" id="usb_mouse_' + (lastDetails + 1) + '" class="assc" ><span class="" >USB Mouse</span></div><div class="accessories" ><input type="checkbox" name="usb_keyboard_' + (lastDetails + 1) + '" id="usb_keyboard_' + (lastDetails + 1) + '" class=" assc"><span   class="" >USB Keyboard</span></div> <div class="accessories" ><input type="checkbox" name="laptop_backpack_' + (lastDetails + 1) + '" id="laptop_backpack_' + (lastDetails + 1) + '" class="assc" ><span   class="" >Laptop Backpack</span></div> <div class="accessories" ><input type="checkbox" name="wifi_adapter_' + (lastDetails + 1) + '" id="wifi_adapter_' + (lastDetails + 1) + '" class="assc" ><span class="" > Wifi Adapter</span></div> <div class="accessories" ><input type="checkbox" name="display_connector_' + (lastDetails + 1) + '" id="display_connector_' + (lastDetails + 1) + '" class="assc"><span class="" >Display Connector</span></div>  <div class="accessories" ><input type="checkbox" name="usb_c_type_connector_' + (lastDetails + 1) + '" id="usb_c_type_connector_' + (lastDetails + 1) + '" class="assc" ><span  class="" >USB & C Type Connector</span></div> <div class="accessories" ><input type="checkbox" name="hdmi_cable_' + (lastDetails + 1) + '" id="hdmi_cable_' + (lastDetails + 1) + '" class="assc"  ><span class="" >HDMI Cable</span></div> <div class="accessories" ><input type="checkbox" name="charger_' + (lastDetails + 1) + '" id="charger_' + (lastDetails + 1) + '" class="assc" ><span class="" >Charger</span><input type="text" name="serial_no_' + (lastDetails + 1) + '" id="serial_no_' + (lastDetails + 1) + '" class="form-control serial_no" value="" placeholder="Charger Serial No"> </div> </td><td><input type="text" name="itemQuantity_' + (lastDetails + 1) + '" id="itemQuantity_' + (lastDetails + 1) + '" class="form-control amtChange digits" value="0"> <input type="checkbox" style="display: none;" name="apply_taxes_' + (lastDetails + 1) + '" id="apply_taxes_' + (lastDetails + 1) + '" class=" apply_tax-check updateAmt" ><span  style="display: none;" class="apply_tax-check" >Apply taxes</span> </td><td class= "tax-lable"><input type="text" name="itemUnit_' + (lastDetails + 1) + '" id="itemUnit_' + (lastDetails + 1) + '" class="form-control"> <label style="display: none;" class="item_cgst">Cgst</label>   <label style="display: none;" class="item_sgst">Sgst</label> <label style="display: none;" class="item_igst">Igst</label> </td><td class="text-right"><input type="text" name="itemRate_' + (lastDetails + 1) + '" id="itemRate_' + (lastDetails + 1) + '" class="form-control amtChange digits" value="0"> <input type="text" name="centralGstPercent_' + (lastDetails + 1) + '" id="centralGstPercent_' + (lastDetails + 1) + '" class="form-control item_cgst amtChange" style="display: none;" value="'+this.model.get('centralGstPercent')+'">  <input type="text" name="stateGstPercent_' + (lastDetails + 1) + '" id="stateGstPercent_' + (lastDetails + 1) + '" class="form-control item_sgst amtChange" style="display: none;" value="'+this.model.get('stateGstPercent')+'"> <input type="text" name="stateGstPercent_' + (lastDetails + 1) + '"" id="interGstPercent_' + (lastDetails + 1) + '" class="form-control item_igst amtChange" style="display: none;" value="'+this.model.get('interGstPercent')+'"> </td><td class="text-right total-td" id="itemtotal_' + (lastDetails + 1) + '"></td><td class="text-right"><button id="itemdel_' + (lastDetails + 1) + '" class="del-row btn-small btn-default"><img class="invoiceDeleteImg" src="images/deleteImg.png"/></button></td></tr>';
      $(".items-holder").append(temprow);
      setTimeout(function () {
        var di = "itemName_" + (lastDetails + 1);
        $("#" + di).focus();
      }, 200);
      $('.digits').inputmask('Regex', { regex: "^[0-9]{1,15}(\\.\\d{1,2})?$" });
      $('.percentage').inputmask('Regex', { regex: "^[0-9]{1,2}(\\.\\d{1,2})?$" });
      
      this.reArrangeIndex();
      this.updateTaxBox();
      $('.ws-select').selectpicker();
    },
    delRow: function (e) {
      e.preventDefault();
      var lastID = $(e.currentTarget).attr("id");
      var lasts = lastID.split("_");
      var lastDetails = lasts[1];
      let tr_length = $("tr.item-list-box").length;
      this.reArrangeIndex();
      $("#item-" + lastDetails).remove();
      this.rowTotal(e);
      if(tr_length == 1)
      {
        this.addRow(e);
      }
    },
    convert_invoice : function(e)
    {
      e.preventDefault();
      var selfobj = this;
      if (selfobj.model.get('invoiceID') != null && selfobj.model.get('invoiceID') != undefined ) {
        selfobj.getPaymentLogs(selfobj.model.get('invoiceID'));
      }
    },
    numberToWords: function(number) {
      var self = this;
      const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
      const teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
      const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  
      if (number === 0) return 'zero';
  
      let words = '';
  
      // Extract crores
      if (number >= 10000000) {
          words += self.numberToWords(Math.floor(number / 10000000)) + ' crore ';
          number %= 10000000;
      }
  
      // Extract lakhs
      if (number >= 100000) {
          words += self.numberToWords(Math.floor(number / 100000)) + ' lakh ';
          number %= 100000;
      }
  
      // Extract thousands
      if (number >= 1000) {
          words += self.numberToWords(Math.floor(number / 1000)) + ' thousand ';
          number %= 1000;
      }
  
      // Extract hundreds
      if (number >= 100) {
          words += ones[Math.floor(number / 100)] + ' hundred ';
          number %= 100;
      }
      // Extract tens and ones
      if (number >= 20) 
      {
        words += tens[Math.floor(number / 10)];
        if (number % 10 !== 0) {
            words += ' ' + ones[Math.floor(number % 10)];
        } 
        else {
            words += ''; 
        }
        number %= 10;
      }else if (number >= 10 && number <= 19) {
        words += teens[number - 10];
      } else if (number > 0) {
        words += ones[Math.floor(number)];
      }
      return words.trim().toUpperCase();
    },
    rowTotal: function (e) {
      selfobj = this; 
      var subtotal = 0;
      var TotalGST = 0 ;
      var TotalDiscount = 0;
      var TotalPrice = 0;
      var TotalQty = 0;
      var largestgst = 0;
      var round = 0;
      var GrossTotal = 0;

      $("tr.item-list-box").each(function (key, value) {
        var lastID = $(this).attr("id");
        var lasts = lastID.split("-");
        var lastDetails = lasts[1];
       
        var rDisc = $("#itemDiscount_" + lastDetails).val();
        var withGst = $("#itemAmtWithGST_" + lastDetails).is(":checked");
       
        var rDiscType = $("#itemDiscountType_" + lastDetails).val();
        var rGst = $("#itemGST_" + lastDetails).val();
        var price = parseFloat($("#itemRate_" + lastDetails).val());
        
        rowtotal = (parseFloat($("#itemQuantity_" + lastDetails).val()) * parseFloat($("#itemRate_" + lastDetails).val()));
        // DISCOUNT 
        if (rDisc != '' ) {
          var dis = 0 ;
          rDisc = parseFloat(rDisc);

          if (rDiscType == 'amt') {
            rowtotal = rowtotal - rDisc  ;
            if (rDisc <= price) {
              
              price = price - rDisc;
              console.log('dprice1 : ',price);
              
            }else
            {
              alert('Discount is greater than price!');
            }
            console.log('dprice : ',price);
            
            TotalDiscount = TotalDiscount + rDisc;
          }else
          {
            dis= rowtotal * (rDisc / 100) ;
            rowtotal = rowtotal - dis;

            var dprice = price * (rDisc / 100);
            console.log('dprice : ',dprice);
            price = price - dprice;
            console.log('dprice1 : ',dprice);
            TotalDiscount = TotalDiscount + dis;
          }
        } 

        var gstAmt = parseFloat($("#itemRate_" + lastDetails).val());
        // GST 
          if (rGst != '') {
            rGst = parseFloat(rGst);
            if (parseFloat(rGst) > largestgst) { 
              largestgst = parseFloat(rGst);
            }
            if(withGst){
              gstAmt =  (price * 100) / (rGst + 100) ; 
              gs = price - gstAmt;
            }else
            {
              gstAmt =  price * (rGst / 100) ; 
              gs = gstAmt;
              rowtotal = rowtotal + ( gs * parseFloat($("#itemQuantity_" + lastDetails).val()));
            }

            console.log('price : ',price);
            console.log('gstAmt : ',gstAmt);
            console.log('gs : ',gs);
            console.log('rowtotal : ',rowtotal);
            console.log('dis : ',dis);
            
            TotalGST = TotalGST + (gs * parseFloat($("#itemQuantity_" + lastDetails).val()));
            $(".itemGstAmt_" + lastDetails).empty().html(numberFormat(gs, 2));
            $(".itemWithGSTAmt_" + lastDetails).empty().html(numberFormat(gstAmt, 2));
            
          }else
          {
            var gs = 0.00;
            TotalGST = TotalGST + (gs * parseFloat($("#itemQuantity_" + lastDetails).val()));
            $(".itemGstAmt_" + lastDetails).empty().html(numberFormat(gs, 2));
            $(".itemWithGSTAmt_" + lastDetails).empty().html(numberFormat(gstAmt, 2));
          }
        TotalQty = TotalQty +  parseInt($("#itemQuantity_" + lastDetails).val());
        TotalPrice = TotalPrice + gstAmt ;
        var tt = '<span id="rowTotal_'+lastDetails+'">'+numberFormat(rowtotal, 2)+' </span>'
        $("#itemtotal_" + lastDetails).empty().html(tt);

        subtotal = subtotal + rowtotal; 
      });
      selfobj.model.set({'largestGst' : largestgst});
      var additional_ch = 0 ;
      $(".fieldsSelection input[type='text']").each(function (key, value) {
        var last = $(this).attr("id");
        var last1 = last.split("_");
        var lastDetail1 = last1[2];
        if ($(this).attr("name") == 'field_rate') {
          additional_ch = additional_ch + parseFloat($(this).val());
        }
      });
      var additional_gst = additional_ch * (largestgst / 100);
      additional_ch = additional_ch + additional_gst;
      selfobj.model.set({'additionalCharges':additional_ch})      
      GrossTotal = subtotal + additional_ch;
      console.log(GrossTotal);
      if ($('#advanceReceipts').prop('checked')) {
        var logsAmt = Math.abs(parseInt($('.logsAmt').text()));
        GrossTotal = GrossTotal - logsAmt;
      }
      selfobj.model.set({'grosstt':GrossTotal});
      $(".subTotal").empty().html(numberFormat(subtotal, 2));
      $(".amtInWords").empty().html(selfobj.numberToWords(GrossTotal));
      $(".qtyTotal").empty().html(numberFormat(TotalQty, 2));
      $(".discTotal").empty().html(numberFormat(TotalDiscount, 2));
      $(".priceTotal").empty().html(numberFormat(TotalPrice, 2));
      $(".discTotal").empty().html(numberFormat(TotalDiscount, 2));
      $(".gstTotal").empty().html(numberFormat(TotalGST, 2));
      $(".grossAmount").html(numberFormat(GrossTotal, 2));
      if ($('#roundOff').prop('checked')) {
        var rrd = Math.round(numberFormat(GrossTotal, 2)) - GrossTotal;
        $(".roundOff").html(numberFormat(rrd, 2));  
        $(".grossAmount").html(Math.round(numberFormat(GrossTotal, 2)));
      }
      $(".diginum").digits();
    },
    updateTaxBox : function(){
      selfobj = this;
      if(selfobj.customerList.models){
        let cust = selfobj.customerList.models.find((item) => {
          return item && item.attributes && item.attributes.customer_id == selfobj.model.attributes.customer_id;
        });
        if(cust){
          $('.custDetails').hide();
          $('.customerDetailsDrop').hide();
          $('.customerAddDetails').show();
          $('.custName').empty().append(cust.attributes.name); 
          $('.custAddress').empty().append(cust.attributes.address); 
          if (cust.attributes.address != '' && cust.attributes.address != null) {
            $('#ship_to').removeAttr("disabled");
            $('.addressBeware').hide();
          }else
          {
            $('#ship_to').attr("disabled", true);
            $('.addressBeware').show();
            
          }
          $('.custZipcode').empty().append('Zip Code: ' + (cust.attributes.zipcode ? cust.attributes.zipcode : '-'));
          $('.custMobileNo').empty().append('Phone No.:' + (cust.attributes.mobile_no ? cust.attributes.mobile_no : '-')); 
          $('.custGstCls').empty().append('GST: ' + (cust.attributes.gst_no ? cust.attributes.gst_no : '-')); 
        }

        if (selfobj.model.get("ship_to") == 'yes') { 
          $('.shippingDetails').hide();
          $('.shipTouncheckCls').hide();
          $('.shipTocheckCls').show();
          if(cust){
            $('.shipTocheckCls .custName').empty().append(cust.attributes.name); 
            $('.shipTocheckCls .custAddress').empty().append(cust.attributes.address); 
            $('.shipTocheckCls .custZipcode').empty().append('Zip Code: ' + (cust.attributes.zipcode ? cust.attributes.zipcode : '-')); 
            $('.shipTocheckCls .custMobileNo').empty().append('Phone No.:' + (cust.attributes.mobile_no ? cust.attributes.mobile_no : '-')); 
            $('.shipTocheckCls .custGstCls').empty().append('GST: ' + (cust.attributes.gst_no ? cust.attributes.gst_no : '-')); 
          }
        } else {
          if (selfobj.model.get("shipping_address") != '' && selfobj.model.get("shipping_address") != null && selfobj.model.get("shipping_address") != undefined) { 
            var shippingAddress = selfobj.model.get("shipping_address");
            if (shippingAddress && shippingAddress.trim() !== '') {
              shippingAddress  = JSON.parse(shippingAddress);
            }
            $('.shippingDetails').hide();
            $('.shipTocheckCls').hide();
            $('.shipTouncheckCls').show();
            $('.shipTouncheckCls .custAddress').empty().append(shippingAddress.address); 
            $('.shipTouncheckCls .custZipcode').empty().append('Zip Code: ' + (shippingAddress.zipcode ? shippingAddress.zipcode : '-')); 
            $('.shipTouncheckCls .custMobileNo').empty().append('Phone No.: '+ (shippingAddress.mobile_no ? shippingAddress.mobile_no : '-') ); 
          }else{
            $('.shippingDetails').show();
            $('.shipTocheckCls').hide();
            $('.shipTouncheckCls').hide();
          } 
        }
        var stateID = cust ? cust.attributes.state_id : undefined;
        this.model.set({"cust_state_id" : stateID});
        //alert(this.model.get('customer_id'));
        if(this.model.get('customer_id') == "" || typeof this.model.get('customer_id') == undefined ){
          // alert(this.model.customer_id);
          $('.apply_tax-check').hide(); 
          $('.item_sgst').hide();
          $('.item_cgst').hide();
          $('.item_igst').hide();
        }
      }
    },
    uploadInvoiceLogo: function (e) {
      e.stopPropagation();
      $('#largeModal').modal('toggle');
      this.elm = "profile_pic";
      new readFilesView({ loadFrom: "addpage", loadController: this });
    },
    getSelectedFile: function (url) {
      var selfobj = this;
      $('.' + this.elm).val(url);
      $('.' + this.elm).change();
      $("#profile_pic_view").attr("src", url);
      $("#profile_pic_view").css({ "max-width": "100%" });
      $('#largeModal').modal('toggle');
      $('.uploadInvoiceLogo').hide();
      
      var companyID = DEFAULTCOMPANY; 
      selfobj.companySingleModel.set({'infoID' : companyID}); 
      selfobj.companySingleModel.set({ "invoice_logo": url });
      selfobj.companySingleModel.set({ "menuId": selfobj.companyMenuID });
      
      selfobj.companySingleModel.save({}, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type:"POST"
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        if (res.flag == "S") {
    
        }
      });
    },
    updateCompanyDetails: function (e) {
      var selfobj = this;
      var valuetxt = $(e.currentTarget).val();
      var toID = $(e.currentTarget).attr("id");
      var newdetails = [];
      newdetails["" + toID] = valuetxt;
      selfobj.companySingleModel.set(newdetails);
      var companyID = DEFAULTCOMPANY; 
      selfobj.companySingleModel.set({'infoID' : companyID}); 
      selfobj.companySingleModel.set({ "menuId": selfobj.companyMenuID });
      selfobj.companySingleModel.save({}, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type:"POST"
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        if (res.flag == "S") {
    
        }
      });
    },
    initializeValidate: function () {
      var selfobj = this;
      var today = new Date();
      var dd = String(today.getDate()).padStart(2, '0');
      var mm = String(today.getMonth() + 1).padStart(2, '0');
      var yyyy = today.getFullYear();
      today = dd + '-' + mm + '-' + yyyy;
      
      var nextWeek = new Date(yyyy + '-' + mm + '-' + dd);
      nextWeek.setDate(nextWeek.getDate() + 7);
      var dd = String(nextWeek.getDate()).padStart(2, '0');
      var mm = String(nextWeek.getMonth() + 1).padStart(2, '0');
      var yyyy = nextWeek.getFullYear();
      nextWeek = dd + '-' + mm + '-' + yyyy;
      if(!(selfobj.model.get('invoiceDate'))){
        $('#invoiceDate').val(today);
        $('#valid_until_date').val(nextWeek);
      }
      if(!(selfobj.model.get('valid_until_date'))){
        $('#valid_until_date').val(nextWeek);
      }
      
      $('#invoiceDate').datepickerBT({
        format: "dd-mm-yyyy",
        todayBtn: "linked",
        clearBtn: true,
        todayHighlight: true,
        StartDate: new Date(),
        numberOfMonths: 1,
        autoclose: true,
        filterCName: true,
      }).on('changeDate', function (ev) {
        $('#invoiceDate').change();
        var valuetxt = $("#invoiceDate").val();
        selfobj.model.set({ invoiceDate: valuetxt });
      });

      $('#valid_until_date').datepickerBT({
        format: "dd-mm-yyyy",
        todayBtn: "linked",
        clearBtn: true,
        todayHighlight: true,
        StartDate: new Date(),
        numberOfMonths: 1,
        autoclose: true,
        filterCName: true
      }).on('changeDate', function (ev) {
        $('#valid_until_date').change();
        var valuetxt = $("#valid_until_date").val();
        selfobj.model.set({ valid_until_date: valuetxt });
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
        var valuetxt =$('#payment_date').val();
        selfobj.model.set({ payment_date: valuetxt });
      });
  
      var dynamicRules = selfobj.dynamicFieldRenderobj.getValidationRule();

      $('.digits').inputmask('Regex', { regex: "^[0-9]{1,15}(\\.\\d{1,2})?$" });
      $('.percentage').inputmask('Regex', { regex: "^[0-9]{1,2}(\\.\\d{1,2})?$" });

    },
    refreshCust : function(){
      this.customerList.fetch({
        headers:
        {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, data: { status: 'active',getAll : 'Y'}
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".profile-loader").hide();
        selfobj.model.set("customerList", res.data);
        selfobj.render();
        $('.custDetails').hide();
        $('.customerAddDetails').hide();
      });
    },
    onErrorHandler: function (collection, response, options) {
      alert("Something was wrong ! Try to refresh the page or contact administer. :(");
      $(".profile-loader").hide();
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
            selfobj.model.set({ "state_id": res.data[0].state_id });
            selfobj.render();
          }
        }
      });
    },
    setnarration: function (product_id, last) {
      var nlist = selfobj.model.get("narrList");
      $.each(nlist, function (key, value) {
        if (product_id == value.product_id) {
          
          $("#itemName_" + last).val(value.product_description);

          // $("#itemQuantity_" + tid[1]).val(value.quantity);
        }
      });
      // $('.accessories').show();
    },

    delAllRows : function(e){
      $("tr.item-list-box").each(function (key, value) {
        $(this).remove();
      });
      this.addRow(e);
      this.reArrangeIndex();  
      this.rowTotal(e);
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
      if(toID == 'customer_id'){
        if(valuetxt == "addCustomer")
        {
          new customerSingleView({ searchCustomer: this, loadfrom: "TaxInvoice",form_label:'Add Customer' });
        }else
        {
          this.updateTaxBox();
        } 
      }     
      if (valuetxt == "addCategory") {
        var slug = $(e.currentTarget).attr("data-slug");
        alert(slug);
        new categorySingleView({slug : slug , searchCategory: this, loadfrom: "taxInvoiceSingleView" , form_label : "Category" });
      }
      if (this.model.get(toID) && Array.isArray(this.model.get(toID))) {
        this.model.set(toID, this.model.get(toID).join(","));
      }
    },
    updatemultiSelDetails: function (e) {
      var valuetxt = $(e.currentTarget).val();
      var toName = $(e.currentTarget).attr("name");
      var existingValues = this.model.get(toName);
      if (typeof existingValues !== 'string') {
          existingValues = '';
      }
  
      if ($(e.currentTarget).prop('checked')) {
          if (existingValues.indexOf(valuetxt) === -1) {
              existingValues += (existingValues.length > 0 ? ',' : '') + valuetxt;
          }
      } else {
          existingValues = existingValues
              .split(',')
              .filter(value => value !== valuetxt)
              .join(',');
      }
      this.model.set({ [toName]: existingValues });
    },
    getProducts: function (e) {
      var lastID = $(e.currentTarget).attr("id");
      var lasts = lastID.split("_");
      var lastDetails = lasts[1];
      var name = $(e.currentTarget).val();
      var dropdownContainer = $("#productDropdown_"+lastDetails);
      var table = "customer";
      if (name != "") {
        $.ajax({
          url: APIPATH + 'getSearchedProduct',
          method: 'POST',
          data: { text: name },
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
            if (res.msg === "sucess") { 
              
              if(res.data.length > 0) {
              $.each(res.data, function (index, value) {
                dropdownContainer.append('<div id= "sd_'+lastDetails  +'" class="dropdown-item selectProduct" style="background-color: #ffffff;" data-productID=' + value.product_id + '>' + value.product_name+'</div>');
              });
              dropdownContainer.show();
            }
          }else {
              // dropdownContainer.append('<div class="dropdown-item addNewRecord" data-view = "product" style="background-color: #5D60A6; color:#ffffff;" > Add New Product </div>');
              // dropdownContainer.show();
            }
          }
        });
      } else {
        dropdownContainer.hide();
      }
      if (!$(e.currentTarget).is(':focus')) {
        dropdownContainer.hide();
      }
    },
    setProduct: function (e) {
      e.preventDefault();
      let selfobj = this;
      var lastID = $(e.currentTarget).attr("id");
      var lasts = lastID.split("_");
      var lastDetails = lasts[1];
      var product_name = $(e.currentTarget).clone().find('span').remove().end().text();   
      var productID = $(e.currentTarget).attr('data-productID');
      $("#productDropdown_"+lastDetails).hide();
      $('#narr_'+lastDetails).val(product_name);
      $('#narr_'+lastDetails).attr({'product_id':productID});
      selfobj.setnarration(productID,lastDetails);
    },
    getPaymentLogs:function(invoiceID){
      $('#paylogs').empty();
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
          if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
          if(res.flag == "S"){
            if(res.data.length > 0){
              var logsTotal = 0 ;
             var tbl = '<tbody id="receiptList"></tbody>'
             $('#receipt-table').append(tbl); 
             var row = '';
              $.each(res.data, function(key, value) {
                row = '<tr><th style="width:50%;text-align:left">'+value.receipt_number+'</th><td style="text-align:right">'+numberFormat(value.amount,2)+'</td></tr>' //<td>'+value.transaction_id+'</td><td>'+formatDate(value.payment_log_date)+'</td><td>'+value.paymentMode+'</td><td>'+formatDate(value.created_date)+'</td><td><a href="'+UPLOADS+'/invoiceLog/'+value.invoice_id+'/'+value.payment_log_id+'/'+value.attachement+'" target="_blank"data-toggle="tooltip" data-placement="top" title="View Attachment" style="color: #5f6368;"><span class="material-symbols-outlined">visibility</span></a></td>
                $('#receiptList').append(row);
                logsTotal += parseFloat(value.amount) ;
              });
              
              row = '<tr><th style="width:50%;text-align:left">Receipts Total</th><td align="right">'+numberFormat(logsTotal,2)+'</td></tr>' //<td>'+value.transaction_id+'</td><td>'+formatDate(value.payment_log_date)+'</td><td>'+value.paymentMode+'</td><td>'+formatDate(value.created_date)+'</td><td><a href="'+UPLOADS+'/invoiceLog/'+value.invoice_id+'/'+value.payment_log_id+'/'+value.attachement+'" target="_blank"data-toggle="tooltip" data-placement="top" title="View Attachment" style="color: #5f6368;"><span class="material-symbols-outlined">visibility</span></a></td>
              $('#receiptList').append(row);

              var pendingAmt = parseFloat(selfobj.model.get('grossAmount')) - logsTotal;
              row = '<tr><th style="width:50%;text-align:left"> Pending Amount </th><td align="right">'+numberFormat(pendingAmt,2)+'</td></tr>' //<td>'+value.transaction_id+'</td><td>'+formatDate(value.payment_log_date)+'</td><td>'+value.paymentMode+'</td><td>'+formatDate(value.created_date)+'</td><td><a href="'+UPLOADS+'/invoiceLog/'+value.invoice_id+'/'+value.payment_log_id+'/'+value.attachement+'" target="_blank"data-toggle="tooltip" data-placement="top" title="View Attachment" style="color: #5f6368;"><span class="material-symbols-outlined">visibility</span></a></td>
              $('#receiptList').append(row);
            }
          }
        }
      });
    },
    selectOnlyThis: function(e) {
      var clickedCheckbox = e.currentTarget;
      var valueTxt = $(clickedCheckbox).val();
      var toName = $(clickedCheckbox).attr("name");
      this.$('input[name="' + toName + '"]').not(clickedCheckbox).prop('checked', false);
      var existingData = this.model.get(toName);
      this.model.set(toName, ($(clickedCheckbox).prop('checked')) ? valueTxt : null);
    },
    setOldValues: function () {
      var selfobj = this;
      setvalues = ["partially","fully"];
      selfobj.multiselectOptions.setValues(setvalues, selfobj);
    },
    setValues: function (e) {
      var selfobj = this;
      var da = selfobj.multiselectOptions.setCheckedValue(e);
      selfobj.model.set(da);

      $('.log').show();
      if (selfobj.model.get('payment_status') == 'fully') {
        $('#payment_amount').val(selfobj.model.get('grosstt'));
        $('#payment_amount').attr('disabled','disabled');
      }else{
        $('#payment_amount').val('');
        $('#payment_amount').removeAttr('disabled');
      }

    },
    saveTaxInvoiceDetails: function (e) {
      e.preventDefault();
      var selfobj = this;
      if (selfobj.model.get("ship_to") == 'yes') { 
        selfobj.model.set({ shipping_address: ''});
      }else{
        selfobj.model.set({ shipping_address: selfobj.model.get("shipping_address")});
      }
      let isNew = $(e.currentTarget).attr("data-action");
      var inconvertToInvoice = 'yes' ;
      invoiceItemsDetails.reset();
      var tmpinvoiceID = this.model.get("invoiceID");
      var invoiceID = selfobj.model.get("invoiceID");
      var customerID = selfobj.model.get("customer_id");
      var payment_status = selfobj.model.get("payment_status");
      var invoiceDate = $("#invoiceDate").val();
      var valid_until_date = $("#valid_until_date").val();
      var processingYear = $("#reportYear").val();
      var processingMonth = $("#reportMonth").val();
      var traineeCount = $("#traineeCount").val();
      var ship_to = selfobj.model.get("ship_to");
      var shipping_address = selfobj.model.get("shipping_address");
      var inconvertToInvoice = 'yes' ;
      var largestGst = selfobj.model.get('largestGst') ;
      var additionalCharges = selfobj.model.get('additionalCharges') ;
      var pending_amt = this.model.get('pending_amount');
      var logsAmt = this.logsAmt;
      var payment_date = this.model.get("payment_date") == '' || this.model.get("payment_date") == undefined ? '' : this.model.get("payment_date");
      var payment_amount = this.model.get("payment_amount") == '' || this.model.get("payment_amount") == undefined ? '' : this.model.get("payment_amount") ;
      var payment_mode = this.model.get("mode_of_payment") == '' || this.model.get("mode_of_payment") == undefined ? '' : this.model.get("mode_of_payment");
      var transaction_id = this.model.get("transaction_id") == '' || this.model.get("transaction_id") == undefined ? '' : this.model.get("transaction_id");
      var payment_note = this.model.get("payment_note") == '' || this.model.get("payment_note") == undefined ? '' : this.model.get("payment_note");
      var company_id = $.cookie('company_id');
      var show_on_pdf = $('#advanceReceipts').prop('checked') ? 'yes' : 'no';
      // var roundOff = $('#roundOff').prop('checked') ? 'yes' : 'no';
      if (record_type != 'quotation') {
        if(payment_status=='' || payment_status== undefined )
        {
          alert('Payment status required!');return;
        }
      }

      var record_type = 'invoice';
      var isnewInvoice = 'no' ;

      if (tmpinvoiceID != '' || tmpinvoiceID != 0 ) {
        var invoiceID = tmpinvoiceID;
      } else {
        var invoiceID = null;
      }
      if (invoiceID == null) {
        isnewInvoice = 'yes' ;
      }
      var invoiceID = null;
      var additional_charges = {};
      $(".fieldsSelection").each(function (key, value) {
        var lastAC = $(this).attr("id");
        var lastAd = lastAC.split("_");
        var lastAddCharges = lastAd[1];

        var title = $(this).find("input[name='field_title']").val();
        var rate = $(this).find("input[name='field_rate']").val();
        var gst = $(this).find("input[name='field_gst']").val();
        additional_charges[lastAddCharges] = {
          "title" : title,
          "rate" : rate,
          "gst" : gst,
        };
      });

      var additional_chargesStr = JSON.stringify(additional_charges);
      var error = [];
      // Set header Information
      var InheaderInfo = {'logsAmt':logsAmt,'pending_amt':pending_amt,'show_on_pdf':show_on_pdf,'additional_char' : additional_chargesStr,'largestGst':largestGst,'additionalCharges':additionalCharges,'inconvertToInvoice':inconvertToInvoice,'inconvertToInvoice':inconvertToInvoice,'payment_note':payment_note,'isnewInvoice':isnewInvoice,'company_id':company_id, "payment_date":payment_date,"payment_amount":payment_amount,"payment_mode":payment_mode,"transaction_id":transaction_id,"payment_status":payment_status,"invoiceID": invoiceID, "processingYear": processingYear, "processingMonth": processingMonth, "traineeCount": traineeCount, "customerID": customerID, "invoiceDate": invoiceDate,"valid_until_date": valid_until_date,"ship_to" : ship_to,"shipping_address" : shipping_address, "record_type":record_type};
      invoiceItemsDetails.add(InheaderInfo);
      console.log('HEADER :  ',InheaderInfo);
      $("tr.item-list-box").each(function (key, value) {
        var lastID = $(this).attr("id");
        var row = $(this).find(".sno").html();
        var lasts = lastID.split("-");
        var lastDetails = lasts[1];

        var narre = $("#narr_" + lastDetails).attr('product_id');
        if (narre == undefined || narre == '') {
          narre = $("#narr_" + lastDetails).val();
        }
        var itemQuantity = parseFloat($("#itemQuantity_" + lastDetails).val());
        var itemUnit = $("#itemUnit_" + lastDetails).val();
        var itemRate = parseFloat($("#itemRate_" + lastDetails).val());
        var itemDiscount = parseFloat($("#itemDiscount_" + lastDetails).val());
        var itemDiscountType = $("#itemDiscountType_" + lastDetails).val();
        var interGstPercent = $("#itemGST_" + lastDetails).val();
        var interGstAmount = $(".itemGstAmt_" + lastDetails).text();
        var itemtotal = $("#itemtotal_" + lastDetails).text();
        var withGst = $('#itemAmtWithGST_'+ lastDetails).is(":checked") ? 'y' : 'n';
        if (narre == "") {
          error.push("Item type can not blank. Row No." + row);
        }
        if (itemQuantity == "" || itemQuantity == 0) {
          error.push("Item quantity can not blank. Row No." + row);
        }
        if(selfobj.menuName != "delivery") {
          if (itemRate == "" || itemRate == 0) {
            error.push("Item rate can not blank. Row No." + row);
          }
        }
        var nerow = { "invoiceID": invoiceID,"itemtotal":itemtotal,"itemDiscountType":itemDiscountType,"itemDiscount":itemDiscount, "srno": lastDetails, "quantity": itemQuantity, "rate": itemRate,"withGst":withGst, "unit": itemUnit, "invoiceLineChrgID": narre ,"interGstPercent":interGstPercent ,"interGstAmount":interGstAmount };
        invoiceItemsDetails.add(nerow);
      });
      console.log(invoiceItemsDetails);
      if (error.length > 0) {
        var er = "";
        $.each(error, function (key, val) {

          er = er + val + "\n";
        });
        alert(er);
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
      // return;
      $(e.currentTarget).html("<span>Saving..</span>");
      $(e.currentTarget).attr("disabled", "disabled");
      invoiceItemsDetails.sync(method, invoiceItemsDetails, { 
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler
      }).done(function (res) {

        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        if (res.flag == "F") {
          alert(res.msg);
          $(e.currentTarget).html("<span>Error</span>");
          $(e.currentTarget).html("<span>Save</span>");
          $(e.currentTarget).removeAttr("disabled");
        } else {
          $(e.currentTarget).html("<span>Saved</span>");
          handelClose(selfobj.toClose);
          scanDetails.filterSearch();
          if (res.flag == "S") {
            if (res.lastlogID != undefined) {
              selfobj.logID = res.lastlogID;
            }
            if (res.lastInvoiceID != undefined) {
              selfobj.lastInvoiceID = res.lastInvoiceID;
            }
            let url = APIPATH + 'logsUpload/' + selfobj.logID +'/'+selfobj.lastInvoiceID;
            selfobj.uploadFileEl.elements.parameters.action = url;
            selfobj.uploadFileEl.prepareUploads(selfobj.uploadFileEl.elements);
            
            if (isNew == "new") {
              selfobj.model.clear().set(selfobj.model.defaults);
              selfobj.model.set({ menuId: selfobj.menuId});
              selfobj.dynamicFieldRenderobj.initialize({ ViewObj: selfobj, formJson: {}, });
              selfobj.render();
            } else {
              handelClose(selfobj.toClose);
            }
          }
        }
        setTimeout(function (e) {
          $(e.currentTarget).html("<span>Save</span>");
          $(e.currentTarget).removeAttr("disabled");
        }, 3000);
      });
    },
    fromEditors: function () {
      var selfobj = this;
      var __toolbarOptions = [
        ['bold', 'italic', 'underline', 'strike'],      
        [{ 'header': 1 }, { 'header': 2 }],             
        [{ 'direction': 'rtl' }],                       
        [{ 'size': ['small', false, 'large', 'huge'] }], 
        [{ 'align': [] }],
        ['link'],
          ['clean']                                        
      ]; 
      if(selfobj.menuName == 'quotation'){
        var editor = new Quill($("#quotation_terms_conditions").get(0), {
          modules: {
            toolbar: __toolbarOptions,
          },
          theme: "snow",
        });
      }else if(selfobj.menuName == 'invoice'){
        var editor = new Quill($("#invoice_terms_condotions").get(0), {
          modules: {
            toolbar: __toolbarOptions,
          },
          theme: "snow",
        });
      }else if(selfobj.menuName == 'receipt'){
        var editor = new Quill($("#receipt_terms_condotions").get(0), {
          modules: {
            toolbar: __toolbarOptions,
          },
          theme: "snow",
        });
      }
      if(editor){
        editor.on('text-change', function(delta, oldDelta, source) {
          if (source == 'api') {
              console.log("An API call triggered this change.");
            } else if (source == 'user') {
              var delta = editor.getContents();
              var text = editor.getText();
              var justHtml = editor.root.innerHTML;
              selfobj.companySingleModel.set({'infoID' : DEFAULTCOMPANY}); 
              selfobj.companySingleModel.set({"menuId":selfobj.companyMenuID});
              if(selfobj.menuName == 'quotation'){
                selfobj.companySingleModel.set({"quotation_terms_conditions":justHtml});
              }else if(selfobj.menuName == 'invoice'){
                selfobj.companySingleModel.set({"invoice_terms_condotions":justHtml});
              }else if(selfobj.menuName == 'receipt'){
                selfobj.companySingleModel.set({"receipt_terms_condotions":justHtml});
              }
              selfobj.companySingleModel.save({},{headers:{
                'Content-Type':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
              },error: selfobj.onErrorHandler,type:"POST" }).done(function(res){
                if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
                if(res.flag == "S"){
                  
                }        
              });
            }
        });
      }
    },
    render: function () {
      console.log("render");
      var source = taxInvoice_temp;
      var template = _.template(source);
      $("#" + this.toClose).remove();
      console.log('invoice Details : ',selfobj.companyDetails);
      console.log('model : ',selfobj.model.attributes);
      this.$el.html(template({ model: this.model.attributes , menuName : this.menuName,categoryList : selfobj.categoryList.models,companyDetails: selfobj.companyDetails ? selfobj.companyDetails[0] : []}));
      
      this.$el.addClass("tab-pane in active panel_overflow");
      this.$el.attr('id', this.toClose);
      this.$el.addClass(this.toClose);
      this.$el.data("role", "tabpanel");
      this.$el.data("current", "yes");
      $(".ws-tab").append(this.$el);
      $('#' + this.toClose).show();
      
      // this is used to append the dynamic form in the single view html
      $("#dynamicFormFields").empty().append(this.dynamicFieldRenderobj.getform());
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
          $('.modal-backdrop').hide();
        }
      });
      $(".cancelBtn").click(function(e){
        selfobj.filterSearch();
        $('#saveChangesBtn').unbind();
        $("#paymentModal").modal('hide'); 
        $(".modal-backdrop").hide();
      });

      // Do call this function from dynamic module it self.
      this.initializeValidate();
      this.setOldValues();
      this.attachEvents();
      this.updateTaxBox();
      this.reArrangeIndex();
      $('.ws-select').selectpicker();
      rearrageOverlays('Invoice', this.toClose);//selfobj.form_label
      this.fromEditors();
      if(selfobj.companyDetails && selfobj.companyDetails[0] && selfobj.companyDetails[0].invoice_logo){
        $('body').find(".uploadInvoiceLogo").hide();
        $('body').find(".uploadInvoiceLogo").addClass("d-none");
      }else{
        $('body').find(".uploadInvoiceLogo").show();
        $('body').find(".uploadInvoiceLogo").removeClass("d-none");
      }
      if (selfobj.model.get("invoiceID") == '' || selfobj.model.get("invoiceID") == null || selfobj.model.get("invoiceID") == undefined) { 
        $(".custShippingAddress").hide();
      }
      if (selfobj.model.get("invoiceID") != null && selfobj.model.get("invoiceID") != '' ) {
        $(".shippingDetails").hide();
        if (selfobj.model.get("ship_to") == 'yes') {
          $(".shipTocheckCls").show();
        }else
        {
          $(".shipTouncheckCls").show();
        }
        selfobj.ShowAdditionalCharges();
        selfobj.ShowPaymentLogs();
        selfobj.rowTotal();
       
      }
      $('.invoice_logo.accordion-content-description.is-open').css('height', '0px');
      $('.invoice_logo.accordion-content-description.is-open').css('height', ($('.invoice_logo.accordion-content-description').get(0).scrollHeight + 15) + 'px');
      $('.CustomerCompany.accordion-content-description.is-open').css('height', '0px');
      $('.CustomerCompany.accordion-content-description.is-open').css('height', ($('.CustomerCompany.accordion-content-description').get(0).scrollHeight + 15) + 'px');
      return this;

    }, onDelete: function () {
      this.remove();
    }
  });
  return taxInvoiceSingleView;
});
