define([
  'jquery',
  'underscore',
  'backbone',
  'moment',
], function ($, _, Backbone, moment) {

  var timeMoment = Backbone.View.extend({
    displayRelativeTime: function (timestamp) {
      var time = moment(timestamp);
      var now = moment();
      var diffInSeconds = now.diff(time, 'seconds');
      var diffInMinutes = now.diff(time, 'minutes');
      var diffInHours = now.diff(time, 'hours');
      var diffInDays = now.diff(time, 'days');

      if (diffInSeconds < 60) {
        return 'just now';
      } else if (diffInMinutes < 60) {
        return diffInMinutes + ' min ago';
      } else if (diffInHours < 24) {
        return diffInHours + ' hrs ago';
      } else if (diffInDays === 1) {
        return 'Yesterday';
      } else if (diffInDays < 30) {
        return diffInDays + ' days ago';
      } else if (diffInDays < 365) {
        var monthsAgo = Math.floor(diffInDays / 30);
        return monthsAgo + (monthsAgo === 1 ? ' month ago' : ' months ago');
      } else {
        var yearsAgo = Math.floor(diffInDays / 365);
        return yearsAgo + (yearsAgo === 1 ? ' year ago' : ' years ago');
      }
    }

  });

  return timeMoment;

});
