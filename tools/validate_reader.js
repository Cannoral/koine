/* Проверка читалки: прогоняет assets/reader.js по всем 28 главам на заглушке DOM.
   Запуск: node tools/validate_reader.js */
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');

let created = [];
class N {
  constructor(tag) {
    this.tag = tag; this.children = []; this.attrs = {}; this._cls = new Set();
    this.handlers = {}; this._text = ''; this._html = ''; this.style = {};
    created.push(this);
  }
  get className() { return [...this._cls].join(' '); }
  set className(v) { this._cls = new Set(String(v).split(/\s+/).filter(Boolean)); }
  get classList() { const s = this._cls; return {
    add: (...c) => c.forEach(x => s.add(x)),
    remove: (...c) => c.forEach(x => s.delete(x)),
    contains: c => s.has(c),
    toggle: (c, f) => { (f === undefined ? !s.has(c) : f) ? s.add(c) : s.delete(c); } }; }
  get textContent() { return this._text; }
  set textContent(v) { this._text = String(v); }
  set innerHTML(h) { this.children = []; this._html = h; }
  get innerHTML() { return this._html; }
  setAttribute(k, v) { this.attrs[k] = v; }
  removeAttribute(k) { delete this.attrs[k]; }
  addEventListener(t, fn) { (this.handlers[t] = this.handlers[t] || []).push(fn); }
  click() { (this.handlers.click || []).forEach(f => f({ preventDefault() {} })); }
  appendChild(c) { this.children.push(c); return c; }
  descendants(out = []) { this.children.forEach(c => { out.push(c); c.descendants(out); }); return out; }
  querySelector(sel) { return match(this.descendants(), sel)[0] || null; }
  querySelectorAll(sel) { return match(this.descendants(), sel); }
}
function match(nodes, sel) {
  const a = sel.match(/^\[data-t="(\w+)"\]$/);
  if (a) return nodes.filter(n => n.attrs['data-t'] === a[1]);
  if (sel[0] === '.') return nodes.filter(n => n._cls.has(sel.slice(1)));
  return nodes.filter(n => n.tag === sel);          // селектор по тегу
}

let registry, store;
function freshDom(search) {
  created = []; registry = {};
  const head = new N('head');
  global.document = {
    title: '',
    head,
    getElementById: id => registry[id] || (registry[id] = new N('div')),
    createElement: t => new N(t),
    querySelectorAll: sel => match(created, sel),
    addEventListener: () => {},
  };
  // <script src> в head: подгружаем файл и дёргаем onload, как браузер
  head.appendChild = function (s) {
    const f = path.join(ROOT, 'pages', s.src);
    if (!fs.existsSync(f)) return s.onerror && s.onerror();
    new Function(fs.readFileSync(f, 'utf8')).call(global);
    s.onload();
  };
  seed();
  global.location = { search };
  global.scrollTo = () => {};
  global.confirm = () => true;
  global.localStorage = store;
  global.window = global;
}

// узлы, которые реально есть в pages/matthew*.html (заглушка HTML не парсит)
function seed() {
  const mk = (id, ...kids) => { const n = new N('div'); kids.forEach(k => n.appendChild(k)); registry[id] = n; };
  const tagged = t => { const n = new N('span'); n.setAttribute('data-t', t); return n; };
  mk('verses'); mk('btnShowAll'); mk('chapterGrid');
  mk('btnReadChapter'); mk('chapterDone'); mk('btnReset');
  const bar = new N('div'); bar.className = 'progress-bar';
  mk('progressBox', bar, tagged('doneChapters'), tagged('allChapters'),
     tagged('doneVerses'), tagged('allVerses'), tagged('chapterWord'));
  tagged('done'); tagged('count');
  mk('nav-prev', tagged('n'));
  mk('nav-next', tagged('n'));
  mk('continueBox', new N('a'), tagged('ch'));
  new N('span').setAttribute('data-t', 'ch');   // заголовок «Глава N» в шапке
  tagged('ch');
}

store = { _d: {}, getItem(k) { return k in this._d ? this._d[k] : null; }, setItem(k, v) { this._d[k] = String(v); }, removeItem(k) { delete this._d[k]; } };

// Эталон — сами файлы глав, прочитанные независимо от читалки.
// Проверяем не текст как таковой (сверять больше не с чем — исходники удалены),
// а что reader.js раскладывает данные по строкам без сдвигов и не путает колонки.
function chapterData(ch) {
  const f = path.join(ROOT, 'data', 'matthew', 'ch' + String(ch).padStart(2, '0') + '.js');
  const w = {};
  new Function('window', fs.readFileSync(f, 'utf8')).call(null, w);
  return w.KOINE_MATTHEW_CHAPTER;
}

const READER = fs.readFileSync(path.join(ROOT, 'assets', 'reader.js'), 'utf8');
const INDEX = fs.readFileSync(path.join(ROOT, 'data', 'matthew', 'index.js'), 'utf8');

