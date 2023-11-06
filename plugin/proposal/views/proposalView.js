
define([
    'jquery',
    'underscore',
    'backbone',
    'datepickerBT',
    'moment',
    'Swal',
    '../views/proposalSingleView',
    '../collections/proposalCollection',
    "../../customer/collections/customerCollection",
    "../../project/collections/projectCollection",
    '../models/proposalFilterOptionModel',
    'text!../templates/proposalRow.html',
    'text!../templates/proposal_temp.html',
    'text!../templates/proposalFilterOption_temp.html',
  ], function ($, _, Backbone, datepickerBT, moment,Swal,  proposalSingleView, proposalCollection, customerCollection, projectCollection, proposalFilterOptionModel, proposalRowTemp, proposalTemp, proposalFilterTemp) {
  
    var proposalView = Backbone.View.extend({
      loadFrom:null,
      initialize: function (options) {
        $(".profile-loader").show();
        this.toClose = "proposalFilterView";
        filterOption = new proposalFilterOptionModel();
        var selfobj = this;
        if(options.loadFrom != undefined){
          selfobj.loadFrom = options.loadFrom;
          filterOption.set({ project_id: options.projectID });
          permission = ROLE['proposal'];
          console.log(filterOption);
        }else{
          var mname = Backbone.history.getFragment();
          permission = ROLE[mname];
        }
        readyState = true;
        this.render();
        
        searchproposal = new proposalCollection();
        searchproposal.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler, type: 'post', data: filterOption.attributes
        }).done(function (res) {
  
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          $(".profile-loader").hide();
          setPagging(res.paginginfo, res.loadstate, res.msg);
        });

        this.customerList = new customerCollection();
      this.customerList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, data: { status: "active" }
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        // selfobj.render();
      });

      this.projectList = new projectCollection();
      this.projectList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, data: { status: "active" }
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        // selfobj.render();
      });


  
        this.collection = searchproposal;
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
        "click .confirmproposal": "confirmproposal",
        "change .txtchange": "updateOtherDetails",
        "click .changeStatus": "changeStatusListElement",
        "click .showpage": "loadData",
        "change .changeBox": "changeBox",
        "click .sortColumns": "sortColumn",
      },
      updateOtherDetails: function (e) {
        var valuetxt = $(e.currentTarget).val();
        var toID = $(e.currentTarget).attr("id");
        var newdetails = [];
        newdetails["" + toID] = valuetxt;
        filterOption.set(newdetails);
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
        

      var selValP = $(e.currentTarget).val();
      $(".hidetextval").hide();
      $(".filterClear").val("");
      if (selValP == "searchList") {
        $(".projectList").show();
      } else {
        $(".textvalBox").show();
      }
        // var selVal = $(e.currentTarget).val();
        // // $(".hidetextval").hide();
        // $(".filterClear").val("");
        // filterOption.set({ textval: '' });
        // if (selVal == "mobile_no") {
        //   $(".contacttxt").show();
        // } else if (selVal == "first_name" || selVal == "middle_name" || selVal == "last_name" || selVal == "email") {
        //   $(".textval").show();
        // }
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
        $('#proposalList input:checkbox').each(function () {
          if ($(this).is(":checked")) {
            removeIds.push($(this).attr("data-proposal_id"));
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
          url: APIPATH + 'proposalMaster/status',
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
        $('#proposalList input:checkbox').each(function () {
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
        switch (show) {
          case "singleproposalData": {
            var proposal_id = $(e.currentTarget).attr("data-proposal_id");
            var proposalsingleView = new proposalSingleView({ proposal_id: proposal_id, searchproposal: this });
            break;
          }
        }
      },

      confirmproposal: function (e) {
        // var selfobj = this;
        // var show = $(e.currentTarget).attr("data-view");
        // switch (show) {
        //   case "singleproposalData": {
        //     var proposal_id = $(e.currentTarget).attr("data-proposal_id");
        //     var proposalsingleView = new proposalSingleView({ proposal_id: proposal_id, searchproposal: this });
        //     break;
        //   }
        // }
        Swal.fire({
          title: 'Are you sure you want to confirm the proposal?',
          showDenyButton: true,
          showCancelButton: false,
          confirmButtonText: 'Confirm',
          denyButtonText: `Cancel`,
        }).then((result) => {
          /* Read more about isConfirmed, isDenied below */
          // if (result.isConfirmed) {
          //   Swal.fire('Saved!', '', 'success')
          // } else if (result.isDenied) {
          //   Swal.fire('Changes are not saved', '', 'info')
          // }
        })

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
        console.log("newsetval",newsetval);
        filterOption.set(newsetval);
        selfobj.filterSearch();
      },

    
      resetSearch: function () {
        //filterOption.set({curpage:0,proposalID:null,textval: null,textSearch:'proposalName',status:'active',orderBy:'created_date',order:'DESC'});
        //filterOption.reset();
        filterOption.clear().set(filterOption.defaults);
        $(".multiOptionSel").removeClass("active");
        // $("#textval").val("");
        $(".filterClear").val("");
        $(".hidetextval").hide();
        $(".ws-select").val('default');
        $(".ws-select").selectpicker("refresh");
        $('#textSearch option[value=proposal_id]').attr('selected', 'selected');
        this.filterSearch(false);
      },
      loaduser: function () {
        var memberDetails = new singlememberDataModel();
      },
      addOne: function (objectModel) {
        var template = _.template(proposalRowTemp);
        $("#proposalList").append(template({ proposalDetails: objectModel }));
      },
      addAll: function () {
        $("#proposalList").empty();
        this.collection.forEach(this.addOne, this);
      },
      filterRender: function (e) {
        var isexits = checkisoverlay(this.toClose);
  
        if (!isexits) {
  
          var source = proposalFilterTemp;
          var template = _.template(source);
  
          var cont = $("<div>");
          cont.html(template({ "customerList": this.customerList.models, "projectList": this.projectList.models, }));
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
          $(".ws-select").selectpicker();
          /* 
            INFO
            make current proposal active
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

      // filterSearch: function () {
      //   console.log("filterSearch");
      //   $('#myModal').modal('hide');
      //   searchproposal.reset();
      //   var selfobj = this;
      //   readyState = true;
      //   filterOption.set({ curpage: 0 });
      //   var $element = $('#loadMember');
  
      //   $(".profile-loader").show();
  
      //   $element.attr("data-index", 1);
      //   $element.attr("data-currPage", 0);
  
      //   searchproposal.fetch({
      //     headers: {
      //       'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
      //     }, add: true, remove: false, merge: false, error: selfobj.onErrorHandler, type: 'post', data: filterOption.attributes
      //   }).done(function (res) {
      //     console.log("res",JSON.stringify(res));
      //     if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
      //     $(".profile-loader").hide();
  
      //     setPagging(res.paginginfo, res.loadstate, res.msg);
      //     $element.attr("data-currPage", res.paginginfo.nextpage);
      //     $element.attr("data-index", res.paginginfo.nextpage);
  
      //     // $(".page-info").html(recset);
      //     if (res.loadtraineeSkill === false) {
      //       $(".profile-loader-msg").html(res.msg);
      //       $(".profile-loader-msg").show();
      //     } else {
      //       $(".profile-loader-msg").hide();
      //     }
      //   });
      // },
      

      filterSearch: function (isClose = false) {
        console.log("filterSearch");
        if (isClose && typeof isClose != 'object') {
          $('.' + this.toClose).remove();
          rearrageOverlays();
          //alert("sdfsf 222");
        }
  
        searchproposal.reset();
        var selfobj = this;
        readyState = true;
        filterOption.set({ curpage: 0 });
        var $element = $('#loadMember');
        $(".profile-loader").show();
        $element.attr("data-index", 1);
        $element.attr("data-currPage", 0);
  
        searchproposal.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, add: true, remove: false, merge: false, error: selfobj.onErrorHandler, type: 'post', data: filterOption.attributes
        }).done(function (res) {
          console.log("ress",res);
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          $(".profile-loader").hide();
  
          setPagging(res.paginginfo, res.loadstate, res.msg);
          $element.attr("data-currPage", 0);
          $element.attr("data-index", res.paginginfo.nextpage);
  
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
          searchproposal.reset();
          var index = $element.attr("data-index");
          var currPage = $element.attr("data-currPage");
  
          filterOption.set({ curpage: index });
          var requestData = filterOption.attributes;
  
          $(".profile-loader").show();
          searchproposal.fetch({
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
          filterOption.set({ trainingStartDate: valuetxt });
          //selfobj.model.set({trainingStartDate:valuetxt});
          //endDate.datepicker({"StartDate":new Date("10/03/2023")});
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
          filterOption.set({ trainingStartDate: valuetxt });
          var valuetxt = $("#fromDate").val();
          var temp2 = moment(valuetxt, 'DD-MM-YYYY').valueOf();
          if (temp2 > temp) {
            $("#fromDate").val("");
          }
          //selfobj.model.set({trainingStartDate:valuetxt});
          //startDate.datepicker("option","minDate",$.datepicker.parseDate("dd/mm/yy",ev.value));
          // startDate.datepicker("setEndDate", moment(valuetxt).format('l'));
  
        });
      },
      render: function () {
        console.log("render....");
        var template = _.template(proposalTemp);
          this.$el.html(template({ closeItem: this.toClose }));
          // alert(this.loadFrom);
        if(this.loadFrom != null){
          $("#dasboradProposalHolder").append(this.$el);
        }else{
          $(".app_playground").append(this.$el);
          setToolTip();
        }
        return this;
      }
    });
  
    return proposalView;
  
  });
  