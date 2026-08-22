/* Данные тренажёра «Омоформы» — уроки 2–24.
   Формат см. в assets/trainer.js.
   Форма дана вместе с фразой: одна и та же форма в разном окружении — разный разбор. */
window.KOINE_DATA_HOMOFORMS = {
  id: "homoforms",
  title: "Омоформы",
  lessons: "уроки 2–24",

  fields: [
    { key: "k", label: "Что это в этой фразе", cols: 1, options: [{ v: "fin", label: "личная форма глагола" }, { v: "part", label: "причастие" }, { v: "inf", label: "инфинитив" }, { v: "nom", label: "имя (сущ. или прил.)" }] },
  ],

  format: function (a, label) { return label('k', a.k); },

  items: [
    { prompt: "λύουσι(ν)", note: "οἱ ἄνθρωποι λύουσι τοὺς δούλους", answers: [{ k: "fin" }] },
    { prompt: "λύουσι(ν)", note: "τοῖς λύουσι τοὺς δούλους", answers: [{ k: "part" }] },
    { prompt: "λύεται", note: "ὁ δοῦλος λύεται ὑπὸ τοῦ κυρίου", answers: [{ k: "fin" }] },
    { prompt: "λύῃ", note: "σὺ λύῃ ὑπὸ τοῦ κυρίου", answers: [{ k: "fin" }] },
    { prompt: "ποιεῖ", note: "ὁ μαθητὴς ποιεῖ τὸ ἔργον", answers: [{ k: "fin" }] },
    { prompt: "γράφεται", note: "ὁ λόγος γράφεται ὑπὸ τοῦ ἀποστόλου", answers: [{ k: "fin" }] },
    { prompt: "ἐστίν", note: "ὁ θεὸς ἀγαθός ἐστιν", answers: [{ k: "fin" }] },
    { prompt: "ἀγαπῶσι(ν)", note: "οἱ μαθηταὶ ἀγαπῶσι τὸν κύριον", answers: [{ k: "fin" }] },
    { prompt: "λύων", note: "ὁ λύων τὸν δοῦλον βλέπει τὸν κύριον", answers: [{ k: "part" }] },
    { prompt: "λύοντα", note: "βλέπω τὸν λύοντα τὸν δοῦλον", answers: [{ k: "part" }] },
    { prompt: "λυόμενος", note: "ὁ λυόμενος ὑπὸ τοῦ κυρίου", answers: [{ k: "part" }] },
    { prompt: "πιστεύοντες", note: "οἱ πιστεύοντες ἔχουσι ζωήν", answers: [{ k: "part" }] },
    { prompt: "ἐρχόμενος", note: "ὁ ἐρχόμενος εἰς τὸν κόσμον", answers: [{ k: "part" }] },
    { prompt: "οὖσα", note: "ἡ γυνὴ οὖσα ἀγαθὴ τηρεῖ τὰς ἐντολάς", answers: [{ k: "part" }] },
    { prompt: "ζητοῦσα", note: "ἡ γυνὴ ἡ ζητοῦσα τὸν κύριον", answers: [{ k: "part" }] },
    { prompt: "λύειν", note: "βούλομαι λύειν τὸν δοῦλον", answers: [{ k: "inf" }] },
    { prompt: "λύεσθαι", note: "δύναται λύεσθαι ὑπὸ τοῦ κυρίου", answers: [{ k: "inf" }] },
    { prompt: "ποιεῖν", note: "τὸ ποιεῖν τὸ ἀγαθόν ἐστιν καλόν", answers: [{ k: "inf" }] },
    { prompt: "διδόναι", note: "δεῖ διδόναι τὸ δῶρον τῷ πατρί", answers: [{ k: "inf" }] },
    { prompt: "ἔρχεσθαι", note: "λέγει τὸν ἄνθρωπον ἔρχεσθαι", answers: [{ k: "inf" }] },
    { prompt: "εἶναι", note: "λέγει τὸν λόγον ἀγαθὸν εἶναι", answers: [{ k: "inf" }] },
    { prompt: "λαλεῖν", note: "ἔξεστι τῷ μαθητῇ λαλεῖν", answers: [{ k: "inf" }] },
    { prompt: "σαρκός", note: "τὸ ἔργον τῆς σαρκός", answers: [{ k: "nom" }] },
    { prompt: "σοφίας", note: "ὁ λόγος τῆς σοφίας", answers: [{ k: "nom" }] },
    { prompt: "ψυχάς", note: "ὁ κύριος σῴζει τὰς ψυχάς", answers: [{ k: "nom" }] },
    { prompt: "πίστεως", note: "τὸ ἔργον τῆς πίστεως", answers: [{ k: "nom" }] },
    { prompt: "λόγος", note: "ὁ λόγος ἐστὶν ἀγαθός", answers: [{ k: "nom" }] },
    { prompt: "ἀγαθοῖς", note: "τοῖς ἀγαθοῖς ἀνθρώποις", answers: [{ k: "nom" }] },
    { prompt: "γένους", note: "τὸ τέκνον τοῦ γένους", answers: [{ k: "nom" }] },
    { prompt: "καλά", note: "τὰ καλὰ ἔργα", answers: [{ k: "nom" }] },
  ]
};
