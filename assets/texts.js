/* Тексты для разбора. Хранятся только в localStorage этого браузера:
   [{ id, body, parses: { <номер слова>: { w: слово, pos, …признаки } } }]. */
var Texts = (function () {
  var KEY = 'koine-texts';
  function all() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; }
  }
  function save(list) { localStorage.setItem(KEY, JSON.stringify(list)); }
  return {
    all: all,
    get: function (id) { return all().find(function (t) { return t.id === id; }); },
    // Новый текст, если id нет; возвращает id.
    put: function (id, body) {
      var list = all(), t = list.find(function (x) { return x.id === id; });
      if (t) t.body = body;
      else list.push(t = { id: Date.now().toString(36), body: body });
      save(list);
      return t.id;
    },
    // Разбор слова с порядковым номером i; p = null — убрать разбор.
    parse: function (id, i, p) {
      var list = all(), t = list.find(function (x) { return x.id === id; });
      t.parses = t.parses || {};
      if (p) t.parses[i] = p; else delete t.parses[i];
      save(list);
    },
    remove: function (id) { save(all().filter(function (t) { return t.id !== id; })); },
    // Заголовок — первая непустая строка текста.
    title: function (t) { return (t.body.trim().split('\n')[0] || '(пусто)').slice(0, 80); },
  };
})();