let errs = [], verses = 0;
for (let ch = 1; ch <= 28; ch++) {
  freshDom('?ch=' + ch);
  new Function(INDEX).call(global);
  new Function(READER).call(global);
  const total = global.KOINE_MATTHEW_INDEX.chapters.length;
  global.Reader.read();

  const E = m => errs.push('гл. ' + ch + ': ' + m);
  const rows = registry['verses'].children;
  const exp = chapterData(ch).verses;
  const expect = global.KOINE_MATTHEW_INDEX.chapters[ch - 1];
  if (exp.length !== expect) E('в файле главы ' + exp.length + ' стихов, в оглавлении ' + expect);
  if (rows.length !== expect) E('строк ' + rows.length + ', ожидалось ' + expect);

  rows.forEach((row, i) => {
    const v = i + 1, e = exp[i] || [];
    const want = { gr: e[1], ru: e[2] };
    if (e[0] !== v) E('в файле главы на месте ' + v + '-го стоит стих ' + e[0]);
    const [left, right] = row.children;
    const no = left.children[0], body = left.children[1];
    if (no.textContent !== String(v)) E('стих ' + v + ': номер «' + no.textContent + '»');
    if (want.gr) {
      if (body.textContent !== want.gr) E('стих ' + v + ': греческий отрисован не из своей строки');
      if (!body._cls.has('greek')) E('стих ' + v + ': нет класса greek');
    } else if (!body._cls.has('verse-absent')) E('стих ' + v + ': нет пометки об отсутствии в греческом');
    if (right.children[1].textContent !== want.ru) E('стих ' + v + ': русский отрисован не из своей строки');
    // перевод спрятан → клик показывает → клик прячет
    if (right._cls.has('shown')) E('стих ' + v + ': перевод открыт до нажатия');
    right.click();
    if (!right._cls.has('shown')) E('стих ' + v + ': нажатие не открыло перевод');
    right.click();
    if (right._cls.has('shown')) E('стих ' + v + ': повторное нажатие не спрятало перевод');
    verses++;
  });

  // общий выключатель
  registry['btnShowAll'].click();
  if (rows.some(r => !r.children[1]._cls.has('shown'))) E('«показать все» открыло не всё');
  registry['btnShowAll'].click();
  if (rows.some(r => r.children[1]._cls.has('shown'))) E('«скрыть» закрыло не всё');

  // навигация
  const prev = registry['nav-prev'], next = registry['nav-next'];
  const check = (a, want, name) => {
    if (want === null) { if (!a._cls.has('invisible')) E(name + ' виден на краю'); }
    else if (a.href !== 'matthew-read.html?ch=' + want) E(name + ' ведёт на ' + a.href);
  };
  check(prev, ch > 1 ? ch - 1 : null, '«назад»');
  check(next, ch < total ? ch + 1 : null, '«вперёд»');
  if (global.document.title !== 'Мф. ' + ch + ' · чтение') E('заголовок вкладки: ' + global.document.title);
  if (store.getItem('koine-matthew-last') !== String(ch)) E('не запомнил последнюю главу');
}

// страница выбора главы
freshDom('');
new Function(INDEX).call(global);
new Function(READER).call(global);
global.Reader.index();
const tiles = registry['chapterGrid'].children;
if (tiles.length !== 28) errs.push('плитки глав: ' + tiles.length);
if (!registry['continueBox'].querySelector('a')) errs.push('в блоке «продолжить» нет ссылки');

if (errs.length) { errs.slice(0, 20).forEach(e => console.log('✗ ' + e)); console.log('ошибок: ' + errs.length); process.exit(1); }
console.log('✓ читалка: 28 глав, ' + verses + ' стихов, разбивка совпадает с data/matthew/');

/* ======================= отметки о прочтении ======================= */

const R = 'koine-matthew-read';
function boot(search) {                       // «перезагрузка страницы»: DOM новый, localStorage тот же
  freshDom(search);
  new Function(INDEX).call(global);
  new Function(READER).call(global);
  return global.Reader;
}
function openChapter(ch) { const r = boot('?ch=' + ch); r.read(); return registry['verses'].children; }
function openIndex() { const r = boot(''); r.index(); return registry['chapterGrid'].children; }
function isDone(row) { return row._cls.has('verse-done') && row.children[0].children[0]._cls.has('done'); }
function T(cond, msg) { if (!cond) errs.push('отметки: ' + msg); }

errs = [];
store._d = {};

// A. отметка отдельных стихов и её живучесть после перезагрузки
let rows = openChapter(5);
[1, 3, 7].forEach(v => rows[v - 1].children[0].children[0].click());
T(JSON.parse(store.getItem(R))['5'].join() === '1,3,7', 'в localStorage не то: ' + store.getItem(R));
rows = openChapter(5);                                   // ← перезагрузка
T([1, 3, 7].every(v => isDone(rows[v - 1])), 'после перезагрузки отметки стихов пропали');
T(!isDone(rows[1]) && !isDone(rows[4]), 'отмечены лишние стихи');
T(registry['btnReadChapter'].textContent === 'Прочитал главу', 'кнопка главы не в исходном состоянии');

