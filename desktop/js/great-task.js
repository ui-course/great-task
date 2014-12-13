$(".time-table").height($(window).height()-220);
$(".time-table").scrollTop(238);
$(".form-inline.add-task input").width( $(".right-panel").width() - 91 );

$("#navtab a:last").click(function (e) {
	$(".left-panel").css("position", "relative");
	$(".right-panel").removeClass("col-lg-offset-6 col-md-offset-6");
	$('html, body').animate({scrollTop:0}, "fast");
});

$("#navtab a:first").click(function (e) {
	$(".left-panel").css("position", "fixed");
	$(".right-panel").addClass("col-lg-offset-6 col-md-offset-6");
});