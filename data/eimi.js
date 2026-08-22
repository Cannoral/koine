/* Данные тренажёра «Глагол εἰμί (быть)» — урок 4.
   Формат см. в assets/trainer.js.
   Колода маленькая — 8 форм; за 20 вопросов каждая встретится 2–3 раза. */
window.KOINE_DATA_EIMI = {
  id: "eimi",
  title: "Глагол εἰμί (быть)",
  lessons: "урок 4",

  fields: [
    { key: "p", label: "Лицо", cols: 3, options: [{ v: "1", label: "1 л." }, { v: "2", label: "2 л." }, { v: "3", label: "3 л." }] },
    { key: "n", label: "Число", cols: 2, options: [{ v: "sg", label: "ед. ч." }, { v: "pl", label: "мн. ч." }] },
  ],

  format: function (a, label) { return label('p', a.p) + ' ' + label('n', a.n); },

  items: [
    { prompt: "εἰμί", note: "я есть", answers: [{ p: "1", n: "sg" }] },
    { prompt: "εἶ", note: "ты есть", answers: [{ p: "2", n: "sg" }] },
    { prompt: "ἐστί(ν)", note: "он есть", answers: [{ p: "3", n: "sg" }] },
    { prompt: "ἐσμέν", note: "мы есть", answers: [{ p: "1", n: "pl" }] },
    { prompt: "ἐστέ", note: "вы есть", answers: [{ p: "2", n: "pl" }] },
    { prompt: "εἰσί(ν)", note: "они есть", answers: [{ p: "3", n: "pl" }] },
    { prompt: "ἔστιν", note: "ударная форма: «существует», после οὐκ / καί / εἰ", answers: [{ p: "3", n: "sg" }] },
    { prompt: "ἦν", note: "imperfectum: «был»", answers: [{ p: "3", n: "sg" }] },
  ]
};
