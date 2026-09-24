#!/usr/bin/env python3
"""Merge new words into koine_vocab.tsv.

  merge.py check <input.tsv>   for each input row, show which deck lemma already matches
  merge.py apply <plan.tsv>    add/retag deck entries from a plan, keep sort order, forbid duplicates

Plan rows are the deck's own 4 columns: lemma, gloss, grammar, tags.
If the lemma (column 1) already exists, only its tags are merged; gloss and grammar are ignored.
"""
import os, sys, unicodedata as u

DECK = os.path.join(os.path.dirname(__file__), '..', '..', '..', 'koine_vocab.tsv')
ARTICLES = ('ὁ/ἡ ', 'ὁ ', 'ἡ ', 'τὸ ', 'τό ')


def bare(s):
    """Headword without article, accents and case: 'τὸ ὄρος, -ους' -> 'ορος'."""
    for a in ARTICLES:
        if s.startswith(a):
            s = s[len(a):]
    s = s.split(',')[0].strip()
    return ''.join(c for c in u.normalize('NFD', s) if not u.combining(c)).lower()


def read_deck():
    lines = open(DECK, encoding='utf8').read().rstrip('\n').split('\n')
    return lines[:6], [l.split('\t') for l in lines[6:]]


def greek(s):
    return 'α' <= bare(s)[:1] <= 'ω'


def check(path):
    _, rows = read_deck()
    by = {}
    for r in rows:
        by.setdefault(bare(r[0]), []).append(r[0] + '  [' + r[3] + ']')
    for i, l in enumerate(open(path, encoding='utf8').read().split('\n'), 1):
        f = l.split('\t')
        if not greek(f[0]):  # header, comments, blank lines
            continue
        # dictionary form is column 2 when it is Greek, else fall back to the form itself
        d = f[1] if len(f) > 1 and greek(f[1]) else f[0]
        print(f'{i}\t{f[0]}\t{bare(d)}\t' + (' || '.join(by.get(bare(d), [])) or '— новое'))


def apply(path):
    head, rows = read_deck()
    by = {r[0]: r for r in rows}
    added = retagged = 0
    for l in open(path, encoding='utf8').read().split('\n'):
        if not l.strip():
            continue
        f = l.split('\t')
        assert len(f) == 4 and all(x.strip() for x in f), f'need 4 non-empty fields: {l!r}'
        if f[0] in by:
            by[f[0]][3] = ' '.join(sorted(set(by[f[0]][3].split()) | set(f[3].split())))
            retagged += 1
        else:
            f[3] = ' '.join(sorted(set(f[3].split())))
            by[f[0]] = f
            rows.append(f)
            added += 1
    # deck order: accent-insensitive, ties broken by the exact string
    k = lambda s: ''.join(c for c in u.normalize('NFD', s) if not u.combining(c)).lower()
    rows.sort(key=lambda r: (k(r[0]), r[0]))
    heads = {}
    for r in rows:
        heads.setdefault(bare(r[0]), []).append(r[0])
    clash = {h: v for h, v in heads.items() if len(v) > 1}
    if clash:
        print('ВНИМАНИЕ, одинаковое заглавное слово (проверь, не повтор ли):', clash)
    open(DECK, 'w', encoding='utf8').write('\n'.join(head + ['\t'.join(r) for r in rows]) + '\n')
    print(f'добавлено {added}, дописаны теги {retagged}, всего {len(rows)}')


if __name__ == '__main__':
    {'check': check, 'apply': apply}[sys.argv[1]](sys.argv[2])
