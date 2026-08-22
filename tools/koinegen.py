# -*- coding: utf-8 -*-
"""Сборка файлов data/*.js для тренажёров койне."""
import json, collections, io, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CASES = ['N', 'G', 'D', 'A']
NUMS  = ['sg', 'pl']

def decl(stem, endings):
    """8 форм в порядке N/G/D/A sg, N/G/D/A pl."""
    keys = [(c, n) for n in NUMS for c in CASES]
    return dict(zip(keys, [stem + e for e in endings]))

def forms(*eight):
    keys = [(c, n) for n in NUMS for c in CASES]
    return dict(zip(keys, eight))

def merge(pairs):
    """[(форма, ответ-dict, note)] → items с объединением омоформ."""
    acc = collections.OrderedDict()
    for form, ans, note in pairs:
        key = (form, note)
        acc.setdefault(key, [])
        if ans not in acc[key]:
            acc[key].append(ans)
    items = []
    for (form, note), answers in acc.items():
        it = {'prompt': form}
        if note:
            it['note'] = note
        it['answers'] = answers
        items.append(it)
    return items

def emit(fid, var, title, lessons, fields, items, fmt=None, verdict=None, comment=''):
    out = io.StringIO()
    out.write('/* Данные тренажёра «%s» — %s.\n   Формат см. в assets/trainer.js.%s */\n'
              % (title, lessons, ('\n   ' + comment) if comment else ''))
    out.write('window.%s = {\n' % var)
    out.write('  id: %s,\n  title: %s,\n  lessons: %s,\n\n'
              % (json.dumps(fid), json.dumps(title, ensure_ascii=False), json.dumps(lessons, ensure_ascii=False)))
    out.write('  fields: [\n')
    for f in fields:
        opts = ', '.join('{ v: %s, label: %s }' % (json.dumps(o[0]), json.dumps(o[1], ensure_ascii=False))
                         for o in f['options'])
        out.write('    { key: %s, label: %s, cols: %d, options: [%s] },\n'
                  % (json.dumps(f['key']), json.dumps(f['label'], ensure_ascii=False),
                     f.get('cols', len(f['options'])), opts))
    out.write('  ],\n\n')
    if fmt:
        out.write('  format: %s,\n\n' % fmt)
    if verdict:
        out.write('  verdict: %s,\n\n' % verdict)
    out.write('  items: [\n')
    for it in items:
        ans = ', '.join('{ ' + ', '.join('%s: %s' % (k, json.dumps(v)) for k, v in a.items()) + ' }'
                        for a in it['answers'])
        line = '    { prompt: %s, ' % json.dumps(it['prompt'], ensure_ascii=False)
        if 'note' in it:
            line += 'note: %s, ' % json.dumps(it['note'], ensure_ascii=False)
        line += 'answers: [%s] },\n' % ans
        out.write(line)
    out.write('  ]\n};\n')
    path = os.path.join(ROOT, 'data', fid + '.js')
    open(path, 'w', encoding='utf8').write(out.getvalue())
    print('%-22s %3d карточек, %s' % (fid + '.js', len(items), path))
