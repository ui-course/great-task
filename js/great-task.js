var $leftPanel = $('.left-panel')
  , $rightPanel = $('.right-panel');

var taskTemplate = _.template($('#task-template').text().trim(), null, {
  variable: 'task'
});

var taskInfoTemplate = _.template($('#task-info-template').text().trim());


var tags = {
  friends: {
    value: 'друзья',
    cssClass: 'label-success'
  },
  study: {
    value: 'учёба',
    cssClass: 'label-warning'
  },
  job: {
    value: 'работа',
    cssClass: 'label-info'
  },
  urgent: {
    value: 'срочно',
    cssClass: 'label-danger'
  }
};

var tasks = [
  {
    id: 0,
    text: 'Поговорить с Владимиром'
  },
  {
    id: 1,
    text: 'Купить подарок на НГ',
    tags: [tags.urgent]
  },
  {
    id: 2,
    text: 'Написать черновик эссе'
  },
  {
    id: 3,
    text: 'Доделать что-то очень важное',
    tags: [tags.job, tags.urgent]
  },
  {
    id: 4,
    text: 'Прогулка с собакой'
  },
  {
    id: 5,
    text: 'Клуб «Охотник», вечерний покер',
    tags: [tags.friends]
  },
  {
    id: 6,
    text: 'Получить результаты'
  },
  {
    id: 7,
    text: 'Вывести расчётную формулу',
    tags: [tags.study]
  },
  {
    id: 8,
    text: 'Написать программу',
    tags: [tags.study]
  },
  {
    id: 9,
    text: 'Подготовить доклад к конференции'
  }
];


var renderTask = function (task) {
  var $task = $(taskTemplate(task));

  $task.click(function () {
    showTaskInfo(task);
  });

  return $task;
};


var renderTaskInfo = function (task) {
  var $taskInfo = $(taskInfoTemplate(task));
  fixControls($taskInfo);
  return $taskInfo;
};


var guid = (function () {
  var id = 0;

  return function () {
    // Yeah, this is not thread-safe, lol.
    return id++;
  };
}());


var fixSizes = function () {
  $(".left-panel .panel-body").height($(window).height()-220);
  $(".time-table").scrollTop(238);
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

      var task = tasks[ui.draggable.data('taskid')];
      $('.list-group', this).append(renderTask(task));
    }
  });
};


var setUpQuickTaskActions = function () {
  var $input = $('#quick-add input')
    , $toolbar = $('#task-toolbar');

  $toolbar.removeClass('hidden');
  $toolbar.hide();

  $('.task-settings', $toolbar).replaceWith(renderTaskInfo({
    id: guid(),
    startTime: '',
    stopTime: '',
    text: ''
  }));
  fixControls($toolbar);

  var clearInput = function () {
    $input.val('');
    $input.trigger('input');
  };

  var addQuickTask = function () {
    var activeTags = $('.tags .label.selected', $toolbar).map(function () {
      return tags[$(this).data('tag')];
    });

    var task = {
      text: $input.val(),
      tags: activeTags,
      startTime: $('.task-toolbar-starttime', $toolbar).val(),
      stopTime: $('.task-toolbar-stoptime', $toolbar).val(),
      description: $('.task-toolbar-memo', $toolbar).val()
    };
    task.id = tasks.push(task) - 1;

    $('#unsorted').append(renderTask(task));
    clearInput();
  };

  $input.keydown(function (event) {
    if (event.which == 13) {
      // [enter]
      addQuickTask();
    }
  });

  $input.on('input', function () {
    var showToolbar = !!$input.val().length;
    var toolbarShown = !!$('#task-toolbar:visible').length;

    if (showToolbar == toolbarShown) {
      return;
    }

    if (showToolbar) {
      $('.tags .label', $toolbar).removeClass('selected');
      $('.task-toolbar-starttime', $toolbar).val('');
      $('.task-toolbar-stoptime', $toolbar).val('');
      $('.task-toolbar-memo', $toolbar).val('');
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

  $('#clear-input-button').click(clearInput);

  $('.tags .label', $toolbar).click(function () {
    $(this).toggleClass('selected');
  });
};


/**
 * Sets up handlers for existing tasks.
 */
var setUpExistingTasks = function () {
  $('.task').click(function () {
    var task = tasks[$(this).data('taskid')];
    showTaskInfo(task);
  });
};


/**
 * Open modal window with information about the task.
 *
 * @arg {Task} task
 */
var showTaskInfo = (function () {
  var $modal = $('#task-info-modal');
  var $okButton = $('button.ok', $modal);
  var $cancelButton = $('button.cancel', $modal);

  return function (task) {
    $('.modal-title', $modal).text(task.text);
    $('.modal-body', $modal).html(renderTaskInfo({
      id: guid(),
      startTime: task.startTime || '',
      stopTime: task.stopTime || '',
      text: task.description || ''
    }));

    var ok = function () {
      $cancelButton.off('click', cancel);

      // Assign back.
      task.startTime = $('.task-toolbar-starttime', $modal).val();
      task.stopTime = $('.task-toolbar-stoptime', $modal).val();
      task.description = $('.task-toolbar-memo', $modal).val();
    };

    var cancel = function () {
      $okButton.off('click', ok);
    };

    $($okButton, $modal).one('click', ok);
    $($cancelButton, $modal).one('click', cancel);

    $modal.modal({
      backdrop: false
    });
  };
}());


var showTipOfTheDay = function () {
  var $modal = $('#tip-of-the-day');

  $modal.one('shown.bs.modal', function () {
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
  setUpExistingTasks();

  $(window).resize(_.throttle(fixSizes, 100));

  showTipOfTheDay();
});
