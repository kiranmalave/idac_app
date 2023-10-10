define([
  'jquery',
  'underscore',
  'backbone',
  'validate',
  'inputmask',
  'datepickerBT',
  '../../core/views/multiselectOptions',
  '../../dynamicForm/views/dynamicFieldRender',
  '../collections/dynamicFormsCollection',
  '../models/dynamicFormsSingleModel',
  '../../readFiles/views/readFilesView',
  'text!../templates/dynamicFormsSingle_temp.html',
  'text!../templates/dynamicFormsQuestionRow.html',
  'text!../templates/addTitleFormsRow.html',
], function ($, _, Backbone, validate, inputmask, datepickerBT,multiselectOptions,dynamicFieldRender,dynamicFormsCollection, dynamicFormsSingleModel,readFilesView,dynamicformtemp,QuestionRow_Temp,addQuestionFormRow_Temp,addTitleTemp) {
  var dynamicFormsSingleView = Backbone.View.extend({
    model: dynamicFormsSingleModel,
    initialize: function (options) {
      this.dynamicData = null;
      this.cloneCount = 1;
      this.addextrawQuestionID = 1;
      this.addtitleTempID = 1;
      this.toClose = "dynamicFormsSingleView";
      // use this valiable for dynamic fields to featch the data from server
      this.pluginName = "dynamicformsList";
      this.model = new dynamicFormsSingleModel();
      this.questionmodel = new dynamicFormsSingleModel();

      var selfobj = this;
      // this function is called to render the dynamic view
      this.dynamicFieldRenderobj = new dynamicFieldRender({ViewObj:selfobj,formJson:{}});  
      this.multiselectOptions = new multiselectOptions();
      scanDetails = options.searchform;
      $(".popupLoader").show();
      
      var dynamicformsList = new dynamicFormsCollection();
      dynamicformsList.fetch({headers: {
          'contentType':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
      },error: selfobj.onErrorHandler,type:'post', data:{status:'active',getAll:'Y'}}).done(function(res){
        if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
        $(".popupLoader").hide();
        selfobj.model.set("dynamicformsList",res.data);
        selfobj.render();
      });

      if (options.form_id != "") {
        this.model.set({ form_id: options.form_id });
        this.model.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler
        }).done(function (res) {
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          $(".popupLoader").hide();
          selfobj.render();
          selfobj.setOldValues();
        });
      } 
    },
    events:
    {
      "click .saveformDetails": "saveformDetails",
      "click .item-container li": "setValues",
      "blur .txtchange": "updateOtherDetails",
      "change .multiSel": "setValues",
      "click .multiOptionSel": "multioption",
      "change .dropval": "updateOtherDetails",
      "click .loadMedia": "loadMedia",
      "click .text-description": "textdescribe",  
      "click .add-questions": "addExtraQuestions",
      "click .remove-questions": "removeExtraQuestions",
      "click .add-options": "AddRowOptions",
      "click .add-duplicate-question": "AddDuplicate",
      "click .add-title": "addTextFields",

    },
    attachEvents: function() {
      // Detach previous event bindings
      this.$el.off('click', '.saveformDetails', this.saveformDetails);
      // Reattach event bindings
      this.$el.on('click', '.saveformDetails', this.saveformDetails.bind(this));
      this.$el.off('change','.multiSel', this.setValues);
      this.$el.on('change','.multiSel', this.setValues.bind(this));
      this.$el.off('change','.dropval', this.updateOtherDetails);
      this.$el.on('change','.dropval', this.updateOtherDetails.bind(this));
      this.$el.off('blur','.txtchange', this.updateOtherDetails);
      this.$el.on('blur','.txtchange', this.updateOtherDetails.bind(this));
      this.$el.off("click", ".loadMedia", this.loadMedia);
      this.$el.on("click", ".loadMedia", this.loadMedia.bind(this));
      this.$el.off("click", ".text-description", this.textdescribe);
      this.$el.on("click", ".text-description", this.textdescribe.bind(this));
      this.$el.off("click", ".add-questions", this.addExtraQuestions);
      this.$el.on("click", ".add-questions", this.addExtraQuestions.bind(this));
      this.$el.off("click", ".remove-questions", this.removeExtraQuestions);
      this.$el.on("click", ".remove-questions", this.removeExtraQuestions.bind(this));
      this.$el.off("click", ".add-options", this.AddRowOptions);
      this.$el.on("click", ".add-options", this.AddRowOptions.bind(this));
      this.$el.off("click", ".add-duplicate-question", this.AddDuplicate);
      this.$el.on("click", ".add-duplicate-question", this.AddDuplicate.bind(this));
      this.$el.off("click", ".add-title", this.addTextFields);
      this.$el.on("click", ".add-title", this.addTextFields.bind(this));
    },
    
    onErrorHandler: function (collection, response, options) {
      alert("Something was wrong ! Try to refresh the page or contact administer. :(");
      $(".profile-loader").hide();
    },
    updateOtherDetails: function (e) {
      var selfobj = this;
      var valuetxt = $(e.currentTarget).val();
      var toID = $(e.currentTarget).attr("id");
      var newdetails = [];
      newdetails["" + toID] = valuetxt;
      this.model.set(newdetails);
      if (valuetxt == "short_answer") {
        $(".short-answer-show").show();
        $(".change-question-box").hide();
        $(".change-question-checkbox").hide();
        $(".paragraph-show").hide();
        $(".date-show").hide();
        $(".time-show").hide();
        selfobj.model.set({ 'question_type': "short_answer" });
      } else if (valuetxt == "choice") {
        $(".change-question-box").show();
        $(".short-answer-show").hide();
        $(".change-question-checkbox").hide();
        $(".paragraph-show").hide();
        $(".date-show").hide();
        $(".time-show").hide();
        selfobj.model.set({ 'question_type': "choice" });
      }else if (valuetxt == "paragraph") {
        $(".paragraph-show").show();
        $(".short-answer-show").hide();
        $(".change-question-box").hide();
        $(".change-question-checkbox").hide();
        $(".date-show").hide();
        $(".time-show").hide();
        selfobj.model.set({ 'question_type': "paragraph" });
      }else if (valuetxt == "checkboxes") {
       $(".change-question-checkbox").show();
       $(".short-answer-show").hide();
        $(".change-question-box").hide();
        $(".paragraph-show").hide();
        $(".date-show").hide();
        $(".time-show").hide();
        selfobj.model.set({ 'question_type': "checkboxes" });
      }else if (valuetxt == "question_date") {
        $(".date-show").show();
        $(".short-answer-show").hide();
        $(".change-question-box").hide();
        $(".change-question-checkbox").hide();
        $(".paragraph-show").hide();
        $(".time-show").hide();
         selfobj.model.set({ 'question_type': "question_date" });
       }else if (valuetxt == "question_time") {
        $(".time-show").show();
        $(".short-answer-show").hide();
        $(".change-question-box").hide();
        $(".change-question-checkbox").hide();
        $(".paragraph-show").hide();
        $(".date-show").hide();
         selfobj.model.set({ 'question_type': "question_time" });
       }
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
      // $('.dropdown-menu').change(function(){
      //   if( $(this).val() == '1'){
      //       $('#question_description').show();
      //   }else{
      //       $('#question_description').hide();
      //   }
      // });
    },
    AddRowOptions:function () {
      let selfobj= this;
      var clonedElement = $('#multiple-choice').clone();
      var clonedId = 'multiple-choice-' + this.cloneCount;
      clonedElement.attr('id', clonedId);
      clonedElement.addClass('single remove');
  
      var removeLink = '<a href="#" class="remove-field btn-remove-customer col-1 mt-3" data-clone-id="' + clonedId + '"><i class="material-icons">close</i></a>';
      clonedElement.append(removeLink);

      clonedElement.appendTo('.customer_records_dynamic');

      clonedElement.each(function() {
        var fieldname = $(this).attr("question_name");
        $(this).attr('question_name', fieldname + this.cloneCount);
      });

      this.cloneCount++;
   

    $(document).on('click', '.remove-field', function(e) {
      var cloneId = $(this).data('clone-id');
      $('#' + cloneId).remove();
      e.preventDefault();
    });
    },
    AddDuplicate: function() {
      let selfobj = this;
      let originalElement = $("#ws-evens");
      let cloneId = 'ws-even' + this.cloneCount++; 
      let clonedElement = originalElement.clone().attr('id', cloneId);
      clonedElement.insertAfter(originalElement);
    },
    addExtraQuestions: function (e) {
      let selfobj = this;
      var template = _.template(QuestionRow_Temp);
      $(e.currentTarget).closest(".row").find("#ws-evens").append(template({"insertID":selfobj.addextrawQuestionID++}));
    },
    addTextFields: function (e) {
      let selfobj = this;
      var template = _.template(addTitleTemp);
      $(e.currentTarget).closest(".row").find("#ws-textfiled").append(template({"insertID":selfobj.addtitleTempID++}));
    },
    removeExtraQuestions: function (e) {
      var el = $(e.currentTarget).closest(".even")
      $(e.currentTarget).closest(".even").remove();
    },
    getSelectedFile:function(url){
      $('.'+this.elm).val(url);
      $('.'+this.elm).change();
      $("#profile_pic_view").attr("src",url);
      $("#profile_pic_view").css({"max-width":"100%"});
      $('#largeModal').modal('toggle');
      this.model.set({"option_media":url});
    },
    loadMedia: function(e){
      e.stopPropagation();
      $('#largeModal').modal('toggle');
      this.elm ="profile_pic";
      new readFilesView({loadFrom:"addpage",loadController:this});
    },
    textdescribe:function(e){
      e.stopPropagation(toolbar);
      var __toolbarOptions = [
        ['bold', 'italic', 'underline', 'strike'],
        ['link'],
        ['clean']
      ];
      
      var editor1 = new Quill("#question_name", {
          modules: {
              toolbar: __toolbarOptions
          },
          theme: 'snow' 
             
      });
      
      // Display Quill editor when input field is clicked
     
      // Capture Quill editor content and update the input field
      editor1.on('text-change', function(delta, oldDelta, source) {
        if (source == 'api') {
            console.log("An API call triggered this change.");
          } else if (source == 'user') {
            var delta = editor1.getContents();
            var text = editor1.getText();
            var justHtml = editor1.root.innerHTML;
            selfobj.model.set({"question_name":justHtml});
          }
      }); 
    },
    saveformDetails: function (e) {
      e.preventDefault();
      let selfobj = this;
      var form_id = this.model.get("form_id");
      let isNew = $(e.currentTarget).attr("data-action");
      if (permission.edit != "yes") {
        alert("You dont have permission to edit");
        return false;
      }
      if (form_id == "" || form_id == null) {

        var methodt = "POST";
      } else {
        var methodt = "PUT";
      }
      if ($("#formDetails").valid()) {
        $(e.currentTarget).html("<span>Saving..</span>");
        $(e.currentTarget).attr("disabled", "disabled");
        this.model.save({}, {headers: {
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
        form_name: {
          required: true,
        },
        from_description: {
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
        form_name: "Please enter Name",
        from_description: "Please enter Descriptions",
    
      };
      $("#formDetails").validate({
        rules: feildsrules,
        messages: messages,
      });
    },
    render: function () {
      var selfobj = this;
      var source = dynamicformtemp;
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
      $('.ws-select').selectpicker();
      // this is used to append the dynamic form in the single view html
      $("#dynamicForms").empty().append(this.dynamicFieldRenderobj.getform());
      // Do call this function from dynamic module it self.
      this.initializeValidate();
      this.setOldValues();
      this.attachEvents();
      rearrageOverlays("Forms", this.toClose);
      var __toolbarOptions = [
        ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
        [{ 'header': 1 }, { 'header': 2 }],               // custom button values
        [{ 'direction': 'rtl' }],                         // text direction
        [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
        [{ 'align': [] }],
        ['link'],
          ['clean']                                         // remove formatting button
      ];
  
    var editor = new Quill($("#from_description").get(0),{
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
              selfobj.model.set({"from_description":justHtml});
            }
      });
      return this;
    }, onDelete: function () {
      this.remove();
    }
  });

  return dynamicFormsSingleView;

});




