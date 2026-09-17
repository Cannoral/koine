# -*- coding: utf-8 -*-
"""Markdown → .docx. Только stdlib: docx — это zip из XML.
   Без аргументов — шпаргалка → cheatsheet_lessons_1-44.docx; иначе: gen_docx.py SRC.md OUT.docx"""
import sys, os, re, zipfile
from xml.dom import minidom
from xml.sax.saxutils import escape
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mdconv import CHEAT, ROOT, cells_of, is_sep

SRC, OUT = sys.argv[1:3] if len(sys.argv) > 2 else (CHEAT, os.path.join(ROOT, 'cheatsheet_lessons_1-44.docx'))
W = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"'
TEXT_W = 11906 - 2 * 850          # ширина A4 минус поля, в twips

def runs(s, bold=False):
    out = []
    for part in re.split(r'(\*\*.+?\*\*)', s):
        strong = len(part) > 4 and part.startswith('**') and part.endswith('**')
        t = (part[2:-2] if strong else part).replace('`', '')
        if t:
            out.append('<w:r>%s<w:t xml:space="preserve">%s</w:t></w:r>'
                       % ('<w:rPr><w:b/></w:rPr>' if bold or strong else '', escape(t)))
    return ''.join(out)

def para(s, style=None):
    return '<w:p>%s%s</w:p>' % ('<w:pPr><w:pStyle w:val="%s"/></w:pPr>' % style if style else '', runs(s))

def table(lines):
    rows = [r for r in map(cells_of, lines) if not is_sep(r)]
    if not rows: return ''
    head = rows[0][0] == '' or all(len(c) <= 20 for c in rows[0])   # как в mdconv.table_html
    n = max(map(len, rows))
    border = ''.join('<w:%s w:val="single" w:sz="4" w:color="999999"/>' % b
                     for b in ('top', 'left', 'bottom', 'right', 'insideH', 'insideV'))
    xml = ['<w:tbl><w:tblPr><w:tblW w:w="0" w:type="auto"/><w:tblBorders>%s</w:tblBorders></w:tblPr>' % border,
           '<w:tblGrid>%s</w:tblGrid>' % ('<w:gridCol w:w="%d"/>' % (TEXT_W // n) * n)]
    for i, r in enumerate(rows):
        h = head and i == 0
        shd = '<w:shd w:val="clear" w:color="auto" w:fill="E7E6E6"/>' if h else ''
        xml.append('<w:tr>' + ''.join('<w:tc><w:tcPr>%s</w:tcPr><w:p>%s</w:p></w:tc>' % (shd, runs(c, h))
                                      for c in r + [''] * (n - len(r))) + '</w:tr>')
    return ''.join(xml) + '</w:tbl><w:p/>'   # пустой абзац: иначе Word склеит соседние таблицы

body, tbl = [], []
for line in open(SRC, encoding='utf8').read().split('\n') + ['']:
    s = line.strip()
    if s.startswith('|'):
        tbl.append(s); continue
    body.append(table(tbl)); tbl = []
    m = re.match(r'(#+)\s+(.*)', s)
    if m:
        body.append(para(m.group(2), 'Heading%d' % min(len(m.group(1)), 2)))
    elif s and s != '---':
        body.append(para(s))

def heading(n, size, before, after):
    return ('<w:style w:type="paragraph" w:styleId="Heading%d"><w:name w:val="heading %d"/>'
            '<w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/>'
            '<w:pPr><w:keepNext/><w:spacing w:before="%d" w:after="%d"/><w:outlineLvl w:val="%d"/></w:pPr>'
            '<w:rPr><w:b/><w:sz w:val="%d"/></w:rPr></w:style>' % (n, n, before, after, n - 1, size))

FONT = 'Times New Roman'   # есть политонический греческий (Greek Extended)
HDR = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
REL = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/'
PARTS = [
 ('[Content_Types].xml', HDR +
  '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
  '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
  '<Default Extension="xml" ContentType="application/xml"/>'
  '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>'
  '<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>'
  '</Types>'),
 ('_rels/.rels', HDR +
  '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
  '<Relationship Id="rId1" Type="%sofficeDocument" Target="word/document.xml"/></Relationships>' % REL),
 ('word/_rels/document.xml.rels', HDR +
  '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
  '<Relationship Id="rId1" Type="%sstyles" Target="styles.xml"/></Relationships>' % REL),
 ('word/styles.xml', HDR +
  '<w:styles %s><w:docDefaults><w:rPrDefault><w:rPr>'
  '<w:rFonts w:ascii="%s" w:hAnsi="%s" w:cs="%s" w:eastAsia="%s"/><w:sz w:val="20"/><w:lang w:val="ru-RU"/>'
  '</w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="60" w:line="240" w:lineRule="auto"/>'
  '</w:pPr></w:pPrDefault></w:docDefaults>'
  '<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style>'
  '%s%s</w:styles>' % (W, FONT, FONT, FONT, FONT, heading(1, 32, 360, 120), heading(2, 24, 240, 80))),
 ('word/document.xml', HDR +
  '<w:document %s><w:body>%s<w:sectPr><w:pgSz w:w="11906" w:h="16838"/>'
  '<w:pgMar w:top="850" w:right="850" w:bottom="850" w:left="850" w:header="425" w:footer="425" w:gutter="0"/>'
  '</w:sectPr></w:body></w:document>' % (W, ''.join(body))),
]

for name, data in PARTS:
    minidom.parseString(data.encode('utf8'))   # битый XML Word не откроет — лучше упасть здесь
with zipfile.ZipFile(OUT, 'w') as z:
    for name, data in PARTS:                   # фиксированная дата — побайтно воспроизводимо
        z.writestr(zipfile.ZipInfo(name, (1980, 1, 1, 0, 0, 0)), data, compress_type=zipfile.ZIP_DEFLATED)
print('%s: %d таблиц, %d КБ' % (os.path.basename(OUT), ''.join(body).count('<w:tbl>'), os.path.getsize(OUT) // 1024))
