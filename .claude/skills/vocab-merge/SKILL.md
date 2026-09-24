---
name: vocab-merge
description: Merge a new word list (TSV of Greek words or forms, e.g. koine_words.tsv) into the Anki deck koine_vocab.tsv without duplicates, then rebuild pages/vocab.html. Use when the user adds a new vocabulary file and asks to merge/объединить it with the deck, or asks to add words to the dictionary.
---

# Merge words into koine_vocab.tsv

`koine_vocab.tsv` is the only vocabulary file (format rules are in CLAUDE.md, «Anki TSV format»). It holds **lemmas only**. Incoming files often hold inflected forms from a text (`word, dictionary_form, form_info, translation`). Turn every row into a lemma, add only lemmas that are missing, and delete the incoming file at the end.

The helper is `.claude/skills/vocab-merge/merge.py`. It finds matches and writes the deck. Choosing the lemma, gloss and grammar note is your job.

## Steps

1. **Read the input file fully.** Find out which text each row comes from: a reader chapter (`матфейNN`, see `data/matthew/`), another text (Genesis 1 → `бытие01`), or a lesson (`урокNN`). One file can mix sources, so split it by rows. If the source is unclear, ask the user which tag to use.

2. **Find existing lemmas:**
   ```bash
   python3 .claude/skills/vocab-merge/merge.py check <input.tsv>
   ```
   This prints `line · form · accent-free headword · matching deck entry [tags]` or `— новое`. The match uses only the headword. Check the misses by hand (`grep` column 1) for forms the script cannot lemmatise:
   - pronouns and particles given by form (`τίνι` → `τίς, τί`, `οὐδὲν` → `οὐδείς`, `ὅσα` → `ὅσος`);
   - elided forms (`ἀλλʼ` → `ἀλλά`);
   - active/middle pairs that are separate lemmas (`ἄρχω` «править» ≠ `ἄρχομαι` «начинать»: add it as a new lemma).

3. **Write a plan file** in the scratchpad. It is 4 tab-separated columns, exactly the deck's own format:
   - **Existing lemma:** copy column 1 byte-for-byte from the deck. Put the new tag in column 4. Only the tags get merged; columns 2–3 are ignored, but they must not be empty.
   - **New lemma:** write the full entry in deck style. Look at neighbouring rows for the conventions:
     - nouns `λύχνος, -ου, ὁ` with `II скл., м.р.`;
     - adjectives `καθαρός, -ά, -όν` (two endings: `-ον`);
     - verbs as bare 1 sg. praes., with `основа …; I/II/III спр.; осн. формы: …` in column 3;
     - particles, conjunctions and prepositions as the bare word.
   - A lemma that occurs several times in the input goes into the plan **once**.
   - Fix obvious slips in the source (wrong neuter, `-ος, -ος, -ον`). Mention each fix in the report.

4. **Apply the plan:**
   ```bash
   python3 .claude/skills/vocab-merge/merge.py apply <plan.tsv>
   ```
   The script sorts the deck in its existing order (accent-insensitive) and leaves the 6 header lines alone. It warns when two entries share a headword. Re-running it is safe: tags are a set union.

5. **Rebuild and check:**
   ```bash
   python3 tools/gen_pages.py     # pages/vocab.html inlines the TSV
   node tools/validate.js
   git diff --stat                # only koine_vocab.tsv, pages/vocab.html, CLAUDE.md
   ```

6. **Clean up.** Delete the input file (the user wants one vocabulary file). Update the `koine_vocab.tsv` row in CLAUDE.md with the new entry count and any new tag family.

7. **Report.** Give counts (existing / new / total) and the tags you chose. List any judgment calls: renamed tags, split lemmas, corrected source data. Do not commit unless asked.

## Don't

- Don't add inflected forms as entries.
- Don't tag reader words `урокNN`. Exercises may use only `урокNN` lemmas.
- Don't edit `pages/vocab.html` by hand.
