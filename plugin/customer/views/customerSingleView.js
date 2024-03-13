define([
  'jquery',
  'underscore',
  'backbone',
  'validate',
  'inputmask',
  'datepickerBT',
  'moment',
  'RealTimeUpload',
  'Swal',
  '../../category/views/categorySingleView',
  '../../core/views/multiselectOptions',
  '../../dynamicForm/views/dynamicFieldRender',
  "../../category/collections/slugCollection",
  '../collections/countryCollection',
  '../collections/stateCollection',
  '../collections/cityCollection',
  '../models/customerSingleModel',
  '../../readFiles/views/readFilesView',
  'text!../templates/customerSingle_temp.html',
], function ($, _, Backbone, validate, inputmask, datepickerBT, moment, RealTimeUpload, Swal, categorySingleView, multiselectOptions, dynamicFieldRender, slugCollection, countryCollection, stateCollection, cityCollection, customerSingleModel, readFilesView, customertemp) {
  var customerSingleView = Backbone.View.extend({
    model: customerSingleModel,
    form_label: '',
    custID:'',
    initialize: function (options) {
      this.toClose = "customerSingleView";
      this.menuName = options.menuName;
      this.menuId = options.menuId;
      this.loadFrom = options.loadfrom;
      this.model = new customerSingleModel();
      var selfobj = this;
      selfobj.model.set({ menuId: options.menuId });
      this.form_label = options.form_label;
      this.multiselectOptions = new multiselectOptions();
      $(".modelbox").hide();
      scanDetails = options.searchCustomer;
      $(".popupLoader").show();
      $(".profile-loader").show();
      this.stateList = new stateCollection();
      this.cityList = new cityCollection();
      $("#state_id").attr("disabled", true);
      $("#city_id").prop("disabled", true);
      this.categoryList = new slugCollection();
      this.categoryList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y', slug: 'lead_stages,lead_source' }
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        $('body').find(".loder").hide();
        selfobj.render();
        // $(".profile-loader").hide();
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
      
      selfobj.dynamicFieldRenderobj = new dynamicFieldRender({ ViewObj: selfobj, formJson: {} });
      this.custID = options.customer_id;
      if (options.customer_id != "" && options.customer_id != undefined) {
        this.model.set({ customer_id: options.customer_id });
        this.model.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          },data:{menuId:selfobj.model.get("menuId")}, error: selfobj.onErrorHandler
        }).done(function (res) {
          var birthDate = selfobj.model.get("birth_date");
          var country_id = selfobj.model.get("country_id");
          var state_id = selfobj.model.get("state_id");
          if (birthDate != null && birthDate != "0000-00-00") {
            selfobj.model.set({ "birth_date": moment(birthDate).format("DD-MM-YYYY") });
          }
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
          selfobj.setOldValues();
        });
      }
    },

    events: {
      "click .saveCustomerDetails": "saveCustomerDetails",
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
      "click .loadFile" : "loadFile",
      "click .hideUpload" : "hideUpload",
      "click .deleteAttachment": "deleteAttachment",
    },
    attachEvents: function () {
      // Detach previous event bindings
      this.$el.off("click", ".saveCustomerDetails", this.saveCustomerDetails);
      // Reattach event bindings
      this.$el.on("click", ".saveCustomerDetails", this.saveCustomerDetails.bind(this));
      this.$el.off("click", ".multiSel", this.setValues);
      this.$el.on("click", ".multiSel", this.setValues.bind(this));
      this.$el.off("change", ".bDate", this.updateOtherDetails);
      this.$el.on("change", ".bDate", this.updateOtherDetails.bind(this));
      this.$el.off("change", ".dropval", this.updateOtherDetails);
      this.$el.on("change", ".dropval", this.updateOtherDetails.bind(this));
      this.$el.off("click", ".iconSelection", this.setIconValues);
      this.$el.off("blur", ".txtchange", this.updateOtherDetails);
      this.$el.on("blur", ".txtchange", this.updateOtherDetails.bind(this));
      this.$el.off("click", ".loadMedia", this.loadMedia);
      this.$el.on("click", ".loadMedia", this.loadMedia.bind(this));
      this.$el.off('click', '.multiselectOpt', this.updatemultiSelDetails);
      this.$el.on('click', '.multiselectOpt', this.updatemultiSelDetails.bind(this));
      this.$el.off('click', '.singleSelectOpt', this.selectOnlyThis);
      this.$el.on('click', '.singleSelectOpt', this.selectOnlyThis.bind(this));
      this.$el.off("change", ".countryChange", this.setCountry);
      this.$el.on("change", ".countryChange", this.setCountry.bind(this));
      this.$el.off("change", ".stateChange", this.setState);
      this.$el.on("change", ".stateChange", this.setState.bind(this));
      this.$el.off('click', '.loadFile', this.loadFile);
      this.$el.on('click', '.loadFile', this.loadFile.bind(this));
      this.$el.off('click', '.hideUpload', this.hideUpload);
      this.$el.on('click', '.hideUpload', this.hideUpload.bind(this));
      this.$el.off('click', '.deleteAttachment', this.deleteAttachment);
      this.$el.on('click', '.deleteAttachment', this.deleteAttachment.bind(this));
    },

    onErrorHandler: function (collection, response, options) {
      alert(
        "Something was wrong ! Try to refresh the page or contact administer. :("
      );
      $(".profile-loader").hide();
    },

    updateOtherDetails: function (e) {
      var valuetxt = $(e.currentTarget).val();
      var toName = $(e.currentTarget).attr("id");
      if(valuetxt == "add_lead"){
        new categorySingleView({ searchCategory: this, loadfrom: "cutomer" , form_label:"Categories"});
      }
      var newdetails = [];
      newdetails["" + toName] = valuetxt;
      
      this.model.set(newdetails);
      if (this.model.get(toName) && Array.isArray(this.model.get(toName))) {
        this.model.set(toName, this.model.get(toName).join(","));
      }
      console.log(this.model);
    },

    loadFile: function(e){
      $('.upload').show();
      $('.dotborder').hide();
    },
    hideUpload: function (e) {
      $(".upload").hide();
      $('.dotborder').show();
    },
    
    refreshCat: function () {
      let selfobj = this;
      this.categoryList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y', slug: 'lead_stages,lead_source' }
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        selfobj.render();
      });
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

    setCountry: function (e) {
      e.stopPropagation();
      $('#state_id').val("");
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

    selectOnlyThis: function (e) {
      var clickedCheckbox = e.currentTarget;
      var valueTxt = $(clickedCheckbox).val();
      var toName = $(clickedCheckbox).attr("id");
      this.$('input[name="' + toName + '"]').not(clickedCheckbox).prop('checked', false);
      var existingData = this.model.get(toName);
      this.model.set(toName, ($(clickedCheckbox).prop('checked')) ? valueTxt : null);
    },

    setOldValues: function () {
      var selfobj = this;
      setvalues = ["record_type"];
      selfobj.multiselectOptions.setValues(setvalues, selfobj);
    },
    getSelectedFile: function (url) {
      $('.' + this.elm).val(url);
      $('.' + this.elm).change();
      $("#profile_pic_view").attr("src", url);
      $("#profile_pic_view").css({ "max-width": "100%" });
      $('#largeModal').modal('toggle');
      this.model.set({ "customer_image": url });
    },

    loadMedia: function (e) {
      e.stopPropagation();
      $('#largeModal').modal('toggle');
      this.elm = "profile_pic";
      var menusingleview = new readFilesView({ loadFrom: "addpage", loadController: this });
    },
    // setValues: function (e) {
    //   var selfobj = this;
    //   var da = selfobj.multiselectOptions.setCheckedValue(e);
    //   selfobj.model.set(da);
    // },

    deleteAttachment: function (e) {
      let file_id = $(e.currentTarget).attr("data-file_id");
      let customer_id = this.model.get("customer_id");
      let div = document.getElementById('removeIMG');
      let status = "delete";
      let selfobj = this;
      Swal.fire({
        title: "Delete Task ",
        text: "Do you want to delete Attachment ?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Delete',
        animation: "slide-from-top",
      }).then((result) => {
        if (result.isConfirmed) {
          if (file_id != null) {
            $.ajax({
              url: APIPATH + 'customer/removeAttachment',
              method: 'POST',
              data: { fileID: file_id, status: status, custID: customer_id },
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
                  $('#' + file_id + 'removeDiv').remove();
                  selfobj.model.set({ "attachment_file": "" });
                }
    
              }
            });
          } else {
            div.remove();
            selfobj.model.set({ "attachment_file": "" });
          }
        }else{

        }
      });
    },

    setValues: function (e) {
      setvalues = ["status", "record_type", "order"];
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

      if (selfobj.model.record_type === "individual") {
        // Set values for individual
        selfobj.model.set({
          "salutation": $("#salutation").val(),
          "first_name": $("#first_name").val(),
          "middle_name": $("#middle_name").val(),
          "last_name": $("# last_name").val(),
          "email": $("#email").val(),
          "mobile_no": $("# mobile_no").val(),
          "birth_date": $("#birth_date").val(),
          "customer_image": $("# customer_image").val(),
          "address": $("# address").val(),
        });
      } else if (selfobj.model.record_type === "company") {
        selfobj.model.set({
          "company_name": $("#company_name").val(),
          "billing_name": $("#billing_name").val(),
          "billing_address": $("#billing_address").val(),
          "branch_id": $("#branch_id").val(),
          "gst_no": $("#gst_no").val(),
          "email": $("#email").val(),
          "mobile_no": $("# mobile_no").val(),
          "adhar_number": $("#adhar_number").val(),
          "website": $("#website").val(),
          "country_code": $("#country_code").val(),
          "pan_number": $("#pan_number").val(),
        });
      }

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
          if (classname[0] == "record_type") {
            classname[0]
            selfobj.render();
          }
        }
      }, 50);

    },

    saveCustomerDetails: function (e) {
      e.preventDefault();
      let selfobj = this;
      var mid = this.model.get("customer_id");
      let isNew = $(e.currentTarget).attr("data-action");
      var stage = this.model.get("stages");
      if (permission.edit != "yes") {
        alert("You dont have permission to edit");
        return false;
      }
      if (mid == "" || mid == null) {
        var methodt = "PUT";
      } else {
        var methodt = "POST";
      }
      if (this.menuName == "customer") {
        this.model.set({ "type": "customer" });
      }
      if ($("#customerDetails").valid()) {
        $(e.currentTarget).html("<span>Saving..</span>");
        $(e.currentTarget).attr("disabled", "disabled");
        this.model.save({}, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler, type: methodt
        }).done(function (res) {
          if (res.lastID != undefined) {
            selfobj.custID = res.lastID;
          }
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          if (isNew == "new") {
            showResponse(e, res, "Save & New");
          } else {
            showResponse(e, res, "Save");
          }
          if (selfobj.loadFrom == "TaskSingleView") {
            scanDetails.refreshCust();
          }else if(selfobj.loadFrom == "TaxInvoice") {
            scanDetails.refreshCust();
          }else  if(selfobj.loadFrom == "AppointmentView") {
            scanDetails.render();
          }else  if(selfobj.loadFrom == "ReceiptSingleView") {
            scanDetails.refreshCust();
          }else if(selfobj.loadFrom == "proposalSingleView"){
            scanDetails.refreshCust(selfobj.custID);
          }else if(selfobj.loadFrom == "dashboard"){
            scanDetails.refreshDashboard(selfobj.custID);
          }else{
            scanDetails.filterSearch(false, stage);
          }
          if (res.flag == "S") {
            if (isNew == "new") {
              selfobj.model.clear().set(selfobj.model.defaults);
              selfobj.model.set({ menuId: selfobj.menuId });
              // selfobj.dynamicFieldRenderobj.prepareForm();
              let url = APIPATH + 'custUpload/' + selfobj.custID;
              selfobj.uploadFileEl.elements.parameters.action = url;
              selfobj.uploadFileEl.prepareUploads(selfobj.uploadFileEl.elements);
              selfobj.dynamicFieldRenderobj.initialize({ ViewObj: selfobj, formJson: {} });
              selfobj.render();
              // selfobj.attachEvents();
            } else {
              let url = APIPATH + 'custUpload/' + selfobj.custID;
              selfobj.uploadFileEl.elements.parameters.action = url;
              selfobj.uploadFileEl.prepareUploads(selfobj.uploadFileEl.elements);
              handelClose(selfobj.toClose);
            }
          }
        });
      }
    },

    initializeValidate: function () {
      var selfobj = this;
      var feilds = {
        name: {
          required: true,
        },

        office_land_line: {
          number: true,
          minlength: 8,
          maxlength: 10
        },

        pan_number:{
          minlength: 10,
          maxlength: 10,
        },

        company_name: {
          required: true,
        },

        adhar_number:{
          number: true,
          minlength: 12,
          maxlength: 12,
        },

        mobile_no:{
          number: true,
          minlength: 10,
          maxlength: 10,
        },

        gst_no:{
          minlength: 15,
          maxlength: 15,
        },

        email:{
          email: true,
        },

      };
      var feildsrules = feilds;
      var dynamicRules = selfobj.dynamicFieldRenderobj.getValidationRule();

      if (!_.isEmpty(dynamicRules)) {
        var feildsrules = $.extend({}, feilds, dynamicRules);

      }

      var messages = {
        name: "Please Enter Name",
        gst_no: "Please Enter valid number",
        office_land_line: "Please Enter valid number",
        email: "Please Enter valid Email",
        pan_number: "Please Enter valid PAN",
        adhar_number: "Please Enter valid Aadhar Number",
      };

      $.validator.addMethod("panPattern", function (value, element) {
        // Define the PAN card pattern
        var panPattern = /[a-zA-z]{5}\d{4}[a-zA-Z]{1}/;
        // Test the value against the pattern
        return this.optional(element) || panPattern.test(value);
      }, "Invalid PAN Number format");

      $("#mobile_no").inputmask("Regex", { regex: "^[0-9](\\d{1,9})?$" });
      $("#customerDetails").validate({
        rules: feildsrules,
        messages: messages,
      });

      $("#birth_date").datepickerBT({
        format: "dd-mm-yyyy",
        todayBtn: "linked",
        clearBtn: true,
        todayHighlight: true,
        endDate: new Date(),
        numberOfMonths: 1,
        autoclose: true,
      }).on('changeDate', function (selected) {
        $('#birth_date').change();
        var valuetxt = $("#birth_date").val();
        selfobj.model.set({ birth_date: valuetxt });
      });
      var input = document.getElementById('address');
      var autocomplete = new google.maps.places.Autocomplete(input);
      autocomplete.addListener('place_changed', function () {
        var place = autocomplete.getPlace();
        if (place == "") {
          selfobj.model.set({ "address": input.value() });
        } else {
          selfobj.model.set({ "address": place.formatted_address });
          selfobj.model.set({ "latitude": place.geometry['address'].lat() });
          selfobj.model.set({ "longitude": place.geometry['address'].lng() });
          selfobj.model.set({ "address_url": place.url });
        }
      });
      $(".ws-select").selectpicker('refresh');
    },

    render: function () {
      //var isexits = checkisoverlay(this.toClose);
      //if(!isexits){
      var selfobj = this;
      var source = customertemp;
      var template = _.template(source);
      $("#" + this.toClose).remove();
      this.$el.html(template({ model: this.model.attributes, categoryList: this.categoryList.models, menuName: this.menuName, countryList: this.countryList.models, stateList: this.stateList.models, cityList: this.cityList.models }));
      this.$el.addClass("tab-pane in active panel_overflow heading-top");
      this.$el.attr("id", this.toClose);
      this.$el.addClass(this.toClose);
      this.$el.data("role", "tabpanel");
      this.$el.data("current", "yes");
      $(".tab-content").append(this.$el);
      $("#" + this.toClose).show();
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

      this.uploadFileEl = $("#custUpload").RealTimeUpload({
        text: 'Drag and Drop or Select a File to Upload.',
        maxFiles: 0,
        maxFileSize: 4194304,
        uploadButton: false,
        notification: true,
        autoUpload: false,
        extension: ['png', 'jpg', 'jpeg', 'gif', 'pdf','docx', 'doc', 'xls', 'xlsx'],
        thumbnails: true,
        action: APIPATH + 'custUpload/',
        element: 'custUpload',
        onSucess: function () {
          selfobj.model.attributes.mediaArr.push(this.elements.uploadList[0].name);
          $('.modal-backdrop').hide();
        }
      });

      let docUrl = "";
      const attachment_file = this.model.get("attachment_file");
      const file_id = this.model.get("attachment_id");
      if (Array.isArray(attachment_file) && Array.isArray(file_id) && attachment_file.length === file_id.length) {
        for (let i = 0; i < attachment_file.length; i++) {
          const fName = attachment_file[i];
          const ftext = fName.split(".");
          let modifiedFName = fName;
          const file_ids = file_id[i];
          if (ftext[1] === "xls" || ftext[1] === "xlsx") {
            modifiedFName = "excel.png";
            docUrl += "<div id='"+ file_ids +"removeDiv' class='attachedPic' data-show='singleFile'><div class='thumbnail'><div class='centered removeAttach'><img id='removeIMG' class='img-fluid fileImage img-thumbnail' src='" + UPLOADS + '/' + modifiedFName + "' alt=''><div class='buttonShow visableAttach'><span class='attachView'><a href='" + UPLOADS + "/customer/" + selfobj.custID + '/' + fName + "' target='_blank'><span class='material-icons'>visibility</span></a></span><span class='deleteAttach deleteAttachment' data-file_id='" + file_ids + "'><span class='material-icons'>delete</span></span></div></div></div></div>";
          } else if (ftext[1] === "pdf") {
            modifiedFName = "pdf.png";
            docUrl += "<div id='"+ file_ids +"removeDiv' class='attachedPic' data-show='singleFile'><div class='thumbnail'><div class='centered removeAttach'><img id='removeIMG' class='img-fluid fileImage img-thumbnail' src='" + UPLOADS + '/' + modifiedFName + "' alt=''/><div class='buttonShow visableAttach'> <span class='attachView'><a href='" + UPLOADS + "/customer/" + selfobj.custID + '/' + fName + "' target='_blank'><span class='material-icons'>visibility</span></a></span><span class=' deleteAttach deleteAttachment' data-file_id='" + file_ids + "'><span class='material-icons'>delete</span></span></div></div></div></div>";
          } else {
            docUrl += "<div id='"+ file_ids +"removeDiv' class='attachedPic' data-show='singleFile'><div class='thumbnail'><div class='centered removeAttach'><img id='removeIMG' class='img-fluid fileImage img-thumbnail' src='" + UPLOADS + "/customer/" + selfobj.custID + '/' + modifiedFName + "' alt=''/><div class='buttonShow visableAttach'> <span class='attachView'><a href='" + UPLOADS + "/customer/" + selfobj.custID + '/' + modifiedFName + "' target='_blank'><span class='material-icons'>visibility</span></a></span><span class=' deleteAttach deleteAttachment' data-file_id='" + file_ids + "'><span class='material-icons'>delete</span></span></div></div></div></div>";
          }
        }
        document.getElementById("attachedDoc").innerHTML += docUrl;

      }

      return this;
    },
    onDelete: function () {
      this.remove();
    },
  });

  return customerSingleView;
});
