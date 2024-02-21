
define([
  'jquery',
  'underscore',
  'backbone',
  'text!../templates/mail_temp.html',
  '../models/sendEmailModel',
  '../../infoSettings/models/infosettingsModel',
  "../../emailMaster/collections/emailMasterCollection",
], function ($, _, Backbone, mail_temp, sendEmailModel, infosettingsModel, emailsTemplateList) {
  var mailView = Backbone.View.extend({
    model: '',
    emailMasterList :'',  
    enteredEmailsArray : [],
    totalEmailIDs:'',
    ccArray  : [],
    bccArray : [],
    toField : true,
    ccField : true,
    BccField : true,
    editor : {},
    toClose:'sendEmailView',
    initialize: function (options) {
      var selfobj = this;
      this.enteredEmailsArray = [];
      this.bccArray = [];
      this.ccArray = [];
      this.model = new sendEmailModel();
      this.infoSettingModel = new infosettingsModel();
      selfobj.emailMasterList = new emailsTemplateList();
      selfobj.emailMasterList.fetch({
       headers: {
         'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
       }, error: selfobj.onErrorHandler, data: { getAll: 'Y',status:'active'}
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        $('body').find(".loder").hide();
        selfobj.render();
      });

      this.infoSettingModel.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        selfobj.render();
      });
      
      $('#toField').val('');
      if(options.customer_mail != ''){
        this.enteredEmailsArray.push(options.customer_mail);
        $('#toField').val(options.customer_mail);
      }
      if(options.customer_mail != ''){
        this.customerEmail = options.customer_mail;
      }else{
        this.customerEmail ="";
      }
      selfobj.render();
    },
    events:
    {
      "click .multiOptionSel": "multioption",
      "change .textchange": "updateOtherDetails",
      "change .getTemplate": "updateTemplateDetails",
      "click .selectMail": "setTosendEmail",
      "click .sendEmail": "sendEmail",
      "input #toField": "getCustomerEmailsList",
      "input #cc": "setCc",
      "input #bcc": "setBcc",
      "input #cc": "setCc",
      "click .selectCc": "setToCc",
      "click .selectBcc": "setToBcc",
      "click .setFocus": "getFocus",
      "click .removeMail": "removeMail",
    },

    attachEvents: function () {
      
      this.$el.off("change", ".textchange", this.updateOtherDetails);
      this.$el.on("change", ".textchange", this.updateOtherDetails.bind(this));
      this.$el.off("click", ".sendEmail", this.sendEmail);
      this.$el.on("click", ".sendEmail", this.sendEmail.bind(this));
      this.$el.off('input', '#toFField', this.getCustomerEmailsList);
      this.$el.on('input', '#toField', this.getCustomerEmailsList.bind(this));
      this.$el.off('change', '.getTemplate', this.updateTemplateDetails);
      this.$el.on('change', '.getTemplate', this.updateTemplateDetails.bind(this));
      this.$el.off('input', '#cc', this.setCc);
      this.$el.on('input', '#cc', this.setCc.bind(this));
      this.$el.off('input', '#bcc', this.setBcc);
      this.$el.on('input', '#bcc', this.setBcc.bind(this));
      this.$el.off('click', '.selectMail', this.setTosendEmail);
      this.$el.on('click', '.selectMail', this.setTosendEmail.bind(this));
      this.$el.off('click', '.selectCc', this.setToCc);
      this.$el.on('click', '.selectCc', this.setToCc.bind(this));
      this.$el.off('click', '.selectBcc', this.setToBcc);
      this.$el.on('click', '.selectBcc', this.setToBcc.bind(this));
      this.$el.off('click', '.removeMail', this.removeMail);
      this.$el.on('click', '.removeMail', this.removeMail.bind(this));
      this.$el.off('click', '.setFocus', this.getFocus);
      this.$el.on('click', '.setFocus', this.getFocus.bind(this));
      this.$el.off("change", ".textchange", this.updateOtherDetails);
      this.$el.on("change", ".textchange", this.updateOtherDetails.bind(this));
    },
    updateTemplateDetails: function (e) {
      var selfobj = this;
      let emailCnt="";
      if(e != undefined){
        var selfobj = this;
        var valuetxt = $(e.currentTarget).val();
        var toID = $(e.currentTarget).attr("id");
        let cost =  $("<div>");
    
        var newdetails = [];
        newdetails["" + toID] = valuetxt;
        filterOption.set(newdetails);
        var emailItem = selfobj.emailMasterList.models.find((item) => {
          return item && item.attributes && item.attributes.tempID == valuetxt;
        });
        emailCnt = emailItem ? emailItem.attributes.emailContent : undefined;
        console.log("emailCnt", emailCnt);
      }
      if(emailCnt!=""){
        $("#mail_description").empty().append(emailCnt);
      }
      var __toolbarOptions = [
        ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
        [{ 'header': 1 }, { 'header': 2 }],               // custom button values
        [{ 'direction': 'rtl' }],                         // text direction
        [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
        [{ 'align': [] }],
        ['link'],
        ['clean'],
        ['image']                              // remove formatting button
      ];
      
      selfobj.editor = new Quill($("#mail_description").get(0), {
          modules: {
          imageResize: {
            displaySize: true,
          
          },
          toolbar: {
            container: __toolbarOptions,
            handlers: {
              image: imageHandler
            }
          },
        },
        theme: 'snow'
      });
    
      function imageHandler() {
        var range = this.quill.getSelection();
        var value = prompt('please copy paste the image url here.');
        if (value) {
          this.quill.insertEmbed(range.index, 'image', value, Quill.sources.USER);
        }
      }
      // editor.setHTML('hello ');
      
      selfobj.editor.on('text-change', function (delta, oldDelta, source) {
        if (source == 'api') {
          console.log("An API call triggered this change.");
        } else if (source == 'user') {
          var delta = selfobj.editor.getContents();
          var text = selfobj.editor.getText();
          var justHtml = selfobj.editor.root.innerHTML;
          selfobj.model.set({'mail_body':justHtml});
        }
      });
      // $("#mail_description").addClass("Hellod");
      // $("#mail_description").html(emailCnt);
      console.log($("#mail_description"));
    },

    hideToField: function(type) {
      
      var selfobj = this;
     if(type== "showAll"){
        $(".email-displayed").remove();
        $(".tm-input").children("span").css({"display":"inline"});
        $("#toField").show();
      }else{
        let emailLength =0;
        if(selfobj.model.attributes.toField != undefined){
          emailLength = selfobj.model.attributes.toField.length;
        }
        if(emailLength > 1){
          $(".tm-input").children("span").css({"display":"none"});
          let totalEmail = '<span class="totalemail email-displayed">'+(emailLength-1)+'</span>';
          $(".tm-input").append (totalEmail);
          $(".tm-input").children(':first-child').css({"display":"inline"});
          $("#toField").hide();
        }
    }
    },

    hideCC: function(type) {
      
      var selfobj = this;
     if(type== "showAll"){
        $(".email-displayedCC").remove();
        $(".tm-input-cc").children("span").css({"display":"inline"});
        $("#cc").show();
      }else{
        let emailLength =0;
        if(selfobj.model.attributes.cc != undefined){
          emailLength = selfobj.model.attributes.cc.length;
        }
        if(emailLength > 1){
          $(".tm-input-cc").children("span").css({"display":"none"});
          let totalEmail = '<span class="totalemailCC email-displayedCC">'+(emailLength-1)+'</span>';
          $(".tm-input-cc").append (totalEmail);
          $(".tm-input-cc").children(':first-child').css({"display":"inline"});
          $("#cc").hide();
        }
    }
    },

    hideBcc: function(type) {
      var selfobj = this;
     if(type== "showAll"){
        $(".email-displayedBcc").remove();
        $(".tm-input-bcc").children("span").css({"display":"inline"});
        $("#bcc").show();
      }else{
        let emailLength =0;
        if(selfobj.model.attributes.bcc != undefined){
          emailLength = selfobj.model.attributes.bcc.length;
        }
        if(emailLength > 1){
          $(".tm-input-bcc").children("span").css({"display":"none"});
          let totalEmail = '<span class="displayedBcc email-displayedBcc">'+(emailLength-1)+'</span>';
          $(".tm-input-bcc").append (totalEmail);
          $(".tm-input-bcc").children(':first-child').css({"display":"inline"});
          $("#bcc").hide();
        }
    }
    },
    updateOtherDetails: function (e) {
      var selfobj = this;
      var valuetxt = $(e.currentTarget).val();
      var toID = $(e.currentTarget).attr('id');
      console.log("toID",toID);
      var newdetails = [];
      
      if(toID != 'toField' && toID != 'cc' && toID != 'bcc'){
        newdetails["" + toID] = valuetxt;  
        this.model.set(newdetails);
      }else
      {
        switch (toID) {
          case 'toField':
            this.toField = true;
            this.ccField = false;
            this.BccField = false;
              if(validateEmail(valuetxt))
              {
                if(this.enteredEmailsArray.indexOf(valuetxt) == -1){
                  var htmlToAppend = '<span class="tm-tag-eml"><span>' + valuetxt + '</span> <a data-rem-type = "to" class= "removeMail" data-to-remove = '+valuetxt+' >x</a></span>';
                  this.enteredEmailsArray.push(valuetxt);
                  this.model.set('toField',this.enteredEmailsArray);
                  $(htmlToAppend).insertBefore('#toField');
                  
                }
                $(e.currentTarget).val('')
              }
            break;

            case 'cc':
              this.toField = false;
              this.ccField = true;
              this.BccField = false;
              if(validateEmail(valuetxt))
              {
                if(this.ccArray.indexOf(valuetxt) == -1){
                  var htmlToAppend = '<span class="tm-tag-cc"><span>' + valuetxt + '</span> <a data-rem-type = "cc" class= "removeMail" data-to-remove = '+valuetxt+' >x</a></span>';
                  this.ccArray.push(valuetxt);
                  this.model.set('cc',this.ccArray);
                  $(htmlToAppend).insertBefore('#cc');
                 
                }
                $(e.currentTarget).val('')
              }
            break;

            case 'bcc':
              this.toField = true;
              this.ccField = false;
              this.BccField = true;
              if(validateEmail(valuetxt))
              {
                if(this.bccArray.indexOf(valuetxt) == -1){
                  var htmlToAppend = '<span class="tm-tag-bcc"><span>' + valuetxt + '</span> <a data-rem-type = "bcc" class= "removeMail" data-to-remove = '+valuetxt+' >x</a></span>';
                  this.bccArray.push(valuetxt);
                  this.model.set('bcc',this.bccArray);
                  $(htmlToAppend).insertBefore('#bcc');
                  
                }
                
              }
            break;
          default:
            break;
        }
      }
      console.log(this.model);
      function validateEmail(email) {
        var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
      }
    },

    getFocus : function(e)
    {
      e.stopPropagation();
      var el = $(e.currentTarget).find('input');
      $(el).focus();
      this.hideToField("showAll");
      this.hideCC("showAll");
      this.hideBcc("showAll");
      
    },

    getCustomerEmailsList : function(e) {
      var selfobj = this ;
      // console.log(this.model.attributes.appointment_guest);
      var email = $(e.currentTarget).val();
      var inputLength = email.length;
      $(e.currentTarget).width(inputLength * 10);

      var dropdownContainer = $(".toSend");
      if (email != "") {
        $.ajax({
          url: APIPATH + 'getCustomerEmailList',
          method: 'POST',
          data: { text: email },
          datatype: 'JSON',
          beforeSend: function (request) {
            $(".textLoader").show();
            request.setRequestHeader("token", $.cookie('_bb_key'));
            request.setRequestHeader("SadminID", $.cookie('authid'));
            request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
            request.setRequestHeader("Accept", 'application/json');
          },
          success: function (res) {
            // console.log("heer");
            $(".textLoader").hide();
            dropdownContainer.empty();
            if (res.msg === "sucess" && res.data.length > 0) {
              result = [] ;
              $.each(res.data, function (index, value) {
                
                dropdownContainer.append('<div class="dropdown-item selectMail" style="background-color: #ffffff;" data-adminID=>' + value.email + '</div>');
              });
              dropdownContainer.show();
            } else {
              dropdownContainer.hide();
            }
          }
        });

        $("#toField").on("keyup", function (event) {
          
          if (event.keyCode === 13) {
            
            var enteredEmail = $(this).val();
           
            if (enteredEmail) {
                if (validateEmail(enteredEmail)) { 
                  var htmlToAppend = '<span class="tm-tag-eml"><span>' + enteredEmail + '</span> <a data-rem-type = "to" class= "removeMail" data-to-remove = '+enteredEmail+' >x</a></span>';
                    // $(".tm-input").append(htmlToAppend);
                    $("#toFeild").val('');
                    if(selfobj.enteredEmailsArray.indexOf(enteredEmail) == -1){
                      selfobj.enteredEmailsArray.push(enteredEmail);
                      $(htmlToAppend).insertBefore('#toField');
                      selfobj.model.set({ "toField": selfobj.enteredEmailsArray });
                    }
                  $(this).val("");
                  $(".toSend").hide();
                } else {
                  // $('#toFeild').next('.error-message').text(errorMessage).addClass('error');
                  
                }
            
            }
          }
          // console.log(selfobj.model);
          //console.log("Length of selfobj.model:", selfobj.model.attributes.toField.length);
          
        }); 
        function validateEmail(email) {
          var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return re.test(email);
        }
      }else
      {
        dropdownContainer.hide();
      }
    },

    setCc : function(e)
    {
        selfobj = this;
        var email = $(e.currentTarget).val();
        var inputLength = email.length;
        $(e.currentTarget).width(inputLength * 10);

        var dropdownContainer = $(".toCc");
        if (email != "") {
        $.ajax({
          url: APIPATH + 'getCustomerEmailList',
          method: 'POST',
          data: { text: email },
          datatype: 'JSON',
          beforeSend: function (request) {
            $(".textLoader").show();
            request.setRequestHeader("token", $.cookie('_bb_key'));
            request.setRequestHeader("SadminID", $.cookie('authid'));
            request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
            request.setRequestHeader("Accept", 'application/json');
          },
          success: function (res) {
            // console.log("heer");
            $(".textLoader").hide();
            dropdownContainer.empty();
            if (res.msg === "sucess" && res.data.length > 0) {
              result = [] ;
              $.each(res.data, function (index, value) {
                
                dropdownContainer.append('<div class="dropdown-item selectCc" style="background-color: #ffffff;" data-adminID=>' + value.email + '</div>');
              });
              dropdownContainer.show();
            } else {
              dropdownContainer.hide();
            }
          }
        });
      }
      $("#cc").on("keyup", function (event) {
        if (event.keyCode === 13) {
          var enteredEmail = $(this).val();
          if (enteredEmail) {
            if (validateEmail(enteredEmail)) {
              var htmlToAppend = '<span class="tm-tag-cc"><span>' + enteredEmail + '</span> <a data-rem-type= "cc"  class= "removeMail" data-to-remove = '+enteredEmail+' >x</a></span>';
              // $(".tm-input-cc").append(htmlToAppend);
              
              $("#cc").val('');
              // console.log(enteredEmail);
              console.log(selfobj.ccArray);
              if(selfobj.ccArray.indexOf(enteredEmail)=== -1){
                selfobj.ccArray.push(enteredEmail);
                console.log(selfobj.ccArray);
                $(htmlToAppend).insertBefore('#cc');
                selfobj.model.set({ "cc": selfobj.ccArray });
              }
              $(this).val("");
            } else {
              // alert("Please enter a valid email address.");
            }
          }
        }
        dropdownContainer.hide();
        
      }); 
      function validateEmail(email) {
        var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
      }
    },
    setBcc : function(e)
    {
      selfobj = this;

      var email = $(e.currentTarget).val();
      var inputLength = email.length;
      $(e.currentTarget).width(inputLength * 10);

      var dropdownContainer = $(".toBcc");
      if (email != "") {
      $.ajax({
        url: APIPATH + 'getCustomerEmailList',
        method: 'POST',
        data: { text: email },
        datatype: 'JSON',
        beforeSend: function (request) {
          $(".textLoader").show();
          request.setRequestHeader("token", $.cookie('_bb_key'));
          request.setRequestHeader("SadminID", $.cookie('authid'));
          request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
          request.setRequestHeader("Accept", 'application/json');
        },
        success: function (res) {
          // console.log("heer");
          $(".textLoader").hide();
          dropdownContainer.empty();
          if (res.msg === "sucess" && res.data.length > 0) {
            result = [] ;
            $.each(res.data, function (index, value) {
              
              dropdownContainer.append('<div class="dropdown-item selectBcc" style="background-color: #ffffff;" data-adminID=>' + value.email + '</div>');
            });
            dropdownContainer.show();
          } else {
            dropdownContainer.hide();
          }
        }
      });
    }

      $("#bcc").on("keyup", function (event) {
        if (event.keyCode === 13) {
          var enteredEmail = $(this).val();
          if (enteredEmail) {
            if (validateEmail(enteredEmail)) {
              var htmlToAppend = '<span class="tm-tag-bcc"><span>' + enteredEmail + '</span> <a class= "removeMail" data-rem-type= "bcc" data-to-remove = '+enteredEmail+' >x</a></span>';
              // $(".tm-input-bcc").append(htmlToAppend);
              // $(htmlToAppend).insertBefore('#bcc');
              $("#bcc").val('');
              // console.log(enteredEmail);
              if(selfobj.bccArray.indexOf(enteredEmail) === -1){
                selfobj.bccArray.push(enteredEmail);  
                $(htmlToAppend).insertBefore('#bcc');
                selfobj.model.set({ "bcc": selfobj.bccArray });
              }
              $(this).val("");
            } else {
              // alert("Please enter a valid email address.");
            }
          }
        }
        dropdownContainer.hide();
        console.log(selfobj.model);
      }); 
      function validateEmail(email) {
        var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
      }
    },

    setTosendEmail: function (e) {
   
      let selfobj = this;
      console.log("selfobj model:", selfobj.model);
      console.log("Length of model:", selfobj.model.attributes);
      // if(selfobj.model.attributes.toField){
      //   this.totalEmailIDs = selfobj.model.attributes.toField.length;
        
      // }else{
      //   this.totalEmailIDs = '';
      // }
      
      var email = $(e.currentTarget).text();
      var htmlToAppend = '<span class="tm-tag-eml"><span>' + email + '</span> <a class="removeMail" data-rem-type= "to" data-to-remove = '+email+' >x</a></span>';     
      // var totlaEmail = '<span class="totalemail">' + totalEmailIDs + 'more</span>';
      $(".toSend").hide();
      if(selfobj.enteredEmailsArray.indexOf(email)=== -1){
        selfobj.enteredEmailsArray.push(email);
        $(htmlToAppend).insertBefore('#toField');   
        // $(totlaEmail).insertBefore('#toField');   
        console.log(selfobj.enteredEmailsArray.length);
        selfobj.model.set({ "toField": selfobj.enteredEmailsArray });  
      }
      $("#toField").val('');
     
    },

    setToCc: function (e) {
      let selfobj = this;
      var email = $(e.currentTarget).text();
      var htmlToAppend = '<span class="tm-tag-cc"><span>' + email + '</span> <a class="removeMail" data-rem-type= "cc" data-to-remove = '+email+' >x</a></span>';

      $(".toCc").hide();
      if(selfobj.ccArray.indexOf(email)=== -1){
        selfobj.ccArray.push(email);
        $(htmlToAppend).insertBefore('#cc');   
        selfobj.model.set({ "cc": selfobj.ccArray });  
      }
      $("#cc").val('');
      console.log(selfobj.ccArray);
    },
    
    setToBcc: function (e) {
      let selfobj = this;
      var email = $(e.currentTarget).text();
      console.log('emials',email);
      var htmlToAppend = '<span class="tm-tag-bcc"><span>' + email + '</span> <a class="removeMail" data-rem-type= "bcc" data-to-remove = '+email+' >x</a></span>';
      if(selfobj.bccArray.indexOf(email)=== -1){
        $(htmlToAppend).insertBefore('#bcc');
        selfobj.bccArray.push(email);
        selfobj.model.set({ "bcc": selfobj.bccArray });
      }
      $(".toBcc").hide();
      $("#bcc").val('');
    },

    removeMail : function (e) {
      var selfobj = this;
      var emailSpan =  $(e.currentTarget).attr('data-to-remove');
      var remType =  $(e.currentTarget).attr('data-rem-type');
      console.log(remType);
      switch (remType) {
        case 'to':
            $(e.currentTarget).closest('.tm-tag-eml').remove();
            selfobj.model.attributes.toField = selfobj.model.attributes.toField.filter(function(emails)
            {
              return emails !== emailSpan;
            });
            selfobj.enteredEmailsArray = selfobj.enteredEmailsArray.filter(function(emails)
            {
              return emails !== emailSpan;
            });
            console.log(selfobj.enteredEmailsArray);

          break;
      
        case 'cc':
          $(e.currentTarget).closest('.tm-tag-cc').remove();
          selfobj.model.attributes.cc = selfobj.model.attributes.cc.filter(function(emails)
          {
            return emails !== emailSpan;
          });
          selfobj.ccArray = selfobj.ccArray.filter(function(emails)
          {
            return emails !== emailSpan;
          });
          console.log(selfobj.ccArray);

        break;

        case 'bcc':
          $(e.currentTarget).closest('.tm-tag-bcc').remove();
          selfobj.model.attributes.bcc = selfobj.model.attributes.bcc.filter(function(emails)
          {
            return emails !== emailSpan;
          });
          selfobj.bcc = selfobj.bcc.filter(function(emails)
          {
            return emails !== emailSpan;
          });
          console.log(selfobj.bccArray);
        break;
    
        default:
          break;
      }
      console.log('removed : ',this.model); 
   },


   initializeValidate: function () {
    var selfobj = this;
    var feilds = {
      toField: {
        required: true,
      },
      subject: {
        required: true,
      },
     
    };
    var feildsrules = feilds;
    var dynamicRules = selfobj.dynamicFieldRenderobj.getValidationRule();

    if (!_.isEmpty(dynamicRules)) {

      var feildsrules = $.extend({}, feilds, dynamicRules);
      // var feildsrules = {
      // ...feilds,
      // ...dynamicRules
      // };
    }
    var messages = {
      toField: "Please enter recievers email",
      subject: "Please Enter subject ",
   
    };
    $("#sendmail").validate({
      rules: feildsrules,
      messages: messages
    });
  },
    sendEmail: function (e) {
      e.preventDefault();
      let selfobj = this;
      console.log("sending mail ...");
      var methodt = "POST";
      $(e.currentTarget).html("<span>Sending..</span>");
      $(e.currentTarget).attr("disabled", "disabled");
      this.model.save({}, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: methodt
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        if (res.flag == "S") {
          $(e.currentTarget).html("<span>Sent</span>");
          selfobj.model.clear();
          $(".customMail").hide();
          console.log("model cleared -",selfobj.model); 
        }else
        {
          showResponse(e,res,"Send");
          $(e.currentTarget).attr("disabled", "");
        }
      });      
    },

    render: function () {
      var selfobj = this;
      var source = mail_temp;
      var template = _.template(source);
      this.$el.html(template({"emailMasterList": selfobj.emailMasterList.models, cutomerMail: this.customerEmail, infoSetting: this.infoSettingModel.attributes}));
      $('#customMail').empty();
      $("#customMail").append(this.$el);
      
      var truncateElements = document.querySelectorAll('.truncate');
      truncateElements.forEach(function(element) {
      var maxLength = 60;
          var text = element.textContent;
          if (text.length > maxLength) {
              element.textContent = text.substring(0, maxLength) + '...';
          }
      });
      $(window).click(function() {
        selfobj .hideToField("hide");
        selfobj .hideCC("hide");
        selfobj .hideBcc("hide");
      });
      selfobj.updateTemplateDetails();
      selfobj.attachEvents();
      return this;
     
    },
    onDelete: function () {
      this.remove();
    },
  });

  return mailView;

});
