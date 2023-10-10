define([
  'jquery',
  'underscore',
  'backbone',
  'validate',
  'inputmask',
  '../../core/views/multiselectOptions',
  '../../dynamicForm/views/dynamicFieldRender',
  '../collections/faqCollection',
  '../models/faqSingleModel',
  '../../readFiles/views/readFilesView',
  'text!../templates/faqSingleTemp.html',
], function($,_, Backbone,validate,inputmask,multiselectOptions,dynamicFieldRender,faqCollection,faqSingleModel,readFilesView,faqTemp){

var faqView = Backbone.View.extend({
    model:faqSingleModel,
    initialize: function(options){
     
      this.dynamicData = null;
        var selfobj = this;
        this.multiselectOptions = new multiselectOptions();
        this.toClose = "faqSingleView";
        this.pluginName = "faqList";
        this.dynamicFieldRenderobj = new dynamicFieldRender({ViewObj:selfobj,formJson:{}});  
        this.model = new faqSingleModel();
        scanDetails = options.searchfaq;
        $(".popupLoader").show();

        var faqList = new faqCollection();

        faqList.fetch({headers: {
          'contentType':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
        },error: selfobj.onErrorHandler,data:{getAll:'Y',status:"active"}}).done(function(res){
          if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
          $(".popupLoader").hide();
          selfobj.model.set("faqList",res.data);
          selfobj.render();
        });

        if(options.faq_id != ""){
          this.model.set({faq_id:options.faq_id});
          this.model.fetch({headers: {
            'contentType':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
          },error: selfobj.onErrorHandler}).done(function(res){
            if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
            $(".popupLoader").hide();
            selfobj.render();
            // selfobj.setValues();
            selfobj.dynamicData = res.data.dynamicFields;
          });
        }else
        {
           selfobj.render();
           $(".popupLoader").hide();
        }
    },
    events:
    {
      "click .saveFaqDetails":"saveFaqDetails",
      "click .item-container li":"setValues",
      "blur .txtchange":"updateOtherDetails",
      "change .multiSel":"setValues",
      "change .bDate":"updateOtherDetails",
      "change .dropval":"updateOtherDetails",
    },
    attachEvents: function() {
      // Detach previous event bindings
      this.$el.off('click', '.saveFaqDetails', this.saveFaqDetails);
      // Reattach event bindings
      this.$el.on('click', '.saveFaqDetails', this.saveFaqDetails.bind(this));

      this.$el.off('click','.multiSel', this.setValues);
      this.$el.on('click','.multiSel', this.setValues.bind(this));
      this.$el.off('click','.item-container li', this.setValues);
      this.$el.on('click','.item-container li', this.setValues.bind(this));
      this.$el.off('change','.dropval', this.updateOtherDetails);
      this.$el.on('change','.dropval', this.updateOtherDetails.bind(this));
      this.$el.off('blur','.txtchange', this.updateOtherDetails);
      this.$el.on('blur','.txtchange', this.updateOtherDetails.bind(this));
   
    },
    onErrorHandler: function(collection, response, options){
        alert("Something was wrong ! Try to refresh the page or contact administer. :(");
        $(".profile-loader").hide();
    },
    updateOtherDetails: function(e){
      var valuetxt = $(e.currentTarget).val();
      var toID = $(e.currentTarget).attr("id");
      var newdetails=[];
      newdetails[""+toID]= valuetxt;
      this.model.set(newdetails);
      console.log(this.model);

    },
    setOldValues:function(){
      var selfobj = this;
      setvalues = ["status","is_email_send","is_publish"];
      selfobj.multiselectOptions.setValues(setvalues,selfobj);
    },
   
    setValues:function(e){
      var selfobj = this;
      var da = selfobj.multiselectOptions.setCheckedValue(e);
      selfobj.model.set(da);
      let isRender = $(e.currentTarget).attr("data-render");
      if(isRender == "yes"){
        selfobj.render();
      }
    },
    saveFaqDetails: function(e){
      e.preventDefault();
      var faq_id = this.model.get("faq_id");
      let isNew = $(e.currentTarget).attr("data-action");

      //  if(termstxt=="")
      //  {
      //   alert("FAQ Answer Required");
      //   return;
      //  }
      //  var is_publish = $("#is_publish").is(":checked");
      //  this.model.set({'faq_answer':termstxt,is_publish:is_publish})
      
      //  if(permission.edit != "yes"){
      //   alert("You dont have permission to edit");
      //   return false;
      // }
      if(faq_id == "" || faq_id == null){
        var methodt = "PUT";
      }else{
        var methodt = "POST";
      }
      if($("#faqDetails").valid()){
        var selfobj = this;
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
          scanDetails.filterSearch();
          if(res.flag == "S"){
            if(isNew == "new"){
              selfobj.model.clear().set(selfobj.model.defaults);
              selfobj.dynamicFieldRenderobj.initialize({ViewObj:selfobj,formJson:{}});
              selfobj.render();
            }else{
              handelClose(selfobj.toClose);
            }
          }         
        });
      }
    },
    initializeValidate:function(){
      var selfobj = this;
      var feilds = {
        faq_question:{
           required: true,
        },
        faq_answer:{
          required:true,
        },
        asked_by_name	:{
          required:true,
        },
        asked_by_email	:{
          required:true,
        },
        is_publish	:{
          required:true,
        },
        is_email_send	:{
          required:true,
        },
        status:{
          required:true,
        }
      };
      var feildsrules = feilds;
      var dynamicRules = selfobj.dynamicFieldRenderobj.getValidationRule();
      
      if(!_.isEmpty(dynamicRules)){
        var feildsrules = $.extend({}, feilds, dynamicRules);
        // var feildsrules = {
        // ...feilds,
        // ...dynamicRules
        // };
      }
     
      var messages  = {
        faq_question: "Please write question",
        faq_answer: "Please write Answer",
        is_publish: "Please  select  is publish ",
        is_email_send: "Please  select  is email",
        status:"Please enter Status",
      };

      $("#faqDetails").validate({
        rules: feildsrules,
        messages: messages
      });
    },
  
    render: function(){
      console.log(this.model.attributes);
      var selfobj = this;
        var source = faqTemp;
        var template = _.template(source);
        $("#"+this.toClose).remove();
        this.$el.html(template({ model: this.model.attributes }));
        $(".modal-title").html("FAQ Master");

        this.$el.addClass("tab-pane in active panel_overflow");
        this.$el.attr('id',this.toClose);
        this.$el.addClass(this.toClose);
        this.$el.data("role","tabpanel");
        this.$el.data("current","yes");
        $(".tab-content").append(this.$el);
        $('#'+this.toClose).show();
        $("#dynamicFormFields").empty().append(this.dynamicFieldRenderobj.getform());
        this.initializeValidate();
        // this.setValues();
        this.setOldValues();
        this.attachEvents();
        rearrageOverlays("Faq",this.toClose);

        var __toolbarOptions = [
          ["bold", "italic", "underline", "strike"], // toggled buttons
          [{ header: 1 }, { header: 2 }], // custom button values
          [{ direction: "rtl" }], // text direction
          [{ size: ["small", false, "large", "huge"] }], // custom dropdown
          [{ align: [] }],
          ["link"],
          ["clean"], // remove formatting button
        ];
        var editor = new Quill($("#faq_answer").get(0), {
          modules: {
            toolbar: __toolbarOptions,
          },
          theme: "snow", // or 'bubble'
        });
  
        //const delta = editor.clipboard.convert();
        //editor.setContents(delta, 'silent');
        editor.on("text-change", function (delta, oldDelta, source) {
          if (source == "api") {
            console.log("An API call triggered this change.");
          } else if (source == "user") {
            var delta = editor.getContents();
            var text = editor.getText();
            var justHtml = editor.root.innerHTML;
            selfobj.model.set({ faq_answer: justHtml });
          }
        });

        return this;
    },onDelete: function(){
        this.remove();
    }
});

  return faqView;
    
});
