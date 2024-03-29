
define([
    'jquery',
    'underscore',
    'backbone',
    'moment',
  ], function ($, _, Backbone, moment) {
    
    var moduleDefaultSettings = Backbone.View.extend({
     
        initialize: function (options) {
            var selfobj = this;
        },

        onErrorHandler: function (collection, response, options) {
            alert("Something was wrong ! Try to refresh the page or contact administer. :(");
            $(".profile-loader").hide();
        },

        setModuleDefaultView: function (menuID,moduleView,tableStructure) {
            var selfobj = this;
            // console.log("menuID",menuID);
            // console.log("moduleView",moduleView);
            // console.log("tableStructure",tableStructure);
            var jsonForm = {};
            jsonForm[menuID] = {
                displayView: moduleView,
                tableStructure: tableStructure
            };
            // console.log("jsonForm...",jsonForm);
            var jsonForm = JSON.stringify(jsonForm); 
            localStorage.setItem("user_setting", jsonForm);
            // console.log(localStorage.getItem('user_setting'));
        
            $.ajax({
                url: APIPATH + 'setModuleDefaultView',
                method: 'POST',
                data: { 'jsonForm' : jsonForm},
                datatype: 'JSON',
                beforeSend: function (request) {
                  request.setRequestHeader("token", $.cookie('_bb_key'));
                  request.setRequestHeader("SadminID", $.cookie('authid'));
                  request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
                  request.setRequestHeader("Accept", 'application/json');
                },
                success: function (res) {
                  if (res.flag == "F")
                    alert(res.msg);
    
                  if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
                  if (res.flag == "S") {
                    
                    console.log('success..!');
    
                  }
    
                }
              });
        },
     
    });
    return moduleDefaultSettings;
  });
  