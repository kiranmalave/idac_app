define([
  'jquery',
  'underscore',
  'backbone',
  'validate',
  'inputmask',
  'datepickerBT',
  '../../core/views/multiselectOptions',
  '../../dynamicForm/views/dynamicFieldRender',
  '../collections/testimonialsCollection',
  '../models/testimonialsSingleModel',
  '../../readFiles/views/readFilesView',
  'text!../templates/testimonialsSingle_temp.html',
], function ($,_,Backbone,validate,inputmask,datepickerBT,multiselectOptions,dynamicFieldRender,testimonialsCollection,testimonialsSingleModel,readFilesView,testimonialstemp) {
  var testimonialsSingleView = Backbone.View.extend({
    model: testimonialsSingleModel,
    initialize: function (options) {
      this.dynamicData = null;
      this.toClose = "testimonialsSingleView";
      // use this valiable for dynamic fields to featch the data from server
      this.pluginName = "testimonialsList";
      this.model = new testimonialsSingleModel();
      var selfobj = this;
      // this function is called to render the dynamic view
      this.dynamicFieldRenderobj = new dynamicFieldRender({ViewObj: selfobj,formJson: {},});
      this.multiselectOptions = new multiselectOptions();
      scanDetails = options.searchtestimonials;
      $(".popupLoader").show();
      var testimonialsList = new testimonialsCollection();
      testimonialsList.fetch({headers: {contentType: "application/x-www-form-urlencoded",SadminID: $.cookie("authid"),token: $.cookie("_bb_key"), Accept: "application/json",
          },error: selfobj.onErrorHandler,type: "post",data: { status: "active", getAll: "Y" },}).done(function (res) {
          if (res.statusCode == 994) {app_router.navigate("logout", { trigger: true });
          }
          $(".popupLoader").hide();
          selfobj.model.set("testimonialsList", res.data);
          selfobj.render();
        });

      if (options.testimonial_id != "") {
        this.model.set({ testimonial_id: options.testimonial_id });
        this.model.fetch({ headers: {contentType: "application/x-www-form-urlencoded",SadminID: $.cookie("authid"),token: $.cookie("_bb_key"),Accept: "application/json",
            },
            error: selfobj.onErrorHandler,
          }).done(function (res) {
            if (res.statusCode == 994) {app_router.navigate("logout", { trigger: true });}
            $(".popupLoader").hide();
            selfobj.render();
          });
      }
    },
    events: {
      "click .savetestimonialsDetails": "savetestimonialsDetails",
      "blur .txtchange": "updateOtherDetails",
      "click .multiSel": "setValues",
      "change .dropval": "updateOtherDetails",
      "click .loadMedia": "loadMedia",   
    },

    attachEvents: function () {
      // Detach previous event bindings
      this.$el.off("click", ".savetestimonialsDetails", this.savetestimonialsDetails);
      // Reattach event bindings
      this.$el.on("click", ".savetestimonialsDetails",this.savetestimonialsDetails.bind(this));
      this.$el.off("click", ".multiSel", this.setValues);
      this.$el.on("click", ".multiSel", this.setValues.bind(this));
      this.$el.off("change", ".dropval", this.updateOtherDetails);
      this.$el.on("change", ".dropval", this.updateOtherDetails.bind(this));
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
    },
    updateImage: function (e) {
      var ob = this;
      var toID = $(e.currentTarget).attr("id");
      var newdetails = [];
      var reader = new FileReader();
      reader.onload = function (e) {
        document.getElementById("output").src = e.target.result;
        newdetails["" + toID] = reader.result;
        ob.model.set(newdetails);
      };
      reader.readAsDataURL(e.currentTarget.files[0]);

    },
    setOldValues: function () {
      var selfobj = this;
      setvalues = ["type"];
      selfobj.multiselectOptions.setValues(setvalues, selfobj);
    },
    setValues: function (e) {
      var selfobj = this;
      var da = selfobj.multiselectOptions.setCheckedValue(e);
      selfobj.model.set(da);
    },
    getSelectedFile:function(url){
      $('.'+this.elm).val(url);
      $('.'+this.elm).change();
      $("#profile_pic_view").attr("src",url);
      $("#profile_pic_view").css({"max-width":"100%"});
      $('#largeModal').modal('toggle');
      this.model.set({"testimonial_image":url});
      this.render();
    },
    loadMedia: function(e){
      e.stopPropagation();
        $('#largeModal').modal('toggle');
        this.elm = "profile_pic";
        new readFilesView({loadFrom:"addpage",loadController:this});   
    },
    savetestimonialsDetails: function(e){
      e.preventDefault();
      let selfobj = this;
      var testimonial_id = this.model.get("testimonial_id");
      let isNew = $(e.currentTarget).attr("data-action");
      if(permission.edit != "yes"){
        alert("You dont have permission to edit");
        return false;
      }
      if(testimonial_id == "" || testimonial_id == null){
        var methodt = "POST";
      }else{
        var methodt = "PUT";
      }
      if($("#testimonialsDetails").valid()){
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
    initializeValidate: function () {
      var selfobj = this;
      var feilds = {
        testimonial_name: {
          required: true,
        },
        testimonial_message: {
          required: true,
        },
        testimonial_image: {
          required: true,
        },
       
      };
      var feildsrules = feilds;
      var dynamicRules = selfobj.dynamicFieldRenderobj.getValidationRule();

      if (!_.isEmpty(dynamicRules)) {
        var feildsrules = $.extend({}, feilds, dynamicRules);
        
      }
      var messages = {
        testimonial_name: "Please enter Testimonials Name",
        testimonial_message: "Please enter Testimonials Message",
        testimonial_image: "Please enter Testimonials Image",
      };
      $("#testimonialsDetails").validate({
        rules: feildsrules,
        messages: messages,
      });
      $("#dob").datepickerBT({
        todayBtn: 1,
        autoclose: true,
        dateFormat: "yy-mm-dd",
        onSelect: function (dateText) {
          selfobj.model.set({ dob: this.value });
          var minDate = new Date(this.value);
        },
      });

    },
    render: function () {
      var selfobj = this;
      var source = testimonialstemp;
      var template = _.template(source);
      $("#" + this.toClose).remove();
      this.$el.html(template({ "model": this.model.attributes }));
      this.$el.addClass("tab-pane in active panel_overflow");
      this.$el.attr("id", this.toClose);
      this.$el.addClass(this.toClose);
      this.$el.data("role", "tabpanel");
      this.$el.data("current", "yes");
      $(".ws-tab").append(this.$el);
      $("#" + this.toClose).show();
      // this is used to append the dynamic form in the single view html
      $("#dynamicFormFields").empty().append(this.dynamicFieldRenderobj.getform());
      // Do call this function from dynamic module it self.
      this.initializeValidate();
      this.setOldValues();
      this.attachEvents();
      rearrageOverlays("Testimonials", this.toClose);
      var __toolbarOptions = [
        ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
        [{ 'header': 1 }, { 'header': 2 }],               // custom button values
        [{ 'direction': 'rtl' }],                         // text direction
        [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
        [{ 'align': [] }],
        ['link'],
          ['clean']                                         // remove formatting button
      ];
  
    var editor = new Quill($("#testimonial_message").get(0),{
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
              selfobj.model.set({"testimonial_message":justHtml});
            }
      });
      return this;
    },
    onDelete: function () {
      this.remove();
    },
  });

  return testimonialsSingleView;
});
