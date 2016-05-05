$(document).ready(function() {
  //change the integers below to match the height of your upper div, which I called
  //banner.  Just add a 1 to the last number.  console.log($(window).scrollTop())
  //to figure out what the scroll position is when exactly you want to fix the nav
  //bar or div or whatever.  I stuck in the console.log for you.  Just remove when
  //you know the position.
  var headerHeight = $("header.hero").outerHeight();
  var $nav = $("nav.nav");
 

  
  $(window).scroll(function () {
    console.log("scrollTop: " + $(window).scrollTop());
    console.log("headerHeight: " + headerHeight);

    if ($(window).scrollTop() > headerHeight) {
      $("body").addClass('nav-fixed-top');
      $nav.addClass('nav-fixed-top');
    } else {
      $("body").removeClass('nav-fixed-top');
      $nav.removeClass('nav-fixed-top');
    }
  });
});

