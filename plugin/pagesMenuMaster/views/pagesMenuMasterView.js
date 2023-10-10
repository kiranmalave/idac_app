
  define([
    'jquery',
    'underscore',
    'backbone',
    'jqueryUI',
    'jqueryNestable',
    '../collections/pagesMenuMasterCollection',
    '../collections/menuPagesCollection',
    '../../pagesMaster/collections/pagesMasterCollection',
    '../models/pagesMenuMasterFilterOptionModel',
    '../models/selectedMenuIDModel',
    '../models/pagesMenuMasterSingleModel',
    'text!../templates/pageLinkEdit.html',
    'text!../templates/pagesMenuMasterTemp.html',
  ], function($,_, Backbone,jqueryUI,jqueryNestable,pagesMenuMasterCollection,menuPagesCollection,pagesMasterCollection,pagesMenuMasterFilterOptionModel,selectedMenuIDModel,pagesMenuMasterSingleModel,pageLinkEdit,pagesMenuMasterTemp){

  var pagesMenuMasterView = Backbone.View.extend({
      
      initialize: function(options){
          var selfobj = this;
          $(".profile-loader").show();
          var mname = Backbone.history.getFragment();
          permission = ROLE[mname];
          readyState = true;
            // console.log(new sortable)
          filterOption = new pagesMenuMasterFilterOptionModel();
          this.pagesMenuMasterSinglemodel = new pagesMenuMasterSingleModel();
          this.selectedMenu = new selectedMenuIDModel();
          this.searchpagesMenuMaster = new pagesMenuMasterCollection();
          this.menuPagesList = new menuPagesCollection();
          this.pagesList = new pagesMasterCollection();


        this.pagesList.fetch({headers: {
            'contentType':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
          },error: selfobj.onErrorHandler,type:'post',data:{status:'active',getAll:'Y'}}).done(function(res){
            
            if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
            selfobj.render(); 
            $(".profile-loader").hide();
          });

          this.searchpagesMenuMaster.fetch({headers: {
            'contentType':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
          },error: selfobj.onErrorHandler,type:'post',data:filterOption.attributes}).done(function(res){
            
            if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
            selfobj.render(); 
            $(".profile-loader").hide();
          });
          this.render(); 
      },
    events:
      {
        "click #saveuserRoleDetails":"saveuserRoleDetails",
        "click .item-container li":"setValues",
        "blur .txtchange":"updateOtherDetails",
        "change .bDate":"updateOtherDetails",
        "change .dropval":"updateOtherDetails",
        "change .changeMenu":"changeMenu",
        "click .deletePage":"deletePageFromSelectedMenu",
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
        this.pagesMenuMasterSinglemodel.set(newdetails);
      },

      deletePageFromSelectedMenu:function(e)
      {
        var selfobj = this;
          var pageID = $(e.currentTarget).attr("data-pageID"); 
          var menuID=$('#menuID').val(); 
          console.log(menuID)
          console.log(pageID)
          $.ajax({
              url:APIPATH+'deletePageFromSelectedMenu',
              method:'POST',
              data:{menuID:menuID,pageID:pageID},
              datatype:'JSON',
              beforeSend: function(request) {
                request.setRequestHeader("token",$.cookie('_bb_key'));
                request.setRequestHeader("SadminID",$.cookie('authid'));
                request.setRequestHeader("contentType",'application/x-www-form-urlencoded');
                request.setRequestHeader("Accept",'application/json');
              },
              success:function(res){
                if(res.flag == "F")
                  alert(res.msg);

                if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
                if(res.flag == "S"){

                  filterOption.set({menuID:menuID});
                  selfobj.menuPagesList.fetch({headers: {
                    'contentType':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
                      },error: selfobj.onErrorHandler,data:filterOption.attributes}).done(function(res){
                        if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
                        $(".profile-loader").hide();
                        
                        selfobj.filterSearch();
                    });
                }
                setTimeout(function(){
                    $(e.currentTarget).html(status);
                }, 3000);
                
              }
            });
      },
      saveuserRoleDetails: function(e){
        e.preventDefault();
        var menuID = this.pagesMenuMasterSinglemodel.get("menuID");
        var isPrimary= $('#isPrimary').prop('checked');
        var isNew= $('#isNew').prop('checked');
        var isSecondary= $('#isSecondary').prop('checked');
        var isFooter= $('#isFooter').prop('checked');
        this.pagesMenuMasterSinglemodel.set({isPrimary:isPrimary,isSecondary:isSecondary,isFooter:isFooter})
        // console.log(this.pagesMenuMasterSinglemodel)
      if(permission.edit != "yes"){
          alert("You dont have permission to edit");
          return false;
        }
        
        if(isNew||menuID==""||menuID==null){
          var methodt = "PUT";
        }else{
          var methodt = "POST";
        }
        if($("#userRoleDetails").valid()){
          var selfobj = this;
          $(e.currentTarget).html("<span>Saving..</span>");
          $(e.currentTarget).attr("disabled", "disabled");
          this.pagesMenuMasterSinglemodel.save({},{headers:{
            'Content-Type':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
          },error: selfobj.onErrorHandler,type:methodt}).done(function(res){
            if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
            if(res.flag == "F"){
              alert(res.msg);
              $(e.currentTarget).html("<span>Error</span>");
            }else{
              $(e.currentTarget).html("<span>Saved</span>");
              
              selfobj.filterSearch();
            }
            
            setTimeout(function(){
              $(e.currentTarget).html("<span>Save</span>");
              $(e.currentTarget).removeAttr("disabled");
              }, 3000);
            
          });
        }
      },
      filterSearch: function(){

          this.searchpagesMenuMaster.reset();
          var selfobj = this;
          readyState = true;
          filterOption.set({curpage: 0});
          var $element = $('#loadMember');
          
          $(".profile-loader").show();
        
          $element.attr("data-index",1);
          $element.attr("data-currPage",0);
        
          this.searchpagesMenuMaster.fetch({ headers:{
              'contentType':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
              } ,add: true, remove: false, merge: false,error: selfobj.onErrorHandler ,type:'post', data:filterOption.attributes}).done(function(res){
                  if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
                  $(".profile-loader").hide();
                  selfobj.render();
              });
      },
      changeMenu:function(e)
      {
        var selfobj= this;
        var menuID = $(e.currentTarget).val();
        this.menuID=menuID;
        filterOption.set({menuID:menuID});
        this.selectedMenu.set({menuID:menuID})
        if(menuID=="")
        {
          this.menuPagesList.reset();
          this.pagesMenuMasterSinglemodel.clear();
          this.filterSearch();
          return;
        } 
        var menudata=this.searchpagesMenuMaster.get(menuID)
        this.pagesMenuMasterSinglemodel.set({
          menuID:menudata.attributes.menuID,
          isPrimary:menudata.attributes.isPrimary,
          isSecondary:menudata.attributes.isSecondary,
          isFooter:menudata.attributes.isFooter,
          menuName:menudata.attributes.menuName})
        // console.log(menudata.attributes.isPrimary)
        this.menuPagesList.fetch({headers: {
            'contentType':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
          },error: selfobj.onErrorHandler,type:'post',data:{menuID:menuID,status:'active',getAll:'Y'}}).done(function(res){
            
            if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
            //console.log(res.data)
            selfobj.render();
            $(".profile-loader").hide();
          });

      },
      handleDropEvent:function(event,ui){

        var selfobj= this;
        var checkisDrag = $(ui.draggable).attr("data-act");

        if(checkisDrag =="no-drag"){
          return;
        }
        var menuID=$('#menuID').val();
        if(menuID=="")
        {
          alert("Please Select Menu");
          return false;
        }
        var pageIDs=[];
        var pageID = $(ui.draggable).attr("data-pageId");
        $('#selected-pages li').each(function(i)
        {
          pageIDs.push($(this).attr("data-pageID"));
        });
        
        if(pageIDs.includes(pageID)){
          return false;
        }
        
        
        var templatePage = _.template(pageLinkEdit);
        var ht = $(ui.draggable).attr("data-pageID");
        console.log('ht changes',ht);
        var item=$('<li>',{class:"dd-item dd3-item classForCloseButton ws-itempage",
            "data-pageID":ht,
            "data-act":"no-drag",
          });
        item.html($("<div class='dd-handle dd3-handle ws-handle'></div><div class='dd3-content ws-newpage'>"+$(ui.draggable).html()+"</div><span class='symbols-outline'><a href='javascript:void(0);' data-pageID="+ht+" class='deletePage'><span class='material-symbols-outlined'>Delete</span></a></span>"+templatePage()));
        $(this).append(item);
        $('.ws-itempage').click(function(e) {
          $('.menu-item-setting').toggle();
        })  
        pageIDs.push(pageID);
        
        var toAddpageIDs = pageIDs.toString();
        var serializedData = window.JSON.stringify($("#dd-selected-pages").nestable('serialize'));
        console.log(serializedData);

        $.ajax({
          url:APIPATH+'updatemenuPagesList',
          method:'POST',
          data:{updatedList:toAddpageIDs,menuID:menuID,pageIDs:serializedData},
          datatype:'JSON',
          beforeSend: function(request) {
            request.setRequestHeader("token",$.cookie('_bb_key'));
            request.setRequestHeader("SadminID",$.cookie('authid'));
            request.setRequestHeader("contentType",'application/x-www-form-urlencoded');
            request.setRequestHeader("Accept",'application/json');
          },
          success:function(res){
            if(res.flag == "F")
              alert(res.msg);

            if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
            if(res.flag == "S"){
            
            }
            setTimeout(function(){
                $(event.currentTarget).html(status);
            }, 3000);
            
          }
        }); 
          
      },

      savePostions:function()
      {
        
        var selfobj=this;
        var positions=[];
        $('.updated').each(function(){
          positions.push([$(this).attr('data-index'),$(this).attr('data-position')])
          $(this).removeClass('updated');
        })
        var positionsToSave = positions;
        
        var action="changePositions";
        
        var serializedData = window.JSON.stringify($("#dd-selected-pages").nestable('serialize'));
        console.log(serializedData);
        var menuID=$('#menuID').val();
        $.ajax({
              url:APIPATH+'menuPagesMaster/updatePositions',
              method:'POST',
              data:{positions:positionsToSave,action:action,menuID:menuID,pageIDs:serializedData},
              datatype:'JSON',
              beforeSend: function(request) {
                // $(e.currentTarget).html("<span>Updating..</span>");
                request.setRequestHeader("token",$.cookie('_bb_key'));
                request.setRequestHeader("SadminID",$.cookie('authid'));
                request.setRequestHeader("contentType",'application/x-www-form-urlencoded');
                request.setRequestHeader("Accept",'application/json');
              },
              success:function(res){
                if(res.flag == "F")
                  alert(res.msg);

                if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
                if(res.flag == "S"){
                selfobj.menuPagesList.fetch({headers: {
                  'contentType':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
                },error: selfobj.onErrorHandler,type:'post',data:{menuID:selfobj.menuID,status:'active',getAll:'Y'}}).done(function(res){
                  
                  if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
                  selfobj.render()
                  $(".profile-loader").hide();
                });
                $(".profile-loader").hide();
                }
                setTimeout(function(){
                    // $(e.currentTarget).html(status);
                }, 3000);
                
              }
            });
        
      },
      render: function(){
          var selfobj= this;
          var template = _.template(pagesMenuMasterTemp);
          
          this.$el.html(template({singleMenuDetails:this.pagesMenuMasterSinglemodel.attributes,selectedMenu:this.selectedMenu,searchpagesMenuMaster:this.searchpagesMenuMaster.models,pagesList:this.pagesList.models,menuPagesList:this.menuPagesList.models}));
          $(".main_container").append(this.$el);
          $("body").find(".drag-drop-item").draggable({
          cursor: 'move',
          containment: 'document',
          helper:"<p>hello here</p>",
          // stop: handleDragStop,  
          });
          $("body").find("#selected-pages").droppable({
                  hoverClass: "ws-hovered",
                  cancel:".ui-state-default",
                  drop: selfobj.handleDropEvent,
                  draggable: 'disable',
          });
          $('.dd').nestable({
            maxDepth: 2,
            group: $(this).prop('id')
          });
          $('.dd').on('change', function () {
              var $this = $(this);
              var serializedData = window.JSON.stringify($(this).nestable('serialize'));
              setTimeout(function(){selfobj.savePostions();}, 100);
              
          });
          // $("body").find( "#dd-selected-pages" ).sortable();
          return this;
      }
  });
    return pagesMenuMasterView;
  });