(function($, window, document, undefined) {
 
    $.fn.templateDesign = function( options ) {
    
        var __rows =0;
        var __current_col_edit = "";
        var __elementsfn = [];
        var __columnsSize = {"col-1":{"type":"col-1","size":"12"},"col-2":{"type":"col-2","size":"6,6"},"col-3":{"type":"col-3","size":"8,4"},"col-4":{"type":"col-4","size":"4,4,4"},"col-5":{"type":"col-5","size":"3,3,3,3"},"col-6":{"type":"col-6","size":"3,9"},"col-6":{"type":"col-6","size":"3,9"},"col-7":{"type":"col-7","size":"3,6,3"},"col-8":{"type":"col-8","size":"9,3"},"col-9":{"type":"col-9","size":"2,2,2,2,2,2"},"col-10":{"type":"col-10","size":"2,8,2"},"col-11":{"type":"col-11","size":"2,2,2,6"},"col-12":{"type":"col-12","size":"3,2,2,2,3"}};
        var __margintype= {"ws_m_0":"margin-top","ws_m_1":"margin-right","ws_m_2":"margin-bottom","ws_m_3":"margin-left"};
        var __paddingtype= {"ws_p_0":"padding-top","ws_p_1":"padding-right","ws_p_2":"padding-bottom","ws_p_3":"padding-left"};
        var __bordertype= {"ws_b_0":"border-top","ws_b_1":"border-right","ws_b_2":"border-bottom","ws_b_3":"border-left"};
        var __coltypeMob= {"12/12":"col-xs-12","11/12":"col-xs-11","10/12":"col-xs-10","9/12":"col-xs-9","8/12":"col-xs-8","7/12":"col-xs-7","6/12":"col-xs-6","5/12":"col-xs-5","4/12":"col-xs-4","3/12":"col-xs-3","2/12":"col-xs-2","1/12":"col-xs-1"};
        var __coltypTab= {"12/12":"col-sm-12","11/12":"col-sm-11","10/12":"col-sm-10","9/12":"col-sm-9","8/12":"col-sm-8","7/12":"col-sm-7","6/12":"col-sm-6","5/12":"col-sm-5","4/12":"col-sm-4","3/12":"col-sm-3","2/12":"col-sm-2","1/12":"col-sm-1"};
        var __toolbarOptions = [
            ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
            ['blockquote', 'code-block'],
            [{ 'header': 1 }, { 'header': 2 }],               // custom button values
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
            [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
            [{ 'direction': 'rtl' }],                         // text direction
            [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
            [{ 'font': [] }],
            [{ 'align': [] }],
            ['link'],
            ['clean']                                         // remove formatting button
          ];
        
    // Plugin defaults – added as a property on our plugin function.
    $.fn.templateDesign.defaults = {
        color: "red",
        background: "yellow",
        playground:null,
        nextbtn:null,
        savebtn:null,
        temptemplate:null,
        version:"inline",
        playgroundElements:null,
        mediaModel:null,
        designMode:'inline',
        elements:{
            heading:false,
            paragraph:true,
            image:true,
            button:true,
            link:true,
            video:true,
            social:true,
            customHtml:true,
            icons:false,
            separators:false,
            hover_box:false,
            tabs:false,
            accordion:false,
            tour:false,
            google_map:false,
            charts:false,
            post_grid:false,
            
        },
        layout:{
            row:true,
        },
        setupPlayground:function(){
            
           
        },
        HTMLUpdate : function(){
        
        },
    };  
    
    // This is the easiest way to have default options.
    var settings = $.extend({},$.fn.templateDesign.defaults, options );
    var playground = settings.playground;
    var savebtn = settings.savebtn;
    var temptemplate = settings.temptemplate;
    var playgroundElements = settings.playgroundElements;
    var mediaModel = settings.mediaModel;
    var designMode = settings.designMode;
    var activeElement = null;
    var evt="";
    var inel_add = $("<div>",{class:"col-action default","data-action":"add",title:"Add Element"}).append("<span class='material-icons'>add</span><br/>Element");
    setupDropable();
    function setupPlayground(){
        if(playground == null){
            console.log("playground element not found");
            return false;
        }else{
            //playground.empty();
            if(settings.version == "inline"){
                playground.addClass("designMode");
            }else{
                playground.removeClass("designMode");
            }
            if (playground.is(':empty')){
                playground.append("<div class='defaultView'><h3>Every great design starts with a blank page, and this is your moment to make your mark. So don't hold back. Dive in fearlessly, and let your creativity guide you.</h3></div>");    
            }
            playground.after("<div class='addRow ws_last_row' data-toggle='tooltip'  data-placement='top' title='Add Section'><i class='material-icons'>add</i><br>Add Section</div>");
            playground.addClass("ws-playground");$( document ).tooltip();
        }
    }
    function setuppPlaygroundElements(){

        if(playgroundElements == null){
            console.log("playground elements element not found");
            return false;
        }else{
            playgroundElements.empty();
            playgroundElements.addClass("ws-playground-elements");
        }
        playgroundElements.append("<div class='ws-element-container ws-right-actions'></div>");
        $(".ws-element-container").append("<div class='ws-section-header' data-show='element-list'><h2>Elements</h2><span class='ws_close_overlay'><i class='material-icons'>close</i></span></div><div class='element-list ws-list-view'></div>");
        $.each(settings.elements,function(index,val){

            if(val){
                __elementsfn[index]();
            }
        });
        $("body").on("mouseover",".ws-data-element",function(){
            console.log("on hover"+($(this).height()));
            let elhe =$(this).height();
            let scroll = $(document).scrollTop();
            let scrollEl = $(this).offset().top;
            let elw = $(this).width();
            $(this).find(".elm-action").css("left",((elw/2)-30)); 
            if(scrollEl>scroll){
                $(this).find(".elm-action").css("top",10);
            }else if(scrollEl<scroll){
                let m = (scroll - scrollEl + 50);
                
                if(m > elhe){
                    $(this).find(".elm-action").css("top",10); 
                }else{
                    $(this).find(".elm-action").css("top",m); 
                }
            }
           
        });
        /*
        if(settings.layout != ""){

            playgroundElements.append("<div class='ws-layout-container ws-right-actions'></div>");
            $(".ws-layout-container").append("<div class='ws-section-header' data-show='layout-list'><h2>Layouts</h2><span class='ws_close_overlay'><i class='material-icons'>close</i></span></div><div class='layout-list ws-list-view'></div>");
            $.each(settings.layout,function(index,val){
    
                if(val){
                    __elementsfn[index]();
                }
            }); 
        }*/
        // setup elemtn hover element
        
        
    }
    function editColSetting(e,type){

        let tm =$("<div/>",{
            class:"ws-section-body",
        });

        if(type == "col"){
            var colEl = $(e.currentTarget).closest(".ws-row-col").first();
            __current_col_edit = colEl;
        }else{
            var colEl = $(e.currentTarget).closest(".rowData").find(".ws-element-wrapper").first();
            __current_col_edit = colEl;
        }
        if($('.ws-remove-section').length > 0 ){
            $('.ws-remove-section').remove();
        }
        var rr = $("<div/>",{
            class:"ws-column-container ws-remove-section ws-right-actions",
            "data-setting":$(colEl).attr("id"),
        });
        let general_hoder = $("<div/>",{
            class:"tab-pane fade show active",
            id:"ws_general",
            role:"tabpanel",
        });

        var ee = $("<div/>",{
            class:"column-list ws-list-view"
        });//.append(getMarginpadding());
        if(type != "col"){
            var selcf = "";
            var selc="";
            //__current_col_edit.closest(".rowData").attr("data-row-type","container-with-row");
            var curtype = __current_col_edit.closest(".rowData").attr("data-row-type");
            if(typeof(curtype) != "undefined" && curtype !=""){
                if(curtype == "container-fluid"){
                    selcf = "selected";
                }
                if(curtype == "container"){
                    selc = "selected";
                }
            } 
            var rowType = "<div class='ws-section-setting'><select class='row-type'><option "+selcf+" value='container-fluid'>Full Screen</option><option "+selc+" value='container'>center Screen</option></select></div>";
            general_hoder.append("<p class='ws-setting-section-heading'><span>Row size</span></p>");
            general_hoder.append(rowType);
            if(curtype == "container-with-row"){
                general_hoder.append("<p class='ws-setting-section-heading'><span>Full container with center content</span>&nbsp;&nbsp;<input type='checkbox' checked=checked class='row-type-check'/></p>");                
            }else{
                general_hoder.append("<p class='ws-setting-section-heading'><span>Full container with center content</span>&nbsp;&nbsp;<input type='checkbox' class='row-type-check'/></p>");                
            }
            
        }
        let border_hoder = $("<div/>",{
            class:"tab-pane fade",
            id:"ws_border",
            role:"tabpanel",
        });
        //border_hoder.append("<p class='ws-setting-section-heading'><span>Border</span></p>");
        border_hoder.append(borderSetting());
        border_hoder.append(getAlignment());
        border_hoder.append(backgroundSetting(true));

        general_hoder.append(getMobileSetting());
        
        //ee.append(backgroundSetting(true));
        
        general_hoder.append("<p class='ws-setting-section-heading'><span>Width and Height</span></p>");
        general_hoder.append(whScroll(true));
        var am =$("<div/>",{
            class:"ws-section-header",
            "data-show":'column-list'
        });
        if(type == "col"){
            am.append("<h2>Column Settings</h2><span class='ws_close_overlay'><i class='material-icons'>close</i></span>");
        }else{
            am.append("<h2>Row Settings</h2><span class='ws_close_overlay'><i class='material-icons'>close</i></span>");
        }

        let navLink ='<ul class="nav nav-tabs" role="tablist"><li class="nav-item" role="presentation"><a class="nav-link active" data-toggle="tab" href="#ws_general">General</a></li><li class="nav-item" role="presentation"><a class="nav-link" data-toggle="tab" href="#ws_margin">Box Spacing</a></li><li class="nav-item" role="presentation"><a class="nav-link" data-toggle="tab" href="#ws_border">Border & background colors</a></li><li class="nav-item" role="presentation"><a class="nav-link" data-toggle="tab" href="#ws_animations">Animations</a></li></ul>';
        
        tm.append(navLink);
        let tc =$("<div/>",{
            class:"tab-content",
        });
        //tc.append(editer_hoder);
        tc.append(general_hoder);
        tc.append(getMarginpadding());
        tc.append(border_hoder);
        tc.append(getAnimationSetting());
        tm.append(tc);

        am.append(ee);
        rr.append(am);
        rr.append(tm);
        //$(".ws-list-view").hide();
        
        playgroundElements.append(rr);
        //general_hoder.show();
        showElements();
        $(".ws-column-container").addClass("ws_active");
    }
    function addColElm(e,type){
        showElements();
        activeElement = $(e.currentTarget).closest(".ws-row-col");
        if(type == "col"){
        
        }else{
        }
    }

    
    function editTextSetting(colEl){

        __current_col_edit = colEl;

        var curCss = __current_col_edit.attr("data-meta-css");
        /*if(typeof(curCss) != "undefined" ){
            curCss = JSON.parse(__current_col_edit.attr("data-meta-css"));
        }else{
            curCss = {}
        }*/
        var htmlTxt = __current_col_edit.closest(".paragraph-text").find(".p-txt").html();

        //console.log(colEl.attr("class"));
        if($('.ws-remove-section').length > 0 ){
            $('.ws-remove-section').remove(); 
        }
        var rr = $("<div/>",{
            class:"ws-text-container ws-remove-section ws-right-actions",
            "data-setting":$(colEl).attr("id"),
        });

        var editer1 = $("<div/>",{
            id:"text-editor"});
        var el = $(editer1).get(0);
        
        var ee = $("<div/>",{
            class:"text-list ws-list-view"
        });
        
        let editer_hoder = $("<div/>",{
            class:"tab-pane fade show active",
            id:"ws_editor",
            role:"tabpanel",
        });
        editer_hoder.append($("<div/>",{class:"ws-editer"}).append(editer1));

        
        let border_hoder = $("<div/>",{
            class:"tab-pane fade",
            id:"ws_border",
            role:"tabpanel",
        });
        //border_hoder.append("<p class='ws-setting-section-heading'><span>Border</span></p>");
        border_hoder.append(borderSetting());
        border_hoder.append(getAlignment());
        border_hoder.append(backgroundSetting(false));
        
        var am =$("<div/>",{
            class:"ws-section-header",
            "data-show":'text-list'
        });
        var tm =$("<div/>",{
            class:"ws-section-body",
        });
        
        am.append("<h2>Text Box Setting</h2><span class='ws_close_overlay'><i class='material-icons'>close</i></span>");
        let navLink ='<ul class="nav nav-tabs" role="tablist"><li class="nav-item" role="presentation"><a class="nav-link active" data-toggle="tab" href="#ws_editor">General</a></li><li class="nav-item" role="presentation"><a class="nav-link" data-toggle="tab" href="#ws_margin">Box Spacing</a></li><li class="nav-item" role="presentation"><a class="nav-link" data-toggle="tab" href="#ws_border">Border & background colors</a></li><li class="nav-item" role="presentation"><a class="nav-link" data-toggle="tab" href="#ws_animations">Animations</a></li></ul>';
        
        tm.append(navLink);
        let tc =$("<div/>",{
            class:"tab-content",
        });
        
        tc.append(editer_hoder);
        tc.append(getMarginpadding());
        tc.append(border_hoder);
        tc.append(getAnimationSetting());

        tm.append(tc);
        rr.append(am);
        rr.append(tm);
        //rr.append(am);

        playgroundElements.append(rr);
        /*var editor = CKEDITOR.replace(el,{
          language: 'en',
          toolbarGroups:[
            { name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ] },
            { name: 'paragraph', groups: [ 'list', 'indent', 'blocks', 'align', 'bidi', 'paragraph' ] },
            { name: 'styles', groups: [ 'styles' ] },
            { name: 'colors', groups: [ 'colors' ] },
            { name: 'tools', groups: [ 'tools' ] }
            ]
        }); 
        editor.setData(htmlTxt);
        editor.on('change',function(){
            var delta = editor.getData();
            colEl.find(".p-txt").html(delta);

        //         var text = editor.getText();
        });*/
        var editor = new Quill(el,{
        modules: {
            toolbar: __toolbarOptions
        },
        theme: 'snow'  // or 'bubble'
        });

        const delta = editor.clipboard.convert(htmlTxt);
        editor.setContents(delta, 'silent');
        editor.on('text-change', function(delta, oldDelta, source) {
            if (source == 'api') {
                console.log("An API call triggered this change.");
              } else if (source == 'user') {
                var delta = editor.getContents();
                var text = editor.getText();
                var justHtml = editor.root.innerHTML;
                //console.log(colEl.attr("class"));
                colEl.find(".p-txt").html(justHtml);
                //console.log(justHtml);
              }
        });
        //$(".ws-list-view").hide();
        ee.show();
        showTools();
        showEditer();
        // Tigger first nav item
        
        
    }
    function getAnimationSetting(){

        let animation_hoder = $("<div/>",{
            class:"tab-pane fade",
            id:"ws_animations",
            role:"tabpanel",
        });

        let animationType = $("<select/>",{
            class:"form-control ws_animation_type",
        });
        let animationEasing = $("<select/>",{
            class:"form-control ws_animation_easing",
        });
     
        let animationAnchor = $("<select/>",{
            class:"form-control ws_animation_anchor",
        });
     
        let selectValues = ["none","fade","fade-up","fade-down","fade-left","fade-right","fade-up-right","fade-up-left","fade-down-right","fade-down-left","flip-up","flip-down","flip-left","flip-right","slide-up","slide-down","slide-left","slide-right","zoom-in","zoom-in-up","zoom-in-down","zoom-in-left","zoom-in-right","zoom-out","zoom-out-up","zoom-out-down","zoom-out-left","zoom-out-right"];
        let selectEasing = ["none","linear","ease","ease-in","ease-out","ease-in-out","ease-in-back","ease-out-back","ease-in-out-back","ease-in-sine","ease-out-sine","ease-in-out-sine","ease-in-quad","ease-out-quad","ease-in-out-quad","ease-in-cubic","ease-out-cubic","ease-in-out-cubic","ease-in-quart","ease-out-quart","ease-in-out-quart"];
        let selectAnchor = ["none","top-bottom","top-center","top-top","center-bottom","center-center","center-top","bottom-bottom","bottom-center","bottom-top"];
       

       let aniH = $("<div/>",{
        class:"ws-section-setting no-flex ws-grid"
       });
       aniH.append("<p>Animation Type</p>");
       aniH.append(animationType);
       var aos = __current_col_edit.attr("data-aos");
       var aos_delay = __current_col_edit.attr("data-aos-delay");
       var aos_easing = __current_col_edit.attr("data-aos-easing");
       var aos_placement = __current_col_edit.attr("data-aos-anchor-placement");
       var aos_offset = __current_col_edit.attr("data-aos-offset");
       var aos_duration = __current_col_edit.attr("data-aos-duration");
       var aos_mirror = __current_col_edit.attr("data-aos-mirror");
       
       $.each(selectValues, function(key, value) {   
            if(aos == value){
                animationType.append($("<option></option>",{"selected":"selected"}).attr("value", value).text(value)); 
            }else{
                animationType.append($("<option></option>").attr("value", value).text(value)); 
            }
        });
        $.each(selectEasing, function(key, value) {
            if(aos_easing == value){
            animationEasing.append($("<option></option>",{"selected":"selected"}).attr("value", value).text(value)); 
            }else{
                animationEasing.append($("<option></option>").attr("value", value).text(value)); 
            }
        });
        let anie= $("<div/>",{
            class:"ws-section-setting no-flex ws-grid"
        });
        anie.append("<p>Animation Easing</p>");
        anie.append(animationEasing);
        $.each(selectAnchor, function(key, value) {   
            if(aos_placement == value){
            animationAnchor.append($("<option></option>",{"selected":"selected"}).attr("value", value).text(value)); 
            }else{
                animationAnchor.append($("<option></option>").attr("value", value).text(value));     
            }
        });
        let aniA= $("<div/>",{
        class:"ws-section-setting no-flex ws-grid"
        });
        aniA.append("<p>Animation Anchor Placement</p>");
        aniA.append(animationAnchor);
        var aos_delay = __current_col_edit.attr("data-aos-delay");
        var aos_easing = __current_col_edit.attr("data-aos-easing");
        var aos_placement = __current_col_edit.attr("data-aos-anchor-placement");
        var aos_offset = __current_col_edit.attr("data-aos-offset");
        var aos_duration = __current_col_edit.attr("data-aos-duration");
        var aos_mirror = __current_col_edit.attr("data-aos-mirror");
        var aos_once = __current_col_edit.attr("data-aos-once");
        

        let anoffset= $("<div/>",{
            class:"ws-section-setting no-flex ws-grid"
        }).append($("<p/>",{class:""}).append("Animation Offset")).append($("<input/>",{type:"text",value:aos_offset,class:"form-control animationSetting","data-type":"data-aos-offset"})).append($("<span/>",{class:"ws_second-info"}).append("offset (in px) from the original trigger point"));

        let andelay= $("<div/>",{
            class:"ws-section-setting no-flex ws-grid"
        }).append($("<p/>",{class:""}).append("Animation Delay")).append($("<input/>",{type:"text",value:aos_delay,class:"form-control animationSetting","data-type":"data-aos-delay"})).append($("<span/>",{class:"ws_second-info"}).append("values from 0 to 3000, with step 50ms"));

        let anduration= $("<div/>",{
            class:"ws-section-setting no-flex ws-grid"
        }).append($("<p/>",{class:""}).append("Animation Duration")).append($("<input/>",{type:"text",value:aos_duration,class:"form-control animationSetting","data-type":"data-aos-duration"})).append($("<span/>",{class:"ws_second-info"}).append("values from 0 to 3000, with step 50ms"));
        if(aos_mirror =="yes"){
            var anmirror= $("<div/>",{
                class:"ws-section-setting no-flex ws-grid"
            }).append($("<p/>",{class:""}).append("Animation Mirror")).append($("<select/>",{class:"form-control animationSetting","data-type":"data-aos-mirror"}).append("<option value='no'>No</option><option selected='selected' value='yes'>Yes</option>")).append($("<span/>",{class:"ws_second-info"}).append("whether elements should animate out while scrolling past them"));    
        }else if(aos_mirror =="no"){
            var anmirror= $("<div/>",{
                class:"ws-section-setting no-flex ws-grid"
            }).append($("<p/>",{class:""}).append("Animation Mirror")).append($("<select/>",{class:"form-control animationSetting","data-type":"data-aos-mirror"}).append("<option selected='selected' value='no'>No</option><option value='yes'>Yes</option>")).append($("<span/>",{class:"ws_second-info"}).append("whether elements should animate out while scrolling past them"));
        }else{
            var anmirror= $("<div/>",{
                class:"ws-section-setting no-flex ws-grid"
            }).append($("<p/>",{class:""}).append("Animation Mirror")).append($("<select/>",{class:"form-control animationSetting","data-type":"data-aos-mirror"}).append("<option value='no'>No</option><option value='yes'>Yes</option>")).append($("<span/>",{class:"ws_second-info"}).append("whether elements should animate out while scrolling past them"));
        }
        
        if(aos_once =="yes"){
        var anonce= $("<div/>",{
            class:"ws-section-setting no-flex ws-grid"
        }).append($("<p/>",{class:""}).append("Animation Once")).append($("<select/>",{class:"form-control animationSetting","data-type":"data-aos-once"}).append("<option value='no'>No</option><option selected='selected' value='yes'>Yes</option>")).append($("<span/>",{class:"ws_second-info"}).append("whether animation should happen only once - while scrolling down"));
        }else if(aos_once =="no"){
            var anonce= $("<div/>",{
                class:"ws-section-setting no-flex ws-grid"
            }).append($("<p/>",{class:""}).append("Animation Once")).append($("<select/>",{class:"form-control animationSetting","data-type":"data-aos-once"}).append("<option selected='selected' value='no'>No</option><option value='yes'>Yes</option>")).append($("<span/>",{class:"ws_second-info"}).append("whether animation should happen only once - while scrolling down"));
        }else{
            var anonce= $("<div/>",{
                class:"ws-section-setting no-flex ws-grid"
            }).append($("<p/>",{class:""}).append("Animation Once")).append($("<select/>",{class:"form-control animationSetting","data-type":"data-aos-once"}).append("<option value='no'>No</option><option value='yes'>Yes</option>")).append($("<span/>",{class:"ws_second-info"}).append("whether animation should happen only once - while scrolling down"));
        }

        animation_hoder.append(aniH);
        animation_hoder.append(anie);
        animation_hoder.append(aniA);
        animation_hoder.append(anoffset);
        animation_hoder.append(andelay);
        animation_hoder.append(anduration);
        animation_hoder.append(anmirror);
        animation_hoder.append(anonce);
        
        return animation_hoder;
    }
    function showTools(){
        $(".nav-link").removeClass("active");
        //$(".tab-pane").removeClass("active");
        $("#ws-tools").addClass("active");
        $("#profile").addClass("active");
    }
    function showElements(){
        $(".ws-element-container").addClass("ws_active");
    }
    function showEditer(){
        $(".ws-text-container").addClass("ws_active");
    }
    function closeOverlay(){
        $(".ws-element-container").removeClass("ws_active");
        $(".ws-text-container").removeClass("ws_active");
        $(".ws-remove-section").removeClass("ws_active");
       
    }
    
    function editSocialSetting(colEl){

        __current_col_edit = colEl;
        let general_hoder = $("<div/>",{
            class:"tab-pane fade show active",
            id:"ws_general",
            role:"tabpanel",
        });
        let tm =$("<div/>",{
            class:"ws-section-body",
        });

        var curCss = __current_col_edit.attr("data-meta-css");
        var fblink = __current_col_edit.attr("data-fb");
        var twlink = __current_col_edit.attr("data-tw");
        var instalink = __current_col_edit.attr("data-insta");
        var linkinlink = __current_col_edit.attr("data-linkin");
        
        if($('.ws-remove-section').length > 0 ){
            $('.ws-remove-section').remove(); 
        }
        var rr = $("<div/>",{
            class:"ws-text-container ws-remove-section ws-right-actions",
            "data-setting":$(colEl).attr("id"),
        });

        var ee = $("<div/>",{
            class:"social-list ws-list-view"
        }).append($("<div/>",{class:"ws-social"}));
        
        var fbCon = $("<div/>",{
            class:"social-link"
        });
        var fb = $("<input>",{
            class:"social-link-txt",
            "data-type":"fb",
            value:fblink,
            type:"text"
        });
        
        fbCon.append("<p class='ws-setting-section-heading'><span>Facebook Link</span></p>");
        fbCon.append($("<div/>",{class:"ws-section-setting"}).append(fb));
        
        var twCon = $("<div/>",{
            class:"social-link-txt"
        });
        var tw = $("<input>",{
            class:"social-link-txt",
            value:twlink,
            "data-type":"tw",
            type:"text"
        });
        
        twCon.append("<p class='ws-setting-section-heading'><span>Twitter Link</span></p>");
        twCon.append($("<div/>",{class:"ws-section-setting"}).append(tw));

        var insCon = $("<div/>",{
            class:"social-link"
        });
        var ins = $("<input>",{
            class:"social-link-txt",
            value:instalink,
            "data-type":"insta",
            type:"text"
        });
        
        insCon.append("<p class='ws-setting-section-heading'><span>Instagram Link</span></p>");
        insCon.append($("<div/>",{class:"ws-section-setting"}).append(ins));
        

        var linkinCon = $("<div/>",{
            class:"social-link"
        });
        var linkin = $("<input>",{
            class:"social-link-txt",
            value:linkinlink,
            "data-type":"linkin",
            type:"text"
        });
        
        linkinCon.append("<p class='ws-setting-section-heading'><span>Linkedin Link</span></p>");
        linkinCon.append($("<div/>",{class:"ws-section-setting"}).append(linkin));

        general_hoder.append(fbCon);
        general_hoder.append(twCon);
        general_hoder.append(insCon);
        general_hoder.append(linkinCon);
        
        let navLink ='<ul class="nav nav-tabs" role="tablist"><li class="nav-item" role="presentation"><a class="nav-link active" data-toggle="tab" href="#ws_general">General</a></li><li class="nav-item" role="presentation"><a class="nav-link" data-toggle="tab" href="#ws_margin">Box Spacing</a></li><li class="nav-item" role="presentation"><a class="nav-link" data-toggle="tab" href="#ws_border">Border & background colors</a></li><li class="nav-item" role="presentation"><a class="nav-link" data-toggle="tab" href="#ws_animations">Animations</a></li></ul>';
        let border_hoder = $("<div/>",{
            class:"tab-pane fade",
            id:"ws_border",
            role:"tabpanel",
        });
        //border_hoder.append("<p class='ws-setting-section-heading'><span>Border</span></p>");
        border_hoder.append(borderSetting());
        border_hoder.append(getAlignment());
        border_hoder.append(backgroundSetting(false));
        
        var am =$("<div/>",{
            class:"ws-section-header",
            "data-show":'social-list'
        });
        
        tm.append(navLink);
        let tc =$("<div/>",{
            class:"tab-content",
        });
        
        tc.append(general_hoder);
        tc.append(getMarginpadding());
        tc.append(border_hoder);
        tc.append(getAnimationSetting());

        tm.append(tc);

        am.append("<h2>Edit Soical Media Links</h2><span class='ws_close_overlay'><i class='material-icons'>close</i></span>");
        am.append(ee);
        rr.append(am);
        rr.append(tm);

        playgroundElements.append(rr);
        //$(".ws-list-view").hide();
        ee.show();
        showTools();
        $(".ws-text-container").addClass("ws_active");
        
    }
    function editHtmlSetting(colEl){

        __current_col_edit = colEl;
        let general_hoder = $("<div/>",{
            class:"tab-pane fade show active",
            id:"ws_general",
            role:"tabpanel",
        });
        let tm =$("<div/>",{
            class:"ws-section-body",
        });

        var curCss = __current_col_edit.attr("data-meta-css");
        var curHtml = __current_col_edit.closest(".ws-customHtml-link").find(".custom-html-txt").html();
        
        if($('.ws-remove-section').length > 0 ){
            $('.ws-remove-section').remove(); 
        }
        var rr = $("<div/>",{
            class:"ws-text-container ws-remove-section ws-right-actions",
            "data-setting":$(colEl).attr("id"),
        });
        var textel = $("<textarea>",{
            class:"custom-html",
            
        });
        textel.val(curHtml);
        general_hoder.append("<p class='ws-setting-section-heading'><span>HTML</p>");
        general_hoder.append($("<div/>",{class:"ws-section-setting"}).append(textel));
        var am =$("<div/>",{
            class:"ws-section-header",
            "data-show":'html-list'
        });

        let navLink ='<ul class="nav nav-tabs" role="tablist"><li class="nav-item" role="presentation"><a class="nav-link active" data-toggle="tab" href="#ws_general">General</a></li><li class="nav-item" role="presentation"><a class="nav-link" data-toggle="tab" href="#ws_margin">Box Spacing</a></li><li class="nav-item" role="presentation"><a class="nav-link" data-toggle="tab" href="#ws_animations">Animations</a></li></ul>';
        
        tm.append(navLink);
        let tc =$("<div/>",{
            class:"tab-content",
        });
        tc.append(general_hoder);
        tc.append(getMarginpadding());
        tc.append(getAnimationSetting());
        tm.append(tc);

        am.append("<h2>Custom HTML Settings</h2><span class='ws_close_overlay'><i class='material-icons'>close</i></span>");
        rr.append(am);
        rr.append(tm);
        playgroundElements.append(rr);
        showTools();
        $(".ws-text-container").addClass("ws_active");
        
    }
    function editVideoSetting(colEl){

        __current_col_edit = colEl;
        let general_hoder = $("<div/>",{
            class:"tab-pane fade show active",
            id:"ws_general",
            role:"tabpanel",
        });
        let tm =$("<div/>",{
            class:"ws-section-body",
        });
        var curCss = __current_col_edit.attr("data-meta-css");
        var url = __current_col_edit.attr("data-url");
        //var htmlTxt = __current_col_edit.closest(".ws-video").find(".p-txt").html();
        if($('.ws-remove-section').length > 0 ){
            $('.ws-remove-section').remove(); 
        }
        var rr = $("<div/>",{
            class:"ws-text-container ws-remove-section ws-right-actions",
            "data-setting":$(colEl).attr("id"),
        });
        var url = $("<input>",{
            class:"text-list ws-video-url",
            type:"text",
            name:"url",
            value:url,
        });
        var ee = $("<div/>",{
            class:"video-list ws-list-view"
        });

        general_hoder.append("<p class='ws-setting-section-heading'>Video URL<span class='ws_second-info'>Copy and Paste URL(Accept youtube,viemo and dailymotion.)</span></p>");
        general_hoder.append($("<div/>",{class:"ws-section-setting"}).append(url));
        general_hoder.append("<p class='ws-setting-section-heading'><span>Video width X Height. Default is auto responsive.</span></p>");
        general_hoder.append(whScroll(false));
        //ee.append(getMarginpadding());
        
        var am =$("<div/>",{
            class:"ws-section-header",
            "data-show":'video-list'
        });

        let navLink ='<ul class="nav nav-tabs" role="tablist"><li class="nav-item" role="presentation"><a class="nav-link active" data-toggle="tab" href="#ws_general">General</a></li><li class="nav-item" role="presentation"><a class="nav-link" data-toggle="tab" href="#ws_margin">Box Spacing</a></li><li class="nav-item" role="presentation"><a class="nav-link" data-toggle="tab" href="#ws_animations">Animations</a></li></ul>';
        
        tm.append(navLink);
        let tc =$("<div/>",{
            class:"tab-content",
        });
        tc.append(general_hoder);
        tc.append(getMarginpadding());
        tc.append(getAnimationSetting());
        tm.append(tc);

        am.append("<h2>Video Settings</h2><span class='ws_close_overlay'><i class='material-icons'>close</i></span>");
        am.append(ee);
        rr.append(am);
        rr.append(tm);

        playgroundElements.append(rr);
        $(".ws-list-view").hide();
        ee.show();
        showTools();
        $(".ws-text-container").addClass("ws_active");
        
    }

    function editImageSetting(colEl){

        __current_col_edit = colEl;
        let general_hoder = $("<div/>",{
            class:"tab-pane fade show active",
            id:"ws_general",
            role:"tabpanel",
        });
        let tm =$("<div/>",{
            class:"ws-section-body",
        });

        var curCss = __current_col_edit.attr("data-meta-css");
        if($('.ws-remove-section').length > 0 ){
            $('.ws-remove-section').remove(); 
        }
        var rr = $("<div/>",{
            class:"ws-text-container ws-remove-section ws-right-actions",
            "data-setting":$(colEl).attr("id"),
        });
        var curUrl = __current_col_edit.attr("data-url");
        if(typeof(curUrl) != "undefined" && curUrl !=""){
            var url = curUrl;
        }else{
            var url = "";
        }
        var url = $("<input>",{
            class:"text-list ws-image-url",
            type:"text",
            value:url,
            name:"url"
        });
        var uploadButton = $("<input>",{
            class:"btn loadMedia",
            type:"button",
            value:'Media',
            name:"Media",
            "data-change":"ws-image-url",
            "data-toggle":"modal",
            "data-target":"#"+mediaModel,
        });
        
        var curLink = __current_col_edit.attr("data-link");
        if(typeof(curLink) != "undefined" && curLink !=""){
            var link = curLink;
        }else{
            var link = "";
        }
        var curAlt = __current_col_edit.attr("data-alt");
        if(typeof(curAlt) != "undefined" && curAlt !=""){
            var alttxt = curAlt;
        }else{
            var alttxt = "";
        }
        var alt = $("<input>",{
            class:"text-list ws-image-alt",
            type:"text",
            value:alttxt,
            name:"altText"
        });
        var ee = $("<div/>",{
            class:"image-list ws-list-view"
        });

        general_hoder.append("<p class='ws-setting-section-heading'><span>Image URL</p>");
        general_hoder.append($("<div/>",{class:"ws-section-setting"}).append(url));
        general_hoder.append(uploadButton);
        general_hoder.append("<p class='ws-setting-section-heading'><span>Image Width X Height. Default is Auto Responsive</p>");
        general_hoder.append(whScroll(false));
        // ee.append("<p class='ws-setting-section-heading'><span>Image Link</p>");
        // ee.append($("<div/>",{class:"ws-section-setting"}).append(link));
        general_hoder.append("<p class='ws-setting-section-heading'><span>Image Alt</p>");
        general_hoder.append($("<div/>",{class:"ws-section-setting"}).append(alt));
        //ee.append(getAlignment());
        //ee.append(getMarginpadding());
        
        let border_hoder = $("<div/>",{
            class:"tab-pane fade",
            id:"ws_border",
            role:"tabpanel",
        });
        //border_hoder.append("<p class='ws-setting-section-heading'><span>Border</span></p>");
        border_hoder.append(getAlignment());
        

        let navLink ='<ul class="nav nav-tabs" role="tablist"><li class="nav-item" role="presentation"><a class="nav-link active" data-toggle="tab" href="#ws_general">General</a></li><li class="nav-item" role="presentation"><a class="nav-link" data-toggle="tab" href="#ws_margin">Box Spacing</a></li><li class="nav-item" role="presentation"><a class="nav-link" data-toggle="tab" href="#ws_animations">Animations</a></li></ul>';
        
        tm.append(navLink);
        let tc =$("<div/>",{
            class:"tab-content",
        });
        tc.append(general_hoder);
        tc.append(getMarginpadding());
        tc.append(getAnimationSetting());
        tm.append(tc);

        var am = $("<div/>",{
            class:"ws-section-header",
            "data-show":'image-list'
        });
        am.append("<h2>Single Image Settings</h2><span class='ws_close_overlay'><i class='material-icons'>close</i></span>");
        //am.append(ee);
        rr.append(am);
        rr.append(tm);

        playgroundElements.append(rr);
        //$(".ws-list-view").hide();
        ee.show();
        showTools();
        $(".ws-text-container").addClass("ws_active");
        
    }

    function editButtonSetting(colEl){
        __current_col_edit = colEl;
        let general_hoder = $("<div/>",{
            class:"tab-pane fade show active",
            id:"ws_general",
            role:"tabpanel",
        });
        let tm =$("<div/>",{
            class:"ws-section-body",
        });
        var curCss = __current_col_edit.attr("data-meta-css");
        if($('.ws-remove-section').length > 0 ){
            $('.ws-remove-section').remove(); 
        }
        var rr = $("<div/>",{
            class:"ws-text-container ws-remove-section ws-right-actions",
            "data-setting":$(colEl).attr("id"),
        });
        
        var curLink = __current_col_edit.attr("data-link");
        if(typeof(curLink) != "undefined" && curLink !=""){
            var link = curLink;
        }else{
            var link = "";
        }
        var link = $("<input>",{
            class:"text-list ws-button-link",
            type:"text",
            value:link,
            name:"buttonLink"
        });
        var curAlt = __current_col_edit.attr("data-alt");
        if(typeof(curAlt) != "undefined" && curAlt !=""){
            var alttxt = curAlt;
        }else{
            var alttxt = "";
        }
        var alt = $("<input>",{
            class:"text-list ws-button-title",
            type:"text",
            value:alttxt,
            name:"altTextBtn"
        });
        var ee = $("<div/>",{
            class:"button-list ws-list-view"
        });
        general_hoder.append("<p class='ws-setting-section-heading'><span>Button Link</p>");
        general_hoder.append($("<div/>",{class:"ws-section-setting"}).append(link));
        general_hoder.append("<p class='ws-setting-section-heading'><span>Button Width X Height. Default is Auto Responsive</p>");
        general_hoder.append(whScroll(false));
        
        general_hoder.append("<p class='ws-setting-section-heading'><span>Button Title and Text</p>");
        general_hoder.append($("<div/>",{class:"ws-section-setting"}).append(alt));
        //ee.append(getAlignment());
        //ee.append(getMarginpadding());
        //ee.append(borderSetting());
       // ee.append(backgroundSetting(false));
        var am = $("<div/>",{
            class:"ws-section-header",
            "data-show":'button-list'
        });

        let border_hoder = $("<div/>",{
            class:"tab-pane fade",
            id:"ws_border",
            role:"tabpanel",
        });
        //border_hoder.append("<p class='ws-setting-section-heading'><span>Border</span></p>");
        border_hoder.append(borderSetting());
        border_hoder.append(getAlignment());
        border_hoder.append(backgroundSetting(true));

        let navLink ='<ul class="nav nav-tabs" role="tablist"><li class="nav-item" role="presentation"><a class="nav-link active" data-toggle="tab" href="#ws_general">General</a></li><li class="nav-item" role="presentation"><a class="nav-link" data-toggle="tab" href="#ws_margin">Box Spacing</a></li><li class="nav-item" role="presentation"><a class="nav-link" data-toggle="tab" href="#ws_border">Border & background colors</a></li><li class="nav-item" role="presentation"><a class="nav-link" data-toggle="tab" href="#ws_animations">Animations</a></li></ul>';
        
        tm.append(navLink);
        let tc =$("<div/>",{
            class:"tab-content",
        });
        tc.append(general_hoder);
        tc.append(getMarginpadding());
        tc.append(border_hoder);
        tc.append(getAnimationSetting());
        tm.append(tc);

        am.append("<h2>Button Settings</h2><span class='ws_close_overlay'><i class='material-icons'>close</i></span>");
        am.append(ee);
        rr.append(am);
        rr.append(tm);
        playgroundElements.append(rr);
        ee.show();
        showTools();
        $(".ws-text-container").addClass("ws_active");
        
    }
    function editLinkSetting(colEl){

        let general_hoder = $("<div/>",{
            class:"tab-pane fade show active",
            id:"ws_general",
            role:"tabpanel",
        });
        let tm =$("<div/>",{
            class:"ws-section-body",
        });

        __current_col_edit = colEl;

        var curCss = __current_col_edit.attr("data-meta-css");
        if($('.ws-remove-section').length > 0 ){
            $('.ws-remove-section').remove(); 
        }
        var rr = $("<div/>",{
            class:"ws-text-container ws-remove-section ws-right-actions",
            "data-setting":$(colEl).attr("id"),
        });
        
        var curLink = __current_col_edit.attr("data-link");
        if(typeof(curLink) != "undefined" && curLink !=""){
            var link = curLink;
        }else{
            var link = "";
        }
        var link = $("<input>",{
            class:"text-list ws-link-text",
            type:"text",
            value:link,
            name:"LinkText"
        });
        var curAlt = __current_col_edit.attr("data-alt");
        if(typeof(curAlt) != "undefined" && curAlt !=""){
            var alttxt = curAlt;
        }else{
            var alttxt = "";
        }
        var alt = $("<input>",{
            class:"text-list ws-link-title",
            type:"text",
            value:alttxt,
            name:"altTextLink"
        });
        var ee = $("<div/>",{
            class:"link-list ws-list-view"
        });
        general_hoder.append("<p class='ws-setting-section-heading'><span>Link</p>");
        general_hoder.append($("<div/>",{class:"ws-section-setting"}).append(link));
        general_hoder.append("<p class='ws-setting-section-heading'><span>Link Title and Text</p>");
        general_hoder.append($("<div/>",{class:"ws-section-setting"}).append(alt));
        general_hoder.append(getAlignment());
        //ee.append(getMarginpadding());
        var am = $("<div/>",{
            class:"ws-section-header",
            "data-show":'link-list'
        });
       
        let navLink ='<ul class="nav nav-tabs" role="tablist"><li class="nav-item" role="presentation"><a class="nav-link active" data-toggle="tab" href="#ws_general">General</a></li><li class="nav-item" role="presentation"><a class="nav-link" data-toggle="tab" href="#ws_margin">Box Spacing</a></li><li class="nav-item" role="presentation"><a class="nav-link" data-toggle="tab" href="#ws_animations">Animations</a></li></ul>';
        
        tm.append(navLink);
        let tc =$("<div/>",{
            class:"tab-content",
        });
        tc.append(general_hoder);
        tc.append(getMarginpadding());
        tc.append(getAnimationSetting());
        tm.append(tc);
        am.append("<h2>Link Settings</h2><span class='ws_close_overlay'><i class='material-icons'>close</i></span>");
        am.append(ee);
        rr.append(am);
        rr.append(tm);

        playgroundElements.append(rr);
        //$(".ws-list-view").hide();
        ee.show();
        showTools();
        $(".ws-text-container").addClass("ws_active");
    }
    

    function getMarginpadding(){

        let margin_hoder = $("<div/>",{
            class:"tab-pane fade",
            id:"ws_margin",
            role:"tabpanel",
        });
        
       
        var elMain = $("<div/>",{class:"col-ma"});
        var curCss = __current_col_edit.attr("data-meta-css");
        var addCss = __current_col_edit.attr("data-add-css");
        if(typeof(addCss) == "undefined" ){
            addCss ="";
        }
        if(typeof(curCss) != "undefined" ){
            curCss = JSON.parse(__current_col_edit.attr("data-meta-css"));
        }
        
        console.log("margin padding is");
        console.log(curCss);
        var addionalCss =$("<div/>",{class:"col-setting"});
        addionalCss.append("<p class='ws-setting-section-heading'><span>Additional Css Class</span></p>");
        var addCssEl = $("<input/>",{
            type:'text',
            class:'addCss',
            value:addCss,
        });
        var holder =$("<div/>",{class:"ws-section-setting"});
        holder.append(addCssEl);
        addionalCss.append(holder);
        addionalCss.append("<div class='ws-section-setting'><span class='ws_second-info'>Style particular content element differently - add a class name and refer to it in custom CSS. e.g. beader-top border-bottom</span></div>");

        var el = $("<div/>",{class:"col-setting-holder"});
        var elm = $("<div/>",{class:"ws-margin-list"});
        var elb = $("<div/>",{class:"ws-border-list"});
        var elp = $("<div/>",{class:"ws-padding-list"});
        var elho = $("<div/>",{class:"ws-holder-list"});
        
        for (let index = 0; index < 4; index++){
            var vl = "";
            if(typeof(curCss) != "undefined" ){
                if(typeof(curCss[__margintype["ws_m_"+index]]) != "undefined"){
                    vl = curCss[__margintype["ws_m_"+index]];
                }else{
                    vl ="";
                }
            }
            let eli_h = $("<div/>",{
                class:"ws-col-m"
            });
            let eli = $("<input/>",{
                id:"ws_m_"+index,
                type:"text",
                class:"ws-col-m",
                value:vl,
                
            });
            //class:"ws-col-m"
            eli_h.append("<span class='material-icons ws-plus'>add</span>");
            eli_h.append(eli);
            eli_h.append("<span class='material-icons ws-minus'>remove</span>");
            elm.append(eli_h);
        }
        //let eli_h_b = eli_h.clone();

        for (let index = 0; index < 4; index++) {
            var vb = "";
            if(typeof(curCss) != "undefined" ){
                if(typeof(curCss[__bordertype["ws_b_"+index]]) != "undefined"){
                    vb = (curCss[__bordertype["ws_b_"+index]]);
                }else{
                    vb ="";
                }
            }
            let eli_h = $("<div/>",{
                class:"ws-col-b"
            });
            var eli = $("<input/>",{
                id:"ws_b_"+index,
                type:"text",
                class:"ws-col-b",
                value:vb,
               
            });
            eli_h.append("<span class='material-icons ws-plus'>add</span>");
            eli_h.append(eli);
            eli_h.append("<span class='material-icons ws-minus'>remove</span>");
            elb.append(eli_h);
            //elb.append(eli);
        }
        elb.append("<label>Border (Box Border)</label>");
        elm.append("<label>Margin (Manage outer spacing)</label>");
        elm.append(elb);
        for (let index = 0; index < 4; index++) {

            var vp = "";
            if(typeof(curCss) != "undefined" ){
                if(typeof(curCss[__paddingtype["ws_p_"+index]]) != "undefined"){
                    vp = curCss[__paddingtype["ws_p_"+index]];
                }else{
                    vp ="";
                }
            }
            let eli_h = $("<div/>",{
                class:"ws-col-p"
            });
            var eli = $("<input/>",{
                id:"ws_p_"+index,
                type:"text",
                class:"ws-col-p",
                value:vp,
                
            });
            eli_h.append("<span class='material-icons ws-plus'>add</span>");
            eli_h.append(eli);
            eli_h.append("<span class='material-icons ws-minus'>remove</span>");
            elp.append(eli_h);
            //elp.append(eli);
        }
        elp.append(elho.append("<label>Padding(Manage inner spacing)</label>"));
        elb.append(elp);
        el.append(elm);
        elMain.append(addionalCss);
        elMain.append(el);
        margin_hoder.append(elMain);
        return margin_hoder;
    }
    function whScroll(isScroll){

        var curCss = __current_col_edit.attr("data-meta-css");
        if(typeof(curCss) != "undefined" ){
            curCss = JSON.parse(__current_col_edit.attr("data-meta-css"));
        }else{
            curCss = {};
        }
        var curWidth = __current_col_edit.attr("data-width");
        if(typeof(curWidth) != "undefined" && curWidth !=""){
            var wid = curWidth;
        }else{
            var wid = "";
        }
        var width = $("<input>",{
            id:"ws-element-width",
            class:"ws-input",
            value:wid,
            type:"text"
        });
        var curHeight = __current_col_edit.attr("data-height");
        if(typeof(curHeight) != "undefined" && curHeight !=""){
            var hei = curHeight;
        }else{
            var hei = "";
        }
        var height = $("<input>",{
            id:"ws-element-height",
            class:"ws-input",
            value:hei,
            type:"text"
        });
        if(isScroll){

            var overList = ["none","visible","hidden","scroll","auto"];
            var sel = $("<select/>",{
                class:"ws-scroll-type"
            });
            for (let i = 0; i < overList.length; i++) {
                if(curCss["overflow"] != "undefined" && overList[i] == curCss["overflow"]){
                    sel.append(new Option(overList[i],overList[i],true,true));
                }else{
                    sel.append(new Option(overList[i],overList[i]));
                }
            }
        }
        
        var wh = $("<div/>",{
            class:"ws-who"
        });
        var whs = $("<div/>",{
            class:"ws-wh ws-section-setting"
        });
        whs.append(width);
        whs.append("<div class='clearfix'>&nbsp;</div>");
        whs.append(height);
        wh.append(whs);
        if(isScroll){
            wh.append("<p class='ws-setting-section-heading'><span>Content Overflow</span></p>");
            var holder = $("<div/>",{
                class:"ws-section-setting"
            }).append(sel);
            wh.append(holder);
        }
        return wh;
        
    }
    
    function getMobileSetting(){

        var mobile = __current_col_edit.attr("data-mobile");
        if(typeof(mobile) != "undefined" && mobile !=""){
            var mobileView = mobile;
        }else{
            var mobileView = "";
        }

        var tablet = __current_col_edit.attr("data-tablet");
        if(typeof(tablet) != "undefined" && tablet !=""){
            var tabletView = tablet;
        }else{
            var tabletView = "";
        }
            var mobileVList = ["Select","none","12/12","11/12","10/12","9/12","8/12","7/12","6/12","5/12","4/12","3/12","2/12","1/12"];
            var selm = $("<select/>",{
                class:"ws-mobile-res"
            });
            for (let i = 0; i < mobileVList.length; i++) {
                if(mobile != "undefined" && mobileVList[i] == mobileView){
                    selm.append(new Option(mobileVList[i],mobileVList[i],true,true));
                }else{
                    selm.append(new Option(mobileVList[i],mobileVList[i]));
                }
            }
            var selt = $("<select/>",{
                class:"ws-tablet-res"
            });
            for (let i = 0; i < mobileVList.length; i++) {
                if(tabletView != "undefined" && mobileVList[i] == tabletView){
                    selt.append(new Option(mobileVList[i],mobileVList[i],true,true));
                }else{
                    selt.append(new Option(mobileVList[i],mobileVList[i]));
                }
            }
        
            var whMob = $("<div/>",{
                class:"ws-mobile-view"
            });
            var tab = $("<div/>",{
                class:"ws-tablet-view"
            });
            whMob.append("<p class='ws-setting-section-heading'><span>Mobile Size</span></p>");
            var holder = $("<div/>",{
                class:"ws-section-setting"
            });
            holder.append(selm);
            whMob.append(holder);
            var holder2 = $("<div/>",{
                class:"ws-section-setting"
            });
            tab.append("<p class='ws-setting-section-heading'><span>Tablet Size</span></p>");
            holder2.append(selt);
            tab.append(holder2);

            var DisMob = $("<div/>",{
                class:"ws-responsive-view"
            });
            DisMob.append(whMob);
            DisMob.append(tab);
        return DisMob;
        
    }
    
    function getAlignment(){

        var curCss = __current_col_edit.attr("data-meta-css");
        if(typeof(curCss) != "undefined" ){
            curCss = JSON.parse(__current_col_edit.attr("data-meta-css"));
        }else{
            curCss = {};
        }
            var alignmentList = ["center","left","right","end","inherit","revert","unset"];
            var sel = $("<select/>",{
                class:"ws-align-text"
            });
            for (let i = 0; i < alignmentList.length; i++) {
                if(curCss["text-align"] != "undefined" && alignmentList[i] == curCss["text-align"]){
                    sel.append(new Option(alignmentList[i],alignmentList[i],true,true));
                }else{
                    sel.append(new Option(alignmentList[i],alignmentList[i]));
                }
            }
        
            var wh = $("<div/>",{
                class:"ws-aligment"
            });
            var holder = $("<div/>",{
                class:"ws-section-setting"
            });
            holder.append(sel);
        wh.append("<p class='ws-setting-section-heading'><span>Content Align</span></p>");
        wh.append(holder);
        return wh;
        
    }
    function borderSetting(){
        var borholder = $("<div/>",{
        });
        var curCss = __current_col_edit.attr("data-meta-css");
        if(typeof(curCss) != "undefined" ){
            curCss = JSON.parse(__current_col_edit.attr("data-meta-css"));
        }else{
            curCss = {};
        }
        //console.log(curCss);
        var borList = $("<div/>",{
            class:"ws-border-setting"
        });
        var bList = ["none","dotted","dashed","solid","double","groove","ridge","inset","outset"];
        var sel = $("<select/>",{
            class:"ws-border-type"
        });
        for (let i = 0; i < bList.length; i++) {
            if(curCss["border-style"] != "undefined" && bList[i] == curCss["border-style"]){
                sel.append(new Option(bList[i],bList[i],true,true));
            }else{
                sel.append(new Option(bList[i],bList[i]));
            }
        }
        borholder.append("<p class='ws-setting-section-heading'><span>Border</span></p>");
        borList.append(sel);

        if(typeof(curCss["border-color"]) != 'undefined'){
            var cor = curCss["border-color"];
        }else{
            var cor = "#000000";
        }
        
        var color = $("<input/>",{
            type:"text",
            value:cor,
            class:"ws-picker",
        });
        
        borList.append(color);
        borholder.append(borList);
        colorPicker(color);
        return borholder;
        
    }
    function backgroundSetting(isImage){
        
        var backList = $("<div/>",{
            class:"ws-background-setting"
        });
        var curCss = __current_col_edit.attr("data-meta-css");
        if(typeof(curCss) != "undefined" ){
            curCss = JSON.parse(__current_col_edit.attr("data-meta-css"));
        }else{
            curCss = {};
        }

        if(typeof(curCss["background-color"]) != 'undefined'){
            var cor = curCss["background-color"];
        }else{
            var cor = "#000000";
        }
        if(typeof(curCss["background"]) != 'undefined'){
            var cor = curCss["background"];
        }else{
            var cor = "#000000";
        }
        if(typeof(curCss["color"]) != 'undefined'){
            var corr = curCss["color"];
        }else{
            var corr= "#000000";
        }
        if(typeof(curCss["background-image"]) != 'undefined'){
            var bgimg = curCss["background-image"];
        }else{
            var bgimg= "";
        }

        var iscolor = $("<input/>",{
            id:"isbackground",
            type:"checkbox",
            class:"ws-picker-bgcheck",
        });

        var color = $("<input/>",{
            type:"text",
            value:cor,
            class:"ws-picker-bg backgroundColor",
        });
        if(isImage == true){
            var img = $("<input/>",{
                type:"text",
                value:bgimg,
                class:"ws-bg-image backgroundImage",
            });

            var uploadButton = $("<input>",{
                class:"btn loadMedia",
                type:"button",
                value:'Media',
                name:"Media",
                "data-change":"ws-bg-image",
                "data-toggle":"modal",
                "data-target":"#"+mediaModel,
            });

            var bgPosList = ["center","inherit","initial","left","revert","right","unset"];
            var selx = $("<select/>",{
                class:"ws-bg-x"
            });
            for (let i = 0; i < bgPosList.length; i++) {
                if(typeof(curCss["background-position-x"]) != "undefined" && bgPosList[i] == curCss["background-position-x"]){
                    selx.append(new Option(bgPosList[i],bgPosList[i],true,true));
                }else{
                    selx.append(new Option(bgPosList[i],bgPosList[i]));
                }
            }
            var sely = $("<select/>",{
                class:"ws-bg-y"
            });
            for (let i = 0; i < bgPosList.length; i++) {
                if(typeof(curCss["background-position-y"]) != "undefined" && bgPosList[i] == curCss["background-position-y"]){
                    sely.append(new Option(bgPosList[i],bgPosList[i],true,true));
                }else{
                    sely.append(new Option(bgPosList[i],bgPosList[i]));
                }
            }
            var bgsize = ["auto","contain","cover","inherit","initial","revert","unset"];
            var selsize = $("<select/>",{
                class:"ws-bg-size"
            });
            for (let i = 0; i < bgsize.length; i++) {
                if(typeof(curCss["background-size"]) != "undefined" && bgsize[i] == curCss["background-size"]){
                    selsize.append(new Option(bgsize[i],bgsize[i],true,true));
                }else{
                    selsize.append(new Option(bgsize[i],bgsize[i]));
                }
            }
            var selrepeat = $("<input/>",{
                type:"checkbox",
                class:"ws-bg-repeat"
            });
            if(typeof(curCss["background-repeat"]) != "undefined" && curCss["background-repeat"] !=""){
                
                selrepeat.prop("checked", true); 
                
            }else{
                selrepeat.prop("checked", false); 
            }

        }
        var txtcolor = $("<input/>",{
            type:"text",
            value:corr,
            class:"ws-picker-text textColor",
        });
        
        backList.append("<p class='ws-setting-section-heading'><span>None background</span></p>");
        var holderc =$("<div/>",{class:"ws-section-setting"}).append(iscolor);
        backList.append(holderc);
        if(isImage == true){
            backList.append("<br/><p class='ws-setting-section-heading'><span>Background image</span></p>");
            var holder =$("<div/>",{class:"ws-section-setting"}).append(img);
            backList.append(holder);
            var bgMedia =$("<div/>",{class:"ws-section-setting"}).append(uploadButton);
            backList.append(bgMedia);
            backList.append("<br/><p class='ws-setting-section-heading'><span>Background poition x</span></p>");
            var holder2 =$("<div/>",{class:"ws-section-setting"}).append(selx);
            backList.append(holder2);
            backList.append("<br/><p class='ws-setting-section-heading'><span>Background poition y</span></p>");
            var holder3 =$("<div/>",{class:"ws-section-setting"}).append(sely);
            backList.append(holder3);
            backList.append("<br/><p class='ws-setting-section-heading'><span>Background size</span></p>");
            var holder4 =$("<div/>",{class:"ws-section-setting"}).append(selsize);
            backList.append(holder4);
            backList.append("<br/><p class='ws-setting-section-heading'><span>Is Background Repeat</span></p>");
            var holder5 =$("<div/>",{class:"ws-section-setting"}).append(selrepeat);
            backList.append(holder5);
        }
        var holder2 =$("<div/>",{class:"ws-section-setting"});
        holder2.append(color);
        backList.append(holder2);
        backList.append("<p class='ws-setting-section-heading'><span>Text Color</span></p>");
        var holder =$("<div/>",{class:"ws-section-setting"});
        holder.append(txtcolor);
        
        backList.append(holder);
        colorPicker(color);
        colorPicker(txtcolor);
        return backList;
    }
    
    function colorPicker(obj){
        
        obj.minicolors({
            format:"rgb",
            opacity:true,
            change: function(value, opacity) {
              if( !value ) return;
              if( opacity ) value += ', ' + opacity;
              if( typeof console === 'object' ) {
              }
            },
            theme: 'bootstrap'
          });
    }
    settings.nextbtn.on("click",showNextImage);
    
    $("body").on("click",".ws-element-list",function(e){
        var doDrag = $(e.currentTarget).attr("data-act");
        if(typeof(doDrag) == "undefined"){
            if($(e.currentTarget).attr("data-type") !="row"){
                let ht = setItemPreview($(e.currentTarget).attr("data-type"));
                
                if(!$(activeElement).is(":empty")){
                    $(activeElement).find(".col-action.default").remove();
                }
                
                $(activeElement).append(ht);
                setupDropable();
                closeOverlay();
            }
        }
    });
    
    $("body").on("mousedown mouseup",'.ws-plus',function(e) {
        var tl = $(e.currentTarget).parent();
        if(e.type =="mousedown"){
            evt = setInterval(function(){
                let s= 0;
                let t = tl.find("input");
                if(t.val() !=""){
                    s = parseInt(t.val());
                }
                t.val(s+1);
            },50);
        }   
        if(e.type !="mousedown"){
            console.log(e.type);
            clearInterval(evt);
        }
    });
    $("body").on("mousedown mouseup",'.ws-minus',function(e) {
        var tl = $(e.currentTarget).parent();
        if(e.type =="mousedown"){
            evt = setInterval(function(){
                let s= 0;
                let t = tl.find("input");
                if(t.val() !=""){
                    s = parseInt(t.val());
                }
                t.val(s-1);
            },50);
        }   
        if(e.type !="mousedown"){
            console.log(e.type);
            clearInterval(evt);
        }
    });
    $("body").on("click",'a[data-toggle="tab"]',function(e) {
        e.preventDefault()
        $(this).tab('show');
    });
    $("body").on("click",".addRow",function(e){
       e.stopImmediatePropagation();
       $(".ws-playground").append(setItemPreview("row"));
        // $( ".ws-playground" ).sortable({
        //     items: '.rowData',
        // });
        setupDropable();
    });
    $("body").on("click",".ws_close_overlay",function(e){
        closeOverlay();
     });
    $("body").on("click",".col-action",function(e){
        e.stopImmediatePropagation();
        var act = $(this).attr("data-action");
        switch (act) {
            case "edit":{
                editColSetting(e,"col");
                break;
            }
            case "add":{
                addColElm(e,"col");
                break;
            }
            case "minimize":{
                minimizeCol(e);
            }
            default:
                break;
        }

    });
    
    $("body").on("click",".row-action",function(e){
        e.stopImmediatePropagation();
        var act = $(this).attr("data-action");
        switch (act) {
            case "edit":{
                editColSetting(e,"row");
                break;
            }
            case "delete":{
                deleteRow(e);
                break;
            }
            case "minimize":{
                minimize(e);
                break;
            }
            case "copy":{
                copyRow(e);
                break;
            }
            default:
                break;
        }
        
    });
    
    
    // arrange the columns
    $("body").on("click",".col-type-select",function(e){
        e.stopImmediatePropagation();
        var columntype = $(this).data("column");
        if(typeof(columntype) != "undefined"){
            var rowSection = $(this).closest(".rowData");
            var rowNo = rowSection.attr("data-count");
            var innerwrapper = rowSection.find(".ws-element-wrapper");
            performColumnsArrgements(innerwrapper,columntype);
            // $(".ws-row-col").droppable( {
            //     hoverClass: "ws-hovered",
            //     drop: handleDropEvent
            // });
            setupDropable();
            // $( ".ws-element-wrapper" ).sortable({
            //     items: '.ws-row-col',
            // });
        }
     });
     $("body").on("click",".first-column-add",function(e){
        e.stopImmediatePropagation();
        
        var rowSection = $(this).closest(".rowData");
        //var rowNo = rowSection.attr("data-count");
        var innerwrapper = rowSection.find(">div.ws-element-wrapper");
        //performColumnsArrgements(innerwrapper,columntype);
        innerwrapper.append(setItemPreview("row",true));
        rowSection.find(".first-column-add.default").remove();

       
        // $( ".ws-element-wrapper" ).sortable({
        //     items: '.rowDataInner',
        // });
        
        setupDropable();
        
     });
     
    // adjust controlls on screen to edit elements
    $("body").on("mouseover",".ws-data-element",function(e){
        // e.stopImmediatePropagation();
        // var rect = e.target.getBoundingClientRect();
        // var x = e.clientX - rect.left;
        // var y = e.clientY - rect.top;
        // console.log("Left? : " + x + " ; Top? : " + y + ".");
        // var eTop = $(e.currentTarget).offset().top; //get the offset top of the element
        // var newy = $(window).scrollTop() - eTop;
        
        // var yy = $(window).scrollTop();
        // console.log(" ; Top? : " + eTop + ".   "+yy);
        // $(e.currentTarget).find(".elm-action").css("top",eTop);

     });


    function showNextImage(){
        settings.setupPlayground.call();
    }
    __elementsfn['heading'] = function () { 
        playgroundElements.find(".element-list").append("<span class='ws-element-list' data-type='heading'><div class='icon'><span class='material-icons'>h_mobiledata</span></div><div class='text'>Heading</div></span>");
        setupDragable();
    };
    __elementsfn['paragraph'] = function() { 
        playgroundElements.find(".element-list").append("<span class='ws-element-list' data-type='paragraph'><div class='icon text'><span class='material-icons'>title</span></div><div class='text'><div class='title'>Text Block</div><div class='ws_second-info'>A block of text with WYSIWYG editor</div></div></span>");
        setupDragable();
    };
    __elementsfn['image'] = function() { 
        playgroundElements.find(".element-list").append("<span class='ws-element-list' data-type='image'><div class='icon'><span class='insert_photo'></span></div><div class='text'><div class='title'>Single Image</div><div class='ws_second-info'>Single image with Animation</div></div></span>");
        setupDragable();
    };
    __elementsfn['button'] = function() { 
        playgroundElements.find(".element-list").append("<span class='ws-element-list' data-type='button'><div class='icon'><span class='insert_button'></span></div><div class='text'><div class='title'>Button</div><div class='ws_second-info'>Add Custom Button</div></div></span>");
        setupDragable();
    };
    __elementsfn['link'] = function() { 
        playgroundElements.find(".element-list").append("<span class='ws-element-list' data-type='link'><div class='icon'><span class='insert_link'></span></div><div class='text'><div class='title'>Link</div><div class='ws_second-info'>Add Custom Link</div></div></span>");
        setupDragable();
    };
    __elementsfn['video'] = function() { 
        playgroundElements.find(".element-list").append("<span class='ws-element-list' data-type='video'><div class='icon'><span class='insert_video'></span></div><div class='text'><div class='title'>Single Video</div><div class='ws_second-info'>Single Video with Animation</div></div></span>");
        setupDragable();
    };
    __elementsfn['social'] = function() { 
        playgroundElements.find(".element-list").append("<span class='ws-element-list' data-type='social'><div class='icon'><span class='insert_soical'></span></div><div class='text'><div class='title'>Social Handels</div><div class='ws_second-info'>Add soical handels</div></div></span>");
        setupDragable();
    };
    __elementsfn['customHtml'] = function() { 
        playgroundElements.find(".element-list").append("<span class='ws-element-list' data-type='customHtml'><div class='icon'><span class='insert_html'></span></div><div class='text'><div class='title'>Custom HTML</div><div class='ws_second-info'>Add Custom HTML</div></div></span>");
        setupDragable();
    };
    __elementsfn['row'] = function() {
        playgroundElements.find(".layout-list").append("<span class='ws-element-list addRow' data-type='row'><div class='icon'><span class='material-icons'>link</span></div><div class='text'>Row</div></span>");
        setupDragable();
    };
    __elementsfn['icons'] = function() {
        playgroundElements.find(".element-list").append("<span class='ws-element-list' data-type='row'><div class='icon'><span class='material-icons'>link</span></div><div class='text'>Row</div></span>");
        setupDragable();
    };
    __elementsfn['separators'] = function() {
        playgroundElements.find(".element-list").append("<span class='ws-element-list' data-type='row'><div class='icon'><span class='material-icons'>link</span></div><div class='text'>Row</div></span>");
        setupDragable();
    };
    __elementsfn['hover_box'] = function() {
        playgroundElements.find(".element-list").append("<span class='ws-element-list addRow' data-type='row'><div class='icon'><span class='material-icons'>link</span></div><div class='text'>Row</div></span>");
        setupDragable();
    };
    __elementsfn['tabs'] = function() {
        playgroundElements.find(".element-list").append("<span class='ws-element-list addRow' data-type='row'><div class='icon'><span class='material-icons'>link</span></div><div class='text'>Row</div></span>");
        setupDragable();
    };
    __elementsfn['accordion'] = function() {
        playgroundElements.find(".element-list").append("<span class='ws-element-list addRow' data-type='row'><div class='icon'><span class='material-icons'>link</span></div><div class='text'>Row</div></span>");
        setupDragable();
    };
    __elementsfn['tour'] = function() {
        playgroundElements.find(".element-list").append("<span class='ws-element-list addRow' data-type='row'><div class='icon'><span class='material-icons'>link</span></div><div class='text'>Row</div></span>");
        setupDragable();
    };
    __elementsfn['google_map'] = function() {
        playgroundElements.find(".element-list").append("<span class='ws-element-list addRow' data-type='row'><div class='icon'><span class='material-icons'>link</span></div><div class='text'>Row</div></span>");
        setupDragable();
    };
    __elementsfn['charts'] = function() {
        playgroundElements.find(".element-list").append("<span class='ws-element-list addRow' data-type='row'><div class='icon'><span class='material-icons'>link</span></div><div class='text'>Row</div></span>");
        setupDragable();
    };
    __elementsfn['post_grid'] = function() {
        playgroundElements.find(".element-list").append("<span class='ws-element-list addRow' data-type='row'><div class='icon'><span class='material-icons'>link</span></div><div class='text'>Row</div></span>");
        setupDragable();
    };
    
    function setupDragable() {
        $("body").find(".ws-element-list").draggable({
        cursor: 'move',
        containment: 'document',
        helper:addElement,
        stop: handleDragStop,
        });

        $("body").find(".rowDataInner").draggable({
            cursor: 'move',
            containment: 'document',
            helper:addElement,
            stop: handleDragStop,
        });

        // for moveable sections
        $("body").find(".ws-right-actions").draggable();
    }
    function setupDropable() {
        // $("body").find(".ws-row-col").droppable({
        //     hoverClass: "ws-hovered",
        //     drop: handleDropEvent
        // });
        $("body").find(".rowDataInner").droppable({
            hoverClass: "ws-hovered",
            drop: handleDropEvent
        });
        // $(".ws-row-col").droppable( {
        //     hoverClass: "ws-hovered",
        //     drop: handleDropEvent
        // });
        $( ".ws-row-col").sortable({
            placeholder:"ui-state-highlight",
            connectWith: ".ws-row-col",
            forcePlaceholderSize:true,
            cancel: ".ws-col-header",
            change: function(event, ui) {
               
                }
        });
        $( ".ws-element-wrapper" ).sortable({
            placeholder:"ui-state-highlight",
            forcePlaceholderSize:true,
            items: '>.ws-row-col',
        });
        $( ".ws-playground" ).sortable({
            placeholder:"ui-state-highlight",
            forcePlaceholderSize:true,
            items: '>.rowData',
        });
        $( ".ws-element-wrapper").sortable({
            placeholder:"ui-state-highlight",
            forcePlaceholderSize:true,
            items: '>.rowDataInner',
        });
    }
    
    function addElement(e){
        //console.log("selected element"+$(e.currentTarget).attr("data-type"));
        $(".ws-page-builder").css({overflow:"unset"});
        return getItemPreview($(e.currentTarget).attr("data-type"));
    }
    
    function handleDragStop(){
        $(".ws-page-builder").css({overflow:"auto"});
        //alert('<div id="draggableHelper">I am a helper - drag me!</div>');
    }
    
    function handleDropEvent(event,ui){
        var doDrag = $(ui.draggable).attr("data-act");
        //alert(doDrag);
        if(typeof(doDrag) == "undefined"){
            
            if((ui.draggable).attr("data-type") !="row"){
                //var ht = setItemPreview($(ui.draggable).attr("data-type"))
                $(this).append($(ui.draggable));
                setupDropable();
            }
        }
    }
    function deleteRow(e){
        e.stopImmediatePropagation();
        let el = $(e.currentTarget).closest(".rowData").parent(".ws-element-wrapper");
        //rowDataInner
        $(e.currentTarget).closest(".rowData").remove();
        if(settings.version =="inline"){
            if(el.find(".rowDataInner").length<=0){
                let inel = $("<div>",{class:"col-type first-column-add default"}).append("<span class='material-icons'>add</span><br/>Row");
                el.append(inel);
            }
        }
        // deleteRow
    }
    function minimize(e){
        //$(e.currentTarget).closest(".rowData").remove();
        
        var state = $(e.currentTarget).attr("data-state");
        if(state == "minimize"){
            $(e.currentTarget).html("expand_less");
            $(e.currentTarget).closest('.rowData').find('.ws-element-wrapper').addClass("hide");
            $(e.currentTarget).attr("data-state","max");
        }else{
            $(e.currentTarget).html("expand_more");
            $(e.currentTarget).attr("data-state","minimize");
            $(e.currentTarget).closest('.rowData').find('.ws-element-wrapper').removeClass("hide");    
        }
    }
    function copyRow(e){
        
        var le = parseInt($(".rowData").length);
        if(__rows !=0){
            __rows = __rows + 1;
        }else if(le <=0){
            __rows = __rows + 1;
        }else{
            __rows = parseInt(le)+1;
        }
        
        var rowEl = $(e.currentTarget).closest(".rowData");
        var klon = rowEl.clone().attr('data-count',__rows);
        rowEl.after(klon);
        
        klon.find(".ws-element-wrapper").each(function() {
            var rowName = "ws-row-data-"+new Date().valueOf();
            $(this).prop("id",rowName);
        });
        klon.find(".ws-row-col").each(function() {
            var rm = Math.floor(Math.random()* 100);
            var rowName = "ws-"+new Date().valueOf()+"_"+rm;
            $(this).prop("id",rowName);
        });
        klon.find(".ws-data-element").each(function() {
            var rm = Math.floor(Math.random()* 100);
            var rowName = "ws_"+new Date().valueOf()+"_"+rm;
            $(this).prop("id",rowName);
        });
        
       /* if(__rows !=0){
            __rows = __rows + 1;
        }else if(parseInt($(".rowData").length) <=0){
            __rows = __rows + 1;
        }else{
            __rows = parseInt($(".rowData").length);
        }
        var newEl = rowEl.clone().prop('data-count',__rows).empty();
        newEl.append(rowEl.find('.rowHeaders').clone());
        rowEl.find(".ws-row-col").each(function() {
            
            if(__rows !=0){
                __rows = __rows + 1;
            }else if(parseInt($(".rowData").length) <=0){
                __rows = __rows + 1;
            }else{
                __rows = parseInt($(".rowData").length);
            }
            var rowName = "ws-row-data-"+__rows;
            var klon = $(this).clone().prop('id',rowName);
            newEl.append(klon);
            
            rowEl.find(".ws-data-element").each(function() {

                var rm = Math.floor(Math.random()* 100);
                var id = "ws-"+new Date().valueOf()+"_"+rm;
                var klon1 = $(this).clone().prop('id',id);
                klon.append(klon1);
            })
        });
        rowEl.after(newEl);*/
    }
    function minimizeCol(e){
        //$(e.currentTarget).closest(".rowData").remove();
        
        var state = $(e.currentTarget).attr("data-state");
        if(state == "minimize"){
            $(e.currentTarget).html("expand_less");
            $(e.currentTarget).closest('.ws-row-col').find('.ws-data-element').addClass("hide");
            $(e.currentTarget).attr("data-state","max");
        }else{
            $(e.currentTarget).html("expand_more");
            $(e.currentTarget).attr("data-state","minimize");
            $(e.currentTarget).closest('.ws-row-col').find('.ws-data-element').removeClass("hide");    
        }
    }

    // create dragable item preview
    function getItemPreview(type){

        switch(type){
            case 'heading':{
                return "<div class='ws-preview-items' data-type='heading'><h1>Heading</h1></div>";
                break;
            }
            case 'paragraph':{
                return "<div class='ws-preview-items' data-type='paragraph'><strong>What is Lorem Ipsum?</strong>Lorem Ipsum is simply dummy text of the printing and typesetting industry.</div>";
                break;
            }
            case 'image':{
                return "<div class='ws-preview-items' data-type='image'><h1>Image</h1></div>";
                break;
            }
            case 'button':{
                return "<div class='ws-preview-items' data-type='button'><h1>Button</h1></div>";
                break;
            }
            case 'link':{
                return "<div class='ws-preview-items' data-type='link'><h1>Link</h1></div>";
                break;
            }
            case 'video':{
                
                return "<div class='ws-preview-items' data-type='video'><span class='material-icons'>videocam</span></div>";
                break;
            }
            case 'social':{
                
                return "<div class='ws-preview-items' data-type='social'><span class='material-icons'>share</span></div>";
                break;
            }
            case 'customHtml':{
                
                return "<div class='ws-preview-items' data-type='customHtml'><span class='material-icons'>code</span></div>";
                break;
            }
            case 'icons':{
                return "<div class='ws-preview-items' data-type='row'><h1>row</h1></div>";
                break;
            }
            case 'separators':{
                return "<div class='ws-preview-items' data-type='row'><h1>row</h1></div>";
                break;
            }
            case 'hover_box':{
                return "<div class='ws-preview-items' data-type='row'><h1>row</h1></div>";
                break;
            }
            case 'tabs':{
                return "<div class='ws-preview-items' data-type='row'><h1>row</h1></div>";
                break;
            }
            case 'accordion':{
                return "<div class='ws-preview-items' data-type='row'><h1>row</h1></div>";
                break;
            }
            case 'tour':{
                return "<div class='ws-preview-items' data-type='row'><h1>row</h1></div>";
                break;
            }
            case 'google_map':{
                return "<div class='ws-preview-items' data-type='row'><h1>row</h1></div>";
                break;
            }
            case 'charts':{
                return "<div class='ws-preview-items' data-type='row'><h1>row</h1></div>";
                break;
            }
            case 'post_grid':{
                return "<div class='ws-preview-items' data-type='row'><h1>row</h1></div>";
                break;
            }
        }
    }

    // create dragable item
    function setItemPreview(type,noRow=false){
        var d = new Date();
        var n = d.getTime();
        var newId = "ws_"+n;
        var ediDetails = '<div class="row-action-header"><span data-action="edit" title="Row Setting" class="row-action material-icons">edit</span><span data-action="minimize" title="Minimize Row" data-state="minimize" class="row-action material-icons">expand_more</span><span data-action="copy" title="Duplicate" class="row-action material-icons">content_copy</span><span data-action="delete" title="Delete Row" class="row-action material-icons">close</span></div>';
        var ediDetailsSection = '<div class="row-action-header"><span data-action="edit" title="Section Setting" class="row-action material-icons">edit</span><span data-action="minimize" title="Minimize Section" data-state="minimize" class="row-action material-icons">expand_more</span><span data-action="copy" title="Duplicate" class="row-action material-icons">content_copy</span><span data-action="delete" title="Delete Section" class="row-action material-icons">close</span></div>';
        
        switch(type){
            case 'heading':{
                return "<div class='ui-state-default' data-type='heading'><h1>Heading</h1></div>";
                break;
            }
            case 'paragraph':{
                
                return "<div id='"+newId+"' class='paragraph-text ws-data-element ui-state-default' data-act='no-drag' data-type='paragraph'><span class='elm-action'><div class='icon'><span class='insert_text'></span></div><span class='wc_control-btn-move' title='Move Block'><i class='material-icons'>open_with</i></span> <span class='wc_control-btn-copy title='Copy Block'><i class='material-icons'>content_copy</i></span>  <span class='wc_control-btn-edit' title='Edit Block'><i class='material-icons'>edit</i></span><span class='wc_control-btn-del' title='Remove Block'><i class='material-icons'>close</i></span></span><span class='p-txt'><strong>What is Lorem Ipsum?</strong>Lorem Ipsum is simply dummy text of the printing and typesetting industry.</span></div>";
                break;
            }
            case 'image':{
                return "<div id='"+newId+"' class='ws-image-link ws-data-element' data-act='no-drag' data-type='image'><div class='icon'><span class='insert_photo'></span></div><span class='elm-action'><span class='wc_control-btn-move' title='Move Image'><i class='material-icons'>open_with</i></span> <span class='wc_control-btn-copy title='Copy Image'><i class='material-icons'>content_copy</i></span>  <span class='wc_control-btn-edit' title='Edit Image'><i class='material-icons'>edit</i></span><span class='wc_control-btn-del' title='Remove Image'><i class='material-icons'>close</i></span></a></span></div>";
                break;
            }
            case 'button':{
                return "<div id='"+newId+"' class='ws-button-link ws-data-element' data-act='no-drag' data-type='button'><div class='icon'><span class='insert_button'></span></div><span class='elm-action'><span class='wc_control-btn-move' title='Move Button'><i class='material-icons'>open_with</i></span> <span class='wc_control-btn-copy title='Copy Button'><i class='material-icons'>content_copy</i></span>  <span class='wc_control-btn-edit' title='Edit Button'><i class='material-icons'>edit</i></span><span class='wc_control-btn-del' title='Remove Button'><i class='material-icons'>close</i></span></span></div>";
                break;
            }
            case 'link':{
                return "<div id='"+newId+"' class='ws-link-text ws-data-element' data-act='no-drag' data-type='link'><div class='icon'><span class='insert_link'></span></div><span class='elm-action'><span class='wc_control-btn-move' title='Move Link'><i class='material-icons'>open_with</i></span> <span class='wc_control-btn-copy title='Copy Link'><i class='material-icons'>content_copy</i></span>  <span class='wc_control-btn-edit' title='Edit Link'><i class='material-icons'>edit</i></span><span class='wc_control-btn-del' title='Remove Link'><i class='material-icons'>close</i></span></span></div>";
                break;
            }
            case 'video':{
                return "<div id='"+newId+"' class='ws-video-link ws-data-element' data-act='no-drag' data-type='video'><div class='icon'><span class='insert_video'></span></div><span class='elm-action'><span class='wc_control-btn-move' title='Move Video'><i class='material-icons'>open_with</i></span> <span class='wc_control-btn-copy title='Copy Video'><i class='material-icons'>content_copy</i></span>  <span class='wc_control-btn-edit' title='Edit Video'><i class='material-icons'>edit</i></span><span class='wc_control-btn-del' title='Remove Video'><i class='material-icons'>close</i></span></span></div>";
                break;
            }
            case 'social':{
                return "<div id='"+newId+"' class='ws-social-link ws-data-element' data-act='no-drag' data-type='social'><div class='icon'><span class='insert_soical'></span></div><span class='elm-action'><span class='wc_control-btn-move' title='Move Social'><i class='material-icons'>open_with</i></span> <span class='wc_control-btn-copy title='Copy Social'><i class='material-icons'>content_copy</i></span>  <span class='wc_control-btn-edit' title='Edit Social'><i class='material-icons'>edit</i></span><span class='wc_control-btn-del' title='Remove Social'><i class='material-icons'>close</i></span></span></div>";
                break;
            }
            case 'customHtml':{
                return "<div id='"+newId+"' class='ws-customHtml-link ws-data-element' data-act='no-drag' data-type='customHtml'><div class='icon'><span class='insert_html'></span></div><span class='elm-action'><span class='wc_control-btn-move' title='Move Custon Html'><i class='material-icons'>open_with</i></span> <span class='wc_control-btn-copy title='Copy Custon Html'><i class='material-icons'>content_copy</i></span>  <span class='wc_control-btn-edit' title='Edit Custon Html'><i class='material-icons'>edit</i></span><span class='wc_control-btn-del' title='Remove Custon Html'><i class='material-icons'>close</i></span></span></div>";
                break;
            }
            case 'icons':{
                return "<div id='"+newId+"' class='ws-customHtml-link ws-data-element' data-act='no-drag' data-type='customHtml'><span class='material-icons'>code</span><span class='elm-action'><span class='wc_control-btn-move' title='Move icon'><i class='material-icons'>open_with</i></span> <span class='wc_control-btn-copy title='Copy icon'><i class='material-icons'>content_copy</i></span>  <span class='wc_control-btn-edit' title='Edit icon'><i class='material-icons'>edit</i></span><span class='wc_control-btn-del' title='Remove icon'><i class='material-icons'>close</i></span></span></div>";
                break;
            }
            case 'separators':{
                return "<div id='"+newId+"' class='ws-customHtml-link ws-data-element' data-act='no-drag' data-type='customHtml'><span class='material-icons'>code</span><span class='elm-action'><span class='wc_control-btn-move' title='Move Separators'><i class='material-icons'>open_with</i></span> <span class='wc_control-btn-copy title='Copy Separators'><i class='material-icons'>content_copy</i></span>  <span class='wc_control-btn-edit' title='Edit Separators'><i class='material-icons'>edit</i></span><span class='wc_control-btn-del' title='Remove Separators'><i class='material-icons'>close</i></span></span></div>";
                break;
            }
            case 'hover_box':{
                return "<div id='"+newId+"' class='ws-customHtml-link ws-data-element' data-act='no-drag' data-type='customHtml'><span class='material-icons'>code</span><span class='elm-action'><span class='wc_control-btn-move' title='Move Hover'><i class='material-icons'>open_with</i></span> <span class='wc_control-btn-copy title='Copy Hover'><i class='material-icons'>content_copy</i></span>  <span class='wc_control-btn-edit' title='Edit Hover'><i class='material-icons'>edit</i></span><span class='wc_control-btn-del' title='Remove Hover'><i class='material-icons'>close</i></span></span></div>";
                break;
            }
            case 'tabs':{
                return "<div id='"+newId+"' class='ws-customHtml-link ws-data-element' data-act='no-drag' data-type='customHtml'><span class='material-icons'>code</span><span class='elm-action'><span class='wc_control-btn-move' title='Move Tabs'><i class='material-icons'>open_with</i></span> <span class='wc_control-btn-copy title='Copy Tabs'><i class='material-icons'>content_copy</i></span>  <span class='wc_control-btn-edit' title='Edit Tabs'><i class='material-icons'>edit</i></span><span class='wc_control-btn-del' title='Remove Tabs'><i class='material-icons'>close</i></span></span></div>";
                break;
            }
            case 'accordion':{
                return "<div id='"+newId+"' class='ws-customHtml-link ws-data-element' data-act='no-drag' data-type='customHtml'><span class='material-icons'>code</span><span class='elm-action'><span class='wc_control-btn-move' title='Move Accordion'><i class='material-icons'>open_with</i></span> <span class='wc_control-btn-copy title='Copy Accordion'><i class='material-icons'>content_copy</i></span>  <span class='wc_control-btn-edit' title='Edit Accordion'><i class='material-icons'>edit</i></span><span class='wc_control-btn-del' title='Remove Accordion'><i class='material-icons'>close</i></span></span></div>";
                break;
            }
            case 'tour':{
                return "<div id='"+newId+"' class='ws-customHtml-link ws-data-element' data-act='no-drag' data-type='customHtml'><span class='material-icons'>code</span><span class='elm-action'><span class='wc_control-btn-move' title='Move Tour'><i class='material-icons'>open_with</i></span> <span class='wc_control-btn-copy title='Copy Tour'><i class='material-icons'>content_copy</i></span>  <span class='wc_control-btn-edit' title='Edit Tour'><i class='material-icons'>edit</i></span><span class='wc_control-btn-del' title='Remove Tour'><i class='material-icons'>close</i></span></span></div>";
                break;
            }
            case 'google_map':{
                return "<div id='"+newId+"' class='ws-customHtml-link ws-data-element' data-act='no-drag' data-type='customHtml'><span class='material-icons'>code</span><span class='elm-action'><span class='wc_control-btn-move' title='Move Google Map'><i class='material-icons'>open_with</i></span> <span class='wc_control-btn-copy title='Copy Google Map'><i class='material-icons'>content_copy</i></span>  <span class='wc_control-btn-edit' title='Edit Google Map'><i class='material-icons'>edit</i></span><span class='wc_control-btn-del' title='Remove Google Map'><i class='material-icons'>close</i></span></span></div>";
                break;
            }
            case 'charts':{
                return "<div id='"+newId+"' class='ws-customHtml-link ws-data-element' data-act='no-drag' data-type='customHtml'><span class='material-icons'>code</span><span class='elm-action'><span class='wc_control-btn-move' title='Move Charts'><i class='material-icons'>open_with</i></span> <span class='wc_control-btn-copy title='Copy Charts'><i class='material-icons'>content_copy</i></span>  <span class='wc_control-btn-edit' title='Edit Charts'><i class='material-icons'>edit</i></span><span class='wc_control-btn-del' title='Remove Charts'><i class='material-icons'>close</i></span></span></div>";
                break;
            }
            case 'post_grid':{
                return "<div id='"+newId+"' class='ws-customHtml-link ws-data-element' data-act='no-drag' data-type='customHtml'><span class='material-icons'>code</span><span class='elm-action'><span class='wc_control-btn-move' title='Move Post Grid'><i class='material-icons'>open_with</i></span> <span class='wc_control-btn-copy title='Copy Post Grid'><i class='material-icons'>content_copy</i></span>  <span class='wc_control-btn-edit' title='Edit Post Grid'><i class='material-icons'>edit</i></span><span class='wc_control-btn-del' title='Remove Post Grid'><i class='material-icons'>close</i></span></span></div>";
                break;
            }
            case 'row':{

                if(__rows !=0){
                    __rows = __rows + 1;
                }else if(parseInt($(".rowData").length) <=0){
                    __rows = __rows + 1;
                }else{
                    __rows = parseInt($(".rowData").length);
                }
                var rowName = "ws-row-data-"+new Date().valueOf();
                var _col = createColumnSection();
                $(".defaultView").remove();
                let rowl =  $("<div>",{
                    class:'rowData',
                    "data-count":__rows,
                    "data-type":'row',
                });
                let rnl = $("<div>",{
                    id:rowName,
                    class:"ws-element-wrapper ws-dropable-items"
                })
                let rowel =  $("<div>",{class:'rowHeaders',}).append($("<ul>",{class:'act-headers'}).append("<li class='col-type move-row'><span class='material-icons'>open_with</span></li><li class='col-type first-column-add'><span class='material-icons'>add</span></li><li class='col-type column-selected'>"+_col+"</li>"));//.append(ediDetails);
                if(noRow){
                    rowel.find(".first-column-add").remove();
                    rowel.append(ediDetails);
                    rowl.addClass("rowDataInner");
                    // rowl.attr("data-act",'no-drag');
                    rowl.append(rowel);
                    rowl.append(rnl);
                    if(settings.version == "inline"){
                        //rnl.append(inel);
                        performColumnsArrgements(rnl,"col-1");
                        // $(".ws-row-col").droppable( {
                        //     hoverClass: "ws-hovered",
                        //     drop: handleDropEvent
                        // });
                        setupDropable();
                        // $( ".ws-element-wrapper" ).sortable({
                        //     items: '.ws-row-col',
                        // });
                       
                    }
                    return rowl;
                
                }else{
                    if(settings.version == "inline"){
                        rowel.append(ediDetailsSection);
                        rowel.find(".column-selected").remove();
                        let inel = $("<div>",{class:"col-type first-column-add default"}).append("<span class='material-icons'>add</span><br/>Row");
                        rnl.append(inel);
                        rowl.append(rowel);
                        rowl.append(rnl);
                        rowl.append(inel.clone().removeClass("default").addClass("bt"));
                        return rowl;
                    }else{
                        rowel.append(ediDetailsSection);
                        //return "<div class='rowData' data-count='"+__rows+"' data-type='row'><div class='rowHeaders'><ul class='act-headers'><li class='col-type move-row'><span class='material-icons'>open_with</span></li><li class='col-type first-column-add'><span class='material-icons'>add</span></li><li class='col-type column-selected'>"+_col+"</li></ul>"+ediDetails+"</div><div id='"+rowName+"' class='ws-element-wrapper ws-dropable-items'></div></div>";
                        rowl.append(rowel);
                        rowl.append(rnl);
                        return rowl;
                    }
                }
                break;
            }
        }
    }

    function createColumnSection(){

        var col = "<span class='moreoption'><ul>";
        for (let index = 1; index <= 12; index++) {
            
            col = col + "<li data-column='col-"+index+"' class='col-type col-type-select col-type-"+index+"'></li>";
        }
        col = col + "</ul></span>";
        return col;
    }
    function performColumnsArrgements(element,type){
        
        var tempDiv = $("<div/>",{id:"tempTxt"});
        element.find(".ws-row-col").each(function() {
            $(this).find(".ws-col-header").remove();
            $(this).find(".col-action").remove();
            if($(this).is(':empty')){
                //
            }else{
                var ht = $(this).html();
                console.log("ht");
                console.log(ht);
                tempDiv.append(ht);
            }
        });
        
        //console.log(" Data HTML == >");
        $(element).html("");
                var sizes = __columnsSize[type].size;
                var tcol = sizes.split(",");
                let inel = $("<div>",{class:"col-action default","data-action":"add",title:"Add Element"}).append("<span class='material-icons'>add</span><br/>Element");
                jQuery.each(tcol,function(index,value){
                    var rm = Math.floor(Math.random()* 100);
                    var id = "ws-"+new Date().valueOf()+"_"+rm;
                    var cls = 'ws-row-col ws-col-size-'+value+' '+settings.version;
                    var edit = $("<div/>",{
                        class:"ws-col-header"
                    });
                    
                    edit.html('<span data-action="add" title="Add Element" class="col-action material-icons">add</span><span data-action="edit" title="Column Settings" class="col-action material-icons">edit</span><span data-action="minimize" title="Minimze" data-state="minimize" class="col-action material-icons hideShow">expand_more</span>');//<span data-action="delete" class="col-action material-icons">close</span>
                    
                    if(index == 0 ){
                        if (tempDiv.is(':empty')){
                            $('<div />', {
                                id:id,
                                class: cls,
                            }).append(edit).append(inel.clone()).appendTo(element);
                        }else{
                            $('<div />', {
                                id:id,
                                class: cls,
                            }).append(edit).append(tempDiv.html()).appendTo(element);
                        }
                    }else{
                        $('<div />', {
                            id:id,
                            class: cls,
                        }).append(edit).append(inel.clone()).appendTo(element);
                        
                    }
                });
    }
    // show row column optons

    // make playground drop able to create new events
    /*$(playground).droppable( {
    hoverClass: "ws-hovered",
    drop: handleDropEvent
    });*/
    
    // setup all playground elements
    setuppPlaygroundElements();
    setupPlayground();
    
    const styleToString = (style) => {
        return Object.keys(style).reduce((acc, key) => (
            acc + key.split(/(?=[A-Z])/).join('-').toLowerCase() + ':' + style[key] + ';'
        ), '');
    };

    // show and hide right side sections
    $("body").on("click",".ws-section-header",function(e){
        e.stopImmediatePropagation();
        var show = $(e.currentTarget).data("show");
        //$(".ws-list-view").hide();
        $("."+show).show();
    });

    // make text as editable
    
    $("body").on("click",".wc_control-btn-edit",function(e){
        e.preventDefault();
        e.stopImmediatePropagation();
        var colEl = $(e.currentTarget).closest(".ws-data-element");
        var checkType = colEl.attr("data-type");
        
        switch(checkType){
            case "paragraph" :{
                editTextSetting(colEl);
                break;
            }
            case "video" :{
                editVideoSetting(colEl);
                break;
            }
            case "image" :{
                editImageSetting(colEl);
                break;
            }
            case "button" :{
                editButtonSetting(colEl);
                break;
            }
            case "link" :{
                editLinkSetting(colEl);
                break;
            }
            case "social" :{
                editSocialSetting(colEl);
                break;
            }
            case "customHtml" :{
                editHtmlSetting(colEl);
                break;
            }
            
        }
        
    });
    $("body").on("click",".wc_control-btn-del",function(e){
        e.preventDefault();
        e.stopImmediatePropagation();
        let col = $(e.currentTarget).closest(".ws-row-col");
        $(e.currentTarget).closest(".ws-data-element").remove();
        if(settings.version =="inline"){
            //alert($(e.currentTarget).closest(".ws-row-col").find(".ws-data-element").length);
            if(col .find(".ws-data-element").length <=0){
                col.append(inel_add);
            }
        }
    });
    $("body").on("click",".wc_control-btn-copy",function(e){
        e.preventDefault();
        e.stopImmediatePropagation();
        var rowEl = $(e.currentTarget).closest(".ws-data-element");
        var rm = Math.floor(Math.random()* 100);
        var rowName = "ws_"+new Date().valueOf()+"_"+rm;
        var klon = rowEl.clone();
        klon.prop("id",rowName);
        rowEl.after(klon);
        klon.find(".ws-data-element").each(function() {
        });
    });
    

    // Appying css changes
    $("body").on("keyup",".ws-col-p,.ws-col-m,.ws-col-b",function(e){
        e.stopImmediatePropagation();
        //let el = $(this).find("input");
        let el = $(e.currentTarget);
        if($(this).hasClass("ws-col-p")){
            var tochange = __paddingtype[el.attr("id")];
        }
        if($(this).hasClass("ws-col-b")){
            var tochange = __bordertype[el.attr("id")];
        }
        if($(this).hasClass("ws-col-m")){
            var tochange = __margintype[el.attr("id")];
        }
        var metaCss = __current_col_edit.attr("data-meta-css");
        if(metaCss !="" && typeof(metaCss) != "undefined"){
            var metaCss1 = JSON.parse(metaCss);
        }else{
            var metaCss1={};
        }
        // if(parseInt(el.val()) == "" || parseInt(el.val()) == 0){
        //     delete metaCss1[tochange];
        // }else{
        //     metaCss1[tochange] =parseInt(el.val());
        // }
        if(el.val() == "" || el.val() == 0){
            delete metaCss1[tochange];
        }else{
            metaCss1[tochange] =el.val();
        }
        if(settings.version == "inline"){
           
            __current_col_edit.css(tochange,el.val());
            //__current_col_edit.css(tochange,parseInt(el.val())+"px");
        }
        __current_col_edit.attr("data-meta-css",JSON.stringify(metaCss1));
        console.log(JSON.stringify(metaCss1));
    });
    $("body").on("keyup",".social-link-txt",function(e){
        e.stopImmediatePropagation();
        
        var type = $(this).attr("data-type");
        if($(this).val() ==""){
            __current_col_edit.attr(dtype,"");
        }else{
            var dtype = "data-"+type;
            __current_col_edit.attr(dtype,$(this).val());
        }
    });
    $("body").on("propertychange change keyup paste input",".custom-html",function(e){
        e.stopImmediatePropagation();
        __current_col_edit.find(".custom-html-txt").remove();
        __current_col_edit.find(".icon").hide();
        var txt = $(this).val();
        if($(this).val() !=""){
           var tt = $("<div/>",{
               class:"custom-html-txt"
           });
           tt.append(txt);
           __current_col_edit.append(tt);
        }
    });
    $("body").on("propertychange change keyup paste input",".row-type",function(e){
        e.stopImmediatePropagation();
        __current_col_edit.closest(".rowData").attr("data-row-type",$(this).val());
    });
    $("body").on("propertychange change keyup paste input",".row-type-check",function(e){
        e.stopImmediatePropagation();
        if(this.checked){
            __current_col_edit.closest(".rowData").attr("data-row-type","container-with-row");
        }else{
            __current_col_edit.closest(".rowData").attr("data-row-type",$(".row-type").val());
        }

    });

    $("body").on("propertychange change keyup paste input",".ws-scroll-type",function(e){
        e.stopImmediatePropagation();
        if(settings.version == "inline"){
            __current_col_edit.css("overflow",$(this).val());
        }
        var metaCss = __current_col_edit.attr("data-meta-css");
        if(metaCss !="" && typeof(metaCss) != "undefined"){
            var metaCss1 = JSON.parse(metaCss);
        }else{
            var metaCss1={};
        }
        if($(this).val() == "none"){
            delete metaCss1["overflow"];
        }else{
            metaCss1["overflow"] =  $(this).val();  
        }

        __current_col_edit.attr("data-meta-css",JSON.stringify(metaCss1));
    });

    

    $("body").on("propertychange change keyup paste input",".ws-border-type",function(e){
        e.stopImmediatePropagation();
        var metaCss = __current_col_edit.attr("data-meta-css");
        if(metaCss !="" && typeof(metaCss) != "undefined"){
            var metaCss1 = JSON.parse(metaCss);
        }else{
            var metaCss1={};
        }
        if($(this).val() == "none"){
            delete metaCss1["border-style"];
        }else{
            metaCss1["border-style"] =  $(this).val();  
        }
        if(settings.version == "inline"){
            __current_col_edit.css("border-style",$(this).val());
        }
        /*
        for (let index = 0; index < 4; index++) {

            var vb = "";
            if(typeof(metaCss1) != "undefined" ){
                if(typeof(metaCss1[__bordertype["ws_b_"+index]]) != "undefined"){
                    console.log("B type ==>",__bordertype["ws_b_"+index]);
                    //vb = metaCss1[__bordertype["ws_b_"+index]];
                    var svb = (metaCss1[__bordertype["ws_b_"+index]]).split(" ");
                    if(settings.version == "inline"){
                        vb =  svb[0]+ " " + $(this).val() +" "+$(".ws-picker").val();
                        metaCss1[__bordertype["ws_b_"+index]] = vb;    
                        
                        __current_col_edit.css(__bordertype["ws_b_"+index],vb);
                    }else{
                        vb =  svb[0]+ " " + $(this).val() +" "+$(".ws-picker").val();
                        metaCss1[__bordertype["ws_b_"+index]] = vb;    
                    }
                    console.log(metaCss1);
                }
            }
        }*/
        __current_col_edit.attr("data-meta-css",JSON.stringify(metaCss1));
        
    });

    $("body").on("propertychange change keyup paste input",".ws-bg-x",function(e){
        e.stopImmediatePropagation();
        var metaCss = __current_col_edit.attr("data-meta-css");
        if(metaCss !="" && typeof(metaCss) != "undefined"){
            var metaCss1 = JSON.parse(metaCss);
        }else{
            var metaCss1={};
        }
        if($(this).val() == "none"){
            delete metaCss1["background-position-x"];
        }else{
            metaCss1["background-position-x"] =  $(this).val();  
        }
        if(settings.version == "inline"){
            __current_col_edit.css("background-position-x",$(this).val());
        }
        __current_col_edit.attr("data-meta-css",JSON.stringify(metaCss1));
        
    });

    $("body").on("propertychange change keyup paste input",".ws-bg-y",function(e){
        e.stopImmediatePropagation();
        var metaCss = __current_col_edit.attr("data-meta-css");
        if(metaCss !="" && typeof(metaCss) != "undefined"){
            var metaCss1 = JSON.parse(metaCss);
        }else{
            var metaCss1={};
        }
        if($(this).val() == "none"){
            delete metaCss1["background-position-y"];
        }else{
            metaCss1["background-position-y"] =  $(this).val();  
        }
        if(settings.version == "inline"){
            __current_col_edit.css("background-position-y",$(this).val());
        }
        __current_col_edit.attr("data-meta-css",JSON.stringify(metaCss1));
        
    });
    $("body").on("propertychange change keyup paste input",".ws-bg-size",function(e){
        e.stopImmediatePropagation();
        var metaCss = __current_col_edit.attr("data-meta-css");
        if(metaCss !="" && typeof(metaCss) != "undefined"){
            var metaCss1 = JSON.parse(metaCss);
        }else{
            var metaCss1={};
        }
        if($(this).val() == ""){
            delete metaCss1["background-size"];
        }else{
            metaCss1["background-size"] =  $(this).val();  
        }
        if(settings.version == "inline"){
            __current_col_edit.css("background-size",$(this).val());
        }
        __current_col_edit.attr("data-meta-css",JSON.stringify(metaCss1));
        
    });

    $("body").on("propertychange change keyup paste input",".ws-align-text",function(e){
        e.stopImmediatePropagation();
        var metaCss = __current_col_edit.attr("data-meta-css");
        if(metaCss !="" && typeof(metaCss) != "undefined"){
            var metaCss1 = JSON.parse(metaCss);
        }else{
            var metaCss1={};
        }
        if($(this).val() == "none"){
            delete metaCss1["text-align"];
        }else{
            metaCss1["text-align"] =  $(this).val();  
        }
        if(settings.version == "inline"){
            __current_col_edit.css("text-align",$(this).val());
        }
        __current_col_edit.attr("data-meta-css",JSON.stringify(metaCss1));
        
    });
    
    $("body").on("propertychange change keyup paste input",".ws-mobile-res",function(e){
        e.stopImmediatePropagation();
        __current_col_edit.attr("data-mobile",$(this).val());
        
    });
    $("body").on("propertychange change keyup paste input",".ws-tablet-res",function(e){
        e.stopImmediatePropagation();
        __current_col_edit.attr("data-tablet",$(this).val());
        
    });
    
    $("body").on("change",".ws-picker",function(){
        
        var metaCss = __current_col_edit.attr("data-meta-css");
        console.log(__current_col_edit);
        if(metaCss !="" && typeof(metaCss) != "undefined"){
            var metaCss1 = JSON.parse(metaCss);
        }else{
            var metaCss1={};
        }
        metaCss1["border-color"] =  $(this).val();  
        console.log(metaCss1);
        if(settings.version == "inline"){
            __current_col_edit.css("border-color",$(this).val());
        }
        
        /*
        for (let index = 0; index < 4; index++) {

            var vb = "";
            if(typeof(metaCss1) != "undefined" ){
                if(typeof(metaCss1[__bordertype["ws_b_"+index]]) != "undefined"){
                    
                    var svb = (metaCss1[__bordertype["ws_b_"+index]]).split(" ");
                    
                    if(settings.version == "inline"){
                        if(typeof(svb[1]) != "undefined" && svb.length >= 3){
                            vb =  svb[0] + " " + svb[1] +" "+$(this).val();
                        }else{""
                            vb =  svb[0]+" "+$(".ws-border-type").val()+" "+ $(this).val();
                        }
                        console.log(vb);
                        metaCss1[__bordertype["ws_b_"+index]] = vb;
                        __current_col_edit.css(__bordertype["ws_b_"+index],vb);
                    }
                }
            }
        }*/
        __current_col_edit.attr("data-meta-css",JSON.stringify(metaCss1));
        
    });
    $("body").on("change",".ws-picker-bg",function(){
        var metaCss = __current_col_edit.attr("data-meta-css");
        if(settings.version == "inline"){
            __current_col_edit.css("background",$(this).val());
        }
        if(metaCss !="" && typeof(metaCss) != "undefined"){
            var metaCss1 = JSON.parse(metaCss);
        }else{
            var metaCss1={};
        }
        if ($("#isbackground").is(":checked")) {
            metaCss1["background"] = "none";
        }else{
            metaCss1["background"] = $(this).val();
        }

        __current_col_edit.attr("data-meta-css",JSON.stringify(metaCss1));    
        
    });
    $("body").on("change",".ws-picker-bgcheck",function(){
        var metaCss = __current_col_edit.attr("data-meta-css");
        if(metaCss !="" && typeof(metaCss) != "undefined"){
            var metaCss1 = JSON.parse(metaCss);
        }else{
            var metaCss1={};
        }
        if ($(this).is(":checked")) {
            metaCss1["background"] = "none";
        }
        if(settings.version == "inline"){
            __current_col_edit.css("background",'none');
        }
        __current_col_edit.attr("data-meta-css",JSON.stringify(metaCss1));    
        
    });
    $("body").on("change",".ws-picker-text",function(){
        var metaCss = __current_col_edit.attr("data-meta-css");
        console.log(__current_col_edit);
        if(metaCss !="" && typeof(metaCss) != "undefined"){
            var metaCss1 = JSON.parse(metaCss);
        }else{
            var metaCss1={};
        }
        metaCss1["color"] = $(this).val();
        
        if(settings.version == "inline"){
            __current_col_edit.css("color",$(this).val());
        }
        __current_col_edit.attr("data-meta-css",JSON.stringify(metaCss1));    
        
    });
    $("body").on("propertychange change keyup paste input",".ws-bg-image",function(){
        var metaCss = __current_col_edit.attr("data-meta-css");
        console.log(__current_col_edit);
        if(metaCss !="" && typeof(metaCss) != "undefined"){
            var metaCss1 = JSON.parse(metaCss);
        }else{
            var metaCss1={};
        }
        if($(this).val().indexOf("url")){
            metaCss1["background-image"] = "url("+$(this).val()+")";
        }else{
            metaCss1["background-image"] = $(this).val();
        }
        
        if(settings.version == "inline"){
            __current_col_edit.css(metaCss1);
        }
        __current_col_edit.attr("data-meta-css",JSON.stringify(metaCss1));    
        
    });
    
    $("body").on("propertychange change keyup paste input",".ws_animation_type",function(e){
        e.stopImmediatePropagation();
        if($(this).val() == "none"){
            __current_col_edit.removeAttr("data-aos");
        }else{
            __current_col_edit.attr("data-aos",$(this).val());
        }
    });

    $("body").on("propertychange change keyup paste input",".ws_animation_easing",function(e){
        e.stopImmediatePropagation();
        if($(this).val() == "none"){
            __current_col_edit.removeAttr("data-aos-easing");
        }else{
            __current_col_edit.attr("data-aos-easing",$(this).val());
        }
    });


    $("body").on("propertychange change keyup paste input",".ws_animation_anchor",function(e){
        e.stopImmediatePropagation();
        if($(this).val() == "none"){
            __current_col_edit.removeAttr("data-aos-anchor-placement");
        }else{
            __current_col_edit.attr("data-aos-anchor-placement",$(this).val());
        }
    });
    $("body").on("propertychange change keyup paste input",".animationSetting",function(e){
        e.stopImmediatePropagation();
        let type = $(this).attr("data-type");
        if($(this).val() == ""){
            __current_col_edit.removeAttr(""+type);
        }else{
            __current_col_edit.attr(""+type,$(this).val());
        }
    });

    

    $("body").on("propertychange change keyup paste input",".ws-video-url",function(){
        //render video here
        __current_col_edit.attr("data-url",$(this).val());
        __current_col_edit.find(".icon").show();
        if(settings.version == "inline"){
            if($(this).val() ==""){
                __current_col_edit.append('<div class="icon"><span class="insert_video"></span></div>');
            }else{
                var vLink = __current_col_edit.attr('data-url');
                if(vLink.indexOf("youtube") != -1){
                    var vlink = vLink.replace("watch?v=","embed/");
                }
                if(vLink.indexOf("vimeo") != -1){
                    var vlink = vLink.replace("vimeo.com","player.vimeo.com/video");
                }
                if(vLink.indexOf("dailymotion") != -1){
                    var vlink = vLink.replace("video","embed/video");
                }
                
                var ifm = $("<iframe>",{
                    width:__current_col_edit.attr('data-width'),
                    height:__current_col_edit.attr('data-height'),
                    src:vlink,
                    "frameborder":"0",
                    "allow":"accelerometer;clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
                    "allowfullscreen":"allowfullscreen"
                });
                __current_col_edit.find(".icon").hide();
                __current_col_edit.find("iframe").remove();
                __current_col_edit.append(ifm);
            }
        }
    });
    $("body").on("propertychange change keyup paste input",".ws-image-url",function(){
        
        __current_col_edit.attr("data-url",$(this).val());
        __current_col_edit.find(".icon").show();
        __current_col_edit.find("a").hide();
        if(settings.version == "inline"){
            var img = $("<img>",{
                width:__current_col_edit.attr('data-width'),
                height:__current_col_edit.attr('data-height'),
                src:__current_col_edit.attr('data-url'),
                alt:__current_col_edit.attr('data-alt'),
            });
        __current_col_edit.find(".icon").hide();
        __current_col_edit.append(img);
    
        }
    });
    $("body").on("propertychange change keyup paste input",".ws-image-link",function(){
        __current_col_edit.find(".icon").show();
        __current_col_edit.find("img").hide();
        if(settings.version == "inline"){
            var img = $("<img>",{
                width:$(this).attr('data-width'),
                height:$(this).attr('data-height'),
                src:$(this).attr('data-url'),
                alt:$(this).attr('data-alt'),
            });
            var islink = $(this).attr('data-link');
            if(islink != "" && islink !=undefined){
                var link = $("<a>",{
                    href:$(this).attr('data-link'),
                    title:$(this).attr('data-alt'),
                });
                link.append(img);
                __current_col_edit.find(".icon").hide();
                __current_col_edit.append(link);
            }else{
                __current_col_edit.find(".icon").hide();
                __current_col_edit.append(img);
            }
        } 
        __current_col_edit.attr("data-link",$(this).val());
    });
    $("body").on("propertychange change keyup paste input",".ws-image-alt",function(){
        if(settings.version == "inline"){
            __current_col_edit.find("img").attr("alt",$(this).val());
        }
        __current_col_edit.attr("data-alt",$(this).val());
    });
    $("body").on("propertychange change keyup paste input",".ws-button-link",function(){
        __current_col_edit.attr("data-link",$(this).val());
        __current_col_edit.find(".icon").show();
        __current_col_edit.find("button").hide();
        if(settings.version == "inline"){
            var btn = $("<button>",{
                width:(__current_col_edit.attr('data-width')?"":20),
                height:(__current_col_edit.attr('data-height')?"":20),
                onclick:"location.href='"+__current_col_edit.attr('data-link')+"';",
                title:__current_col_edit.attr('data-alt'),
            });
            btn.html(__current_col_edit.attr('data-alt'));
            __current_col_edit.find(".icon").hide();
            __current_col_edit.find("button").remove();//.attr("link",$(this).val());
            __current_col_edit.append(btn);
        }
    });
    $("body").on("propertychange change keyup paste input",".ws-button-title",function(){
        if(settings.version == "inline"){
            __current_col_edit.find("button").html($(this).val());
        }
        __current_col_edit.attr("data-alt",$(this).val());
    });
    $("body").on("propertychange change keyup paste input",".ws-link-text",function(){
        // if(settings.version == "inline"){
        //     __current_col_edit.find("a").attr("href",$(this).val());
        // }
        __current_col_edit.attr("data-link",$(this).val());
        __current_col_edit.find(".icon").show();
        __current_col_edit.find("a").hide();
        if(settings.version == "inline"){
            let ln = $("<a>",{
                href:"'"+__current_col_edit.attr('data-link')+"'",
                title:__current_col_edit.attr('data-alt'),
            });
            ln.html(__current_col_edit.attr('data-alt'));
            __current_col_edit.find(".icon").hide();
            __current_col_edit.find("a").remove();//.attr("link",$(this).val());
            __current_col_edit.append(ln);
        }
    });
    $("body").on("propertychange change keyup paste input",".ws-link-title",function(){
        if(settings.version == "inline"){
            __current_col_edit.find("a").html($(this).val());
        }
        __current_col_edit.attr("data-alt",$(this).val());
    });
    
    $("body").on("propertychange change keyup paste input","#ws-element-width",function(){
        __current_col_edit.attr("data-width",$(this).val());

        var metaCss = __current_col_edit.attr("data-meta-css");
        console.log(__current_col_edit);
        if(metaCss !="" && typeof(metaCss) != "undefined"){
            var metaCss1 = JSON.parse(metaCss);
        }else{
            var metaCss1={};
        }
        metaCss1["width"] = $(this).val();
        if(settings.version == "inline"){
            __current_col_edit.find("img").css(metaCss1);
            __current_col_edit.find("iframe").css(metaCss1);
            __current_col_edit.find("button").css(metaCss1);
        }
        __current_col_edit.attr("data-meta-css",JSON.stringify(metaCss1));    

    });
    $("body").on("propertychange change keyup paste input","#ws-element-height",function(){
        __current_col_edit.attr("data-height",$(this).val());
       
        var metaCss = __current_col_edit.attr("data-meta-css");
        console.log(__current_col_edit);
        if(metaCss !="" && typeof(metaCss) != "undefined"){
            var metaCss1 = JSON.parse(metaCss);
        }else{
            var metaCss1={};
        }
        metaCss1["height"] = $(this).val();
        if(settings.version == "inline"){
            __current_col_edit.find("img").css(metaCss1);
            __current_col_edit.find("iframe").css(metaCss1);
            __current_col_edit.find("button").css(metaCss1);
        }
        __current_col_edit.attr("data-meta-css",JSON.stringify(metaCss1));    

    });
    $("body").on("propertychange change keyup paste input",".ws-bg-repeat",function(){
        var metaCss = __current_col_edit.attr("data-meta-css");
        console.log(__current_col_edit);
        if(metaCss !="" && typeof(metaCss) != "undefined"){
            var metaCss1 = JSON.parse(metaCss);
        }else{
            var metaCss1={};
        }
        metaCss1["background-repeat"] = $(this).val();
        if(settings.version == "inline"){
            __current_col_edit.css(metaCss1);
        }
        __current_col_edit.attr("data-meta-css",JSON.stringify(metaCss1));    

    });
    $("body").on("propertychange change keyup paste input",".addCss",function(){
        __current_col_edit.attr("data-add-css",$(this).val());
        if(settings.version == "inline"){
            __current_col_edit.addClass($(this).val());
        }
    });

    savebtn.on("click",function(els){
        var allCss = "";
        temptemplate.html($(".playgrounddiv").html());
        temptemplate.find(".rowHeaders").remove();
        temptemplate.find(".elm-action").remove();
        temptemplate.find(".ws-col-header").remove();
        //temptemplate.find(".rowData").addClass("container");
        temptemplate.find(".ws-element-wrapper").addClass("row");
        //temptemplate.find(".rowData").addClass("container");
        temptemplate.find(".rowData").removeClass("row");
        temptemplate.find(".rowData").each(function(e){
            var tt = $(this).attr("data-row-type");
            $(this).removeClass("container-fluid");
            $(this).removeClass("container");
            var acss = $(this).attr("data-add-css");
            if(typeof(acss) != "undefined"  && acss != ""){
                $(this).addClass(acss);
            }
            if(typeof(tt) == "undefined"  || tt == ""){
                    $(this).addClass("container-fluid");    
            }else{

                if(tt == "container-with-row"){
                    var rels = $("<div/>",{
                        class:"container"
                    });
                    rels.append($(this).html());
                    $(this).empty();
                    $(this).addClass("container-fluid");
                    $(this).append(rels);
                }else{
                    $(this).addClass(tt);
                }
            }

        });
        temptemplate.find(".ws-row-col").each(function(e){
            //$(this).addClass("row");
            // check mobile and tablet view
            var mobileView = $(this).attr("data-mobile");
            var tabletView = $(this).attr("data-tablet"); 
           
            
            
            var csfull = $(this).attr("data-meta-css");
            var css = "";
            if(typeof(csfull) != "undefined"){
                var css = "."+$(this).attr("id")+" {" + styleToString(JSON.parse($(this).attr("data-meta-css")))+ "} ";
            }
            var btClass="";
            for (let index = 1; index <= 12; index++) {
                var cc = "ws-col-size-"+index;
                if($(this).hasClass(cc)){
                    console.log($(this).attr("class"));
                    btClass = "col-lg-"+index;
                }else{
                    console.log("no class");
                }
            }
            if(typeof(mobileView) != "undefined" && mobileView !="select"){
                
                if(mobileView == "none"){
                    
                    btClass = btClass+" d-none d-sm-block d-md-block";
                }else{
                    btClass = btClass+" "+__coltypeMob[""+mobileView];
                }

            }
            if(typeof(tabletView) != "undefined" && tabletView !="select"){
                if(tabletView == "none"){
                    btClass = btClass+" d-none d-md-block d-lg-block";
                }else{
                    btClass = btClass+" "+__coltypTab[""+tabletView];
                }
            }

            $(this).removeClass();
            $(this).addClass(btClass);
            $(this).addClass($(this).attr("id"));
            allCss = allCss+css;
            var acss = $(this).attr("data-add-css");
            if(typeof(acss) != "undefined"  && acss != ""){
                $(this).addClass(acss);
            }
            
            $(this).removeAttr("data-add-css");
            $(this).removeAttr("data-meta-css");
        });
        // remove all default add things

        temptemplate.find(".col-action.default").remove();
        temptemplate.find(".first-column-add.default").remove();
        temptemplate.find(".first-column-add.bt").remove();
        temptemplate.find(".ws-element-wrapper").each(function(e){
            var csfull = $(this).attr("data-meta-css");
            var css = "";
            if(typeof(csfull) != "undefined"){
                var css = "."+$(this).attr("id")+" { " + styleToString(JSON.parse($(this).attr("data-meta-css")))+ " } ";
            }
            $(this).removeClass();
            var rlccss = $(this).attr("id") + " row";
            $(this).closest(".rowData").addClass(rlccss);
            $(this).closest(".rowData").removeClass("row");
            $(this).addClass("row");
            allCss = allCss+css;
            var acss = $(this).attr("data-add-css");
            if(typeof(acss) != "undefined"  && acss != ""){
                //$(this).addClass(acss);
                $(this).closest(".rowData").addClass(acss);
            }
            $(this).removeAttr("data-add-css");
            $(this).removeAttr("data-meta-css");
        });

        temptemplate.find(".paragraph-text").each(function(e){
            var csfull = $(this).attr("data-meta-css");
            var css = "";
            if(typeof(csfull) != "undefined"){
                var css = "."+$(this).attr("id")+" { " + styleToString(JSON.parse($(this).attr("data-meta-css")))+ " } ";
            }
            $(this).removeClass();
            $(this).addClass($(this).attr("id"));
            allCss = allCss+css;
            var acss = $(this).attr("data-add-css");
            if(typeof(acss) != "undefined"  && acss != ""){
                $(this).addClass(acss);
                //$(this).addClass("row");
            }
            $(this).removeAttr("data-add-css");
            $(this).removeAttr("data-meta-css");
        });

        // video extract
        temptemplate.find(".ws-video-link").each(function(e){
            var csfull = $(this).attr("data-meta-css");
            var css = "";
            
            if(typeof(csfull) != "undefined"){
                
                var ss = JSON.parse($(this).attr("data-meta-css"));
                delete ss["width"];
                delete ss["height"];
                console.log("asdasd asd");
                console.log(ss);
                var css = "."+$(this).attr("id")+" { " + styleToString(ss)+ " } ";
            }
            $(this).removeClass();
            $(this).addClass($(this).attr("id"));
            allCss = allCss+css;
            $(this).removeAttr("data-meta-css");
            var acss = $(this).attr("data-add-css");
            if(typeof(acss) != "undefined"  && acss != ""){
                $(this).addClass(acss);
            }
            $(this).removeAttr("data-add-css");
            var vLink = $(this).attr('data-url');
            if(vLink.indexOf("youtube") != -1){
                var vlink = vLink.replace("watch?v=","embed/");
            }
            if(vLink.indexOf("vimeo") != -1){
                var vlink = vLink.replace("vimeo.com","player.vimeo.com/video");
            }
            if(vLink.indexOf("dailymotion") != -1){
                var vlink = vLink.replace("video","embed/video");
            }
            
            var ifm = $("<iframe>",{
                width:$(this).attr('data-width'),
                height:$(this).attr('data-height'),
                src:vlink,
                "frameborder":"0",
                "allow":"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
                "allowfullscreen":"allowfullscreen"
            });
            $(this).empty();
            $(this).append(ifm);

        });

        // image  extract
        temptemplate.find(".ws-image-link").each(function(e){
            var csfull = $(this).attr("data-meta-css");
            var css = "";
            if(typeof(csfull) != "undefined"){
                var css = "."+$(this).attr("id")+" { " + styleToString(JSON.parse($(this).attr("data-meta-css")))+ " } ";
            }

            $(this).removeClass();
            $(this).addClass($(this).attr("id"));
            allCss = allCss+css;
            $(this).removeAttr("data-meta-css");
            var acss = $(this).attr("data-add-css");
            if(typeof(acss) != "undefined"  && acss != ""){
                $(this).addClass(acss);
            }
            $(this).removeAttr("data-add-css");
            var img = $("<image>",{
                width:$(this).attr('data-width'),
                height:$(this).attr('data-height'),
                src:$(this).attr('data-url'),
                alt:$(this).attr('data-alt'),
            });
            var islink = $(this).attr('data-link');
            if(islink != "" && islink !=undefined){
                var link = $("<a>",{
                    href:$(this).attr('data-link'),
                    title:$(this).attr('data-alt'),
                });
                link.append(img);
                $(this).empty();
                $(this).append(link);
            }else{
                $(this).empty();
                $(this).append(img);
            }
        });
        // button  extract
        temptemplate.find(".ws-button-link").each(function(e){
            var csfull = $(this).attr("data-meta-css");
            var css = "";
            if(typeof(csfull) != "undefined"){
                var css = "."+$(this).attr("id")+" { " + styleToString(JSON.parse($(this).attr("data-meta-css")))+ " } ";
            }
            $(this).removeClass();
            allCss = allCss+css;
            $(this).removeAttr("data-meta-css");
            var acss = $(this).attr("data-add-css");
            if(typeof(acss) != "undefined"  && acss != ""){
                //$(this).addClass(acss);
            }
            $(this).removeAttr("data-add-css");
            var btn = $("<button>",{
                width:$(this).attr('data-width'),
                height:$(this).attr('data-height'),
                onclick:"location.href='"+$(this).attr('data-link')+"';",
                title:$(this).attr('data-alt'),
            });
            btn.addClass(acss);
            btn.append($(this).attr('data-alt'));
            btn.addClass($(this).attr("id"));
            $(this).empty();
            $(this).append(btn);

        });
        // button  extract
        temptemplate.find(".ws-link-text").each(function(e){
            var csfull = $(this).attr("data-meta-css");
            var css = "";
            if(typeof(csfull) != "undefined"){
                var css = "."+$(this).attr("id")+" { " + styleToString(JSON.parse($(this).attr("data-meta-css")))+ " } ";
            }
            $(this).removeClass();
            $(this).addClass($(this).attr("id"));
            allCss = allCss+css;
            $(this).removeAttr("data-meta-css");
            var acss = $(this).attr("data-add-css");
            if(typeof(acss) != "undefined"  && acss != ""){
                $(this).addClass(acss);
            }
            $(this).removeAttr("data-add-css");
            var link = $("<a>",{
                href:$(this).attr('data-link'),
                title:$(this).attr('data-alt'),
            });
            link.append($(this).attr('data-alt'));
            $(this).empty();
            $(this).append(link);

        });
        // remove all default icons
        temptemplate.find(".icon").remove();
        temptemplate.find(".ws-customHtml-link").each(function(e){
            $(this).find(".material-icons").remove();
            var acss = $(this).attr("data-add-css");
            if(typeof(acss) != "undefined"  && acss != ""){
                $(this).addClass(acss);
            }
            $(this).removeAttr("data-add-css");
        });
        
        // social  extract
        temptemplate.find(".ws-social-link").each(function(e){
            var csfull = $(this).attr("data-meta-css");
            var css = "";
            if(typeof(csfull) != "undefined"){
                var css = "."+$(this).attr("id")+" { " + styleToString(JSON.parse($(this).attr("data-meta-css")))+ " } ";
            }
            $(this).removeClass();
            $(this).addClass($(this).attr("id"));
            allCss = allCss+css;
            $(this).removeAttr("data-meta-css");
            var allLink = $("<div/>",{
                class:"social-link"
            });
            var acss = $(this).attr("data-add-css");
            if(typeof(acss) != "undefined"  && acss != ""){
                $(this).addClass(acss);
            }
            $(this).removeAttr("data-add-css");
            //check for FB
            var fblink = $(this).attr("data-fb");
            if(typeof(fblink) != "undefined" && fblink !=""){

                var link = $("<a>",{
                    href:fblink,
                    title:"FaceBook",
                });
                link.append('<i class="fab fa-2x fa-facebook"></i>');
                allLink.append(link);
            }
            //check for Twiiter
            var twlink = $(this).attr("data-tw");
            if(typeof(twlink) != "undefined" && twlink !=""){

                var link = $("<a>",{
                    href:twlink,
                    title:"Twiiter",
                });
                link.append('<i class="fab fa-2x fa-twitter"></i>');
                allLink.append(link);
            }
            //check for Instagram
            var insta = $(this).attr("data-insta");
            if(typeof(insta) != "undefined" && insta !=""){

                var link = $("<a>",{
                    href:insta,
                    title:"Twiiter",
                });
                link.append('<i class="fab fa-2x fa-instagram"></i>');
                allLink.append(link);
            }
            //Check for Linkedin
            var linkin = $(this).attr("data-linkin");
            if(typeof(linkin) != "undefined" && linkin !=""){

                var link = $("<a>",{
                    href:linkin,
                    title:"Linked In",
                });
                link.append('<i class="fab fa-2x fa-linkedin"></i>');
                allLink.append(link);
            }
            $(this).empty();
            $(this).append(allLink);

        }); 
        var ob=[] ; 
        ob["els"] = els;
        ob["css"] = allCss;
        settings.HTMLUpdate.call(this,ob);
    });
};
})(window.jQuery || window.Zepto, window, document);