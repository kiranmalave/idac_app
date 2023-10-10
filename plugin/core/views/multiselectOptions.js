
define([
  'jquery',
  'underscore',
  'backbone',
], function ($, _, Backbone) {

  var multiselectOptions = Backbone.View.extend({

    setValues: function (setvalues, obj) {
      $.each(setvalues, function (key, value) {
        var modval = obj.model.get(value);
        if (modval != null) {
          var modeVal = modval.split(",");
        } else { var modeVal = {}; }

        $(".item-container li." + value).each(function () {
          var currentval = $(this).attr("data-value");
          var selecterobj = $(this);
          $.each(modeVal, function (key, dbvalue) {
            if (dbvalue.trim().toLowerCase() == currentval.toLowerCase()) {
              $(selecterobj).addClass("active");
            }
          });
        });
      });
    },
    setCheckedValue: function (e) {

      var issinglecheck = $(e.currentTarget).attr("data-single");

      if (issinglecheck == undefined) { var issingle = "Y"; } else { issingle = issinglecheck; }
      if (issingle == "Y") {
        var newsetval = [];
        var classname = $(e.currentTarget).attr("class").split(" ");
        newsetval["" + classname[0]] = $(e.currentTarget).attr("data-value");
        return newsetval;
      }

      if (issingle.trim() == "N") {
        setTimeout(function () {
          var newsetval = [];
          var objectDetails = [];
          var classname = $(e.currentTarget).attr("class").split(" ");
          $(".item-container li." + classname[0]).each(function () {
            // alert(classname[0]);
            var isclass = $(this).hasClass("active");
            if (isclass) {
              var vv = $(this).attr("data-value");
              newsetval.push(vv);
            }
          });
          if (0 < newsetval.length) {
            var newsetvalue = newsetval.toString();
          }
          else { var newsetvalue = ""; }
          // alert(newsetvalue);
          objectDetails["" + classname[0]] = newsetvalue;
          return objectDetails;
        }, 100);
      }
    },
  });

  return multiselectOptions;

});
