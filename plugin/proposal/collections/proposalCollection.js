define([
    'underscore',
    'backbone',
    '../models/proposalModel'
  ], function(_, Backbone,proposalModel){
  
    var proposalCollection = Backbone.Collection.extend({
      proposal_id:null,
        model: proposalModel,
        initialize : function(){
  
        },
        url : function() {
          return APIPATH+'proposalList';
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
  
    return proposalCollection;
  
  });