define([
  'jquery',
  'underscore',
  'backbone',
  'custom',
  '../models/themeModel',
  'text!../templates/theme_temp.html',
], function ($, _, Backbone, custom, themeModel, theme_temp) {

  var themeView = Backbone.View.extend({
    model: themeModel,
    tagName: "div",
    initialize: function (options) {
      selfobj = this;
      selfobj.render();
    },
    events:
    {
      "change .saveOtherDetail": "updateDetails",
      "click .getPaymentData": "getPaymentDetails",
      "click .showOverlay": "showOverlay",
    },
    onErrorHandler: function (collection, response, options) {
      alert("Something was wrong ! Try to refresh the page or contact administer. :(");
      $(".profile-loader").hide();
    },
    addOne: function (objectModel) {
      console.log(this.model);
    },
    updateNote: function (e) {
      var note = $(e.currentTarget).val();
      this.model.set({ note: note });
    },
    showOverlay: function (e) {
      var view = $(e.currentTarget).data("view");
      switch (view) {
        case "filterDataView": {
          var addadminview = new filterUser();
          break;
        }
        case "addUserView": {
          var accessCompany = new addUserView();
          break;
        }
      }
    },
    render: function () {
      var template = _.template(theme_temp);
      var res = template();
      this.$el.html(res);
      $(".app_playground").append(this.$el);
      return this;
    },
    changeStatusListElement: function (e) {
      var selfobj = this;
      var removeIds = [];
      var status = $(e.currentTarget).attr("data-action");
      var action = "changeStatus";

      $('#clist input:checkbox').each(function () {
        if ($(this).is(":checked")) {
          removeIds.push($(this).attr("data-themeID"));
        }
      });

      $(".action-icons-div").hide();
      $(".memberlistcheck").click(function () {
        if ($(this).is(":checked")) {
          $(".action-icons-div").show(300);
        } else {
          $(".action-icons-div").hide(200);
        }
      });


      var idsToRemove = removeIds.toString();
      if (idsToRemove == '') {
        alert("Please select at least one record.");
        return false;
      }
    },
    getBannersDetails: function (e) {
      $.ajax({
        url: APIPATH + 'bannersCountDetails/',
        method: 'GET',
        data: {},
        datatype: 'JSON',
        beforeSend: function (request) {
          $(e.currentTarget).find("i").addClass("rotating");
          request.setRequestHeader("token", $.cookie('_bb_key'));
          request.setRequestHeader("SadminID", $.cookie('authid'));
          request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
          request.setRequestHeader("Accept", 'application/json');
        },
        success: function (res) {

          $.each(res.data, function (key, val) {
            $(".bannersinfo__" + key).html(val);
          });
          $(e.currentTarget).find("i").removeClass("rotating");

        }
      });
    },
    render: function () {
      var template = _.template(theme_temp);
      this.$el.html(template());


      $(".app_playground").append(this.$el);
      return this;
    }

  });

  return themeView;

});
