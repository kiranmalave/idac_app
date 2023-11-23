define([
  'jquery',
  'underscore',
  'backbone',
  'validate',
  'inputmask',
  'datepickerBT',
  'moment',
  'Swal',
  '../../core/views/multiselectOptions',
  '../../dynamicForm/views/dynamicFieldRender',
  '../collections/customerCollection',
  '../models/customerSingleModel',
  '../../readFiles/views/readFilesView',
  'text!../templates/customerSingle_temp.html',
], function ($, _, Backbone, validate, inputmask, datepickerBT, moment, Swal, multiselectOptions, dynamicFieldRender, customerCollection, customerSingleModel, readFilesView, customertemp) {
  var customerSingleView = Backbone.View.extend({
    model: customerSingleModel,
    initialize: function (options) {
      this.dynamicData = null;
      this.toClose = "customerSingleView";
      this.pluginName = "customerList";
      this.loadFrom = options.loadfrom;
      this.model = new customerSingleModel();
      var selfobj = this;
      this.dynamicFieldRenderobj = new dynamicFieldRender({
        ViewObj: selfobj,
        formJson: {},
      });
      this.multiselectOptions = new multiselectOptions();
      $(".modelbox").hide();
      scanDetails = options.searchCustomer;
      $(".popupLoader").show();
      var customerList = new customerCollection();
      customerList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, data: { getAll: 'Y', status: "active" }
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        selfobj.model.set("customerList", res.data);
        selfobj.render();
      });

      if (options.customer_id != "") {
        this.model.set({ customer_id: options.customer_id });
        this.model.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler
        }).done(function (res) {
          var birthDate = selfobj.model.get("birth_date");
          if (birthDate != null && birthDate != "0000-00-00") {
            selfobj.model.set({ "birth_date": moment(birthDate).format("DD-MM-YYYY") });
          }
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          $(".popupLoader").hide();
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
      "change .dropval": "updateOtherDetails",
      "change .logoAdded": "updateImageLogo",
      "click .loadMedia": "loadMedia",
    },
    attachEvents: function () {
      // Detach previous event bindings
      this.$el.off("click", ".saveCustomerDetails", this.saveCustomerDetails);
      // Reattach event bindings
      this.$el.on("click", ".saveCustomerDetails", this.saveCustomerDetails.bind(this));
      this.$el.off("click", ".multiSel", this.setValues);
      this.$el.on("click", ".multiSel", this.setValues.bind(this));
      this.$el.off("change", ".dropval", this.updateOtherDetails);
      this.$el.on("change", ".dropval", this.updateOtherDetails.bind(this));
      this.$el.off("click", ".iconSelection", this.setIconValues);
      this.$el.off("blur", ".txtchange", this.updateOtherDetails);
      this.$el.on("blur", ".txtchange", this.updateOtherDetails.bind(this));
      this.$el.off("click", ".loadMedia", this.loadMedia);
      this.$el.on("click", ".loadMedia", this.loadMedia.bind(this));
    },

    onErrorHandler: function (collection, response, options) {
      alert(
        "Something was wrong ! Try to refresh the page or contact administer. :("
      );
      $(".profile-loader").hide();
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
    setValues: function (e) {
      var selfobj = this;
      var da = selfobj.multiselectOptions.setCheckedValue(e);
      selfobj.model.set(da);
    },

    saveCustomerDetails: function (e) {
      e.preventDefault();
      let selfobj = this;
      var mid = this.model.get("customer_id");
      let isNew = $(e.currentTarget).attr("data-action");
      // if (permission.edit != "yes") {
      //   alert("You dont have permission to edit");
      //   return false;
      // }
      if (mid == "" || mid == null) {
        var methodt = "PUT";
      } else {
        var methodt = "POST";
      }
      if ($("#customerDetails").valid()) {
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
          console.log(scanDetails);
          if (selfobj.loadFrom == "TaskSingleView") {
            scanDetails.refreshCust();
          } else if (selfobj.loadFrom == "dashboard") {
            handelClose(selfobj.toClose);
            scanDetails.initialize({action:selfobj.model.get("customer_id")});
          } else if (selfobj.loadFrom == "projectSingleView"){
            scanDetails.refreshCus({action:selfobj.model.get("customer_id")});
            // scanDetails.initialize({action:selfobj.model.get("customer_id")});
            scanDetails.refreshCus(res.data.customer_id);
          }else if (selfobj.loadFrom == "proposalSingleView"){
            // scanDetails.initialize({action:selfobj.model.get("customer_id")});
            scanDetails.refreshCus(res.data.customer_id);
          }else{
            scanDetails.filterSearch();
          }
          if (res.flag == "S") {
            if (isNew == "new") {
              selfobj.model.clear().set(selfobj.model.defaults);
              selfobj.dynamicFieldRenderobj.initialize({ ViewObj: selfobj, formJson: {} });
              selfobj.render();
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
        company_name: {
          required: true,
        },
        GST_no: {
          minlength: 15,
          maxlength: 15,
        },
        mobile_no: {
          minlength: 10,
          maxlength: 10,
        },
        adhar_number: {
          minlength: 12,
          maxlength: 12,
        },
        pan_number: {
          minlength: 10,
          maxlength: 10,
        },
        // website: {
        //   url:true,
        // },
        // pan_number: {
        //   required: true,
        // },
        // email: {
        //   email: true,
        //   required: true,
        // },
        // mobile_no: {
        //   required: true,
        //   minlength: 10,
        //   maxlength: 10,
        //   number: true,
        // },
      };
      var feildsrules = feilds;
      var dynamicRules = selfobj.dynamicFieldRenderobj.getValidationRule();

      if (!_.isEmpty(dynamicRules)) {
        var feildsrules = $.extend({}, feilds, dynamicRules);

      }
      var messages = {
        company_name: "Please enter Company Name",
      };
      $("#mobile_no").inputmask("Regex", { regex: "^[0-9](\\d{1,9})?$" });
      $("#adhar_number").inputmask("Regex", { regex: "^[0-9](\\d{1,11})?$" });
      $("#GST_no").inputmask("Regex", { regex: "^[A-Za-z0-9]*$" });
      $("#pan_number").inputmask("Regex", { regex: "^[A-Za-z0-9]*$" });
      $('#email').inputmask({ alias: "email" });

      $("#customerDetails").validate({
        rules: feildsrules,
        messages: messages,
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
    },

    render: function () {
      //var isexits = checkisoverlay(this.toClose);
      //if(!isexits){
      var selfobj = this;
      var source = customertemp;
      var template = _.template(source);
      $("#" + this.toClose).remove();
      this.$el.html(template({ model: this.model.attributes }));
      this.$el.addClass("tab-pane in active panel_overflow");
      this.$el.attr("id", this.toClose);
      this.$el.addClass(this.toClose);
      this.$el.data("role", "tabpanel");
      this.$el.data("current", "yes");
      $(".tab-content").append(this.$el);
      $("#" + this.toClose).show();
      $("#dynamicFormFields").empty().append(this.dynamicFieldRenderobj.getform());
      this.initializeValidate();
      this.setOldValues();
      $(".ws-select").selectpicker();
      this.attachEvents();
      rearrageOverlays("Company", this.toClose);
      return this;
    },
    onDelete: function () {
      this.remove();
    },
  });

  return customerSingleView;
});
