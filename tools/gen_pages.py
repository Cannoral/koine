# -*- coding: utf-8 -*-
import sys, json, os
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from mdconv import sections, render

ROOT = os.path.dirname(HERE)
DECKS = json.load(open(os.path.join(HERE, 'decks.json'), encoding='utf8'))
SEC = sections()

HEAD = '''<!DOCTYPE html>
<html lang="ru" data-bs-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title}</title>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
<link href="../assets/app.css" rel="stylesheet">
<script src="../assets/theme.js"></script>
</head>
<body class="bg-body-tertiary">

<nav class="navbar bg-body border-bottom sticky-top">
  <div class="container-lg">
    <a class="navbar-brand mb-0 h1 fs-6 text-decoration-none" href="{back}">{backlabel}</a>
    <span class="fw-semibold text-truncate ms-2">{nav}</span>
    <button id="themeToggle" class="btn btn-sm btn-outline-secondary ms-2" type="button" aria-label="Сменить тему">🌗</button>
  </div>
</nav>

<main class="container-lg py-3 py-md-4" style="max-width: {width};">
'''

FOOT = '''</main>

{scripts}<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
'''

def intro(tid, t, deck):
    opts = ''.join('          <li>%s: <em>%s</em></li>\n' % (f['label'], ' · '.join(f['options']))
                   for f in deck['fields'])
    body = '''
  <section id="intro">
    <h1 class="h4 mb-1">{title} <span class="greek text-secondary">{sample}</span></h1>
    <p class="text-secondary small mb-3">{lessons} · {count} карточек в колоде</p>

    <div class="card shadow-sm mb-3">
      <div class="card-body">
        <h2 class="h6 text-uppercase text-secondary">Что спрашивается</h2>
        <p class="mb-3">{ask}</p>

        <h2 class="h6 text-uppercase text-secondary">Варианты ответа</h2>
        <ul class="mb-3">
{opts}        </ul>

        <h2 class="h6 text-uppercase text-secondary">Сколько вопросов</h2>
        <p class="mb-3">20 карточек, вытянутых случайно из {count}. Каждый запуск даёт новый набор.</p>

        <div class="alert alert-secondary small mb-0">{hint}</div>
      </div>
    </div>

    <div class="d-grid gap-2">
      <button id="btnStart" class="btn btn-primary btn-lg" type="button">Начать</button>
      <a class="btn btn-outline-secondary" href="../articles/{tid}.html">Грамматическая таблица</a>
    </div>
  </section>

  <section id="quiz" class="d-none"></section>
  <section id="result" class="d-none"></section>
'''.format(title=deck['title'], sample=t['sample'], lessons=deck['lessons'], count=deck['count'],
           ask=t['ask'], opts=opts, hint=t['hint'], tid=tid)

    scripts = ('<script src="../data/%s.js"></script>\n'
               '<script src="../assets/trainer.js"></script>\n'
               '<script>Trainer.start({ data: %s, total: 20 });</script>\n' % (tid, deck['var']))
    page = (HEAD.format(title=deck['title'] + ' · тренажёр', back='../index.html',
                        backlabel='← Темы', nav=t['nav'], width='40rem')
            + body + FOOT.format(scripts=scripts))
    open(os.path.join(ROOT, 'pages', tid + '.html'), 'w', encoding='utf8').write(page)

def table(tid, t, deck):
    body = ('\n  <h1 class="h4 mb-1">%s <span class="greek text-secondary">%s</span></h1>\n'
            '  <p class="text-secondary small mb-3">%s · выдержка из шпаргалки</p>\n\n'
            % (deck['title'], t['sample'], deck['lessons']))
    for name in t['sections']:
        body += render(name, SEC[name])
    body += ('\n  <div class="d-grid gap-2">\n'
             '    <a class="btn btn-primary btn-lg" href="../pages/%s.html">К тренажёру</a>\n'
             '    <a class="btn btn-outline-secondary" href="../index.html">На главную</a>\n'
             '  </div>\n' % tid)
    page = (HEAD.format(title=deck['title'] + ' · таблица', back='../pages/' + tid + '.html',
                        backlabel='← Тренажёр', nav='Таблица', width='44rem')
            + body + FOOT.format(scripts=''))
    open(os.path.join(ROOT, 'articles', tid + '.html'), 'w', encoding='utf8').write(page)

