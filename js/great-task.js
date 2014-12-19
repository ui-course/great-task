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
    text: 'Поговорить с Владимиром'
  },
  {
    text: 'Купить подарок на НГ',
    tags: [tags.urgent]
  },
  {
    text: 'Написать черновик эссе'
  },
  {
    text: 'Доделать что-то очень важное',
    tags: [tags.job, tags.urgent]
  },
  {
    text: 'Прогулка с собакой'
  },
  {
    text: 'Клуб «Охотник», вечерний покер',
    tags: [tags.friends]
  },
  {
    text: 'Получить результаты'
  },
  {
    text: 'Вывести расчётную формулу',
    tags: [tags.study]
  },
  {
    text: 'Написать программу',
    tags: [tags.study]
  },
  {
    text: 'Подготовить доклад к конференции'
  }
];


var renderTask = function (task) {
  return taskTemplate(task);
};


var renderTaskInfo = function (task) {
  return taskInfoTemplate(task);
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
      $('.list-group', this).append(renderTask({
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

  $('.task-settings', $toolbar).replaceWith(renderTaskInfo({
    id: guid(),
    startTime: '',
    stopTime: '',
    text: ''
  }));
  fixControls($toolbar);

  var addQuickTask = function () {
    var activeTags = $('.tags .label.selected', $toolbar).map(function () {
      return tags[$(this).data('tag')];
    });

    var task = {
      text: $input.val(),
      tags: activeTags
    };

    var taskid = tasks.push(task) - 1;

    $('#unsorted').append(renderTask(_.extend({ taskid: taskid }, task)));

    // Clear input.
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
    $('.modal-body', $modal).html(renderTaskInfo({
      id: guid(),
      startTime: '12/26/2014 20:00',
      stopTime: '01/05/2015 00:00',
      text: 'Каникулы!'
    }));

    fixControls($modal);

    $modal.modal({
      backdrop: false
    });
  });
};


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
