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
  '../collections/proposalCollection',
  "../../customer/collections/customerCollection",
  "../../project/collections/projectCollection",
  "../../proposalTemplate/collections/proposalTemplateCollection",
  "../../proposalTemplate/models/proposalTemplateSingleModel",
  '../models/proposalSingleModel',
  '../../readFiles/views/readFilesView',
  'text!../templates/proposalSingle_temp.html',
], function ($, _, Backbone, validate, inputmask, datepickerBT, moment, Swal, multiselectOptions, dynamicFieldRender, proposalCollection, customerCollection, projectCollection, proposalTemplateCollection, proposalTempSingel, proposalSingleModel, readFilesView, proposaltemp) {
  var proposalSingleView = Backbone.View.extend({
    model: proposalSingleModel,
    initialize: function (options) {
      console.log(options);
      this.dynamicData = null;
      this.toClose = "proposalSingleView";
      this.pluginName = "proposalList";
      this.loadFrom = options.loadfrom;
      this.model = new proposalSingleModel();
      var selfobj = this;
      this.dynamicFieldRenderobj = new dynamicFieldRender({
        ViewObj: selfobj,
        formJson: {},
      });
      this.multiselectOptions = new multiselectOptions();
      $(".modelbox").hide();
      scanDetails = options.searchproposal;
      console.log(options);
      $(".popupLoader").show();
      var proposalList = new proposalCollection();
      proposalList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, data: { getAll: 'Y', status: "active" }
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        selfobj.model.set("proposalList", res.data);
        console.log("proposalList", JSON.stringify(res.data));
        selfobj.render();
      });

      if (options.proposal_id != "") {
        this.model.set({ proposal_id: options.proposal_id });
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

      this.customerList = new customerCollection();
      this.customerList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, data: { getAll: 'Y', status: 'active' }
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        selfobj.render();
      });

      this.projectList = new projectCollection();
      this.projectList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, data: { status: 'active' }
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        selfobj.render();
      });

      this.proposalTemplateList = new proposalTemplateCollection();
      this.proposalTemplateList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, data: { status: 'active' }
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        selfobj.render();
      });

    },
    events: {
      "click .saveproposalDetails": "saveproposalDetails",
      "click .item-container li": "setValues",
      "blur .txtchange": "updateOtherDetails",
      "click .multiSel": "setValues",
      "change .bDate": "updateOtherDetails",
      "change .dropval": "updateOtherDetails",
      "change .logoAdded": "updateImageLogo",
      "click .loadMedia": "loadMedia",
      "click .saveconfirmProposal": "saveconfirmProposal",
      "change .getTemplate": "getTemplate",


    },
    attachEvents: function () {
      // Detach previous event bindings
      this.$el.off("click", ".saveproposalDetails", this.saveproposalDetails);
      // Reattach event bindings
      this.$el.on("click", ".saveproposalDetails", this.saveproposalDetails.bind(this));
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
      this.$el.off("click", ".saveconfirmProposal", this.saveconfirmProposal);
      this.$el.on("click", ".saveconfirmProposal", this.saveconfirmProposal.bind(this));
      this.$el.off("change", ".getTemplate", this.getTemplate);
      this.$el.on("change", ".getTemplate", this.getTemplate.bind(this));


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
      this.model.set({ "proposal_image": url });

    },
    loadMedia: function (e) {
      e.stopPropagation();
      $('#largeModal').modal('toggle');
      this.elm = "profile_pic";
      var menusingleview = new readFilesView({ loadFrom: "addpage", loadController: this });
    },
    getTemplate: function (e) {
      e.stopPropagation();
      var selfobj = this;
      let tempID = $(e.currentTarget).val();
      var tempDetails = new proposalTempSingel();
      tempDetails.set({ temp_id: tempID });
      tempDetails.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        selfobj.model.set({ description: tempDetails.attributes.description });
        selfobj.render();
      });
      console.log(tempDetails);
    },
    saveconfirmProposal: function (e) {
      e.stopPropagation();
      // $('#confirmProposal').modal('toggle');
      // this.elm = "profile_pic";
      // var menusingleview = new readFilesView({ loadFrom: "addpage", loadController: this });
      // Swal.fire({
      //   title: 'Are you sure?',
      //   text: "You won't be able to revert this!",
      //   // icon: 'warning',
      //   // showCancelButton: true,
      //   confirmButtonColor: '#3085d6',
      //   cancelButtonColor: '#d33',
      //   confirmButtonText: 'Make an another copy',
      //   cancelButtonColor: '#3085d6',
      //   cancelButtonColor: '#f0f',
      //   cancelButtonColor: ' Text as keep the same'
      // }).then((result) => {
      //   // if (result.isConfirmed) {
      //   //   Swal.fire(
      //   //     'Deleted!',
      //   //     'Your file has been deleted.',
      //   //     'success'
      //   //   )
      //   // }
      // })
      //   Swal.fire({
      //     title: 'Do you want to save the changes?',
      //     showDenyButton: true,
      //     showCancelButton: false,
      //     confirmButtonText: 'Make an another copy',
      //     denyButtonText: `Text as keep the same`,
      //   }).then((result) => {
      //     /* Read more about isConfirmed, isDenied below */
      //     // if (result.isConfirmed) {
      //     //   Swal.fire('Saved!', '', 'success')
      //     // } else if (result.isDenied) {
      //     //   Swal.fire('Changes are not saved', '', 'info')
      //     // }
      //   })
    },
    setValues: function (e) {
      var selfobj = this;
      var da = selfobj.multiselectOptions.setCheckedValue(e);
      selfobj.model.set(da);
    },

    saveproposalDetails: function (e) {
      e.preventDefault();
      let selfobj = this;
      var mid = this.model.get("proposal_id");
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

      if (mid != undefined) {
        Swal.fire({
          title: 'Are you Sure you want to Save?',
          showDenyButton: true,
          showCancelButton: false,
          confirmButtonText: 'Save as copy ',
          denyButtonText: `Save in Eixsting`,
        }).then((result) => {
          if (result.isConfirmed) {
            if ($("#proposalDetails").valid()) {
              $(e.currentTarget).html("<span>Saving..</span>");
              $(e.currentTarget).attr("disabled", "disabled");
              this.model.set({ copy: "yes" });
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
                    selfobj.dynamicFieldRenderobj.initialize({ ViewObj: selfobj, formJson: {} });
                    selfobj.render();
                  } else {
                    // alert("here");
                    console.log("proposalList", JSON.stringify(res.data));
                    handelClose(selfobj.toClose);
                  }
                }
              });
            }
            Swal.fire('Saved!', '', 'success')


          } else if (result.isDenied) {

            if ($("#proposalDetails").valid()) {
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
                    selfobj.dynamicFieldRenderobj.initialize({ ViewObj: selfobj, formJson: {} });
                    selfobj.render();
                  } else {
                    // alert("here");
                    console.log("proposalList", JSON.stringify(res.data));
                    handelClose(selfobj.toClose);
                  }
                }
              });
            }
            Swal.fire('Changes saved in Existing record!', '', 'info')
          }
        });
      }
      if (methodt == "PUT") {
        if ($("#proposalDetails").valid()) {
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
                selfobj.dynamicFieldRenderobj.initialize({ ViewObj: selfobj, formJson: {} });
                selfobj.render();
              } else {
                handelClose(selfobj.toClose);
              }
            }
          });
        }
      }
    },
    initializeValidate: function () {
      var selfobj = this;
      var feilds = {
        salutation: {
          required: true,
        },
        name: {
          required: true,
        },

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
        salutation: "select salutation",
        name: "Please enter First Name",
      };
      $("#mobile_no").inputmask("Regex", { regex: "^[0-9](\\d{1,9})?$" });
      $("#proposalDetails").validate({
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
    },

    render: function () {
      //var isexits = checkisoverlay(this.toClose);
      //if(!isexits){
      var selfobj = this;
      var source = proposaltemp;
      var template = _.template(source);
      $("#" + this.toClose).remove();
      this.$el.html(template({ model: this.model.attributes, "customerList": this.customerList.models, "projectList": this.projectList.models, "proposalTemplateList": this.proposalTemplateList.models, }));
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
      rearrageOverlays("Proposals", this.toClose);
      var __toolbarOptions = [
        ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
        [{ 'header': 1 }, { 'header': 2 }],               // custom button values
        [{ 'direction': 'rtl' }],                         // text direction
        [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
        [{ 'align': [] }],
        ['link'],
        ['clean']                                         // remove formatting button
      ];
      var editor = new Quill($("#description").get(0), {
        modules: {
          toolbar: __toolbarOptions
        },
        theme: 'snow'
      });

      //const delta = editor.clipboard.convert();
      //editor.setContents(delta, 'silent');
      editor.on('text-change', function (delta, oldDelta, source) {
        if (source == 'api') {
          console.log("An API call triggered this change.");
        } else if (source == 'user') {
          var delta = editor.getContents();
          var text = editor.getText();
          var justHtml = editor.root.innerHTML;
          selfobj.model.set({ "description": justHtml });
        }
      });


      return this;
    },
    onDelete: function () {
      this.remove();
    },
  });

  return proposalSingleView;
});
