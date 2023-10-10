define([
  'jquery',
  'underscore',
  'backbone',
  'validate',
  'inputmask',
  'minicolors',
  'Quill',
  'jqueryUI',
  'templateEditor',
  'custom',
  '../models/pagesMasterSingleModel',
  '../../readFiles/views/readFilesView',
  'text!../templates/pagesMasterSingleTempEdit.html',
], function($,_,Backbone,validate,inputmask,minicolors,Quill,jqueryUI,templateEditor,custom,pagesMasterSingleModel,readFilesView,pagesMasterTemp){

var pagesMasterSingleDesign = Backbone.View.extend({
    initialize: function(options){
      var selfobj = this;
      var pageID=options.action;
      this.pageID = pageID;
      this.model = new pagesMasterSingleModel();
      if(pageID!=0){
        this.model.set({pageID:pageID});
        this.model.fetch({headers: {
          'contentType':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
        },error: selfobj.onErrorHandler}).done(function(res){
          if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
          $(".popupLoader").hide();
          selfobj.render();
          selfobj.setValues();
        });
      }else
      {
          selfobj.render();
          $(".popupLoader").hide();
      }
    },
    events:
    {
      "click #saveuserRoleDetails":"saveuserRoleDetails",
      "click .item-container li":"setValues",
      "blur .txtchange":"updateOtherDetails",
      "change .multiSel":"setValues",
      "click .checkVal":"updateOtherDetailsCheck",
      "change .bDate":"updateOtherDetails",
      "change .dropval":"updateOtherDetails",
      "click .multiselect": "getMulipleSelectedValue",
      "keyup .titleChange": "updateURL",
      "click .loadMedia": "loadMedia",
    },
    onErrorHandler: function(collection, response, options){
        alert("Something was wrong ! Try to refresh the page or contact administer. :(");
        $(".profile-loader").hide();
    },
    getSelectedFile:function(url){
      $('.'+this.elm).val(url);
      $('.'+this.elm).change();
      $('#largeModal').modal('toggle');
    },
    updateURL: function(e){
      var url = $(e.currentTarget).val().trim().replace(/[^A-Z0-9]+/ig, "_");
      $("#pageLink").val(url);
      this.model.set({"pageLink":url});
    },
    updateOtherDetails: function(e){
      var valuetxt = $(e.currentTarget).val();
      var toID = $(e.currentTarget).attr("id");
      var newdetails=[];
      newdetails[""+toID]= valuetxt;
      this.model.set(newdetails);
      // console.log(this.model)
    },
    updateOtherDetailsCheck: function(e){
      var valuetxt = $(e.currentTarget).val();
      var toID = $(e.currentTarget).attr("id");
      var newdetails=[];
      var ische = $(e.currentTarget).is(":checked");
      if(ische){
        newdetails[""+toID]= "yes";
      }else{
        newdetails[""+toID]= "no";
      }
      
      this.model.set(newdetails);
      // console.log(this.model)
    },
    setValues:function(e){
        setvalues = ["category"];
        var selfobj = this;

        $.each(setvalues,function(key,value){
          var modval = selfobj.model.get(value);
         // console.log(modval);
          if(modval != null){
            var modeVal = modval.split(",");
          }else{ var modeVal = {};}

          $(".category").each(function(){
            var currentval = $(this).attr("data-value");
            // console.log(currentval)
            var selecterobj = $(this);
            $.each(modeVal,function(key,dbvalue){
              if(dbvalue.trim().toLowerCase() == currentval.toLowerCase()){
                $(selecterobj).addClass("active");
              }
            });
          });
          
        });
        setTimeout(function(){
        if(e != undefined && e.type == "click")
        {
          var newsetval = [];
          var objectDetails = [];
          var classname = $(e.currentTarget).attr("class").split(" ");
          $(".item-container li."+classname[0]).each(function(){
            var isclass = $(this).hasClass("active");
            if(isclass){
              var vv = $(this).attr("data-value");
              newsetval.push(vv);
            }
         
          });
 
          if (0 < newsetval.length) {
            var newsetvalue = newsetval.toString();
          }
          else{var newsetvalue = "";}

          objectDetails[""+classname[0]] = newsetvalue;
          $("#valset__"+classname[0]).html(newsetvalue);
          selfobj.model.set(objectDetails);
        }
      }, 500);
    },
    saveuserRoleDetails: function(e){
      e.preventDefault();
      var pageID = this.model.get("pageID");
    
      if(pageID == "" || pageID == null){
        var methodt = "PUT";
      }else{
        var methodt = "POST";
      }
      // console.log(methodt);
      
        var selfobj = this;
        $(e.currentTarget).html("<span>Saving..</span>");
        $(e.currentTarget).attr("disabled", "disabled");
        this.model.save({},{headers:{
          'Content-Type':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
        },error: selfobj.onErrorHandler,type:methodt}).done(function(res){
          if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
          if(res.flag == "F"){
            alert(res.msg);
            $(e.currentTarget).html("<span>Error</span>");
          }else{
            $(e.currentTarget).html("<span>Saved</span>");
            alert("Page Saved")
            if(selfobj.pageID == 0){
              app_router.navigate("pages",{trigger:true});
            }
          }
          setTimeout(function(){
            $(e.currentTarget).html("<span>Save</span>");
            $(e.currentTarget).removeAttr("disabled");
            }, 3000);
        });
      
    },
     initializeValidate:function(){
      var selfobj = this;
        
    },
    render: function(){
        var selfobj = this;
        var source = pagesMasterTemp;
        var template = _.template(source);
        this.$el.html(template(this.model.attributes));
        
        $(".main_container").removeClass("content");
        $(".main_container").empty();
        $(".main_container").append(this.$el);
        setTimeout(function(){
        var tt = $(".emailTemplate");
          if(tt.hasClass("email_temp_int")){
          }else{
            tt.addClass("email_temp_int");
            tt.templateDesign({
                playground:$(".playgrounddiv"),
                playgroundElements:$(".playgroundelements"),
                nextbtn:$("#nextbtn"),
                savebtn:$(".getHTML"),
                temptemplate:$(".emailTemplateDump"),
                version:"block", // inline
                mediaLink:"block",
                mediaModel:"largeModal",
                HTMLUpdate : function(data){
                  var codeD =[];
                  codeD["pageCode"]= $(".playgrounddiv").html();
                  codeD["pageContent"]= $(".emailTemplateDump").html();
                  codeD["pageCss"]= data.css;
                  console.log(codeD);
                  selfobj.model.set(codeD);
                  selfobj.initializeValidate();
                  selfobj.saveuserRoleDetails(data.els);
                 },
              });
          }
        },2000);
        rearrageOverlays("pagesMaster",this.toClose);
        $("body").on("click",".loadMedia",function(e){
          $('#largeModal').modal('toggle');
          selfobj.elm = $(e.currentTarget).attr("data-change");
          var menusingleview = new readFilesView({loadFrom:"addpage",loadController:selfobj});
        });
        
        return this;
    }
});

  return pagesMasterSingleDesign;

});
