/* Данные тренажёра «Предлоги» — уроки 3, 5, 23.
   Формат см. в assets/trainer.js.
   Один и тот же предлог с разными падежами значит разное — значение дано подсказкой. */
window.KOINE_DATA_PREPOSITIONS = {
  id: "prepositions",
  title: "Предлоги",
  lessons: "уроки 3, 5, 23",

  fields: [
    { key: "c", label: "Какой падеж", cols: 4, options: [{ v: "G", label: "Gen." }, { v: "D", label: "Dat." }, { v: "A", label: "Acc." }] },
  ],

  format: function (a, label) { return '+ ' + label('c', a.c); },

  items: [
    { prompt: "ἀπό", note: "от", answers: [{ c: "G" }] },
    { prompt: "ἐκ (ἐξ)", note: "из", answers: [{ c: "G" }] },
    { prompt: "ἀντί", note: "вместо, за", answers: [{ c: "G" }] },
    { prompt: "πρό", note: "перед, прежде", answers: [{ c: "G" }] },
    { prompt: "ἐν", note: "в, внутри (где?)", answers: [{ c: "D" }] },
    { prompt: "σύν", note: "с (вместе)", answers: [{ c: "D" }] },
    { prompt: "εἰς", note: "в, во (куда?)", answers: [{ c: "A" }] },
    { prompt: "ἀνά", note: "вверх по, по", answers: [{ c: "A" }] },
    { prompt: "διά", note: "через, посредством", answers: [{ c: "G" }] },
    { prompt: "διά", note: "из-за, ради", answers: [{ c: "A" }] },
    { prompt: "κατά", note: "против", answers: [{ c: "G" }] },
    { prompt: "κατά", note: "по, согласно", answers: [{ c: "A" }] },
    { prompt: "μετά", note: "с (вместе)", answers: [{ c: "G" }] },
    { prompt: "μετά", note: "после", answers: [{ c: "A" }] },
    { prompt: "περί", note: "о, относительно", answers: [{ c: "G" }] },
    { prompt: "περί", note: "вокруг, около", answers: [{ c: "A" }] },
    { prompt: "ὑπέρ", note: "за, ради", answers: [{ c: "G" }] },
    { prompt: "ὑπέρ", note: "сверх, над", answers: [{ c: "A" }] },
    { prompt: "ὑπό", note: "кем — агент при пассиве", answers: [{ c: "G" }] },
    { prompt: "ὑπό", note: "под (куда?)", answers: [{ c: "A" }] },
    { prompt: "πρός", note: "к", answers: [{ c: "A" }] },
    { prompt: "πρός", note: "у, возле (редко)", answers: [{ c: "G" }] },
    { prompt: "παρά", note: "от (кого)", answers: [{ c: "G" }] },
    { prompt: "παρά", note: "у, при (ком)", answers: [{ c: "D" }] },
    { prompt: "παρά", note: "к, мимо", answers: [{ c: "A" }] },
    { prompt: "ἐπί", note: "на, над", answers: [{ c: "G" }] },
    { prompt: "ἐπί", note: "на (где)", answers: [{ c: "D" }] },
    { prompt: "ἐπί", note: "на (направление)", answers: [{ c: "A" }] },
  ]
};
