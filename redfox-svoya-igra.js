/* RED FOX — СВОЯ ИГРА
 * Independent menu skin for the RedFox Safari task list.
 * Scope: /play/safari only. Does not modify task pages or game logic.
 */
(function (window, document) {
  'use strict';

  var PATH = window.location && window.location.pathname || '';
  if (!/^\/play\/safari\/?$/i.test(PATH)) return;

  var ROOT_ID = 'rf-svoya-game';
  var STYLE_ID = 'rf-svoya-css';
  var ROOT_CLASS = 'rf-svoya-active';
  var CSS_URL = 'https://cdn.jsdelivr.net/gh/RedLine142/redfox-svoya-igra@86065ed0512877030c928bcae53afe2524bbe7dd/styles/main.css';
  var SUPER_URL = '/play/safari/9047';

  var CATEGORIES = [
    { name: 'Школьная программа', ids: [9010, 9011, 9012, 9013, 9014] },
    { name: 'Спорт', ids: [9015, 9016, 9017, 9018, 9019] },
    { name: 'Хобби', ids: [9020, 9021, 9022, 9023, 9024] },
    { name: 'Ночной дозор', ids: [9026, 9027, 9028, 9029, 9030] },
    { name: 'Вредные привычки', ids: [9031, 9032, 9033, 9034, 9035] },
    { name: 'Игротека', ids: [9036, 9037, 9038, 9039, 9040] },
    { name: 'Путешествия', ids: [9041, 9042, 9043, 9044, 9046] }
  ];
  var VALUES = [100, 200, 300, 400, 500];
  var ALL_IDS = CATEGORIES.reduce(function (out, category) {
    return out.concat(category.ids);
  }, []);

  var originalRows = [];
  var observer = null;
  var refreshTimer = null;
  var timerProgressTimer = null;

  function normalizedPath(value) {
    try {
      return new URL(value, window.location.origin).pathname.replace(/\/$/, '');
    } catch (e) {
      return String(value || '').split('?')[0].replace(/\/$/, '');
    }
  }

  function findTaskRow(id, container) {
    var target = '/play/safari/' + id;
    var links = container.querySelectorAll('a[href]');
    for (var i = 0; i < links.length; i++) {
      if (normalizedPath(links[i].getAttribute('href')) === target) {
        return links[i].closest('.item') || links[i].parentElement;
      }
    }
    return null;
  }

  function readProgress(row) {
    if (!row) return { percent: 0, label: 'Прогресс загружается', completed: false };

    var text = (row.innerText || row.textContent || '').replace(/\s+/g, ' ').trim();
    var count = text.match(/(?:найдено\s*)?(\d+)\s*(?:из|\/)\s*(\d+)(?:\s*\+\s*(\d+))?/i);
    var percent = NaN;

    var bar = row.querySelector('.progress-bar,[role="progressbar"],.progress > div');
    if (bar) {
      var raw = bar.style.width || bar.getAttribute('aria-valuenow');
      if (raw != null && raw !== '') {
        percent = parseFloat(String(raw).replace('%', ''));
        if (isFinite(percent) && percent <= 1 && bar.getAttribute('aria-valuemax')) {
          var max = parseFloat(bar.getAttribute('aria-valuemax'));
          if (max > 1) percent = percent / max * 100;
        }
      }
    }

    var label = 'Прогресс не указан';
    if (count) {
      var found = parseInt(count[1], 10);
      var total = parseInt(count[2], 10) + (parseInt(count[3] || '0', 10) || 0);
      if (total > 0) {
        var countPercent = found / total * 100;
        percent = isFinite(percent) ? Math.max(percent, countPercent) : countPercent;
        label = 'Найдено ' + found + ' из ' + total;
      }
    }

    if (!isFinite(percent)) percent = 0;
    percent = Math.max(0, Math.min(100, percent));
    if (label === 'Прогресс не указан' && percent > 0) label = 'Выполнено ' + Math.round(percent) + '%';

    return {
      percent: percent,
      label: label,
      completed: percent >= 99.99
    };
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function buildBoard(container) {
    var heading = container.querySelector('h1');
    if (!heading || !heading.parentNode) return false;

    var foundCount = 0;
    var rowsById = {};
    var nativeSuperRow = findTaskRow(9047, container);
    ALL_IDS.forEach(function (id) {
      var row = findTaskRow(id, container);
      if (row) {
        rowsById[id] = row;
        foundCount++;
      }
    });

    // Do not replace the native list unless the majority of configured tasks
    // are present. This protects against partial or still-loading task lists.
    if (foundCount < 25) return false;

    var board = el('section', 'rf-svoya-board');
    board.id = ROOT_ID;
    board.setAttribute('aria-label', 'Игровое табло «Своя игра»');

    var top = el('div', 'rf-svoya-heading');
    var eyebrow = el('div', 'rf-svoya-eyebrow', 'ИНТЕЛЛЕКТУАЛЬНОЕ ШОУ');
    var title = el('div', 'rf-svoya-title', 'СВОЯ ИГРА');
    var subtitle = el('div', 'rf-svoya-subtitle', 'Выберите категорию и стоимость вопроса');
    top.appendChild(eyebrow);
    top.appendChild(title);
    top.appendChild(subtitle);
    board.appendChild(top);

    var gridWrap = el('div', 'rf-svoya-grid-wrap');
    var grid = el('div', 'rf-svoya-grid');
    grid.setAttribute('role', 'group');
    grid.setAttribute('aria-label', 'Табло вопросов');

    // Corner cell gives the grid a clear visual starting point.
    var corner = el('div', 'rf-svoya-corner', 'ТЕМА');
    grid.appendChild(corner);

    VALUES.forEach(function (value) {
      grid.appendChild(el('div', 'rf-svoya-value-head', String(value)));
    });

    CATEGORIES.forEach(function (category) {
      var categoryCell = el('div', 'rf-svoya-category', category.name);
      grid.appendChild(categoryCell);

      category.ids.forEach(function (id, index) {
        var href = '/play/safari/' + id;
        var row = rowsById[id] || null;
        var progress = readProgress(row);
        var cell = el('a', 'rf-svoya-cell' + (progress.completed ? ' is-complete' : ''));
        cell.href = href;
        cell.dataset.taskId = String(id);
        cell.dataset.percent = String(progress.percent);
        cell.setAttribute('aria-label', category.name + ', ' + VALUES[index] + ' очков. ' + progress.label);
        cell.title = category.name + ' · ' + VALUES[index] + ' · ' + progress.label;

        var amount = el('span', 'rf-svoya-cell-value', String(VALUES[index]));
        var state = el('span', 'rf-svoya-cell-state', progress.completed ? 'ВОПРОС ЗАКРЫТ' : progress.percent > 0 ? Math.round(progress.percent) + '%' : 'ВЫБРАТЬ');
        var meter = el('span', 'rf-svoya-cell-meter');
        var fill = el('span', 'rf-svoya-cell-fill');
        fill.style.width = progress.percent + '%';
        meter.appendChild(fill);
        cell.appendChild(amount);
        cell.appendChild(state);
        cell.appendChild(meter);

        if (progress.completed) {
          cell.setAttribute('aria-disabled', 'true');
          cell.classList.add('is-complete');
        }
        grid.appendChild(cell);
      });
    });

    gridWrap.appendChild(grid);
    board.appendChild(gridWrap);

    var note = el('div', 'rf-svoya-board-note', 'Чем выше стоимость вопроса, тем сложнее испытание');
    board.appendChild(note);

    var superWrap = el('div', 'rf-svoya-super-wrap');
    var superLink = el('a', 'rf-svoya-super', 'СУПЕРИГРА');
    superLink.href = SUPER_URL;
    superLink.appendChild(el('span', 'rf-svoya-super-caption', 'ФИНАЛЬНОЕ ИСПЫТАНИЕ'));
    superWrap.appendChild(superLink);
    board.appendChild(superWrap);

    heading.parentNode.insertBefore(board, heading.nextSibling);

    // Hide the old task cards only after the replacement board exists.
    originalRows = [];
    ALL_IDS.forEach(function (id) {
      if (rowsById[id] && originalRows.indexOf(rowsById[id]) === -1) {
        originalRows.push(rowsById[id]);
      }
    });
    if (nativeSuperRow && originalRows.indexOf(nativeSuperRow) === -1) {
      originalRows.push(nativeSuperRow);
    }
    originalRows.forEach(function (row) {
      row.classList.add('rf-svoya-native-hidden');
    });

    document.documentElement.classList.add(ROOT_CLASS);
    document.body.classList.add(ROOT_CLASS);
    return true;
  }

  function refreshBoard(container) {
    var board = document.getElementById(ROOT_ID);
    if (!board) return;
    ALL_IDS.forEach(function (id) {
      var cell = board.querySelector('[data-task-id="' + id + '"]');
      var row = findTaskRow(id, container);
      if (!cell || !row) return;
      var progress = readProgress(row);
      cell.dataset.percent = String(progress.percent);
      cell.title = cell.querySelector('.rf-svoya-cell-value').textContent + ' · ' + progress.label;
      cell.setAttribute('aria-label', cell.title);
      var state = cell.querySelector('.rf-svoya-cell-state');
      var fill = cell.querySelector('.rf-svoya-cell-fill');
      if (state) state.textContent = progress.completed ? 'ВОПРОС ЗАКРЫТ' : progress.percent > 0 ? Math.round(progress.percent) + '%' : 'ВЫБРАТЬ';
      if (fill) fill.style.width = progress.percent + '%';
      cell.classList.toggle('is-complete', progress.completed);
      if (progress.completed) cell.setAttribute('aria-disabled', 'true');
      else cell.removeAttribute('aria-disabled');
    });
  }

  function initTimerProgress() {
    var timeBox = document.querySelector('.time');
    var timeLeftNode = document.getElementById('time_left');
    if (!timeBox || !timeLeftNode || timeBox.querySelector('.rf-svoya-time-progress')) return;

    // RedFox exposes both counters as global variables in its inline timer script.
    // Their sum is the actual configured game duration for this session.
    var initialSpent = Number(window.time_spent);
    var initialLeft = Number(window.time_left);
    var totalDuration = initialSpent + initialLeft;
    if (!isFinite(totalDuration) || totalDuration <= 0) return;

    var progress = el('div', 'rf-svoya-time-progress');
    progress.setAttribute('role', 'group');
    progress.setAttribute('aria-label', 'Оставшееся время игры');

    var meta = el('div', 'rf-svoya-time-progress-meta');
    meta.appendChild(el('span', '', 'ОСТАЛОСЬ ВРЕМЕНИ'));
    var percent = el('span', 'rf-svoya-time-progress-percent', '100%');
    meta.appendChild(percent);

    var track = el('div', 'rf-svoya-time-progress-track');
    track.setAttribute('role', 'progressbar');
    track.setAttribute('aria-label', 'Доля оставшегося игрового времени');
    track.setAttribute('aria-valuemin', '0');
    track.setAttribute('aria-valuemax', '100');
    var fill = el('span', 'rf-svoya-time-progress-fill');
    track.appendChild(fill);

    progress.appendChild(meta);
    progress.appendChild(track);
    timeBox.appendChild(progress);

    function updateProgress() {
      var remaining = Number(window.time_left);
      if (!isFinite(remaining)) return;

      var value = Math.max(0, Math.min(100, remaining / totalDuration * 100));
      fill.style.width = value + '%';
      percent.textContent = value.toFixed(1).replace('.', ',') + '%';
      track.setAttribute('aria-valuenow', String(Math.round(value * 10) / 10));

      progress.classList.toggle('is-warning', value <= 25 && value > 10);
      progress.classList.toggle('is-critical', value <= 10);
    }

    updateProgress();
    timerProgressTimer = window.setInterval(updateProgress, 500);
  }

  function restoreOriginal() {
    originalRows.forEach(function (row) {
      row.classList.remove('rf-svoya-native-hidden');
    });
    var board = document.getElementById(ROOT_ID);
    if (board) board.remove();
    var style = document.getElementById(STYLE_ID);
    if (style) style.remove();
    document.documentElement.classList.remove(ROOT_CLASS);
    if (document.body) document.body.classList.remove(ROOT_CLASS);
    if (observer) observer.disconnect();
  }

  function loadCss(done) {
    if (document.getElementById(STYLE_ID)) {
      done();
      return;
    }
    var link = document.createElement('link');
    link.id = STYLE_ID;
    link.rel = 'stylesheet';
    link.href = CSS_URL;
    link.onload = done;
    link.onerror = function () {
      if (window.console && console.error) console.error('[RED FOX] Не удалось загрузить стили «Своя игра».');
      // Keep the native RedFox task list visible if the visual layer is unavailable.
      restoreOriginal();
    };
    (document.head || document.documentElement).appendChild(link);
  }

  function init() {
    if (!document.body || !/^\/play\/safari\/?$/i.test(window.location.pathname || '')) return;
    var container = document.querySelector('.container');
    if (!container || !container.querySelector('h1')) return;

    loadCss(function () {
      if (!buildBoard(container)) {
        // Wait briefly for the task cards if RedFox populates them asynchronously.
        var attempts = 0;
        var retry = window.setInterval(function () {
          attempts++;
          if (buildBoard(container) || attempts >= 20) window.clearInterval(retry);
        }, 300);
        return;
      }

      initTimerProgress();

      if (window.MutationObserver) {
        observer = new MutationObserver(function () {
          if (refreshTimer) window.clearTimeout(refreshTimer);
          refreshTimer = window.setTimeout(function () { refreshBoard(container); }, 120);
        });
        // Observe only the original RedFox rows. Observing the whole container
        // would also observe our own board updates and create a mutation loop.
        originalRows.forEach(function (row) {
          observer.observe(row, { childList: true, subtree: true, characterData: true, attributes: true });
        });
      }
      if (window.console && console.info) console.info('[RED FOX] «Своя игра»: табло готово.');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})(window, document);
