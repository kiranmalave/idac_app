define([
  'jquery',
  'underscore',
  'backbone',
  'bootstrap',
  'jqueryCookie',
  'Waves',
  'adminjs',
  'bootstrapSelect',
  'notify',
  'custom',
  'plugin/login/views/loginView',
  'plugin/login/views/resetPasswordRequestView',
  'plugin/dashboard/views/dashboardView',
  'plugin/userProfile/views/userProfileView',
  'plugin/admin/views/adminView',
  'plugin/userRole/views/userRoleView',
  'plugin/menu/views/menuView',
  'plugin/infoSettings/views/infoSettingsView',
  'plugin/category/views/categoryView',
  'plugin/theme/views/themeView',
  'plugin/pagesMaster/views/pagesMasterView',
  'plugin/pagesMaster/views/pagesMasterSingleDesign',
  'plugin/dynamicForm/views/dynamicFormSingleView',
  'plugin/admin/views/accessDetailsView',
  'plugin/pagesMenuMaster/views/pagesMenuMasterView',
  'plugin/themeOption/views/themeOptionView',
  'plugin/task/views/taskView',
  'plugin/customer/views/customerView',
  'plugin/branch/views/branchView',
  'plugin/proposal/views/proposalView',
  'plugin/project/views/projectView',
  'plugin/proposalTemplate/views/proposalTemplateView',
  'plugin/taxInvoice/views/taxInvoiceView',
  'plugin/readFiles/views/readFilesView',
  'plugin/ourclients/views/ourClientsView',
  'plugin/ourteam/views/ourTeamView',
  'plugin/testimonials/views/testimonialsView',
  'plugin/faq/views/faqView',
  'plugin/dynamicForms/views/dynamicFormsView',
  'text!../templates/appMain_temp.html',
  'text!../templates/appFull_temp.html',
  'text!../templates/sideNav_temp.html',
  'text!../templates/topNav_temp.html',
], function ($, _, Backbone, bootstrap, jqueryCookie, Waves, adminjs, bootstrapSelect, notify, custom, loginView, resetPasswordRequestView, dashboardView, userProfileView, adminView, userRoleView, menuView, infoSettingsView, categoryView, themeView, pagesMasterView, pagesMasterSingleDesign, dynamicFormSingleView, accessDetailsView, pagesMenuMasterView, themeOptionView, taskView, customerView,branchView, proposalView, projectView,proposalTemplateView, taxInvoiceView, readFilesView, ourClientsView, ourTeamView, testimonialsView, faqView, dynamicFormsView, appMain_temp, appFull_temp, sidebar, topNav) {

  var AppRouter = Backbone.Router.extend({
    routes: {
      'logout': 'logoutlink',
      'login': 'loginlink',
      'resetpasswordrequest': 'resetPasswordRequest',
      'dashboard': 'dashboardview',
      'userProfile': 'userProfileView',
      'usersList': 'adminView',
      'roleList': 'userRoleView',
      'infoDetails': 'infoSettingsView',
      'theme': 'themeView',
      'pages': "pages",
      'access-control': 'accessDetailsView',
      'pagesMenuMaster': 'pagesMenuMaster',
      'menuList': 'menuView',
      'pageCustomFields/:menuID': "addCustomField",
      'addnewpage/:pageID': "addpage",
      'addnewblog/:blogID': "addblog",
      'customer': 'customerView',
      'branch': 'branchView',
      'proposal': 'proposalView',
      'proposalTemplate': 'proposalTemplateView',
      'project': 'projectView',
      'theme-option': 'themeOptionView',
      'media': 'readFilesView',
      'category': 'categoryView',
      'task': 'taskView',
      'invoice': 'invoiceView',
      'ourclients': 'ourClientsView',
      'ourteam': 'ourTeamView',
      'testimonials': 'testimonialsView',
      'faqs': 'faqView',
      'dynamicForms': 'dynamicFormsView',
      'formMaster': 'formMasterView',
      'formQuestions/:formID': 'formQuestionsView',
      '*actions': 'defaultAction'
    }
  });

  var initialize = function () {
    var bbauth = $.cookie('bbauth');
    ADMINNAME = $.cookie('name');
    ISMENUSET = false;
    ROLE = '';
    function preTemp() {

      // setup toggle and other function for menu

      if (typeof ($.cookie('authid')) == "undefined") {
        app_router.navigate("login", { trigger: true });
        return false;
      } else {
        var template = _.template(appMain_temp);
        $("#master__load").addClass("nav-md");
        $("#master__load").empty().append(template());
        var sidebarTemplate = _.template(sidebar);
        var topNavTemplate = _.template(topNav);
        $(".main_container").append(sidebarTemplate({ menuDetails: ISMENUSET }));
        $(".main_container").append(topNavTemplate());
        //setsidbar();
        var mname = Backbone.history.getFragment();
        if (!ISMENUSET) {
          if (typeof (localStorage.roleDetails) == "undefined" || localStorage.roleDetails == "[]") {
            app_router.navigate("logout", { trigger: true });
          }
          ROLE = JSON.parse(localStorage.roleDetails);
          var res = $.ajax({
            url: APIPATH + 'getMenuList',
            method: 'GET',
            async: false,
            datatype: 'JSON',
            beforeSend: function (request) {
              request.setRequestHeader("token", $.cookie('_bb_key'));
              request.setRequestHeader("SadminID", $.cookie('authid'));
              request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
              request.setRequestHeader("Accept", 'application/json');
            },
            success: function (res) {
              if (res.flag == "F") {
                alert(res.msg);
                return false;
              }
              if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
              if (res.flag == "S") {
                ISMENUSET = res.data;
                var template = _.template(appMain_temp);
                $("#master__load").addClass("nav-md");
                $("#master__load").empty().append(template());
                var sidebarTemplate = _.template(sidebar);
                var topNavTemplate = _.template(topNav);
                $(".main_container").append(sidebarTemplate({ menuDetails: ISMENUSET }));
                $(".main_container").append(topNavTemplate());
                setsidbar();
              }
            }
          });
          highlightMenu(mname);

          if (res.promise()) {
            return true;
          }

        } else {

          var template = _.template(appMain_temp);
          $("#master__load").addClass("nav-md");
          $("#master__load").empty().append(template());
          var sidebarTemplate = _.template(sidebar);
          var topNavTemplate = _.template(topNav);
          $(".main_container").append(sidebarTemplate({ menuDetails: ISMENUSET }));
          $(".main_container").append(topNavTemplate({ menuDetails: ISMENUSET }));
          setsidbar();
          highlightMenu(mname);
          return true;
        }
      }

    }
    //below three classes added for menu highlight by sanjay
    function highlightMenu(mname) {
      try {

        $(".menu").find("li").removeClass("kdark");
        $(".menu").find(".menu-toggle").removeClass("dark");
        let mname = Backbone.history.getFragment();

        $(".menu li").each(function (index) {
          if (mname == $(this).attr("data-link")) {
            $(this).addClass("kdark");
            $(this).closest(".parentItem").find("ul").show();
            $(this).closest(".parentItem").find(".menu-toggle").addClass("dark toggled");
          }
        });
      } catch (error) {
        console.log("error menu active class" + error.message);
      }
    }
    //end

    app_router = new AppRouter;

    app_router.on('route:defaultAction', function (actions) {
      if (typeof ($.cookie('authid')) == "undefined") {
        app_router.navigate("login", { trigger: true });
      } else {
        app_router.navigate("dashboard", { trigger: true });
      }
    });

    app_router.on('route:dashboardview', function () {
      var validate = preTemp();
      if (validate) {
        new dashboardView();
        setsidbar();
      }
    });

    app_router.on('route:userProfileView', function () {
      var validate = preTemp();
      if (validate) {
        new userProfileView();
        setsidbar();
      }
    });

    app_router.on('route:accessDetailsView', function () {
      var validate = preTemp();
      if (validate) {
        new accessDetailsView();
      }
    });

    app_router.on('route:adminView', function () {
      var validate = preTemp();
      if (validate) {
        new adminView({});
        setsidbar();
      }
    });

    app_router.on('route:userRoleView', function () {
      var validate = preTemp();
      if (validate) {
        new userRoleView();
        setsidbar();
      }
    });

    app_router.on('route:menuView', function () {
      var validate = preTemp();
      if (validate) {
        new menuView();
        setsidbar();
      }
    });


    app_router.on('route:infoSettingsView', function (actions) {
      var validate = preTemp();
      if (validate) {
        new infoSettingsView();
        setsidbar();
      }

    });

    app_router.on('route:categoryView', function (action) {
      var validate = preTemp();
      if (validate) {
        new categoryView({ action: action });
        //setsidbar();
      }
    });
    app_router.on('route:themeView', function (action) {
      var validate = preTemp();
      if (validate) {
        new themeView({ action: action });
        //setsidbar();
      }
    });
    app_router.on('route:pages', function (action) {

      var validate = preTemp();
      if (validate) {
        new pagesMasterView({ action: action });
        //setsidbar();
      }
    });
    app_router.on('route:addpage', function (action) {

      var validate = preTemp();
      if (validate) {
        new pagesMasterSingleDesign({ action: action });
        //setsidbar();
      }
    });

    app_router.on('route:addCustomField', function (action) {
      var validate = preTemp();
      if (validate) {
        new dynamicFormSingleView({ menuId: action });
        //setsidbar();
      }
    });

    app_router.on('route:customerView', function (action) {
      var validate = preTemp();
      if (validate) {
        new customerView({ action: action });
        //setsidbar();
      }
    });
    app_router.on('route:branchView', function (action) {
      var validate = preTemp();
      if (validate) {
        new branchView({ action: action });
        //setsidbar();
      }
    });
    app_router.on('route:proposalView', function (action) {
      var validate = preTemp();
      if (validate) {
        new proposalView({ action: action });
        //setsidbar();
      }
    });

    app_router.on('route:projectView', function (action) {
      var validate = preTemp();
      if (validate) {
        new projectView({ action: action });
        //setsidbar();
      }
    });

    app_router.on('route:proposalTemplateView', function (action) {
      var validate = preTemp();
      if (validate) {
        new proposalTemplateView({ action: action });
        //setsidbar();
      }
    });
    app_router.on('route:themeOptionView', function (action) {
      var validate = preTemp();
      if (validate) {
        new themeOptionView({ action: action });
        //setsidbar();
      }
    });

    app_router.on('route:taskView', function (action) {
      var validate = preTemp();
      if (validate) {
        new taskView({ action: action });
        //setsidbar();
      }
    });


    app_router.on('route:loginlink', function (actions) {
      var loc = window.location.pathname;
      var template = _.template(appFull_temp);
      $("#master__load").addClass("login");
      $("#master__load").empty().append(template());
      new loginView();
    });
    app_router.on('route:pagesMenuMaster', function (action) {
      var validate = preTemp();
      if (validate) {
        new pagesMenuMasterView({ action: action });
        //setsidbar();
      }
    });
    app_router.on('route:readFilesView', function (action) {
      var validate = preTemp();
      if (validate) {
        new readFilesView({ action: action, mnFolder: 'Y' });
        //setsidbar();
      }
    });
    app_router.on('route:invoiceView', function (action) {
      var validate = preTemp();
      if (validate) {
        new taxInvoiceView({ action: action });
        //setsidbar();
      }
    });

    app_router.on('route:ourClientsView', function (action) {
      console.log(action);
      var validate = preTemp();
      if (validate) {
        new ourClientsView({ action: action });
        //setsidbar();
      }
    });

    app_router.on('route:ourTeamView', function (action) {
      console.log(action);
      var validate = preTemp();
      if (validate) {
        new ourTeamView({ action: action });
        //setsidbar();
      }
    });

    app_router.on('route:testimonialsView', function (action) {
      console.log(action);
      var validate = preTemp();
      if (validate) {
        new testimonialsView({ action: action });
        //setsidbar();
      }
    });

    app_router.on('route:faqView', function (action) {
      console.log(action);
      var validate = preTemp();
      if (validate) {
        new faqView({ action: action });
      }
    });

    app_router.on('route:dynamicFormsView', function (action) {
      var validate = preTemp();
      if (validate) {
        new dynamicFormsView({ action: action });
      }
    });

    app_router.on('route:resetPasswordRequest', function () {
      var resetPasswordRequest = new resetPasswordRequestView({});
    });

    app_router.on('route:logoutlink', function () {
      var r = confirm("Are you sure you want to Logout?");
      if (r == false) {
        return false;
      }
      $.ajax({
        url: APIPATH + 'logout',
        method: 'POST',
        data: { adminID: $.cookie("authid"), key: $.cookie("_bb_key") },
        datatype: 'JSON',
        beforeSend: function (request) {
          request.setRequestHeader("token", $.cookie('_bb_key'));
          request.setRequestHeader("SmemberID", $.cookie('authid'));
          request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
          request.setRequestHeader("Accept", 'application/json');
        },
        success: function (res) {
          $.removeCookie('_bb_key', { path: COKI });
          $.removeCookie('fname', { path: COKI });
          $.removeCookie('lname', { path: COKI });
          $.removeCookie('authid', { path: COKI });
          $.removeCookie('avtar', { path: COKI });
          $.removeCookie('bbauth', { path: COKI });
          $.removeCookie('name', { path: COKI });
          $.removeCookie('uname', { path: COKI });
          delete $.cookie('authid');
          delete $.cookie('_bb_key');
          delete ADMINNAME;
          localStorage.removeItem("roleDetails");
          app_router.navigate("login", { trigger: true });
        }
      });
    });
    Backbone.history.start();
  };
  return {
    initialize: initialize
  };
});
