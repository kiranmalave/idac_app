
define([
  'jquery',
  'underscore',
  'backbone',
  'datepickerBT',
  'moment',
  'Swal',
  '../views/customerSingleView',
  '../views/dashboardView',
  '../../project/views/projectView',
  '../../proposal/views/proposalView',
  '../collections/customerCollection',
  '../models/customerFilterOptionModel',
  'text!../templates/customerRow.html',
  'text!../templates/customer_temp.html',
  'text!../templates/customerFilterOption_temp.html',
], function ($, _, Backbone, datepickerBT, moment, Swal, customerSingleView, dashboardView, projectView, proposalView, customerCollection, customerFilterOptionModel, customerRowTemp, customerTemp, customerFilterTemp) {

  var customerView = Backbone.View.extend({

    initialize: function (options) {
      this.toClose = "customerFilterView";
      var selfobj = this;
      $(".profile-loader").show();
      var mname = Backbone.history.getFragment();
      permission = ROLE[mname];
      //$("#"+mname).addClass("active");
      readyState = true;
      this.render();
      filterOption = new customerFilterOptionModel();
      searchCustomer = new customerCollection();
      searchCustomer.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: filterOption.attributes
      }).done(function (res) {

        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".preloader").hide();
        setPagging(res.paginginfo, res.loadstate, res.msg);
      });

      this.customerList = new customerCollection();
      this.customerList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, data: { status: "active" }
      }).done(function (res) {
        console.log("res..",JSON.stringify(res));
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".preloader").hide();
        // selfobj.render();
      });
      this.collection = searchCustomer;
      this.collection.on('add', this.addOne, this);
      this.collection.on('reset', this.addAll, this);
      /* $(".right_col").on("scroll",function(){
             console.log("wait..");
             selfobj.loadData();
             
         });*/
    },
    events:
    {
      "blur #textval": "setFreeText",
      "change .range": "setRange",
      "change #textSearch": "settextSearch",
      "click .multiOptionSel": "multioption",
      "click .filterSearch": "filterSearch",
      "click #filterOption": "filterRender",
      "click .resetval": "resetSearch",
      "click .loadview": "loadSubView",
      "click .sortColumns": "sortColumn",
      "change .txtchange": "updateOtherDetails",
      "click .changeStatus": "changeStatusListElement",
      "click .showpage": "loadData",
      "change .changeBox": "changeBox",
    },
    updateOtherDetails: function (e) {
      var valuetxt = $(e.currentTarget).val();
      var toID = $(e.currentTarget).attr("id");
      var newdetails = [];
      newdetails["" + toID] = valuetxt;
      filterOption.set(newdetails);
      console.log(filterOption);
    },
    changeBox: function (e) {
      var selVal = $(e.currentTarget).val();
      $(".hidetextval").hide();
      $(".filterClear").val("");
      if (selVal == "searchList") {
        $(".customerList").show();
      } else {
        $(".textvalBox").show();
      }
    },
    settextSearch: function (e) {

      var usernametxt = $(e.currentTarget).val();
      filterOption.set({ textSearch: usernametxt });
    },
    changeStatusListElement: function (e) {

      Swal.fire({
        title: 'Do you want to delete ?',
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: 'Yes',
        denyButtonText: `No`,
      }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
         if (result.isConfirmed) {
         Swal.fire('Deleted!', '', 'success')
         var selfobj = this;
         var removeIds = [];
         var status = $(e.currentTarget).attr("data-action");
         var action = "changeStatus";
         $('#customerList input:checkbox').each(function () {
           if ($(this).is(":checked")) {
             removeIds.push($(this).attr("data-customer_id"));
           }
         });
         $(".deleteAll").hide();
   
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
        $.ajax({
          url: APIPATH + 'customerMaster/status',
          method: 'POST',
          data: { list: idsToRemove, action: action, status: status },
          datatype: 'JSON',
          beforeSend: function (request) {
            //$(e.currentTarget).html("<span>Updating..</span>");
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
            setTimeout(function () {
              $(e.currentTarget).html(status);
            }, 3000);
  
          }
        });
        } else if (result.isDenied) {
        Swal.fire('Changes are not saved', '', 'info')
        $('#customerList input:checkbox').each(function () {
          if ($(this).is(":checked")) {
            $(this).prop('checked', false);
          }
        });
        $(".listCheckbox").find('.checkall').prop('checked', false);
        $(".deleteAll").hide();
         }
      })

     
      
    },

    onErrorHandler: function (collection, response, options) {
      alert("Something was wrong ! Try to refresh the page or contact administer. :(");
      $(".profile-loader").hide();
    },
    loadSubView: function (e) {
      var selfobj = this;
      var show = $(e.currentTarget).attr("data-view");
      // $('.card').empty();
      switch (show) {
        case "singleCustomerData": {
          var customer_id = $(e.currentTarget).attr("data-customer_id");
          new customerSingleView({ customer_id: customer_id, searchCustomer: this });
          break;
        }
        case "singleProjectData": {
          var customer_id = $(e.currentTarget).attr("data-customer_id");
          new projectView({ customer_id: customer_id, searchCustomer: this });
          break;
        }
        case "singleProposalData": {
          var customer_id = $(e.currentTarget).attr("data-customer_id");
          new proposalView({ customer_id: customer_id, searchCustomer: this });
          break;
        }
        case "dashboard":{
          var customer_id = $(e.currentTarget).attr("data-customer_id");
          new dashboardView({ customer_id: customer_id})
          break;
        }
      }
    },
    sortColumn: function (e) {
      var order = $(e.currentTarget).attr("data-value");
      var selfobj = this;
      var newsetval = [];
      $("#clist").find(".up").removeClass("active");
      $("#clist").find(".down").removeClass("active");
      // var classname = $(e.currentTarget).attr("class").split(" ");
      newsetval["order"] = $(e.currentTarget).attr("data-value");
      newsetval["orderBy"] = $(e.currentTarget).attr("data-field");
      if (order == "" || order == "DESC") {
        order = "ASC";
        $(e.currentTarget).find(".down").removeClass("active");
        $(e.currentTarget).find(".up").addClass("active");
      } else {
        order = "DESC";
        $(e.currentTarget).find(".down").addClass("active");
        $(e.currentTarget).find(".up").removeClass("active");
      }
      $(e.currentTarget).attr("data-value", order);
      newsetval["order"] = order;
      newsetval["orderBy"] = $(e.currentTarget).attr("data-field");
      filterOption.set(newsetval);
      selfobj.filterSearch();
    },
    resetSearch: function () {
      //filterOption.set({curpage:0,customer_id:null,textval: null,textSearch:'company_name',status:'active',orderBy:'created_date',order:'DESC'});
      //filterOption.reset();
      filterOption.clear().set(filterOption.defaults);
      $(".multiOptionSel").removeClass("active");
      $(".nav-item").removeClass("active");
      
      // $("#textval").val("");
      // $(".changeBox").val('default');
        // $(".changeBox").selectpicker("refresh");

      $(".filterClear").val("");
      $("#textSearch").val("select");
      $(".hidetextval").hide();
      $('#textSearch option[value=company ]').attr('selected', 'selected');

      this.filterSearch(false);
    },
    loaduser: function () {
      var memberDetails = new singlememberDataModel();
    },
    addOne: function (objectModel) {
      var template = _.template(customerRowTemp);
      $("#customerList").append(template({ customerDetails: objectModel }));
    },
    addAll: function () {
      $("#customerList").empty();
      this.collection.forEach(this.addOne, this);
    },
    filterRender: function (e) {
      var isexits = checkisoverlay(this.toClose);

      if (!isexits) {

        var source = customerFilterTemp;
        var template = _.template(source);

        var cont = $("<div>");
        cont.html(template({"customerList": this.customerList.models }));
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
          make current customer active
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
      rearrageOverlays("Filter", this.toClose, "small");
    },
    setValues: function (e) {
      setvalues = ["status", "type", "order"];
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
      searchCustomer.reset();
      var selfobj = this;
      readyState = true;
      filterOption.set({ curpage: 0 });
      var $element = $('#loadMember');
      $(".profile-loader").show();
      $(".ws_filterOptions").removeClass("open");
      $element.attr("data-index", 1);
      $element.attr("data-currPage", 0);

      searchCustomer.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, add: true, remove: false, merge: false, error: selfobj.onErrorHandler, type: 'post', data: filterOption.attributes
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".profile-loader").hide();

        setPagging(res.paginginfo, res.loadstate, res.msg);
        $element.attr("data-currPage", 1);
        $element.attr("data-index", res.paginginfo.nextpage);

        //$(".page-info").html(recset);
        if (res.loadstate === false) {
          $(".profile-loader-msg").html(res.msg);
          $(".profile-loader-msg").show();
        } else {
          $(".profile-loader-msg").hide();
        }
        selfobj.setValues();
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
        searchCustomer.reset();
        var index = $element.attr("data-index");
        var currPage = $element.attr("data-currPage");

        filterOption.set({ curpage: index });
        var requestData = filterOption.attributes;

        $(".profile-loader").show();
        searchCustomer.fetch({
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
   
    render: function () {
      var template = _.template(customerTemp);
      this.$el.html(template({ closeItem: this.toClose }));
      $(".app_playground").append(this.$el);
      setToolTip();
      return this;
    }
  });

  return customerView;

});
