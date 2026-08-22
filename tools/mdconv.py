# -*- coding: utf-8 -*-
"""Кусок шпаргалки (markdown) → HTML для страниц с таблицами."""
import re, html, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHEAT = os.path.join(ROOT, 'cheatsheet_lessons_1-24.md')

def sections():
    out, title, buf = {}, None, []
    for line in open(CHEAT, encoding='utf8').read().split('\n'):
        if line.startswith('#'):
            if title: out[title] = buf
            title, buf = line.lstrip('#').strip(), []
        elif title is not None:
            buf.append(line)
    if title: out[title] = buf
    return out

GREEK = re.compile(r'[Ͱ-Ͽἀ-῿]')

def inline(s):
    s = html.escape(s)
    s = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', s)
    s = re.sub(r'`(.+?)`', r'<span class="greek">\1</span>', s)
    return s

def is_sep(cells):
    return all(re.fullmatch(r':?-{2,}:?', c.strip() or '-') for c in cells) and cells

def cells_of(line):
    return [c.strip() for c in line.strip().strip('|').split('|')]

def table_html(rows):
    rows = [cells_of(r) for r in rows]
    rows = [r for r in rows if not is_sep(r)]
    if not rows: return ''
    # Шапка — либо строка с пустой первой ячейкой (парадигмы), либо строка из
    # коротких подписей. Таблицы-определения («N | подлежащее…») шапки не имеют.
    first = rows[0]
    head = first if first and (first[0] == '' or all(len(c) <= 20 for c in first)) else None
    body = rows[1:] if head else rows
    text = ''.join(''.join(r) for r in rows)
    greek = ' greek' if len(GREEK.findall(text)) > len(text) * .35 else ''
    out = ['<div class="table-responsive"><table class="table table-sm table-bordered align-middle%s mb-0">' % greek]
    if head:
        out.append('<thead><tr class="table-secondary">' +
                   ''.join('<th class="fw-normal">%s</th>' % inline(c) for c in head) + '</tr></thead>')
    out.append('<tbody>')
    for r in body:
        out.append('<tr>' + ''.join('<td>%s</td>' % inline(c) for c in r) + '</tr>')
    out.append('</tbody></table></div>')
    return ''.join(out)

def render(title, lines):
    parts, tbl = [], []
    def flush():
        if tbl:
            parts.append(table_html(tbl)); tbl.clear()
    for line in lines:
        s = line.strip()
        if s.startswith('|'):
            tbl.append(s)
        else:
            flush()
            if s and s != '---':
                parts.append('<p class="small mb-2">%s</p>' % inline(s))
    flush()
    body = ''.join('    %s\n' % p for p in parts)
    return ('  <div class="card shadow-sm mb-3"><div class="card-body">\n'
            '    <h2 class="h6 text-uppercase text-secondary mb-2">%s</h2>\n%s'
            '  </div></div>\n' % (inline(title), body))
