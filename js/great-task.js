var $leftPanel = $('.left-panel')
  , $rightPanel = $('.right-panel');


var fixSizes = function () {
  $(".left-panel .panel-body").height($(window).height()-220);
  $(".time-table").scrollTop(238);
  $(".form-inline.add-task input").width( $rightPanel.width() - 91 );
};


var setUpTabs = function () {
  $("#navtab a:last").click(function (e) {
	$leftPanel.css("position", "relative");
	$rightPanel.removeClass("col-lg-offset-6 col-md-offset-6");
	$('html, body').animate({scrollTop:0}, "fast");
  });

  $("#navtab a:first").click(function (e) {
	$leftPanel.css("position", "fixed");
	$rightPanel.addClass("col-lg-offset-6 col-md-offset-6");
  });
};


var setUpDragAndDrop = function () {
  var taskForToday = _.template($('#today .template').text().trim());

  $('.left-panel .sortable').sortable();
  $('.right-panel .sortable').sortable({
    connectWith: '.right-panel .sortable'
  });

  $('.droppable').droppable({
    accept: '.right-panel .task',

    drop: function (event, ui) {
      $('.list-group', this).append(taskForToday({
        text: ui.draggable.text()
      }));
    }
  });
};


$(function () {
  fixSizes();
  setUpTabs();
  setUpDragAndDrop();

  $(window).resize(_.throttle(fixSizes, 100));
});
