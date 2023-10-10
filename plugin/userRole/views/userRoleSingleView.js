define([
  'jquery',
  'underscore',
  'backbone',
  'validate',
  'inputmask',
  'datepickerBT',
  '../../core/views/multiselectOptions',
  '../models/singleuserRoleModel',
  '../../dynamicForm/views/dynamicFieldRender',
  'text!../templates/userRoleSingle_temp.html',
], function($,_, Backbone,validate,inputmask,datepickerBT,multiselectOptions,singleuserRoleModel,dynamicFieldRender,userRoletemp){

var userRoleSingleView = Backbone.View.extend({
    model:singleuserRoleModel,
    initialize: function(options){
      this.dynamicData = null;
      this.toClose = "userRoleSingleView";
      // use this valiable for dynamic fields to featch the data from server
      this.pluginName = "menuList";
        var selfobj = this;
        $(".modelbox").hide();
        scanDetails = options.searchuserRole;
        // this function is called to render the dynamic view
        this.dynamicFieldRenderobj = new dynamicFieldRender({ViewObj:selfobj,formJson:{}});  
        this.multiselectOptions = new multiselectOptions();
        $(".popupLoader").show();
      
        this.model = new singleuserRoleModel();
        if(options.roleID != ""){
          this.model.set({roleID:options.roleID});
          this.model.fetch({headers: {
            'contentType':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
          },error: selfobj.onErrorHandler}).done(function(res){
            if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
            $(".popupLoader").hide();
            selfobj.render();
          });
        
        }
    },
    events:
    {
      "click #saveuserRoleDetails":"saveuserRoleDetails",
      "blur .txtchange":"updateOtherDetails",
      "click .multiSel":"setValues",
      "change .bDate":"updateOtherDetails",
      "change .dropval":"updateOtherDetails",
    },
    attachEvents: function() {
      // Detach previous event bindings
      this.$el.off('click', '.saveuserRoleDetails', this.saveuserRoleDetails);
      // Reattach event bindings
      this.$el.on('click', '.saveuserRoleDetails', this.saveuserRoleDetails.bind(this));

      this.$el.off('click','.multiSel', this.setValues);
      this.$el.on('click','.multiSel', this.setValues.bind(this));
      this.$el.off('change','.bDate', this.updateOtherDetails);
      this.$el.on('change','.bDate', this.updateOtherDetails.bind(this));
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
    saveuserRoleDetails: function(e){
      e.preventDefault();
      var selfobj = this;
      var rid = this.model.get("roleID");
      let isNew = $(e.currentTarget).attr("data-action");
      if(permission.edit != "yes"){
        alert("You dont have permission to edit");
        return false;
      }
      if(rid == "" || rid == null){
        var methodt = "PUT";
      }else{
        var methodt = "POST";
      }
      if($("#userRoleDetails").valid()){
        
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
        $("#userRoleDetails").validate({
        rules: {
          roleName:{
             required: true,
          }
        },
        messages: {
          roleName: "Please enter User Role Name"
        }
      });
    },
    render: function(){

      var source = userRoletemp;
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
      rearrageOverlays("User Roles",this.toClose);

        // var isexits = checkisoverlay(this.toClose);
        // if(!isexits){
        //   var source = userRoletemp;
        //   var template = _.template(source);
  
        //   //var template = _.template(menuTemp);
        //   this.$el.html(template(this.model.attributes));
        //   this.$el.addClass("overlay");
        //   this.$el.addClass(this.toClose);
        //   this.$el.data("current","yes");
        //   //this.$el.html(res);
        //   $(".overlay-main-container").append(this.$el);
        //   $('#'+this.toClose).show();
        //   this.initializeValidate();
        //   this.setValues();
        // }
        // rearrageOverlays();
        return this;
    },onDelete: function(){
        this.remove();
    }
});

  return userRoleSingleView;
    
});
