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
    '../collections/projectCollection',
    "../../customer/collections/customerCollection",
    '../models/projectSingleModel',
    '../../readFiles/views/readFilesView',
    '../../customer/views/customerSingleView',
    'text!../templates/projectSingle_temp.html',
  ], function ($, _, Backbone, validate, inputmask, datepickerBT, moment, Swal, multiselectOptions, dynamicFieldRender, projectCollection, customerCollection, projectSingleModel, readFilesView, customerSingleView, projecttemp) {
    var projectSingleView = Backbone.View.extend({
      model: projectSingleModel,
      initialize: function (options) {
        this.customerID = options.customerID;
        this.dynamicData = null;
        this.toClose = "projectSingleView";
        this.pluginName = "projectList";
        this.loadFrom = options.loadfrom;
        this.model = new projectSingleModel();
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
        var projectList = new projectCollection();
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

        this.customerList = new customerCollection();
       this.customerList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, data: { getAll: 'Y',status:'active'}
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        selfobj.render();
      });

  
        if (options.project_id != "") {
          this.model.set({ project_id: options.project_id });
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
        if (valuetxt == "addClient") {
          new customerSingleView({ searchCustomer: this, loadfrom: "projectSingleView" });
        }
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
        $("#profile_pic_view").css({ "max-width": "10%" });
        $('#largeModal').modal('toggle');
        this.model.set({ "attachment": url });
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
        var mid = this.model.get("project_id");
        let isNew = $(e.currentTarget).attr("data-action");
        if (permission.edit != "yes") {
          alert("You dont have permission to edit");
          return false;
        }
        if(this.customerID != null){
          this.model.set({'client_id':selfobj.customerID});
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
            } else if (selfobj.loadFrom == "dashboard") {
              handelClose(selfobj.toClose);
              scanDetails.initialize();
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
  
       
      },
  
      render: function () {
        //var isexits = checkisoverlay(this.toClose);
        //if(!isexits){
        var selfobj = this;
        var source = projecttemp;
        var template = _.template(source);
        $("#" + this.toClose).remove();
        console.log(this.customerList);
        this.$el.html(template({ "model": this.model.attributes , "customerList": this.customerList.models, "customerID": this.customerID}));
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
        rearrageOverlays("Projects", this.toClose);
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
  