// снятие отметки
rows[0].children[0].children[0].click();
T(!isDone(rows[0]), 'повторное нажатие не сняло отметку');
rows = openChapter(5);
T(!isDone(rows[0]) && isDone(rows[2]), 'снятие отметки не сохранилось');

// B. «Прочитал главу» отмечает всё и переживает перезагрузку
rows = openChapter(28);
registry['btnReadChapter'].click();
T(rows.every(isDone), '«Прочитал главу» отметило не все стихи');
T(!registry['chapterDone']._cls.has('d-none'), 'нет значка «прочитана»');
T(registry['btnReadChapter'].textContent === 'Снять отметки главы', 'кнопка не переключилась');
rows = openChapter(28);                                  // ← перезагрузка
T(rows.every(isDone), 'после перезагрузки глава перестала быть прочитанной');
T(registry['btnReadChapter'].textContent === 'Снять отметки главы', 'кнопка не помнит состояние');

// C. глава становится прочитанной, если отметить все стихи по одному
rows = openChapter(3);
rows.forEach(r => r.children[0].children[0].click());
T(!registry['chapterDone']._cls.has('d-none'), 'глава не засчиталась при отметке всех стихов вручную');
T(JSON.parse(store.getItem(R))['3'].length === 17, 'в главе 3 сохранилось не 17 стихов');

// D. страница глав помечает прочитанное
let grid = openIndex();
T(grid[27]._cls.has('chapter-tile-done'), 'глава 28 не помечена прочитанной');
T(grid[2]._cls.has('chapter-tile-done'), 'глава 3 не помечена прочитанной');
T(grid[4]._cls.has('chapter-tile-part'), 'глава 5 не помечена частично прочитанной');
T(grid[4].children[1].textContent === '2 из 48', 'счётчик главы 5: ' + grid[4].children[1].textContent);
T(grid[0]._cls.has('chapter-tile') && !grid[0]._cls.has('chapter-tile-part'), 'нетронутая глава помечена');
const doneCh = match(created, '[data-t="doneChapters"]')[0].textContent;
T(doneCh === '2', 'счётчик глав: ' + doneCh);
const marked = Object.values(JSON.parse(store.getItem(R))).reduce((n, a) => n + a.length, 0);
const wantW = Math.round(marked / 1071 * 100) + '%';
const gotW = registry['progressBox'].querySelector('.progress-bar').style.width;
T(gotW === wantW, 'полоса прогресса: ' + gotW + ', ожидалось ' + wantW + ' (' + marked + ' стихов)');

// E. «Снять отметки главы» и сброс всего
rows = openChapter(28);
registry['btnReadChapter'].click();
T(!rows.some(isDone), '«Снять отметки главы» не сработало');
grid = openIndex();
T(!grid[27]._cls.has('chapter-tile-done'), 'глава 28 осталась помеченной');
registry['btnReset'].click();
T(store.getItem(R) === null, 'сброс не очистил localStorage');
T(!openIndex()[2]._cls.has('chapter-tile-done'), 'после сброса глава 3 всё ещё прочитана');

// F. испорченные и невозможные данные не роняют читалку
[['не json', '{{{'], ['массив', '[1,2]'], ['null', 'null'], ['строка', '"нет"']].forEach(([name, raw]) => {
  store._d[R] = raw;
  try { T(openChapter(2).length === 23, 'глава не отрисовалась при значении «' + name + '»'); }
  catch (e) { errs.push('отметки: падение при значении «' + name + '»: ' + e.message); }
});
store._d[R] = JSON.stringify({ '2': [1, 99, -3, 'x'], '99': [1], 'x': [1] });   // номера вне диапазона
rows = openChapter(2);
T(isDone(rows[0]) && rows.filter(isDone).length === 1, 'мусорные номера стихов не отфильтрованы');

// G. недоступный localStorage (приватный режим) не ломает страницу
const realStore = store;
global.localStorage = { getItem() { throw new Error('denied'); }, setItem() { throw new Error('denied'); }, removeItem() { throw new Error('denied'); } };
try {
  freshDom('?ch=1'); global.localStorage = { getItem() { throw new Error('denied'); }, setItem() { throw new Error('denied'); }, removeItem() { throw new Error('denied'); } };
  new Function(INDEX).call(global); new Function(READER).call(global);
  global.Reader.read();
  T(registry['verses'].children.length === 25, 'глава не отрисовалась без localStorage');
  registry['verses'].children[0].children[0].children[0].click();
} catch (e) { errs.push('отметки: падение без localStorage: ' + e.message); }
store = realStore;

if (errs.length) { errs.forEach(e => console.log('✗ ' + e)); console.log('ошибок: ' + errs.length); process.exit(1); }
console.log('✓ отметки: сохраняются, переживают перезагрузку, переносят порчу localStorage');
