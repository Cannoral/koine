/* Движок тренажёров койне.
 *
 * Страница урока даёт разметку трёх секций и вызывает Trainer.start(); всё
 * остальное — вопросы, кружочки прогресса, проверка, навигация, итог —
 * делает движок. Данные лежат в data/ и определяют, что спрашивается.
 *
 *   Trainer.start({ data: KOINE_DATA_ARTICLES, total: 20 });
 *
 * Разметка страницы (id можно переопределить через параметр ids):
 *   <section id="intro">…описание… <button id="btnStart">Начать</button></section>
 *   <section id="quiz"   class="d-none"></section>   ← заполняет движок
 *   <section id="result" class="d-none"></section>   ← заполняет движок
 *
 * Формат данных:
 *   fields  — признаки, которые нужно определить; на каждый рисуется ряд кнопок
 *             { key, label, cols?, options: [{ v, label }] }
 *   items   — вопросы: { prompt, note?, answers: [ { <key>: <v>, … }, … ] }
 *             answers — список ВСЕХ допустимых разборов (омоформы), верным
 *             считается совпадение с любым из них по всем признакам сразу
 *   format? — функция (answer, label) → строка разбора для подсказки и итога
 *   verdict?— функция (score, total) → комментарий к результату
 */
window.Trainer = (function () {
  'use strict';

  var QUIZ_HTML =
    '<div class="dots mb-2" data-t="dots"></div>' +
    '<p class="text-center text-secondary small mb-3" data-t="counter"></p>' +
    '<div class="card shadow-sm mb-3"><div class="card-body text-center py-4">' +
      '<div class="greek quiz-prompt" data-t="prompt"></div>' +
      '<div class="text-secondary quiz-note mt-2 d-none" data-t="note"></div>' +
    '</div></div>' +
    '<div data-t="rows"></div>' +
    '<div class="mb-3" data-t="feedback"></div>' +
    '<div class="d-flex gap-2">' +
      '<button class="btn btn-outline-secondary flex-fill" data-t="prev" type="button">← Назад</button>' +
      '<button class="btn btn-outline-secondary flex-fill" data-t="next" type="button">Далее →</button>' +
    '</div>' +
    '<button class="btn btn-link btn-sm w-100 mt-2 d-none" data-t="finish" type="button">Завершить и посмотреть результат</button>';

  var RESULT_HTML =
    '<div class="card shadow-sm mb-3"><div class="card-body text-center py-4">' +
      '<div class="display-4 fw-bold" data-t="score"></div>' +
      '<p class="text-secondary mb-0" data-t="verdict"></p>' +
    '</div></div>' +
    '<div class="mb-3" data-t="mistakes"></div>' +
    '<div class="d-grid gap-2">' +
      '<button class="btn btn-primary btn-lg" data-t="again" type="button">Пройти ещё раз</button>' +
      '<a class="btn btn-outline-secondary" data-t="home">На главную</a>' +
    '</div>';

  function start(cfg) {
    var data = cfg.data;
    var total = cfg.total || 20;
    var ids = cfg.ids || {};
    var home = cfg.home || '../index.html';

    var intro = document.getElementById(ids.intro || 'intro');
    var quiz = document.getElementById(ids.quiz || 'quiz');
    var result = document.getElementById(ids.result || 'result');
    var startBtn = document.getElementById(ids.start || 'btnStart');

    quiz.innerHTML = QUIZ_HTML;
    result.innerHTML = RESULT_HTML;

    var q = function (root, name) { return root.querySelector('[data-t="' + name + '"]'); };
    var ui = {
      dots: q(quiz, 'dots'), counter: q(quiz, 'counter'), prompt: q(quiz, 'prompt'),
      note: q(quiz, 'note'), rows: q(quiz, 'rows'), feedback: q(quiz, 'feedback'),
      prev: q(quiz, 'prev'), next: q(quiz, 'next'), finish: q(quiz, 'finish'),
      score: q(result, 'score'), verdict: q(result, 'verdict'),
      mistakes: q(result, 'mistakes'), again: q(result, 'again'), home: q(result, 'home')
    };
    ui.home.href = home;

    var questions = [], answers = [], cur = 0, timer = null;

    // ---------- разбор и проверка ----------

    function label(key, value) {
      var f = data.fields.find(function (x) { return x.key === key; });
      var o = f && f.options.find(function (x) { return x.v === value; });
      return o ? o.label : '';
    }

    function text(ans) {
      if (data.format) return data.format(ans, label);
      return data.fields.map(function (f) { return label(f.key, ans[f.key]); })
                        .filter(Boolean).join(', ');
    }

    function complete(a) {
      return data.fields.every(function (f) { return a[f.key]; });
    }

    function correct(i) {
      var a = answers[i];
      if (!complete(a)) return null;
      return questions[i].answers.some(function (p) {
        return data.fields.every(function (f) { return p[f.key] === a[f.key]; });
      });
    }

    // ---------- построение ----------

    // Тасуем колоду и берём подряд: пока хватает карточек, вопросы не
    // повторяются, а набор каждый раз новый. Малую колоду проходим по кругу,
    // каждый раз перетасовывая заново.
    function shuffled() {
      var a = data.items.slice();
      for (var i = a.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = a[i]; a[i] = a[j]; a[j] = t;
      }
      return a;
    }

    function build() {
      questions = [];
      var pool = [];
      while (questions.length < total) {
        if (!pool.length) pool = shuffled();
        questions.push(pool.pop());
      }
      answers = questions.map(function () { return {}; });
      cur = 0;
      buildRows();
      buildDots();
    }

    function buildRows() {
      ui.rows.innerHTML = '';
      data.fields.forEach(function (f) {
        var wrap = document.createElement('div');
        wrap.className = 'mb-3';
        var cap = document.createElement('div');
        cap.className = 'choice-label text-secondary mb-1';
        cap.textContent = f.label;
        var row = document.createElement('div');
        row.className = 'choice-row c' + (f.cols || f.options.length);
        f.options.forEach(function (o) {
          var b = document.createElement('button');
          b.type = 'button';
          b.className = 'btn btn-outline-secondary choice';
          b.textContent = o.label;
          b.dataset.key = f.key;
          b.dataset.value = o.v;
          b.addEventListener('click', function () { choose(f.key, o.v); });
          row.appendChild(b);
        });
        wrap.appendChild(cap);
        wrap.appendChild(row);
        ui.rows.appendChild(wrap);
      });
    }

    function buildDots() {
      ui.dots.innerHTML = '';
      for (var i = 0; i < total; i++) {
        (function (n) {
          var d = document.createElement('button');
          d.type = 'button';
          d.className = 'dot';
          d.title = 'Вопрос ' + (n + 1);
          d.setAttribute('aria-label', 'Вопрос ' + (n + 1));
          d.addEventListener('click', function () { goto(n); });
          ui.dots.appendChild(d);
        })(i);
      }
    }

    // ---------- отрисовка ----------

    function renderDots() {
      Array.prototype.forEach.call(ui.dots.children, function (d, i) {
        var ok = correct(i);
        d.className = 'dot' + (ok === true ? ' ok' : ok === false ? ' bad' : '') + (i === cur ? ' now' : '');
      });
    }

    function render() {
      clearTimeout(timer);
      var item = questions[cur], a = answers[cur];

      ui.prompt.textContent = item.prompt;
      ui.note.textContent = item.note || '';
      ui.note.classList.toggle('d-none', !item.note);
      ui.counter.textContent = 'Вопрос ' + (cur + 1) + ' из ' + total;

      ui.rows.querySelectorAll('.choice').forEach(function (b) {
        var on = a[b.dataset.key] === b.dataset.value;
        b.className = 'btn choice ' + (on ? 'btn-primary' : 'btn-outline-secondary');
      });

      var ok = correct(cur), all = item.answers.map(text).join(' или ');
      ui.feedback.innerHTML =
        ok === null ? '' :
        ok ? '<div class="alert alert-success py-2 mb-0"><strong>Верно.</strong> ' +
             '<span class="greek">' + item.prompt + '</span> — ' + all + '</div>'
           : '<div class="alert alert-danger py-2 mb-0"><strong>Ошибка.</strong> Вы выбрали ' + text(a) +
             '. <span class="greek">' + item.prompt + '</span> — это ' + all + '.</div>';

      ui.prev.disabled = cur === 0;
      var last = cur === total - 1;
      ui.next.textContent = last ? 'Результат' : 'Далее →';
      ui.next.className = 'btn flex-fill ' + (last ? 'btn-primary' : 'btn-outline-secondary');
      // Досрочный выход: когда все вопросы отвечены, а вы вернулись что-то исправить.
      var answered = answers.every(complete);
      ui.finish.classList.toggle('d-none', !answered || last);
      renderDots();
    }

    // ---------- взаимодействие ----------

    function choose(key, value) {
      var was = complete(answers[cur]);
      answers[cur][key] = value;
      render();
      // Автопереход только когда ответ дан впервые и он верный: на ошибке
      // страница остаётся на месте, чтобы прочитать правильный разбор.
      if (!was && correct(cur) === true) {
        timer = setTimeout(function () { cur === total - 1 ? finish() : goto(cur + 1); }, 550);
      }
    }

    function goto(i) {
      clearTimeout(timer);
      cur = Math.max(0, Math.min(total - 1, i));
      render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function show(section) {
      [[intro, 'intro'], [quiz, 'quiz'], [result, 'result']].forEach(function (p) {
        p[0].classList.toggle('d-none', p[1] !== section);
      });
      window.scrollTo({ top: 0 });
    }

    function run() { build(); render(); show('quiz'); }

    function finish() {
      clearTimeout(timer);
      var score = questions.reduce(function (s, _, i) { return s + (correct(i) === true ? 1 : 0); }, 0);
      ui.score.textContent = score + ' / ' + total;
      ui.verdict.textContent = data.verdict ? data.verdict(score, total) : defaultVerdict(score, total);

      var wrong = questions.map(function (_, i) { return i; }).filter(function (i) { return correct(i) !== true; });
      ui.mistakes.innerHTML = !wrong.length ? '' :
        '<div class="card shadow-sm"><div class="card-body">' +
        '<h2 class="h6 text-uppercase text-secondary">Разбор ошибок</h2>' +
        '<ul class="list-unstyled mb-0">' + wrong.map(function (i) {
          var item = questions[i];
          var given = complete(answers[i]) ? text(answers[i]) : 'без ответа';
          return '<li class="border-top py-2"><span class="greek fs-5 me-2">' + item.prompt + '</span>' +
            '<span class="text-danger">' + given + '</span> → <span class="text-success">' +
            item.answers.map(text).join(' / ') + '</span></li>';
        }).join('') + '</ul></div></div>';

      show('result');
    }

    function defaultVerdict(score, total) {
      var r = score / total;
      return r === 1 ? 'Без единой ошибки.' :
             r >= .8 ? 'Хорошо — осталось добить трудные формы.' :
             r >= .5 ? 'Таблицу стоит повторить.' :
                       'Вернитесь к таблице и пройдите ещё раз.';
    }

    startBtn.addEventListener('click', run);
    ui.again.addEventListener('click', run);
    ui.prev.addEventListener('click', function () { goto(cur - 1); });
    ui.next.addEventListener('click', function () { cur === total - 1 ? finish() : goto(cur + 1); });
    ui.finish.addEventListener('click', finish);
  }

  return { start: start };
})();
