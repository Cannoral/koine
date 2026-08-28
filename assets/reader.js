/* Читалка Евангелия от Матфея.
 *
 * Две точки входа:
 *   Reader.index()  — страница выбора главы (pages/matthew.html)
 *   Reader.read()   — страница чтения      (pages/matthew-read.html?ch=N)
 *
 * Главы лежат по файлу на главу и подгружаются <script src>, а не fetch():
 * страницы открываются в том числе с диска, где fetch() режет CORS.
 *
 * Всё состояние — в localStorage, под тремя ключами:
 *   koine-matthew-last     номер последней открытой главы
 *   koine-matthew-showall  открыты ли переводы
 *   koine-matthew-read     прочитанные стихи: {"1":[1,2,3], "5":[…]}
 * Запись идёт сразу при каждом изменении, так что перезагрузка ничего не теряет.
 */
(function () {
  var LAST = 'koine-matthew-last';
  var SHOWALL = 'koine-matthew-showall';
  var READ = 'koine-matthew-read';
  var IDX = window.KOINE_MATTHEW_INDEX;

  function store(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function recall(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function forget(k) { try { localStorage.removeItem(k); } catch (e) {} }

  /* ---------- прочитанные стихи ---------- */
  /* В памяти: { номер главы: Set(номера стихов) }. На диске: тот же объект массивами. */

  function loadRead() {
    var out = {}, raw = recall(READ), o;
    if (!raw) return out;
    try { o = JSON.parse(raw); } catch (e) { return out; }   // мусор в ключе — начинаем с чистого листа
    if (!o || typeof o !== 'object' || Array.isArray(o)) return out;
    Object.keys(o).forEach(function (k) {
      var ch = parseInt(k, 10), max = IDX.chapters[ch - 1];
      if (!max || !Array.isArray(o[k])) return;
      var s = {};
      o[k].forEach(function (v) { v = parseInt(v, 10); if (v >= 1 && v <= max) s[v] = 1; });
      if (Object.keys(s).length) out[ch] = s;
    });
    return out;
  }

  var read = loadRead();

  function saveRead() {
    var o = {};
    Object.keys(read).forEach(function (ch) {
      var vs = Object.keys(read[ch]).map(Number).sort(function (a, b) { return a - b; });
      if (vs.length) o[ch] = vs;
    });
    if (Object.keys(o).length) store(READ, JSON.stringify(o)); else forget(READ);
  }

  function isRead(ch, v) { return !!(read[ch] && read[ch][v]); }
  function doneCount(ch) { return read[ch] ? Object.keys(read[ch]).length : 0; }
  function chapterDone(ch) { return doneCount(ch) >= IDX.chapters[ch - 1]; }

  function setRead(ch, v, on) {
    if (on) { (read[ch] = read[ch] || {})[v] = 1; }
    else if (read[ch]) { delete read[ch][v]; if (!Object.keys(read[ch]).length) delete read[ch]; }
    saveRead();
  }

  function setChapterRead(ch, on) {
    if (!on) delete read[ch];
    else {
      var s = read[ch] = read[ch] || {};
      for (var v = 1; v <= IDX.chapters[ch - 1]; v++) s[v] = 1;
    }
    saveRead();
  }

  function totals() {
    var chapters = 0, verses = 0, all = 0;
    IDX.chapters.forEach(function (n, i) {
      all += n; verses += doneCount(i + 1);
      if (chapterDone(i + 1)) chapters++;
    });
    return { chapters: chapters, verses: verses, allVerses: all, allChapters: IDX.chapters.length };
  }

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function readUrl(ch) { return 'matthew-read.html?ch=' + ch; }
  function plural(n, one, few, many) {
    var a = n % 100, b = n % 10;
    return a > 10 && a < 20 ? many : b === 1 ? one : b > 1 && b < 5 ? few : many;
  }

  /* ---------- страница выбора главы ---------- */

  function index() {
    var grid = document.getElementById('chapterGrid');
    var tiles = IDX.chapters.map(function (verses, i) {
      var ch = i + 1;
      var a = document.createElement('a');
      a.href = readUrl(ch);
      a.appendChild(el('span', 'chapter-no', ch));
      a.appendChild(el('span', 'chapter-verses'));
      grid.appendChild(a);
      return a;
    });

    function paint() {
      tiles.forEach(function (a, i) {
        var ch = i + 1, total = IDX.chapters[i], done = doneCount(ch), full = done >= total;
        a.className = 'chapter-tile' + (full ? ' chapter-tile-done' : done ? ' chapter-tile-part' : '');
        a.setAttribute('aria-label', 'Глава ' + ch + (full ? ', прочитана' : done ? ', прочитано ' + done + ' из ' + total : ''));
        a.children[1].textContent = full ? '✓ прочитана' : done ? done + ' из ' + total : total + ' ст.';
      });

      var t = totals();
      var box = document.getElementById('progressBox');
      if (box) {
        box.classList.toggle('d-none', !t.verses);
        setText('[data-t="doneChapters"]', t.chapters);
        setText('[data-t="allChapters"]', t.allChapters);
        setText('[data-t="doneVerses"]', t.verses);
        setText('[data-t="allVerses"]', t.allVerses);
        setText('[data-t="chapterWord"]', plural(t.chapters, 'глава', 'главы', 'глав'));
        var bar = box.querySelector('.progress-bar');
        if (bar) bar.style.width = Math.round(t.verses / t.allVerses * 100) + '%';
      }
    }
    paint();

    var last = parseInt(recall(LAST), 10);
    var cont = document.getElementById('continueBox');
    if (cont && last >= 1 && last <= IDX.chapters.length) {
      cont.querySelector('a').href = readUrl(last);
      setText('[data-t="ch"]', last);
      cont.classList.remove('d-none');
      if (tiles[last - 1]) tiles[last - 1].classList.add('chapter-tile-last');
    }

    var reset = document.getElementById('btnReset');
    if (reset) reset.addEventListener('click', function () {
      if (!confirm('Снять отметки о прочтении со всех глав?')) return;
      read = {};
      saveRead();
      paint();
    });
  }

  /* ---------- страница чтения ---------- */

  function read_() {
    var total = IDX.chapters.length;
    var ch = parseInt(new URLSearchParams(location.search).get('ch'), 10);
    if (!(ch >= 1 && ch <= total)) ch = 1;
    store(LAST, ch);

    var s = document.createElement('script');
    s.src = '../data/matthew/ch' + pad(ch) + '.js';
    s.onload = function () { render(window.KOINE_MATTHEW_CHAPTER, total); };
    s.onerror = function () {
      document.getElementById('verses').innerHTML =
        '<p class="text-danger">Не удалось загрузить главу ' + ch + '.</p>';
    };
    document.head.appendChild(s);
  }

  function render(data, total) {
    var ch = data.ch, count = data.verses.length;
    document.title = IDX.short + ' ' + ch + ' · чтение';
    setText('[data-t="ch"]', ch);

    var list = document.getElementById('verses');
    list.innerHTML = '';
    var rows = data.verses.map(function (row) {
      var r = verseRow(ch, row[0], row[1], row[2], refresh);
      list.appendChild(r.node);
      return r;
    });

    // общая отметка «прочитал главу»
    var btnCh = document.getElementById('btnReadChapter');
    btnCh.addEventListener('click', function () {
      setChapterRead(ch, !chapterDone(ch));
      refresh();
    });

    function refresh() {
      var done = doneCount(ch), full = done >= count;
      rows.forEach(function (r) { r.paint(); });
      btnCh.textContent = full ? 'Снять отметки главы' : 'Прочитал главу';
      btnCh.classList.toggle('btn-success', full);
      btnCh.classList.toggle('btn-outline-success', !full);
      setText('[data-t="done"]', done);
      setText('[data-t="count"]', count);
      var badge = document.getElementById('chapterDone');
      if (badge) badge.classList.toggle('d-none', !full);
    }
    refresh();

    // «Показать все переводы» — общий выключатель
    var all = document.getElementById('btnShowAll');
    var on = recall(SHOWALL) === '1';
    function apply(state) {
      on = state;
      store(SHOWALL, on ? '1' : '0');
      all.textContent = on ? 'Скрыть переводы' : 'Показать все переводы';
      all.classList.toggle('active', on);
      each('.verse-ru', function (cell) { setShown(cell, on); });
    }
    all.addEventListener('click', function () { apply(!on); });
    apply(on);

    nav('prev', ch > 1 ? ch - 1 : null);
    nav('next', ch < total ? ch + 1 : null);
    scrollTo(0, 0);
  }

  function verseRow(ch, n, gr, ru, onChange) {
    var row = el('div', 'verse-row');
    var left = el('div', 'verse-gr');

    // номер стиха — он же отметка «прочитано»
    var no = el('button', 'verse-no', n);
    no.setAttribute('type', 'button');
    no.setAttribute('title', 'Отметить стих прочитанным');
    no.addEventListener('click', function () {
      setRead(ch, n, !isRead(ch, n));
      onChange();
    });
    left.appendChild(no);

    if (gr) {
      left.appendChild(el('span', 'greek verse-text', gr));
    } else {
      left.appendChild(el('span', 'verse-absent',
        'Стиха нет в греческом тексте (SBLGNT) — он известен по поздним рукописям.'));
    }
    row.appendChild(left);

    var right = el('div', 'verse-ru');
    right.appendChild(el('span', 'verse-hint', 'Показать перевод'));
    right.appendChild(el('span', 'verse-trans', ru));
    right.setAttribute('role', 'button');
    right.setAttribute('tabindex', '0');
    right.addEventListener('click', function () { setShown(right, !isShown(right)); });
    right.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); right.click(); }
    });
    row.appendChild(right);

    function paint() {
      var done = isRead(ch, n);
      row.classList.toggle('verse-done', done);
      no.classList.toggle('done', done);
      no.setAttribute('aria-pressed', done ? 'true' : 'false');
      no.setAttribute('title', done ? 'Снять отметку' : 'Отметить стих прочитанным');
    }
    return { node: row, paint: paint };
  }

  function isShown(cell) { return cell.classList.contains('shown'); }
  function setShown(cell, on) {
    cell.classList.toggle('shown', on);
    cell.setAttribute('aria-label', on ? 'Скрыть перевод' : 'Показать перевод');
  }

  function nav(which, ch) {
    var a = document.getElementById('nav-' + which);
    if (!a) return;
    if (ch) {
      a.href = readUrl(ch);
      a.querySelector('[data-t="n"]').textContent = ch;
      a.classList.remove('invisible');
    } else {
      a.classList.add('invisible');   // место сохраняем, чтобы вторая стрелка не прыгала
      a.removeAttribute('href');
    }
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function each(sel, fn) { Array.prototype.forEach.call(document.querySelectorAll(sel), fn); }
  function setText(sel, v) { each(sel, function (n) { n.textContent = v; }); }

  window.Reader = { index: index, read: read_ };
})();
