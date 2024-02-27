
define([
  'jquery',
  'underscore',
  'backbone',
  'datepickerBT',
  '../views/categorySingleView',
  '../collections/categoryCollection',
  '../models/categoryFilterOptionModel',
  'text!../templates/categoryRow.html',
  'text!../templates/category_temp.html',
  'text!../templates/categoryFilterOption_temp.html',
], function ($, _, Backbone, datepickerBT, categorySingleView, categoryCollection, categoryFilterOptionModel, categoryRowTemp, categoryTemp, categoryFilterTemp) {

  var categoryView = Backbone.View.extend({

    initialize: function (options) {
      this.toClose = "categoryFilterView";
      var selfobj = this;
      $(".profile-loader").show();
      var mname = Backbone.history.getFragment();
      permission = ROLE[mname];

      readyState = true;
      this.render();
      filterOption = new categoryFilterOptionModel();
      searchCategory = new categoryCollection();
      searchCategory.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: filterOption.attributes
      }).done(function (res) {

        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".profile-loader").hide();
        setPagging(res.paginginfo, res.loadstate, res.msg);
      });

      this.collection = searchCategory;
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
      "click .extraOptionSel": "extraoption",
      "click .filterSearch": "filterSearch",
      "click #filterOption": "filterRender",
      "click .resetval": "resetSearch",
      "click .loadview": "loadSubView",
      "change .txtchange": "updateOtherDetails",
      "click .changeStatus": "changeStatusListElement",
      "click .showpage": "loadData",
      "click .sortColumns": "sortColumn",
    },
    updateOtherDetails: function (e) {

      var valuetxt = $(e.currentTarget).val();
      var toID = $(e.currentTarget).attr("id");
      var newdetails = [];
      newdetails["" + toID] = valuetxt;
      filterOption.set(newdetails);
    },
    settextSearch: function (e) {
      var usernametxt = $(e.currentTarget).val();
      // if(usernametxt=="parentCatName"){
      //   filterOption.set({textSearch: 'categoryName'});        
      // }
      // else
      filterOption.set({ textSearch: usernametxt });
    },
    changeStatusListElement: function (e) {
      var selfobj = this;
      var removeIds = [];
      var status = $(e.currentTarget).attr("data-action");
      var action = "changeStatus";
      $('#categoryList input:checkbox').each(function () {
        if ($(this).is(":checked")) {
          removeIds.push($(this).attr("data-category_id"));
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
      $.ajax({
        url: APIPATH + 'categoryMaster/status',
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
          // setTimeout(function () {
          $(".deleteAll").hide();
          // }, 3000);

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
        case "singleCategoryData": {
          var category_id = $(e.currentTarget).attr("data-category_id");
          var categorysingleView = new categorySingleView({ category_id: category_id, searchCategory: this });
          break;
        }
      }
    },
    resetSearch: function () {
      //filterOption.set({curpage:0,category_id:null,textval: null,textSearch:'categoryName',status:'active',orderBy:'createdDate',order:'DESC'});
      //filterOption.reset();
      filterOption.clear().set(filterOption.defaults);
      $(".extraOptionSel").removeClass("active");
      $(".multiOptionSel").removeClass("active");
      $("#textval").val("");
      $('#textSearch').prop('selectedIndex', 0);
      $('#textSearch option[value=category_id]').attr('selected', 'selected');
      this.filterSearch(false);
    },
    loaduser: function () {
      var memberDetails = new singlememberDataModel();
    },
    addOne: function (objectModel) {
      var template = _.template(categoryRowTemp);
      $("#categoryList").append(template({ categoryDetails: objectModel }));
    },
    addAll: function () {
      $("#categoryList").empty();
      this.collection.forEach(this.addOne, this);
    },
    filterRender: function (e) {
      var isexits = checkisoverlay(this.toClose);

      if (!isexits) {

        var source = categoryFilterTemp;
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
          make current category active
        */
        $(e.currentTarget).addClass("active");
        // $("#installDateFrom").datepickerBT({
        //   todayBtn:  1,
        //   autoclose: true,
        //   format:"yyyy/mm/dd",
        // }).on('changeDate', function (selected) {
        //   var minDate = new Date(selected.date.valueOf());
        //   $('#installDateTo').datepickerBT('setStartDate', minDate);
        // });

        // $("#installDateTo").datepickerBT({format:"yyyy/mm/dd",autoclose: true})
        //   .on('changeDate', function (selected) {
        //       var minDate = new Date(selected.date.valueOf());
        //       $('#installDateFrom').datepickerBT('setEndDate', minDate);
        // });
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
    extraoption: function (e) {
      var selfobj = this;
      var extraSel = $(e.currentTarget).attr("data-value");
      selfobj.extraSel = extraSel;
      if (extraSel == "onlyParent") {
        filterOption.set({ 'is_parent': 'yes' });
      }
      else if (extraSel == "childOf") {
        var ddName = $('#textSearch').find(":selected").val();
        if (ddName == "categoryName") {
          var textName = $('#textval').val();
          if (textName != "") {
            filterOption.set({ 'is_parent': 'yes' });
            filterOption.set({ 'categoryName': textName });
            filterOption.set({ 'childOf': 'yes' });
            console.log(filterOption);
          }
          else {
            $(".extraOptionSel").removeClass("active");
            alert("Please Enter Parent Category Name.");
          }
        }
        else {
          $(".extraOptionSel").removeClass("active");
          alert("Please first Select Category Name.");
        }
      }
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
        $(e.currentTarget).find(".up").addClass("active");
        $(e.currentTarget).find(".down").removeClass("active");
      } else {
        order = "DESC";
        $(e.currentTarget).find(".up").removeClass("active");
        $(e.currentTarget).find(".down").addClass("active");
      }
      $(e.currentTarget).attr("data-value", order);
      newsetval["order"] = order;
      newsetval["orderBy"] = $(e.currentTarget).attr("data-field");
      filterOption.set(newsetval);
      selfobj.filterSearch();
    },
    filterSearch: function (isClose = false) {

      if (this.extraSel == "childOf") {
        var ddName = $('#textSearch').find(":selected").val();
        if (ddName == "categoryName") {
          var textName = $('#textval').val();
          if (textName != "") {
            filterOption.set({ 'is_parent': 'yes' });
            filterOption.set({ 'categoryName': textName });
            filterOption.set({ 'childOf': 'yes' });
            console.log(filterOption);
          }
          else {
            $(".extraOptionSel").removeClass("active");
            this.extraSel = "";
            alert("Please Enter Parent Category Name.");
            return false;
          }
        }
        else {
          $(".extraOptionSel").removeClass("active");
          this.extraSel = "";
          alert("Please first Select Category Name.");
          return false;
        }
      }

      if (isClose && typeof isClose != 'object') {
        $('.' + this.toClose).remove();
        rearrageOverlays();
        //alert("sdfsf 222");
      }

      searchCategory.reset();
      var selfobj = this;
      readyState = true;
      filterOption.set({ curpage: 0 });
      var $element = $('#loadMember');
      $(".profile-loader").show();
      $element.attr("data-index", 1);
      $element.attr("data-currPage", 0);

      searchCategory.fetch({
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
        searchCategory.reset();
        var index = $element.attr("data-index");
        var currPage = $element.attr("data-currPage");

        filterOption.set({ curpage: index });
        var requestData = filterOption.attributes;

        $(".profile-loader").show();
        searchCategory.fetch({
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
      var template = _.template(categoryTemp);
      this.$el.html(template({ closeItem: this.toClose }));
      $(".app_playground").append(this.$el);
      setToolTip();
      return this;
    }
  });

  return categoryView;

});
