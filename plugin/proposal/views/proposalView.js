
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
  '../../core/views/configureColumnsView',
  '../../core/views/appSettings',
  '../../dynamicForm/collections/dynamicFormDataCollection',
  '../../menu/models/singleMenuModel',
  '../models/proposalFilterOptionModel',
  'text!../templates/proposalRow.html',
  'text!../templates/proposal_temp.html',
  'text!../templates/proposalFilterOption_temp.html',
], function ($, _, Backbone, datepickerBT, moment, Swal, proposalSingleView, proposalCollection, customerCollection, projectCollection, configureColumnsView, appSettings, dynamicFormData, singleMenuModel, proposalFilterOptionModel, proposalRowTemp, proposalTemp, proposalFilterTemp) {

  var proposalView = Backbone.View.extend({
    loadFrom: null,
    totalRec:0,
    accessToken:"",
    initialize: function (options) {
      this.startX = 0;
      this.startWidth = 0;
      this.$handle = null;
      this.$table = null;
      this.pressed = false;
      this.loadFrom = options.loadFrom;
      this.customer_ID = options.customerID;
      this.projectID = options.projectID;
      this.odFolder = options.odfolder;
      this.accessToken = "";
      $(".profile-loader").show();
      this.toClose = "proposalFilterView";
      filterOption = new proposalFilterOptionModel();
      var selfobj = this;
      this.totalRec= 0;
      var mname = Backbone.history.getFragment();
      if (mname == "proposal") {
        permission = ROLE[mname];
      } else {
        selfobj.loadFrom = options.loadFrom;
        filterOption.set({ project_id: options.projectID });
        filterOption.set({ client_id: options.customerID });
        permission = ROLE['proposal'];
      }
      readyState = true;

      this.menuId = permission.menuID;
      this.appSettings = new appSettings();
      this.dynamicFormDatas = new dynamicFormData();
      this.menuList = new singleMenuModel();
      this.appSettings.getMenuList(this.menuId, function(plural_label,module_desc,form_label,result) {
        selfobj.plural_label = plural_label;
        selfobj.module_desc = module_desc;
        selfobj.form_label = form_label;
        readyState = true;
        selfobj.getColumnData();
        if(result.data[0] != undefined){
          selfobj.tableName = result.data[0].table_name;
        }
     
      });

     selfobj.getOdToken();
      this.customerID = options.action;
      if(this.customerID != ""){
        filterOption.set({company:this.customerID});
      }

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
      setTimeout(function () {
        selfobj.getFiles();
      }, 2000);


      this.collection = new proposalCollection();
      this.collection.on('add', this.addOne, this);
      this.collection.on('reset', this.addAll, this);
      this.render();
    },
    getColumnData: function(){
      var selfobj = this;
      this.dynamicFormDatas.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { "pluginId": this.menuId }
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          if (res.metadata && res.metadata.trim() != '') {
              selfobj.metadata  = JSON.parse(res.metadata);
          } 
          if (res.c_metadata && res.c_metadata.trim() != '') {
              selfobj.c_metadata  = JSON.parse(res.c_metadata);
              selfobj.arrangedColumnList = selfobj.c_metadata;
          }
        selfobj.getModuleData();
        selfobj.render();
      });
    },
    getModuleData:function(){
      var selfobj = this;
      this.collection.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: filterOption.attributes
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        setPagging(res.paginginfo, res.loadstate, res.msg);
        selfobj.totalRec = res.paginginfo.totalRecords;
        $(".profile-loader").hide();
      });
      selfobj.render();
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
      "click .arrangeColumns": "openColumnArrangeModal",
      'mousedown .table-resizable .resize-bar': 'onMouseDown',
      'mousemove .table-resizable th, .table-resizable td': 'onMouseMove',
      'mouseup .table-resizable th, .table-resizable td': 'onMouseUp',
      'dblclick .table-resizable thead': 'resetColumnWidth'
    },

    onMouseDown: function (event) {
      let index = $(event.target).parent().index();
      this.$handle = this.$el.find('th').eq(index);
      this.pressed = true;
      this.startX = event.pageX;
      this.startWidth = this.$handle.width();
      this.$table = this.$handle.closest('.table-resizable').addClass('resizing');
    },

    onMouseMove: function (event) {
      if (this.pressed) {
        this.$handle.width(this.startWidth + (event.pageX - this.startX));
      }
    },

    onMouseUp: function () {
      if (this.pressed) {
        this.$table.removeClass('resizing');
        this.pressed = false;
      }
    },
    resetColumnWidth: function () {
      // Reset column sizes on double click
      this.$el.find('th').css('width', '');
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
    },

    getOdToken: function(){
      let selfobj = this;
      $.ajax({
        url: APIPATH + 'getToken',
        method: 'GET',
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
            selfobj.accessToken = res.token;
          }
        }
      });
    },

    getFiles: async function (){
      const accessToken = ""+this.accessToken;
      const folderId = "" + this.odFolder;

      if(folderId != "" || folderId != undefined){
         
        try {
            // Get the list of files in the specified folder
            const filesUrl = `https://graph.microsoft.com/v1.0/me/drives/D99A97EA28CF1302/items/${folderId}/children`;
            const filesResponse = await fetch(filesUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
    
            if (filesResponse.ok) {
              const filesData = await filesResponse.json();
              // console.log('Files in folder:', filesData);
              
              const fileListElement = document.getElementById('fileList');
              fileListElement.innerHTML = ''; // Clear previous content

              for (const file of filesData.value) {
                  // Fetch thumbnail for each file
                  const thumbnailUrl = `https://graph.microsoft.com/v1.0/me/drives/D99A97EA28CF1302/items/${file.id}/thumbnails`;
                  const thumbnailResponse = await fetch(thumbnailUrl, {
                      method: 'GET',
                      headers: {
                          'Authorization': `Bearer ${accessToken}`
                      }
                  });

                  let thumbnailSrc = '';
                  if (thumbnailResponse.ok) {
                      const thumbnailData = await thumbnailResponse.json();
                      if (thumbnailData.value && thumbnailData.value.length > 0) {
                          thumbnailSrc = thumbnailData.value[0].medium.url; // Choose an appropriate thumbnail size
                      }
                  }

                  // Create HTML for each file with its thumbnail
                  const fileElement = document.createElement('div');
                  fileElement.className = 'file';

                  const fileThumbnail = document.createElement('img');
                  fileThumbnail.className = 'thumbnailOd';
                  fileThumbnail.src = thumbnailSrc || 'placeholder.png'; // Use a placeholder if no thumbnail

                  const fileName = document.createElement('p');
                  fileName.textContent = file.name;
                  const deleteButton = document.createElement('button');
                  deleteButton.textContent = 'Delete';
                  deleteButton.onclick = () => this.deleteFile(file.id);

                  fileElement.appendChild(fileThumbnail);
                  fileElement.appendChild(deleteButton);
                  fileListElement.appendChild(fileElement);
              }
          } else {
              const errorData = await filesResponse.json();
              console.error('Error fetching files:', errorData);
              alert(`Error fetching files: ${errorData.error.message}`);
          }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        }

      }
    },


    deleteFile: async function (fileId) {
      const accessToken =  ""+this.accessToken;

      Swal.fire({
        title: "Delete Task ",
        text: "Do you want to delete Attachment ?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Delete',
        animation: "slide-from-top",
      }).then(async (result) => {
        if (result.isConfirmed) {
          if (fileId) {
            try {
                const deleteUrl = `https://graph.microsoft.com/v1.0/me/drives/D99A97EA28CF1302/items/${fileId}`;
                const deleteResponse = await fetch(deleteUrl, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });
  
                if (deleteResponse.ok) {
                    alert('File deleted successfully');
                    // Refresh the file list
                    this.getFiles();
                } else {
                    const errorData = await deleteResponse.json();
                    console.error('Error deleting file:', errorData);
                    alert(`Error deleting file: ${errorData.error.message}`);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred. Please try again.');
            }
        }
        }else{

        }
      })
    },

    openColumnArrangeModal: function (e) {
      let selfobj = this;
      var show = $(e.currentTarget).attr("data-action");
      var stdColumn = [];
      switch (show) {
        case "arrangeColumns": {
          var isOpen = $(".ws_ColumnConfigure").hasClass("open");
          if (isOpen) {
            $(".ws_ColumnConfigure").removeClass("open");
            $(e.currentTarget).removeClass("BG-Color");
            selfobj.getColumnData();
            selfobj.filterSearch();
            return;
          } else {
            new configureColumnsView({menuId: this.menuId,ViewObj: selfobj,stdColumn:stdColumn});
            $(e.currentTarget).addClass("BG-Color");
          }
          break;
        }
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
          new proposalSingleView({ proposal_id: proposal_id, projectID: selfobj.projectID, customerID: selfobj.customer_ID, searchproposal: this });
          break;
        }
      }
    },

    confirmproposal: function (e) {
      let selfobj = this;
      var projectID = $(e.currentTarget).attr('data-project_id');
      var proposalID = $(e.currentTarget).attr('data-proposal_id');
      var status = "yes";
      Swal.fire({
        title: 'Are you sure you want to confirm the proposal?',
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: 'Confirm',
        denyButtonText: `Cancel`,
      }).then((result) => {
        if (result.isConfirmed) {
          if (projectID != "" && proposalID != "") {
            $.ajax({
              url: APIPATH + 'proposalMaster/confirmProposal',
              method: 'POST',
              data: { proposal_id: proposalID, project_id: projectID, status: status },
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
          }
        } else if (result.isDenied) {
          Swal.fire('Proposal Not confirmed!!', '', 'info')
        }
      })

    },

    sortColumn: function (e) {
      var order = $(e.currentTarget).attr("data-value");
      var selfobj = this;
      var newsetval = [];
      $("#clist").find(".up").removeClass("active");
      $("#clist").find(".down").removeClass("active");
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
      console.log("newsetval", newsetval);
      filterOption.set(newsetval);
      selfobj.filterSearch();
    },


    resetSearch: function () {
      filterOption.clear().set(filterOption.defaults);
      $(".multiOptionSel").removeClass("active");
      $(".filterClear").val("");
      $(".hidetextval").hide();
      $(".ws-select").val('default');
      $(".ws-select").selectpicker("refresh");
      $('#textSearch').prop('selectedIndex',0);
      this.filterSearch(false);
    },
    loaduser: function () {
      var memberDetails = new singlememberDataModel();
    },
    addOne: function (objectModel) {
      var template = _.template(proposalRowTemp);
      this.totalRec = this.collection.length;
      if (this.totalRec == 0) {
        $(".noCustRec").show();
        $("#proposaList").hide();
      }else{
        $(".noCustRec").hide();
        $("#proposaList").show();
      }
      $("#proposalList").append(template({ proposalDetails: objectModel }));

      var mailTruncateElements = document.querySelectorAll('.mailtruncate');
      mailTruncateElements.forEach(function (element) {
        var textWidth = element.offsetWidth;
        var parentEle = element.parentElement;
      });
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

    filterSearch: function (isClose = false) {
      if (isClose && typeof isClose != 'object') {
        $('.' + this.toClose).remove();
        rearrageOverlays();
      }

      this.collection.reset();
      var selfobj = this;
      readyState = true;
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
        console.log("ress", res);
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".profile-loader").hide();
        selfobj.totalRec = res.paginginfo.totalRecords;
        if (selfobj.totalRec == 0) {
          $(".noCustRec").show();
          $("#leadlistview").hide();
        }else{
          $(".noCustRec").hide();
          $("#leadlistview").show();
        }
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
        this.collection.reset();
        var index = $element.attr("data-index");
        var currPage = $element.attr("data-currPage");

        filterOption.set({ curpage: index });
        var requestData = filterOption.attributes;

        $(".profile-loader").show();
        this.collection.fetch({
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
      });
    },
    render: function () {
      var template = _.template(proposalTemp);
      this.$el.html(template({ closeItem: this.toClose, "loadFrom":this.loadFrom, totalRec: this.totalRec}));
      if (this.loadFrom != null) {
        $("#dasboradProposalHolder").append(this.$el);
      } else {
        $(".app_playground").append(this.$el);
        setToolTip();
      }
      return this;
    }
  });

  return proposalView;

});
