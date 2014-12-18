var $leftPanel = $('.left-panel')
  , $rightPanel = $('.right-panel');

var makeTask = _.template($('#task-template').text().trim());


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
    fixSizes();
  });

  $("#navtab a:first").click(function (e) {
	$leftPanel.css("position", "fixed");
	$rightPanel.addClass("col-lg-offset-6 col-md-offset-6");
    fixSizes();
  });
};


var setUpDragAndDrop = function () {
  $('.right-panel .task-list').sortable({
    connectWith: '.right-panel .task-list'
  });

  $('#today .task-list').sortable();

  $('#today').droppable({
    accept: '.right-panel .task',

    drop: function (event, ui) {
      $('.note', this).hide();
      $('.list-group', this).append(makeTask({
        text: ui.draggable.text()
      }));
    }
  });
};


var setUpQuickTaskActions = function () {
  var addQuickTask = function () {
    $('#unsorted').append(makeTask({
      text: $('#quick-add input').val()
    }));
  };

  $('#quick-add input').keydown(function (event) {
    if (event.which == 13) {
      // [enter]
      addQuickTask();
    }
  });

  $('#quick-add-button').click(function (event) {
    event.preventDefault();
    addQuickTask();
  });
};


var showTipOfTheDay = function () {
  $('#tip-of-the-day').modal();
};


$(function () {
  fixSizes();
  setUpTabs();
  setUpDragAndDrop();
  setUpQuickTaskActions();

  $(window).resize(_.throttle(fixSizes, 100));

  showTipOfTheDay();
});
