define([
  'jquery',
  'underscore',
  'backbone',
  'custom',
  '../models/dashboardModel',
  '../views/filterdataView',
  '../views/addUserView',
  '../../task/views/taskView',
  '../../customer/collections/customerCollection',
  '../../project/collections/projectCollection',
  '../../project/views/projectSingleView',
  '../../task/views/taskSingleView',
  '../../customer/views/customerSingleView',
  '../../proposal/views/proposalSingleView',
  'text!../templates/dashbord_temp.html'

], function ($, _, Backbone, custom, dashboardModel, filterUser, addUserView, taskView, customerCollection, projectCollection, projectSingleView, taskSingleView, customerSingleView, proposalSingleView, dashBord_temp) {

  var dashboardView = Backbone.View.extend({
    model: dashboardModel,
    tagName: "div",
    initialize: function (options) {
      var selfobj = this;
      this.model = new dashboardModel();
      selfobj.render();
      this.model.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, data: { getAll: 'Y', status: "active" }
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        selfobj.render();
        new taskView({ loadfrom: "dashboard" });
      });

    },
    events:
    {
      "change .saveOtherDetail": "updateDetails",
      "click .getPaymentData": "getPaymentDetails",
      "click .showOverlay": "showOverlay",
      "click .loadview": "loadSubView",
      "click .tablinks": "tablinks",
      "click .openTable": "showTable",
      "click .backbutton": "backBtn",

    },
    onErrorHandler: function (collection, response, options) {
      alert("Something was wrong ! Try to refresh the page or contact administer. :(");
      $(".profile-loader").hide();
    },
    addOne: function (objectModel) {
      console.log(this.model);
    },
    loadSubView: function (e) {
      var show = $(e.currentTarget).attr("data-view");
      switch (show) {
        case "singleprojectview": {
          var project_id = $(e.currentTarget).attr("data-project_id");
          new projectSingleView({ project_id: project_id, loadfrom: "dashboard", searchproject: this });
          break;
        }

        case "singletaskview": {
          var task_id = $(e.currentTarget).attr("data-task_id");
          new taskSingleView({ task_id: task_id, loadfrom: "dashboard", searchtask: this });
          break;
        }

        case "singleClientview": {
          var customer_id = $(e.currentTarget).attr("data-customer_id");
          new customerSingleView({ customer_id: customer_id, loadfrom: "dashboard", searchCustomer: this });
          break;
        }

        case "proposalSingleView": {
          var proposal_id = $(e.currentTarget).attr("data-proposal_id");
          new proposalSingleView({ proposal_id: proposal_id, loadfrom: "dashboard" });
          break;
        }


      }
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

    tablinks: function (e) {
      let ctab = $(e.currentTarget).attr("data-type");
      $(".tablinks").removeClass("active");
      $(".taskcard").hide();
      $(e.currentTarget).addClass("active");
      $("#" + ctab).show();

      // var i, tabcontent, tablinks;
      // tabcontent = document.getElementsByClassName("card");
      // for (i = 0; i < tabcontent.length; i++) {
      //   tabcontent[i].style.display = "none";
      // }
      // tablinks = document.getElementsByClassName("tablinks");
      // for (i = 0; i < tablinks.length; i++) {
      //   tablinks[i].className = tablinks[i].className.replace(" active", "");
      // }
      // document.getElementById(cityName).style.display = "block";
      // evt.currentTarget.className += " active";
    },

    showTable: function (e) {
      var element = document.querySelector(".addFlex");
      element.classList.add("hideFolder");


      var element = document.querySelector(".hideTable");
      element.classList.add("ShowTable");
    },

    // backBtn:funtion(e){



    backBtn: function () {
      var element = document.querySelector(".addFlex");
      element.classList.remove("hideFolder");
      var element = document.querySelector(".hideTable");
      element.classList.remove("ShowTable");
    },
    render: function () {
      var selfobj = this;
      var template = _.template(dashBord_temp);
      var res = template({ "model": this.model });
      this.$el.html(res);
      $('.number').text(selfobj.recordCount);
      $('.numberProject').text(selfobj.projectCnt);
      $(".app_playground").append(this.$el);
      return this;
    },


  });

  return dashboardView;

});
