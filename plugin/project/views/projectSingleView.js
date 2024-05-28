define([
    'jquery',
    'underscore',
    'backbone',
    'validate',
    'inputmask',
    'datepickerBT',
    'moment',
    'Swal',
    'RealTimeUpload',
    '../../core/views/multiselectOptions',
    '../../dynamicForm/views/dynamicFieldRender',
    '../collections/projectCollection',
    "../../customer/collections/customerCollection",
    '../models/projectSingleModel',
    '../../readFiles/views/readFilesView',
    '../../customer/views/customerSingleView',
    'text!../templates/projectSingle_temp.html',
  ], function ($, _, Backbone, validate, inputmask, datepickerBT, moment, Swal, RealTimeUpload, multiselectOptions, dynamicFieldRender, projectCollection, customerCollection, projectSingleModel, readFilesView, customerSingleView, projecttemp) {
    var projectSingleView = Backbone.View.extend({
      model: projectSingleModel,
      projID:'',
      initialize: function (options) {
        this.customerID = options.customerID;
        this.dynamicData = null;
        this.toClose = "projectSingleView";
        this.pluginName = "projectList";
        this.loadFrom = options.loadFrom;
        this.model = new projectSingleModel();
        var selfobj = this;
        this.multiselectOptions = new multiselectOptions();
        $(".modelbox").hide();
        scanDetails = options.searchproject;
        selfobj.dynamicFieldRenderobj = new dynamicFieldRender({ ViewObj: selfobj, formJson: {} });
        $(".popupLoader").show();
        var projectList = new projectCollection();
        projectList.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler, data: { getAll: 'Y', status: "active" }
        }).done(function (res) {
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          $(".popupLoader").hide();
          selfobj.model.set("projectList", res.data);
          selfobj.render();
        });

        this.customerList = new customerCollection();
       this.customerList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, data: { getAll: 'Y',status:'active'}
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        selfobj.render();
      });
      setTimeout(function () {
        selfobj.getFiles();
      }, 2000);

      this.projID = options.project_id;
        if (options.project_id != "") {
          this.model.set({ project_id: options.project_id });
          this.model.fetch({
            headers: {
              'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
            }, error: selfobj.onErrorHandler
          }).done(function (res) {
            var birthDate = selfobj.model.get("birth_date");
            if (birthDate != null && birthDate != "0000-00-00") {
              selfobj.model.set({ "birth_date": moment(birthDate).format("DD-MM-YYYY") });
            }
            if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
            $(".popupLoader").hide();
            selfobj.dynamicFieldRenderobj = new dynamicFieldRender({ ViewObj: selfobj, formJson: {} });
            
            selfobj.render();
            selfobj.setOldValues();
            
          });
        }
        
      },
      events: {
        "click .saveprojectDetails": "saveprojectDetails",
        "click .item-container li": "setValues",
        "blur .txtchange": "updateOtherDetails",
        "click .multiSel": "setValues",
        "change .bDate": "updateOtherDetails",
        "change .dropval": "updateOtherDetails",
        "change .logoAdded": "updateImageLogo",
        "click .loadMedia": "loadMedia",
        "click .loadFile" : "loadFile",
        "click .uploadOdFile" : "uploadLargeFileToOneDrive",
        "click .hideUpload" : "hideUpload",
        "click .deleteAttachment": "deleteAttachment",
        "click .openOneDrive": "openOneDrive",
      },
      attachEvents: function () {
        // Detach previous event bindings
        this.$el.off("click", ".saveprojectDetails", this.saveprojectDetails);
        // Reattach event bindings
        this.$el.on("click", ".saveprojectDetails", this.saveprojectDetails.bind(this));
        this.$el.off("click", ".multiSel", this.setValues);
        this.$el.on("click", ".multiSel", this.setValues.bind(this));
        this.$el.off("change", ".bDate", this.updateOtherDetails);
        this.$el.on("change", ".bDate", this.updateOtherDetails.bind(this));
        this.$el.off("change", ".dropval", this.updateOtherDetails);
        this.$el.on("change", ".dropval", this.updateOtherDetails.bind(this));
        this.$el.off("click", ".iconSelection", this.setIconValues);
        this.$el.off("blur", ".txtchange", this.updateOtherDetails);
        this.$el.on("blur", ".txtchange", this.updateOtherDetails.bind(this));
        this.$el.off("click", ".loadMedia", this.loadMedia);
        this.$el.on("click", ".loadMedia", this.loadMedia.bind(this));
        this.$el.off('click', '.loadFile', this.loadFile);
        this.$el.on('click', '.loadFile', this.loadFile.bind(this));
        this.$el.off('click', '.uploadOdFile', this.uploadLargeFileToOneDrive);
        this.$el.on('click', '.uploadOdFile', this.uploadLargeFileToOneDrive.bind(this));
        this.$el.off('click', '.hideUpload', this.hideUpload);
        this.$el.on('click', '.hideUpload', this.hideUpload.bind(this));
        this.$el.off('click', '.deleteAttachment', this.deleteAttachment);
        this.$el.on('click', '.deleteAttachment', this.deleteAttachment.bind(this));
        this.$el.off('click', '.openOneDrive', this.openOneDrive);
        this.$el.on('click', '.openOneDrive', this.openOneDrive.bind(this));
      },
  
      openOneDrive: function(e){
        var accestokenOD = this.model.get("accessToken");
        var odOptions = {
          clientId: "ff8c9bad-7a1d-4714-889c-15b4c362d597",
          action: "query",
          multiSelect: true,
          advanced: {
            redirectUri: 'http://localhost/projects/idac_app/API/projectCallBack',
          },
          success: function(files) {
            // Handle successful selection of files
            selectedFiles = files; // Store selected files
            alert('Files selected: ' + files.length);
          },
          cancel: function() {  
              // Handle cancel event
              alert('OneDrive picker was canceled');
          },
          error: function(error) {
              // Handle error
              console.error(error);
              alert('Error occurred: ' + error);
          },
          progress: function(percent) { /* progress handler */ },
         
        }
        OneDrive.open(odOptions);
      },

      onErrorHandler: function (collection, response, options) {
        alert("Something was wrong ! Try to refresh the page or contact administer. :(");
        $(".profile-loader").hide();
      },
      updateOtherDetails: function (e) {
        var valuetxt = $(e.currentTarget).val();
        if (valuetxt == "addClient") {
          new customerSingleView({ searchCustomer: this, loadfrom: "projectSingleView" });
        }
        var toID = $(e.currentTarget).attr("id");
        var newdetails = [];
        newdetails["" + toID] = valuetxt;
        this.model.set(newdetails);
      },
      loadFile: function(e){
        $('.upload').show();
        $('.dotborder').hide();
      },
      hideUpload: function (e) {
        $(".upload").hide();
        $('.dotborder').show();
      },
      setOldValues: function () {
        var selfobj = this;
        setvalues = ["status"];
        selfobj.multiselectOptions.setValues(setvalues, selfobj);
      },
      getSelectedFile: function (url) {
        $('.' + this.elm).val(url);
        $('.' + this.elm).change();
        $("#profile_pic_view").attr("src", url);
        $("#profile_pic_view").css({ "max-width": "10%" });
        $('#largeModal').modal('toggle');
        this.model.set({ "attachment": url });
      },
      loadMedia: function (e) {
        e.stopPropagation();
        $('#largeModal').modal('toggle');
        this.elm = "profile_pic";
        new readFilesView({ loadFrom: "addpage", loadController: this });
      },
      setValues: function (e) {
        var selfobj = this;
        var da = selfobj.multiselectOptions.setCheckedValue(e);
        selfobj.model.set(da);
      },
      refreshCus: function (){
        let selfobj = this;
        this.customerList.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler, data: { getAll: 'Y',status:'active'}
        }).done(function (res) {
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          selfobj.render();
        });
      },     
      saveprojectDetails: function (e) {
        e.preventDefault();
        let selfobj = this;
        var mid = this.model.get("project_id");
        let isNew = $(e.currentTarget).attr("data-action");
        var inputStr = $('#project_name').val();
        let capitalizedString = inputStr.charAt(0).toUpperCase() + inputStr.slice(1);
        this.model.set({"project_name": capitalizedString});
        if (permission.edit != "yes") {
          alert("You dont have permission to edit");
          return false;
        }
        if(this.customerID != null){
          this.model.set({'client_id':selfobj.customerID});
        }
        if (mid == "" || mid == null) {
          var methodt = "PUT";
        } else {
          var methodt = "POST";
        }
        if ($("#projectDetails").valid()) {
          $(e.currentTarget).html("<span>Saving..</span>");
          $(e.currentTarget).attr("disabled", "disabled");
          this.model.save({}, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
            }, error: selfobj.onErrorHandler, type: methodt
          }).done(function (res) {
            if (res.lastID != undefined) {
              selfobj.projID = res.lastID;
            }
            if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
  
            if (isNew == "new") {
              showResponse(e, res, "Save & New");
            } else {
              showResponse(e, res, "Save");
              if (selfobj.loadFrom == "TaskSingleView") {
                scanDetails.refreshCust();
              } else if (selfobj.loadFrom == "dashboard") {
                handelClose(selfobj.toClose);
                scanDetails.initialize();
              }else if(selfobj.loadFrom == "proposalSingleView") {
                scanDetails.refreshProj();
              }else if(selfobj.loadFrom == "projectViewOther"){
                scanDetails.initialize(scanDetails);
              }else{
                scanDetails.filterSearch();
              }
            }
            if (res.flag == "S") {
              if (isNew == "new") {
                selfobj.model.clear().set(selfobj.model.defaults);
                let url = APIPATH + 'projUpload/' + selfobj.projID;
                selfobj.uploadFileEl.elements.parameters.action = url;
                selfobj.uploadFileEl.prepareUploads(selfobj.uploadFileEl.elements);
                selfobj.dynamicFieldRenderobj.initialize({ ViewObj: selfobj, formJson: {} });
                selfobj.render();
              } else {
                let url = APIPATH + 'projUpload/' + selfobj.projID;
                selfobj.uploadFileEl.elements.parameters.action = url;
                selfobj.uploadFileEl.prepareUploads(selfobj.uploadFileEl.elements);
                handelClose(selfobj.toClose);
              }
            }
          });
        }
      },
      deleteAttachment: function (e) {
        let file_id = $(e.currentTarget).attr("data-file_id");
        let project_id = this.model.get("project_id");
        let div = document.getElementById('removeIMG');
        let status = "delete";
        let selfobj = this;
        Swal.fire({
          title: "Delete Task ",
          text: "Do you want to delete Attachment ?",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Delete',
          animation: "slide-from-top",
        }).then((result) => {
          if (result.isConfirmed) {
            if (file_id != null) {
              $.ajax({
                url: APIPATH + 'project/removeAttachment',
                method: 'POST',
                data: { fileID: file_id, status: status, projID: project_id },
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
                  if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
                  if (res.flag == "S") {
                    $('#' + file_id + 'removeDiv').remove();
                    selfobj.model.set({ "attachment_file": "" });
                  }
      
                }
              });
            } else {
              div.remove();
              selfobj.model.set({ "attachment_file": "" });
            }
          }else{
  
          }
        });
      },
      initializeValidate: function () {
        var selfobj = this;
        var feilds = {
          
          project_name: {
            required: true,
          },

          client_id:{
            required: true,
          }
          
        };
        var feildsrules = feilds;
        var dynamicRules = selfobj.dynamicFieldRenderobj.getValidationRule();
  
        if (!_.isEmpty(dynamicRules)) {
          var feildsrules = $.extend({}, feilds, dynamicRules);
          // var feildsrules = {
          //   ...feilds,
          //   ...dynamicRules
          //   };
        }
        var messages = {
          project_name: "Please enter Project Name",
          client_id: "Please select Client",
        };
        $("#projectDetails").validate({
          rules: feildsrules,
          messages: messages,
        });
      },
      
    uploadLargeFileToOneDrive: async function() {
        let selfobj = this;
        const fileInput = document.getElementById('fileInput');
        const file = fileInput.files[0];
        const folderId =  ""+this.model.get("one_drive_folder");  // spacific folder//'D99A97EA28CF1302!29359';
        let token = this.model.get("accessToken");
        var jsonObject = JSON.parse(token);
        const accessToken = ""+jsonObject.access_token;
        
        if (!file) {
            alert('Please select a file to upload.');
            return;
        }

        const uploadUrl = `https://graph.microsoft.com/v1.0/me/drives/D99A97EA28CF1302/items/${folderId}:/${file.name}:/createUploadSession`;
        const headers = new Headers({
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        });

        try {
          // Create an upload session
          const uploadSessionResponse = await fetch(uploadUrl, {
              method: 'POST',
              headers: headers,
              body: JSON.stringify({
                  item: {
                      '@microsoft.graph.conflictBehavior': 'rename',
                      name: file.name
                  }
              })
          });

          if (!uploadSessionResponse.ok) {
              const errorData = await uploadSessionResponse.json();
              console.error('Error creating upload session:', errorData);
              alert(`Error creating upload session: ${errorData.error.message}`);
              return;
          }

          const uploadSession = await uploadSessionResponse.json();
          const uploadUrlSession = uploadSession.uploadUrl;

          // Upload the file in chunks
          const chunkSize = 5 * 1024 * 1024; // 5MB chunk size
          let offset = 0;

          while (offset < file.size) {
              const chunk = file.slice(offset, offset + chunkSize);
              const uploadChunkResponse = await fetch(uploadUrlSession, {
                  method: 'PUT',
                  headers: {
                      'Content-Range': `bytes ${offset}-${offset + chunk.size - 1}/${file.size}`
                  },
                  body: chunk
              });

              if (!uploadChunkResponse.ok && uploadChunkResponse.status !== 202) {
                  const errorData = await uploadChunkResponse.json();
                  console.error('Error uploading chunk:', errorData);
                  alert(`Error uploading chunk: ${errorData.error.message}`);
                  return;
              }

              offset += chunk.size;

              // Update progress
              // const progress = Math.round((offset / file.size) * 100);
              // document.getElementById('progressBar').value = progress;
              // document.getElementById('progressText').innerText = `Upload Progress: ${progress}%`;
          }

          // Get the uploaded file details
          const fileDetailsUrl = `https://graph.microsoft.com/v1.0/me/drives/D99A97EA28CF1302/items/${folderId}:/${file.name}`;
          const fileDetailsResponse = await fetch(fileDetailsUrl, {
              method: 'GET',
              headers: {
                  'Authorization': `Bearer ${accessToken}`
              }
          });

          if (fileDetailsResponse.ok) {
              const fileDetails = await fileDetailsResponse.json();
              console.log('Uploaded file details:', fileDetails);
              selfobj.getFiles();
              alert(`File uploaded successfully!\n\nFile ID: ${fileDetails.id}\nName: ${fileDetails.name}\nSize: ${fileDetails.size} bytes`);
              
          } else {
              const errorData = await fileDetailsResponse.json();
              console.error('Error fetching uploaded file details:', errorData);
              alert(`Error fetching uploaded file details: ${errorData.error.message}`);
          }
      } catch (error) {
          console.error('Error:', error);
          alert('An error occurred. Please try again.');
      }
    },

    getFiles: async function (){
      let token = this.model.get("accessToken");
      var jsonObject = JSON.parse(token);
      const accessToken = ""+jsonObject.access_token;
      const folderId = "" + this.model.get("one_drive_folder");
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
                  fileElement.appendChild(fileThumbnail);
                  // fileElement.appendChild(fileName);
                  fileListElement.appendChild(fileElement);
                  console.log(fileListElement);
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
  
  
      render: function () {
        var selfobj = this;
        var source = projecttemp;
        var template = _.template(source);
        $("#" + this.toClose).remove();
        console.log(this.customerList);
        this.$el.html(template({ "model": this.model.attributes , "customerList": this.customerList.models, "customerID": this.customerID}));
        this.$el.addClass("tab-pane in active panel_overflow");
        this.$el.attr("id", this.toClose);
        this.$el.addClass(this.toClose);
        this.$el.data("role", "tabpanel");
        this.$el.data("current", "yes");
        $(".tab-content").append(this.$el);
        $("#" + this.toClose).show();
        this.initializeValidate();
        this.setOldValues();
        $(".ws-select").selectpicker();
        this.attachEvents();
        rearrageOverlays("Projects", this.toClose);

        this.uploadFileEl = $("#projUpload").RealTimeUpload({
          text: 'Drag and Drop or Select a File to Upload.',
          maxFiles: 0,
          maxFileSize: 4194304,
          uploadButton: false,
          notification: true,
          autoUpload: false,
          extension: ['png', 'jpg', 'jpeg', 'gif', 'pdf','docx', 'doc', 'xls', 'xlsx'],
          thumbnails: true,
          action: APIPATH + 'projUpload/',
          element: 'projUpload',
          onSucess: function () {
            selfobj.model.attributes.mediaArr.push(this.elements.uploadList[0].name);
            $('.modal-backdrop').hide();
          }
        });
        $("#dynamicFormFields").empty().append(selfobj.dynamicFieldRenderobj.getform());
        let docUrl = "";
        const attachment_file = this.model.get("attachment_file");
        const file_id = this.model.get("attachment_id");
        if (Array.isArray(attachment_file) && Array.isArray(file_id) && attachment_file.length === file_id.length) {
          for (let i = 0; i < attachment_file.length; i++) {
            const fName = attachment_file[i];
            const ftext = fName.split(".");
            let modifiedFName = fName;
            const file_ids = file_id[i];
            if (ftext[1] === "xls" || ftext[1] === "xlsx") {
              modifiedFName = "excel.png";
              docUrl += "<div id='"+ file_ids +"removeDiv' class='attachedPic' data-show='singleFile'><div class='thumbnail'><div class='centered removeAttach'><img id='removeIMG' class='img-fluid fileImage img-thumbnail' src='" + UPLOADS + '/' + modifiedFName + "' alt=''><div class='buttonShow visableAttach'><span class='attachView'><a href='" + UPLOADS + "/project/" + selfobj.projID + '/' + fName + "' target='_blank'><span class='material-icons'>visibility</span></a></span><span class='deleteAttach deleteAttachment' data-file_id='" + file_ids + "'><span class='material-icons'>delete</span></span></div></div></div></div>";
            } else if (ftext[1] === "pdf") {
              modifiedFName = "pdf.png";
              docUrl += "<div id='"+ file_ids +"removeDiv' class='attachedPic' data-show='singleFile'><div class='thumbnail'><div class='centered removeAttach'><img id='removeIMG' class='img-fluid fileImage img-thumbnail' src='" + UPLOADS + '/' + modifiedFName + "' alt=''/><div class='buttonShow visableAttach'> <span class='attachView'><a href='" + UPLOADS + "/project/" + selfobj.projID + '/' + fName + "' target='_blank'><span class='material-icons'>visibility</span></a></span><span class=' deleteAttach deleteAttachment' data-file_id='" + file_ids + "'><span class='material-icons'>delete</span></span></div></div></div></div>";
            } else {
              docUrl += "<div id='"+ file_ids +"removeDiv' class='attachedPic' data-show='singleFile'><div class='thumbnail'><div class='centered removeAttach'><img id='removeIMG' class='img-fluid fileImage img-thumbnail' src='" + UPLOADS + "/project/" + selfobj.projID + '/' + modifiedFName + "' alt=''/><div class='buttonShow visableAttach'> <span class='attachView'><a href='" + UPLOADS + "/project/" + selfobj.projID + '/' + modifiedFName + "' target='_blank'><span class='material-icons'>visibility</span></a></span><span class=' deleteAttach deleteAttachment' data-file_id='" + file_ids + "'><span class='material-icons'>delete</span></span></div></div></div></div>";
            }
          }
          document.getElementById("attachedDoc").innerHTML += docUrl;
        }

        var __toolbarOptions = [
            ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
            [{ 'header': 1 }, { 'header': 2 }],               // custom button values
            [{ 'direction': 'rtl' }],                         // text direction
            [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
            [{ 'align': [] }],
            ['link'],
              ['clean']                                         // remove formatting button
          ];
        var editor = new Quill($("#description").get(0),{
            modules: {
                toolbar: __toolbarOptions
            },
            theme: 'snow' 
            });
      
            //const delta = editor.clipboard.convert();
            //editor.setContents(delta, 'silent');
            editor.on('text-change', function(delta, oldDelta, source) {
                if (source == 'api') {
                    console.log("An API call triggered this change.");
                  } else if (source == 'user') {
                    var delta = editor.getContents();
                    var text = editor.getText();
                    var justHtml = editor.root.innerHTML;
                    selfobj.model.set({"description":justHtml});
                  }
            });
        return this;
      },
      
      onDelete: function () {
        this.remove();
      },
    });
  
    return projectSingleView;
  });
  