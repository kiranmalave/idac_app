define([
  'jquery',
  'underscore',
  'backbone',
  'moment',
  '../views/addAdminView',
  '../views/accessCompanyDetails',
  '../collections/adminCollection',
  '../models/adminFilterOptionModel',
  'text!../templates/adminRow.html',
  'text!../templates/admin_temp.html',
  'text!../templates/adminFilterOption_temp.html',

], function ($, _, Backbone, moment, addAdminView, accessCompanyDetails, adminCollection, adminFilterOptionModel, adminRow, adminTemp, adminFilterOptionTemp) {

  var adminView = Backbone.View.extend({

    initialize: function (options) {
      this.toClose = "adminFilterView";
      var selfobj = this;
      $(".profile-loader").show();
      var mname = Backbone.history.getFragment();
      permission = ROLE[mname];
      readyStatePhoto = true;
      filterOption = new adminFilterOptionModel();
      this.render();
      searchcontact = new adminCollection();
      searchcontact.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: filterOption.attributes
      }).done(function (res) {

        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".profile-loader").hide();
        setPagging(res.paginginfo, res.loadstate, res.msg);

      });

      this.collection = searchcontact;
      this.collection.on('add', this.addOne, this);
      this.collection.on('reset', this.addAll, this);
      /*$(".table-responsive").on("scroll",function(){
          console.log("wait..");
          selfobj.loadData();
      });*/
    },
    events:
    {
      "blur #textval": "setFreeText",
      "change #textSearch": "settextSearch",
      "click .multiOptionSel": "multioption",
      "click #filterSearch": "filterSearch",
      "click #filterOption": "filterRender",
      "click .resetval": "resetSearch",
      "click .loadview": "loadSubView",
      "click .changeStatus": "changeStatusListElement",
      "click .showpage": "loadData",
    },

    settextSearch: function (e) {
      var usernametxt = $(e.currentTarget).val();
      filterOption.set({ textSearch: usernametxt });
    },
    setFreeText: function (e) {
      var usernametxt = $(e.currentTarget).val();
      filterOption.set({ textval: usernametxt });
      console.log(filterOption);
    },

    changeStatusListElement: function (e) {
      var selfobj = this;
      var removeIds = [];
      var status = $(e.currentTarget).attr("data-action");
      if (status == "delete") {
        var r = confirm("Are you sure to delete admin user?");
        if (r == false) {
          return false;
        }
        var action = "delete";
      } else {
        var action = "changeStatus";
      }
      $('#adminlistcheck input:checkbox').each(function () {
        if ($(this).is(":checked")) {
          removeIds.push($(this).attr("data-adminID"));
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
        alert("Please select at least one User.");
        return false;
      }
      console.log(idsToRemove);
      console.log(action);
      $.ajax({
        url: APIPATH + 'admins/status',
        method: 'POST',
        data: { list: idsToRemove, action: action, status: status },
        datatype: 'JSON',
        beforeSend: function (request) {
          $(e.currentTarget).html("<span>Updating..</span>");
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
            selfobj.filterSearch();
          }
          // setTimeout(function () {
          //   $(e.currentTarget).html(status);
          // }, 3000);
          $(".deleteAll").hide();

        }
      });
    },
    onErrorHandler: function (collection, response, options) {
      alert("Something was wrong ! Try to refresh the page or contact administer. :(");
      $(".profile-loader").hide();
    },
    loadSubView: function (e) {
      var selfobj = this;
      var show = $(e.currentTarget).attr("data-view");

      switch (show) {
        case "singleadminData": {
          var adminID = $(e.currentTarget).attr("data-adminID");
          var addadminview = new addAdminView({ adminID: adminID, searchadmin: this });
          break;
        }
        case "accessCompany": {
          var adminID = $(e.currentTarget).attr("data-adminID");
          var accessCompany = new accessCompanyDetails({ adminID: adminID, searchadmin: this });
          break;
        }

      }
    },
    resetSearch: function () {
      filterOption.set({ curpage: 0, textval: null, textSearch: 'userName', status: null, orderBy: 'name', order: 'ASC', fromDate: null, toDate: null, fromDate2: null, toDate2: null });
      $(".multiOptionSel").removeClass("active");
      $("#textval").val("");
      $(".txtchange").val("");
      $('#textSearch option[value=screenName]').attr('selected', 'selected');
      this.filterSearch();
    },
    loaduser: function () {
      var memberDetails = new singlememberDataModel();
    },
    addOne: function (objectModel) {

      var template = _.template(adminRow);
      $("#adminlistcheck").append(template({ adminDetails: objectModel }));
    },
    addAll: function () {
      $("#adminlistcheck").empty();
      this.collection.forEach(this.addOne, this);
    },
    filterRender: function (e) {
      var isexits = checkisoverlay(this.toClose);
      if (!isexits) {
        var source = adminFilterOptionTemp;
        var template = _.template(source);

        var cont = $("<div>");
        cont.html(template());
        cont.attr('id', this.toClose);
        /*  
          INFO
          this line use to hide if any other overlay is open first close it.
        */
        $(".overlay-main-container").removeClass("open");
        // append filter html here
        $(".ws_filterOptions").append(cont);
        /*  
          INFO
          open filter popup by adding class open here
        */
        $(".ws_filterOptions").addClass("open");
        /* 
          INFO
          make current menu active
        */
        $(e.currentTarget).addClass("active");

      } else {
        // check here we alreay open it or not. if open toggle that popup here
        var isOpen = $(".ws_filterOptions").hasClass("open");
        if (isOpen) {
          $(".ws_filterOptions").removeClass("open");
          $(e.currentTarget).removeClass("active");
          return;
        } else {
          $(e.currentTarget).addClass("active");
          // this function will handel other exiting open popus
        }
      }
      this.setValues();
      this.setupFilter();
      rearrageOverlays("Filter", this.toClose, "small");
    },
    setValues: function (e) {
      setvalues = ["status", "orderBy", "order"];
      var selfobj = this;
      $.each(setvalues, function (key, value) {
        var modval = filterOption.get(value);
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
          filterOption.model.set(objectDetails);
        }
      }, 3000);

    },

    multioption: function (e) {
      var selfobj = this;
      var issinglecheck = $(e.currentTarget).attr("data-single");
      if (issinglecheck == undefined) { var issingle = "N" } else { var issingle = "Y" }
      if (issingle == "Y") {
        var newsetval = [];
        var classname = $(e.currentTarget).attr("class").split(" ");
        newsetval["" + classname[0]] = $(e.currentTarget).attr("data-value");
        filterOption.set(newsetval);
      }
      if (issingle == "N") {
        setTimeout(function () {
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
          filterOption.set(objectDetails);
        }, 500);
      }
    },
    filterSearch: function (isClose = false) {
      if (isClose && typeof isClose != 'object') {
        $('.' + this.toClose).remove();
        rearrageOverlays();
      }
      this.collection.reset();
      var selfobj = this;
      readyStatePhoto = true;
      filterOption.set({ curpage: 0 });
      var $element = $('#loadMember');
      $(".profile-loader").show();
      $element.attr("data-index", 1);
      $element.attr("data-currPage", 0);

      this.collection.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, add: true, remove: false, merge: false, error: selfobj.onErrorHandler, type: 'post', data: filterOption.attributes
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".profile-loader").hide();
        setPagging(res.paginginfo, res.loadstate, res.msg);
        $element.attr("data-currPage", index);
        $element.attr("data-index", res.paginginfo.nextpage);
        $(".page-info").html(recset);
        if (res.loadstate === false) {
          $(".profile-loader-msg").html(res.msg);
          $(".profile-loader-msg").show();
        } else {
          $(".profile-loader-msg").hide();
        }
      });
    },

    loadData: function (e) {
      var selfobj = this;
      var $element = $('#loadMember');
      var cid = $(e.currentTarget).attr("data-dt-idx");
      var isdiabled = $(e.currentTarget).hasClass("disabled");
      if (isdiabled) {
        //
      } else {

        $element.attr("data-index", cid);
        searchcontact.reset();
        var index = $element.attr("data-index");
        var currPage = $element.attr("data-currPage");

        filterOption.set({ curpage: index });
        var requestData = filterOption.attributes;

        $(".profile-loader").show();
        searchcontact.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, add: true, remove: false, merge: false, type: 'post', error: selfobj.onErrorHandler, data: requestData
        }).done(function (res) {

          $(".profile-loader").hide();
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }

          setPagging(res.paginginfo, res.loadstate, res.msg);
          $element.attr("data-currPage", index);
          $element.attr("data-index", res.paginginfo.nextpage);
        });
      }
    },
    setupFilter: function () {
      var selfobj = this;
      startDate = $('#fromDate').datepickerBT({
        format: "dd-mm-yyyy",
        todayBtn: "linked",
        clearBtn: true,
        todayHighlight: true,
        StartDate: new Date(),
        numberOfMonths: 1,
        autoclose: true,
      }).on('changeDate', function (ev) {
        $('#fromDate').change();
        var valuetxt = $("#fromDate").val();
        var temp = moment(valuetxt, 'DD-MM-YYYY').valueOf();
        filterOption.set({ fromDate: valuetxt });
        var valuetxt = $("#toDate").val();
        var temp2 = moment(valuetxt, 'DD-MM-YYYY').valueOf();
        if (temp > temp2) {
          $("#toDate").val("");
        }

      });
      endDate = $('#toDate').datepickerBT({
        format: "dd-mm-yyyy",
        todayBtn: "linked",
        clearBtn: true,
        todayHighlight: true,
        numberOfMonths: 1,
        autoclose: true,
      }).on('changeDate', function (ev) {
        $('#toDate').change();
        var valuetxt = $("#toDate").val();
        var temp = moment(valuetxt, 'DD-MM-YYYY').valueOf();
        filterOption.set({ toDate: valuetxt });
        var valuetxt = $("#fromDate").val();
        var temp2 = moment(valuetxt, 'DD-MM-YYYY').valueOf();
        if (temp2 > temp) {
          $("#fromDate").val("");
        }
      });

      startDate = $('#fromDate2').datepickerBT({
        format: "dd-mm-yyyy",
        todayBtn: "linked",
        clearBtn: true,
        todayHighlight: true,
        StartDate: new Date(),
        numberOfMonths: 1,
        autoclose: true,
      }).on('changeDate', function (ev) {
        $('#fromDate2').change();
        var valuetxt = $("#fromDate2").val();
        var temp = moment(valuetxt, 'DD-MM-YYYY').valueOf();
        filterOption.set({ fromDate2: valuetxt });
        var valuetxt = $("#toDate2").val();
        var temp2 = moment(valuetxt, 'DD-MM-YYYY').valueOf();
        if (temp > temp2) {
          $("#toDate2").val("");
        }

      });
      endDate = $('#toDate2').datepickerBT({
        format: "dd-mm-yyyy",
        todayBtn: "linked",
        clearBtn: true,
        todayHighlight: true,
        numberOfMonths: 1,
        autoclose: true,
      }).on('changeDate', function (ev) {
        $('#toDate2').change();
        var valuetxt = $("#toDate2").val();
        var temp = moment(valuetxt, 'DD-MM-YYYY').valueOf();
        filterOption.set({ toDate2: valuetxt });
        var valuetxt = $("#fromDate2").val();
        var temp2 = moment(valuetxt, 'DD-MM-YYYY').valueOf();
        if (temp2 > temp) {
          $("#fromDate2").val("");
        }
      });
    },
    render: function () {
      var template = _.template(adminTemp);
      this.$el.html(template({ closeItem: this.toClose }));
      $(".app_playground").append(this.$el);
      setToolTip();
      return this;
    }
  });

  return adminView;

});
