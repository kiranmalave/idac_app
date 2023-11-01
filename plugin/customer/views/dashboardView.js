define([
    'jquery',
    'underscore',
    'backbone',
    'custom',
    'Swal',
    "../../core/views/multiselectOptions",
    '../models/dashboardModel',
    '../views/customerSingleView',
    '../models/customerSingleModel',
    '../../project/views/projectSingleView',
    '../../proposal/views/proposalView',
    '../../task/views/taskViewDashbord',
    '../../project/views/projectViewOther',
    '../../taxInvoice/views/taxInvoiceSingleView',
    'text!../templates/dashboard_temp.html',
  
  ], function ($, _, Backbone, custom, Swal,multiselectOptions, dashboardModel, customerSingleView, customerSingleModel, projectSingleView,proposalView, taskViewDashbord,projectViewOther, taxInvoiceSingleView, dashBoard_temp, ) {
  
    var dashboardView = Backbone.View.extend({
      model: dashboardModel,
      tagName: "div",
      initialize: function (options) {
        var customerID = options.action;
        this.customerID = customerID;
        this.multiselectOptions = new multiselectOptions();
        this.customerModel = new customerSingleModel();
        var selfobj = this;
        if (this.customerID != "") {
          this.customerModel.set({ customer_id: this.customerID });
          this.customerModel.fetch({
            headers: {
              'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
            }, error: selfobj.onErrorHandler
          }).done(function (res) {
            var birthDate = selfobj.customerModel.get("birth_date");
            if (birthDate != null && birthDate != "0000-00-00") {
              selfobj.customerModel.set({ "birth_date": moment(birthDate).format("DD-MM-YYYY") });
            }
            if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
            $(".popupLoader").hide();
            selfobj.render();
          });
        }
        console.log(this.customerModel);
        // // Initialize Firebase with your configuration
        // var firebaseConfig = {
        //   // Your Firebase SDK configuration (apiKey, authDomain, projectId, etc.)
        //   apiKey: "AIzaSyDGsdUFgZH7tkQk-yHt4JsPgXgcjAHSapo",
        //   authDomain: "webtrix-lms.firebaseapp.com",
        //   projectId: "webtrix-lms",
        //   storageBucket: "webtrix-lms.appspot.com",
        //   messagingSenderId: "140200796617",
        //   appId: "1:140200796617:web:cb314103d25656e2ddc818",
        //   measurementId: "G-0L0F0RCHNH"
        // };
  
        // firebase.initializeApp(firebaseConfig);
        // console.log(firebase);
        // if (Notification.permission !== 'granted') {
        //   Notification.requestPermission().then(function (permission) {
        //     if (permission === 'granted') {
        //       // Permission granted, proceed to retrieve the token
        //       firebase.messaging().getToken({ vapidKey: 'BPfO4kBqwQJbi2A8lMZ2oe5GrhT9jaIeLUE5DvtRc5OlwZVps3lCnMun-eeKKWOvPyIfFIH0FUrJPAfgkS5JRO0' })
        //         .then(function (token) {
        //           console.log(token);
        //           // Send the token to your server and store it in the database
        //           // ...
        //         })
        //         .catch(function (error) {
        //           console.error('Error retrieving the token:', error);
        //         });
        //     } else {
        //       console.error('Permission denied for notifications');
        //     }
        //   });
        // } else {
        //   // Permission already granted, proceed to retrieve the token
        //   firebase.messaging().getToken({ vapidKey: 'BPfO4kBqwQJbi2A8lMZ2oe5GrhT9jaIeLUE5DvtRc5OlwZVps3lCnMun-eeKKWOvPyIfFIH0FUrJPAfgkS5JRO0' })
        //     .then(function (token) {
        //       console.log(token);
        //       $.ajax({
        //         url: APIPATH + 'uToken',
        //         method: 'POST',
        //         data: { fToken: token, adminID: $.cookie('authid') },
        //         datatype: 'JSON',
        //         beforeSend: function (request) {
        //           request.setRequestHeader("token", $.cookie('_bb_key'));
        //           request.setRequestHeader("SadminID", $.cookie('authid'));
        //           request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
        //           request.setRequestHeader("Accept", 'application/json');
        //         },
        //         success: function (res) {
        //           if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        //           //showResponse(e, res, "Save");
        //         }
        //       });
        //       // Send the token to your server and store it in the database
        //       // ...
        //     })
        //     .catch(function (error) {
        //       console.error('Error retrieving the token:', error);
        //     });
        // }
        // const messaging = "";
        // // Request permission for push notifications
        // firebase.messaging().requestPermission().then(function () {
        //   console.log('Notification permission granted.');
        //   //messaging = firebase.messaging();
        // }).catch(function (error) {
        //   console.error('Notification permission denied:', error);
        // });
  
  
        // Retrieve the registration token (user_device_token)
        // firebase.messaging().getToken({ vapidKey: 'BP0lhiSevOZ7KVa6LLh3mfZQnrbZaI1crAgO8jO6b6Rv4bvDRpPf8d03f1xczwma7KxonlbQVDmK7G5sm31P' })
        //   .then(function (token) {
        // Send the 'token' to your server and store it in your database
        // Use an HTTP request or any other method of sending the token back to your server
        // for storing it in the database.
        // Example: Send the token via POST request to your server's endpoint
        //console.log(token);
        // fetch('/store-token-endpoint', {
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/json',
        //   },
        //   body: JSON.stringify({ token: token }),
        // })
        // .then(function (response) {
        //   if (response.ok) {
        //     console.log('Token stored in the database successfully');
        //   } else {
        //     console.error('Token storage failed');
        //   }
        // })
        // .catch(function (error) {
        //   console.error('Error storing the token:', error);
        // });
        // })
        // .catch(function (error) {
        //   console.error('Error retrieving the token:', error);
        // });
        //   }
        // });
  
        selfobj = this;
       // selfobj.render();
      },
      events:
      {
        "change .saveOtherDetail": "updateDetails",
        "click .getPaymentData": "getPaymentDetails",
        "click .showOverlay": "showOverlay",
        "click .loadview" : "loadSubView",
        "click .tablinks": "tablinks",
        "click .openTable": "showTable",
        "click .backbutton": "backBtn",
        "click .multiSel": "setValues",
        
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
      loadSubView:function(e){
        var show = $(e.currentTarget).attr("data-view");
        switch(show){
          case "singlecustomerview":{
            var customer_id = $(e.currentTarget).attr("data-customer_id");
            new customerSingleView({customer_id: customer_id,loadfrom:"dashboard"});
            break;
          }
          case "singleprojectview":{
            var project_id = $(e.currentTarget).attr("data-project_id");
            new projectSingleView({project_id: project_id,loadfrom:"dashboard"});
            break;
          }

          case "singletaxinvoiceview":{
            var invoiceID = $(e.currentTarget).attr("data-invoiceID");
            new taxInvoiceSingleView({invoiceID: invoiceID,loadfrom:"dashboard"});
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
  
      tablinks:function(e){
        let selfobj = this;
        let ctab = $(e.currentTarget).attr("data-type");
        $(".tablinks").removeClass("active");
        $(".taskcard").hide();
        $(e.currentTarget).addClass("active");
        $("#"+ctab).show();
        if(ctab =="projects"){
          $("#projectListOther").empty();
          new projectViewOther({ action:""});
        }else if(ctab =="task"){
          new taskViewDashbord({ action:"", customerID: selfobj.customerID});
        }
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
  
      showTable:function(e){
        var element = document.querySelector(".addFlex");
        element.classList.add("hideFolder");
        var element = document.querySelector(".hideTable");
        element.classList.add("ShowTable"); 
        
        var element = document.querySelector(".hideheader");
        element.classList.add("headerHide"); 
        console.log("showtable");  
        new proposalView({loadFrom:'dashboard'});

      },
  
      // backBtn:funtion(e){
      
      // },
  
      backBtn:function(){
         var element = document.querySelector(".addFlex");
            element.classList.remove("hideFolder");
         var element = document.querySelector(".hideTable");
            element.classList.remove("ShowTable");
            var element = document.querySelector(".hideheader");
        element.classList.remove("headerHide"); 
      },

      setValues: function (e) {
        var selfobj = this;
        var da = selfobj.multiselectOptions.setCheckedValue(e);
        selfobj.model.set(da);


      },
  
      render: function () {
        var template = _.template(dashBoard_temp);
        var res = template({"customerModel":this.customerModel});
        this.$el.html(res);
        $(".app_playground").append(this.$el);
        // new taskView({ action: "",loadFrom:"other"});
        new taskViewDashbord({ action:"", customerID: this.customerID}); 
        return this;
      },
  
  
    });
  
    return dashboardView;
  
  });
  