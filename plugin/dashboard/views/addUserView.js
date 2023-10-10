define([
    'jquery',
    'underscore',
    'backbone',
    'custom',
    'text!../templates/addUser_temp.html',
  ], function($,_, Backbone,custom,addUser){
  
  var filterdataView = Backbone.View.extend({
      tagName: "div",
      initialize: function(options){
        selfobj = this;
        selfobj.render();
      },
      events:
      {
          "change .saveOtherDetail": "updateDetails",
          "click .getPaymentData": "getPaymentDetails",
      },
      onErrorHandler: function(collection, response, options){
          alert("Something was wrong ! Try to refresh the page or contact administer. :(");
          $(".profile-loader").hide();
      },
      render: function(){
        var isexits = checkisoverlay("addUserView");
        if(!isexits){
          var template = _.template(addUser);
          var res = template();
          this.$el.addClass("overlay");
          this.$el.addClass("addUserView");
          this.$el.data("current","yes");
          this.$el.html(res);
          $(".overlay-main-container").append(this.$el);
        }
          rearrageOverlays();
          return this;
      },
  });
  
    return filterdataView;
    
  });
  