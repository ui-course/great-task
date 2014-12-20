var $leftPanel = $('.left-panel')
  , $rightPanel = $('.right-panel');

var taskTemplate = _.template($('#task-template').text().trim(), null, {
  variable: 'task'
});

var taskInfoTemplate = _.template($('#task-info-template').text().trim());

var timetableEntryTemplate = _.template($('#timetable-entry-template').text().trim());

var timetableSuggestionEntryTemplate = _.template($('#timetable-suggestion-entry-template').text().trim());


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

var listenTask = function (task, listener) {
  task.listeners = task.listeners || [];
  task.listeners.push(listener);
};

var markDone = function (task) {
  task.done = true;
  task.listeners.forEach(Function.call.bind(Function.call));
};


var renderTask = function (task) {
  var $task = $(taskTemplate(task));

  $('.edit', $task).click(function (event) {
    showTaskInfo(task);
    event.stopPropagation();
  });

  listenTask(task, function () {
    $task.toggleClass('done');
  });

  $task.click(function () {
    markDone(task);
  });

  return $task;
};


var renderTaskInfo = function (task) {
  var $taskInfo = $(taskInfoTemplate(task));
  fixControls($taskInfo);
  return $taskInfo;
};


var renderTimetableEntry = function (task) {
  var $entry = $(timetableEntryTemplate(task));

  $entry.click(function () {
    showTaskInfo(task);
  });

  var makeLonger = function () {
    $entry.removeClass('task-size-' + task.duration);
    task.duration += 1;
    $entry.addClass('task-size-' + task.duration);
  };

  var moveUp = function () {
    // BAD BAD BAD
    $entry.parent().parent().prev().find('td').append($entry);
  };

  $('.span-up', $entry).click(function (event) {
    makeLonger();
    moveUp();
    event.stopPropagation();
  });

  $('.span-down', $entry).click(function (event) {
    makeLonger();
    event.stopPropagation();
  });

  return $entry;
};


var renderTimetableSuggestionEntry = function (task) {
  var $entry = $(timetableSuggestionEntryTemplate(task));

  task.$timetableSuggestionEntry = $entry;

  $entry.click(function () {
    showSuggestion(task);
  });

  $('.add-suggestion', $entry).click(function (event) {
    $entry.replaceWith(renderTimetableEntry(task));
    event.stopPropagation();
  });

  return $entry;
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

  $('.time-table td').droppable({
    accept: '.task',

    drop: function (event, ui) {
      var task = tasks[ui.draggable.data('taskid')];

      // Set default duration.
      task.duration = task.duration || 1;

      $(this).append(renderTimetableEntry(task));
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
    text: '',
    repeat_times: '',
    repeat_days: '',
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
      repeat_times: $('.task-toolbar-repeat_times', $toolbar).val(),
      repeat_days: $('.task-toolbar-repeat_days', $toolbar).val(),
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
  // TODO(eush77): Once it becomes clear what the the interface should look like,
  // existing tasks will be auto-generated at the start.
  $('.task').each(function () {
    var $task = $(this);
    var task = tasks[$task.data('taskid')];

    $('.edit', $task).click(function () {
      showTaskInfo(task);
      event.stopPropagation();
    });

    listenTask(task, function () {
      $task.toggleClass('done');
    });

    $task.click(function () {
      task.done = true;
      markDone(task);
    });
  });
};


/**
 * Set up existing timetable entries.
 */
var setUpTimetable = function () {
  // Child number below are hard-coded.
  // The rule is, nth-child(X+2) gets you to X o'clock.

  // Set essay task for 1 hour at 11:00.
  var essayTask = _.extend(tasks[2], { duration: 1});
  $('.time-table tr:nth-child(13) td').append(renderTimetableEntry(essayTask));

  // Set job task for 3 hours 17:00-20:00.
  var jobTask = _.extend(tasks[3], { duration: 3 });
  $('.time-table tr:nth-child(19) td').append(renderTimetableEntry(jobTask));

  // Set dog task as a suggestion at 20:00.
  var dogTask = _.extend(tasks[4], { duration: 1 });
  $('.time-table tr:nth-child(21) td').append(renderTimetableSuggestionEntry(dogTask));
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
      repeat_times: task.repeat_times || '',
      repeat_days: task.repeat_days || '',
      text: task.description || ''
    }));

    // In order to prevent the mess, each listener must be called
    // either once or zero times per modal invocation.
    // Hence we need to remove unused listeners here - so that
    // they won't clutter the things later.

    var ok = function () {
      $cancelButton.off('click', cancel);

      // Assign back.
      task.startTime = $('.task-toolbar-starttime', $modal).val();
      task.stopTime = $('.task-toolbar-stoptime', $modal).val();
      task.repeat_days = $('.task-toolbar-repeat_days', $modal).val();
      task.repeat_times = $('.task-toolbar-repeat_times', $modal).val();
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


/**
 * Show suggestion window.
 * Ask the user if he wants to add this task to
 * the timetable.
 *
 * @arg {Task} task
 */
var showSuggestion = (function () {
  var $modal = $('#suggestion-modal');
  var $okButton = $('button.ok', $modal);
  var $cancelButton = $('button.cancel', $modal);

  // TODO(eush77): Get rid of immense code duplication here.
  return function (task) {
    $('#suggestion-modal-title', $modal).text(task.text);
    $('.task-info', $modal).html(renderTaskInfo({
      id: guid(),
      startTime: task.startTime || '',
      stopTime: task.stopTime || '',
      repeat_times: task.repeat_times || '',
      repeat_days: task.repeat_days || '',
      text: task.description || ''
    }));

    // Disable all input fields.
    $('.task-info .form-control').attr('disabled', true);

    // See the comment in showTaskInfo() for clarification.

    var ok = function () {
      $cancelButton.off('click', cancel);

      task.$timetableSuggestionEntry.replaceWith(renderTimetableEntry(task));
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
  setUpTimetable();

  $(window).resize(_.throttle(fixSizes, 100));

  showTipOfTheDay();
});
