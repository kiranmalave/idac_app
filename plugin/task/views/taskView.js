
define([
  'jquery',
  'underscore',
  'backbone',
  'datepickerBT',
  'moment',
  'Swal',
  '../views/taskSingleView',
  '../views/repeatTaskCustomView',
  '../views/historySingleView',
  '../collections/taskCollection',
  '../models/taskFilterOptionModel',
  "../../admin/collections/adminCollection",
  "../../customer/collections/customerCollection",
  "../../project/collections/projectCollection",
  "../../category/collections/slugCollection",
  'text!../templates/taskRow.html',
  'text!../templates/task_temp.html',
  'text!../templates/taskFilterOption_temp.html',

], function ($, _, Backbone, datepickerBT, moment, Swal, taskSingleView, repeatTaskCustomView, historySingleView, taskCollection, taskFilterOptionModel, adminCollection, customerCollection, projectCollection, slugCollection, taskRowTemp, taskTemp, taskFilterTemp) {

  var taskView = Backbone.View.extend({
    loadfrom: null,
    searchtask: null,
    initialize: function (options) {
      this.toClose = "taskFilterView";
      var selfobj = this;
      this.filterCount = null;
      if (options.loadfrom != undefined) {
        selfobj.loadfrom = options.loadfrom;
        permission = ROLE['task'];
      } else {
        var mname = Backbone.history.getFragment();
        permission = ROLE[mname];
      }
      $(".profile-loader").show();

      readyState = true;
      this.render();
      this.filterCount = null;
      filterOption = new taskFilterOptionModel();
      this.searchtask = new taskCollection();
      this.adminList = new adminCollection();
      this.adminList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { status: "active" }
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".profile-loader").hide();
        // selfobj.render();
      });

      this.categoryList = new slugCollection();
      this.categoryList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y', slug: 'task_priority,task_type,task_status' }
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".profile-loader").hide();
        // selfobj.render();
      });

      this.customerList = new customerCollection();
      this.customerList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, data: { getAll: 'Y', status: "active" }
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".profile-loader").hide();
        // selfobj.render();
      });

      this.projectList = new projectCollection();
      this.projectList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, data: { getAll: 'Y', status: "active" }
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".profile-loader").hide();
        // selfobj.render();
      });

      this.searchtask.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: filterOption.attributes
      }).done(function (res) {

        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".profile-loader").hide();
        setPagging(res.paginginfo, res.loadstate, res.msg);
      });



      this.collection = this.searchtask;
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
      "click .sortbydate": "sortByDate",
      "change .dropval": "singleFilterOptions",
      "click .closeFilter": "closeFilter",
      
    },
    updateOtherDetails: function (e) {
      e.stopPropagation();
      var toID = $(e.currentTarget).attr("id");
      var valuetxt = $(e.currentTarget).val()
      var newdetails = [];
      newdetails["" + toID] = valuetxt;
      filterOption.set(newdetails);
      console.log(filterOption);
    },
    singleFilterOptions: function (e) {
      e.stopPropagation();
      var toID = $(e.currentTarget).attr("id");
      var valuetxt = $(e.currentTarget).val().join(",");
      var newdetails = [];
      newdetails["" + toID] = valuetxt;
      filterOption.set(newdetails);
    },
    // changeBox: function (e) {
    //   var selVal = $(e.currentTarget).val();
    //   $(".hidetextval").hide();
    //   $(".filterClear").val("");
    //   if (selVal == "subject") {
    //     $(".textvalBox").show();
    //   }
    // },
    settextSearch: function (e) {
      var usernametxt = $(e.currentTarget).val();
      filterOption.set({ textSearch: usernametxt });
    },
    changeStatusListElement: function (e) {
      var selfobj = this;
      var removeIds = [];
      var status = $(e.currentTarget).attr("data-action");
      if (status == "delete") {
        var r = confirm("Are you sure to delete task?");
        if (r == false) {
          return false;
        }
        var action = "changeStatus";
      }
      $('#clist input:checkbox').each(function () {
        if ($(this).is(":checked")) {
          removeIds.push($(this).attr("data-task_id"));
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
        url: APIPATH + 'taskMaster/status',
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
            selfobj.collection.fetch({
              headers: {
                'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
              }, error: selfobj.onErrorHandler
            }).done(function (res) {
              if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
              $(".profile-loader").hide();
              selfobj.filterSearch();
            });
          }
          $(".deleteAll").hide();
          $('.checkall').prop('checked', false);
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
        case "singletaskData": {
          var task_id = $(e.currentTarget).attr("data-task_id");
          if (task_id != undefined) {
            new historySingleView({ task_id: task_id });
          } else {
            handelClose("historySingleView");
          }
          new taskSingleView({ task_id: task_id, searchtask: selfobj });
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
    sortByDate: function (e) {
      var order = $(e.currentTarget).attr("data-filter");
      let selfobj = this;
      let newsetval = [];
      var date;
      $('.taskfilbtn').removeClass('active');
      $(e.currentTarget).addClass('active');
      if (order === "today") {
        date = moment().format('YYYY-MM-DD');
        newsetval["due_date"] = date;
      } else if (order === "tomorrow") {
        date = moment().add(1, 'days').format('YYYY-MM-DD');
        newsetval["due_date"] = date;
      } else if (order === "yesterday") {
        date = moment().subtract(1, 'days').format('YYYY-MM-DD');
        newsetval["due_date"] = date;
      }
      filterOption.set(newsetval);
      selfobj.filterSearch();
    },
    resetSearch: function () {
      filterOption.clear().set(filterOption.defaults);
      $(".multiOptionSel").removeClass("active");
      $("#textval").val("");
      // $(".hidetextval").hide();
      // $(".txtchange").val("");
      $(".ws-select").val('default');
      $(".ws-select").selectpicker("refresh");
      $('#textSearch option[value=task_id]').attr('selected', 'selected');
      this.filterCount = null;
      this.filterSearch(false);
      $('.taskfilbtn').removeClass('active');
      $("#clist").find(".up").removeClass("active");
      $("#clist").find(".down").removeClass("active");
      // Find the <li> element with the id "filterOption"
      if ($("#filterOption").length) {
        $("#filterOption").find('span.taskBadge').remove();
      }

    },
    loaduser: function () {
      var memberDetails = new singlememberDataModel();
    },
    addOne: function (objectModel) {
      var template = _.template(taskRowTemp);
      var dueDateMoment = moment(objectModel.attributes.due_date);
      objectModel.attributes.newDate = objectModel.attributes.due_date;
      if (objectModel.attributes.due_date != "0000-00-00") {
        objectModel.attributes.due_date = dueDateMoment.format("DD-MMM-YYYY");
        var today = moment();
        if (dueDateMoment.isSame(today, 'day')) {
          objectModel.attributes.due_date = "Today";
        } else if (dueDateMoment.isSame(today.clone().subtract(1, 'day'), 'day')) {
          objectModel.attributes.due_date = "Yesterday";
        } else if (dueDateMoment.isSame(today.clone().add(1, 'day'), 'day')) {
          objectModel.attributes.due_date = "Tomorrow";
        } else {
          objectModel.attributes.date_status = dueDateMoment.format("MMMM Do, YYYY");
        }
      }
      $("#taskList").append(template({ taskDetails: objectModel }));
      // $("#taskList").append(template({ taskDetails: objectModel }));
    },
    addAll: function () {
      $("#taskList").empty();
      this.collection.forEach(this.addOne, this);
    },
    filterRender: function (e) {
      var isexits = checkisoverlay(this.toClose);
      if (!isexits) {
      var source = taskFilterTemp;
      var template = _.template(source);

        var cont = $("<div>");
        cont.html(template({ "adminList": this.adminList.models, "categoryList": this.categoryList.models, "customerList": this.customerList.models, "projectList":this.projectList.models }));
        cont.attr('id', this.toClose);
        /*  
          INFO
          this line use to hide if any other overlay is open first close it.
        */
        $(".overlay-main-container").removeClass("open");
        // append filter html here
        $(".ws_filterOptions").append(cont);
        // $(".ws-select").selectpicker();
        /*  
          INFO
          open filter popup by adding class open here
        */
        $(".ws_filterOptions").addClass("open");
        $(".ws-select").selectpicker();
        /* 
          INFO
          make current task active
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
    closeFilter:function(e){
      var isOpen = $(".ws_filterOptions").hasClass("open");
        if (isOpen) {
          $(".ws_filterOptions").removeClass("open");
          $(e.currentTarget).removeClass("active");
          return;
        } else {
          $(e.currentTarget).addClass("active");
          // this function will handel other exiting open popus
        }
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
      var selfobj = this;
      if (isClose && typeof isClose != 'object') {
        $('.' + this.toClose).remove();
        rearrageOverlays();
      }
      this.searchtask.reset();
      readyState = true;
      filterOption.set({ curpage: 0 });
      var $element = $('#loadMember');
      $(".profile-loader").show();
      $element.attr("data-index", 1);
      $element.attr("data-currPage", 0);

      var specificFilters = ["textval", "fromDate", "toDate", "fromDate2", "toDate2", "due_date", "task_priority", "task_status", "customer_id", "assignee", "created_by"];
      // Initialize a count variable
      let appliedFilterCount = 0;
      for (var i = 0; i < specificFilters.length; i++) {
        var filterKey = specificFilters[i];
        if (filterOption.attributes[filterKey] !== null && filterOption.attributes[filterKey] !== "" && filterOption.attributes[filterKey] !== undefined) {
          console.log(filterOption.attributes[filterKey]);
          appliedFilterCount++;
        }
      }
      this.searchtask.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, add: true, remove: false, merge: false, error: selfobj.onErrorHandler, type: 'post', data: filterOption.attributes
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".profile-loader").hide();

        setPagging(res.paginginfo, res.loadstate, res.msg);
        $element.attr("data-currPage", 1);
        $element.attr("data-index", res.paginginfo.nextpage);

        if (res.loadstate === false) {
          $(".profile-loader-msg").html(res.msg);
          $(".profile-loader-msg").show();
        } else {
          $(".profile-loader-msg").hide();
        }
        selfobj.setValues();
      });
      if ($("#filterOption").length) {
        if (appliedFilterCount > 0) {
          $("#filterOption").addClass("active");
        } else {
          $("#filterOption").removeClass("active");
        }

        $("#filterOption").find('span.taskBadge').remove();
        if (appliedFilterCount != 0) {
          $("#filterOption").append("<span class='badge bg-pink taskBadge'>" + appliedFilterCount + "</span>");
        }
      }
    },
    loadData: function (e) {
      var selfobj = this;
      var $element = $('#loadMember');
      var cid = $(e.currentTarget).attr("data-dt-idx");
      var isdiabled = $(e.currentTarget).hasClass("disabled");
      if (isdiabled) {
      } else {

        $element.attr("data-index", cid);
        this.searchtask.reset();
        var index = $element.attr("data-index");
        var currPage = $element.attr("data-currPage");

        filterOption.set({ curpage: index });
        var requestData = filterOption.attributes;

        $(".profile-loader").show();
        this.searchtask.fetch({
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
        var valuetxt = $("#fromDate2").val();
        var temp2 = moment(valuetxt, 'DD-MM-YYYY').valueOf();
        if (temp2 > temp) {
          $("#fromDate2").val("");
        }
      });
    },
    render: function () {
      var template = _.template(taskTemp);
      this.$el.html(template({ closeItem: this.toClose, }));
      console.log("this.loadfrom", this.loadfrom);
      if (this.loadfrom != null) {
        $("body").find("#dasboradTaskHolder").append(this.$el);
      } else {
        $(".app_playground").append(this.$el);
        setToolTip();
      }

      return this;
    }
  });
  return taskView;
});
