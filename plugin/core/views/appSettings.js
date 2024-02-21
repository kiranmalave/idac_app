
define([
    'jquery',
    'underscore',
    'backbone',
    'moment',
    '../../menu/models/singleMenuModel',
  ], function ($, _, Backbone, moment, singleMenuModel) {
    
    var appSettings = Backbone.View.extend({
      parentObj : {},
        filterOption : {},
        menuCollection : {},
        initialize: function (options) {
            var selfobj = this;
            if(options){
                selfobj.parentObj = options.parentObj;
                selfobj.filterOption = options.filterOption ? options.filterOption : '';
                selfobj.menuCollection = options.menuCollection ? options.menuCollection : '';
            }
        },

      onErrorHandler: function (collection, response, options) {
          alert("Something was wrong ! Try to refresh the page or contact administer. :(");
          $(".profile-loader").hide();
      },

      getMenuList: function (menuID, callback) {
          let selfobj = this;
          var label = null;
          selfobj.menuList = new singleMenuModel();
          selfobj.menuList.set({"menuID":menuID});
          selfobj.menuList.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          },error: selfobj.onErrorHandler
          }).done(function (result) {
              if (result.statusCode == 994) {app_router.navigate("logout", { trigger: true });}
              $(".popupLoader").hide();
              if(result.data[0]){
                  plural_label = result.data[0].plural_label;
                  module_desc = result.data[0].module_desc;
                  form_label = result.data[0].label;
                  // Pass the label to the callback
                  callback(plural_label,module_desc,form_label,result);
              }
      })},   
      
      sidebarUpdate: function(){
        let selfobj = this;
        if(selfobj.parentObj){
            selfobj.parentObj.recordCount = 0;
            selfobj.parentObj.collection.reset();
            selfobj.parentObj.collection.fetch({
              headers: {
                'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
              }, error: selfobj.parentObj.onErrorHandler, type: 'post',data: selfobj.parentObj.filterOption ? selfobj.parentObj.filterOption.attributes : ''
            }).done(function (res) {
              if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
              $(".profile-loader").hide();
              if (res.flag == "S") {
                  ISMENUSET = res.data;
                  console.log("ISMENUSET",res.data);
                  var sidebarTemplate = _.template(SIDEBAR);
                  $("#leftsidebarSection").remove();
                  $(".main_container").append(sidebarTemplate({ menuDetails: ISMENUSET }));
                  // selfobj.parentObj.resetModel();
              }
            });
        }else{
            selfobj.menuCollection.reset();
            selfobj.menuCollection.fetch({
              headers: {
                'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
              }, error: selfobj.onErrorHandler, type: 'post',data: selfobj.filterOption ? selfobj.filterOption.attributes : ''
            }).done(function (res) {
              if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
              $(".profile-loader").hide();

              if (res.flag == "S") {
                  ISMENUSET = res.data;
                  console.log("ISMENUSET",res.data);
                  var sidebarTemplate = _.template(SIDEBAR);
                  $("#leftsidebarSection").remove();
                  $(".main_container").append(sidebarTemplate({ menuDetails: ISMENUSET }));
                }

            });
        }
      },
    });
    return appSettings;
  });
  