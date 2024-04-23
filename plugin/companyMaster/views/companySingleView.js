define([
    'jquery',
    'underscore',
    'backbone',
    'validate',
    'inputmask',
    'datepickerBT',
    'Quill',
    '../../core/views/multiselectOptions',
    '../../dynamicForm/views/dynamicFieldRender',
    '../../readFiles/views/readFilesView',
    '../models/companySingleModel',
    '../../core/collections/countryCollection',
    '../../core/collections/stateCollection',
    '../../core/collections/cityCollection',
    'text!../templates/companySingle_temp.html',
  ], function ($, _, Backbone, validate, inputmask, datepickerBT,Quill, multiselectOptions, dynamicFieldRender,readFilesView,companySingleModel,countryCollection,stateCollection,cityCollection,companyTemp) {
  
    var companySingleView = Backbone.View.extend({
      model: companySingleModel,
      form_label:'',
      initialize: function (options) {
        var selfobj = this;
        this.toClose = "companySingleView";
        this.countryList = new countryCollection();
        this.stateList = new stateCollection();
        this.cityList = new cityCollection();
        $("#state_id").attr("disabled", true);
        $("#city_id").prop("disabled", true);
        this.pluginName = Backbone.history.getFragment();
        this.model = new companySingleModel();
        selfobj.dynamicFieldRenderobj = new dynamicFieldRender({ ViewObj: selfobj, formJson: {} });
        this.form_label = options.form_label;
        selfobj.menuId = options.menuId;
        selfobj.model.set({ menuId: options.menuId });
        this.countryList.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler, type: 'post', data: { getAll: 'Y' }
        }).done(function (res) {
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          $(".popupLoader").hide();
          $('body').find(".loder").hide();
          selfobj.render();
        });
        if (options.infoID != "" && options.infoID != "undefined") {
          this.model.set({ infoID: options.infoID });
          this.model.fetch({
            headers: {
              'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
            },data:{menuId:selfobj.model.get("menuId")}, error: selfobj.onErrorHandler
          }).done(function (res) {
            var country_id = selfobj.model.get("country_id");
            var state_id = selfobj.model.get("state_id");
            if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
            $(".popupLoader").hide();

          if( country_id != 0 && country_id != null && country_id != ""){
            selfobj.stateList.fetch({
              headers: {
                'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
              }, error: selfobj.onErrorHandler, type: 'post', data: { getAll: 'Y', country: country_id }
            }).done(function (res) {
              if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
              $(".popupLoader").hide();
              selfobj.render();
            });
          }

          if( state_id != 0 && state_id != null && state_id != ""){
            selfobj.cityList.fetch({
              headers: {
                'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
              }, error: selfobj.onErrorHandler, type: 'post', data: { getAll: 'Y', state: state_id }
            }).done(function (res) {
              if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
              $(".popupLoader").hide();
              selfobj.render();
            });
          }
            // selfobj.dynamicFieldRenderobj.prepareForm();
            selfobj.dynamicFieldRenderobj = new dynamicFieldRender({ ViewObj: selfobj, formJson: {} });
            selfobj.render();
          });
        }
        
        this.multiselectOptions = new multiselectOptions();
        $(".modelbox").hide();
        scanDetails = options.searchCompany;
        $(".popupLoader").show();
      },
      events:
      {
        "click .saveCompanyDetails": "saveCompanyDetails",
        "click .item-container li": "setValues",
        "blur .txtchange": "updateOtherDetails",
        "click .multiSel": "setValues",
        "change .bDate": "updateOtherDetails",
        "change .dropval": "updateOtherDetails",
        "change .logoAdded": "updateImageLogo",
        "click .loadMedia": "loadMedia",
        "blur .multiselectOpt": "updatemultiSelDetails",
        "click .singleSelectOpt": "selectOnlyThis",
        "change .countryChange": "setCountry",
        "change .stateChange": "setState",
      },
  
      attachEvents: function () {
        // Detach previous event bindings
        this.$el.off('click', '.saveCompanyDetails', this.saveCompanyDetails);
        this.$el.on('click', '.saveCompanyDetails', this.saveCompanyDetails.bind(this));
        this.$el.off('click', '.multiSel', this.setValues);
        this.$el.on('click', '.multiSel', this.setValues.bind(this));
        this.$el.off('change', '.bDate', this.updateOtherDetails);
        this.$el.on('change', '.bDate', this.updateOtherDetails.bind(this));
        this.$el.off('change', '.dropval', this.updateOtherDetails);
        this.$el.on('change', '.dropval', this.updateOtherDetails.bind(this));
        this.$el.off('click', '.iconSelection', this.setIconValues);
        this.$el.off('blur', '.txtchange', this.updateOtherDetails);
        this.$el.on('blur', '.txtchange', this.updateOtherDetails.bind(this));
        this.$el.off('click', '.loadMedia', this.loadMedia);
        this.$el.on('click', '.loadMedia', this.loadMedia.bind(this));
        this.$el.off('click', '.multiselectOpt', this.updatemultiSelDetails);
        this.$el.on('click', '.multiselectOpt', this.updatemultiSelDetails.bind(this));
        this.$el.off('click', '.singleSelectOpt', this.selectOnlyThis);
        this.$el.on('click', '.singleSelectOpt', this.selectOnlyThis.bind(this));
        this.$el.off("change", ".countryChange", this.setCountry);
        this.$el.on("change", ".countryChange", this.setCountry.bind(this));
        this.$el.off("change", ".stateChange", this.setState);
        this.$el.on("change", ".stateChange", this.setState.bind(this));
      },
  
      loadMedia: function (e) {
        e.stopPropagation();
        $('#largeModal').modal('toggle');
        this.elm = "profile_pic";
        new readFilesView({ loadFrom: "addpage", loadController: this });
      },

      getSelectedFile: function (url) {
        $('.' + this.elm).val(url);
        $('.' + this.elm).change();
        $("#profile_pic_view").attr("src", url);
        $("#profile_pic_view").css({ "max-width": "100%" });
        $('#largeModal').modal('toggle');
        // this.model.set({ "invoice_logo": url });
        this.model.set({ "invoice_logo": '' });
      },
  
      onErrorHandler: function (collection, response, options) {
        alert("Something was wrong ! Try to refresh the page or contact administer. :(");
        $(".profile-loader").hide();
      },
  
      updateOtherDetails: function (e) {
        var valuetxt = $(e.currentTarget).val();
        var toName = $(e.currentTarget).attr("id");
        var newdetails = [];
        newdetails["" + toName] = valuetxt;
        this.model.set(newdetails);
        if (this.model.get(toName) && Array.isArray(this.model.get(toName))) {
          this.model.set(toName, this.model.get(toName).join(","));
        }
      },
  
      updatemultiSelDetails: function (e) {
        var valuetxt = $(e.currentTarget).val();
        var toName = $(e.currentTarget).attr("id");
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
  
      selectOnlyThis: function(e) {
        var clickedCheckbox = e.currentTarget;
        var valueTxt = $(clickedCheckbox).val();
        var toName = $(clickedCheckbox).attr("id");
        this.$('input[name="' + toName + '"]').not(clickedCheckbox).prop('checked', false);
        var existingData = this.model.get(toName);
        this.model.set(toName, ($(clickedCheckbox).prop('checked')) ? valueTxt : null);
      },
      
      setOldValues: function () {
        var selfobj = this;
        setvalues = ["companyName"];
        selfobj.multiselectOptions.setValues(setvalues, selfobj);
      },
  
      setValues: function (e) {
        var selfobj = this;
        var da = selfobj.multiselectOptions.setCheckedValue(e);
        selfobj.model.set(da);
      },
  
      saveCompanyDetails: function (e) {
        e.preventDefault();
        let selfobj = this;
        var mid = this.model.get("infoID");
        let isNew = $(e.currentTarget).attr("data-action");
        if (permission.edit != "yes") {
          alert("You dont have permission to edit");
          return false;
        }
        if (mid == "" || mid == null) {
          var methodt = "PUT";
        } else {
          var methodt = "POST";
        }
        // var quotationContent = tinymce.get("quotation_terms_conditions").getContent();
        // this.model.set({ 'quotation_terms_conditions': quotationContent });
        // var invoiceContent = tinymce.get("invoice_terms_condotions").getContent();
        // this.model.set({ 'invoice_terms_condotions': invoiceContent });
        // var receiptContent = tinymce.get("receipt_terms_condotions").getContent();
        // this.model.set({ 'receipt_terms_condotions': receiptContent });
        if ($("#companyDetails").valid()) {
          $(e.currentTarget).html("<span>Saving..</span>");
          $(e.currentTarget).attr("disabled", "disabled");
          this.model.save({}, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
            }, error: selfobj.onErrorHandler, type: methodt
          }).done(function (res) {
            if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
  
            if (isNew == "new") {
              showResponse(e, res, "Save & New");
            } else {
              showResponse(e, res, "Save");
            }
            scanDetails.filterSearch();
            if (res.flag == "S") {
              if (isNew == "new") {
                selfobj.model.clear().set(selfobj.model.defaults);
                selfobj.model.set({ menuId: selfobj.menuId});
                selfobj.dynamicFieldRenderobj.initialize({ ViewObj: selfobj, formJson: {} });
                selfobj.render();
                // selfobj.attachEvents();
              } else {
                handelClose(selfobj.toClose);
              }
            }
          });
        }
      },
      initializeValidate: function () {
        var selfobj = this;
        var feilds = {
            companyName: {
                required: true,
              },
        };
        var feildsrules = feilds;
        var dynamicRules = selfobj.dynamicFieldRenderobj.getValidationRule();
  
        if (!_.isEmpty(dynamicRules)) {
          var feildsrules = $.extend({}, feilds, dynamicRules);
        }
        var messages = {
            companyName: "Please enter Company Name",
        };
        $('#mobile_no').inputmask('Regex', { regex: "^[0-9](\\d{1,9})?$" });
        $("#companyDetails").validate({
          rules: feildsrules,
          messages: messages
        });

        var input = document.getElementById('company_address');
        var autocomplete = new google.maps.places.Autocomplete(input);
        autocomplete.addListener('place_changed', function () {
          var place = autocomplete.getPlace();
          if (place == "") {
            selfobj.model.set({ "company_address": input.value() });
          } else {
            selfobj.model.set({ "company_address": place.formatted_address });
            selfobj.model.set({ "latitude": place.geometry['address'].lat() });
            selfobj.model.set({ "longitude": place.geometry['address'].lng() });
            selfobj.model.set({ "address_url": place.url });
          }
        });
        $(".ws-select").selectpicker('refresh');
  
      },

      setCountry: function (e) {
        e.stopPropagation();
        let selfobj = this;
        var country_id = $(e.currentTarget).val();
        this.model.set({ country_id: country_id });
        this.stateList.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler, type: 'post', data: { getAll: 'Y', country: country_id }
        }).done(function (res) {
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          $(".popupLoader").hide();
          selfobj.render();
        });
      },
  
      setState: function (e) {
        e.stopPropagation();
        $('#city_id').val("");
        let selfobj = this;
        var state_id = $(e.currentTarget).val();
        this.model.set({ state_id: state_id });
        this.cityList.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler, type: 'post', data: { getAll: 'Y', state: state_id }
        }).done(function (res) {
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          $(".popupLoader").hide();
          selfobj.render();
        });
      },

      // fromEditors: function () {
      //   var selfobj = this;
      //   var toolbarOptions = [
      //     ['bold', 'italic', 'underline', 'strike'],       
      //     [{ 'header': 1 }, { 'header': 2 }],              
      //     [{ 'direction': 'rtl' }],                      
      //     [{ 'size': ['small', false, 'large', 'huge'] }],  
      //     [{ 'align': [] }],
      //     ['link'],
      //     ['clean'],                    
      //   ];
        
      //   function initializeQuill(id) {
      //     console.log("id",id);
      //       var editor = new Quill($(id).get(0), {
      //           modules: {
      //               imageResize: {
      //                   displaySize: true
      //               },
      //               toolbar: {
      //                   container: toolbarOptions,
                       
      //               },
      //           },
      //           theme: 'snow'
      //       });
      //       console.log("editor",editor);

      //       editor.on("text-change", function (delta, oldDelta, source) {
      //         console.log("text-change");
      //         console.log("source",source);
      //         if (source == "api") {
      //           console.log("An API call triggered this change.");
      //         } else if (source == "user") {
      //           var delta = editor.getContents();
      //           var text = editor.getText();
      //           var justHtml = editor.root.innerHTML;
      //           if ($(id).is("#quotation_terms_conditions")) {
      //             selfobj.model.set({ "quotation_terms_conditions": justHtml });
      //           } else if ($(id).is("#invoice_terms_condotions")) {
      //               selfobj.model.set({ "invoice_terms_condotions": justHtml });
      //           } else if ($(id).is("#receipt_terms_condotions")) {
      //               selfobj.model.set({ "receipt_terms_condotions": justHtml });
      //           } 
      //         }
      //       });
      //   }
      //   // Initialize Quill for each ID
      //   initializeQuill("#quotation_terms_conditions");
      //   initializeQuill("#invoice_terms_condotions");
      //   initializeQuill("#receipt_terms_condotions");
  
      // },

      render: function () {
        var selfobj = this;
        var source = companyTemp;
        var template = _.template(source);
        $("#" + this.toClose).remove();
        this.$el.html(template({ "model": this.model.attributes,countryList: this.countryList.models, stateList: this.stateList.models, cityList: this.cityList.models }));
        this.$el.addClass("tab-pane in active panel_overflow");
        this.$el.attr('id', this.toClose);
        this.$el.addClass(this.toClose);
        this.$el.data("role", "tabpanel");
        this.$el.data("current", "yes");
        $(".tab-content").append(this.$el);
        $('#' + this.toClose).show();
        $(".ws-select").selectpicker("refresh");
        $(".ws-select").selectpicker();
        $("#dynamicFormFields").empty().append(this.dynamicFieldRenderobj.getform());
        this.initializeValidate();
        this.setOldValues();
        this.attachEvents();
        var country_id = selfobj.model.get("country_id");
        var state_id = selfobj.model.get("state_id");
        if( country_id != 0 && country_id != null && country_id != ""){
          $('#state_id').removeAttr("disabled");
          $('.stateChange').find('.btn.dropdown-toggle').removeClass("disabled");
        }
        if( state_id != 0 && state_id != null && state_id != ""){
          $('#city_id').removeAttr("disabled");
          $('.cityChange').find('.btn.dropdown-toggle').removeClass("disabled");
        }
        rearrageOverlays(selfobj.form_label, this.toClose);
        // this.fromEditors();

        var __toolbarOptions = [
          ["bold", "italic", "underline", "strike"],
          [{ header: 1 }, { header: 2 }],
          [{ direction: "rtl" }], 
          [{ size: ["small", false, "large", "huge"] }], 
          [{ align: [] }],
          ["link"],
          ["clean"],
        ];
        var invoiceEditor = new Quill($("#invoice_terms_condotions").get(0), {
          modules: {
            toolbar: __toolbarOptions,
          },
          theme: "snow",
        });
        console.log("invoiceEditor",invoiceEditor);
     
        invoiceEditor.on("text-change", function (delta, oldDelta, source) {
          console.log("text-change");
          console.log("source",source);
          if (source == "api") {
            console.log("An API call triggered this change.");
          } else if (source == "user") {
            var delta = invoiceEditor.getContents();
            var text = invoiceEditor.getText();
            var justHtml = invoiceEditor.root.innerHTML;
            selfobj.model.set({ invoice_terms_condotions: justHtml });
          }
        });

        var quotationEditor = new Quill($("#quotation_terms_conditions").get(0), {
          modules: {
            toolbar: __toolbarOptions,
          },
          theme: "snow",
        });
        console.log("quotationEditor",quotationEditor);
     
        quotationEditor.on("text-change", function (delta, oldDelta, source) {
          console.log("text-change");
          console.log("source",source);
          if (source == "api") {
            console.log("An API call triggered this change.");
          } else if (source == "user") {
            var delta = quotationEditor.getContents();
            var text = quotationEditor.getText();
            var justHtml = quotationEditor.root.innerHTML;
            selfobj.model.set({ quotation_terms_conditions: justHtml });
          }
        });

        var receiptEditor = new Quill($("#receipt_terms_condotions").get(0), {
          modules: {
            toolbar: __toolbarOptions,
          },
          theme: "snow",
        });
        console.log("receiptEditor",receiptEditor);
     
        receiptEditor.on("text-change", function (delta, oldDelta, source) {
          console.log("text-change");
          console.log("source",source);
          if (source == "api") {
            console.log("An API call triggered this change.");
          } else if (source == "user") {
            var delta = receiptEditor.getContents();
            var text = receiptEditor.getText();
            var justHtml = receiptEditor.root.innerHTML;
            selfobj.model.set({ receipt_terms_condotions: justHtml });
          }
        });
        return this;
      }, onDelete: function () {
        this.remove();
      }
    });
  
    return companySingleView;
  
  });