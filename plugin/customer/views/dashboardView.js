define([
  'jquery',
  'underscore',
  'backbone',
  'custom',
  'Swal',
  'moment',
  "../../core/views/multiselectOptions",
  "../../core/views/timeselectOptions",
  '../../project/views/projectViewOther',
  '../models/dashboardModel',
  '../views/customerSingleView',
  '../models/customerSingleModel',
  '../../task/collections/historyCollection',
  '../../task/views/taskViewDashbord',
  '../../taxInvoice/views/taxInvoiceView',
  'text!../templates/dashboard_temp.html',

], function ($, _, Backbone, custom, Swal, moment, multiselectOptions, timeselectOptions, projectViewOther, dashboardModel, customerSingleView, customerSingleModel, historyCollection, taskViewDashbord, taxInvoiceView, dashBoard_temp ) {

  var dashboardView = Backbone.View.extend({
    model: dashboardModel,
    tagName: "div",
    customerName:"",
    initialize: function (options) {
      this.customerID = options.action;
      this.multiselectOptions = new multiselectOptions();
      this.customerModel = new customerSingleModel();
      this.timeselectOptions = new timeselectOptions();
      this.menuId = options.menuId;
      var selfobj = this;
      if (this.customerID != "") {
        this.customerModel.set({ customer_id: this.customerID });
        this.customerModel.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          },data:{menuId:this.menuId}, error: selfobj.onErrorHandler
        }).done(function (res) {
          var birthDate = selfobj.customerModel.get("birth_date");
          if (birthDate != null && birthDate != "0000-00-00") {
            selfobj.customerModel.set({ "birth_date": moment(birthDate).format("DD-MM-YYYY") });
          }
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          $(".popupLoader").hide();
          // selfobj.render();
        });
      }
      
      this.historyList = new historyCollection();
        this.historyList.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler, type: 'post', data: { getAll: 'Y', status: "active", task_id:selfobj.customerID}
        }).done(function (res) {
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          $(".popupLoader").hide();
          selfobj.preparetime();
          // selfobj.render();
        });
    },
    events:
    {
      "change .saveOtherDetail": "updateDetails",
      "click .getPaymentData": "getPaymentDetails",
      "click .showOverlay": "showOverlay",
      "click .loadview" : "loadSubView",
      "click .tablinks": "tablinks",
      "click .multiSel": "setValues",
    },
    onErrorHandler: function (collection, response, options) {
      alert("Something was wrong ! Try to refresh the page or contact administer. :(");
      $(".profile-loader").hide();
    },
    addOne: function (objectModel) {
      console.log(this.model);
    },
    preparetime: function () {
      let selfobj = this;
      var models = this.historyList.models;
      for (var i = 0; i < models.length; i++) {
        var model = models[i];
        var timestamp = model.get('activity_date');
        selfobj.timeselectOptions.displayRelativeTime(timestamp);
        model.set({ "timeString": selfobj.timeselectOptions.displayRelativeTime(timestamp) });
      }
      this.customerName = this.customerModel.get('name');
      this.render();
    },
    updateNote: function (e) {
      var note = $(e.currentTarget).val();
      this.model.set({ note: note });
    },
    loadSubView:function(e){
      var show = $(e.currentTarget).attr("data-view");
      switch(show){
        case "singlecustomerview":{
          var customer_id = $(e.currentTarget).attr("data-customer_id");
          new customerSingleView({customer_id: customer_id,loadfrom:"dashboard", searchCustomer:this, menuId: this.menuId });
          break;
        }
      }
    },

    showOverlay: function (e) {
      var view = $(e.currentTarget).data("view");
      switch (view) {
        
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

    refreshDashboard: function(customerID){
      let selfobj = this;
      this.customerModel.set({ customer_id: customerID });
      this.customerModel.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        },data:{menuId:this.menuId}, error: selfobj.onErrorHandler
      }).done(function (res) {
        var birthDate = selfobj.customerModel.get("birth_date");
        if (birthDate != null && birthDate != "0000-00-00") {
          selfobj.customerModel.set({ "birth_date": moment(birthDate).format("DD-MM-YYYY") });
        }
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        selfobj.render();
      });
    },

    tablinks:function(e){
      let selfobj = this;
      let ctab = $(e.currentTarget).attr("data-type");
      $(".tablinks").removeClass("active");
      $(".taskcard").hide();
      $(e.currentTarget).addClass("active");
      $("#"+ctab).show();
      if(ctab =="projects"){
        $("#projectListOther").empty();
        $("#invoice").hide();
        new projectViewOther({ action:"", customerID: selfobj.customerID, loadFrom:"dashboard"});
      }else if(ctab =="task"){
        $("#invoice").hide();
        new taskViewDashbord({ action:"", customerID: selfobj.customerID, custName: this.customerName});
      }else if(ctab == "invoice"){
        $("#invoice").empty();
        new taxInvoiceView({action: "", customerID: selfobj.customerID, loadFrom: "custDashboardInvoice"}) 
      }
    }, 

    setValues: function (e) {
      var selfobj = this;
      var da = selfobj.multiselectOptions.setCheckedValue(e);
      selfobj.model.set(da);


    },

    render: function () {
      var template = _.template(dashBoard_temp);
      var res = template({"customerModel":this.customerModel,"historyList":this.historyList.models});
      this.$el.html(res);
      $(".app_playground").append(this.$el);
      new taskViewDashbord({ action:"", customerID: this.customerID, custName: this.customerName}); 
      return this;
    },


  });

  return dashboardView;

});
