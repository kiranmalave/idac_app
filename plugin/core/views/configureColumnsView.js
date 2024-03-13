define([
    'jquery',
    'underscore',
    'backbone',
    'validate',
    'datepickerBT',
    '../../dynamicForm/collections/dynamicStdFieldsCollection',
    '../../menu/models/singleMenuModel',
    'text!../templates/configureColumnsTemp.html',
  ], function ($, _, Backbone, validate, datepickerBT,dynamicStdFieldsCol,singleMenuModel,configureColumnsTemp) {

    var configureColumnsView = Backbone.View.extend({
        parentObj:null,
        initialize: function (options) {
            var selfobj = this;
            this.filteredList = [];
            this.menuId = options.menuId;
            this.parentObj = options.ViewObj;
            this.stdColumn = options.stdColumn;
            this.arrangedColumnList = [];
            $(".column-loader").show();
            this.dynamicStdFieldsList = new dynamicStdFieldsCol();
            this.menuList = new singleMenuModel();
            selfobj.getMenuList();
            selfobj.render();
        },

        getMenuList: function (e) {
            var selfobj = this;
            selfobj.menuList.set({"menuID":this.menuId});
            this.menuList.fetch({
            headers: {
                'contentType': 'application/x-www-form-urlencoded',
                'SadminID': $.cookie('authid'),
                'token': $.cookie('_bb_key'),
                'Accept': 'application/json'
            },
            error: selfobj.onErrorHandler
            }).done(function (result) {
                // console.log("getMenuList....",result);
                if (result.statusCode == 994) {
                    app_router.navigate("logout", { trigger: true });
                }
                if(result.data[0] != undefined){
                    selfobj.tableName = result.data[0].table_name;
                }
                
                /********/

                if (result.data[0].metadata && result.data[0].metadata != undefined && result.data[0].metadata.trim() !== '') {
                    selfobj.metadata  = JSON.parse(result.data[0].metadata);
                } 
                if (result.data[0].c_metadata && result.data[0].c_metadata != undefined && result.data[0].c_metadata.trim() !== '') {
                    selfobj.c_metadata  = JSON.parse(result.data[0].c_metadata);
                    selfobj.arrangedColumnList = selfobj.c_metadata;
                }
                if (result.data[0].metadata && result.data[0].metadata != undefined) {
                    var metadatas = selfobj.metadata;
                    if(metadatas != undefined){
                        const flatArray = Object.values(metadatas).flatMap(row => {
                        const fields = [];
                        if (row.col1 && row.col1.fieldID !== undefined) {
                            fields.push({ fieldID: row.col1.fieldID, fieldLabel: row.col1.fieldLabel, fieldType: row.col1.fieldType,column_name: row.col1.column_name,linkedWith: row.col1.linkedWith,fieldOptions: row.col1.fieldOptions,dateFormat: row.col1.dateFormat,displayFormat: row.col1.displayFormat,parentCategory: row.col1.parentCategory});
                        }
                        if (row.col2 && row.col2.fieldID !== undefined) {
                            fields.push({ fieldID: row.col2.fieldID, fieldLabel: row.col2.fieldLabel, fieldType: row.col2.fieldType,column_name: row.col2.column_name,linkedWith: row.col2.linkedWith,fieldOptions: row.col2.fieldOptions,dateFormat: row.col2.dateFormat,displayFormat: row.col2.displayFormat,parentCategory: row.col2.parentCategory});
                        }
                        if (row.col3 && row.col3.fieldID !== undefined) {
                            fields.push({ fieldID: row.col3.fieldID, fieldLabel: row.col3.fieldLabel, fieldType: row.col3.fieldType,column_name: row.col3.column_name,linkedWith: row.col3.linkedWith,fieldOptions: row.col3.fieldOptions,dateFormat: row.col3.dateFormat,displayFormat: row.col3.displayFormat,parentCategory: row.col3.parentCategory});
                        }
                        return fields;
                        });
                        selfobj.customColumnList = flatArray;
                    }
                }

                /********/

                if(selfobj.dynamicStdFieldsList && selfobj.dynamicStdFieldsList != undefined){
                    selfobj.dynamicStdFieldsList.fetch({
                    headers: {
                        'contentType': 'application/x-www-form-urlencoded',
                        'SadminID': $.cookie('authid'),
                        'token': $.cookie('_bb_key'),
                        'Accept': 'application/json'
                    },
                    error: selfobj.onErrorHandler,
                    type: 'post',
                    data: { "table": "ab_" + selfobj.tableName }
                    }).done(function (res) {
                        // console.log("dynamicStdFieldsList....",res);
                        // console.log("result.dynamicFields....", result.data.dynamicFields);
                    if(result.data.dynamicFields){
                        const collectedDataFields = result.data.dynamicFields.map(item => item.column_name);
                        // console.log("collectedDataFields....",collectedDataFields);
                        const filteredDynamicStdFieldsList = selfobj.dynamicStdFieldsList.filter(model => {
                        const field = model.attributes.Field;
                        return !collectedDataFields.includes(field);
                        });
                        // console.log("filteredDynamicStdFieldsList....",filteredDynamicStdFieldsList);
                        // var filteredList = filteredDynamicStdFieldsList.filter(item => {
                        // if(selfobj.stdColumn){
                        //     const fieldInStdColumn = selfobj.stdColumn.includes(item.attributes.Field);
                        //     return !fieldInStdColumn;
                        // }
                        // });
                        // console.log("filteredList....",filteredList);
                        filteredDynamicStdFieldsList.forEach(function(data) {
                            const newField = {
                            fieldType : data.attributes.Type, 
                            fieldLabel: formatFieldLabel(data.attributes.Field),
                            column_name: data.attributes.Field, 
                            };
                
                            function formatFieldLabel(label) {
                            return label.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
                            }
                            selfobj.filteredList.push(newField);
                        });
                    }
                    if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
                    selfobj.render();
                    $(".column-loader").hide();
                    });
                }
            });
        },

        events:
        {
            "click .changeConfiguration": "changeConfiguration",
            "click .colseConfigure": "closeModal",
        },

        attachEvents: function () {
            this.$el.off('click', '.changeConfiguration', this.changeConfiguration);
            this.$el.on('click', '.changeConfiguration', this.changeConfiguration.bind(this));
            this.$el.off('click', '.colseConfigure', this.closeModal);
            this.$el.on('click', '.colseConfigure', this.closeModal.bind(this));
        },

        onErrorHandler: function (collection, response, options) {
            alert("Something was wrong ! Try to refresh the page or contact administer. :(");
            $(".column-loader").hide();
        },
        
        initializeValidate: function () {
            var selfobj = this;
        },

        setOldValues: function () {
            var selfobj = this;
        },

        changeConfiguration: function (e) {
            var selfobj = this;
            var column_name = $(e.currentTarget).attr("id");
            var fieldElement = $(".fieldList .fieldRows[data-column_name='" + column_name + "']");
            var checkbox = fieldElement.find('input[type="checkbox"]');
            if (checkbox.prop('checked')) {
                checkbox.prop('checked', true);
                fieldElement.detach();
                let fieldsSort = $("<div>",{
                    class:"fieldsSort",
                });
                fieldElement.find('.hover-text-tooltip').before(fieldsSort);
                $("#sortable-list").append(fieldElement);
            } else {
                checkbox.prop('checked', false);
                fieldElement.detach();
                fieldElement.find('.fieldsSort').remove();
                $("#allColumnsList").append(fieldElement);
            }
            selfobj.saveForm(e);
        },
        
        closeModal: function(e) {
            var selfobj = this;
            $('#customColumnConfigure').removeClass('open');
            selfobj.parentObj.getColumnData();
            selfobj.parentObj.filterSearch();
        },

        saveForm: function (event) {
            var selfobj = this;
            var draggedElements = $("#sortable-list .fieldRows");
            var fieldDataArray = [];
            draggedElements.each(function () {
            var fieldID = $(this).data("fieldid");
            var fieldLabel = $(this).data("fieldlabel");
            var fieldType = $(this).data("fieldtype");
            var column_name = $(this).data("column_name");
            var linkedWith = $(this).data("linkedwith");
            var fieldOptions = $(this).data("fieldoptions");
            var dateFormat = $(this).data("dateformat");
            var displayFormat = $(this).data("displayformat");
            var parentCategory = $(this).data("parentcategory");
            var fieldObject = {
                fieldID: fieldID,
                fieldLabel: fieldLabel,
                fieldType: fieldType,
                column_name: column_name,
                linkedWith: linkedWith,
                fieldOptions: fieldOptions,
                dateFormat: dateFormat,
                displayFormat: displayFormat,
                parentCategory: parentCategory,
            };
            fieldDataArray.push(fieldObject);
            });
            var jsonData = JSON.stringify(fieldDataArray);
            let method = "POST";
            $.ajax({
                type: 'POST',
                url: APIPATH+'c_metadata',
                data: {menuId:selfobj.menuId, htmlContent: jsonData, method:method },
                beforeSend: function (request) {
                request.setRequestHeader("token",$.cookie('_bb_key'));
                request.setRequestHeader("SadminID",$.cookie('authid'));
                request.setRequestHeader("contentType",'application/x-www-form-urlencoded');
                request.setRequestHeader("Accept",'application/json');
                },
                success: function (res) {
                    if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
                    if(res.flag == "F"){
                        alert(res.msg);
                    }else{
                        console.log("else");
                    }
                },
                error: function (error) {
                console.error('Error saving HTML structure:', error);
                }
            });
            selfobj.setupSortable();

            var wsFieldElements = $("#sortable-list").find(".fieldRows");
            if (wsFieldElements.length > 0) {
                $("#sortable-heading").show();
            } else {
                $("#sortable-heading").hide();
            }

            var wsFieldElements = $("#allColumnsList").find(".fieldRows");
            if (wsFieldElements.length > 0) {
                $("#allColumns-heading").show();
            } else {
                $("#allColumns-heading").hide();
            }
        },

        setupSortable: function(event) {
            var selfobj = this;
            var $elm = $("#sortable-list");
            var isSort = $elm.sortable("instance");
            if (isSort == undefined) {
                $elm.sortable({
                    placeholder: "ui-state-highlight",
                    forcePlaceholderSize: true,
                    update: function(event, ui) {
                      setTimeout(function() {
                        selfobj.saveForm(event);
                      }, 1000);
                    }
                });
            } else {
                $elm.sortable("refresh");
            }
        },
        
        transformFieldTypesList:function(fieldList) {
            var selfobj = this;  
            if (fieldList) {
                fieldList.forEach(function (data) {
                    selfobj.transformFieldType(data);
                });
            }
        },

         transformFieldType:function(data) {
            var Numeric = ["TINYINT","SMALLINT","MEDIUMINT","INT","BIGINT","DECIMAL","FLOAT","DOUBLE","REAL","BIT","BOOLEAN","SERIAL"];
            var Text = ["CHAR","VARCHAR","TEXT","TINYTEXT","MEDIUMTEXT","LONGTEXT","BINARY","VARBINARY","BLOB","TINYBLOB","MEDIUMBLOB","LONGBLOB"];
            var Datepicker = ["DATE","DATETIME","TIMESTAMP","YEAR"];
            Numeric = Numeric.map(function (element) {
                return element.toLowerCase();
              });
              Text = Text.map(function (element) {
                return element.toLowerCase();
              });
              Datepicker = Datepicker.map(function (element) {
                return element.toLowerCase();
              });
            const fieldType = data.fieldType;
            const startIndex = fieldType.indexOf("(");
            const extractedType = startIndex !== -1 ? fieldType.substring(0, startIndex) : fieldType;
        
            if (extractedType === 'varchar' || Text.includes(data.fieldType)) {
                data.fieldType = 'Text';
            } else if (extractedType === 'enum' || data.fieldType === 'set') {
                data.fieldType = 'Dropdown';
            } else if (extractedType === 'int' || extractedType === 'int unsigned' || Numeric.includes(data.fieldType)) {
                data.fieldType = 'Number';
            } else if (data.fieldType == 'date' || data.fieldType == 'Datepicker') {
                data.fieldType = 'Date';
            } else if (data.fieldType == 'timestamp') {
                data.fieldType = 'Time';
            } else if (data.fieldType == 'datetime') {
                data.fieldType = 'Date Time';
            } else{
                data.fieldType = data.fieldType;
            }
        },
      
        render: function () {
            var selfobj = this;  
            $("#customColumnConfigure").empty();
            var source = configureColumnsTemp;
            var template = _.template(source);
            if ((selfobj.customColumnList) && (selfobj.arrangedColumnList)) {
                selfobj.customColumnList = selfobj.customColumnList.filter(function (customField) {
                    return !selfobj.arrangedColumnList.some(function (arrangedField) {
                        return customField.column_name === arrangedField.column_name;
                    });
                });
            }
            if((selfobj.filteredList) && (selfobj.arrangedColumnList)) {
                selfobj.filteredList = selfobj.filteredList.filter(function (customField) {
                    return !selfobj.arrangedColumnList.some(function (arrangedField) {
                        return customField.column_name === arrangedField.column_name;
                    });
                });
            }
            selfobj.transformFieldTypesList(selfobj.customColumnList);
            selfobj.transformFieldTypesList(selfobj.filteredList);
            selfobj.transformFieldTypesList(selfobj.arrangedColumnList);

            var colName = ['country_id', 'state_id', 'city_id','customer_id'];
            var fieldName = ['Country Name', 'State Name', 'City Name','Customer Name'];
            
            selfobj.filteredList.forEach((column) => {
                var index = colName.indexOf(column.column_name);
                column.fieldLabel = index !== -1 ? fieldName[index] : column.fieldLabel;
            });   
            
            selfobj.arrangedColumnList.forEach((column) => {
                var index = colName.indexOf(column.column_name);
                column.fieldLabel = index !== -1 ? fieldName[index] : column.fieldLabel;
            });   

            this.$el.html(template({"customColumnList": selfobj.customColumnList,"arrangedColumnList": selfobj.arrangedColumnList,"filteredList":selfobj.filteredList}));
            $("#customColumnConfigure").append(this.$el);
            $(".ws_ColumnConfigure").addClass("open");
            if(selfobj.arrangedColumnList && selfobj.arrangedColumnList.length == 0){
                $("#sortable-heading").hide();
            }else{
                $("#sortable-heading").show();
            }
            if(selfobj.customColumnList && selfobj.customColumnList.length == 0 && selfobj.filteredList && selfobj.filteredList.length == 0){
                $("#allColumns-heading").hide();
            }else{
                $("#allColumns-heading").show();
            }
            this.initializeValidate();
            this.setOldValues();
            this.attachEvents();
            selfobj.setupSortable();
            setToolTip();
            return this;
        },
            
        onDelete: function () {
        this.remove();
        },

    });
    return configureColumnsView;
  });
  