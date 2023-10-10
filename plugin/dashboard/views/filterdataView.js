define([
    'jquery',
    'underscore',
    'backbone',
    'custom',
    'text!../templates/filterUser.html',
  ], function($,_, Backbone,custom,filterUser){
  
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
            var isexits = checkisoverlay("filterDataView");
            if(!isexits){
            var template = _.template(filterUser);
            var res = template();
            this.$el.addClass("overlay");
            this.$el.addClass("filterDataView");
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
  