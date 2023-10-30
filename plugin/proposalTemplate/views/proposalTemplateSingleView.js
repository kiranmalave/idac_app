define([
    'jquery',
    'underscore',
    'backbone',
    'validate',
    'inputmask',
    'datepickerBT',
    'moment',
    '../../core/views/multiselectOptions',
    '../../dynamicForm/views/dynamicFieldRender',
    '../collections/proposalTemplateCollection',
    "../../ourClients/collections/ourClientsCollection",
    '../models/proposalTemplateSingleModel',
    '../../readFiles/views/readFilesView',
    'text!../templates/proposalTemplateSingle_temp.html',
  ], function ($, _, Backbone, validate, inputmask, datepickerBT, moment, multiselectOptions, dynamicFieldRender, proposalTemplateCollection, ourClientsCollection, proposalTemplateSingleModel, readFilesView, projecttemp) {
    var projectSingleView = Backbone.View.extend({
      model: proposalTemplateSingleModel,
      initialize: function (options) {
        console.log(options);
        this.dynamicData = null;
        this.toClose = "projectSingleView";
        this.pluginName = "projectList";
        this.loadFrom = options.loadfrom;
        this.model = new proposalTemplateSingleModel();
        var selfobj = this;
        this.dynamicFieldRenderobj = new dynamicFieldRender({
          ViewObj: selfobj,
          formJson: {},
        });
        this.multiselectOptions = new multiselectOptions();
        $(".modelbox").hide();
        scanDetails = options.searchproject;
        console.log(options);
        $(".popupLoader").show();
        var projectList = new proposalTemplateCollection();
        projectList.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler, data: { getAll: 'Y', status: "active" }
        }).done(function (res) {
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          $(".popupLoader").hide();
          selfobj.model.set("projectList", res.data);
          selfobj.render();
        });

        this.ourClientsList = new ourClientsCollection();
       this.ourClientsList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, data: { getAll: 'Y', status: "active" }
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        selfobj.render();
      });

        if (options.proposalTemplate_id != "") {
          this.model.set({ temp_id: options.proposalTemplate_id });
          console.log(this.model);
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
        "click .saveprojectDetails": "saveprojectDetails",
        "click .item-container li": "setValues",
        "blur .txtchange": "updateOtherDetails",
        "click .multiSel": "setValues",
        "change .bDate": "updateOtherDetails",
        "change .dropval": "updateOtherDetails",
        "change .logoAdded": "updateImageLogo",
        "click .loadMedia": "loadMedia",
  
      },
      attachEvents: function () {
        // Detach previous event bindings
        this.$el.off("click", ".saveprojectDetails", this.saveprojectDetails);
        // Reattach event bindings
        this.$el.on("click", ".saveprojectDetails", this.saveprojectDetails.bind(this));
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
        setvalues = ["type"];
        selfobj.multiselectOptions.setValues(setvalues, selfobj);
      },
      getSelectedFile: function (url) {
        $('.' + this.elm).val(url);
        $('.' + this.elm).change();
        $("#profile_pic_view").attr("src", url);
        $("#profile_pic_view").css({ "max-width": "100%" });
        $('#largeModal').modal('toggle');
        this.model.set({ "project_image": url });
      },
      loadMedia: function (e) {
        e.stopPropagation();
        // alert("here");
        $('#largeModal').modal('toggle');
        this.elm = "profile_pic";
        new readFilesView({ loadFrom: "addpage", loadController: this });
      },
      setValues: function (e) {
        var selfobj = this;
        var da = selfobj.multiselectOptions.setCheckedValue(e);
        selfobj.model.set(da);
      },
  
      saveprojectDetails: function (e) {
        e.preventDefault();
        let selfobj = this;
        var mid = this.model.get("temp_id");
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
        if ($("#projectDetails").valid()) {
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
            if (selfobj.loadFrom == "TaskSingleView") {
              scanDetails.refreshCust();
            } else {
              scanDetails.filterSearch();
            }
            if (res.flag == "S") {
              if (isNew == "new") {
                selfobj.model.clear().set(selfobj.model.defaults);
                selfobj.dynamicFieldRenderobj.initialize({ ViewObj: selfobj, formJson: {} });
                selfobj.render();
              } else {
                // alert("here");
                handelClose(selfobj.toClose);
              }
            }
          });
        }
      },
      initializeValidate: function () {
        var selfobj = this;
        var feilds = {
          
          project_name: {
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
          project_name: "Please enter First Name",
        };
        $("#mobile_no").inputmask("Regex", { regex: "^[0-9](\\d{1,9})?$" });
        $("#projectDetails").validate({
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
        var source = projecttemp;
        var template = _.template(source);
        $("#" + this.toClose).remove();
        console.log(this.ourClientsList);
        this.$el.html(template({ "model": this.model.attributes , "ourClientsList": this.ourClientsList.models}));
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
        rearrageOverlays("Proposal Templates", this.toClose);
        var __toolbarOptions = [
            ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
            [{ 'header': 1 }, { 'header': 2 }],               // custom button values
            [{ 'direction': 'rtl' }],                         // text direction
            [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
            [{ 'align': [] }],
            ['link'],
              ['clean']                                         // remove formatting button
          ];
        var editor = new Quill($("#description").get(0),{
            modules: {
                toolbar: __toolbarOptions
            },
            theme: 'snow' 
            });
      
            //const delta = editor.clipboard.convert();
            //editor.setContents(delta, 'silent');
            editor.on('text-change', function(delta, oldDelta, source) {
                if (source == 'api') {
                    console.log("An API call triggered this change.");
                  } else if (source == 'user') {
                    var delta = editor.getContents();
                    var text = editor.getText();
                    var justHtml = editor.root.innerHTML;
                    selfobj.model.set({"description":justHtml});
                  }
            });
        return this;
      },
      
      onDelete: function () {
        this.remove();
      },
    });
  
    return projectSingleView;
  });
  