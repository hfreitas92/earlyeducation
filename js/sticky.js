$(document).ready(function() {
  
  var headerHeight = $("header.hero").outerHeight();
  var $nav = $("nav.nav");
 

  
  $(window).scroll(function () {
    

    if ($(window).scrollTop() > headerHeight) {
      $("body").addClass('nav-fixed-top');
      $nav.addClass('nav-fixed-top');
    } else {
      $("body").removeClass('nav-fixed-top');
      $nav.removeClass('nav-fixed-top');
    }
  });
});


// adapted from: http://codepen.io/jparkerweb/pen/ConKw //
