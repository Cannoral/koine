# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A **personal study workspace for Koine Greek**, in Russian, with two halves:

- **Study material** — reference tables, translation exercises, an Anki vocabulary deck. Written and corrected by hand.
- **A grammar trainer** — a static site (HTML + Bootstrap from CDN + vanilla JS) meant to be served from GitHub Pages. No build step, no package manager, nothing to install. `tools/` holds plain Python/Node scripts that regenerate the generated parts; `node tools/validate.js` is the only test.

The user is a Russian-speaking learner working through the course sequentially. All prose, grammar labels, and commentary are in Russian; Greek is polytonic UTF-8.

## Files and how they relate

| File | Role |
|---|---|
| `Курс древнегреческого языка — уроки 1-50.docx` | **Source of truth.** The full 50-lesson course, scraped from [sibwiki.org](https://sibwiki.org). Read-only input; everything else is derived from it. |
| `cheatsheet_lessons_1-24.md` | Condensed paradigm tables, **despite the filename now covers lessons 1–32**: declensions, verb endings (praesens **and aorist/future**), participles (praesens **and aorist**), infinitive, prepositions. Filename kept as-is to avoid touching the trainer tooling (`tools/mdconv.py`, `tools/gen_pages.py`) that reads it by this exact name; rename only as a deliberate follow-up. |
| `koine_vocab_lessons_1-24.tsv` | Anki import deck — 204 entries, lessons 1–23. Covers lessons 1–32's grammar too: aorist/future are new *forms* of already-listed verbs, not new lemmas. |
| `exercise_lessons_1-11.md` | Translation exercise, **already attempted and graded**. |
| `exercise_lessons_11-24.md` | Translation exercise, 108 sentences; parts α΄–ζ΄ graded, parts η΄–ι΄ (11 76–108) not yet attempted. |
| `exercise_lessons_25-32.md` | Translation exercise, 74 sentences, aorist/future/aorist-participle block, **not yet attempted**. |

Derived material covers **lessons 1–32** (present tense in all three voices, three declensions, participles, infinitive, plus aorist and future in all three voices and the aorist participle). Lessons 33–50 (perfect, pluperfect, subjunctive, optative, imperative, …) exist only in the .docx. Do not use grammar from beyond lesson 32 in exercises or the cheatsheet unless asked. The **trainer site now covers the same 1–32 range**: five decks for the aorist/future block were added on top of the original fifteen topics (see `tools/gen_aorist.py`).

`exercise_lessons_1-11.md:5` references `koine_vocab_lessons_1-11.tsv`, which does not exist — it was folded into the 1–24 deck.

The trainer site lives alongside it:

| Path | Role |
|---|---|
| `index.html` | Entry point: the 20 topics, grouped имя / глагол / служебные слова / итог. |
| `assets/trainer.js` | The engine — every trainer runs on it. Contract below. |
| `assets/app.css`, `assets/theme.js` | Shared styles and the light/dark toggle (choice kept in `localStorage`). |
| `data/*.js` | One deck per topic: what is asked and every acceptable answer. |
| `pages/*.html` | Trainer pages: description + Start, then the engine takes over. |
| `articles/*.html` | Grammar articles — the tables for a topic, generated from the cheatsheet. |
| `tools/` | Build and check scripts. Not part of the site. |
| `.nojekyll` | Tells GitHub Pages to serve files as-is. |

## The trainer site

**Every link is relative** (`../index.html`, `../articles/nouns-1.html`). GitHub Pages serves the project from `https://<user>.github.io/<repo>/`, so a path starting with `/` breaks. Never introduce one, and keep file names lowercase — Pages is case-sensitive where a local disk may not be.

**Decks are `.js`, not `.json`.** Each file assigns a global (`window.KOINE_DATA_NOUNS1 = {…}`). Pages are opened straight from disk during work, and `fetch()` over `file://` is blocked by CORS, while `<script src>` always works. The object inside is plain JSON-shaped data plus two optional functions.

### Engine contract

A trainer page supplies three sections and one call:

```html
<section id="intro">…описание… <button id="btnStart">Начать</button></section>
<section id="quiz"   class="d-none"></section>   <!-- заполняет движок -->
<section id="result" class="d-none"></section>
<script src="../data/nouns-1.js"></script>
<script src="../assets/trainer.js"></script>
<script>Trainer.start({ data: KOINE_DATA_NOUNS1, total: 20 });</script>
```

Deck shape:

```js
fields:  [ { key, label, cols, options: [{ v, label }] } ]   // ряд кнопок на каждый признак
items:   [ { prompt, note?, answers: [ { <key>: <v>, … } ] } ]
format?: (answer, label) => 'Gen. sing., м.р.'               // как печатать разбор
verdict?:(score, total) => 'комментарий к результату'
```

`answers` lists **every** acceptable parse. Homoforms are the norm, not the exception — `ἡμέρας` is Gen. sing. *and* Acc. pl., `τῶν` is Gen. pl. of any gender — and any one of them counts as correct. The generators merge identical forms automatically; do not hand-list them.

`note` is the small line under the form (a gloss, a dictionary entry, the phrase a word sits in). It must not give the answer away.

**Всегда 20 вопросов.** The engine shuffles the deck and deals from it, so a run repeats nothing until the deck runs out and each run differs. Auto-advance fires only on a first correct answer; a wrong one stays on screen with the right parse. Dots are clickable, answers can be corrected, and the score is recomputed.

### Adding a trainer

1. Decide what is *answerable from the form itself*. Gender of a noun is a property of the word, not of the ending — do not ask it. Voice in praesens mid/pass cannot be told from the form either. When the question needs context, make the item a phrase (see `adjective-position`, `infinitive`, `homoforms`).
2. Add paradigms to the matching `tools/gen_*.py`, run it, then `node tools/dump.js && python3 tools/gen_pages.py`.
3. Add the topic to the intro/article prose dict `T` in `tools/gen_pages.py` and to `TOPICS` in `index.html`.
4. `node tools/validate.js` — checks deck structure and drives a full 20-question run through the engine.

### Regenerating

```bash
python3 tools/gen_nouns.py        # data/nouns-*.js
python3 tools/gen_adj_pron.py     # data/adjectives.js, pronouns.js, adjective-position.js, eimi.js
python3 tools/gen_verbs.py        # data/verbs-*.js, participles.js, infinitive.js, prepositions.js, homoforms.js
python3 tools/gen_aorist.py       # data/aorist-*.js, future.js, irregular-verbs.js, participles-aorist.js
node    tools/dump.js             # data/*.js → tools/decks.json (метаданные для страниц)
python3 tools/gen_pages.py        # pages/ и articles/
node    tools/validate.js         # проверка всех колод
```

Articles are built from `cheatsheet_lessons_1-24.md` by `tools/mdconv.py` — the tables are never retyped, so the site cannot drift from the cheatsheet. **Edit the cheatsheet, then regenerate**; direct edits to `articles/*.html` are overwritten. `pages/article.html` and `articles/article.html` are the exception — they were written by hand before the generator existed and are not in `T`.

Regeneration is byte-for-byte reproducible: running everything on an unchanged workspace leaves no diff.

## Reading the .docx

No pandoc, no `python-docx`. Extract text with stdlib only:

```bash
python3 -c "
import zipfile, re
x = zipfile.ZipFile('Курс древнегреческого языка — уроки 1-50.docx').read('word/document.xml').decode('utf8')
print('\n'.join(l.strip() for l in re.sub(r'<[^>]+>', '\n', x).split('\n') if l.strip()))
" > "$SCRATCH/course.txt"   # then grep for '^Урок [0-9]'
```

Paragraph breaks are lost by the naive regex; that is fine for locating and quoting lesson content. Dump to the scratchpad, never into the working directory.

## Anki TSV format

`koine_vocab_lessons_1-24.tsv` is an Anki *import file*, not a spreadsheet. Its first six lines are structural and must survive any edit:

```
#separator:tab
#html:false
#notetype:Basic
#deck:Койне::Уроки 1-24
#tags column:4
#columns:Греческое слово	Перевод	Грамматика	Теги
```

Every data row has exactly **4 tab-separated fields**: lemma with principal parts (`ἀγαθός, -ή, -όν`) · Russian gloss · grammar note (declension/conjugation class, stem, government) · space-separated lesson tags (`урок01 урок05 урок08`). Tags are zero-padded to two digits. Column 1 is the Anki note key — keep it unique, and re-check for duplicates after adding entries.

## Exercise conventions

Sections are numbered with Greek letter-numerals (`Μέρος α΄`, `β΄`, … `ϛ΄`, `ζ΄`, …), each mapped to the lessons it drills. Sentences are numbered continuously across the whole file. Each exercise ends with a `## Подсказки` block (traps and disambiguation rules) and a `## Что отрабатывается` table (part → lesson → grammar focus).

**Hard invariant:** every word in an exercise must appear in `koine_vocab_lessons_1-24.tsv`. Both files state this explicitly. When writing new sentences, verify each lemma against the TSV; if a word is genuinely needed and absent, add it to the deck rather than silently using it. Exceptions are called out in `Подсказки` (e.g. `ὅτι` in the 1–11 set).

## Grading answers

`exercise_lessons_1-11.md` shows the established format — the user's answer is indented under the Greek sentence, followed by a blockquote review:

```markdown
2. Ὁ κύριος ποιεῖ τὸν οὐρανὸν καὶ τὴν γῆν.
   Господь (nom, ед) создал (3-е лицо) небо (Acc, муж) и землю (Acc, жен)
   > **Ошибки:** «создал» — прошедшее время, а `ποιεῖ` — настоящее…
```

Rules that make the corrections useful:

- Write `> **Ошибки:** нет.` when the answer is right — never skip a sentence.
- Name every miss explicitly, including *omissions* (a word left unparsed is an error), and say what the correct parse is.
- Also flag Russian spelling slips and typos in the user's own text — they are corrected in the existing set.
- End each `Μέρος` with a `### Что повторить (общее по Μέρος X)` block generalising the mistakes into rules, not a list of individual errors.
- The user's own answers are shorthand and inconsistent (`musc`, `sng`, `3-лицо`). Read through it; only correct notation when the task explicitly required that feature (e.g. number was requested but only gender was given).

Parse requirements differ per exercise and are stated at the top of each file: 1–11 asks noun = case+number, adjective = gender, verb = person+number; 11–24 adds **voice** to finite verbs and full parses for participles and infinitives.

## Grammar notation

Latin abbreviations for cases and numbers (`Nom. sing.`, `Gen. pl.`, `Acc. cum inf.`), Russian for everything else (`3 л. ед. ч.`, `ср./пасс.`, `м.р.`, `жен.`). Declensions are Roman (`I скл.`, `III скл.`), conjugations likewise (`II спр.`). Greek forms go in backticks inside prose. Keep this mixed convention — it matches the source course.
