define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var themeOptionModel = Backbone.Model.extend({
    idAttribute: "theme_option_id",
    defaults: {
      theme_option_id: 1,
      primary_color: null,
      secondary_color: null,
      user_signup: null,
      instant_signup: null,
      page_title_h1: null,
      custom_css: null,
      custom_js: null,
      body_font: {
        fontFamily: null,
        fontWeightStyle: null,
        fontSubset: null,
        color: null,
      },
      navigation_style_and_anchor: {
        fontFamily: null,
        fontWeightStyle: null,
        fontSubset: null,
      },
      heading_h1_style: {
        fontFamily: null,
        fontWeightStyle: null,
        fontSubset: null,
        color: null,
      },
      heading_h3_style: {
        fontFamily: null,
        fontWeightStyle: null,
        fontSubset: null,
        color: null,
      },
      heading_h4_style: {
        fontFamily: null,
        fontWeightStyle: null,
        fontSubset: null,
        color: null,
      },
      heading_h5_style: {
        fontFamily: null,
        fontWeightStyle: null,
        fontSubset: null,
        color: null,
      },
      heading_h6_style: {
        fontFamily: null,
        fontWeightStyle: null,
        fontSubset: null,
        color: null,
      },
      para_and_small_elm: {
        fontFamily: null,
        fontWeightStyle: null,
        fontSubset: null,
        color: null,
      },
      header_layout: null,
      fixed_header: null,
      fixed_header_in_inner_pages: null,
      header_background_color: null,
      header_background_color_inner_pages: null,
      header_text_and_border_color: null,
      header_text_layout: null,
      header_search: null,
      header_page_logo: null,
      logo_for_inner_pages: null,
      favicon: null,
      google_reCaptcha: null,
      footer_layout: null,
      select_footer_widget_layout: null,
      footer_top_area_background_color: null,
      footer_bottom_area_background_color: null,
      footer_top_text_color: null,
      footer_bottom_text_color: null,
      facebook_url: null,
      twitter_url: null,
      instagram_url: null,
      tumbler_url: null,
      youtube_url: null,
      linkdin_url: null,
      pinterest_url: null,
      vk_url: null,
      status: 'active',
    },
    urlRoot: function () {
      return APIPATH + 'themeOptionMaster/'
    },
    parse: function (response) {
      return response.data[0];
    }
  });
  return themeOptionModel;
});