G = lambda s: '<span class="greek">%s</span>' % s

T = {
'nouns-1': dict(nav='I склонение', sample='ζωή, ἡμέρα, δόξα',
  ask='Показывается форма существительного I склонения — например ' + G('ἡμέρας') + '. Нужно определить <strong>падеж</strong> и <strong>число</strong>. Под формой стоит перевод: он помогает узнать слово, но разбора не подсказывает.',
  hint='Ключ — окончание: ' + G('-ης / -ας') + ' в Gen. sing., ' + G('-ῃ / -ᾳ') + ' в Dat. sing., ' + G('-ῶν') + ' в Gen. pl. Ловушка: ' + G('ἡμέρας') + ' — это и Gen. sing., и Acc. pl.; засчитывается любой верный разбор.',
  sections=['Окончания I–II склонений', 'I склонение', 'Падежи']),

'nouns-2': dict(nav='II склонение', sample='λόγος, ἔργον',
  ask='Показывается форма существительного II склонения — например ' + G('δώροις') + '. Нужно определить <strong>падеж</strong> и <strong>число</strong>.',
  hint='Средний род: Nom. = Acc. (' + G('δῶρον') + ', ' + G('δῶρα') + '). ' + G('ἡ ὁδός') + ' — женского рода при мужских окончаниях, но на разбор падежа это не влияет.',
  sections=['Окончания I–II склонений', 'II склонение', 'Падежи']),

'nouns-3': dict(nav='III склонение', sample='σάρξ, ὄνομα, πόλις',
  ask='Показывается форма существительного III склонения — например ' + G('ὀνόματι') + '. Нужно определить <strong>падеж</strong> и <strong>число</strong>.',
  hint='Опознавайте по окончанию: ' + G('-ος') + ' — Gen. sing., ' + G('-ι') + ' — Dat. sing., ' + G('-σι(ν)') + ' — Dat. pl. Ловушки: ' + G('-εως') + ' (' + G('πόλεως') + ') — Gen. sing., а не ' + G('-ου') + '; ' + G('πόλεις') + ' — и Nom., и Acc. pl.; средний род Nom. = Acc.',
  sections=['III склонение — окончания', 'Nominativus в III склонении', 'III склонение — согласные основы', 'III склонение — основы на -σ, -ι, -υ, -ευ']),

'nouns-all': dict(nav='Все склонения', sample='δόξα · λόγος · σάρξ',
  ask='Показывается форма существительного любого из трёх склонений. Нужно определить <strong>склонение</strong>, <strong>падеж</strong> и <strong>число</strong>.',
  hint='Тип определяется по Gen. sing.: ' + G('-ης / -ας') + ' → I скл., ' + G('-ου') + ' → II скл., ' + G('-ος') + ' → III скл. Самая частая путаница — ' + G('-ος') + ' в конце слова: Nom. sing. II скл. (' + G('λόγος') + ') или Gen. sing. III скл. (' + G('σαρκός') + ').',
  sections=['Сравнение трёх склонений (Gen. sg. — ключ к типу)', 'Окончания I–II склонений', 'III склонение — окончания', 'Падежи']),

'adjectives': dict(nav='Прилагательные', sample='ἀγαθός, -ή, -όν',
  ask='Показывается форма прилагательного — например ' + G('δικαίαις') + '. Нужно определить <strong>падеж</strong>, <strong>род</strong> и <strong>число</strong>.',
  hint='G pl. женского рода совпадает с мужским: ' + G('δικαίων') + ', не ' + G('δικαιῶν') + '. У ' + G('αἰώνιος') + ' два окончания — мужской и женский род совпадают, засчитывается любой. ' + G('μέγας') + ' и ' + G('πολύς') + ' смешанные: Nom./Acc. sing. по III скл., остальное по I–II.',
  sections=['Прилагательные I–II скл.']),

'adjective-position': dict(nav='Позиция', sample='ὁ ἀγαθὸς λόγος',
  ask='Показывается словосочетание. Нужно определить <strong>позицию</strong>: атрибутивная (определение), предикативная (сказуемое без связки) или субстантивация (артикль превращает в существительное).',
  hint='Ключ — артикль непосредственно перед прилагательным. У ' + G('οὗτος') + ' и ' + G('ἐκεῖνος') + ' предикативная позиция — норма: ' + G('οὗτος ὁ ἄνθρωπος') + ' значит «этот человек». У ' + G('αὐτός') + ' позиция меняет значение: предикативно «сам», атрибутивно «тот же».',
  sections=['Позиция прилагательного', 'αὐτός, αὐτή, αὐτό', 'Указательные']),

'pronouns': dict(nav='Местоимения', sample='ἐγώ, αὐτός, οὗτος',
  ask='Показывается форма местоимения — например ' + G('ταύτῃ') + '. Нужно определить <strong>падеж</strong>, <strong>число</strong> и <strong>лицо</strong> (у личных) или <strong>род</strong> (у ' + G('αὐτός') + ', ' + G('οὗτος') + ', ' + G('ἐκεῖνος') + ').',
  hint='Личные местоимения рода не различают, поэтому у них спрашивается лицо. Краткие формы ' + G('μου, μοι, με') + ' — энклитики, значение то же. Gen. pl. ' + G('αὐτῶν') + ' и ' + G('τούτων') + ' одинаков во всех трёх родах — засчитывается любой.',
  sections=['Личные местоимения', 'αὐτός, αὐτή, αὐτό', 'Указательные']),

'eimi': dict(nav='εἰμί', sample='εἰμί, ἐστίν',
  ask='Показывается форма глагола ' + G('εἰμί') + '. Нужно определить <strong>лицо</strong> и <strong>число</strong>.',
  hint='Колода маленькая — 8 форм, за 20 вопросов каждая встретится 2–3 раза. ' + G('ἔστιν') + ' с ударением на первом слоге — «существует»: в начале фразы и после ' + G('οὐκ, καί, εἰ, ἀλλά') + '. ' + G('ἦν') + ' — прошедшее время (imperfectum), 3 л. ед. ч.',
  sections=['εἰμί — praesens ind.']),

'verbs-active': dict(nav='Актив', sample='λύω, ποιῶ, δίδωμι',
  ask='Показывается личная форма настоящего времени активного залога — например ' + G('τιθέασι(ν)') + '. Нужно определить <strong>лицо</strong> и <strong>число</strong>. Подсказка снизу — словарная форма глагола и тип спряжения.',
  hint='У слитных глаголов ударение облечённое: ' + G('ποιεῖ') + ', ' + G('ἀγαπᾷ') + ', ' + G('πληροῖ') + '. У глаголов на ' + G('-μι') + ' в ед. ч. долгий гласный (' + G('δίδω-') + '), во мн. ч. краткий (' + G('δίδο-') + '), 3 л. мн. ч. на ' + G('-ασι(ν)') + '. Ловушка: ' + G('λύουσι(ν)') + ' — это и 3 л. мн. ч., и Dat. pl. причастия.',
  sections=['Praesens ind. — личные окончания', 'Нестяжённые глаголы — актив', 'Слитные глаголы — актив', 'Стяжение', 'Глаголы на -μι — актив']),

'verbs-midpass': dict(nav='Ср./пасс.', sample='λύομαι, ἔρχεται',
  ask='Показывается личная форма среднего или страдательного залога — например ' + G('ποιούμεθα') + '. Нужно определить <strong>лицо</strong> и <strong>число</strong>.',
  hint='В praesens средний и пассивный совпадают по форме — залог различает только контекст и агент ' + G('ὑπό') + ' + Gen., поэтому здесь он не спрашивается. Ловушка: 2 л. ед. ч. ' + G('-ῃ') + ' (' + G('λύῃ') + ' ← ' + G('λύεσαι') + '), но у глаголов на ' + G('-μι') + ' σ сохраняется: ' + G('δίδοσαι') + ', ' + G('δύνασαι') + '.',
  sections=['Три залога', 'Praesens ind. medii/passivi', 'Значения среднего залога', 'Пассив: агент', 'Глаголы на -μι — средний/пассивный', 'Отложительные (deponentia)']),

'participles': dict(nav='Причастия', sample='λύων, λυόμενος',
  ask='Показывается форма причастия настоящего времени — например ' + G('λυούσαις') + '. Нужно определить <strong>залог</strong>, <strong>падеж</strong>, <strong>род</strong> и <strong>число</strong>.',
  hint='Залог виден по суффиксу: ' + G('-ντ-') + ' (' + G('λύων, λύοντος') + ') — актив, ' + G('-μεν-') + ' (' + G('λυόμενος') + ') — средний/пассивный. Актив склоняется по III склонению (женский род — по I), средний — как прилагательное I–II скл. ' + G('λύουσι(ν)') + ' — Dat. pl. причастия и 3 л. мн. ч. глагола одновременно.',
  sections=['Актив — образование', 'λύων, λύουσα, λῦον — склонение', 'Актив — по типам глаголов', 'Средний / пассивный — образование', 'λυόμενος, λυομένη, λυόμενον — склонение', 'Средний / пассивный — по типам глаголов', 'Употребление причастий']),

'infinitive': dict(nav='Инфинитив', sample='βούλομαι ποιεῖν',
  ask='Показывается фраза с инфинитивом — например ' + G('δεῖ ποιεῖν τοῦτο') + '. Нужно определить <strong>залог</strong> инфинитива (по форме) и <strong>конструкцию</strong>, в которой он стоит.',
  hint='Форма: ' + G('-ειν / -ναι') + ' — актив, ' + G('-εσθαι') + ' — средний/пассивный (у отложительных форма средняя, а значение активное). Конструкция: артикль перед инфинитивом, с предлогом или без, — субстантивация; подлежащее инфинитива в винительном — Acc. cum inf.',
  sections=['Инфинитив настоящего времени', 'Конструкции с инфинитивом']),

'prepositions': dict(nav='Предлоги', sample='ἐν, εἰς, ὑπό',
  ask='Показывается предлог и его значение — например ' + G('ὑπό') + ' «кем (агент при пассиве)». Нужно назвать <strong>падеж</strong>, которым он управляет именно в этом значении.',
  hint='Общий смысл падежа при предлоге: Gen. — «от, движение прочь», Dat. — «в, при, покой», Acc. — «к, движение куда». Предлоги с двумя-тремя падежами (' + G('διά, κατά, μετά, περί, ὑπέρ, ὑπό, παρά, ἐπί') + ') меняют значение вместе с падежом — потому значение и дано в вопросе.',
  sections=['Предлоги — сводная таблица', 'Падежи']),

'homoforms': dict(nav='Омоформы', sample='λύουσι(ν)',
  ask='Показывается форма и фраза, в которой она стоит — например ' + G('λύουσι(ν)') + ' в ' + G('τοῖς λύουσι τοὺς δούλους') + '. Нужно определить, <strong>что это в этой фразе</strong>: личная форма, причастие, инфинитив или имя.',
  hint='Одна и та же форма в разном окружении разбирается по-разному. Артикль перед формой почти всегда означает причастие или имя; ' + G('-ειν / -εσθαι / -ναι') + ' — инфинитив, у него нет лица и числа.',
  sections=['Что различать на глаз', 'Правило среднего рода мн. ч.']),
}

for tid, t in T.items():
    deck = DECKS[tid]
    intro(tid, t, deck)
    table(tid, t, deck)
    print('%-22s pages/%s.html + articles/%s.html' % (tid, tid, tid))
print('готово:', len(T) * 2, 'страниц')
