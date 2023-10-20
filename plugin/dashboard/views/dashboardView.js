define([
  'jquery',
  'underscore',
  'backbone',
  'custom',
  '../models/dashboardModel',
  '../views/filterdataView',
  '../views/addUserView',
  'text!../templates/dashboard_temp.html',
], function ($, _, Backbone, custom, dashboardModel, filterUser, addUserView, dashBoard_temp) {

  var dashboardView = Backbone.View.extend({
    model: dashboardModel,
    tagName: "div",
    initialize: function (options) {

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
      selfobj.render();
    },
    events:
    {
      "change .saveOtherDetail": "updateDetails",
      "click .getPaymentData": "getPaymentDetails",
      "click .showOverlay": "showOverlay",
      
      "click .tablinks": "tablinks",
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
      var template = _.template(dashBoard_temp);
      var res = template();
      this.$el.html(res);
      $(".app_playground").append(this.$el);
      return this;
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
      let ctab = $(e.currentTarget).attr("data-type");
      $(".tablinks").removeClass("active");
      $(".taskcard").hide();
      $(e.currentTarget).addClass("active");
      $("#"+ctab).show();
      
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

  });

  return dashboardView;

});
