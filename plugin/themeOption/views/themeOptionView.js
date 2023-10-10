
define([
  'jquery',
  'underscore',
  'backbone',
  'minicolors',
  '../models/themeOptionModel',
  '../../readFiles/views/readFilesView',
  'text!../templates/themeOption_temp.html',
], function ($, _, Backbone, minicolors, themeOptionModel, readFilesView, themeOptionTemp) {

  var themeOptionView = Backbone.View.extend({

    initialize: function (options) {
      this.toClose = "themeOptionFilterView";
      var selfobj = this;
      $(".profile-loader").show();
      var mname = Backbone.history.getFragment();
      permission = ROLE[mname];
      this.model = new themeOptionModel();

      readyState = true;
      this.render();
      this.model.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        selfobj.render();
      });
    },
    events:
    {
      "click .multiOptionSel": "multioption",
      "change .txtchange": "updateOtherDetails",
      "change .dropval": "updateOtherDetails",
      "click .selectImg": "updateOtherDetails",
      "change .dropdownVal": "setDropVal",
      "click .savethemeDetails": "savethemeDetails",
      "change .switch": "switch",
      "click .loadMedia": "loadMedia",
      "click .headerImg": "selectHeader",
    },
    updateOtherDetails: function (e) {
      e.stopImmediatePropagation()
      var selfobj = this;
      var toID = $(e.currentTarget).attr("data-id");
      if (toID == "header_layout") {
        var valuetxt = $(e.currentTarget).attr("data-toChange");
        var newdetails = [];
        newdetails["" + toID] = valuetxt;
        selfobj.model.set(newdetails);
        console.log(valuetxt);
      } else {
        var toID = $(e.currentTarget).attr("id");
        var valuetxt = $(e.currentTarget).val();
        var newdetails = [];
        newdetails["" + toID] = valuetxt;
        console.log(newdetails);
        selfobj.model.set(newdetails);
      }
      console.log(this.model);
    },
    switch: function () {
      var selfobj = this;
      var newdetails = [];
      $('.switch input:checkbox').each(function () {
        var $this = $(this);
        var isChecked = $this.is(":checked");
        var value = isChecked ? "yes" : "no";
        var elID = this.id;
        newdetails["" + elID] = value;
        selfobj.model.set(newdetails);
      });
      console.log(this.model);
    },
    setDropVal: function (e) {
      e.stopImmediatePropagation();
      var selfobj = this;
      let id = $(e.currentTarget).attr("id");
      if (id == "fontFamily") {
        let inID = $(e.currentTarget).attr("data-toChange");
        let ob = selfobj.model.get(inID);
        console.log(ob);
        if (typeof (ob) == "string") {
          ob = JSON.parse(ob);
        }
        let elID = $(e.currentTarget).attr("data-toChange");
        ob.fontFamily = $(e.currentTarget).val();
        let newdetails = [];
        newdetails["" + elID] = ob;
        selfobj.model.set(newdetails);
        console.log(newdetails);
      } else if (id == "fontSubset") {
        let inID = $(e.currentTarget).attr("data-toChange");
        let ob = selfobj.model.get(inID);
        console.log(ob);
        if (typeof (ob) == "string") {
          ob = JSON.parse(ob);
        }
        let elID = $(e.currentTarget).attr("data-toChange");
        ob.fontSubset = $(e.currentTarget).val();
        let newdetails = [];
        newdetails["" + elID] = ob;
        selfobj.model.set(newdetails);
        console.log(newdetails);

      } else if (id == "fontWeightStyle") {

        let inID = $(e.currentTarget).attr("data-toChange");
        let ob = selfobj.model.get(inID);
        console.log(ob);
        if (typeof (ob) == "string") {
          ob = JSON.parse(ob);
        }
        let elID = $(e.currentTarget).attr("data-toChange");
        ob.fontWeightStyle = $(e.currentTarget).val();
        let newdetails = [];
        newdetails["" + elID] = ob;
        selfobj.model.set(newdetails);
        console.log(newdetails);

      }
    },
    savethemeDetails: function (e) {
      e.preventDefault();
      let selfobj = this;
      var methodt = "POST";
      if (permission.edit != "yes") {
        alert("You dont have permission to edit");
        return false;
      }

      if ($("#themeDetails").valid()) {
        $(e.currentTarget).html("<span>Saving..</span>");
        $(e.currentTarget).attr("disabled", "disabled");
        this.model.save({}, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler, type: methodt
        }).done(function (res) {
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          if (res.flag == "F") {
            alert(res.msg);
            $(e.currentTarget).html("<span>Error</span>");
          } else {
            $(e.currentTarget).html("<span>Saved</span>");
          }
          setTimeout(function () {
            $(e.currentTarget).html("<span>Save</span>");
            $(e.currentTarget).removeAttr("disabled");
          }, 3000);
        });
      }
    },
    getSelectedFile: function (url) {
      $('.' + this.elm).val(url);
      $('.' + this.elm).change();
      $("#profile_pic_view").attr("src", url);
      $("#profile_pic_view").css({ "max-width": "100%" });
      $('#largeModal').modal('toggle');
      this.model.set({ "cover_image": url });
      this.render();
    },
    loadMedia: function (e) {
      e.stopPropagation();
      $('#largeModal').modal('toggle');
      this.elm = "profile_pic";
      new readFilesView({ loadFrom: "addpage", loadController: this });
    },
    onErrorHandler: function (collection, response, options) {
      alert("Something was wrong ! Try to refresh the page or contact administer. :(");
      $(".profile-loader").hide();
    },
    initializeValidate: function (e) {
      var selfobj = this;
      var feilds = {

      };
      var feildsrules = feilds;
      // var dynamicRules = selfobj.dynamicFieldRenderobj.getValidationRule();

      // if (!_.isEmpty(dynamicRules)) {
      //   var feildsrules = $.extend({}, feilds, dynamicRules);

      // }
      var messages = {

      };
      $("#themeDetails").validate({
        rules: feildsrules,
        messages: messages,
      });

      $('.color').minicolors({
        format: "rgb",
        opacity: true,
        change: function (value, opacity) {
          console.log($(this));
          if ($(this).hasClass("subObj")) {
            let inID = $(this).attr("data-toChange");
            let ob = selfobj.model.get(inID);
            console.log(ob);
            if (typeof (ob) == "string") {
              ob = JSON.parse(ob);
            }
            ob.color = value;
            let elID = $(this).attr("data-toChange");
            let newdetails = [];
            newdetails["" + elID] = ob;
            selfobj.model.set(newdetails);
          } else {
            let elID = this.id;
            let newdetails = [];
            newdetails["" + elID] = value;
            selfobj.model.set(newdetails);
          }
        },
        theme: 'bootstrap',
      });
    },

    render: function () {
      var selfobj = this
      var template = _.template(themeOptionTemp);
      this.$el.html(template({ closeItem: this.toClose, "model": this.model.attributes }));
      $(".app_playground").append(this.$el);
      this.initializeValidate();
      $('select').selectpicker();
      setToolTip();
      return this;
    }
  });

  return themeOptionView;

});
