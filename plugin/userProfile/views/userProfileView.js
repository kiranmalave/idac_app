define([
  'jquery',
  'underscore',
  'backbone',
  'validate',
  'inputmask',
  'moment',
  'slim',
  'locationpicker',
  '../../readFiles/views/readFilesView',
  '../models/userProfileModel',
  'text!../templates/userProfileTemp.html',
  '../../userRole/collections/userRoleCollection',
], function ($, _, Backbone, validate, inputmask, moment, slim, locationpicker, readFilesView, userProfileModel, userProfileTemp ,userRoleCollection) {

  var infoSingleView = Backbone.View.extend({
    model: userProfileModel,
    initialize: function (options) {
      var selfobj = this;
      $(".modelbox").hide();
      $('#infoDetails').remove();
      $(".popupLoader").show();
      this.model = new userProfileModel();
      
      this.userRoleList = new userRoleCollection();
      this.userRoleList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, data: { getAll: 'Y', status: "active" }
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        selfobj.model.set("userRoleList", res.data);
        selfobj.render();
      });

      this.model.set({ adminID: $.cookie('authid') })
      this.model.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler
      }).done(function (res) {
        var bDate = selfobj.model.get("dateOfBirth");
        if (bDate !== undefined && bDate !== "0000-00-00") {
          selfobj.model.set({ "dateOfBirth": moment(bDate).format("DD/MM/YYYY") });
          selfobj.render();
          selfobj.setValues();
        }
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        selfobj.render();

      });
    },
    events:
    {
      "click .saveUserDetails": "saveUserDetails",
      "click .item-container li": "setValues",
      "blur .txtchange": "updateOtherDetails",
      "change .multiSel": "setValues",
      "change .bDate": "updateOtherDetails",
      "change .dropval": "updateOtherDetails",
      "click  .chageIcon": "chageIcon",
      "change .fileAdded": "updateImage",
      "click #address": "showlocation",
      "click .loadMedia": "loadMedia",
    },
    onErrorHandler: function (collection, response, options) {
      alert("Something was wrong ! Try to refresh the page or contact administer. :(");
      $(".profile-loader").hide();
    },

    updateImage: function (e) {
      var ob = this;
      var toID = $(e.currentTarget).attr("id");
      var value = $(e.currentTarget).attr("value");
      var newdetails = [];
      var reader = new FileReader();
      reader.onload = function (e) {
        document.getElementById("output").src = e.target.result;
        $("#output").show();
        newdetails["" + toID] = reader.result;
        ob.model.set(newdetails);
        console.log(newdetails);
      };
      // read the image file as a data URL.
      reader.readAsDataURL(e.currentTarget.files[0]);
    },

    chageIcon: function (e) {
      var currentval = $("#password").attr("type");
      if (currentval == "password") {
        this.model.set({ eyeIcon: "fa fa-eye", inputType: "text" })
      }
      if (currentval == "text") {
        this.model.set({ eyeIcon: "fa fa-eye-slash", inputType: "password" })
      }
      this.render();

    },
    getSelectedFile: function (url) {
      $('.' + this.elm).val(url);
      $('.' + this.elm).change();
      $("#profile_pic_view").attr("src", url);
      $("#profile_pic_view").css({ "max-width": "100%" });
      $('#largeModal').modal('toggle');
      this.model.set({ "photo": url });
      console.log(this.model);
    },
    loadMedia: function (e) {
      e.stopPropagation();
      $('#largeModal').modal('toggle');
      this.elm = "profile_pic";
      var menusingleview = new readFilesView({ loadFrom: "addpage", loadController: this });
    },
    updateOtherDetails: function (e) {
      var valuetxt = $(e.currentTarget).val();
      var toID = $(e.currentTarget).attr("id");
      var newdetails = [];
      newdetails["" + toID] = valuetxt;
      this.model.set(newdetails);
      console.log(this.model);
    },
    setValues: function (e) {
      setvalues = ["adminID"];
      var selfobj = this;
      $.each(setvalues, function (key, value) {
        var modval = selfobj.model.get(value);
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
      setTimeout(function () {
        if (e != undefined && e.type == "click") {
          var newsetval = [];
          var objectDetails = [];
          var classname = $(e.currentTarget).attr("class").split(" ");
          $(".item-container li." + classname[0]).each(function () {
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

          objectDetails["" + classname[0]] = newsetvalue;
          $("#valset__" + classname[0]).html(newsetvalue);
          selfobj.model.set(objectDetails);
          console.log(classname[0]);
          console.log(selfobj.model);
        }
      }, 500);
    },
    ////LocationMap ////
    showlocation: function () {
      var selfobj = this;
      $(".memberLocation").show();
      // ------locationpicker-----------
      $('#memberLocation').locationpicker({
        location: {
          latitude: selfobj.model.attributes.latitude,
          longitude: selfobj.model.attributes.longitude
        },
        center: {
          latitude: 21.7679,
          longitude: 78.8718
        },
        addressFormat: 'postal_code',
        radius: 500,
        zoom: 5,
        inputBinding: {
          locationNameInput: $('#address'),
        },
        enableAutocomplete: true,
        markerIcon: 'images/map-marker-2-xl.png',
        markerDraggable: true,
        markerVisible: true,
        onchanged: function (currentLocation, radius, isMarkerDropped) {
          var addressComponents = $(this).locationpicker('map').location.addressComponents;
          var loc = addressComponents.addressLine1 + " " + addressComponents.city + " " + addressComponents.stateOrProvince + " " + addressComponents.country;
          selfobj.model.set({ latitude: $(this).locationpicker('map').location.latitude });
          selfobj.model.set({ longitude: $(this).locationpicker('map').location.longitude });
          selfobj.model.set({ address: loc });
          $('#address').val(loc);
          $(".memberLocation").hide();
        }
      });
      // --------------------------------------
    },
    ///////////////////
    saveUserDetails: function (e) {
      e.preventDefault();
      var bid = this.model.get("adminID");
      console.log(bid)
      if (bid != "0" || bid == "") {
        var methodt = "POST";
      } else {
        console.log("here")
        var methodt = "PUT";
      }
      if ($("#userProfileDetails").valid()) {
        var selfobj = this;
        $(e.currentTarget).html("<span>Saving..</span>");
        $(e.currentTarget).attr("disabled", "disabled");
        this.model.save({}, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler, type: methodt
        }).done(function (res) {
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          if (res.flag == "F") {
            alert(res.msg);
            $(e.currentTarget).html("<span>Error</span>");
          } else {
            $(e.currentTarget).html("<span>Saved</span>");
            //scanDetails.filterSearch();
          }
          setTimeout(function () {
            $(e.currentTarget).html("<span>Save</span>");
            $(e.currentTarget).removeAttr("disabled");
          }, 3000);
        });
      }
    },
    initializeValidate: function () {
      var selfobj = this;
      $("#userProfileDetails").validate({
        rules: {
          photo: {
            required: true,
          },
          contactNo: {
            required: true,
            minlength: 10,
            maxlength: 10,
          },
          whatsappNo: {
            minlength: 10,
            maxlength: 10,
          }
        },
        messages: {
          photo: "Require photo size should be less than 1MB",
          contactNo: "Please enter atleast 10 characters",
          whatsappNo: "Please enter at least 10 characters",
        }
      });

      $('#dateOfBirth').datepickerBT({
        format: "dd-mm-yyyy",
        todayBtn: "linked",
        clearBtn: true,
        todayHighlight: true,
        endDate: new Date(),
        numberOfMonths: 1,
        autoclose: true,
      }).on('changeDate', function (ev) {
        var valuetxt = $("#dateOfBirth").val();
        selfobj.model.set({ "dateOfBirth": valuetxt });
        //alert(selfobj.model.get("dateOfBirth"));
      });
      // Initialize Slim image cropper
      var slim = $('.slim').slim();

      // Listen for the Slim's onUpload event
      slim.on('slim.upload', function (e, data) {
        // Handle onUpload event here
        console.log('Image has been uploaded.');
        console.log('Uploaded data:', data); // Data contains information about the uploaded image
      });
    },

    render: function () {
      var source = userProfileTemp;
      var template = _.template(source);
      console.log(this.model.attributes);

      this.$el.html(template({ "model": this.model.attributes ,"userRoleList": this.userRoleList.models }));
      $(".main_container").append(this.$el);
      $('#profilepic').slim({
        ratio: '1:1',
        minSize: {
          width: 100,
          height: 100,
        },
        size: {
          width: 100,
          height: 100,
        },
        push: true,
        rotateButton: true,
        service: APIPATH + 'changeProfilePic/' + $.cookie('authid'),
        download: false,

        
        willSave: function (data, ready) {
          //alert('saving!');
          ready(data);
        },
        didUpload: function (error, data, response) {
          var expDate = new Date();
          $(".overlap").css("display", "block");
          var newimage = $("#profilepic").find('img').attr("src");
          var fileName = response.newFileName
          $.cookie('photo', fileName);
          $.cookie('avtar', newimage, { path: COKI, expires: expDate });
          $("#myAccountRight").css("background-image", "url('" + newimage + "')");
        },
        willTransform: function (data, ready) {
          if ($("#profilepic").hasClass("pending")) {
            $(".overlap").css("display", "block");
          } else {
            var expDate = new Date();
            var newimage = $("#profilepic").find('img').attr("src");
            $.cookie('avtar', newimage, { path: COKI, expires: expDate });
            $("#myAccountRight").css("background-image", "url('" + newimage + "')");
          }
          ready(data);
        },
        willRemove: function (data, remove) {
          remove();
          var memberID = $.cookie('authid');
          console.log(data);
          $.ajax({
            url: APIPATH + 'delProfilePic/' + memberID,
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

              if (res.statusCode == 994) { app_router.navigate("bareback-logout", { trigger: true }); }
            }
          });
          remove();
        },
        label: 'Click here to add new image or Drop your image here.',
        buttonConfirmLabel: 'Ok',
        meta: {
          memberID: $.cookie('authid')
        }
      });
      $(".memberLocation").hide();
      
      if(this.model.get('adminID') != null)
      {
        $('.form-line').addClass('focused');
      }
      this.initializeValidate();
      this.setValues();
      return this;
    },
  });

  return infoSingleView;

});
