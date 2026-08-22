/* Данные тренажёра «Позиция прилагательного» — урок 7.
   Формат см. в assets/trainer.js.
   Ключ — артикль: перед прилагательным есть свой артикль → атрибутив. */
window.KOINE_DATA_POSITION = {
  id: "adjective-position",
  title: "Позиция прилагательного",
  lessons: "урок 7",

  fields: [
    { key: "p", label: "Позиция", cols: 1, options: [{ v: "attr", label: "атрибутивная" }, { v: "pred", label: "предикативная" }, { v: "subst", label: "субстантивация" }] },
  ],

  items: [
    { prompt: "ὁ ἀγαθὸς λόγος", note: "доброе слово", answers: [{ p: "attr" }] },
    { prompt: "ὁ λόγος ὁ ἀγαθός", note: "доброе слово", answers: [{ p: "attr" }] },
    { prompt: "ἡ ἀγαθὴ γραφή", note: "доброе писание", answers: [{ p: "attr" }] },
    { prompt: "ἡ γραφὴ ἡ ἀγαθή", note: "доброе писание", answers: [{ p: "attr" }] },
    { prompt: "τὸ καλὸν ἔργον", note: "прекрасное дело", answers: [{ p: "attr" }] },
    { prompt: "τὸ ἔργον τὸ καλόν", note: "прекрасное дело", answers: [{ p: "attr" }] },
    { prompt: "ὁ πιστὸς δοῦλος", note: "верный раб", answers: [{ p: "attr" }] },
    { prompt: "τὰ ἔργα τὰ καλά", note: "прекрасные дела", answers: [{ p: "attr" }] },
    { prompt: "ἡ αἰώνιος ζωή", note: "вечная жизнь", answers: [{ p: "attr" }] },
    { prompt: "ἡ ζωὴ ἡ αἰώνιος", note: "вечная жизнь", answers: [{ p: "attr" }] },
    { prompt: "ὁ ἅγιος ἄνθρωπος", note: "святой человек", answers: [{ p: "attr" }] },
    { prompt: "ὁ αὐτὸς κύριος", note: "тот же Господь", answers: [{ p: "attr" }] },
    { prompt: "ὁ πιστεύων ἄνθρωπος", note: "верующий человек", answers: [{ p: "attr" }] },
    { prompt: "ἡ γυνὴ ἡ ζητοῦσα", note: "ищущая женщина", answers: [{ p: "attr" }] },
    { prompt: "ἀγαθὸς ὁ λόγος", note: "слово — доброе", answers: [{ p: "pred" }] },
    { prompt: "ὁ λόγος ἀγαθός", note: "слово — доброе", answers: [{ p: "pred" }] },
    { prompt: "καλὸν τὸ ἔργον", note: "дело — прекрасно", answers: [{ p: "pred" }] },
    { prompt: "τὸ ἔργον καλόν", note: "дело — прекрасно", answers: [{ p: "pred" }] },
    { prompt: "πιστὸς ὁ δοῦλος", note: "раб — верен", answers: [{ p: "pred" }] },
    { prompt: "ἅγιος ὁ θεός", note: "Бог — свят", answers: [{ p: "pred" }] },
    { prompt: "μεγάλη ἡ δόξα", note: "слава — велика", answers: [{ p: "pred" }] },
    { prompt: "μέγας ὁ κύριος", note: "Господь — велик", answers: [{ p: "pred" }] },
    { prompt: "αὐτὸς ὁ κύριος", note: "сам Господь", answers: [{ p: "pred" }] },
    { prompt: "οὗτος ὁ ἄνθρωπος", note: "этот человек", answers: [{ p: "pred" }] },
    { prompt: "ὁ ἄνθρωπος οὗτος", note: "этот человек", answers: [{ p: "pred" }] },
    { prompt: "ἐκεῖνος ὁ μαθητής", note: "тот ученик", answers: [{ p: "pred" }] },
    { prompt: "ὁ ἀγαθός", note: "добрый (человек)", answers: [{ p: "subst" }] },
    { prompt: "τὸ ἀγαθόν", note: "благо", answers: [{ p: "subst" }] },
    { prompt: "τὰ κακά", note: "зло", answers: [{ p: "subst" }] },
    { prompt: "οἱ πιστοί", note: "верные", answers: [{ p: "subst" }] },
    { prompt: "οἱ ἅγιοι", note: "святые", answers: [{ p: "subst" }] },
    { prompt: "τὰ καλά", note: "прекрасное", answers: [{ p: "subst" }] },
    { prompt: "οἱ πιστεύοντες", note: "верующие", answers: [{ p: "subst" }] },
    { prompt: "ὁ ἐρχόμενος", note: "грядущий", answers: [{ p: "subst" }] },
  ]
};
