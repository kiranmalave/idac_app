
define([
    'jquery',
    'underscore',
    'backbone',
    'text!../templates/shippingModalTemp.html',
 
], function ($, _,Backbone,shippingModalTemp ) {

    var shippingModalView = Backbone.View.extend({
        initialize: function (options) {
            this.jsonForm = {};
            var selfobj = this;
            // console.log("options",options);
            this.taxInvoice = options.taxInvoice;
            // console.log("taxInvoice",this.taxInvoice);
            // console.log('taxInvoice model : ',selfobj.taxInvoice.model);
            $(".modal-dialog.forShipping").removeClass("modal-lg");
            this.render();
        },
        events:
        {
            "click .closeModal": "closeModal",
            "click .saveModal": "saveModal",
        },

        closeModal: function () {
            $('#shippingModal').modal('toggle');
        },

        saveModal: function () {
            var selfobj = this;
            $('#shippingModal').modal('toggle');
            var address = $("#address").val();
            var zipcode = $("#zipcode").val();
            var mobile_no = $("#mobile_no").val();
            selfobj.jsonForm = {
                address: address,
                zipcode: zipcode,
                mobile_no: mobile_no
            };
            // console.log("jsonForm", selfobj.jsonForm);
            selfobj.taxInvoice.model.set({ shipping_address:JSON.stringify(selfobj.jsonForm)});
            // console.log('modal model : ',selfobj.taxInvoice.model);
            if(selfobj.jsonForm != {} && selfobj.jsonForm != ''){
                $('.shippingDetails').hide();
                $('.shipTocheckCls').hide();
                $('.shipTouncheckCls').show(); 

                $('.shipTouncheckCls .custAddress').empty().append(address); 
                $('.shipTouncheckCls .custZipcode').empty().append('Zip Code: ' + (zipcode ? zipcode : '-')); 
                $('.shipTouncheckCls .custMobileNo').empty().append('Phone No.: '+ (mobile_no ? mobile_no : '-') ); 
            }else{
                $('.shippingDetails').show();
                $('.shipTocheckCls').hide();
                $('.shipTouncheckCls').hide(); 
            }
          
        },

        initializeValidate: function () {
            var input = document.getElementById('address');
            var autocomplete = new google.maps.places.Autocomplete(input);
            autocomplete.addListener('place_changed', function () {
                var place = autocomplete.getPlace();
                // console.log("place",place);
                if (place == "") {
             
                } else {
                
                }
            });
            $(".ws-select").selectpicker('refresh');
        },

        render: function () {
            var selfobj = this;
            var template = _.template(shippingModalTemp);
            if(selfobj.taxInvoice.model && selfobj.taxInvoice.model.attributes.shipping_address){
                var shippingAddress = JSON.parse(selfobj.taxInvoice.model.attributes.shipping_address);
            }
            this.$el.html(template({
                model: {
                    address: shippingAddress ? shippingAddress.address : "",
                    zipcode: shippingAddress ? shippingAddress.zipcode : "",
                    mobile_no: shippingAddress ? shippingAddress.mobile_no : "",
                }
            }));
            $('#shippingMedia').empty();
            $("#shippingMedia").append(this.$el);
            setToolTip();
            $(".profile-loader").hide();
            this.initializeValidate();

            return this;
        }
    });

    return shippingModalView;

});
