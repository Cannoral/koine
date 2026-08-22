/* Данные тренажёра «Артикль» — уроки 2, 5–6.
   Формат см. в assets/trainer.js.
   Отдаётся глобальной переменной, а не JSON'ом: страницы открываются с диска
   (file://), где fetch() блокируется CORS, а <script src> работает всегда. */
window.KOINE_DATA_ARTICLES = {
  id: 'article',
  title: 'Артикль',
  lessons: 'уроки 2, 5–6',

  // Признаки, которые нужно определить. Латиница для падежа и числа,
  // русский для рода — как в курсе.
  fields: [
    { key: 'c', label: 'Падеж', cols: 4, options: [
      { v: 'N', label: 'Nom.' }, { v: 'G', label: 'Gen.' },
      { v: 'D', label: 'Dat.' }, { v: 'A', label: 'Acc.' }
    ] },
    { key: 'g', label: 'Род', cols: 3, options: [
      { v: 'm', label: 'м.р.' }, { v: 'f', label: 'ж.р.' }, { v: 'n', label: 'ср.р.' }
    ] },
    { key: 'n', label: 'Число', cols: 2, options: [
      { v: 'sg', label: 'sing.' }, { v: 'pl', label: 'pl.' }
    ] }
  ],

  // «Gen. sing., м.р.» — падеж и число вместе, род через запятую.
  format: function (a, label) {
    return label('c', a.c) + ' ' + label('n', a.n) + ', ' + label('g', a.g);
  },

  verdict: function (score, total) {
    var r = score / total;
    return r === 1 ? 'Без единой ошибки.' :
           r >= .8 ? 'Хорошо — осталось добить омоформы.' :
           r >= .5 ? 'Таблицу артикля стоит повторить.' :
                     'Вернитесь к таблице артикля и пройдите ещё раз.';
  },

  // Одна форма — все её допустимые разборы (омоформы засчитываются любым из них).
  items: [
    { prompt: 'ὁ',    answers: [{ c: 'N', g: 'm', n: 'sg' }] },
    { prompt: 'ἡ',    answers: [{ c: 'N', g: 'f', n: 'sg' }] },
    { prompt: 'τό',   answers: [{ c: 'N', g: 'n', n: 'sg' }, { c: 'A', g: 'n', n: 'sg' }] },
    { prompt: 'τοῦ',  answers: [{ c: 'G', g: 'm', n: 'sg' }, { c: 'G', g: 'n', n: 'sg' }] },
    { prompt: 'τῆς',  answers: [{ c: 'G', g: 'f', n: 'sg' }] },
    { prompt: 'τῷ',   answers: [{ c: 'D', g: 'm', n: 'sg' }, { c: 'D', g: 'n', n: 'sg' }] },
    { prompt: 'τῇ',   answers: [{ c: 'D', g: 'f', n: 'sg' }] },
    { prompt: 'τόν',  answers: [{ c: 'A', g: 'm', n: 'sg' }] },
    { prompt: 'τήν',  answers: [{ c: 'A', g: 'f', n: 'sg' }] },
    { prompt: 'οἱ',   answers: [{ c: 'N', g: 'm', n: 'pl' }] },
    { prompt: 'αἱ',   answers: [{ c: 'N', g: 'f', n: 'pl' }] },
    { prompt: 'τά',   answers: [{ c: 'N', g: 'n', n: 'pl' }, { c: 'A', g: 'n', n: 'pl' }] },
    { prompt: 'τῶν',  answers: [{ c: 'G', g: 'm', n: 'pl' }, { c: 'G', g: 'f', n: 'pl' }, { c: 'G', g: 'n', n: 'pl' }] },
    { prompt: 'τοῖς', answers: [{ c: 'D', g: 'm', n: 'pl' }, { c: 'D', g: 'n', n: 'pl' }] },
    { prompt: 'ταῖς', answers: [{ c: 'D', g: 'f', n: 'pl' }] },
    { prompt: 'τούς', answers: [{ c: 'A', g: 'm', n: 'pl' }] },
    { prompt: 'τάς',  answers: [{ c: 'A', g: 'f', n: 'pl' }] }
  ]
};
