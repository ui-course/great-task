var $leftPanel = $('.left-panel')
  , $rightPanel = $('.right-panel');

var makeTask = _.template($('#task-template').text().trim());
var makeTaskInfo = _.template($('#task-info-template').text().trim());


var fixSizes = function () {
  $(".left-panel .panel-body").height($(window).height()-220);
  $(".time-table").scrollTop(238);
  $(".form-inline.add-task input").width( $rightPanel.width() - 93 );
};


var fixControls = function ($context) {
  $context = $context || $('body');
  $('input[type="datetime"]', $context).datetimepicker();
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
  var $input = $('#quick-add input')
    , $toolbar = $('#task-toolbar');

  $toolbar.removeClass('hidden');
  $toolbar.hide();

  $('.task-settings', $toolbar).replaceWith(makeTaskInfo({
    startTime: '',
    stopTime: '',
    text: ''
  }));
  fixControls($toolbar);

  var addQuickTask = function () {
    $('#unsorted').append(makeTask({
      text: $input.val()
    }));
    $input.val('');
    $input.trigger('input');
  };

  $input.keydown(function (event) {
    if (event.which == 13) {
      // [enter]
      addQuickTask();
    }
  });

  $input.on('input', function () {
    var showToolbar = !!$input.val().length;

    if (showToolbar) {
      $('.tags .label', $toolbar).removeClass('selected');
      $toolbar.show('fold');
    }
    else {
      $toolbar.hide('fold', 50);
    }
  });

  $('#quick-add-button').click(function (event) {
    event.preventDefault();
    addQuickTask();
  });

  $('.tags .label', $toolbar).click(function () {
    $(this).toggleClass('selected');
  });
};


var setUpEditing = function () {
  var $modal = $('#task-info-modal');

  $('.task').click(function () {
    $('.modal-title', $modal).text($(this).text());
    $('.modal-body', $modal).html(makeTaskInfo({
      startTime: '12/26/2014 20:00',
      stopTime: '01/05/2015 00:00',
      text: 'Каникулы!'
    }));

    fixControls($modal);

    $modal.modal({
      backdrop: false
    });
  });
1};


var showTipOfTheDay = function () {
  var $modal = $('#tip-of-the-day');

  $modal.on('shown.bs.modal', function () {
    $('body').keydown(function handler(event) {
      if (event.which == 13 || event.which == 27) {
        // [enter] or [esc]
        $('body').off('keydown', handler);
        $modal.modal('hide');
      }
    });
  });

  $modal.modal('show');
};


$(function () {
  fixSizes();
  fixControls();
  setUpTabs();
  setUpDragAndDrop();
  setUpQuickTaskActions();
  setUpEditing();

  $(window).resize(_.throttle(fixSizes, 100));

  showTipOfTheDay();
});
