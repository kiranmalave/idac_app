define([
    'underscore',
    'backbone',
    '../models/proposalTemplateModel'
  ], function(_, Backbone,proposalTemplateModel){
  
    var proposalTemplateCollection = Backbone.Collection.extend({
      temp_id:null,
        model: proposalTemplateModel,
        initialize : function(){
  
        },
        url : function() {
          return APIPATH+'proposalTemplateList';
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
  
    return proposalTemplateCollection;
  
  });