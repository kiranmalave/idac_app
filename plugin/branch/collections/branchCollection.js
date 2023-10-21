define([
  'underscore',
  'backbone',
  '../models/branchModel'
], function(_, Backbone,branchModel){

  var branchCollection = Backbone.Collection.extend({
    branchID :null,
      model: branchModel,
      initialize : function(){
      },
      url : function() {
        return APIPATH+'branchList';
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

  return branchCollection;

});