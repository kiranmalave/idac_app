define([
    'underscore',
    'backbone',
    '../models/projectModel'
  ], function(_, Backbone,projectModel){
  
    var projectCollection = Backbone.Collection.extend({
      project_id:null,
        model: projectModel,
        initialize : function(){
  
        },
        url : function() {
          return APIPATH+'projectList';
        },
        parse : function(response){
          this.pageinfo = response.paginginfo;
          this.totalRecords = response.totalRecords;
          this.endRecords = response.end;
          this.flag = response.flag;
          this.msg = response.msg;
          this.loadstate = response.loadstate;
          return response.data;
        }
    });
  
    return projectCollection;
  
  });