define([
  'jquery',
  'underscore',
  'backbone',
  'validate',
  'inputmask',
  'datepickerBT',
  'Quill',
  '../../core/views/multiselectOptions',
  '../models/emailMasterSingleModel',
  '../../dynamicForm/views/dynamicFieldRender',
  'text!../templates/emailMasterSingleTemp.html',
], function($,_, Backbone,validate,inputmask,datepickerBT,Quill,multiselectOptions,emailMasterSingleModel,dynamicFieldRender,emailMasterTemp){

var emailMasterView = Backbone.View.extend({
    model:emailMasterSingleModel,
    form_label:'',
    initialize: function(options){
      this.toClose = "emailMasterSingleView";
      this.form_label = options.form_label;
      var selfobj = this;
      this.loadFrom = options.loadfrom;
      // use this valiable for dynamic fields to featch the data from server
      this.pluginName = "emailList";
      this.menuId = options.menuId;
      this.dynamicFieldRenderobj = new dynamicFieldRender({ViewObj:selfobj,formJson:{}});  
      this.multiselectOptions = new multiselectOptions();
        $(".modelbox").hide();
        scanDetails = options.searchemailMaster;
        $('#emailMasterData').remove();
        $(".popupLoader").show();
      
        this.model = new emailMasterSingleModel();
        this.model.set({ menuId: options.menuId });
        if(options.tempID != ""){
          this.model.set({tempID:options.tempID});
          this.model.fetch({headers: {
            'contentType':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
          },data:{menuId:selfobj.model.get("menuId")}, error: selfobj.onErrorHandler}).done(function(res){
            if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
            $(".popupLoader").hide();
            $('body').find(".loder").hide();
            selfobj.dynamicFieldRenderobj.prepareForm();
            selfobj.render();
          });
        }
    },

    events:
    {
      "click .saveemailMasterDetails":"saveemailMasterDetails",
      "blur .txtchange":"updateOtherDetails",
      "change .multiSel": "setValues",
      "change .bDate":"updateOtherDetails",
      "change .dropval":"updateOtherDetails",
      "blur .multiselectOpt": "updatemultiSelDetails",
      "click .singleSelectOpt": "selectOnlyThis",
    },

     attachEvents:function() {
      // Detach previous event bindings
      // this.$el.off('click', '.saveemailMasterDetails', this.saveemailMasterDetails);
      // // Reattach event bindings
      // this.$el.on('click', '.saveemailMasterDetails', this.saveemailMasterDetails.bind(this));
      this.$el.off('click','.multiSel', this.setValues);
      this.$el.on('click','.multiSel', this.setValues.bind(this));
      this.$el.off('change','.bDate', this.updateOtherDetails);
      this.$el.on('change','.bDate', this.updateOtherDetails.bind(this));
      this.$el.off('change','.dropval', this.updateOtherDetails);
      this.$el.on('change','.dropval', this.updateOtherDetails.bind(this));
      this.$el.off('blur','.txtchange', this.updateOtherDetails);
      this.$el.on('blur','.txtchange', this.updateOtherDetails.bind(this));
      this.$el.off('click', '.multiselectOpt', this.updatemultiSelDetails);
      this.$el.on('click', '.multiselectOpt', this.updatemultiSelDetails.bind(this));
      this.$el.off('click', '.singleSelectOpt', this.selectOnlyThis);
      this.$el.on('click', '.singleSelectOpt', this.selectOnlyThis.bind(this));
    },
    onErrorHandler: function(collection, response, options){
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

    selectOnlyThis: function(e) {
      var clickedCheckbox = e.currentTarget;
      var valueTxt = $(clickedCheckbox).val();
      var toName = $(clickedCheckbox).attr("name");
      this.$('input[name="' + toName + '"]').not(clickedCheckbox).prop('checked', false);
      var existingData = this.model.get(toName);
      this.model.set(toName, ($(clickedCheckbox).prop('checked')) ? valueTxt : null);
    },

    setOldValues:function(){
      var selfobj = this;
      setvalues = ["status","isParent","isClick","linked","is_custom"];
      selfobj.multiselectOptions.setValues(setvalues,selfobj);
    },

    setValues:function(e){
      var selfobj = this;
      var da = selfobj.multiselectOptions.setCheckedValue(e);
      selfobj.model.set(da);
    },

    saveemailMasterDetails: function(e){
      e.preventDefault();
      let selfobj = this;
      // var termstxt = CKEDITOR.instances.emailContent.getData();
      // this.model.set({'emailContent':termstxt})
       var tempID = this.model.get("tempID");
       let isNew = $(e.currentTarget).attr("data-action");
       if(permission.edit != "yes"){
        alert("You dont have permission to edit");
        return false;
      }
        
      if(tempID == "" || tempID == null){
        var methodt = "PUT";
      }else{
        var methodt = "POST";
      }
      if($("#emailMasterDetails").valid()){
        $(e.currentTarget).html("<span>Saving..</span>");
        $(e.currentTarget).attr("disabled", "disabled");
        this.model.save({},{headers:{
          'Content-Type':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
        },error: selfobj.onErrorHandler,type:methodt}).done(function(res){
          if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
          if(isNew == "new"){
            showResponse(e,res,"Save & New");
          }else{
            showResponse(e,res,"Save");
          }
          if (selfobj.loadFrom == "notificationView") {
            scanDetails.getEmailTemp();
          }else{
            scanDetails.filterSearch();
          }
          
          if(res.flag == "S"){
            if(isNew == "new"){
              selfobj.model.clear().set(selfobj.model.defaults);
              selfobj.model.set({ menuId: selfobj.menuId});
              selfobj.dynamicFieldRenderobj.initialize({ViewObj:selfobj,formJson:{}});
              selfobj.render();
              selfobj.attachEvents();
            }else{
              handelClose(selfobj.toClose);
            }
          }        
        });
      }
    },
    initializeValidate:function(){
      var selfobj = this;
        // $("#emailMasterDetails").validate({
        // rules: {
        //   readName:{
        //      required: true
        //   },
        //   emailContent:{
        //     required: true
        //   },
        //   smsContent:{
        //     required: true
        //   },
        //   subjectOfEmail:{
        //       required: true
        //   }
        // },
        // messages: {
        //   readName: "Please enter Email Template Name",
        //   emailContent: "Please enter Email Content",
        //   smsContent: "Please enter SMS Content",
        //   subjectOfEmail: "Please enter Email Subject",

        // }
        // });

        var feilds = {
          readName:{
            required: true
          },
          emailContent:{
            required: true
          },
          smsContent:{
            required: true
          },
          subjectOfEmail:{
              required: true
          }
        };
        var feildsrules = feilds;
        var dynamicRules = selfobj.dynamicFieldRenderobj.getValidationRule();

        if (!_.isEmpty(dynamicRules)) {
          var feildsrules = $.extend({}, feilds, dynamicRules);
          
        }
        var messages = {
          readName: "Please enter Email Template Name",
          emailContent: "Please enter Email Content",
          smsContent: "Please enter SMS Content",
          subjectOfEmail: "Please enter Email Subject",
        }

        $("#emailMasterDetails").validate({
          rules: feildsrules,
          messages: messages,
        });
    },
    render: function(){
        var selfobj = this;
        var source = emailMasterTemp;
        var template = _.template(source);
        $("#"+this.toClose).remove();
        this.$el.html(template({"model":this.model.attributes}));
        this.$el.addClass("tab-pane in active panel_overflow");
        this.$el.attr('id',this.toClose);
        this.$el.addClass(this.toClose);
        this.$el.data("role","tabpanel");
        this.$el.data("current","yes");
        $(".ws-tab").append(this.$el);
        $('#'+this.toClose).show();
        // this is used to append the dynamic form in the single view html
        $("#dynamicFormFields").empty().append(this.dynamicFieldRenderobj.getform());
        // Do call this function from dynamic module it self.
        this.initializeValidate();
        this.setOldValues();
        this.attachEvents();
        rearrageOverlays(selfobj.form_label,this.toClose);

        // var source = emailMasterTemp;
        // var template = _.template(source);
        // this.$el.html(template(this.model.attributes));
        // $("#modalBody").append(this.$el);
        
        // var profile = this.model.get("userName");
        // $(".modal-title").html("Email Master");
        // $('#userRoleData').show();
        // this.initializeValidate();
        // this.setValues();

      var __toolbarOptions = [
        ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
        [{ 'header': 1 }, { 'header': 2 }],               // custom button values
        [{ 'direction': 'rtl' }],                         // text direction
        [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
        [{ 'align': [] }],
        ['link'],
          ['clean']                                         // remove formatting button
      ]; 
      
      var editor = new Quill($("#emailContent").get(0),{
        modules: {
            toolbar: __toolbarOptions
        },
        theme: 'snow'  // or 'bubble'
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
                selfobj.model.set({"emailContent":justHtml});
              }
        });
        return this;
    },onDelete: function(){
        this.remove();
    }
});

  return emailMasterView;
    
});
